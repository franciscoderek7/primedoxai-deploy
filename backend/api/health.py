"""backend/api/health.py — GET /api/health, must return status on every deploy."""

import time

from fastapi import APIRouter

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
