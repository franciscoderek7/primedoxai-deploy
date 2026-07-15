"""
WeedLaw Pro + Canadian Cannabis Consulting — Subscription Backend
FastAPI server: PayPal / Stripe / Square webhook processing + unlock code generation
Deploy to: Render, Railway, DigitalOcean App Platform, or any WSGI host
"""
import os
import hmac
import hashlib
import sqlite3
import smtplib
import json
import time
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import httpx

logging.basicConfig(level=logging.INFO)
log = logging.getLogger(__name__)

# ── Config from environment (never hardcode) ──────────────────────────────────
UNLOCK_SECRET      = os.getenv("UNLOCK_SECRET_KEY", "")          # your secret — set in .env
PAYPAL_WEBHOOK_ID  = os.getenv("PAYPAL_WEBHOOK_ID", "")
PAYPAL_CLIENT_ID   = os.getenv("PAYPAL_CLIENT_ID", "")
PAYPAL_CLIENT_SECRET = os.getenv("PAYPAL_CLIENT_SECRET", "")
PAYPAL_MODE        = os.getenv("PAYPAL_MODE", "sandbox")          # "sandbox" or "live"
STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET", "")
SQUARE_WEBHOOK_SIG = os.getenv("SQUARE_WEBHOOK_SIGNATURE_KEY", "")
SMTP_HOST          = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT          = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER          = os.getenv("SMTP_USER", "")
SMTP_PASS          = os.getenv("SMTP_PASS", "")
DEREK_EMAIL        = os.getenv("DEREK_EMAIL", "franciscoderek7@gmail.com")
DB_PATH            = os.getenv("DB_PATH", "subscriptions.db")

PAYPAL_BASE = {
    "sandbox": "https://api-m.sandbox.paypal.com",
    "live":    "https://api-m.paypal.com",
}[PAYPAL_MODE]

# ── Database setup ────────────────────────────────────────────────────────────
def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    db = get_db()
    db.execute("""
        CREATE TABLE IF NOT EXISTS subscriptions (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            email       TEXT NOT NULL,
            product     TEXT NOT NULL,
            code        TEXT NOT NULL,
            active      INTEGER DEFAULT 1,
            processor   TEXT,
            sub_id      TEXT,
            created_at  INTEGER,
            cancelled_at INTEGER
        )
    """)
    db.execute("CREATE INDEX IF NOT EXISTS idx_email ON subscriptions(email)")
    db.execute("CREATE INDEX IF NOT EXISTS idx_sub_id ON subscriptions(sub_id)")
    db.commit()
    db.close()

# ── Unlock code generation (HMAC — server-side, not JS) ──────────────────────
def generate_code(email: str, product: str, period: str) -> str:
    """Deterministic HMAC code for email+product+period. Change period monthly to rotate."""
    if not UNLOCK_SECRET:
        raise RuntimeError("UNLOCK_SECRET_KEY env var not set")
    payload = f"{email.lower()}:{product}:{period}"
    raw = hmac.new(UNLOCK_SECRET.encode(), payload.encode(), hashlib.sha256).hexdigest()
    return raw[:20].upper()

def current_period() -> str:
    """Returns YYYY-MM — codes rotate monthly."""
    t = time.gmtime()
    return f"{t.tm_year}-{t.tm_mon:02d}"

# ── Email ─────────────────────────────────────────────────────────────────────
def send_unlock_email(to_email: str, product: str, code: str):
    if not SMTP_USER:
        log.warning("SMTP not configured — skipping email to %s", to_email)
        return
    msg = MIMEMultipart("alternative")
    msg["Subject"] = f"Your {product} Unlock Code"
    msg["From"]    = SMTP_USER
    msg["To"]      = to_email
    body = f"""
<h2>Welcome to {product} Professional</h2>
<p>Your unlock code is:</p>
<h1 style="font-family:monospace;letter-spacing:4px;color:#00d084">{code}</h1>
<p>Enter this code on the website when prompted after payment. Keep it safe.</p>
<p>To cancel, email <a href="mailto:{DEREK_EMAIL}">{DEREK_EMAIL}</a></p>
<hr>
<small>Francisco Holdings Inc. | {DEREK_EMAIL}</small>
"""
    msg.attach(MIMEText(body, "html"))
    try:
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as s:
            s.starttls()
            s.login(SMTP_USER, SMTP_PASS)
            s.sendmail(SMTP_USER, [to_email, DEREK_EMAIL], msg.as_string())
        log.info("Unlock email sent to %s", to_email)
    except Exception as e:
        log.error("Email send failed: %s", e)

# ── App lifecycle ─────────────────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    log.info("DB initialized. PayPal mode: %s", PAYPAL_MODE)
    yield

app = FastAPI(title="Francisco Holdings Subscription API", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://weedlaw.com", "https://weedlaw.ca",
                   "https://canadiancannabisconsulting.com", "http://localhost:3000"],
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

# ── Health check ──────────────────────────────────────────────────────────────
@app.get("/")
def health():
    return {"status": "ok", "service": "Francisco Holdings Subscription API"}

# ── Verify code (called by frontend) ─────────────────────────────────────────
@app.get("/verify")
def verify_code(code: str, email: str, product: str = "weedlaw"):
    db = get_db()
    row = db.execute(
        "SELECT * FROM subscriptions WHERE email=? AND product=? AND active=1",
        (email.lower(), product)
    ).fetchone()
    db.close()
    if row and row["code"] == code.upper():
        return {"valid": True}
    # Also check HMAC for current period (allows re-generation without DB)
    expected = generate_code(email, product, current_period())
    return {"valid": code.upper() == expected}

# ── PayPal webhook ────────────────────────────────────────────────────────────
@app.post("/webhooks/paypal")
async def paypal_webhook(request: Request):
    body = await request.body()
    headers = dict(request.headers)

    # Verify with PayPal (production) — skipped in sandbox for simplicity
    if PAYPAL_MODE == "live" and PAYPAL_WEBHOOK_ID:
        verified = await _verify_paypal_signature(headers, body)
        if not verified:
            raise HTTPException(status_code=400, detail="Invalid PayPal signature")

    event = json.loads(body)
    etype = event.get("event_type", "")
    log.info("PayPal event: %s", etype)

    resource = event.get("resource", {})

    if etype in ("PAYMENT.SALE.COMPLETED", "BILLING.SUBSCRIPTION.ACTIVATED"):
        payer = resource.get("payer", {})
        email = (payer.get("payer_info", {}).get("email") or
                 resource.get("subscriber", {}).get("email_address", ""))
        sub_id = resource.get("id", "")
        product = _detect_product(resource)
        _activate(email, product, "paypal", sub_id)

    elif etype in ("BILLING.SUBSCRIPTION.CANCELLED", "BILLING.SUBSCRIPTION.EXPIRED",
                   "BILLING.SUBSCRIPTION.SUSPENDED"):
        sub_id = resource.get("id", "")
        _deactivate_by_sub_id(sub_id)

    return JSONResponse({"received": True})

async def _verify_paypal_signature(headers: dict, body: bytes) -> bool:
    async with httpx.AsyncClient() as client:
        # Get PayPal access token
        r = await client.post(
            f"{PAYPAL_BASE}/v1/oauth2/token",
            auth=(PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET),
            data={"grant_type": "client_credentials"},
        )
        if r.status_code != 200:
            return False
        token = r.json().get("access_token", "")
        # Verify signature
        verify_payload = {
            "auth_algo":         headers.get("paypal-auth-algo", ""),
            "cert_url":          headers.get("paypal-cert-url", ""),
            "transmission_id":   headers.get("paypal-transmission-id", ""),
            "transmission_sig":  headers.get("paypal-transmission-sig", ""),
            "transmission_time": headers.get("paypal-transmission-time", ""),
            "webhook_id":        PAYPAL_WEBHOOK_ID,
            "webhook_event":     json.loads(body),
        }
        rv = await client.post(
            f"{PAYPAL_BASE}/v1/notifications/verify-webhook-signature",
            json=verify_payload,
            headers={"Authorization": f"Bearer {token}"},
        )
        return rv.json().get("verification_status") == "SUCCESS"

# ── Stripe webhook ────────────────────────────────────────────────────────────
@app.post("/webhooks/stripe")
async def stripe_webhook(
    request: Request,
    stripe_signature: str = Header(None, alias="stripe-signature"),
):
    body = await request.body()

    if STRIPE_WEBHOOK_SECRET:
        try:
            import stripe
            event = stripe.Webhook.construct_event(body, stripe_signature, STRIPE_WEBHOOK_SECRET)
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))
    else:
        event = json.loads(body)

    etype = event.get("type", "")
    log.info("Stripe event: %s", etype)
    obj = event.get("data", {}).get("object", {})

    if etype in ("checkout.session.completed", "customer.subscription.created"):
        email = (obj.get("customer_email") or
                 obj.get("customer_details", {}).get("email", ""))
        sub_id = obj.get("subscription") or obj.get("id", "")
        product = _detect_product_stripe(obj)
        _activate(email, product, "stripe", sub_id)

    elif etype in ("customer.subscription.deleted", "customer.subscription.paused"):
        sub_id = obj.get("id", "")
        _deactivate_by_sub_id(sub_id)

    return JSONResponse({"received": True})

# ── Square webhook ────────────────────────────────────────────────────────────
@app.post("/webhooks/square")
async def square_webhook(
    request: Request,
    x_square_signature: str = Header(None, alias="x-square-signature"),
):
    body = await request.body()

    if SQUARE_WEBHOOK_SIG:
        import base64
        import hmac as _hmac
        import hashlib as _hashlib
        url = str(request.url)
        expected_sig = base64.b64encode(
            _hmac.new(SQUARE_WEBHOOK_SIG.encode(), (url + body.decode()).encode(), _hashlib.sha256).digest()
        ).decode()
        if not _hmac.compare_digest(expected_sig, x_square_signature or ""):
            raise HTTPException(status_code=400, detail="Invalid Square signature")

    event = json.loads(body)
    etype = event.get("type", "")
    log.info("Square event: %s", etype)
    obj = event.get("data", {}).get("object", {})

    if etype == "payment.completed":
        order = obj.get("payment", {})
        email = order.get("buyer_email_address", "")
        sub_id = order.get("id", "")
        product = "weedlaw"
        _activate(email, product, "square", sub_id)

    elif etype == "subscription.updated":
        sub = obj.get("subscription", {})
        if sub.get("status") in ("CANCELED", "DEACTIVATED"):
            _deactivate_by_sub_id(sub.get("id", ""))

    return JSONResponse({"received": True})

# ── Shared helpers ────────────────────────────────────────────────────────────
def _detect_product(resource: dict) -> str:
    desc = str(resource).lower()
    if "consulting" in desc or "4999" in desc or "1499" in desc or "499" in desc:
        return "consulting"
    return "weedlaw"

def _detect_product_stripe(obj: dict) -> str:
    meta = obj.get("metadata", {})
    return meta.get("product", "weedlaw")

def _activate(email: str, product: str, processor: str, sub_id: str):
    if not email:
        log.warning("No email in %s activation event", processor)
        return
    code = generate_code(email, product, current_period())
    db = get_db()
    existing = db.execute(
        "SELECT id FROM subscriptions WHERE email=? AND product=?",
        (email.lower(), product)
    ).fetchone()
    if existing:
        db.execute(
            "UPDATE subscriptions SET active=1,code=?,sub_id=?,cancelled_at=NULL WHERE id=?",
            (code, sub_id, existing["id"])
        )
    else:
        db.execute(
            "INSERT INTO subscriptions (email,product,code,active,processor,sub_id,created_at) VALUES (?,?,?,1,?,?,?)",
            (email.lower(), product, code, processor, sub_id, int(time.time()))
        )
    db.commit()
    db.close()
    send_unlock_email(email, product, code)
    log.info("Activated %s for %s via %s (code: %s)", product, email, processor, code)

def _deactivate_by_sub_id(sub_id: str):
    db = get_db()
    db.execute(
        "UPDATE subscriptions SET active=0,cancelled_at=? WHERE sub_id=?",
        (int(time.time()), sub_id)
    )
    db.commit()
    row = db.execute("SELECT email,product FROM subscriptions WHERE sub_id=?", (sub_id,)).fetchone()
    db.close()
    if row:
        log.info("Deactivated %s for %s (sub_id: %s)", row["product"], row["email"], sub_id)
