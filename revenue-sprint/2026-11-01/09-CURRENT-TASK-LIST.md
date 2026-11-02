# FHI PENDING TASKS — CORRECTED
Supersedes the "PENDING FHI BUSINESS TASKS" list. Updated 2026-11-02.
Verified against primedoxai-deploy: main @ fe20af45,
claude/revenue-intake-review @ 2a4558a, MEva6 @ a267cc60.

## CLOSED — remove from the list

- **AUTH-1 Phoenix Core — DONE.** Committed to `main` as `fe20af45`
  (blob `3487608a` → `d71ca3e8`). Guarded, not commented out: `require.resolve`
  presence check, HTTP 503 when the module is absent, real errors still surface
  when it is present but broken. 5 controls + 7 endpoint checks recorded. Also:
  the lines are **21 and 93**, not 20 and ~61.
- **grok-4.7 — VERIFIED.** xAI's own API page lists it as current flagship
  (500k context, $2.00/$6.00); Google Cloud partner docs: *"For Grok 4.7, use
  `grok-4.7`."* `gpt-6-astra` verified too (OpenAI's own guides, `/v1/responses`).
- **Avatar infrastructure — TESTED.** `council-engine.js` and `avatar-lab/` are
  tracked in this repo, not Termux-only. Council suite 27/27; server served 3
  avatars; `POST /api/council` → `mode:"proposal-only"`,
  `humanApprovalRequired:true`; `{}` → 400.
- **Stripe Price IDs — NOT A BLOCKER.** Stripe is opt-in
  (`PAYMENT_PROVIDER || 'paypal'`) and the missing-ID path already fails closed
  to PayPal. With an empty map, **0 of 29 products ever construct `Stripe()`**.
  Zero real `price_` IDs exist anywhere in the repo.

## CANNOT BE DONE FROM THE REPO

- **AUTH-2 / AUTH-3 / AUTH-4.** The omniaguard stat fixes, the FHI form fixes
  and `strategy-session.html` **do not exist in this repository**. The
  fabricated stats are still in `omniaguard-site/index.html:10,14,428,429` and
  the contractual guarantee claims in `omniaguard-v3.html:6,1296,1366,1480,1591`
  across 7 files. `strategy-session.html` does not exist. Those edits are on
  Termux. **Nothing to commit.**
- **DO NOT DEPLOY EITHER SITE FROM THIS BRANCH.** `main`'s
  `payment-provider.js` has 31 `techpetcage` / 0 `derekfranciaco1`; the branch
  copy is the reverse. **The branch is the regression.** Deploying from it, or
  merging it, would overwrite the correct live payment handle.

## CORRECTIONS TO FACTS ON THE OLD LIST

| Old list said | Actual |
|---|---|
| 38 workflows, 27 armed on MEva6 | **39 workflows, 26 armed** |
| Formspree placeholder "in PrimeDox exit-intent, line 1374" | **23 files, 48 occurrences.** `primedoxai-site/index.html:1374` is one of 13 real-form files |
| "forms silently fail until FormSubmit activation" | **Formspree ≠ FormSubmit.co.** AUTH-5 activates one service; the placeholders are the other. Two contact forms already work via mailto |
| "AUTH-3+4+5 complete the loop to $1,000" | They do not. See the revenue section |
| "PrimeDox Pro $49/mo PayPal link is live, no form needed" | `primedox-pro` is **wired in HTML but absent from the price map and carries no amount** → opens an amountless PayPal page |

## DO FIRST — two browser checks, no terminal

1. **Open `https://paypal.me/techpetcage`.** Confirm it resolves to the right
   account. Six sellable products depend on it and it has never been tested.
2. **Stripe Dashboard → Developers → API keys.** Confirm the `rk_live_`
   restricted key is gone or rolled. `empire-progress-report.html:709` has
   carried this as P1/CRITICAL since before this work; nothing records it was
   ever done. **The only confirmed credential exposure.**

## CRITICAL SECURITY — unremediated

- **S1. The human-approval gate can be bypassed by anyone.**
  `zprimedox-ai-graph/app/main.py` has **10 routes and zero authentication**.
  `POST /run/{thread_id}/resume` takes a client-supplied `approved_by`, and
  `human_gate.py:115` defaults it to `"Derek Francisco"`. `deliver.py:49` then
  writes the document to Supabase with that approver in its metadata. **Anyone
  reachable can forge an approval attributed to you.** CORS is not an access
  control here.
- **S2. Redis published with no password.** `zprimedox-ai-graph/docker-compose.yml:28`
  and `infra/docker/docker-compose.yml:17` both publish `"6379:6379"` (binds
  `0.0.0.0`, bypasses host firewalls). `infra/docker` also publishes Postgres
  `5432` with `primedox:primedox`. Both set `ENVIRONMENT=production`. Redis is
  the LangGraph checkpoint store — a **second path to S1**.
- **S3. `/chat` and `/run` invoke Anthropic with no auth and no rate limit.**
  The limiter exists but is applied only to `/widget-chat`. Unmetered spend.

**Action: take `zprimedox-ai-graph` off any reachable network until fixed.**
`docker compose down`, then bind to loopback: `"127.0.0.1:8000:8000"`,
`"127.0.0.1:6379:6379"`.

## REVENUE — the real blocker, and the real route

**20 checkout buttons exist. Zero carry `data-paypal-amount`.** 6 are saved by
the price map. **14 open an amountless PayPal page — the customer must guess
the price:** `vva-scout-99`, `vva-fleet-499`, `vva-enterprise-2500`,
`ccldr-live-97`, `ccldr-masterclass-497`, `ccldr-blueprint-1997`,
`weedlaw-course-79`, `weedlaw-certification-199`, `weedlaw-partnership-499`,
`weedlaw-whitelabel-999`, `primedox-pro`, `primedox-elite`,
`primedox-enterprise`, `primedox-swarm`.

**Shortest route to $1,000 is NOT the strategy session** (no page exists, and
deploying it from this branch regresses the handle). **Six CCLDR products
already take money correctly** via the CDN: Digital $99, Foundation $149,
Course $299, Practitioner $499, Sovereignty $999, Elite $1,499. **Two
Practitioner sales = $998. One Elite = $1,499. No code change.**
The constraint there is **delivery** — whether the material can actually be
handed over. Unverifiable from the repo.

**Verified revenue to date: $0.00.**

## FORMS THAT ACTIVELY MISLEAD

- `primedoxai-site/pricing.html:1853` — **unguarded** `fetch` POSTs the
  visitor's email and free-text "situation" to `formspree.io/f/YOUR_FORM_ID`,
  swallows the failure, shows success.
- `canadian-cannabis-consulting-site/index.html:524` — *"✓ Checklist on its way!
  Check your inbox within 5 minutes"* while sending nothing.
- **9 sites'** Apex exit-intent popups write the lead to the **visitor's own**
  `localStorage` and transmit nothing.
- `ccldr-site/membership.html:466` and `:581` — live "Email to Book →" button
  points at `docweedla@gmail.com`, **missing the `w`**. A prior commit claimed
  this was fixed; two occurrences remain.
- `francisco-holdings-site/francisco-holdings-expanded.html` uses the
  cannabis-only `docweedlaw@gmail.com` as the **Interac payment destination**
  (`:754`, `:780`, `:1542`) and receipt inbox (`:789`) — against your own
  routing rule.

## ALSO STALE AND LIVE

**CCLDR has not deployed since 2026-07-12.** Every push since fails on one
line: `ccldr-site/index.html:756` → an `OMNIAGUARD` footer link tripping the
zero-bleed gate. Consequence: the live pricing page shows *"✅ Stripe LIVE. All
payment methods active"* at `:1073` while `:1069` says `STRIPE_LIVE = false`
and `:1474` says *"Stripe temporarily unavailable"* — plus an uncommented
`Stripe(STRIPE_PK)` at `:1068` with the library commented out at `:1067`, so it
throws. The fix is already written and stuck behind that one link.

## STILL GENUINELY OPEN

- `scripts/wire-formspree.sh` exists but misses 6 sites (francisco-holdings,
  omniaguard, vault-velocity, zprimedoxaihq, canadian-cannabis, mindshift).
- `shared/lead-capture/fhi-intake.js:32` `ENDPOINT: ''` — the $249 assessment
  captures nothing (honestly; it shows a visible notice).
- **CAD or USD never chosen.** `revenue-sprint/2026-10-28/` says "$249 CAD" five
  times and "$249 USD" five times. Cannot go to a customer in that state.
- `deploy-safety.test.js` passes 9/9 and is **never run by CI**. Cheapest fix.
- `payment-provider.js:130` — `amount >= 100 ? 'subscription' : 'payment'`
  infers billing type from price. Fix before adding any Stripe Price ID.
- Both model providers are implemented but **wired to no router**.
- Supabase idempotency RPC migration: **does not exist in this repo**.
- 17 held working-tree changes uncommitted, including the C3 `council-engine.js`
  patch you put on HOLD.
