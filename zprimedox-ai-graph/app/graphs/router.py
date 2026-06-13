"""
Main Router Graph — zPrimeDox AI HQ Central Brain
Classifies the domain, then hands off to the appropriate sub-graph.
Color: Green (#2E7D32) + Gold (#FFD700)
"""
from langgraph.graph import StateGraph, END
from app.models.state import GraphState, Domain
from app.services.llm import invoke_llm
from app.graphs.legal import build_legal_graph
from app.graphs.cyber import build_cyber_graph
from app.graphs.safety import build_safety_graph
from app.graphs.business import build_business_graph
from langgraph.checkpoint.redis import RedisSaver
from app.config import get_settings
import json
import uuid

settings = get_settings()


# ─── Router Node ─────────────────────────────────────────────────────────────

async def router_node(state: GraphState) -> GraphState:
    """
    Classifies the query domain using Claude.
    Injects session_id and thread_id if not present.
    """
    query = state.get("query", "")

    # Generate IDs if not present
    session_id = state.get("session_id") or str(uuid.uuid4())
    thread_id = state.get("thread_id") or session_id

    # Use domain_hint if provided
    if state.get("domain") and state["domain"] in [d.value for d in Domain]:
        return {**state, "session_id": session_id, "thread_id": thread_id, "retry_count": 0}

    prompt = f"""Classify this query. Respond with JSON only.

Query: "{query}"

{{"domain": "legal|cyber|safety|business", "urgency": "emergency|high|normal|low", "reason": "one line"}}"""

    try:
        raw = await invoke_llm("router", prompt, temperature=0.0)
        start, end = raw.find("{"), raw.rfind("}") + 1
        parsed = json.loads(raw[start:end]) if start >= 0 else {}

        domain = parsed.get("domain", "legal")
        if domain not in [d.value for d in Domain]:
            domain = "legal"

        return {
            **state,
            "session_id": session_id,
            "thread_id": thread_id,
            "domain": domain,
            "urgency": parsed.get("urgency", state.get("urgency", "normal")),
            "retry_count": 0,
            "messages": [],
        }
    except Exception as e:
        return {
            **state,
            "session_id": session_id,
            "thread_id": thread_id,
            "domain": "legal",
            "urgency": "normal",
            "retry_count": 0,
            "error": f"Router classification error: {str(e)}",
        }


def route_to_domain(state: GraphState) -> str:
    """Conditional edge: route to correct sub-graph."""
    domain = state.get("domain", "legal")
    mapping = {
        Domain.LEGAL: "legal",
        Domain.CYBER: "cyber",
        Domain.SAFETY: "safety",
        Domain.BUSINESS: "business",
    }
    return mapping.get(domain, "legal")


# ─── Sub-graph entry nodes ────────────────────────────────────────────────────
# Each sub-graph is compiled separately and invoked as a node in the router graph.

async def legal_entry(state: GraphState) -> GraphState:
    graph = build_legal_graph().compile(checkpointer=_get_checkpointer())
    config = {"configurable": {"thread_id": state["thread_id"]}}
    result = await graph.ainvoke(state, config=config)
    return result


async def cyber_entry(state: GraphState) -> GraphState:
    graph = build_cyber_graph().compile(checkpointer=_get_checkpointer())
    config = {"configurable": {"thread_id": state["thread_id"]}}
    result = await graph.ainvoke(state, config=config)
    return result


async def safety_entry(state: GraphState) -> GraphState:
    graph = build_safety_graph().compile(checkpointer=_get_checkpointer())
    config = {"configurable": {"thread_id": state["thread_id"]}}
    result = await graph.ainvoke(state, config=config)
    return result


async def business_entry(state: GraphState) -> GraphState:
    graph = build_business_graph().compile(checkpointer=_get_checkpointer())
    config = {"configurable": {"thread_id": state["thread_id"]}}
    result = await graph.ainvoke(state, config=config)
    return result


def _get_checkpointer():
    """Redis checkpointer for state persistence and human-gate resume."""
    return RedisSaver.from_conn_string(settings.redis_url)


# ─── Build and compile router graph ──────────────────────────────────────────

def build_router_graph() -> StateGraph:
    g = StateGraph(GraphState)

    g.add_node("router", router_node)
    g.add_node("legal", legal_entry)
    g.add_node("cyber", cyber_entry)
    g.add_node("safety", safety_entry)
    g.add_node("business", business_entry)

    g.set_entry_point("router")
    g.add_conditional_edges(
        "router",
        route_to_domain,
        {
            "legal": "legal",
            "cyber": "cyber",
            "safety": "safety",
            "business": "business",
        },
    )
    g.add_edge("legal", END)
    g.add_edge("cyber", END)
    g.add_edge("safety", END)
    g.add_edge("business", END)

    return g


def get_compiled_graph():
    """Return the compiled router graph with Redis checkpointer."""
    return build_router_graph().compile(checkpointer=_get_checkpointer())
