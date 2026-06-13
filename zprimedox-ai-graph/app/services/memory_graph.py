"""
Knowledge Graph operations via Supabase.
Entities (nodes) and relationships (edges) grow with every interaction.
"""
from app.services.vector_db import get_supabase, get_embedding, store_session_result
from typing import Dict, List, Optional, Any
import json


async def add_entity(
    name: str,
    entity_type: str,     # person, case, organization, document, argument, precedent
    domain: str,
    properties: Optional[Dict] = None,
    content_for_embedding: Optional[str] = None,
) -> str:
    """Add or update an entity node. Returns entity ID."""
    sb = get_supabase()

    embedding = None
    if content_for_embedding:
        embedding = await get_embedding(content_for_embedding)

    result = sb.table("memory_nodes").upsert({
        "name": name,
        "entity_type": entity_type,
        "domain": domain,
        "properties": properties or {},
        "embedding": embedding,
    }, on_conflict="name,entity_type").execute()

    return result.data[0]["id"]


async def add_relationship(
    source_id: str,
    target_id: str,
    relationship: str,      # involves, supports, cites, associated_with, outcome
    weight: float = 1.0,
    properties: Optional[Dict] = None,
) -> None:
    """Add a directed edge between two entities."""
    sb = get_supabase()
    sb.table("memory_edges").upsert({
        "source_id": source_id,
        "target_id": target_id,
        "relationship": relationship,
        "weight": weight,
        "properties": properties or {},
    }, on_conflict="source_id,target_id,relationship").execute()


async def get_entity_context(entity_name: str, depth: int = 2) -> Dict:
    """
    Retrieve entity and its neighborhood (up to `depth` hops).
    Used to give the AI context about known entities in a query.
    """
    sb = get_supabase()

    # Get the entity
    result = sb.table("memory_nodes").select("*").ilike("name", f"%{entity_name}%").execute()
    if not result.data:
        return {}

    entity = result.data[0]
    entity_id = entity["id"]

    # Get connected nodes (1 hop)
    edges = sb.table("memory_edges").select("*, target:memory_nodes!target_id(*)").eq(
        "source_id", entity_id
    ).execute()

    connected = [
        {
            "relationship": e["relationship"],
            "target": e["target"]["name"],
            "target_type": e["target"]["entity_type"],
            "properties": e.get("properties", {}),
        }
        for e in (edges.data or [])
    ]

    return {
        "entity": entity["name"],
        "type": entity["entity_type"],
        "domain": entity["domain"],
        "properties": entity.get("properties", {}),
        "connections": connected,
    }


async def update_from_session(session_id: str, state: Dict) -> None:
    """
    Extract entities from a completed session and update the knowledge graph.
    Called by the deliver/memory node after every completed workflow.
    """
    domain = state.get("domain", "unknown")
    entities = state.get("entities", {})
    lessons = state.get("lessons_learned", [])

    # Store people mentioned
    for person in entities.get("people", []):
        await add_entity(person, "person", domain)

    # Store organizations
    for org in entities.get("organizations", []):
        await add_entity(org, "organization", domain)

    # Store the case/incident as an entity
    if state.get("case_summary"):
        case_id = await add_entity(
            name=f"Case:{session_id[:8]}",
            entity_type="case",
            domain=domain,
            properties={
                "session_id": session_id,
                "urgency": state.get("urgency"),
                "document_type": state.get("document_type"),
                "outcome": "complete" if state.get("final_document") else "incomplete",
                "compliance_score": state.get("compliance_score"),
            },
            content_for_embedding=state.get("case_summary"),
        )

    # Store lessons learned as argument entities
    for lesson in (lessons or []):
        await add_entity(
            name=f"Lesson:{lesson[:50]}",
            entity_type="argument",
            domain=domain,
            properties={"lesson": lesson, "session_id": session_id},
            content_for_embedding=lesson,
        )

    # Persist full session
    await store_session_result(session_id, state)


async def search_knowledge(query: str, domain: Optional[str] = None, limit: int = 5) -> List[Dict]:
    """Semantic search over the knowledge graph."""
    from app.services.vector_db import search_similar
    embedding = await get_embedding(query)
    return await search_similar(embedding, match_count=limit, filter_domain=domain)
