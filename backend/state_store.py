"""
backend/state_store.py

In-memory single source of truth for floor state. No database yet —
ready to be swapped for Supabase Postgres later without changing the
get/set call sites in api/floors.py.
"""

from typing import Any, Dict

STATE: Dict[int, Dict[str, Any]] = {}


def get_floor_state(floor_id: int) -> Dict[str, Any]:
    return STATE.get(floor_id, {})


def set_floor_state(floor_id: int, data: Dict[str, Any]) -> None:
    STATE[floor_id] = data
