import uuid

from sqlalchemy import Boolean, Column, DateTime, Integer, String
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
    created_at = Column(DateTime(timezone=True), server_default=func.now())
