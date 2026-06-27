"""backend/api/health.py — GET /api/health, must return status on every deploy."""

import time

from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.orm import Session

from ..core.db import get_db

router = APIRouter()

VERSION = "0.1.0"
_START_TIME = time.time()


@router.get("/health")
def health():
    return {
        "status": "ok",
        "active_floor": None,
        "uptime": round(time.time() - _START_TIME, 3),
        "version": VERSION,
    }


@router.get("/api/health/db")
def health_db(db: Session = Depends(get_db)):
    # Deliberately separate from /health: that one must stay up with zero DB
    # dependency (it's the Railway healthcheck target). This one exists purely
    # to verify DATABASE_URL is actually reachable — returns 200 either way so
    # it's easy to curl while wiring up a new database, with the real result
    # in the body rather than the status code.
    try:
        db.execute(text("SELECT 1"))
        return {"db": "ok"}
    except Exception as exc:  # noqa: BLE001
        return {"db": "error", "detail": str(exc)}
