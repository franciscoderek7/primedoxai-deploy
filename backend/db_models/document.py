import uuid

from sqlalchemy import Column, DateTime, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func

from ..core.db import Base


class Document(Base):
    __tablename__ = "documents"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    type = Column(String, nullable=False)  # legal, business, personal, etc.
    prompt = Column(Text, nullable=False)
    content = Column(Text, nullable=True)
    pdf_url = Column(String, nullable=True)
    status = Column(String, default="generating")  # generating, ready, error
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)
