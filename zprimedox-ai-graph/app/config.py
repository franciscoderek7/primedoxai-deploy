from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # Anthropic / Claude
    anthropic_api_key: str = "PASTE_ANTHROPIC_API_KEY_HERE"
    claude_model: str = "claude-sonnet-4-6"

    # Supabase
    supabase_url: str = "PASTE_SUPABASE_URL_HERE"
    supabase_anon_key: str = "PASTE_SUPABASE_ANON_KEY_HERE"
    supabase_service_key: str = "PASTE_SUPABASE_SERVICE_KEY_HERE"

    # Redis (LangGraph checkpointer)
    redis_url: str = "redis://localhost:6379"

    # App
    app_name: str = "zPrimeDox AI HQ — LangGraph Engine"
    debug: bool = False
    api_prefix: str = "/api/v1"

    # Human gate
    human_gate_timeout_seconds: int = 86400  # 24 hours

    # Embeddings
    embedding_model: str = "text-embedding-3-small"
    vector_dimension: int = 1536

    class Config:
        env_file = ".env"
        case_sensitive = False


@lru_cache()
def get_settings() -> Settings:
    return Settings()
