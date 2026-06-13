"""
Node 6: COMPLIANCE CHECK / REVIEW
Reviews the draft for procedural compliance, red flags, and quality.
"""
from app.models.state import GraphState
from app.services.llm import invoke_llm
import json
import re


REVIEW_PROMPT = """You are PrimeDox AI Quality Control.

DOCUMENT TYPE: {doc_type}
DOMAIN: {domain}
DRAFT DOCUMENT:
{draft}

RESEARCH MEMO:
{research}

Conduct a thorough compliance review. Respond with JSON:
{{
  "compliance_score": 0-100,
  "red_flags": [
    "list of specific issues that MUST be fixed before filing/sending"
  ],
  "warnings": [
    "list of items to consider but not blocking"
  ],
  "missing_elements": [
    "list of required elements not present"
  ],
  "strengths": [
    "what the document does well"
  ],
  "review_summary": "one paragraph overall assessment",
  "ready_for_human_gate": true|false
}}

COMPLIANCE CHECKLIST:
Legal documents:
- Proper court header and file number
- Correct form number (Rules of Civil Procedure)
- All parties named correctly
- Relief clearly stated
- Grounds numbered and specific
- Charter sections cited correctly
- Case law citations in proper format
- Certification/affidavit requirements met
- No missing placeholder text left unfilled

Cyber/Safety documents:
- All IOCs documented
- Timeline complete
- Constitutional compliance noted
- Regulatory obligations addressed
- Chain of custody (if applicable)
- All required signatures/approvals noted"""


async def review_node(state: GraphState) -> GraphState:
    draft = state.get("draft_document", "")
    if not draft:
        return {**state, "error": "No draft to review", "retry_count": state.get("retry_count", 0) + 1}

    prompt = REVIEW_PROMPT.format(
        doc_type=state.get("document_type", "unknown"),
        domain=state.get("domain", "legal"),
        draft=draft[:12000],  # token limit safety
        research=state.get("research_memo", "")[:4000],
    )

    try:
        raw = await invoke_llm("legal_review", prompt, temperature=0.0)

        start = raw.find("{")
        end = raw.rfind("}") + 1
        parsed = json.loads(raw[start:end]) if start >= 0 else {}

        compliance_score = float(parsed.get("compliance_score", 70))
        red_flags = parsed.get("red_flags", [])

        return {
            **state,
            "review_memo": parsed.get("review_summary", raw),
            "red_flags": red_flags,
            "compliance_score": compliance_score / 100.0,
            "error": None,
        }

    except Exception as e:
        return {**state, "error": f"Review failed: {str(e)}", "retry_count": state.get("retry_count", 0) + 1}


def should_proceed_to_human_gate(state: GraphState) -> str:
    """Conditional edge: always go to human gate regardless of score (safety-first)."""
    if state.get("error"):
        return "error"
    return "human_gate"
