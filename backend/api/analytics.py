"""
backend/api/analytics.py

POST /api/floor/{n}/visit logs a row to analytics_visits and bumps the
matching FloorRow's visit_count. GET /api/neural-graph and GET /api/ai/{id}/status
return data shaped for the frontend's neural-graph visualization — both are
backed by real rows once floors/companies exist, but ship with no seed data,
so an empty Postgres returns an empty graph rather than fabricated numbers.
"""

from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session

from ..core.db import get_db
from ..db_models.analytics import AnalyticsVisit
from ..db_models.company import Company
from ..db_models.floor_state_db import FloorRow

router = APIRouter(prefix="/api", tags=["analytics"])


@router.post("/floor/{floor_number}/visit")
def log_visit(floor_number: int, request: Request, db: Session = Depends(get_db)):
    visit = AnalyticsVisit(
        floor_number=floor_number,
        session_id=request.headers.get("x-session-id"),
        referrer=request.headers.get("referer"),
        user_agent=request.headers.get("user-agent"),
    )
    db.add(visit)

    floor_row = db.query(FloorRow).filter(FloorRow.floor_number == floor_number).first()
    if floor_row:
        floor_row.visit_count = (floor_row.visit_count or 0) + 1

    db.commit()

    visit_count = db.query(AnalyticsVisit).filter(AnalyticsVisit.floor_number == floor_number).count()
    return {"success": True, "visit_count": visit_count}


@router.get("/neural-graph")
def neural_graph(db: Session = Depends(get_db)):
    floors = db.query(FloorRow).all()
    nodes = [
        {"id": f.floor_number, "company_id": str(f.company_id) if f.company_id else None}
        for f in floors
    ]
    # Edge data (data-packet animation positions) lives entirely on the frontend;
    # this only supplies which floors exist and are connectable.
    edges = [{"from": nodes[i]["id"], "to": nodes[i + 1]["id"]} for i in range(len(nodes) - 1)]
    return {"nodes": nodes, "edges": edges}


@router.get("/ai/{ai_id}/status")
def ai_status(ai_id: str, db: Session = Depends(get_db)):
    company = db.query(Company).filter(Company.ai_role == ai_id).first()
    if not company:
        return {"online": False, "load": 0, "last_seen": None, "current_task": None}
    return {"online": company.is_active, "load": 0, "last_seen": None, "current_task": None}
