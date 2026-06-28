"""
backend/db_models/floor_ledger.py

Audit trail for floor-rental money movement, separate from FloorApplication
(the one row per rental that webhooks update in place). Recurring monthly
charges on the same subscription each get their own ledger row here, so
"first dollar" — and every dollar after it — has a permanent record even
though the application row itself only ever moves through one lifecycle.
"""

import uuid

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func

from ..core.db import Base


class FloorLedgerEntry(Base):
    __tablename__ = "floor_ledger"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    floor_number = Column(Integer, nullable=False, index=True)
    application_id = Column(UUID(as_uuid=True), ForeignKey("floor_applications.id"), nullable=True)
    transaction_type = Column(String, nullable=False)  # payment, refund, fee, commission
    amount_cents = Column(Integer, nullable=False)
    currency = Column(String, default="usd")
    stripe_charge_id = Column(String, nullable=True)
    status = Column(String, default="pending")  # pending, completed, failed, disputed
    created_at = Column(DateTime(timezone=True), server_default=func.now())
