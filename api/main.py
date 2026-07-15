"""
Francisco Holdings Inc. — Empire Payment Verification API
FastAPI backend: PayPal webhook processing + auto-code generation + email delivery

Routes:
  POST /api/verify-payment    — verify a PayPal order ID server-side, issue an unlock code
  POST /api/paypal/webhook    — PayPal IPN/webhook listener (subscription events)
  POST /api/stripe/webhook    — Stripe webhook listener
  GET  /api/health            — health check

Deploy: Railway / Render / Fly.io
  1. Set env vars (see .env.example)
  2. pip install -r requirements.txt
  3. uvicorn main:app --host 0.0.0.0 --port $PORT
"""
import os
import hmac
import hashlib
import sqlite3
import smtplib
import json
import time
import secrets
import logging
from datetime import datetime, timezone
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, HTTPException, Header, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import httpx

logging.basicConfig(level=logging.INFO)
log = logging.getLogger(__name__)

# ── CONFIG ────────────────────────────────────────────────────────────────────
PAYPAL_CLIENT_ID       = os.getenv("PAYPAL_CLIENT_ID", "")
PAYPAL_CLIENT_SECRET   = os.getenv("PAYPAL_CLIENT_SECRET", "")
PAYPAL_WEBHOOK_ID      = os.getenv("PAYPAL_WEBHOOK_ID", "")
PAYPAL_MODE            = os.getenv("PAYPAL_MODE", "sandbox")  # "sandbox" | "live"
STRIPE_WEBHOOK_SECRET  = os.getenv("STRIPE_WEBHOOK_SECRET", "")
SMTP_HOST              = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT              = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER              = os.getenv("SMTP_USER", "")
SMTP_PASS              = os.getenv("SMTP_PASS", "")
DEREK_EMAIL            = os.getenv("DEREK_EMAIL", "franciscoderek7@gmail.com")
DB_PATH                = os.getenv("DB_PATH", "empire_subscriptions.db")
ALLOWED_ORIGINS        = os.getenv("ALLOWED_ORIGINS", "*").split(",")

PAYPAL_BASE = "https://api-m.paypal.com" if PAYPAL_MODE == "live" else "https://api-m.sandbox.paypal.com"

# ── DATABASE ──────────────────────────────────────────────────────────────────
def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    db = get_db()
    db.executescript("""
        CREATE TABLE IF NOT EXISTS subscriptions (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            email       TEXT NOT NULL,
            product     TEXT NOT NULL,
            tier        TEXT,
            amount      REAL,
            currency    TEXT DEFAULT 'CAD',
            code        TEXT NOT NULL UNIQUE,
            active      INTEGER DEFAULT 1,
            processor   TEXT,
            processor_id TEXT,
            created_at  TEXT,
            cancelled_at TEXT
        );
        CREATE INDEX IF NOT EXISTS idx_sub_email ON subscriptions(email);
        CREATE INDEX IF NOT EXISTS idx_sub_code  ON subscriptions(code);
        CREATE INDEX IF NOT EXISTS idx_sub_pid   ON subscriptions(processor_id);
    """)
    db.commit()
    db.close()

# ── APP ───────────────────────────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    log.info("Empire Payment API started — DB ready")
    yield

app = FastAPI(
    title="Francisco Holdings Inc. — Empire Payment API",
    version="1.0.0",
    lifespan=lifespan,
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

# ── HELPERS ───────────────────────────────────────────────────────────────────
def generate_code(prefix: str = "FHI") -> str:
    """Generates a cryptographically random 12-char access code."""
    return f"{prefix}-{secrets.token_urlsafe(9)}"

def send_email(to: str, subject: str, html: str):
    if not SMTP_USER or not SMTP_PASS:
        log.warning("SMTP not configured — email not sent to %s", to)
        return
    try:
        msg = MIMEMultipart("alternative")
        msg["From"]    = SMTP_USER
        msg["To"]      = to
        msg["Subject"] = subject
        msg.attach(MIMEText(html, "html"))
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as s:
            s.ehlo()
            s.starttls()
            s.login(SMTP_USER, SMTP_PASS)
            s.sendmail(SMTP_USER, [to], msg.as_string())
        log.info("Email sent to %s", to)
    except Exception as e:
        log.error("Email failed to %s: %s", to, e)

def access_email_html(email: str, product: str, tier: str, code: str) -> str:
    return f"""
<div style="font-family:system-ui,sans-serif;background:#050d05;padding:40px 20px;text-align:center">
  <div style="max-width:480px;margin:0 auto;background:#0a160a;border:1px solid #1a3320;border-radius:16px;padding:40px">
    <div style="color:#10b981;font-size:10px;letter-spacing:3px;margin-bottom:8px">FRANCISCO HOLDINGS INC.</div>
    <h1 style="color:#c9a227;font-size:24px;margin-bottom:6px">Access Granted</h1>
    <p style="color:#4a7c59;font-size:14px;margin-bottom:28px">{product} — {tier}</p>
    <p style="color:#9ca3af;font-size:13px;margin-bottom:12px">Your access code:</p>
    <div style="background:#0f220f;border:1px solid #1e4d2b;border-radius:8px;padding:18px;
                font-family:monospace;font-size:22px;letter-spacing:3px;color:#10b981;margin-bottom:24px">
      {code}
    </div>
    <p style="color:#6b7280;font-size:11px">
      Enter this code on any Francisco Holdings Inc. property to unlock your subscription.<br>
      Session expires after 24 hours — re-enter to refresh access.
    </p>
    <hr style="border-color:#1a3320;margin:24px 0">
    <p style="color:#374151;font-size:11px">franciscoholdingsinc.com · zprimedoxaihq.com</p>
  </div>
</div>"""

def notify_derek(email: str, product: str, amount: float, currency: str, processor_id: str):
    send_email(
        to=DEREK_EMAIL,
        subject=f"[FHI] New payment — {product} {amount} {currency}",
        html=f"""
<p><b>New Empire Payment</b></p>
<ul>
  <li>Customer: {email}</li>
  <li>Product: {product}</li>
  <li>Amount: {amount} {currency}</li>
  <li>Processor ID: {processor_id}</li>
  <li>Time: {datetime.now(timezone.utc).isoformat()}</li>
</ul>""",
    )

async def paypal_access_token() -> str:
    if not PAYPAL_CLIENT_ID or not PAYPAL_CLIENT_SECRET:
        raise HTTPException(status_code=503, detail="PayPal credentials not configured")
    async with httpx.AsyncClient() as c:
        r = await c.post(
            f"{PAYPAL_BASE}/v1/oauth2/token",
            data={"grant_type": "client_credentials"},
            auth=(PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET),
        )
        r.raise_for_status()
        return r.json()["access_token"]

# ── ROUTES ────────────────────────────────────────────────────────────────────

@app.get("/api/health")
def health():
    return {"status": "ok", "empire": "Francisco Holdings Inc.", "version": "1.0.0"}


@app.post("/api/verify-payment")
async def verify_payment(request: Request):
    """
    Body: { order_id, product, tier, email }
    Verifies a PayPal order with PayPal's API, generates + stores an unlock code,
    emails the customer, and returns the code.
    """
    try:
        body = await request.json()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON")

    order_id = body.get("order_id", "").strip()
    product  = body.get("product", "Unknown Product").strip()
    tier     = body.get("tier", "Standard").strip()
    email    = body.get("email", "").strip().lower()

    if not order_id or not email:
        raise HTTPException(status_code=400, detail="order_id and email required")

    # Verify order with PayPal
    try:
        token = await paypal_access_token()
        async with httpx.AsyncClient() as c:
            r = await c.get(
                f"{PAYPAL_BASE}/v2/checkout/orders/{order_id}",
                headers={"Authorization": f"Bearer {token}"},
            )
        if r.status_code != 200:
            raise HTTPException(status_code=402, detail="PayPal order not found or not COMPLETED")
        order = r.json()
        if order.get("status") != "COMPLETED":
            raise HTTPException(status_code=402, detail=f"Order status: {order.get('status')} — not COMPLETED")

        amount_val = float(
            order.get("purchase_units", [{}])[0]
            .get("amount", {})
            .get("value", "0")
        )
        currency = (
            order.get("purchase_units", [{}])[0]
            .get("amount", {})
            .get("currency_code", "CAD")
        )
    except HTTPException:
        raise
    except Exception as e:
        log.error("PayPal verify error: %s", e)
        raise HTTPException(status_code=503, detail="PayPal verification failed")

    # Check for duplicate order
    db = get_db()
    existing = db.execute(
        "SELECT code FROM subscriptions WHERE processor_id=?", (order_id,)
    ).fetchone()
    if existing:
        db.close()
        return {"code": existing["code"], "reissued": True}

    # Issue access code
    code = generate_code("FHI")
    db.execute(
        """INSERT INTO subscriptions
           (email,product,tier,amount,currency,code,processor,processor_id,created_at)
           VALUES (?,?,?,?,?,?,?,?,?)""",
        (email, product, tier, amount_val, currency, code, "paypal", order_id,
         datetime.now(timezone.utc).isoformat()),
    )
    db.commit()
    db.close()

    send_email(email, f"Your {product} Access Code — Francisco Holdings Inc.",
               access_email_html(email, product, tier, code))
    notify_derek(email, product, amount_val, currency, order_id)

    log.info("Code issued: %s → %s (%s)", email, code, product)
    return {"code": code, "product": product, "tier": tier}


@app.post("/api/paypal/webhook")
async def paypal_webhook(request: Request):
    """
    Handles PayPal subscription lifecycle events:
      BILLING.SUBSCRIPTION.ACTIVATED  → issue code, email customer
      BILLING.SUBSCRIPTION.CANCELLED  → deactivate code
      BILLING.SUBSCRIPTION.SUSPENDED  → deactivate code
      PAYMENT.SALE.COMPLETED          → issue/refresh code for one-time payments
    """
    body_bytes = await request.body()
    body = {}
    try:
        body = json.loads(body_bytes)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON")

    event_type = body.get("event_type", "")
    resource   = body.get("resource", {})
    log.info("PayPal webhook: %s", event_type)

    # ── SUBSCRIPTION ACTIVATED ──
    if event_type == "BILLING.SUBSCRIPTION.ACTIVATED":
        sub_id = resource.get("id", "")
        email  = (resource.get("subscriber", {})
                          .get("email_address", "")).lower()
        plan   = resource.get("plan_id", "")
        if email and sub_id:
            db = get_db()
            existing = db.execute(
                "SELECT id FROM subscriptions WHERE processor_id=?", (sub_id,)
            ).fetchone()
            if not existing:
                code = generate_code("FHI")
                db.execute(
                    """INSERT INTO subscriptions
                       (email,product,tier,code,active,processor,processor_id,created_at)
                       VALUES (?,?,?,?,1,?,?,?)""",
                    (email, "Empire Subscription", plan, code,
                     "paypal_subscription", sub_id,
                     datetime.now(timezone.utc).isoformat()),
                )
                db.commit()
                send_email(email,
                           "Your Empire Access Code — Francisco Holdings Inc.",
                           access_email_html(email, "Empire Subscription", plan, code))
                notify_derek(email, f"Subscription {plan}", 0, "CAD", sub_id)
            db.close()

    # ── SUBSCRIPTION CANCELLED / SUSPENDED ──
    elif event_type in ("BILLING.SUBSCRIPTION.CANCELLED", "BILLING.SUBSCRIPTION.SUSPENDED"):
        sub_id = resource.get("id", "")
        if sub_id:
            db = get_db()
            db.execute(
                "UPDATE subscriptions SET active=0, cancelled_at=? WHERE processor_id=?",
                (datetime.now(timezone.utc).isoformat(), sub_id),
            )
            db.commit()
            db.close()
            log.info("Subscription deactivated: %s", sub_id)

    # ── ONE-TIME PAYMENT COMPLETED ──
    elif event_type == "PAYMENT.SALE.COMPLETED":
        txn_id  = resource.get("id", "")
        amount  = float(resource.get("amount", {}).get("total", "0"))
        currency = resource.get("amount", {}).get("currency", "CAD")
        email   = (resource.get("soft_descriptor", "") or "").lower()
        # PayPal one-time sales don't reliably include customer email in webhook body;
        # use /api/verify-payment (client-side confirmation after order capture) instead.
        log.info("Sale completed: %s %s %s", txn_id, amount, currency)

    return JSONResponse({"received": True})


@app.post("/api/stripe/webhook")
async def stripe_webhook(request: Request, stripe_signature: str = Header(None)):
    """
    Handles Stripe subscription events:
      customer.subscription.created   → issue code
      customer.subscription.deleted   → deactivate code
      checkout.session.completed      → issue code for one-time payments
    """
    if not STRIPE_WEBHOOK_SECRET:
        raise HTTPException(status_code=503, detail="Stripe webhook secret not configured")

    body_bytes = await request.body()

    # Verify Stripe signature
    try:
        parts = {k: v for p in (stripe_signature or "").split(",")
                 for k, v in [p.split("=", 1)]}
        ts      = parts.get("t", "0")
        sig_v1  = parts.get("v1", "")
        signed  = f"{ts}.{body_bytes.decode()}"
        expected = hmac.new(
            STRIPE_WEBHOOK_SECRET.encode(),
            signed.encode(),
            hashlib.sha256,
        ).hexdigest()
        if not hmac.compare_digest(expected, sig_v1):
            raise HTTPException(status_code=400, detail="Invalid Stripe signature")
        if abs(time.time() - int(ts)) > 300:
            raise HTTPException(status_code=400, detail="Stripe timestamp too old")
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=400, detail="Stripe signature verification failed")

    body = json.loads(body_bytes)
    event_type = body.get("type", "")
    obj        = body.get("data", {}).get("object", {})
    log.info("Stripe webhook: %s", event_type)

    if event_type in ("customer.subscription.created", "checkout.session.completed"):
        email    = obj.get("customer_email") or obj.get("customer_details", {}).get("email", "")
        email    = (email or "").lower()
        sub_id   = obj.get("id", "")
        amount   = obj.get("amount_total", 0) / 100
        currency = (obj.get("currency", "cad")).upper()
        product  = "Empire Subscription"

        if email and sub_id:
            db = get_db()
            existing = db.execute(
                "SELECT code FROM subscriptions WHERE processor_id=?", (sub_id,)
            ).fetchone()
            if not existing:
                code = generate_code("FHI")
                db.execute(
                    """INSERT INTO subscriptions
                       (email,product,tier,amount,currency,code,active,processor,processor_id,created_at)
                       VALUES (?,?,?,?,?,?,1,?,?,?)""",
                    (email, product, event_type, amount, currency, code,
                     "stripe", sub_id, datetime.now(timezone.utc).isoformat()),
                )
                db.commit()
                send_email(email,
                           "Your Empire Access Code — Francisco Holdings Inc.",
                           access_email_html(email, product, event_type, code))
                notify_derek(email, product, amount, currency, sub_id)
            db.close()

    elif event_type == "customer.subscription.deleted":
        sub_id = obj.get("id", "")
        if sub_id:
            db = get_db()
            db.execute(
                "UPDATE subscriptions SET active=0, cancelled_at=? WHERE processor_id=?",
                (datetime.now(timezone.utc).isoformat(), sub_id),
            )
            db.commit()
            db.close()

    return JSONResponse({"received": True})
