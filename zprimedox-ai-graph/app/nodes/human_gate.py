"""
Node 7: HUMAN GATE — CRITICAL
Pauses graph execution. Sends document to Doc for approval.
Resumes only after explicit human action: APPROVE / REJECT / REVISION.

Uses LangGraph's interrupt() mechanism with a Redis-backed checkpointer.
"""
from langgraph.types import interrupt
from app.models.state import GraphState, HumanGateStatus
from datetime import datetime, timezone


GATE_MESSAGE_TEMPLATES = {
    "legal": """
╔══════════════════════════════════════════════════════════════╗
║           PRIMEDOX AI — HUMAN APPROVAL REQUIRED              ║
╠══════════════════════════════════════════════════════════════╣
║  Document Type: {doc_type}                                   ║
║  Compliance Score: {score}%                                  ║
║  Red Flags: {flag_count}                                     ║
╚══════════════════════════════════════════════════════════════╝

DOCUMENT FOR REVIEW:
{draft}

RED FLAGS IDENTIFIED:
{red_flags}

REVIEW MEMO:
{review_memo}

──────────────────────────────────────────────────────────────
REQUIRED ACTION: Reply with your decision to resume the graph.
  • APPROVE — send/file as-is
  • REJECT  — discard, explain why
  • REVISION — provide edited text or specific changes needed
──────────────────────────────────────────────────────────────""",

    "cyber": """
╔══════════════════════════════════════════════════════════════╗
║           VIGILAX — SUPERVISOR APPROVAL REQUIRED             ║
╠══════════════════════════════════════════════════════════════╣
║  Threat Type: {doc_type}                                     ║
║  Severity Score: {score}                                     ║
║  Disruptive Actions: {flag_count} requiring authorization    ║
╚══════════════════════════════════════════════════════════════╝

CONTAINMENT PLAN FOR APPROVAL:
{draft}

RISK FLAGS:
{red_flags}

──────────────────────────────────────────────────────────────
APPROVE to execute containment. REJECT to stand down. REVISION to modify.
──────────────────────────────────────────────────────────────""",

    "safety": """
╔══════════════════════════════════════════════════════════════╗
║        OMNIAGUARD — SUPERVISOR AUTHORIZATION REQUIRED        ║
╠══════════════════════════════════════════════════════════════╣
║  Incident: {doc_type}                                        ║
║  Constitutional Flags: {flag_count}                          ║
╚══════════════════════════════════════════════════════════════╝

ACTION PLAN REQUIRING AUTHORIZATION:
{draft}

CONSTITUTIONAL COMPLIANCE FLAGS:
{red_flags}

──────────────────────────────────────────────────────────────
APPROVE to deploy resources. REJECT to stand down. REVISION to modify.
──────────────────────────────────────────────────────────────""",
}


async def human_gate_node(state: GraphState) -> GraphState:
    """
    Pauses the graph and waits for human input.
    The interrupt() call suspends execution here.
    The graph resumes when /api/v1/run/{thread_id}/resume is called.
    """
    domain = state.get("domain", "legal")
    template = GATE_MESSAGE_TEMPLATES.get(domain, GATE_MESSAGE_TEMPLATES["legal"])

    red_flags = state.get("red_flags", [])
    gate_message = template.format(
        doc_type=state.get("document_type", "document"),
        score=int((state.get("compliance_score") or 0) * 100),
        flag_count=len(red_flags),
        draft=state.get("draft_document", "[no draft]")[:6000],
        red_flags="\n".join(f"  ⚠ {flag}" for flag in red_flags) or "  ✓ No critical flags",
        review_memo=state.get("review_memo", "")[:1000],
    )

    # ── PAUSE HERE ────────────────────────────────────────────────────────────
    # interrupt() suspends graph execution and surfaces the value to the client.
    # The graph will resume when Command(resume=<human_input>) is passed.
    human_input = interrupt({
        "message": gate_message,
        "document": state.get("draft_document"),
        "doc_type": state.get("document_type"),
        "domain": domain,
        "compliance_score": state.get("compliance_score"),
        "red_flags": red_flags,
        "requires_action": True,
        "paused_at": datetime.now(timezone.utc).isoformat(),
    })
    # ── RESUMES HERE (after human calls /resume) ──────────────────────────────

    action = human_input.get("action", "reject").lower()
    feedback = human_input.get("feedback", "")
    edited_doc = human_input.get("edited_document")
    approved_by = human_input.get("approved_by", "Derek Francisco")

    if action == "approve":
        final_doc = edited_doc or state.get("draft_document")
        return {
            **state,
            "human_gate_status": HumanGateStatus.APPROVED,
            "human_feedback": feedback,
            "human_approved_by": approved_by,
            "human_approved_at": datetime.now(timezone.utc).isoformat(),
            "final_document": final_doc,
        }

    elif action == "revision":
        return {
            **state,
            "human_gate_status": HumanGateStatus.REVISION_REQUESTED,
            "human_feedback": feedback,
            "draft_document": edited_doc or state.get("draft_document"),
        }

    else:  # reject
        return {
            **state,
            "human_gate_status": HumanGateStatus.REJECTED,
            "human_feedback": feedback,
        }


def route_after_human_gate(state: GraphState) -> str:
    """Conditional edge after human gate decision."""
    status = state.get("human_gate_status")
    if status == HumanGateStatus.APPROVED:
        return "deliver"
    elif status == HumanGateStatus.REVISION_REQUESTED:
        return "draft"  # Loop back to draft with feedback
    else:
        return "end"    # Rejected — stop
