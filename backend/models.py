"""backend/models.py — Pydantic contract for floor state."""

from typing import Any, Dict
from pydantic import BaseModel


class FloorState(BaseModel):
    floor_id: int
    payload: Dict[str, Any]
    updated_at: float
