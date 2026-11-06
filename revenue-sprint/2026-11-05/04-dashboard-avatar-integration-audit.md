# FHI — DASHBOARD AND AVATAR INTEGRATION AUDIT

Date: 2026-11-05 · Mode: **read-only**
Repository inspected: `franciscoderek7/primedoxai-deploy` @ `claude/revenue-intake-review` `056ac19`
(`~/fhi-main-containment` is not reachable from this session — fourth package to cite it)

**Nothing was modified, started, installed, committed, pushed or deployed.** No
model request was issued. All 17 held working-tree changes are untouched and C3
remains on HOLD.

---

## 1. BEST EXISTING DASHBOARD CANDIDATE

> **`command-center/living-empire/intelligence/avatar-lab/`** — titled
> **"FHI Executive War Room"**.

It wins on one decisive fact: **it is the only dashboard in the repository that
actually talks to a backend.**

Measured across all four surviving dashboard candidates:

| File | `fetch(` calls |
|---|---|
| `claude-empire-dashboard.html` | **0** |
| `empire-status-dashboard.html` | **0** |
| `francisco-holdings-site/empire-dashboard.html` | **0** |
| `zprimedoxaihq-site/revenue-dashboard.html` | **0** |
| **`avatar-lab/index.html`** | **2** — `/api/avatars`, `/api/council` |

Everything else is a static picture. `avatar-lab` is 222 lines, binds
**loopback only**, and its server enforces the approval gate **server-side** —
verified by running it: `GET /api/avatars` → 200 with 3 avatars,
`POST /api/council` → 200 with `mode:"proposal-only"` and
`humanApprovalRequired:true`, `POST /api/council {}` → **400**.

**Build the 10 panels around it. Do not start a new dashboard.**

### Files named in the assignment that do not exist here

`agents/backend/council-interface.html`, `docs/dashboard.html`,
`agents/backend/green-blast-real-council.js` — **absent**.
`phoenix-core/api/server.js` — **absent from this branch**; it exists on `main`.
**There is no `START.sh` anywhere in the repository.**

---

## 2. DASHBOARD COMPARISON

| | **avatar-lab/index.html** | **francisco-holdings-site/empire-dashboard.html** | **claude-empire-dashboard.html** | **empire-status-dashboard.html** | **zprimedoxaihq revenue-dashboard.html** |
|---|---|---|---|---|---|
| **Purpose** | Executive War Room — put a question to the council | "Empire Dashboard" / Command Center | "Empire Command Center \| Phoenix Dominion" | "⚡ Empire Status Dashboard" | Sales log |
| **Lines** | 222 | 965 | 550 | 363 | 265 |
| **Panels** | 2 functional areas | ~31 card elements | ~5 | ~8 | ~8 |
| **Visual design** | Plain, functional | Most developed | Themed | Status list | Simple table |
| **Interactive controls** | **Real** — submit a question, render the response | password gate + nav; **no data controls** | none | none | add / reset sales |
| **Backend API** | **`/api/avatars`, `/api/council`** | **none** | **none** | **none** | **none** |
| **Authentication** | none in the page; **server-side gate on the API** | **`const PW = '<REDACTED — see the file>'` in client JS** ⚠ | none | none | none |
| **Data** | **Real** — from the live engine | **Hardcoded** (`>$0`) + 4 × `localStorage` | Hardcoded | Hardcoded | **`localStorage`** — hand-typed |
| **Reusable?** | **YES — foundation** | **Yes, as shell/CSS only** | Visual reference | Visual reference | No |
| **Exposure** | **Local-only** (`127.0.0.1`) | **PUBLIC** — ships to franciscoholdingsinc.com | public (repo root) | public (repo root) | public (site folder) |

### 🔴 CRITICAL — the Command Center password is published in plain text

`francisco-holdings-site/empire-dashboard.html:579`

```js
const PW = '<REDACTED — see the file>';
```

Client-side JavaScript. `deploy-francisco-holdings.yml` watches
`francisco-holdings-site/**`, so **this page ships to franciscoholdingsinc.com
and anyone can read the password with View Source.** The gate is decorative.

A repo-wide scan of every deployed site folder for this pattern found
**exactly one** occurrence — this file. It is contained, and it is live.

`agents/access-guard.js` (CDN-served from `@main` to 6 pages, and loaded by this
page at `:312`) compares `val === cfg.code`, taking the code from config the
**calling page** supplies — which is how the secret ends up in page source. It
does implement lockout and session keys, so it is not worthless, but
**client-side comparison cannot gate anything from a determined visitor.**

---

## 3. AVATAR INTEGRATION STATUS

| | Phoenix Core | SoulStack | PrimeDox | Vigilax |
|---|---|---|---|---|
| Identity definition | **Real** — `agent-registry.js`, `empire-manifest.json` | **Real** — `avatars/soulstack.json` | **Real** — `avatars/primedox.json` | **Real** — `avatars/vigilax.json` |
| Model connection | n/a (orchestrator) | **NONE** | **NONE** | **NONE** |
| Model routing | — | built, **unwired** | built, **unwired** | built, **unwired** |
| Council orchestration | — | **Real** — `council-engine.js` | **Real** | **Real** |
| API endpoints | `phoenix-core/routes/*` (on `main`) | `POST /api/council` | same | same |
| Approval requirement | **enforced** | **enforced** | **enforced** | **enforced** |
| Task persistence | — | **Real** — JSON case file, mode `0600` | Real | Real |
| Memory | **NONE** | **NONE** | **NONE** | **NONE** |
| Error handling | — | **Good** — degrades to `aiRuntimeStatus: ERROR` without crashing | same | same |

**Real vs mock — the distinction that matters.** The council is **real
orchestration with no model behind it.** With no `ANTHROPIC_API_KEY` and no
Anthropic SDK installed, `council-engine.js:105` lazily requires `ai-runtime`,
the require throws, and the engine records honestly:

```
councilPipelineStage: INTAKE          (NOT SPECIALIST_ANALYSIS)
aiRuntimeStatus:      ERROR
aiRuntimeError:       "AI runtime unavailable"
verification:         null
specialistAnalysis:   {total:3, complete:0, missing:3,
                       basis:"structural_response_acceptance"}
all five authority flags: false
```

**That is not a mock. It is a real system correctly reporting that it got no
analysis.** The distinction is important: a mock would have returned plausible
text. This returns `[Analysis pending human review]` and refuses to advance the
pipeline stage. Verified by execution, plus `node --test
council-lifecycle.test.js` → **27 pass / 0 fail**.

`openai-provider.js` (`gpt-6-astra`) and `xai-provider.js` (`grok-4.7`) are both
implemented, opt-in via `FHI_MODEL_PROVIDER`, `humanApprovalRequired: true`,
`mode: analysis-only` — and **wired to no router.** Both model IDs verified
against vendor documentation.

**No live model request was issued.** Green Blast and DreamCore have **no code
here at all.**

### One API-shape defect blocking panel 8

`avatar-lab/server.js:33-57` runs the engine via
`execFile(process.execPath, [ENGINE, question])` and returns
`{output: stdout.trim(), stderr: stderr.trim()}`. So the HTTP response carries
**the engine's ASCII console banner**, not the proposal. A panel **cannot read**
`councilPipelineStage`, `aiRuntimeStatus`, `specialistAnalysis` or
`verification` as fields — it would have to scrape text. Confirmed: those keys
are absent from the HTTP response while present in the on-disk case file.

**This is how unverified numbers end up hand-typed into dashboards.** Smallest
fix: `council-engine.js` already `module.exports`es `createCouncilCase`, which
returns `{output, proposal}` — have the server `require` it directly instead of
shelling out.

---

## 4. EXISTING BACKEND / API MAP

| Backend | Binds | Auth | Rate limit | Routes | Verdict |
|---|---|---|---|---|---|
| **`vigilax-backend/server.js`** (473 lines) | — | **`requireApiKey` on every sensitive route**, keys from `VIGILAX_API_KEYS`/`ADMIN_SECRET` | **two limiters** (30/min general, 10/min scan) | `/health`, `/api/industries*` public; 11 scan/evidence/alert/connector routes **all key-gated**; `helmet`; CORS allow-list | **BEST-ENGINEERED BACKEND IN THE REPOSITORY.** 6 rule-based fraud engines, no live AI calls, WebSocket `/ws/alerts` |
| **`avatar-lab/server.js`** | **`127.0.0.1` only** (`:12`, `:157`) | none on the API, but **authority gate enforced server-side** | none | `GET /api/avatars`, `POST /api/council` | **Verified working. Foundation candidate.** `GET /api/chat` → 404 (does not exist) |
| **`agents/backend/server.js`** (185 lines) | **all interfaces** — `app.listen(PORT)`, no host, port 3001 ⚠ | 2 references | — | registers the **real PayPal payment pipeline** (`:181-182`) | **Real and valuable, but must not be exposed as-is.** Webhook verification **fails open** (`paypal-service.js:106`) |
| `phoenix-core/*` (on `main` only) | — | none | — | `/api/agents`, `/api/control`, `/api/command`, `/api/execute`, `/api/services*`, `/api/tasks` | Static registry; `/api/command:22` reports `executed_by: "Phoenix Core"` **for work never performed**; `/api/services/register` → 500 |
| `zprimedox-ai-graph/app/main.py` | — | **ZERO on all 10 routes** ❌ | only `/widget-chat` | incl. `POST /run/{id}/resume` taking a client-supplied `approved_by` defaulting to `"Derek Francisco"` | **Do not expose. Critical.** |

**Governance artifact worth keeping:** `command-center/living-empire/empire-manifest.json` declares

```json
"authority": { "aiMayPropose": true,
               "aiMayExecuteConsequentialActions": false,
               "humanApprovalRequired": true }
```

That is the right shape and should be the panel framework's single source of
authority truth.

---

## 5. TEN-PANEL REUSE ARCHITECTURE

**Foundation: `avatar-lab/` — extend its server with one route per panel.** It
already binds loopback, already enforces authority server-side, and is the only
proven client↔server pair.

| # | Panel | Reuse | Work needed | Data available today? |
|---|---|---|---|---|
| 1 | Executive Overview | `empire-manifest.json` for the floor map; `empire-dashboard.html` CSS **only** | aggregate the other nine | **No** — nothing to aggregate yet |
| 2 | Phoenix Core | `phoenix-core/routes/dashboard.js` (`main`) | fix the static registry first | **No** — static objects |
| 3 | SoulStack | `avatars/soulstack.json` + council | needs an API key | Identity yes, analysis no |
| 4 | PrimeDox | `avatars/primedox.json` + council | same | same |
| 5 | **Vigilax** | **`vigilax-backend` — 11 key-gated routes + `/ws/alerts`** | thin read-only client | **YES — the only panel with a real, secured data source** |
| 6 | Green Blast Revenue | `agents/backend/paypal-service.js` → Supabase `subscribers` | §6 below | **Only if `agents/backend` is deployed** |
| 7 | DreamCore | — | **nothing exists** | No |
| 8 | **AI Council & Approvals** | **`avatar-lab` itself** | fix the `/api/council` response shape (§3) | **YES, once that is fixed** |
| 9 | Research / Competitor Intel | — | **nothing exists** — plans only, no scanner, no scheduled job | No |
| 10 | Security & System Health | `vigilax-backend/health`; **not** `omniaguard-site/threat-dashboard.html` | real health probes | Partial |

### Build order — and the thing not to do

**Panels 8 then 5 first.** Both have real, secured backends today. Everything
else waits on a data source.

**Do not build the holographic shell first.** Eight of ten panels have no data
source, and a convincing shell over absent data is precisely how
`omniaguard.com`'s live pages ended up randomising numbers on a `setInterval`
and presenting them as real telemetry. **Every panel must render an explicit
`NO DATA` state rather than a plausible number.**

---

## 6. REVENUE DASHBOARD INTEGRATION PLAN

### Do the existing figures represent real transactions?

**No. None of the three does.**

| Dashboard | Figures are | Evidence |
|---|---|---|
| `zprimedoxaihq-site/revenue-dashboard.html` | **hand-typed, stored in the viewer's own browser** | `:169` `JSON.parse(localStorage.getItem(KEY)` · `:173` `setItem` · `:242` reset |
| `nightingale-console/nightingale-revenue.html` | **hand-typed `localStorage`** | `:381`/`:384` same pattern |
| `revenue-dashboard/revenue-v2.html` | **live Stripe, only if a secret key is pasted into the browser** — plus hardcoded demo values | `:341` `sk-input` · `:592` `fetch('https://api.stripe.com'…)` · `:434-446` cash 25000, burn 3200, MRR 2400, growth 15 |

So: not transactions, not even checkout attempts — **operator-entered numbers**.
Any panel built on them would display whatever someone last typed.

`revenue-v2.html:345` also assures the user the key "is never transmitted to
third parties, stored in localStorage, or logged" while `:592` transmits it to
`api.stripe.com`. Stripe is the key's own issuer so this is not a leak to an
unrelated party, but the sentence as written is misleading and the page should
not be used with a live key.

### The correct source already exists

`agents/backend/paypal-service.js:161-170` upserts every **completed** capture
into Supabase `subscribers`: `email`, `plan`, `paypal_order_id`,
`paypal_payer_id`, `amount_cad`, `currency`, `paid_at`, `trial_expires`,
`active`. **That is a real transaction ledger.**

### Integration without exposing customers or credentials

1. **Panel 6 never talks to PayPal, Stripe or Supabase directly.** It calls one
   new route on `avatar-lab/server.js`: `GET /api/revenue/summary`.
2. **That route returns aggregates only** — count of paid subscribers, sum by
   currency, first and most recent `paid_at`. **No email, no payer ID, no order
   ID, no row-level data.** Customer information never reaches the browser.
3. **The Supabase service key stays server-side**, read from
   `SUPABASE_SERVICE_KEY` in the environment. It is never sent to the client —
   the opposite of the `revenue-v2.html` pattern.
4. **No Stripe secret key is ever accepted by a browser.** Retire
   `revenue-v2.html`'s key-entry path rather than port it.
5. **Fail honest:** when `SUPABASE_URL`/`SUPABASE_SERVICE_KEY` are unset, the
   route returns `{status:"not_configured"}` and the panel renders
   **"NO DATA — payment ledger not connected"**. It must never render `$0` as
   though zero were a measurement.
6. **Prerequisite:** this is worth nothing until `agents/backend` is deployed —
   and it must not be deployed before the webhook fails closed
   (`paypal-service.js:106`) and the bind is restricted
   (`server.js:185`).

**Current verified revenue: $0.00.** No transaction exists in any ledger.

---

## 7. SECURITY AND GOVERNANCE GAPS

| Sev | Gap | Location |
|---|---|---|
| **CRITICAL** | **Command Center password in published client JS** — `const PW = '<REDACTED — see the file>'`, on a page that ships to franciscoholdingsinc.com | `francisco-holdings-site/empire-dashboard.html:579` |
| **CRITICAL** | PayPal **webhook verification fails open** when `PAYPAL_WEBHOOK_ID` is unset (the default) | `agents/backend/paypal-service.js:106` |
| **CRITICAL** | 10 routes, **zero authentication**; `approved_by` from the request body, defaulting to the owner's name, written to Supabase as the audit record | `zprimedox-ai-graph/app/main.py`, `nodes/human_gate.py:115` |
| **HIGH** | Payment backend **binds all interfaces** | `agents/backend/server.js:185` |
| **HIGH** | **Client-side auth is the only gate** on every dashboard. Server-side authorization exists in `vigilax-backend` and `avatar-lab` — and nowhere in the dashboards | all 4 dashboards |
| **MEDIUM** | `/api/command` claims `executed_by: "Phoenix Core"` for work never performed — a corrupted audit field | `phoenix-core/routes/control.js:22` |
| **MEDIUM** | Dashboards show hardcoded and `localStorage` figures with **no "unverified" marking** | all 4 |
| **MEDIUM** | 6 pages load `access-guard.js` from jsDelivr `@main` — a push to `main` changes the gate on all of them, with no workflow and no review | `agents/access-guard.js` |
| **LOW** | No `START.sh`; no single entry point; four backends started independently | repo-wide |

**Governance strengths worth preserving:** `empire-manifest.json`'s authority
block; `council-engine.js:92-96` setting authority flags **before** the AI call;
`avatar-lab` binding loopback; `vigilax-backend`'s `requireApiKey` + dual rate
limiters; `paypal-service.js` taking every credential from the environment and
defaulting to **sandbox**.

---

## 8. FIVE HIGHEST-PRIORITY NEXT ACTIONS

1. **Rotate **the exposed gate credential** and stop shipping it in page source.** It is readable
   today at franciscoholdingsinc.com via View Source. Treat it as compromised.
   A real gate needs server-side verification; until then, the page should not
   imply it is protected.
2. **Fix `avatar-lab/server.js` to return the proposal, not console text.** One
   change, and it unblocks panel 8 — the only panel with a working backend and a
   server-side approval gate.
3. **Build panels 8 and 5 only.** `avatar-lab` and `vigilax-backend` are the two
   real data sources. **Every other panel renders `NO DATA` until it has one.**
4. **Decide on `agents/backend`.** Panel 6 and all real revenue reporting depend
   on it. If yes: fail the webhook closed and bind to loopback **first**.
5. **Set `ANTHROPIC_API_KEY` and install the SDK** in `council/` if you want
   panels 3 and 4 to show analysis rather than `[Analysis pending human
   review]`. Until then nobody should say the council produces executive
   analysis — what is verified is that it produces a proposal and **records
   honestly that it got none.**

---

## INTEGRITY

Commit inspected: `056ac19` on `claude/revenue-intake-review`. Files modified:
**none**. Services started: **none**. Dependencies installed: **none**. Model
requests issued: **none**. Committed / pushed / merged / deployed: **nothing**.
17 held working-tree changes preserved; C3 on HOLD. One new file written: this
report.
