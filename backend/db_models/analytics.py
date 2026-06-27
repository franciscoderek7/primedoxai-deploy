import uuid

from sqlalchemy import Column, DateTime, Integer, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func

from ..core.db import Base


class AnalyticsVisit(Base):
    __tablename__ = "analytics_visits"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    floor_number = Column(Integer, nullable=False, index=True)
    user_id = Column(UUID(as_uuid=True), nullable=True)
    session_id = Column(String, nullable=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    referrer = Column(String, nullable=True)
    user_agent = Column(String, nullable=True)
