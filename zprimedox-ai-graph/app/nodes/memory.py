"""
Memory node — retrieves and injects knowledge graph context at query time.
Runs before the main workflow to pre-load relevant context.
"""
from app.models.state import GraphState
from app.services.memory_graph import search_knowledge, get_entity_context
import json


async def memory_recall_node(state: GraphState) -> GraphState:
    """Pre-flight memory retrieval — runs before intake for context injection."""
    query = state.get("query", "")
    domain = state.get("domain")

    try:
        kg_results = await search_knowledge(query=query, domain=domain, limit=3)
        if kg_results:
            # Inject into case_summary as prior context
            existing_summary = state.get("case_summary", "")
            prior_context = json.dumps(kg_results, indent=2)
            state = {**state, "case_summary": f"{existing_summary}\n\nPrior knowledge:\n{prior_context}"}
    except Exception:
        pass  # Memory is enhancement, not critical path

    return state
