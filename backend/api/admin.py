"""
backend/api/admin.py

GET /api/admin/analytics/summary — JSON aggregates over analytics_visits,
documents, and payments, gated by require_admin (JWT + access_level=="admin").

GET /admin/analytics — a single-page HTML dashboard that prompts for the
admin's bearer token client-side (stored in localStorage) and calls the
summary endpoint above. No server-rendered template engine in this stack,
so the HTML is returned as a plain string — fine at this size, swap to
Jinja2 if this dashboard grows past one page.
"""

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import HTMLResponse
from sqlalchemy import func
from sqlalchemy.orm import Session

from ..core.db import get_db
from ..db_models.analytics import AnalyticsVisit
from ..db_models.document import Document
from ..db_models.floor_application import FloorApplication
from ..db_models.floor_ledger import FloorLedgerEntry
from ..db_models.payment import Payment
from ..db_models.user import User
from .deps import get_current_user

router = APIRouter(tags=["admin"])


def require_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.access_level != "admin":
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Admin access required")
    return current_user


@router.get("/api/admin/analytics/summary")
def analytics_summary(
    _admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    visits_by_floor = dict(
        db.query(AnalyticsVisit.floor_number, func.count(AnalyticsVisit.id))
        .group_by(AnalyticsVisit.floor_number)
        .all()
    )
    documents_by_status = dict(
        db.query(Document.status, func.count(Document.id)).group_by(Document.status).all()
    )
    revenue_by_plan = {
        plan: float(total)
        for plan, total in db.query(Payment.plan, func.sum(Payment.amount))
        .filter(Payment.status == "succeeded")
        .group_by(Payment.plan)
        .all()
    }
    payment_failures = db.query(Payment).filter(Payment.status == "failed").count()

    return {
        "total_visits": sum(visits_by_floor.values()),
        "visits_by_floor": visits_by_floor,
        "documents_by_status": documents_by_status,
        "revenue_by_plan": revenue_by_plan,
        "payment_failures": payment_failures,
    }


@router.get("/admin/analytics", response_class=HTMLResponse)
def analytics_dashboard():
    return """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>Empire Analytics — Admin</title>
<style>
  body { font-family: system-ui, sans-serif; background: #0b0c10; color: #eaeaea; padding: 2rem; }
  h1 { color: #C9A84C; }
  .card { background: #16181d; border: 1px solid #2a2d35; border-radius: 8px; padding: 1.25rem; margin-bottom: 1rem; }
  table { width: 100%; border-collapse: collapse; }
  td, th { text-align: left; padding: 0.4rem 0.6rem; border-bottom: 1px solid #2a2d35; }
  input { padding: 0.5rem; width: 360px; background: #0b0c10; color: #eaeaea; border: 1px solid #2a2d35; border-radius: 4px; }
  button { padding: 0.5rem 1rem; background: #C9A84C; color: #0b0c10; border: none; border-radius: 4px; cursor: pointer; }
  .err { color: #ff5d5d; }
</style>
</head>
<body>
<h1>Empire Analytics</h1>
<div class="card">
  <label>Admin bearer token: </label>
  <input id="token" type="password" placeholder="paste admin access token" />
  <button onclick="load()">Load</button>
  <span id="status"></span>
</div>
<div id="output"></div>

<script>
const stored = localStorage.getItem("admin_token");
if (stored) document.getElementById("token").value = stored;

async function load() {
  const token = document.getElementById("token").value.trim();
  const statusEl = document.getElementById("status");
  const out = document.getElementById("output");
  statusEl.textContent = "";
  out.innerHTML = "";
  if (!token) { statusEl.textContent = "Enter a token first."; return; }
  localStorage.setItem("admin_token", token);

  try {
    const res = await fetch("/api/admin/analytics/summary", {
      headers: { Authorization: "Bearer " + token }
    });
    if (!res.ok) {
      statusEl.innerHTML = '<span class="err">' + res.status + ": " + (await res.text()) + "</span>";
      return;
    }
    const data = await res.json();
    out.innerHTML = renderSummary(data);
  } catch (e) {
    statusEl.innerHTML = '<span class="err">' + e + "</span>";
  }
}

function renderSummary(data) {
  const row = (k, v) => "<tr><td>" + k + "</td><td>" + v + "</td></tr>";
  let html = '<div class="card"><h3>Totals</h3><table>';
  html += row("Total floor visits", data.total_visits);
  html += row("Payment failures", data.payment_failures);
  html += "</table></div>";

  html += '<div class="card"><h3>Visits by floor</h3><table>';
  for (const [floor, count] of Object.entries(data.visits_by_floor)) html += row("Floor " + floor, count);
  html += "</table></div>";

  html += '<div class="card"><h3>Documents by status</h3><table>';
  for (const [s, count] of Object.entries(data.documents_by_status)) html += row(s, count);
  html += "</table></div>";

  html += '<div class="card"><h3>Revenue by plan (succeeded payments)</h3><table>';
  for (const [plan, total] of Object.entries(data.revenue_by_plan)) html += row(plan, "$" + total.toFixed(2));
  html += "</table></div>";

  return html;
}

if (stored) load();
</script>
</body>
</html>"""


@router.get("/api/admin/floor-applications")
def list_floor_applications(
    _admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    apps = db.query(FloorApplication).order_by(FloorApplication.created_at.desc()).all()
    return {
        "applications": [
            {
                "id": a.id,
                "floor_number": a.floor_number,
                "company_name": a.company_name,
                "contact_email": a.contact_email,
                "website_url": a.website_url,
                "tier_requested": a.tier_requested,
                "status": a.status,
                "amount_cents": a.amount_cents,
                "paid_at": a.paid_at,
                "created_at": a.created_at,
            }
            for a in apps
        ]
    }


@router.post("/api/admin/floor-applications/{application_id}/approve")
def approve_floor_application(
    application_id: UUID,
    _admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    application = db.query(FloorApplication).filter(FloorApplication.id == application_id).first()
    if not application:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Application not found")
    application.status = "approved"
    db.commit()
    return {"status": "approved"}


@router.get("/api/admin/ledger")
def list_floor_ledger(
    _admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    entries = db.query(FloorLedgerEntry).order_by(FloorLedgerEntry.created_at.desc()).all()
    return {
        "ledger": [
            {
                "id": e.id,
                "floor_number": e.floor_number,
                "application_id": e.application_id,
                "transaction_type": e.transaction_type,
                "amount_cents": e.amount_cents,
                "currency": e.currency,
                "stripe_charge_id": e.stripe_charge_id,
                "status": e.status,
                "created_at": e.created_at,
            }
            for e in entries
        ]
    }
