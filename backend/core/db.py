"""
backend/core/db.py

Postgres via SQLAlchemy. Swaps in for backend/state_store.py's in-memory
dict once DATABASE_URL points at a real instance (Supabase, Neon, or local
docker-compose Postgres) — state_store.py is left untouched so existing
floor-state polling keeps working during the transition.
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

from .config import settings

engine = create_engine(settings.DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db() -> None:
    """Create all tables. Call once at startup; safe to call repeatedly."""
    from .. import db_models  # noqa: F401 — registers models on Base

    Base.metadata.create_all(bind=engine)
