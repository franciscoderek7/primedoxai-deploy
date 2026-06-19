# zPrimeDox AI HQ backend — what's real, what's needed to go live

This is the actual "central brain" backend: FastAPI + LangGraph, Claude-powered,
Supabase-backed. It already existed before this update; this note documents
what was added and what Derek needs to do to put it online.

## What's real

- `/api/v1/run`, `/run/{id}`, `/pending/{id}`, `/run/{id}/resume` — the
  document-drafting workflow (legal/cyber/safety/business) with a human
  approval gate. This is the heavy path: intake → research → draft → review
  → human gate → deliver. Use it for things like CCLDR document generation.
- `/api/v1/widget-chat` (added) — the lightweight endpoint the per-site chat
  widgets call. One Claude call with a persona system prompt, logged to the
  new `widget_messages` table. No LangGraph state machine, no human gate.
- `/api/v1/report` (added) — real aggregate counts (conversations by site/
  persona, escalation flags, document-workflow outcomes) pulled straight from
  Supabase. Not a generated summary, not predictive.
- `app/personas.py` (added) — the 10 named personas (EmpireMind,
  OrbitalDefense, LegalWeed, PrimeBuilder, VelocityBot, PetGuardian,
  BonsaiMind, VigilanceCore, TimeWeaver, SoulArchitect) and their system
  prompts.

## What's marketing language, not implemented

- "Digital consciousness," "autonomous decisions," "learns and gets smarter
  over time," "patentable AI" — none of this is literally built. Every
  persona is a Claude API call with a custom system prompt. `"learned": true`
  in the widget-chat response means the turn was written to Supabase for
  human review — no model retraining happens anywhere in this stack.
- There is no cross-site "swarm" intelligence beyond: same backend, same
  Supabase project, shared by all sites' widgets.

## To actually go live, Derek needs to:

1. **Pick a host** for this Python service — Railway, Render, or Fly all work
   with the included `Dockerfile`. (`primedox-ai-backend/` already has a
   `railway.toml` for a similar, simpler FastAPI service — same idea here.)
   No deploy workflow exists yet for this folder because there's no hosting
   account/credentials to deploy to.
2. **Create a Supabase project** and run the migrations in
   `supabase/migrations/` (001 likely already applied if `sessions` exists;
   002 and 003 add the memory graph and widget logging tables).
3. **Get a Redis Stack instance — NOT plain Upstash Redis** (corrected during
   backend testing; this note previously said Upstash works, it doesn't —
   see the Redis Cloud step below). Required for LangGraph's checkpointer,
   which is what makes the human-approval-gate pause/resume work.
4. **Set real env vars** (see `.env.example`): `ANTHROPIC_API_KEY`,
   `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `REDIS_URL`.
5. **Point widgets at the deployed URL**, not `zprimedoxaihq.com` directly —
   that domain serves the Next.js static export (GitHub Pages, no server
   runtime), so it cannot run this API. Once hosted (e.g.
   `https://zprimedox-api.up.railway.app`), give that URL to Manus so the
   per-site widgets call `{API_URL}/api/v1/widget-chat`.

---

## Step-by-step: Railway + Supabase + Redis + Anthropic

Exact click-path, in the order that avoids redoing steps.

### 1. Anthropic API key (5 min)
1. Go to console.anthropic.com → Settings → API Keys → Create Key.
2. Copy it (`sk-ant-...`). You'll paste it into Railway in step 4 — don't
   commit it to git, ever (it's already gitignored via `.env`).

### 2. Supabase project (10 min)
1. supabase.com → New Project. Pick any region close to your Railway region.
2. Once provisioned, open SQL Editor and run, in order:
   - `supabase/migrations/001_*.sql` (creates `sessions` — skip if it already
     exists from an earlier setup)
   - `supabase/migrations/002_*.sql` (memory graph: `memory_nodes`,
     `memory_edges`, pgvector)
   - `supabase/migrations/003_widget_messages.sql` (widget chat logging)
3. Settings → API → copy the **Project URL** and the **service_role** key
   (not the `anon` key — the backend needs service-role to bypass RLS).

### 3. Redis — must be Redis Stack, not plain Redis (10 min)

**Found and fixed during backend testing (2026-06-19): this library needs
more than plain Redis.** `langgraph.checkpoint.redis.RedisSaver` (the
package `langgraph-checkpoint-redis`, used in `app/graphs/router.py`) calls
`FT.CREATE` / `FT._LIST` under the hood to index checkpoints — those are
RediSearch module commands. I spun up a plain `redis-server` locally to test
`/api/v1/run` end-to-end and it failed with
`redis.exceptions.ResponseError: unknown command 'FT._LIST'`. **Upstash's
standard Redis product does not bundle RediSearch**, so the original
"Upstash works, free tier is fine" line in this doc was wrong — don't use
plain Upstash Redis for `REDIS_URL` here, the human-approval-gate workflow
(`/api/v1/run` and everything under it) will fail on the first request.

What does work:
1. **Redis Cloud** (redis.io/try-free) — the free tier explicitly bundles
   Redis Stack (RedisJSON + RediSearch), which is what this checkpointer
   needs. Create a free database, copy the connection string shown
   (`redis://default:PASSWORD@HOST:PORT`) — that's `REDIS_URL`.
2. Alternative: self-host `redis/redis-stack-server` as a second container
   alongside this service on Railway/Fly (Railway supports deploying an
   extra service from a Docker image directly) if you'd rather not add
   another vendor account.
3. If Redis 8.0+ becomes available from a managed provider you're using —
   Redis 8 bundles JSON/Search support by default, so plain "Redis 8" would
   also satisfy this requirement without needing the separate Stack image.

Whichever you pick, the `widget-chat` and `/health` paths don't touch Redis
at all — only `/api/v1/run` (the document-drafting human-gate workflow)
needs it. If you only care about the chat widgets right now, you can deploy
without this step and fix it later; `/health` will report `redis:
unreachable` until then but `widget-chat` still works.

### 4. Railway deploy (10 min)
1. railway.app → New Project → Deploy from GitHub repo → pick
   `franciscoderek7/primedoxai-deploy`, set the **root directory** to
   `zprimedox-ai-graph` (Railway needs this since the repo has multiple
   services in it).
2. Railway auto-detects the `Dockerfile`. Leave build settings default.
3. Variables tab → add: `ANTHROPIC_API_KEY`, `SUPABASE_URL`,
   `SUPABASE_SERVICE_KEY`, `REDIS_URL` (the three values from steps 1-3),
   plus optionally `LOG_LEVEL=INFO` and `WIDGET_RATE_LIMIT_PER_MINUTE=12`.
4. Settings → Networking → Generate Domain (gives you a
   `*.up.railway.app` URL). Deploy.
5. Confirm it's actually live: `curl https://<your-app>.up.railway.app/health`
   should return `"status": "online"` with all three components `"ok"` (or
   `"configured"` for anthropic — see Monitoring section below for what each
   status value means).

### 5. Point the widgets at it
Give the Railway URL to Manus (or set it directly in each site's widget
config) as `API_URL`, so the embeddable widget calls
`{API_URL}/api/v1/widget-chat`.

---

## Backend hardening (added)

- **Structured logging** (`app/logging_config.py`) — every log line is a
  single JSON object on stdout (timestamp, level, logger, message, plus any
  extra fields like `site` or `error`). Railway/Render/Fly all capture stdout
  automatically; this just makes those logs filterable instead of free text.
  Set verbosity with `LOG_LEVEL` (`INFO` default, `DEBUG` for troubleshooting).
- **Error handling**:
  - Missing `ANTHROPIC_API_KEY` no longer causes a generic crash — `/widget-chat`
    and `/run` return a clean `503` with a message telling you to set it,
    instead of a raw stack trace.
  - Any unhandled exception anywhere in the app is caught by a global handler,
    logged with full traceback server-side, and returns a generic `500` to the
    caller — no internal stack traces or secrets leak into API responses.
  - Supabase being unreachable degrades widget-chat gracefully (`"learned":
    false` in the response) instead of failing the chat reply — logging is
    best-effort, the user-facing AI response is not.
- **Rate limiting** — `/api/v1/widget-chat` allows `WIDGET_RATE_LIMIT_PER_MINUTE`
  requests per minute per `(site, visitor_id)` pair (default 12), returning
  `429` with a `Retry-After` header past that. It's an in-memory sliding
  window (`app/services/rate_limit.py`) — correct for the single-instance
  Railway deploy described above. If this ever scales to multiple replicas,
  swap it for the Redis instance already provisioned for the LangGraph
  checkpointer so the limit is shared across instances instead of per-process.

## Bugs found and fixed by actually running this (2026-06-19)

I installed the real dependencies and ran the FastAPI app locally (with a
local Redis and no real Supabase/Anthropic credentials) to verify the
endpoints instead of just reading the code. Two real bugs surfaced that
would have broken production:

1. **`requirements.txt` was missing `langgraph-checkpoint-redis`.** The code
   imports `from langgraph.checkpoint.redis import RedisSaver`
   (`app/graphs/router.py`) but that package was never listed as a
   dependency — `pip install -r requirements.txt` alone would not have
   installed it, and the container would crash on the first `/api/v1/run`
   call. Fixed: added to `requirements.txt`.
2. **The Redis checkpointer was never actually usable.** `RedisSaver.from_conn_string()`
   returns a Python context manager, not a ready-to-use saver — the old code
   passed the unentered context manager straight into `.compile(checkpointer=...)`,
   which raises `TypeError: Invalid checkpointer provided`. Every single call
   to `/api/v1/run` would have failed, even with Redis fully configured and
   reachable. Fixed in `app/graphs/router.py`: the context is now entered
   once and the saver kept open for the app's lifetime, which is the
   library's intended usage pattern.
3. **(Documented above, not a code bug)** Upstash's plain Redis doesn't
   support the RediSearch commands this checkpointer needs — see step 3 of
   the deploy walkthrough.

### What's been verified vs. what still needs real credentials
Verified locally (no real API keys, just code-path correctness):
`/health` reports accurate per-component status and the right HTTP code,
`/`, `/api/v1/report`, `/api/v1/runs` degrade cleanly without Supabase,
`/api/v1/widget-chat` returns a clean `503` (not a crash) with no Anthropic
key configured, the rate limiter correctly returns `429` after the
configured threshold, and `/api/v1/run` reaches the LangGraph checkpoint
step successfully against a real local Redis (fails only on the `FT.*`
RediSearch commands a plain Redis lacks, confirming bug #3 above and not a
remaining code issue).

**Not yet verified — needs the real deployed stack:** an actual Claude
response from `/widget-chat`/`/run` (needs a real `ANTHROPIC_API_KEY`),
Supabase writes actually persisting (needs a real Supabase project +
migrations run), and the full human-gate pause/resume cycle end-to-end
(needs the Redis Stack instance from step 3, not plain Redis). Once
deployed with real credentials, the fastest check is: `curl .../health`
should show all three components `ok`/`configured`, then a real
`POST /api/v1/widget-chat` call should return an actual Claude reply instead
of a `503`.

## Monitoring — alerting if the backend goes down

`/health` is built for this: it actively checks Anthropic config, Supabase
reachability, and Redis reachability, and returns HTTP **503** (not 200) the
moment a component the live workflows depend on (Anthropic key, Redis) is
down — so a plain "alert on non-200" uptime monitor is all you need, no
custom JSON parsing required.

1. Sign up for UptimeRobot (free tier — 50 monitors, 5-minute checks) or
   Better Uptime / Healthchecks.io if you prefer.
2. Add an **HTTP(s) monitor** pointed at
   `https://<your-app>.up.railway.app/health`, check interval 5 minutes.
3. Set "alert when status is not 200" (UptimeRobot does this by default for
   HTTP monitors). Add your phone number/email for SMS/email alerts.
4. Optional: a second monitor on `/` (the root route) catches the case where
   the whole process is down rather than just a dependency.

`status` values in the `/health` body, if you want to read it directly:
- `"online"` — everything's configured and reachable.
- `"degraded"` (still HTTP 200) — Supabase is unreachable/unconfigured, so
  logging and `/report` will be incomplete, but AI replies still work.
- `"down"` (HTTP 503) — Anthropic key missing or Redis unreachable; the core
  workflows (widget-chat, document drafting) cannot function.
