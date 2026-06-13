"""
zPrimeDox AI HQ — FastAPI Application
LangGraph state-machine AI with human-in-the-loop gates.
Green (#2E7D32) + Gold (#FFD700) — Francisco Holdings Inc.
"""
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from langgraph.types import Command
from app.graphs.router import get_compiled_graph
from app.models.state import RunRequest, RunResponse, HumanGateInput, StateResponse, GraphState
from app.config import get_settings
from datetime import datetime, timezone
import uuid
import json

settings = get_settings()

app = FastAPI(
    title="zPrimeDox AI HQ",
    description="The World's First Cannabis Constitutional Intelligence Engine — LangGraph Backend",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://zprimedoxaihq.com", "http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─── Health Check ─────────────────────────────────────────────────────────────

@app.get("/health")
async def health():
    return {
        "status": "online",
        "service": "zPrimeDox AI HQ",
        "version": "1.0.0",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "color": "#2E7D32",
        "gold": "#FFD700",
    }


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
