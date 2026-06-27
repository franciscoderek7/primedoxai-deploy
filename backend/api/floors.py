"""
backend/api/floors.py

GET-only. Frontend never invents state — it always fetches from here.
Floors with no state set yet get a deterministic "offline" placeholder,
never random data.
"""

import time

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..core.db import get_db
from ..db_models.company import Company
from ..db_models.floor_state_db import FloorRow
from ..models import FloorState
from ..state_store import get_floor_state

router = APIRouter()

VALID_FLOOR_IDS = set(range(1, 13))  # 1-12: Floor 12 is the rentable floor


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


def _company_summary(company: Company) -> dict:
    return {
        "id": company.id,
        "name": company.name,
        "industry": company.industry,
        "colors": company.colors,
        "services": company.services,
        "theme": company.theme,
        "description": company.description,
        "cta_text": company.cta_text,
        "cta_link": company.cta_link,
    }


def _floor_summary(floor_row: FloorRow, company: Company | None) -> dict:
    return {
        "floor_number": floor_row.floor_number,
        "status": floor_row.status,
        "tier": floor_row.tier,
        "monthly_rate_cents": floor_row.monthly_rate_cents,
        "billing_status": floor_row.billing_status,
        "company": _company_summary(company) if company else None,
    }


@router.get("/floors")
def list_floors(db: Session = Depends(get_db)):
    """All floors 1-12. The skyscraper frontend renders from this list."""
    floor_rows = db.query(FloorRow).order_by(FloorRow.floor_number).all()
    companies = {c.id: c for c in db.query(Company).all()}
    return {
        "floors": [
            _floor_summary(row, companies.get(row.company_id))
            for row in floor_rows
        ]
    }


@router.get("/floor/{floor_number}")
def get_floor_config(floor_number: int, db: Session = Depends(get_db)):
    """Full floor config (company, scene, audio) — distinct from the
    ephemeral /floors/{id}/state endpoint above, which the live skyscraper
    polls and must not change shape."""
    floor_row = db.query(FloorRow).filter(FloorRow.floor_number == floor_number).first()
    if not floor_row:
        raise HTTPException(status_code=404, detail=f"Floor {floor_number} is not registered")

    company = None
    if floor_row.company_id:
        company = db.query(Company).filter(Company.id == floor_row.company_id).first()

    return {
        "floor_number": floor_row.floor_number,
        "scene_config": floor_row.scene_config,
        "audio_config": floor_row.audio_config,
        "neural_graph_nodes": floor_row.neural_graph_nodes,
        "visit_count": floor_row.visit_count,
        "status": floor_row.status,
        "tier": floor_row.tier,
        "monthly_rate_cents": floor_row.monthly_rate_cents,
        "billing_status": floor_row.billing_status,
        "company": _company_summary(company) if company else None,
    }
