"""
backend/api/floors.py

GET-only. Frontend never invents state — it always fetches from here.
Floors with no state set yet get a deterministic "offline" placeholder,
never random data.
"""

import time

from fastapi import APIRouter, HTTPException

from ..models import FloorState
from ..state_store import get_floor_state

router = APIRouter()

VALID_FLOOR_IDS = set(range(1, 11))


def _default_state(floor_id: int) -> dict:
    return {
        "floor_id": floor_id,
        "payload": {},
        "updated_at": time.time(),
        "status": "offline",
    }


@router.get("/floors/{floor_id}/state")
def get_state(floor_id: int):
    if floor_id not in VALID_FLOOR_IDS:
        raise HTTPException(status_code=404, detail=f"Floor {floor_id} is not registered")

    stored = get_floor_state(floor_id)
    if not stored:
        return _default_state(floor_id)

    state = FloorState(**stored)
    return {**state.model_dump(), "status": stored.get("status", "active")}
