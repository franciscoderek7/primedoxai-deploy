# Francisco Holdings Skyscraper API

FastAPI backend for the Francisco Holdings empire skyscraper: floor state,
company/tenant data, document generation, auth, Stripe billing (subscriptions
and floor-rental checkout), and the admin analytics dashboard.

No live deploy credentials (Railway/Render account, DNS, Stripe live keys)
are held in this environment — this doc is the handoff package for whoever
runs the actual deploy.

## File list

```
backend/
  main.py                       FastAPI app: CORS, router wiring, startup DB init
  models.py                     Pydantic FloorState contract (in-memory floor state)
  schemas.py                    Pydantic request/response schemas (auth, generate, payment, floor apply)
  state_store.py                In-memory store backing GET /floors/{id}/state
  requirements.txt              Pinned dependencies
  Dockerfile                    Container build (python:3.11-slim, uvicorn entrypoint)
  railway.json                  Railway deploy config (Dockerfile build, /health healthcheck)
  .env.example                  Env var template — copy to .env, fill in, never commit the real file

  core/
    config.py                   Settings (reads env vars: DATABASE_URL, JWT_SECRET, STRIPE_*, etc.)
    db.py                       SQLAlchemy engine/session, get_db dependency, init_db()
    security.py                 Password hashing, JWT access/refresh token create+decode

  db_models/                     SQLAlchemy ORM models
    user.py                      User, ApiKey
    company.py                  Company (tenant: name, theme, CTA, branding)
    floor_state_db.py           FloorRow (status/tier/rate/billing per floor 1-12)
    floor_application.py        FloorApplication (rental application + Stripe session)
    floor_ledger.py             FloorLedgerEntry (payment/ledger audit trail per floor)
    document.py                  Document (generated document + PDF URL)
    payment.py                   Payment (subscription payment record)
    analytics.py                 AnalyticsVisit (per-floor visit log)

  api/                           Route modules (all included from main.py)
    health.py                    GET /health, GET /api/health/db
    floors.py                    GET /floors/{id}/state, GET /floors, GET /floor/{n} — read-only
    floor_rentals.py             POST /api/floors/{n}/apply — vacant-floor rental application + Stripe Checkout
    company.py                   GET /api/company/{id}
    auth.py                      POST /api/auth/register, /login, /refresh, GET /api/auth/me
    user.py                      GET /api/user/me
    generate.py                  POST /api/generate, GET /api/generate/{id}, POST /api/generate/webhook
    payment.py                   POST /api/payment/checkout, GET /api/payment/portal, POST /api/payment/webhook
    admin.py                     GET /api/admin/analytics/summary, GET /admin/analytics (HTML dashboard),
                                  GET/POST /api/admin/floor-applications, GET /api/admin/ledger
    analytics.py                 POST /api/floor/{n}/visit, GET /api/neural-graph, GET /api/ai/{id}/status
    deps.py                      Shared get_current_user / get_api_key_user dependencies

  scripts/
    seed_floors.py               Idempotent seed: floors 1-11 occupied (tenant display content),
                                  floor 12 vacant at $999/mo. Run: python -m backend.scripts.seed_floors
    setup_stripe_products.py     Creates/links Stripe products+prices for empire-wide plans

  services/
    pdf.py                       Text -> PDF rendering (fpdf2)
    storage.py                   PDF upload (Supabase storage)

  tests/
    test_health.py               Smoke tests for /health and app import
```

## Local setup

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

cp .env.example .env
# fill in DATABASE_URL at minimum; everything else degrades gracefully:
#  - no STRIPE_SECRET_KEY -> payment/floor-rental routes return 503, rest of API works
#  - no DATABASE_URL reachable at startup -> GET /health still responds; DB-backed
#    routes 500 until DATABASE_URL is wired up (see main.py:on_startup)

python -m backend.scripts.seed_floors      # seeds floors 1-12 display content
uvicorn backend.main:app --reload --port 8000
```

Run tests: `pytest backend/tests/`

## Database setup

Postgres only (SQLAlchemy + `psycopg2-binary`). `init_db()` (called on FastAPI
startup, `backend/core/db.py`) creates tables from the ORM models if they
don't exist — no Alembic migrations yet, so schema changes require a manual
`ALTER TABLE` or a fresh database in non-dev environments.

Required: `DATABASE_URL` (e.g. `postgresql://user:pass@host:5432/dbname`).
Optional: `REDIS_URL` (not currently read by any route — reserved for a future
rate-limit/job-queue layer).

After the database is reachable, seed floor display content once:

```bash
python -m backend.scripts.seed_floors
```

This is idempotent — re-running it updates existing rows by `floor_number`
rather than creating duplicates. Current state: floors 1-11 occupied
(Floor 11 = MindShift by Makayla), floor 12 vacant and rentable at $999/mo.

## Stripe webhook setup

1. Set `STRIPE_SECRET_KEY` (test: `sk_test_...`, live: `sk_live_...` — the
   prefix alone decides test vs. live mode, nothing else in the code does).
2. Set `STRIPE_PRICE_STARTER` / `STRIPE_PRICE_PRO` / `STRIPE_PRICE_ENTERPRISE`
   to the Stripe Price IDs for each subscription plan (see
   `scripts/setup_stripe_products.py` to create them).
3. In the Stripe dashboard (or CLI), add a webhook endpoint pointing at:
   `POST https://<deployed-host>/api/payment/webhook`
   subscribed to at minimum: `checkout.session.completed`.
4. Copy the webhook's signing secret into `STRIPE_WEBHOOK_SECRET`.
5. The same `checkout.session.completed` event is handled two ways depending
   on its metadata (`backend/api/payment.py:webhook`):
   - has `floor_application_id` → floor-rental flow: marks the
     `FloorApplication` paid, activates the `Company`/`FloorRow`, logs a
     `FloorLedgerEntry`.
   - otherwise → subscription flow: upgrades the `User.access_level` to
     `premium` and issues an `ApiKey`.

Local testing without a public URL: `stripe listen --forward-to
localhost:8000/api/payment/webhook` (Stripe CLI), or hit `/api/payment/checkout`
and `/api/floors/{n}/apply` directly with `STRIPE_SECRET_KEY` unset to confirm
they return a clean 503 rather than crashing.

## Admin panel

`GET /admin/analytics` — single-page HTML dashboard (`backend/api/admin.py`).
Prompts for an admin bearer token client-side (stored in `localStorage`),
calls `GET /api/admin/analytics/summary`. Requires a `User` row with
`access_level == "admin"`; there is no separate admin login — use the normal
`/api/auth/login` flow with an account that has been promoted to admin
directly in the database.

## Known gaps to flag before relying on this in production

- `backend/api/generate.py`: document generation runs as a FastAPI
  `BackgroundTask`, not a real job queue — it does not survive a server
  restart mid-generation.
- No Alembic migrations — schema changes to already-deployed databases need
  manual SQL.
- `backend/main.py` CORS `allow_origins` is a fixed list of empire domains;
  add any new frontend origin there before it can call this API from a
  browser.
- No live deploy target (Railway/Render project, DNS for
  `api.franciscoholdingsinc.com`, or live Stripe keys) is configured in this
  repo or this environment — provisioning those requires whoever holds those
  account credentials.
