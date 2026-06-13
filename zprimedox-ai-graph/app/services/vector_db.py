from supabase import create_client, Client
from app.config import get_settings
from typing import List, Dict, Any, Optional
import json

settings = get_settings()

_client: Optional[Client] = None


def get_supabase() -> Client:
    global _client
    if _client is None:
        _client = create_client(settings.supabase_url, settings.supabase_service_key)
    return _client


async def store_document(
    content: str,
    doc_type: str,
    session_id: str,
    metadata: Optional[Dict] = None,
) -> str:
    """Store a document and return its ID."""
    sb = get_supabase()
    result = sb.table("case_documents").insert({
        "content": content,
        "doc_type": doc_type,
        "session_id": session_id,
        "metadata": metadata or {},
    }).execute()
    return result.data[0]["id"]


async def search_similar(
    query_embedding: List[float],
    table: str = "memory_embeddings",
    match_threshold: float = 0.7,
    match_count: int = 5,
    filter_domain: Optional[str] = None,
) -> List[Dict]:
    """Semantic search via Supabase pgvector."""
    sb = get_supabase()
    params = {
        "query_embedding": query_embedding,
        "match_threshold": match_threshold,
        "match_count": match_count,
    }
    if filter_domain:
        params["filter_domain"] = filter_domain

    result = sb.rpc("match_memory_nodes", params).execute()
    return result.data or []


async def get_embedding(text: str) -> List[float]:
    """Get text embedding via Anthropic / OpenAI compatible endpoint."""
    import httpx
    # Using OpenAI-compatible embedding endpoint as placeholder
    # Replace with actual embedding service when configured
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            "https://api.openai.com/v1/embeddings",
            headers={"Authorization": f"Bearer {settings.anthropic_api_key}"},
            json={"input": text[:8000], "model": settings.embedding_model},
            timeout=30,
        )
        if resp.status_code == 200:
            return resp.json()["data"][0]["embedding"]
        # Fallback: return zero vector (degrades gracefully)
        return [0.0] * settings.vector_dimension


async def store_session_result(session_id: str, state: Dict) -> None:
    """Persist completed session state for future reference."""
    sb = get_supabase()
    sb.table("sessions").upsert({
        "id": session_id,
        "domain": state.get("domain"),
        "query": state.get("query"),
        "final_document": state.get("final_document"),
        "outcome": "complete" if state.get("final_document") else "incomplete",
        "metadata": {
            "urgency": state.get("urgency"),
            "document_type": state.get("document_type"),
            "compliance_score": state.get("compliance_score"),
        },
    }).execute()
