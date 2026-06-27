"""
backend/api/payment.py

Whether this charges in test or live mode is decided ENTIRELY by which
STRIPE_SECRET_KEY is in the deploy environment (sk_test_... vs sk_live_...).
Nothing in this file hardcodes a mode — see core/config.py:Settings.stripe_live.

All checkout sessions use stripe.Checkout.Session, which is created under
Derek's own Stripe account (whichever account STRIPE_SECRET_KEY belongs to).
There is no code path here that could charge Derek himself — the customer
identified in the checkout session is always the end user, never the
account owner.
"""

import stripe
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from ..core.config import settings
from ..core.db import get_db
from ..db_models.user import ApiKey, User
from ..schemas import CheckoutRequest
from .deps import get_current_user

router = APIRouter(prefix="/api/payment", tags=["payment"])

stripe.api_key = settings.STRIPE_SECRET_KEY

PLAN_PRICE_IDS = {
    "starter": settings.STRIPE_PRICE_STARTER,
    "pro": settings.STRIPE_PRICE_PRO,
    "enterprise": settings.STRIPE_PRICE_ENTERPRISE,
}

PLAN_RATE_LIMITS = {"free": 10, "starter": 200, "pro": 2000, "enterprise": 100000}


def _require_stripe_configured():
    if not settings.STRIPE_SECRET_KEY:
        raise HTTPException(
            status.HTTP_503_SERVICE_UNAVAILABLE,
            "STRIPE_SECRET_KEY is not set in this environment — payments are not wired up yet.",
        )


@router.post("/checkout")
def checkout(
    body: CheckoutRequest,
    current_user: User = Depends(get_current_user),
):
    _require_stripe_configured()
    price_id = PLAN_PRICE_IDS.get(body.plan_id)
    if not price_id:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, f"Unknown or unpriced plan: {body.plan_id}")

    session = stripe.checkout.Session.create(
        mode="subscription",
        line_items=[{"price": price_id, "quantity": 1}],
        customer_email=current_user.email,
        client_reference_id=str(current_user.id),
        success_url=body.success_url,
        cancel_url=body.cancel_url,
    )
    return {"checkout_url": session.url}


@router.get("/portal")
def portal(current_user: User = Depends(get_current_user)):
    _require_stripe_configured()
    if not current_user.stripe_customer_id:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "No Stripe customer on file for this user")

    session = stripe.billing_portal.Session.create(
        customer=current_user.stripe_customer_id,
        return_url="https://zprimedoxaihq.com/account",
    )
    return {"portal_url": session.url}


@router.post("/webhook")
async def webhook(request: Request, db: Session = Depends(get_db)):
    _require_stripe_configured()
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature", "")

    try:
        event = stripe.Webhook.construct_event(payload, sig_header, settings.STRIPE_WEBHOOK_SECRET)
    except (ValueError, stripe.error.SignatureVerificationError) as exc:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, f"Invalid webhook signature: {exc}") from exc

    event_type = event["type"]
    data = event["data"]["object"]

    if event_type == "checkout.session.completed":
        user_id = data.get("client_reference_id")
        customer_id = data.get("customer")
        user = db.query(User).filter(User.id == user_id).first()
        if user:
            user.stripe_customer_id = customer_id
            plan = "starter"  # TODO: map price ID on the session back to a plan name
            user.access_level = "premium"

            api_key = ApiKey(user_id=user.id, plan=plan, rate_limit=PLAN_RATE_LIMITS.get(plan, 60))
            db.add(api_key)
            db.commit()
            # TODO: send welcome email via services/email.py once SENDGRID_API_KEY is set

    return {"received": True}
