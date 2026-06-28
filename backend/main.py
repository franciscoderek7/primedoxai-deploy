"""
backend/main.py

FastAPI skeleton for the FloorManager runtime — GET-only, no WebSockets,
no Timmy/Floor-9 logic, no auth yet. Backend is the single source of
truth; the frontend never invents floor state, it always fetches.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .api import admin, analytics, auth, company, floor_rentals, floors, generate, health, payment, user
from .core.db import init_db

app = FastAPI(title="Francisco Holdings Skyscraper API", version="0.2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://franciscoholdingsinc.com",
        "https://omniaguard.com",
        "https://primedoxai.com",
        "https://zprimedoxaihq.com",
        "https://ccldr.net",
        "http://localhost:3000",
        "http://localhost:8080",
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup() -> None:
    # Best-effort: if Postgres isn't reachable yet (e.g. DATABASE_URL not set
    # in this deploy environment), the pre-existing GET-only health/floor-state
    # endpoints must keep working without a database. Auth/generate/payment
    # routes will simply 500 until DATABASE_URL is wired up.
    try:
        init_db()
    except Exception as exc:  # noqa: BLE001
        import logging

        logging.getLogger("uvicorn.error").warning("DB init skipped — %s", exc)


# GET-only floor-state polling — unchanged shape, frontend already depends on it.
app.include_router(floors.router, prefix="/api")
app.include_router(health.router)

# New: auth, document generation, Stripe, company/analytics/user — additive only.
app.include_router(auth.router)
app.include_router(generate.router)
app.include_router(payment.router)
app.include_router(company.router)
app.include_router(analytics.router)
app.include_router(user.router)
app.include_router(admin.router)
app.include_router(floor_rentals.router)
