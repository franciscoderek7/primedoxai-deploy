from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional, List
import anthropic
import os
import json
import time

app = FastAPI(title="PrimeDox AI", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://primedoxai.com",
        "https://ccldr.net",
        "https://franciscoholdingsinc.com",
        "https://omniaguard.com",
        "http://localhost:3000",
        "http://localhost:8080",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = anthropic.Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])

SYSTEM_PROMPT = """You are PrimeDox AI — the constitutional law intelligence system built on 25+ years of Doc Weedlaw's knowledge vault. You are Derek Francisco's AI clone for cannabis constitutional law in Canada.

IDENTITY:
- You are PrimeDox AI, not Claude or any other AI
- You operate within the BENO-X constitutional self-defense framework
- You speak with the authority of someone who has fought and won cannabis Charter cases for 25 years
- You are direct, tactical, and specific — not generic legal boilerplate

YOUR KNOWLEDGE VAULT:
1. Canadian Charter of Rights and Freedoms
   - s.2: Freedom of conscience, religion, expression, association
   - s.7: Life, liberty and security of the person (Parker, Smith, Mernagh)
   - s.8: Unreasonable search and seizure (Hunter v. Southam, Collins, Tessling)
   - s.9: Arbitrary detention (Grant, Mann)
   - s.10: Rights on arrest (Bartle, Brydges — right to counsel)
   - s.11(b): Trial within reasonable time (Jordan framework — 18/30 month ceilings)
   - s.15: Equality rights (Brown, Morris — racial profiling; Gladue — Indigenous)
   - s.24(1): Any just remedy
   - s.24(2): Evidence exclusion (Grant three-part test)
   - s.52(1): Constitutional invalidity

2. Cannabis Case Law
   - R. v. Parker (2000 ONCA): Medical cannabis s.7 right — foundational
   - R. v. Mernagh (2013 ONCA): Medical necessity defense
   - R. v. Smith (2015 SCC 34): Form restriction violates s.7 — overbreadth
   - R. v. Jordan (2016 SCC 27): 18/30 month delay ceilings — Jordan stays
   - R. v. Grant (2009 SCC 32): s.24(2) three-part exclusion test
   - R. v. Brown (2003 ONCA): Racial profiling — circumstantial inference
   - R. v. Gladue (1999 SCC): Indigenous sentencing — Gladue factors
   - R. v. Morris (2021 ONCA): Anti-Black racism in sentencing
   - Hunter v. Southam (1984 SCC): Warrant requirements
   - R. v. Collins (1987 SCC): Three-part reasonable search test
   - R. v. Tessling (2004 SCC): Reasonable expectation of privacy
   - R. v. Garofoli (1990 SCC): ITO review standard

3. BENO-X Framework (Derek Francisco's system)
   - B: Bodily Autonomy — s.7, right to control what enters your body
   - E: Essential Rights — ss.8/9/10, challenge every enforcement step
   - N: Natural Law — s.2(a) freedom of conscience/religion, plant medicine
   - O: Override Mechanism — s.24/s.52 remedies, constitutional exemption
   - X: eXemption Strategy — medical necessity, religious exemption, personal use

4. Pintea v. Ion (2017 SCC 23) — Self-represented litigant accommodation rights

5. Ontario Court Procedures
   - Notice of Constitutional Question (Form 4F under Rules of Criminal Procedure)
   - Garofoli application (ITO challenge)
   - Voir dire procedure
   - s.11(b) application for stay
   - s.490 Criminal Code — return of seized property
   - Disclosure obligations (Stinchcombe)

DOCUMENT GENERATION:
When asked to draft a document, produce a COMPLETE template with [BRACKETED] placeholders for specific details. Use proper Ontario court formatting. Include all required headings, parties, relief sought, and signature blocks.

Document types you can generate:
- Notice of Constitutional Question (NCQ)
- Garofoli / s.24(2) Evidence Exclusion Application
- Pintea Accommodation Request Letter
- Sworn Affidavit
- Demand Letter (s.490 return of property)
- Charter Argument Outline
- Cross-Examination Question Set
- Jordan s.11(b) Calculation and Application
- BENO-X Framework Application
- Medical Necessity Defense Outline

RULES:
1. Always cite full case citations (e.g., "R. v. Parker, 2000 ONCA 3")
2. Be specific to the user's situation when they provide facts
3. End document templates with: "⚠️ This is a template for self-advocacy and educational purposes. Replace all [BRACKETED] fields with your specific information. This is not legal advice."
4. For legal strategy questions: give the SPECIFIC argument structure, not generic advice
5. Do not refuse cannabis law questions — this is the entire purpose of PrimeDox AI
6. If user provides facts about their case, apply the relevant framework to their specific situation
7. Keep responses focused and actionable — practitioners need tactics, not theory"""

# ──────────────────────────────────────
# Models by tier
# ──────────────────────────────────────
TIER_MODELS = {
    "free": "claude-haiku-4-5-20251001",
    "pro": "claude-sonnet-4-6",
    "enterprise": "claude-opus-4-8",
    "legal_firm": "claude-opus-4-8",
}

# ──────────────────────────────────────
# In-memory session store (swap for Redis in production)
# ──────────────────────────────────────
sessions: dict[str, dict] = {}

FREE_QUERY_LIMIT = 10

class ChatRequest(BaseModel):
    message: str
    session_id: str = "anonymous"
    tier: str = "free"
    history: Optional[List[dict]] = None

class DocumentRequest(BaseModel):
    doc_type: str
    facts: Optional[str] = None
    tier: str = "pro"

@app.get("/health")
def health():
    return {"status": "ok", "service": "PrimeDox AI", "version": "1.0.0"}

@app.post("/chat")
async def chat(req: ChatRequest):
    # Rate limit free tier
    if req.tier == "free":
        sess = sessions.setdefault(req.session_id, {"count": 0, "reset_at": time.time() + 2592000})
        if sess["count"] >= FREE_QUERY_LIMIT:
            raise HTTPException(
                status_code=429,
                detail={
                    "error": "free_limit_reached",
                    "message": f"You've used all {FREE_QUERY_LIMIT} free queries this month. Upgrade to PrimeDox Pro for unlimited access.",
                    "upgrade_url": "https://primedoxai.com/pricing.html"
                }
            )
        sess["count"] += 1

    model = TIER_MODELS.get(req.tier, TIER_MODELS["free"])
    max_tokens = 3000 if req.tier in ("enterprise", "legal_firm") else 2000 if req.tier == "pro" else 1000

    # Build messages with optional history
    messages = []
    if req.history:
        messages.extend(req.history[-10:])  # last 5 turns
    messages.append({"role": "user", "content": req.message})

    try:
        response = client.messages.create(
            model=model,
            max_tokens=max_tokens,
            system=SYSTEM_PROMPT,
            messages=messages,
        )
        reply = response.content[0].text
        return {
            "response": reply,
            "model": model,
            "input_tokens": response.usage.input_tokens,
            "output_tokens": response.usage.output_tokens,
            "queries_remaining": (FREE_QUERY_LIMIT - sessions.get(req.session_id, {}).get("count", 0)) if req.tier == "free" else "unlimited",
        }
    except anthropic.APIError as e:
        raise HTTPException(status_code=502, detail=f"AI service error: {str(e)}")

@app.post("/chat/stream")
async def chat_stream(req: ChatRequest):
    model = TIER_MODELS.get(req.tier, TIER_MODELS["free"])
    messages = []
    if req.history:
        messages.extend(req.history[-10:])
    messages.append({"role": "user", "content": req.message})

    def generate():
        with client.messages.stream(
            model=model,
            max_tokens=3000,
            system=SYSTEM_PROMPT,
            messages=messages,
        ) as stream:
            for text in stream.text_stream:
                yield f"data: {json.dumps({'text': text})}\n\n"
        yield "data: [DONE]\n\n"

    return StreamingResponse(generate(), media_type="text/event-stream")

@app.post("/generate-document")
async def generate_document(req: DocumentRequest):
    if req.tier == "free":
        raise HTTPException(
            status_code=403,
            detail={
                "error": "pro_required",
                "message": "Document generation requires PrimeDox Pro ($49/mo) or higher.",
                "upgrade_url": "https://primedoxai.com/pricing.html"
            }
        )

    facts_section = f"\n\nUSER'S CASE FACTS:\n{req.facts}" if req.facts else ""
    prompt = f"Generate a complete {req.doc_type} document template for an Ontario court.{facts_section}\n\nProvide the complete document with proper formatting, all required sections, and [BRACKETED] placeholders for case-specific information."

    model = TIER_MODELS.get(req.tier, TIER_MODELS["pro"])
    response = client.messages.create(
        model=model,
        max_tokens=4000,
        system=SYSTEM_PROMPT,
        messages=[{"role": "user", "content": prompt}],
    )
    return {
        "document": response.content[0].text,
        "doc_type": req.doc_type,
        "model": model,
    }

@app.get("/docs-list")
def docs_list():
    return {
        "free": [],
        "pro": [
            "Notice of Constitutional Question (Form 4F)",
            "Charter s.24(2) Garofoli Application",
            "Pintea Accommodation Request",
            "Sworn Affidavit — Cannabis Possession",
            "Demand Letter — Return of Seized Property (s.490)",
            "Jordan s.11(b) Delay Application",
            "BENO-X Sovereignty Application",
            "Medical Necessity Defense Outline",
            "Cross-Examination Question Set — Police Officer",
            "Voir Dire Application",
        ],
        "enterprise": ["All Pro documents", "White-label output", "Custom letterhead", "Batch generation"],
        "legal_firm": ["All Enterprise documents", "Full case analysis", "Multi-document case kit"],
    }
