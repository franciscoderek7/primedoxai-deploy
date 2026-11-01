# FHI SPRINT 2 + EMERGENCY SPRINT — STATUS REPORT

Date: 2026-11-01
Branch the working tree is on: `claude/revenue-intake-review` (HEAD `69aa969`)
Designated development branch: `claude/francisco-revenue-sprint-MEva6` (tip `8f3a624`) — **diverged, see §4**

**Nothing was committed, pushed, merged or deployed. No credential, payment
setting or account was touched. No email or message was sent. No money was
spent.** Every file produced in this sprint is a report under
`revenue-sprint/2026-11-01/`.

---

## 1. STATUS BY TASK

### Emergency Sprint, in the order the brief gave

| # | Task | Status | Where |
|---|------|--------|-------|
| **1** | Confirmed credential exposure | **PASS** | `01-credential-exposure-report.md` |
| **2** | Phoenix Core startup dependency | **PASS (diagnosed) / BLOCKED (fix)** | `02-phoenix-core-startup-diagnosis.md` |
| **3** | Three-site readiness | **PASS** | `05-three-site-readiness-matrix.md` |
| **4** | Avatar + council verification | **PARTIAL** | `03-avatar-council-capability-matrix.md` |
| **5** | 10-panel founder dashboard | **NOT STARTED** | §3 |
| **6** | Deployment manifest + checklist | **PASS** | `04-deployment-manifest.md` |
| **7** | First-$1,000 plan per offer | **PARTIAL** | §2 |

### Sprint 2 workstreams

| | Workstream | Status | Maps to |
|---|---|---|---|
| **A** | Avatar + council behaviour | **PARTIAL** | task 4 |
| **B** | Founder dashboard | **NOT STARTED** | task 5 |
| **C** | Site readiness | **PASS** | task 3 |
| **D** | Deployment safety | **PASS** | task 6 |
| **E** | Revenue plan | **PARTIAL** | task 7 |

---

## 2. HEADLINE RESULTS

### Task 1 — credential exposure: **no confirmed exposure**

`revenue-dashboard/index.html:398` is `let SK = '';` — an **empty string**
(length 0). It is not a placeholder for a key, not a test secret, not a live
secret. There is no committed credential. Across the working tree and all 45
commits of history, entropy-requiring scans for `sk_live_`, `sk_test_`,
`rk_live_`, `whsec_`, `ghp_`, `AKIA`, `AIza` return **zero**.
`primedox-mvp/.env.local` is tracked but holds 2 URLs and 8 dummy values.

Two things I will not let that conclusion imply:

- **A text scan finding no key is weak evidence.** It does not cover the Termux
  copy, other repositories, environment variables, GitHub Actions secrets,
  runtime memory, or any credential without a recognisable prefix. §5 of that
  report lists this in full. **I am not telling you the system is secure.**
- **There is a real architectural defect.** That page is *designed* to take a
  live `sk_live_…` Stripe secret key into browser JavaScript and send it to
  `api.stripe.com` from the client. That conflicts with your own rule against
  secret credentials in browser code. And the repository contains live-mode
  **publishable** keys (`pk_live_…`, which are public by design and need no
  rotation) — which proves the Stripe account is in live mode, so the risk is
  real rather than theoretical. **Treat that page as unfit for use with a live
  key.** If an `sk_live_…` has ever been pasted into it, revoke and rotate it in
  the Stripe Dashboard — **that is yours to do; I have not and will not.**

### Task 2 — Phoenix Core: one line

`phoenix-core/index.js:21` requires `'../primedoxai-system/api/business'`.
That folder has **never been committed to this repository on any ref**. `require`
runs before `app.listen`, so the process dies with `MODULE_NOT_FOUND`. It is the
only dangling require in the whole `phoenix-core` tree; every other dependency
resolves. I did **not** create a stub to make startup succeed. Options are laid
out in the report; reverting to `index.js.backup` is the wrong one (it regresses
three working features).

### Task 3 — three sites: **none are revenue-ready**, and one blocker dominates

**165 payment links across two live sites point at `paypal.me/derekfranciaco1`**
— 140 in `francisco-holdings-site/`, 25 in `omniaguard-site/` — the handle
CLAUDE.md records as retired. CCLDR is correctly on `techpetcage` (148 links).
If that handle no longer resolves, 165 buttons that invite a customer to pay are
dead. **I did not change them: the 2026-09-05 order is worded CCLDR-only, so the
scope is genuinely ambiguous and this is a money decision.**

Also found: a typo inbox on a live booking button
(`ccldr-site/membership.html:466` → `docweedla@gmail.com`, missing the `w`); the
cannabis-only inbox `docweedlaw@gmail.com` used as the **Interac payment
destination** on the parent holding company's site; and two pages making payment
claims that nothing verifies.

### Task 6 — deployment: the feature branch *is* production

26 of 39 workflows fire on `push` to `claude/francisco-revenue-sprint-MEva6`.
That branch has **304 recorded workflow runs**, many successful, pushing to
`omniaguard.com`, `franciscoholdingsinc.com`, `kiaros.ai`, `vigilax.com` and
others. CLAUDE.md's "main needs sign-off" rule therefore does not protect what
it reads as protecting. 28 workflows clone the live target, **delete everything
except `.git`**, then copy back only 14 file extensions. A full risk register
(D1–D8) and a 12-item pre-deploy checklist are in the report. `deploy-safety.test.js`
passes 9/9 and **is never run by any workflow.**

### Task 4 — avatar + council: **PARTIAL**

Verified by actually running it in an isolated copy: council lifecycle suite
**27/27**, the engine runs end-to-end with no API key and degrades honestly
(`stage: INTAKE`, `aiRuntimeStatus: ERROR`, `verification: null`, all five
authority flags `false`, case file mode `0600`), the avatar-lab server starts and
serves 3 avatars, `POST /api/council` returns `mode:"proposal-only"` and
`humanApprovalRequired:true`, and a malformed request is rejected with 400.

Blocked: **real AI analysis cannot be verified** — no `ANTHROPIC_API_KEY`, no
Anthropic SDK installed. I did not set a key or install anything. Until that is
done, no one should say the council "produces executive analysis"; what is
verified is that it produces a proposal and **records honestly that it got
none**. Two defects found: `GET /api/chat` does not exist (404), and
`POST /api/council` returns the engine's console banner text instead of the
structured proposal.

### Task 7 / Workstream E — **PARTIAL**

A 13-file revenue package already exists at `revenue-sprint/2026-10-28/`
(primary offer, journey review, outreach templates, follow-up sequence,
calendar, tracking sheet, measurement stages). I have not duplicated it.

Two things block finishing it, and both are yours to decide:

1. **Currency is still unresolved, and it shows.** That package contains
   "$249 CAD" five times and "$249 USD" five times. It cannot go to a customer
   in that state. I will not pick for you.
2. **Which inbox.** The deployed zprimedoxaihq form sends to
   `franciscoderek7@gmail.com`; your brief says use `techpetcage@gmail.com` for
   general FHI intake. Those are different answers and the live site currently
   uses the first one.

**Verified revenue collected to date: $0.00.** No customer, no lead, no
testimonial in this repository is real, and I have invented none.

---

## 3. WHAT IS NOT STARTED, AND WHY

**Task 5 / Workstream B — the 10-panel founder dashboard: NOT STARTED.**

This is the one item I have deliberately not begun, and I want to be direct
about the reason rather than quietly skip it.

A founder dashboard is a page of numbers. Right now the honest value of almost
every number it would show is "unverified" or "$0.00": revenue is $0, there are
no customers, `POST /api/council` cannot even return structured fields for a
panel to read (defect A2), and two of three sites have payment links that may not
work. Building ten panels on that would produce a screen that **looks** like an
operating business — which is the precise failure mode your brief names: *do not
say "revenue-generating" unless the claim has been verified.*

I can build it, and I will on your word. But it should either come after the
blockers in §5, or be built deliberately as an **honest** dashboard whose panels
read `$0.00`, `0 customers`, `UNVERIFIED`, `BLOCKED — 8 weeks stale`. Tell me
which and I will start.

---

## 4. BRANCH STATE — AFFECTS EVERYTHING ABOVE

The working tree is on **`claude/revenue-intake-review`** (`69aa969`), not the
designated **`claude/francisco-revenue-sprint-MEva6`** (`8f3a624`). They have
diverged.

There are also **17 uncommitted changes** in the tree from earlier sessions
(modified: `gap-scanner.js`, `marketplace.js`, `council-engine.js`,
`assessment.html`, `fhi-intake.js`, two workflows, two test files; untracked:
the model-router provider files, the council tests, the deploy-safety tests, the
scanner smoke test, and this report directory).

I have **not** switched branches, committed, or pushed. Switching would move the
working tree while that uncommitted work is in it. **Tell me which branch Sprint
2 work should land on and whether to commit the pending work, and I will do it.**

---

## 5. THE SINGLE HIGHEST-VALUE NEXT ACTION

> **Answer one question: does `paypal.me/derekfranciaco1` still work?**

Everything about reaching a first paying customer runs through it. 165 payment
links on two live sites depend on that handle. If it is dead, every "buy" button
on franciscoholdingsinc.com and omniaguard.com is dead, and no amount of
marketing, dashboards or council analysis matters. It costs you one click to
check and it unblocks the largest fix in the sprint.

If you want a second thing in the same breath, it is a one-line edit:

> **Delete or de-brand the OMNIAGUARD footer link at `ccldr-site/index.html:756`.**

That single line has blocked every CCLDR deploy since 2026-07-12. Unblocking it
ships the already-written fix that removes a **false "✅ Stripe LIVE — all
payment methods active" banner** and a JavaScript error from your live pricing
page. One line, eight weeks of staleness, one live page that currently
contradicts itself in front of customers.

---

## 6. DECISIONS WAITING ON YOU

| # | Decision | Blocks |
|---|----------|--------|
| 1 | Does `paypal.me/derekfranciaco1` still work? Should the empire unify on `techpetcage`? | 165 payment links, tasks 3 and 7 |
| 2 | How to resolve `ccldr-site/index.html:756` (delete / de-brand / move under `legal-partners`) | the CCLDR deploy, 8 weeks stale |
| 3 | CAD or USD for the $249 diagnostic | the whole revenue package |
| 4 | Which inbox for general FHI intake: `techpetcage@gmail.com` or `franciscoderek7@gmail.com` | intake wiring |
| 5 | Fix the `docweedla@gmail.com` typo at `ccldr-site/membership.html:466` and `:581` | a live booking button |
| 6 | Should `docweedlaw@gmail.com` be the Interac payment address on the Francisco Holdings site? Your brief says not to route general FHI there | payment routing, Loop separation |
| 7 | Phoenix Core: supply the real `api/business` module, or delete the two dangling lines? | Phoenix Core startup |
| 8 | Authorization to touch `main` (where `phoenix-core/` lives) | task 2 fix |
| 9 | Remove the sprint branch from 26 workflows' `branches:` lists? | stops dev pushes deploying to production |
| 10 | Wire `deploy-safety.test.js` into `ci.yml`? | a passing safety suite that never runs |
| 11 | Set `ANTHROPIC_API_KEY` + install the SDK so council AI can be verified? | task 4 completion |
| 12 | Founder dashboard: build now as an honest `$0.00 / UNVERIFIED` board, or after the blockers? | task 5 |
| 13 | Which branch Sprint 2 lands on; whether to commit the 17 pending changes | all delivery |
| 14 | Delete `claude/c3-mode-probe-DELETE-ME-20261027`? (still cannot be deleted from here) | housekeeping |

I am stopping here and awaiting your orders.

---

## 7. ADDENDUM — CONFIGURATION GAPS VERIFIED (2026-11-01, later)

Five "open configuration gaps" were read-only checks. Closed below. Two needed
official-documentation verification and are now settled.

### 7.1 — xAI model ID `grok-4.7`: **VERIFIED**

xAI's own API page lists **grok-4.7** as its newest flagship model for coding
and knowledge work, with a 500k context window and $2.00 / $6.00 pricing.
Google Cloud's partner-model documentation independently states: *"For Grok 4.7,
use `grok-4.7`."* Current sibling IDs include grok-4.6, grok-4.5, grok-4.20
(reasoning / non-reasoning), the grok-4-fast family, grok-code-fast-1, grok-4,
grok-3 and grok-3-mini.

Caveats worth keeping: the `docs.x.ai` models reference page is roughly 200 days
old and its sample response **omits** grok-4.7, and some gateways use a prefixed
form (`spacexai/grok-4.7`, Bedrock-style prefixes) rather than the plain ID. The
authoritative check for a specific key remains
`GET https://api.x.ai/v1/models`.

**Effect on the code:** `xai-provider.js` was written correctly — it reads the
model from `XAI_MODEL` with `grok-4.7` as a *documented default*, explicitly not
hardcoded as verified (`:39-40`). That default is now externally corroborated,
so the file's "confirm against docs.x.ai" caution can be updated to record the
verification. **Comment-only edit, not applied — awaiting authorization.**

### 7.2 — OpenAI model ID `gpt-6-astra`: **VERIFIED**

OpenAI's own text-generation and reasoning guides show
`client.responses.create` with `model: "gpt-6-astra"` against
`https://api.openai.com/v1/responses` — which matches `openai-provider.js`
exactly (`:47 const MODEL = 'gpt-6-astra'`, POST `/v1/responses`). Platform
variants exist (`openai.gpt-6-astra` on Bedrock, `openai/gpt-6-astra` on
router-style gateways); the plain ID is correct for direct OpenAI calls.

### 7.3 — Formspree placeholder: **19 files, not one**

`formspreeId: 'YOUR_FORM_ID'` / `FORMSPREE_ID = 'YOUR_FORM_ID'` is unconfigured
in **19 files**, not only the PrimeDox exit-intent popup. Notably including
`francisco-holdings-site/index.html:2820` and
`francisco-holdings-site/francisco-holdings-expanded.html:2626` — the site
queued for deploy — plus `ccldr-site/contact.html:150` (a contact form),
`ccldr-site/index.html:1384`, `primedoxai-site/index.html:1374`.

`agents/apex-agent.js:173` guards on `opts.formspreeId !== 'YOUR_FORM_ID'`, so
these fail **closed** rather than posting to a dead endpoint. Nothing breaks;
nothing captures a lead either.

Note: **Formspree and FormSubmit.co are two different services.** Configuring
one does not configure the other.

### 7.4 — Stripe Price IDs: **every entry is commented out**

`agents/payment-provider.js:63-66`:

```js
var STRIPE_PRICE_IDS = {
  // 'ccldr-digital-99':     'price_xxxxxxxxxxxxx',
  // 'ccldr-foundation-149': 'price_xxxxxxxxxxxxx',
  // 'omniguard-vpn-99':     'price_xxxxxxxxxxxxx',
```

The map is **empty at runtime**. `:119-120` looks up `STRIPE_PRICE_IDS[productId]`
and finds nothing for any product, so Stripe checkout cannot complete for
**anything**, not just ZPrimeDox. There are **two copies** of this file —
`agents/payment-provider.js` and `cleanswarm-checkout/payment-provider.js` —
byte-identical in this region. Both need the IDs, and they will drift.

### 7.5 — Supabase idempotency RPC: **no such migration exists here**

`supabase/migrations/` contains `001_leads.sql`, `002_subscribers.sql`,
`003_full_schema.sql`. There is **no idempotency RPC migration**. Across the
whole repository, exactly one file mentions idempotency at all:
`primedox-ai-mvp/sql/schema.sql`. If that migration was written, it exists only
on the Termux device.

### 7.6 — Still open, and only Derek can close it

**Verify the `rk_live_` Stripe restricted key was rotated.** See
`01-credential-exposure-report.md` Appendix B. This is the single confirmed
credential-exposure item in the sprint.
