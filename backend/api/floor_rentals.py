"""
backend/api/floor_rentals.py

The only way a vacant floor becomes occupied: a company applies here, pays
via Stripe Checkout, and the webhook in api/payment.py flips FloorRow.status
to "active" on checkout.session.completed. This endpoint never mutates floor
state itself — mirrors the read-only contract api/floors.py already enforces
for the live skyscraper.
"""

import stripe
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..core.config import settings
from ..core.db import get_db
from ..db_models.floor_application import FloorApplication
from ..db_models.floor_state_db import FloorRow
from ..schemas import FloorApplyRequest

router = APIRouter(prefix="/api/floors", tags=["floor-rentals"])

stripe.api_key = settings.STRIPE_SECRET_KEY


def _require_stripe_configured():
    if not settings.STRIPE_SECRET_KEY:
        raise HTTPException(
            status.HTTP_503_SERVICE_UNAVAILABLE,
            "STRIPE_SECRET_KEY is not set in this environment — payments are not wired up yet.",
        )


@router.post("/{floor_number}/apply")
def apply_for_floor(floor_number: int, body: FloorApplyRequest, db: Session = Depends(get_db)):
    _require_stripe_configured()

    floor_row = db.query(FloorRow).filter(FloorRow.floor_number == floor_number).first()
    if not floor_row or floor_row.status != "vacant":
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Floor is not available for rent")
    if not floor_row.monthly_rate_cents:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Floor has no rental price set")

    application = FloorApplication(
        floor_number=floor_number,
        company_name=body.company_name,
        contact_email=body.contact_email,
        website_url=body.website_url,
        tier_requested=body.tier_requested or floor_row.tier,
        status="pending",
    )
    db.add(application)
    db.commit()

    session = stripe.checkout.Session.create(
        mode="subscription",
        line_items=[
            {
                "price_data": {
                    "currency": "usd",
                    "product_data": {"name": f"Floor {floor_number} rental — {body.company_name}"},
                    "unit_amount": floor_row.monthly_rate_cents,
                    "recurring": {"interval": "month"},
                },
                "quantity": 1,
            }
        ],
        customer_email=body.contact_email,
        success_url=body.success_url,
        cancel_url=body.cancel_url,
        metadata={"floor_application_id": str(application.id), "floor_number": str(floor_number)},
    )

    application.stripe_session_id = session.id
    db.commit()

    return {"checkout_url": session.url, "application_id": application.id}
