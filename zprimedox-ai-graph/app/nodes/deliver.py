"""
Node 8: DELIVER
Formats, logs, and delivers the approved document.
Triggers the self-improvement loop.
"""
from app.models.state import GraphState
from app.services.vector_db import store_document
from app.services.memory_graph import update_from_session
from app.services.llm import invoke_llm
from datetime import datetime, timezone
import json


SELF_REVIEW_PROMPT = """Review this completed AI workflow and extract lessons learned.

DOMAIN: {domain}
ORIGINAL QUERY: {query}
FINAL DOCUMENT TYPE: {doc_type}
COMPLIANCE SCORE: {score}%

Produce a brief self-improvement memo:
1. WHAT WORKED: Best elements of the workflow
2. WHAT COULD BE BETTER: Specific improvements
3. LESSONS LEARNED: 3-5 actionable lessons (one sentence each)
4. KNOWLEDGE GRAPH UPDATES: New entities/relationships to add

Respond with JSON:
{{
  "worked_well": ["list"],
  "improvements": ["list"],
  "lessons_learned": ["lesson 1", "lesson 2", "lesson 3"],
  "self_review_summary": "one paragraph"
}}"""


async def deliver_node(state: GraphState) -> GraphState:
    final_doc = state.get("final_document") or state.get("draft_document", "")
    domain = state.get("domain", "legal")
    delivery_log = []

    try:
        # 1. Store the document in Supabase
        doc_id = await store_document(
            content=final_doc,
            doc_type=state.get("document_type", "document"),
            session_id=state["session_id"],
            metadata={
                "domain": domain,
                "approved_by": state.get("human_approved_by"),
                "approved_at": state.get("human_approved_at"),
                "compliance_score": state.get("compliance_score"),
            },
        )
        delivery_log.append(f"[{datetime.now(timezone.utc).isoformat()}] Document stored: {doc_id}")

        # 2. Self-improvement review
        self_review_raw = await invoke_llm(
            "self_review",
            SELF_REVIEW_PROMPT.format(
                domain=domain,
                query=state["query"][:500],
                doc_type=state.get("document_type", "unknown"),
                score=int((state.get("compliance_score") or 0) * 100),
            ),
            temperature=0.1,
        )

        try:
            start = self_review_raw.find("{")
            end = self_review_raw.rfind("}") + 1
            self_data = json.loads(self_review_raw[start:end]) if start >= 0 else {}
        except Exception:
            self_data = {}

        lessons = self_data.get("lessons_learned", [])
        self_review = self_data.get("self_review_summary", "")

        # 3. Update knowledge graph with session data
        await update_from_session(
            session_id=state["session_id"],
            state={**state, "lessons_learned": lessons},
        )
        delivery_log.append(f"[{datetime.now(timezone.utc).isoformat()}] Knowledge graph updated")

        delivery_log.append(f"[{datetime.now(timezone.utc).isoformat()}] Workflow complete — session: {state['session_id']}")

        return {
            **state,
            "delivery_log": delivery_log,
            "self_review": self_review,
            "lessons_learned": lessons,
            "error": None,
        }

    except Exception as e:
        delivery_log.append(f"[{datetime.now(timezone.utc).isoformat()}] Delivery error: {str(e)}")
        return {**state, "delivery_log": delivery_log, "error": f"Delivery failed: {str(e)}"}
