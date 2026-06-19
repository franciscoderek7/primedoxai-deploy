"""
zPrimeDox AI HQ — FastAPI Application
LangGraph state-machine AI with human-in-the-loop gates.
Green (#2E7D32) + Gold (#FFD700) — Francisco Holdings Inc.
"""
from fastapi import FastAPI, HTTPException, BackgroundTasks, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, JSONResponse
from langgraph.types import Command
from app.graphs.router import get_compiled_graph
from app.models.state import RunRequest, RunResponse, HumanGateInput, StateResponse, GraphState
from app.config import get_settings, is_placeholder
from app.personas import get_persona, should_escalate
from app.services.llm import invoke_llm, LLMConfigError
from app.services.rate_limit import check_rate_limit
from app.logging_config import configure_logging, get_logger
from datetime import datetime, timezone
import uuid
import json

settings = get_settings()
configure_logging(settings.log_level)
logger = get_logger(__name__)

app = FastAPI(
    title="zPrimeDox AI HQ",
    description="The World's First Cannabis Constitutional Intelligence Engine — LangGraph Backend",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)


@app.on_event("startup")
async def warn_on_unconfigured_secrets():
    """Log (not crash) so the service still boots and /health can report what's missing."""
    if is_placeholder(settings.anthropic_api_key):
        logger.warning("ANTHROPIC_API_KEY is unset — /run, /chat, and /widget-chat will fail until it's configured")
    if is_placeholder(settings.supabase_url) or is_placeholder(settings.supabase_service_key):
        logger.warning("Supabase is unconfigured — logging, memory, and /report will degrade gracefully but won't persist")


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    logger.exception("Unhandled exception", extra={"extra_fields": {"path": request.url.path}})
    return JSONResponse(status_code=500, content={"detail": "Internal server error"})

# Empire site domains allowed to call this API from a browser widget.
EMPIRE_ORIGINS = [
    "https://zprimedoxaihq.com",
    "https://franciscoholdingsinc.com",
    "https://franciscoholdingsinc.ca",
    "https://franciscoholdingsinc.buzz",
    "https://omniaguard.com",
    "https://omniaguard.ca",
    "https://omniaguard.io",
    "https://omniaguard.pro",
    "https://omniaguard.tech",
    "https://ccldr.net",
    "https://primedoxai.com",
    "https://vaultvelocityauto.com",
    "https://techpetcage.com",
    "https://techpetcage.ca",
    "http://localhost:3000",
    "http://localhost:3001",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=EMPIRE_ORIGINS,
    allow_origin_regex=r"https://franciscoderek7\.github\.io",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─── Health Check ─────────────────────────────────────────────────────────────
# Point an uptime monitor (e.g. UptimeRobot) at this endpoint. It returns 503
# (not just a 200 with a "down" field buried in JSON) whenever a dependency
# the live workflows actually need is unreachable or unconfigured, so a
# plain "alert on non-200" monitor rule is enough — see DEPLOY.md.

@app.get("/health")
async def health():
    components: dict[str, str] = {}

    components["anthropic"] = "unconfigured" if is_placeholder(settings.anthropic_api_key) else "configured"

    if is_placeholder(settings.supabase_url) or is_placeholder(settings.supabase_service_key):
        components["supabase"] = "unconfigured"
    else:
        try:
            from app.services.vector_db import get_supabase
            get_supabase().table("sessions").select("id").limit(1).execute()
            components["supabase"] = "ok"
        except Exception as e:
            logger.warning("Supabase health check failed", extra={"extra_fields": {"error": str(e)}})
            components["supabase"] = "unreachable"

    try:
        import redis
        redis.from_url(settings.redis_url, socket_connect_timeout=2).ping()
        components["redis"] = "ok"
    except Exception as e:
        logger.warning("Redis health check failed", extra={"extra_fields": {"error": str(e)}})
        components["redis"] = "unreachable"

    critical_down = components["anthropic"] == "unconfigured" or components["redis"] == "unreachable"
    status = "down" if critical_down else ("degraded" if components["supabase"] != "ok" else "online")

    body = {
        "status": status,
        "service": "zPrimeDox AI HQ",
        "version": "1.0.0",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "components": components,
        "color": "#2E7D32",
        "gold": "#FFD700",
    }
    return JSONResponse(status_code=503 if critical_down else 200, content=body)


@app.get("/")
async def root():
    return {"message": "zPrimeDox AI HQ — LangGraph Engine Online. Navigate to /docs for API reference."}


# ─── Run a new workflow ────────────────────────────────────────────────────────

@app.post(f"{settings.api_prefix}/run", response_model=RunResponse)
async def start_run(request: RunRequest):
    """
    Start a new AI workflow. Returns thread_id immediately.
    The graph runs asynchronously. Poll /run/{thread_id} for status.
    """
    thread_id = str(uuid.uuid4())
    session_id = str(uuid.uuid4())

    initial_state: GraphState = {
        "query": request.query,
        "session_id": session_id,
        "thread_id": thread_id,
        "user_id": request.user_id,
        "domain": request.domain_hint,
        "urgency": request.urgency or "normal",
        "entities": None,
        "case_summary": None,
        "research_memo": None,
        "citations": None,
        "similar_cases": None,
        "constitutional_memo": None,
        "threat_profile": None,
        "incident_report": None,
        "strategy_options": None,
        "recommended_strategy": None,
        "draft_document": None,
        "document_type": None,
        "review_memo": None,
        "red_flags": None,
        "compliance_score": None,
        "human_gate_status": None,
        "human_feedback": None,
        "human_approved_by": None,
        "human_approved_at": None,
        "final_document": None,
        "delivery_log": None,
        "self_review": None,
        "lessons_learned": None,
        "error": None,
        "retry_count": 0,
        "messages": [],
    }

    graph = get_compiled_graph()
    config = {"configurable": {"thread_id": thread_id}}

    try:
        # Run graph — will pause at human_gate (interrupt)
        await graph.ainvoke(initial_state, config=config)

        # Get current state after run
        state_snapshot = graph.get_state(config)
        current_node = None
        if state_snapshot.next:
            current_node = str(state_snapshot.next[0])

        paused = bool(state_snapshot.next)
        status = "paused" if paused else "complete"

        return RunResponse(
            thread_id=thread_id,
            session_id=session_id,
            status=status,
            current_node=current_node,
            message="Awaiting human approval" if paused else "Workflow complete",
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Workflow failed: {str(e)}")


# ─── Get workflow status ───────────────────────────────────────────────────────

@app.get(f"{settings.api_prefix}/run/{{thread_id}}", response_model=StateResponse)
async def get_run_status(thread_id: str):
    """Get current state of a workflow."""
    graph = get_compiled_graph()
    config = {"configurable": {"thread_id": thread_id}}

    try:
        snapshot = graph.get_state(config)
        if not snapshot or not snapshot.values:
            raise HTTPException(status_code=404, detail="Thread not found")

        state = snapshot.values
        paused = bool(snapshot.next)
        current_node = str(snapshot.next[0]) if snapshot.next else None

        return StateResponse(
            thread_id=thread_id,
            status="paused" if paused else "complete",
            domain=state.get("domain"),
            current_node=current_node,
            draft_document=state.get("draft_document"),
            human_gate_status=state.get("human_gate_status"),
            error=state.get("error"),
            complete=not paused,
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─── Human Gate: Get pending document for review ──────────────────────────────

@app.get(f"{settings.api_prefix}/pending/{{thread_id}}")
async def get_pending_approval(thread_id: str):
    """
    Retrieve the document and context waiting at a human gate.
    Displays to Doc for approval.
    """
    graph = get_compiled_graph()
    config = {"configurable": {"thread_id": thread_id}}

    try:
        snapshot = graph.get_state(config)
        if not snapshot or not snapshot.values:
            raise HTTPException(status_code=404, detail="Thread not found")

        state = snapshot.values
        paused = bool(snapshot.next)

        if not paused:
            return {"status": "not_paused", "message": "This workflow is not awaiting approval"}

        # Get the interrupt value (what the human_gate node sent up)
        interrupt_value = None
        if hasattr(snapshot, "tasks") and snapshot.tasks:
            for task in snapshot.tasks:
                if hasattr(task, "interrupts") and task.interrupts:
                    interrupt_value = task.interrupts[0].value
                    break

        return {
            "thread_id": thread_id,
            "status": "awaiting_approval",
            "domain": state.get("domain"),
            "document_type": state.get("document_type"),
            "draft_document": state.get("draft_document"),
            "compliance_score": state.get("compliance_score"),
            "red_flags": state.get("red_flags", []),
            "review_memo": state.get("review_memo"),
            "interrupt_data": interrupt_value,
            "paused_at": datetime.now(timezone.utc).isoformat(),
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─── Human Gate: Submit approval decision ─────────────────────────────────────

@app.post(f"{settings.api_prefix}/run/{{thread_id}}/resume")
async def resume_run(thread_id: str, human_input: HumanGateInput):
    """
    Resume a paused workflow after human decision.
    action: "approve" | "reject" | "revision"
    """
    graph = get_compiled_graph()
    config = {"configurable": {"thread_id": thread_id}}

    try:
        snapshot = graph.get_state(config)
        if not snapshot or not snapshot.next:
            raise HTTPException(status_code=400, detail="Workflow is not paused or not found")

        # Resume graph with human decision
        resume_value = {
            "action": human_input.action,
            "feedback": human_input.feedback or "",
            "edited_document": human_input.edited_document,
            "approved_by": human_input.approved_by,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }

        result = await graph.ainvoke(
            Command(resume=resume_value),
            config=config,
        )

        # Check final state
        final_snapshot = graph.get_state(config)
        paused = bool(final_snapshot.next)

        return {
            "thread_id": thread_id,
            "action": human_input.action,
            "status": "paused" if paused else "complete",
            "message": f"Workflow {human_input.action}d and {'paused' if paused else 'completed'}",
            "final_document": result.get("final_document") if isinstance(result, dict) else None,
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─── Simple chat endpoint (non-streaming, for testing) ────────────────────────

@app.post(f"{settings.api_prefix}/chat")
async def chat(body: dict):
    """
    Simple synchronous chat — runs full graph and returns result.
    Blocks until complete or paused at human gate.
    Not for production workflows — use /run for async with human gate support.
    """
    query = body.get("query") or body.get("message", "")
    if not query:
        raise HTTPException(status_code=400, detail="query or message required")

    req = RunRequest(query=query, urgency=body.get("urgency", "normal"))
    return await start_run(req)


# ─── List all active workflows ─────────────────────────────────────────────────

@app.get(f"{settings.api_prefix}/runs")
async def list_runs(limit: int = 20):
    """List recent workflow threads. Requires Supabase sessions table."""
    from app.services.vector_db import get_supabase
    try:
        sb = get_supabase()
        result = sb.table("sessions").select("id, domain, query, outcome, created_at").order(
            "created_at", desc=True
        ).limit(limit).execute()
        return {"runs": result.data or []}
    except Exception as e:
        return {"runs": [], "error": str(e)}


# ─── Widget chat: lightweight per-site persona endpoint ───────────────────────
# This is what the embeddable chat widgets on each empire site call. It is
# deliberately separate from /run — it does NOT go through the LangGraph
# document-drafting workflow or the human approval gate. It's a single
# persona-prompted Claude call, logged to Supabase for human review.
# "learned": true means the turn was logged, not that any model was retrained.

@app.post(f"{settings.api_prefix}/widget-chat")
async def widget_chat(body: dict):
    message = body.get("message", "")
    if not message:
        raise HTTPException(status_code=400, detail="message is required")

    site = body.get("site", "unknown")
    visitor_id = body.get("visitorId") or body.get("visitor_id") or "anonymous"
    persona = get_persona(body.get("aiPersona") or body.get("ai_persona"))
    escalate = should_escalate(message)

    allowed, retry_after = check_rate_limit(
        key=f"{site}:{visitor_id}",
        max_per_minute=settings.widget_rate_limit_per_minute,
    )
    if not allowed:
        logger.warning("Widget chat rate limited", extra={"extra_fields": {"site": site, "visitor_id": visitor_id}})
        raise HTTPException(
            status_code=429,
            detail=f"Rate limit exceeded. Retry after {retry_after}s.",
            headers={"Retry-After": str(retry_after)},
        )

    try:
        reply = await invoke_llm(
            system_key="widget",
            user_message=message,
            temperature=0.3,
            max_tokens=600,
            custom_system=persona["system"],
        )
    except LLMConfigError as e:
        logger.error("widget-chat called with no ANTHROPIC_API_KEY configured")
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        logger.exception("widget-chat AI call failed", extra={"extra_fields": {"site": site, "persona": persona["name"]}})
        raise HTTPException(status_code=502, detail=f"AI service error: {str(e)}")

    try:
        from app.services.vector_db import get_supabase
        sb = get_supabase()
        sb.table("widget_messages").insert({
            "site": site,
            "persona": persona["name"],
            "visitor_id": visitor_id,
            "message": message,
            "response": reply,
            "escalate": escalate,
        }).execute()
        logged = True
    except Exception as e:
        # Supabase not configured yet — don't fail the chat reply over it.
        logger.warning("Failed to log widget_messages row", extra={"extra_fields": {"site": site, "error": str(e)}})
        logged = False

    return {
        "response": reply,
        "persona": persona["name"],
        "learned": logged,
        "escalate": escalate,
    }


# ─── Report: aggregate widget activity for the HQ dashboard ───────────────────

@app.get(f"{settings.api_prefix}/report")
async def daily_report(hours: int = 24):
    """
    Real aggregate counts from widget_messages + sessions — not a predictive
    or AI-generated summary. Requires Supabase tables to be migrated.
    """
    from app.services.vector_db import get_supabase
    from datetime import timedelta

    since = (datetime.now(timezone.utc) - timedelta(hours=hours)).isoformat()

    try:
        sb = get_supabase()
        widget = sb.table("widget_messages").select(
            "site, persona, escalate, created_at"
        ).gte("created_at", since).execute().data or []
        sessions = sb.table("sessions").select(
            "domain, outcome, created_at"
        ).gte("created_at", since).execute().data or []
    except Exception as e:
        return {"error": str(e), "hint": "Supabase tables may not be migrated yet"}

    by_site: dict[str, int] = {}
    by_persona: dict[str, int] = {}
    escalations = 0
    for row in widget:
        by_site[row["site"]] = by_site.get(row["site"], 0) + 1
        by_persona[row["persona"]] = by_persona.get(row["persona"], 0) + 1
        if row.get("escalate"):
            escalations += 1

    by_outcome: dict[str, int] = {}
    for row in sessions:
        outcome = row.get("outcome") or "unknown"
        by_outcome[outcome] = by_outcome.get(outcome, 0) + 1

    return {
        "window_hours": hours,
        "widget_conversations": len(widget),
        "by_site": by_site,
        "by_persona": by_persona,
        "escalations_flagged": escalations,
        "document_workflows": len(sessions),
        "document_workflows_by_outcome": by_outcome,
        "generated_at": datetime.now(timezone.utc).isoformat(),
    }
