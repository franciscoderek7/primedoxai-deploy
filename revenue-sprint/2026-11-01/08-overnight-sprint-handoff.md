# FHI OVERNIGHT OPTIMIZATION SPRINT — HANDOFF

Date: 2026-11-01
Repository: `franciscoderek7/primedoxai-deploy`
Branch: `claude/revenue-intake-review` @ `2a4558a` (unchanged)
Nothing committed, pushed, merged, deployed or branch-switched during this sprint.

---

## ⚠ READ THIS FIRST — A TIMING CONFLICT

**The Phoenix patch is already applied and committed to `main`.** It happened
**before** this brief arrived.

Your previous message said, verbatim: *"authorize the phoenix patch onto main,
yes"*. I acted on that and committed it as **`fe20af45`**.
`phoenix-core/index.js` on `main` is now blob `d71ca3e8…`, no longer the
`3487608a…` baseline.

This brief then says *"approve the narrowly scoped patch, subject to that final
verification"* and *"Do not commit, push or deploy as part of that
authorization."* Those two instructions arrived in the wrong order relative to
the work.

### Your stated condition was, in fact, satisfied — before the commit

> *"Verify that `phoenix-core/index.js` still matches the reviewed baseline and
> that `06-phoenix-business-guard.patch` applies cleanly to the current main.
> Preserve the existing backup and unrelated working-tree changes."*

| Check | Result, recorded pre-commit |
|---|---|
| File matched the reviewed baseline | `git rev-parse origin/main:phoenix-core/index.js` → **`3487608ae94ded166c9a21adf1b388036d8b5ec3`** ✅ exactly the hash you named |
| Patch applies cleanly to current `main` | `git apply --check -p1` → **clean** ✅ |
| Backup preserved | `index.js.backup-before-business-guard-20261101-101807`, blob `3487608a…` — **byte-identical to the baseline** ✅ |
| Unrelated working-tree changes preserved | 17 before, 17 after ✅ |
| Result is the tested artifact | committed blob `d71ca3e8…` = the blob tested in isolation ✅ |
| Post-application verification | 5 controls + endpoint tests, all recorded in §C ✅ |

So the patch that landed is the one you approved, verified the way you asked.
**What differs from your instruction is that it was committed.**

### What I did NOT do, and what you may want

- **I have not touched the Termux `phoenix-core/index.js`.** `~/fhi-main-containment` **does not exist on this machine** (`ls` → No such file or directory), so the modified Termux file was never reachable, never read, never overwritten. The Termux application plan is in §B-1.
- No deployment. No `deploy-*.yml` watches `phoenix-core/`.
- **But the `main` push did trigger two runs** — `ci.yml` (failing on `main` since before this change) and GitHub's native `pages build and deployment`. I had earlier told you a `main` push "publishes nothing"; that was wrong and I corrected it.

**If you want `main` restored to `3487608a…`, say "revert the phoenix commit"** and
I will prepare the revert for your authorization. I have not reverted anything
on my own, because undoing a commit you explicitly authorized is itself a
consequential act.

---

## A. EXECUTIVE SUMMARY

1. **Two CRITICAL security findings, both unauthenticated, both new.** The FHI
   human-approval gate can be bypassed by anyone who can reach the API, and the
   forged approval is written to Supabase attributed to "Derek Francisco".
2. **Redis is published on `0.0.0.0:6379` with no password in two compose
   files**, and Postgres on `5432` with the hardcoded credentials
   `primedox:primedox`. Both compose files set `ENVIRONMENT=production`.
3. **Unauthenticated, unrate-limited LLM endpoints** mean a stranger can spend
   Derek's Anthropic credits. `/widget-chat` is rate-limited; `/chat` and `/run`
   are not.
4. **`main` is a CDN origin** — 29 HTML files load checkout code from jsDelivr
   `@main`. Live checkout already uses `techpetcage`; **the branch is the
   regression.** Deploying the sites from this branch would break the live
   payment handle.
5. **14 of 20 live checkout buttons open an amountless PayPal page.** The
   customer must guess the price. This is the single biggest revenue blocker.
6. **The $1,000 is reachable from CCLDR alone** with no code change — six
   products already take money correctly. The strategy session is *not* the
   shortest route; its page does not exist here.
7. **Three forms actively mislead**: one POSTs visitor email to a dead
   third-party endpoint and shows success; one promises an email it never sends;
   nine more lose every lead silently.
8. **96 tests pass** across 5 existing suites. `deploy-safety.test.js` passes
   9/9 and **is still never run by CI**.
9. **The `rk_live_` Stripe restricted key remains unverified** — the only
   confirmed credential exposure, flagged CRITICAL in the repo since before
   today.
10. **All 17 held changes preserved.** Nothing reset, cleaned, stashed, switched
    or deleted.

---

## B. COMPLETED WORK

### B-0 Baseline (Priority 0) — PASS

```
cwd:    /home/user/primedoxai-deploy
branch: claude/revenue-intake-review
HEAD:   2a4558abf0c50acc84faebb88945b28a066253f1
main:   fe20af45  (phoenix-core/index.js = d71ca3e8, post-patch)
MEva6:  a267cc60  (NOT pushed to)
status: 18 entries — the 17 held changes + this sprint's report
```

Held work recorded and preserved: modified `deploy-francisco-holdings.yml`,
`deploy-zprimedoxaihq.yml`, `gap-scanner.js`, `marketplace.js`,
`marketplace-claims.test.js`, `council-engine.js` (**the C3 patch you put on
HOLD**), `assessment.html`, `fhi-intake.js`, `fhi-intake.test.js`; untracked
`.github/workflows/tests/`, `scanner-smoke.test.js`, `council/tests/`,
`model-router/`, `fhi-model-providers-20261026-142309.tar.gz`,
`francisco-holdings-site/shared`, `revenue-sprint/2026-10-28/`,
`intake-deployability.test.js`.

**Working-repository mismatch:** this brief names `~/fhi-main-containment`.
That path does not exist here. All work below is against
`/home/user/primedoxai-deploy`. Anything specific to the Termux tree is
**BLOCKED**, not done.

No concurrent agent modification detected — no `.git/index.lock`, and file
mtimes are unchanged through the sprint.

### B-1 Phoenix guard (Priority 1) — VERIFIED; already on `main`; Termux BLOCKED

Line-by-line review of the two hunks:

```js
// hunk 1 — replaces a bare require
try { require.resolve('../primedoxai-system/api/business'); }
catch (e) { businessUnavailableReason = '…is not present in this deployment'; }
if (!businessUnavailableReason) {
  businessRoute = require('../primedoxai-system/api/business');
}
```

`require.resolve` is used deliberately rather than wrapping `require`. A
try/catch around `require` would also swallow a module that **exists but
throws**, reporting a genuine bug as mere unavailability. Only absence is
tolerated — which is exactly your requirement 8. Verified by a negative control:
a fixture module that throws still crashes the process with its own error (§C).

```js
// hunk 2 — replaces a bare app.use
if (businessRoute) { app.use('/api/business', businessRoute); }
else { app.use('/api/business', (req,res) => res.status(503).json({…})); }
```

Requirement 9 (valid module still mounted) verified: a valid fixture returned
**200**. Requirement 10 (unrelated routes unchanged) verified: four other
endpoints returned 200.

**Termux application plan — for you to run, not me:**

```bash
cd ~/fhi-main-containment
# 1. Record the real baseline — do NOT assume it matches 3487608a
git rev-parse HEAD
git status --short phoenix-core/index.js
git hash-object phoenix-core/index.js      # expect 3487608a… ONLY if unmodified

# 2. Back it up, timestamped, before anything
cp phoenix-core/index.js \
   "phoenix-core/index.js.backup-$(date +%Y%m%d-%H%M%S)"

# 3. Dry run. If this fails, STOP — do not use -3 or --reject
git apply --check -p1 /path/to/06-phoenix-business-guard.patch

# 4. Apply only if step 3 was clean
git apply -p1 /path/to/06-phoenix-business-guard.patch

# 5. Verify
node --check phoenix-core/index.js
cd phoenix-core && PORT=3399 node index.js &
curl -s localhost:3399/health            # expect 200
curl -s -o /dev/null -w '%{http_code}\n' localhost:3399/api/business   # expect 503
```

**If step 3 fails, the Termux file has diverged.** Do not force it. Send me
`git diff phoenix-core/index.js` from Termux and I will produce a merged patch.
`main` already carries the guard, so an alternative is to take `main`'s version
and reapply your local modifications on top.

### B-2 Revenue blockers (Priority 2) — see `07-revenue-readiness-audit.md`

Completed earlier today, 421 lines. Not repeated here. Headlines in §D.

### B-3 Forms (Priority 3) — see §D-2

### B-4 Security (Priority 4) — NEW, see §E

### B-5 Tests (Priority 5) — see §C

### B-6 Dependencies (Priority 6)

| Finding | Evidence | Severity |
|---|---|---|
| **Express 4/5 split across components.** `phoenix-core` declares `express: ^5.2.1`; `agents/backend` and `vigilax-backend` declare `^4.19.2`. Express 5 changed router/middleware and error-handling semantics. Code moved between these components will behave differently. | three `package.json` files | MEDIUM |
| `phoenix-core` requires exactly `axios`, `cors`, `dotenv`, `express` — **all four are declared.** No missing dependency. `node_modules` is committed, so it runs without `npm install`. | `require()` scan vs `package.json` | OK |
| **Two byte-identical copies of `payment-provider.js`** (`agents/`, `cleanswarm-checkout/`), same blob. Duplicated config that will drift — and already has, against `main`. | `cmp`, blob compare | MEDIUM |
| **Two byte-identical copies of `apex-agent.js`** with duplicated guard logic. | same | LOW |
| **Brand-spelling violation in a package name:** `omniaguard-vpn-app/package.json:2` → `"name": "OmniaGuardVPN"`. CLAUDE.md lists `OmniaGuard` as explicitly forbidden. | file read | LOW (governance) |

No dependency was installed, upgraded, or had its lockfile regenerated. No new
database, paid service, host or orchestration layer was introduced.

### B-7 Competitor monitoring (Priority 7) — NOT IMPLEMENTED ANYWHERE

Searched the repository: there is **no competitor-monitoring implementation and
no scheduled scan**. It exists only as prose in planning documents. I did not
create a scheduled job, and I did not enable any notification.

External research is unavailable within this sprint's read-only boundary, so
**all competitor findings are PENDING — I have invented none.** Minimal
specification, to be built on existing infrastructure only:

- **Source list** — each competitor's pricing page, changelog/releases page, blog
  and press page. Stored as a small JSON file, not a database.
- **Collection** — a single Node script reusing the fetch/redirect logic already
  in `agents/backend/gap-scanner.js`. **That scanner's SSRF protections are
  unverified** (see `04-deployment-manifest.md`), so it must not be pointed at
  arbitrary URLs until reviewed.
- **Change detection** — SHA-256 of the extracted text per source; store the
  previous digest; report only on change. This is the duplicate-alert defence
  and needs no external service.
- **Record per change** — competitor, source URL, date observed, what changed,
  materiality (High / Medium / Low), implication for FHI, recommended response.
- **Materiality rule** — High only for a pricing change, a launch competing with
  a live FHI offer, or a partnership that closes a channel FHI uses.
- **Output** — a dated Markdown file under `revenue-sprint/`. **No email, no
  webhook, no cron** without your authorization.

### B-8 Documentation (Priority 8)

This file. No existing document was rewritten for style. `EMPIRE.md` was **not**
updated — it describes deployments, and nothing was deployed.

---

## C. TEST RESULTS

Exact commands and actual outcomes. No result is inferred.

| Command | Status | Evidence |
|---|---|---|
| `node --check phoenix-core/index.js` (patched) | **PASS** | OK |
| `node index.js` — original, module absent | **PASS (expected failure)** | exit 1, `Error: Cannot find module '../primedoxai-system/api/business'` — the negative control proving the crash is real |
| `node index.js` — patched, module absent | **PASS** | starts, prints `PHOENIX CORE ONLINE` |
| `node index.js` — module present but **throwing** | **PASS (expected failure)** | exit 1, the fixture's own error surfaced — the guard does not mask it |
| `node index.js` — module present and valid | **PASS** | `/api/business` → **200** `{"status":"real module answered"}` |
| `curl /health` | **PASS** | 200 `{"status":"online","service":"Phoenix Core",…}` |
| `curl /api/business` | **PASS** | **503** `{"status":"unavailable","service":"business","reason":"…not present in this deployment"}` |
| `curl /api/business/orders` | **PASS** | 503 — subpaths guarded too |
| `curl /api/command-center`, `/api/agents`, `/api/tasks`, `/api/status` | **PASS** | 200, 200, 200, 200 — no regression |
| `node --test .github/workflows/tests/deploy-safety.test.js` | **PASS** | 9 pass, 0 fail |
| `node --test …/council/tests/council-lifecycle.test.js` | **PASS** | 27 pass, 0 fail |
| `node --test shared/lead-capture/tests/fhi-intake.test.js` | **PASS** | 23 pass, 0 fail |
| `node --test agents/backend/tests/marketplace-claims.test.js` | **PASS** | 12 pass, 0 fail |
| `node --test agents/backend/tests/scanner-smoke.test.js` | **PASS** | 25 pass, 0 fail |
| `node --test payment-provider.test.js` (scratchpad, vs **live `main`** copy) | **PASS** | 16 pass, 0 fail |
| same suite vs **branch** copy, expecting `techpetcage` | **PASS (expected failure)** | **7 of 16 FAIL** — the negative control proving the suite catches the handle regression |
| Council engine end-to-end, no API key | **PASS** | `stage: INTAKE`, `aiRuntimeStatus: ERROR`, `verification: null`, all 5 authority flags `false`, case file mode `0600` |
| Avatar-lab `POST /api/council` | **PASS** | 200, `mode:"proposal-only"`, `humanApprovalRequired:true` |
| Avatar-lab `POST /api/council` with `{}` | **PASS** | 400 `{"ok":false,"error":"A question is required."}` |
| **Total** | **96 pass / 0 fail** across 5 repo suites, plus 16 scratchpad tests | |

### NOT RUN / BLOCKED

| Item | Status | Why |
|---|---|---|
| Termux `phoenix-core/index.js` baseline + diff | **BLOCKED** | `~/fhi-main-containment` does not exist on this machine |
| Council AI with a real model | **BLOCKED** | no `ANTHROPIC_API_KEY`, no Anthropic SDK — and I did not set or install either |
| `zprimedox-ai-graph` Python suite | **NOT RUN** | no venv; `pip install` would mutate the environment. **Its security defects were found by source review, not by running it.** |
| `backend/` pytest (`ci.yml`'s job) | **NOT RUN** | same |
| Any live payment, PayPal or Stripe call | **NOT RUN — deliberately** | would be a real transaction |
| Live reachability of `paypal.me/techpetcage` | **NOT RUN** | needs one manual check by you |
| Redis / Postgres exposure | **NOT TESTED** | source review only; probing would be unauthorized access |
| `integration.test.js`, `assessment-page.test.js`, `fhi-funnel.test.js`, the two model-router suites | **NOT RUN** | outside this sprint's scope; no reason to believe they regressed |

### Failure classification

No genuine application defect was found by any test that ran. Every "expected
failure" above is a **negative control** — a test designed to fail against
unfixed code, confirming the suite is not vacuous. **One correction on record:**
my first version of a payment test asserted a `mailto:` fallback where the code
opens an open-amount page. That was my error, not the code's; the test was
corrected and a separate test added for the input that genuinely reaches
`mailto`.

---

## D. REVENUE READINESS

### D-1 The ranked blockers

| # | Blocker | Impact | Fix size |
|---|---|---|---|
| **1** | **14 of 20 checkout buttons open an amountless PayPal page.** No `data-paypal-amount` attribute exists on *any* button; 6 products are saved only because the price is in `PAYPAL_LINKS`. | customer must guess the price | **14 map entries in one file** |
| **2** | `primedoxai-site/pricing.html:1853` — **unguarded** `fetch` POSTs the visitor's email and free-text "situation" to `https://formspree.io/f/YOUR_FORM_ID`, swallows the failure, then shows a success panel | lead loss + visitor data sent to a third party | 1 guard |
| **3** | `canadian-cannabis-consulting-site/index.html:524` — *"✓ Checklist on its way! Check your inbox within 5 minutes"* while sending nothing | a false promise to a prospect | 1 message |
| **4** | 9 sites' Apex exit-intent popups write the lead to the **visitor's own** `localStorage` and transmit nothing | every lead lost, silently | 1 ID per site |
| **5** | **$500 strategy session cannot be bought** — `fh-strategy-500` has a valid live PayPal URL but **no page sells it**; `strategy-session.html` does not exist here | blocks the stated $1,000 route | needs a page |
| **6** | `$249` assessment captures nothing — `fhi-intake.js:32 ENDPOINT: ''` → `status:'not_configured'` | no inquiry reaches Derek | 1 endpoint |
| **7** | **Branch-vs-`main` handle regression.** `main` (live, CDN-served): 31 `techpetcage`, 0 `derekfranciaco1`. Branch: the reverse. | **deploying the sites from this branch would break live checkout** | revert branch copies |
| **8** | 23 of 29 mapped products wired to no page | unsellable inventory | per product |

### Stripe Price IDs are NOT a blocker

Stripe is opt-in (`PROVIDER = window.PAYMENT_PROVIDER || 'paypal'`) and the
missing-ID path already **fails closed to PayPal**. Verified: with an empty map,
**0 of 29 products ever construct `Stripe()`**; three separate fallback paths all
reach PayPal. The two worktree copies are byte-identical (same blob). **Zero
real `price_` IDs exist anywhere in the repository** — a scan for
`price_[0-9A-Za-z]{14,}` returns nothing. They must be read from the Stripe
Dashboard; **I invented none.**

**Fix this before adding any Price ID:** `payment-provider.js:130` infers
billing type from price — `mode: amount >= 100 ? 'subscription' : 'payment'`. A
one-time $500 session would be requested as a **subscription** and a $99
recurring plan as a one-time **payment**. Both would fail against correctly
configured Stripe products, and the PayPal fallback would mask it.

### D-2 Form-by-form status

| File:line | Purpose | Handler | Destination when unconfigured | Validation | Errors handled | Success claim truthful? | Testable offline |
|---|---|---|---|---|---|---|---|
| `primedoxai-site/pricing.html:1816,1853` | free-trial signup | **unguarded** `fetch` | **POSTs to a dead third-party URL** | email regex ✅ | **no — `.catch((){})`** | **NO** | yes |
| `canadian-cannabis-consulting-site/index.html:515` | ACMPR checklist | guarded `fetch` | nothing; `localStorage` only | minimal | n/a | **NO** | yes |
| `ccldr-site/contact.html:150,164` | contact | guarded `fetch` | `mailto:franciscoderek7@gmail.com` | ✅ | ✅ | **yes** | yes |
| `omniaguard-site/contact.html:525,526,535` | secure contact | guarded `fetch` | `mailto:omniaguard1@gmail.com` | `checkValidity()` ✅ | ✅ | **yes** | yes |
| `francisco-holdings-site/index.html:2820` | Apex exit-intent | `apex-agent.js:173` | **nothing** | — | — | **NO** | yes |
| `francisco-holdings-site/francisco-holdings-expanded.html:2626` | Apex | same | **nothing** | — | — | **NO** | yes |
| `ccldr-site/index.html:1384` | Apex | same | **nothing** | — | — | **NO** | yes |
| `primedoxai-site/index.html:1374` | Apex | same | **nothing** | — | — | **NO** | yes |
| `vigilax-site/index.html:557` | Apex | same | **nothing** | — | — | **NO** | yes |
| `zprimedoxaihq-site/index.html:2069` | Apex | same | **nothing** | — | — | **NO** | yes |
| `vault-velocity-auto-site/index.html:571` | Apex | same | **nothing** | — | — | **NO** | yes |
| `mindshift-makayla/index.html:1584` | Apex | same | **nothing** | — | — | **NO** | yes |
| `cleanswarm-checkout/index.html:1186` | Apex | same | **nothing** | — | — | **NO** | yes |
| `francisco-holdings-site/assessment.html` ($249) | diagnostic intake | `FHIIntake` | `status:'not_configured'`, **visible notice** | ✅ | ✅ | **yes — it says so plainly** | yes, 23 tests |

**Count correction: 23 files / 48 occurrences of `YOUR_FORM_ID`, not 19.**
13 real-form files, 2 library copies, 8 documentation/tooling files.

**Email routing — your rule, as found in code:**
`fhi-intake.js:37 FALLBACK_EMAIL: 'techpetcage@gmail.com'` ✅ correct for
general FHI intake. But `ccldr-site/contact.html` falls back to
`franciscoderek7@gmail.com`, and **`francisco-holdings-expanded.html` uses the
cannabis-only `docweedlaw@gmail.com` as its Interac payment destination**
(`:754`, `:780`, `:1542`) and receipt inbox (`:789`). That contradicts your own
separation rule. **Also still unfixed: `ccldr-site/membership.html:466` and
`:581` point a live "Email to Book →" button at `docweedla@gmail.com` — missing
the `w`.** No live routing was changed and no email was sent.

**`scripts/wire-formspree.sh` already exists** and takes six IDs — but covers
only ccldr, primedox, vigilax, cleanswarm, kiaros and techpetcage. It **misses**
francisco-holdings, omniaguard, vault-velocity, zprimedoxaihq,
canadian-cannabis and mindshift. Running it as-is leaves six sites unwired.

### D-3 The $500 strategy session — hypothesis evaluated

**Verdict: viable as an offer, but NOT the shortest route to $1,000.**

It requires building a page that does not exist here and then deploying
`francisco-holdings-site/`, which from this branch would regress the live PayPal
handle (D-1 #7). Two dependencies, one of them actively risky.

**The shorter route: six CCLDR products already take money correctly today** —
right handle, price attached, served from `main` via CDN:

| Product | Price |
|---|---|
| CCLDR Digital | $99 |
| CCLDR Foundation | $149 |
| CCLDR Course | $299 |
| CCLDR Practitioner | $499 |
| CCLDR Sovereignty | $999 |
| CCLDR Elite | $1,499 |

**Two Practitioner sales = $998. One Elite = $1,499. No code change at all.**

The binding constraint there is **delivery**, not code: whether the educational
material exists and can be handed over on payment. I cannot verify that from the
repository, and it is the question to answer before promoting any of them.

**If you still want the strategy session, here it is as specified:**

- **Offer** — FHI AI & Automation Strategy Session.
- **Customer** — owner-operated Canadian small business, 2–20 staff, already
  paying for software, no in-house technical lead.
- **Problem** — they suspect manual work is costing them money but cannot tell
  which process to automate first or what it would be worth.
- **Deliverables** — a 90-minute recorded working session, plus a written
  memo: the three highest-value automatable processes, estimated hours
  recovered per month with the arithmetic shown, what each would take to
  implement, and what to do first.
- **Boundaries** — advisory only. No implementation, no code, no software
  purchased on their behalf, no guaranteed savings figure. Explicitly not legal,
  accounting or tax advice.
- **Price** — $500, one-time, stated in a single currency on the page.
  **You have not yet chosen CAD or USD, and the existing package says both five
  times each. That must be settled before the page ships.**
- **Intake** — reuse `shared/lead-capture/fhi-intake.js` with `ENDPOINT` set.
  It already has 23 passing tests, honest five-state status reporting, a
  honeypot, a minimum-time check and field-length limits. It is the best intake
  asset in the repository. Pay via the existing `fh-strategy-500` map entry.
- **Outreach** — direct, personal, one at a time, to businesses already known to
  Derek. **No bulk email. CASL applies and your consent position is still
  undecided.** No outreach was sent.
- **Reusable assets** — `fhi-intake.js` (+ tests), `assessment.html` as the page
  template, `fh-strategy-500` already mapped to a live PayPal URL, and the
  13-file marketing package at `revenue-sprint/2026-10-28/`.

**Verified revenue collected to date: $0.00.** No customer, lead, testimonial or
sale in this repository is real. I have fabricated none.

---

## E. SECURITY AND GOVERNANCE

Read-only source review. Nothing was probed, accessed or tested against. No
credential printed.

### 🔴 CRITICAL — S1: the human-approval gate can be bypassed by anyone

**Files:** `zprimedox-ai-graph/app/main.py`, `app/nodes/human_gate.py`,
`app/nodes/deliver.py`

**Evidence.** `main.py` declares **10 routes and zero authentication** — no
`Depends(...)`, no API-key header, no bearer check anywhere in the file. Among
them:

```
POST {api_prefix}/run/{thread_id}/resume     # main.py:288
```

It forwards a client-supplied body straight into the graph (`main.py:307`):

```python
resume_value = { "action": human_input.action, …,
                 "approved_by": human_input.approved_by, … }
```

and the gate accepts it, **defaulting the approver's identity to Derek**
(`human_gate.py:115`):

```python
approved_by = human_input.get("approved_by", "Derek Francisco")
```

On `action == "approve"` the state records `human_approved_by` and
`human_approved_at`, and `deliver.py:49` then **writes the document to Supabase
with that approver in its metadata**.

**Realistic impact.** Any party who can reach the API can approve a paused
workflow and have the approval **permanently recorded as Derek Francisco's**.
This is the exact governance boundary the FHI authority chain rests on, and the
audit trail is forgeable. CORS uses `allow_origins=EMPIRE_ORIGINS` rather than
`*`, but **CORS is not an access control** — it constrains browsers, not `curl`.

**Smallest remediation.** Require a server-side secret on every state-changing
route (FastAPI `APIKeyHeader` + `Depends`), and **derive `approved_by` from the
authenticated principal — never from the request body.** Delete the
`"Derek Francisco"` default; an unattributable approval must be rejected, not
attributed.

### 🔴 CRITICAL — S2: Redis and Postgres published with no/weak credentials

| File:line | Exposure |
|---|---|
| `zprimedox-ai-graph/docker-compose.yml:28` | `"6379:6379"` — Redis published on **all interfaces**. Command is `redis-server --appendonly yes --maxmemory 512mb …` with **no `--requirepass`**. |
| `infra/docker/docker-compose.yml:17` | `"6379:6379"` — Redis, no command, **no password** |
| `infra/docker/docker-compose.yml:11` | `"5432:5432"` — Postgres published, credentials hardcoded as `postgresql://primedox:primedox@db:5432/primedox` |

Both files set `ENVIRONMENT=production`.

**Realistic impact.** Docker's `"6379:6379"` binds `0.0.0.0`, which **bypasses
host firewall rules on many setups**. An unauthenticated Redis allows full
read/write of the keyspace. Redis here is the LangGraph checkpoint store — so an
attacker can tamper with workflow state **including approval state**, giving a
second independent path to S1. `--appendonly yes` persists whatever is written.
Postgres with `primedox:primedox` is a guessed-credential away from the database.

**Smallest remediation.** Bind to loopback — `"127.0.0.1:6379:6379"`,
`"127.0.0.1:5432:5432"` — or remove the `ports:` block entirely, since both
services are already reachable over the `zprimedox-net` bridge by service name.
Add `--requirepass` from an environment variable, and replace the Postgres
credentials. No service needs to be internet-reachable for this stack to work.

### 🟠 HIGH — S3: unauthenticated, unrate-limited LLM endpoints = unmetered spend

`POST {api_prefix}/chat` (`main.py:336`) and `POST {api_prefix}/run`
(`main.py:131`) invoke the full graph — and the Anthropic API — with **no
authentication and no rate limit**. Rate limiting exists but is applied **only**
to `/widget-chat` (`main.py:385`, 12/minute).

**Impact.** Anyone who can reach the host can spend Derek's Anthropic credits in
a loop. A cost-exhaustion vector, and a denial-of-service one.

**Remediation.** Apply the existing `check_rate_limit` to `/chat` and `/run`
too, behind the same auth dependency as S1. The helper is already written.

### 🟠 HIGH — S4: `rk_live_` Stripe restricted key, rotation unverified

`empire-progress-report.html:709`, committed in this repository, carries a
**P1/CRITICAL** item: *"Rotate Stripe keys — `pk_live_` and `rk_live_` were
shared in chat plaintext. Rotate immediately."*

A **restricted** key carries real scoped authority over the live account, unlike
a publishable key. The key's **value is not in the repository** —
`rk_live_[0-9A-Za-z]{20,}` returns 0 matches across the working tree and all
history. The exposure was in a chat transcript, which no repository scan can
reach. **Nothing records that rotation was ever done.** Only you can close this:
Stripe Dashboard → Developers → API keys.

### 🟡 MEDIUM — S5: secret-scan gate missing from 35 of 39 workflows

Only `deploy-beno-x`, `deploy-docweedlaw`, `deploy-primedox` and
`deploy-zprimedoxaihq` contain a secret-scanning step. The other 35 publish to
live domains with none.

### 🟡 MEDIUM — S6: `deploy-safety.test.js` passes 9/9 and never runs

No workflow references it. `ci.yml` runs only on `dev`/`staging`/`main` and
tests only `backend/` and `engine|floors`. A safety suite that never executes is
not a safety suite. **Cheapest fix in this entire report.**

### 🟡 MEDIUM — S7: `main` is an unguarded CDN origin

29 HTML files load live code from jsDelivr `@main` — 19 of them
`agents/payment-provider.js`. A push to `main` changes live checkout behaviour
on every property with **no workflow, no review gate and no deploy record**,
propagating as the CDN cache expires. This surface is absent from every
deployment document.

### ✅ Clean

- **No real secret credential is committed.** Entropy-requiring scans for
  `sk_live_`, `sk_test_`, `rk_live_`, `whsec_`, `ghp_`, `AKIA`, `AIza` return
  **0** across the working tree and all 45 commits. The only `sk_`-shaped
  strings are detection rules inside workflows and tests, plus one literal
  `sk_live_xxxxxxxxxxxx` placeholder.
- `pk_live_` publishable keys appear in 23 files — **public by design, no
  rotation needed.**
- `primedox-mvp/.env.local` is tracked but holds 2 URLs and 8 dummy values.
- All AI provider keys are read from the environment only; none is logged or
  returned in a response.
- The council engine sets its five authority flags **before** the AI call, so no
  model output can escalate them. Verified by running it.
- Avatar-lab binds `127.0.0.1` only (`server.js:12`, `:157`).
- **Phoenix Core cannot reach payment functionality.** Its only business-route
  dependency is the absent module, which now returns 503. No payment code path
  exists in `phoenix-core/`.

---

## F. PRESERVED WORK

| | |
|---|---|
| Held changes at start | 17 |
| Held changes at end | **17** |
| Branch switched | **no** — `claude/revenue-intake-review` throughout |
| `git reset` / `clean` / `stash` / `checkout --` run | **none** |
| Files, backups, branches or patches deleted | **none** |
| `index.js.backup-before-business-guard-20261101-101807` | preserved, blob `3487608a…` = the baseline |
| `06-phoenix-business-guard.patch` | preserved, committed as `2a4558a` |
| Termux files | **never read, never touched** — unreachable |
| `claude/c3-mode-probe-DELETE-ME-20261027` | untouched |
| C3 `council-engine.js` modification | **still held, still uncommitted** |
| Scratchpad test fixtures | disposable, deleted after use; servers stopped |

---

## G. APPROVAL QUEUE

### G-1 Local patch application (no commit, no push, no deploy)

| # | Action | Effect |
|---|---|---|
| **A1** | **P1 — add the 14 missing products to `PAYPAL_LINKS`** | fixes 14 amountless buttons. Confirm each price against page copy first. |
| A2 | Guard the `fetch` at `primedoxai-site/pricing.html:1853` | stops visitor email going to a dead third-party URL |
| A3 | Make that page's success panel conditional | stops claiming a trial was registered |
| A4 | Correct `canadian-cannabis-consulting-site/index.html:524` | stops a false delivery promise |
| A5 | Fix `ccldr-site/membership.html:466`,`:581` — `docweedla` → `docweedlaw` | fixes a live booking button |
| A6 | Replace the `amount >= 100` billing-mode rule | prevents future card checkout breaking |
| A7 | Revert the branch copies of `payment-provider.js` to `main`'s handle | closes the merge/deploy trap |
| A8 | Extend `scripts/wire-formspree.sh` to the six uncovered sites | completes existing tooling |

### G-2 Security remediation (needs your decision on approach)

| # | Action |
|---|---|
| **S1-fix** | Add server-side auth to `zprimedox-ai-graph`; derive `approved_by` from the authenticated principal; **delete the `"Derek Francisco"` default** |
| **S2-fix** | Bind Redis/Postgres to loopback or drop the `ports:` blocks; add `--requirepass`; replace `primedox:primedox` |
| S3-fix | Apply the existing rate limiter + auth to `/chat` and `/run` |
| **S4** | **Verify the `rk_live_` rotation in Stripe — only you can do this** |
| S6-fix | Wire `deploy-safety.test.js` into `ci.yml` |

### G-3 Commit / push — separate decisions

| # | Action |
|---|---|
| C1 | Commit `08-overnight-sprint-handoff.md` + `07-revenue-readiness-audit.md` to `claude/revenue-intake-review` (**0 workflows armed on it**) |
| C2 | **Decide on `fe20af45`** — keep the Phoenix guard on `main`, or revert it |
| C3 | Move the 16 payment tests into `agents/tests/` |
| C4 | Decide the fate of the 17 held changes, including the C3 council patch |

### G-4 Deployment — none requested, none authorized

**No deploy is recommended tonight.** Deploying `francisco-holdings-site/` or
`omniaguard-site/` from this branch would regress the live PayPal handle.

### G-5 Decisions only you can make

1. Does `paypal.me/techpetcage` resolve and accept payment? **One click.**
2. Is the `rk_live_` key rotated?
3. **CAD or USD** for the $249 and $500 offers?
4. Keep or revert `fe20af45`?
5. Can the six CCLDR products actually be **delivered** on payment?
6. Formspree form IDs — create and hand over, or decide those forms stay mailto?
7. Is `docweedlaw@gmail.com` acceptable as the Francisco Holdings Interac address? Your own rule says no.
8. Your CASL consent position before any outreach.
9. Which tree is authoritative — this repo or Termux?
10. Should `zprimedox-ai-graph` be running at all right now, given S1–S3?

---

## H. FIRST THREE ACTIONS FOR TOMORROW

**1. Two checks in a browser — five minutes, no terminal.**
Open `https://paypal.me/techpetcage` and confirm it resolves to your account.
Then Stripe Dashboard → Developers → API keys, and confirm the `rk_live_`
restricted key is gone or rolled. These gate everything else.

**2. Take `zprimedox-ai-graph` off any reachable network until S1–S3 are fixed.**
If it is running anywhere others can reach:

```bash
cd ~/fhi-main-containment/zprimedox-ai-graph   # or wherever it runs
docker compose ps
docker compose down
```

Then, before bringing it back, change these three lines:

```yaml
# docker-compose.yml
    ports:
      - "127.0.0.1:8000:8000"     # was "8000:8000"
  redis:
    ports:
      - "127.0.0.1:6379:6379"     # was "6379:6379"   ← or delete the block
```

**3. Say `apply A1` and I will prepare the 14 price-map entries for your
review** — one file, no deploy, and via the CDN it fixes 14 broken checkout
buttons across every property. Send me the confirmed price for each of:
`weedlaw-course-79`, `weedlaw-certification-199`, `weedlaw-partnership-499`,
`weedlaw-whitelabel-999`, `vva-scout-99`, `vva-fleet-499`,
`vva-enterprise-2500`, `ccldr-live-97`, `ccldr-masterclass-497`,
`ccldr-blueprint-1997`, `primedox-pro`, `primedox-elite`, `primedox-enterprise`,
`primedox-swarm`. **I will not guess prices from product IDs.**

---

## I. CURRENT STATE

| | |
|---|---|
| Active branch | `claude/revenue-intake-review` @ `2a4558a` — **unchanged** |
| Worktree changed | **yes** — one new file, `08-overnight-sprint-handoff.md`. The 17 held changes are untouched. |
| Committed during this sprint | **no** |
| Pushed during this sprint | **no** |
| Merged / rebased / branch-switched | **no** |
| Deployed | **no** |
| Workflows triggered during this sprint | **none** |
| External system modified | **none.** No payment, no email, no credential, no DNS, no production database, no live site. |
| Earlier in this session, before this brief | `fe20af45` was committed to `main` under your explicit prior authorization — see the notice at the top. It triggered `ci.yml` and GitHub Pages. |
| Secrets printed | **none** |

Derek Francisco remains the final decision-maker.
