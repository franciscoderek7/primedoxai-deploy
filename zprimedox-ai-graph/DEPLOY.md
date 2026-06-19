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
3. **Get a Redis instance** (Upstash works, free tier is fine) — required for
   LangGraph's checkpointer, which is what makes the human-approval-gate
   pause/resume work.
4. **Set real env vars** (see `.env.example`): `ANTHROPIC_API_KEY`,
   `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `REDIS_URL`.
5. **Point widgets at the deployed URL**, not `zprimedoxaihq.com` directly —
   that domain serves the Next.js static export (GitHub Pages, no server
   runtime), so it cannot run this API. Once hosted (e.g.
   `https://zprimedox-api.up.railway.app`), give that URL to Manus so the
   per-site widgets call `{API_URL}/api/v1/widget-chat`.
