import uuid

from sqlalchemy import Boolean, Column, DateTime, Integer, String, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.sql import func

from ..core.db import Base


class Company(Base):
    __tablename__ = "companies"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    floor_number = Column(Integer, unique=True, nullable=False)
    name = Column(String, nullable=False)
    industry = Column(String, nullable=True)
    colors = Column(JSONB, default=dict)
    ai_role = Column(String, nullable=True)
    services = Column(JSONB, default=list)
    team = Column(JSONB, default=list)
    is_active = Column(Boolean, default=True)
    # Skyscraper display content — what the frontend renders for this floor.
    theme = Column(String, nullable=True)  # comma-separated hex colors
    description = Column(Text, nullable=True)
    cta_text = Column(String, nullable=True)
    cta_link = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
