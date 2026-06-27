"""
backend/db_models/floor_application.py

A floor-rental inquiry, from "outside company applies for a vacant floor"
through Stripe activating it. Distinct from db_models.payment.Payment, which
tracks PrimeDox AI's own SaaS subscriptions tied to a registered User — floor
renters are outside companies with no PrimeDox AI account.
"""

import uuid

from sqlalchemy import Column, DateTime, Integer, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func

from ..core.db import Base


class FloorApplication(Base):
    __tablename__ = "floor_applications"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    floor_number = Column(Integer, nullable=False, index=True)
    company_name = Column(String, nullable=False)
    contact_email = Column(String, nullable=False)
    website_url = Column(String, nullable=True)
    tier_requested = Column(String, nullable=True)
    status = Column(String, default="pending")  # pending, approved, rejected, paid
    stripe_session_id = Column(String, nullable=True, unique=True)
    stripe_customer_id = Column(String, nullable=True)
    stripe_subscription_id = Column(String, nullable=True)
    amount_cents = Column(Integer, nullable=True)
    currency = Column(String, default="usd")
    paid_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
