"""
backend/db_models/floor_state_db.py

Named FloorRow (not Floor) to avoid clashing with the existing Pydantic
FloorState contract in backend/models.py, which api/floors.py already
depends on for the in-memory GET /api/floors/{id}/state endpoint.
"""

import uuid

from sqlalchemy import Column, DateTime, ForeignKey, Integer
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.sql import func

from ..core.db import Base


class FloorRow(Base):
    __tablename__ = "floors"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    floor_number = Column(Integer, nullable=False, index=True)
    company_id = Column(UUID(as_uuid=True), ForeignKey("companies.id"), nullable=True)
    scene_config = Column(JSONB, default=dict)
    audio_config = Column(JSONB, default=dict)
    neural_graph_nodes = Column(JSONB, default=list)
    visit_count = Column(Integer, default=0)
    revenue_stats = Column(JSONB, default=dict)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
