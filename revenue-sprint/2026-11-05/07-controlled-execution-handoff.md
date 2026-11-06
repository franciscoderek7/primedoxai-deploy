# FHI / GREEN BLAST — CONTROLLED EXECUTION HANDOFF

Date: 2026-11-05 · Branch `claude/revenue-intake-review` @ `056ac19`
**Nothing applied, committed, pushed, merged, deployed or CI-triggered. No
payment, email or external service contacted. No credential value appears in
this document. All 17 held changes preserved; C3 on HOLD.**

Scope used: the standing authorization for **isolated patch preparation and
offline testing**. Every artifact lives in `revenue-sprint/2026-11-05/proposed/`,
outside the active source tree.

---

## WHAT WAS BUILT AND TESTED THIS SPRINT

| Artifact | Lines | Tests |
|---|---|---|
| `proposed/webhook-guard-v2.js` | 108 | **16 pass / 0 fail** |
| `proposed/idempotency-store.js` | 60 | covered by the above |
| `proposed/webhook-guard-v2.test.js` | 16 cases | — |
| `proposed/server-js-ordering-and-bind.patch` | 2 hunks | `node --check` OK |
| `proposed/compose-loopback.patch` | 1 line | — |
| `proposed/transactions-table.sql` | append-only ledger | design |

### Negative controls — the suite bites

```
$ node --test webhook-guard-v2.test.js                          # 16 pass /  0 fail
$ GUARD=./control-current.js node --test webhook-guard-v2.test.js  #  2 pass / 14 fail
$ GUARD=./control-v1.js      node --test webhook-guard-v2.test.js  #  9 pass /  7 fail
```

`control-current.js` is a faithful shim of `paypal-service.js:105-215` as it is
today. `control-v1.js` is **my own v1 guard** — included because you were right
about its three flaws, and the suite proves them:

| Test | current | my v1 | v2 |
|---|---|---|---|
| fail closed on unset webhook id | **FAIL** | pass | pass |
| **raw body guard** — a parsed object is rejected, not verified | **FAIL** | **FAIL** | pass |
| **persistent idempotency** — a new process still sees the duplicate | **FAIL** | **FAIL** | pass |
| **retryable** — a failed ledger write releases the claim | **FAIL** | **FAIL** | pass |
| **no false success** — a 500 never says `recorded` | **FAIL** | **FAIL** | pass |
| concurrent delivery → 409, written once | **FAIL** | **FAIL** | pass |
| strict amount format (`1e3`, `' 5 '`, numeric rejected) | **FAIL** | **FAIL** | pass |
| negative events noted, never credited | **FAIL** | **FAIL** | pass |
| **append-only** — two captures ⇒ two rows | **FAIL** | pass | pass |

---

## 1. DASHBOARD CREDENTIAL REMOVAL — PREPARED, NOT APPLIED

**Credential values are deliberately absent from this report and from every
proposed patch file.** A removal diff necessarily contains the line it deletes,
so I have **specified** these two edits rather than writing the secrets into an
artifact. Generate the diffs locally at apply time.

| # | File | Baseline blob | Edit |
|---|---|---|---|
| 1a | `francisco-holdings-site/dashboard-v3/cisco1170.js` | `9ebb0bf89bfb5d0860fe62b10b86ba07f481570b` | **delete the file** (119 lines) |
| 1b | `francisco-holdings-site/dashboard-v3/index.html` | `fd2287e6417be2e48b62fc421866890f1fcff356` | delete line **8** (`<script src="cisco1170.js">`) |
| 1c | `francisco-holdings-site/empire-dashboard.html` | `1a801435096487638e8fa2012a5f1ef0705b446e` | delete the gate: line **579** (the secret), the `unlock()` function at **581-596**, the `sessionStorage` session at **588/598**, and the lock markup at **320-324** |

**Rotation.** Both values must be rotated through your own channel. I cannot and
will not set a credential, and **I will not claim rotation has happened.**
Rotating alone is insufficient: a new value in the same files is exposed on the
next deploy. Removal and rotation go together.

**Architecture recommendation — and the reason it is required, not stylistic:**
`deploy-francisco-holdings.yml:32-90` pushes static files to a GitHub Pages
repo. **Pages executes no server-side code**, so Argon2id hashing, sessions,
server-side rate limiting and enrollment authorization are all impossible there.
Put the protected dashboard behind **`avatar-lab/server.js`**, which already
binds `127.0.0.1` (`:12`, `:157`), already enforces the authority gate
server-side, and already carries the proposal-only / no-payment /
no-credential / no-production boundaries. **Do not expose it publicly.**

**Not done, per your instruction:** the live dashboard was not moved, its gate
was not removed, and deployment architecture was not changed. **Awaiting the
architecture decision.**

**Three-entry enrollment is retained as a UI requirement.** The server
re-verifies `p1 === p2 === p3`, so a crafted request sending one field is
rejected — but **repeated entry is never treated as authentication.** Authority
comes from a one-time, server-minted, single-use, 15-minute enrollment token
printed to the terminal and written `0600`; possession requires machine access.
Full design: `06-dashboard-enrollment-design.md` §3–§7.

**Correction retained:** `dashboard-v3` is **CSS-based** — 0 three.js, 0 WebGL,
0 `<canvas>`. It is not a 3D/WebGL dashboard and this report claims no such
capability. The visual identity to preserve is the `empire-v3.css` palette
(`--void #050508`, `--cyan #00D4FF`, `--gold #C9B896`) with Orbitron type.

---

## 2. MIDDLEWARE ORDERING + 4. LOOPBACK BIND — ONE PATCH, TESTED

Both touch `agents/backend/server.js`, so they are **one patch** — no parallel
edits to the same file.

| | |
|---|---|
| File | `agents/backend/server.js` |
| Baseline blob | `e4594faf85dc08ca0ca84e071f5f42e68085a79a` |
| Baseline sha256 | `214c0420cfa3ad1a019242cd3b131e6a…` |
| Proposed blob | `4ed928ebd24945e6e7170e0efe23704ecfb03de1` |
| Proposed sha256 | `d32f84590e90f7798022a4b1876b1d13…` |
| Patch | `proposed/server-js-ordering-and-bind.patch` |
| Verified | `node --check` → OK |

```diff
@@ -52,6 +52,13 @@
   allowedHeaders: ['Content-Type', 'Authorization'],
 }));
+// ── Payment routes (PayPal Orders API) ──
+// MUST stay above express.json(): the webhook's express.raw() can only see the
+// raw bytes if no body parser has consumed them first. PayPal signature
+// verification is computed over the transmitted bytes, not a re-serialization.
+const { registerPaymentRoutes } = require('./paypal-service');
+registerPaymentRoutes(app);
+
 app.use(express.json({ limit: '32kb' }));
@@ -176,10 +183,7 @@
-// ── Payment routes (PayPal Orders API) ──
-// Registered before express.json() to preserve raw body for webhook
-const { registerPaymentRoutes } = require('./paypal-service');
-registerPaymentRoutes(app);
 const PORT = process.env.PORT || 3001;
-app.listen(PORT, () => console.log('PrimeDox AI Backend on port', PORT));
+const HOST = process.env.BIND_HOST || '127.0.0.1';
+app.listen(PORT, HOST, () => console.log(`PrimeDox AI Backend on ${HOST}:${PORT}`));
```

The old comment at `:180` asserted the registration was above `express.json()`.
It was 27 lines **below** it. The patch makes the code match the comment.

Loopback becomes the **default**; `BIND_HOST` is an explicit opt-out, so going
public is a decision someone makes rather than the default.

### Companion: `agents/backend/docker-compose.yml`

Baseline blob `d874c7af282f6a52737e0d7c50cf1ad0e17095e1` → proposed
`69a126094f6109dc9b05cd14e846a65217250d82`. Patch: `proposed/compose-loopback.patch`.

```diff
     ports:
-      - "${PORT:-3001}:3001"
+      - "127.0.0.1:${PORT:-3001}:3001"
```

**Remaining limitation:** `agents/backend/Dockerfile:17` is
`CMD ["node","gemma-server.js"]`, not `server.js`, and `:15` is `EXPOSE 3001`.
The image's default entrypoint is a different service. **Not changed** — out of
this patch's scope, and it needs your decision on what the image is for.

---

## 3. WEBHOOK HARDENING v2 — COMPLETE, DISCONNECTED

`proposed/webhook-guard-v2.js` + `proposed/idempotency-store.js`.
**Not wired to any live payment path**, per your instruction.

| Requirement | How |
|---|---|
| Fail-closed signature verification | unset `PAYPAL_WEBHOOK_ID`, missing headers, **or a throwing verifier** ⇒ 401 |
| **Raw-body enforcement** | a non-`Buffer`/non-string body ⇒ **401 `raw_body_unavailable`**. The guard refuses to "verify" a re-serialized object — it fails rather than pretend |
| **Persistent idempotency** | file-per-event store; atomicity from `O_EXCL` (`flag:'wx'`), which is atomic on POSIX |
| **Retry after failure** | `claim → process → commit`. A failed ledger write calls `release()`, so the id stays available for PayPal's redelivery |
| Unique identifiers | `event_id` **and** `capture_id`, both `UNIQUE` in the schema |
| Append-only history | `appendTransaction`, never upsert |
| Amount/currency validation | currency `^[A-Z]{3}$`; amount must match `^\d{1,9}(\.\d{1,2})?$` **as a string** — `1e3`, `' 5 '`, `0x10` and numerics are all rejected |
| Duplicate / out-of-order | duplicates ⇒ 200 `duplicate`; a held lease ⇒ **409** so PayPal retries; DENIED/REVERSED/REFUNDED noted, **never credited** |
| **No false success** | a 500 response never contains `recorded:true`; validation runs **before** the claim, so an unprocessable event never consumes an id |
| Stale lease | a dead worker's claim expires after `leaseMs` and becomes retryable — one worker cannot block an event forever |

### Remaining limitations — stated plainly

1. **Actual PayPal signature verification is NOT proven.** All 16 tests inject
   the verifier. **Nothing here establishes that PayPal's
   `/v1/notifications/verify-webhook-signature` call works against real
   headers.** That needs an authorized sandbox run. **Do not call this
   production-ready.**
2. **File-based store assumes a single host** with a POSIX filesystem. For
   multiple instances, swap in the `payment_transactions.event_id UNIQUE`
   constraint as the claim — the schema already supports it.
3. **The capture-redirect path is untouched.** Today's only ledger write is in
   `/api/payment/success` (`paypal-service.js:147-170`) and still upserts
   `onConflict:'email'`. Wiring the webhook is a **separate, authorized** step.
4. No end-to-end test exists. No PayPal call was made, sandbox or live.

### 5. Append-only ledger — `proposed/transactions-table.sql`

Designed **before** proposing revenue totals, as you required.

- `capture_id` and `event_id` both `UNIQUE` — database-level idempotency
  independent of the app store
- `amount_minor bigint` as the source of truth; **no floats**
- `revoke update, delete` plus `do instead nothing` rules — **append-only
  enforced by the database, not by convention**
- Corrections go to a separate `payment_adjustments` table; rows are never edited
- `paypal_mode` recorded, and `revenue_summary` counts **live only** — sandbox
  never appears as revenue
- `source` column records which path wrote the row
- `revenue_summary` returns **aggregates only**: counts, sums, first/last dates.
  No email, no payer id, nothing row-level

**Why this matters:** `subscribers` with `onConflict:'email'` means a repeat
customer **overwrites** their first purchase. **A revenue total cannot be
computed from it.** Any dashboard figure drawn from that table under-counts
while looking authoritative.

---

## A. GREEN BLAST REVENUE READINESS

**Flagship offer — Green Blast AI Business Opportunity & Automation Diagnostic,
$500 CAD.** Currency fixed to CAD per this directive, resolving the
CAD/USD inconsistency in `revenue-sprint/2026-10-28/`.

| | |
|---|---|
| **Ideal customer** | Owner-operated Canadian business, 2–20 staff, already paying for software, no in-house technical lead, suspects admin work is costing money |
| **Problem solved** | They cannot tell which process to automate first, or what it would be worth |
| **What they receive** | A 90-minute recorded working session, plus a written diagnostic: the three highest-value automatable processes, hours-recovered estimates **with the arithmetic shown from their own numbers**, implementation complexity per item, risks and limitations, a prioritized roadmap, and measurable success criteria |
| **Process** | Intake → 90-min session → analysis → written report → 30-min walkthrough |
| **Turnaround** | Report within **5 business days** of the session |
| **Included** | The session, the report, one walkthrough, one round of clarifying questions |
| **Excluded** | Implementation, code, software purchased on their behalf, ongoing support, **and any guaranteed savings figure** |
| **Customer responsibilities** | Attend the session, provide real operational numbers (volumes, hours, rates), name one decision-maker |
| **Price and terms** | $500 CAD, payable in full before the session. Refundable in full if cancelled before the session begins |
| **Next step after** | A fixed-scope implementation quote, or nothing — **the diagnostic stands alone and is useful if they never buy again** |

**No guaranteed outcomes.** Estimates are shown as arithmetic from the
customer's own inputs, labelled as estimates. **Note:**
`gap-scanner.js:223-303` carries hardcoded `monthly_value_cad` constants —
those are assumptions and **must not be presented to a customer as findings**.

### Customer journey — where it actually breaks

| # | Step | State |
|---|---|---|
| 1 | Discovers Green Blast | **BROKEN** — no Green Blast page exists anywhere |
| 2 | Understands the offer | **BROKEN** — no offer page; `strategy-session.html` absent |
| 3 | Submits an inquiry | **BROKEN** — `fhi-intake.js:32 ENDPOINT:''` ⇒ `status:'not_configured'` (honest, but captures nothing) |
| 4 | FHI receives it | **BROKEN** — nothing transmits |
| 5 | Receives a response | manual, works |
| 6 | Reviews terms | **MISSING** — no terms document |
| 7 | Gets a payment option | **PARTIAL** — `paypal.me/techpetcage` **never tested**; 14 of 20 buttons open an amountless page |
| 8 | Payment independently confirmed | **BROKEN** — the only ledger write needs the browser to return; webhook is a stub |
| 9 | Work delivered | manual, feasible |
| 10 | Final report + next step | **MISSING** — no template |

**Smallest fixes to make the journey testable, in order:** set
`fhi-intake.js` `ENDPOINT` (step 3–4); add the 14 missing `PAYPAL_LINKS` entries
on `main` (step 7, CDN-served, no site deploy); build one offer page reusing
`assessment.html` as the template (steps 1–2, 6); apply the webhook guard + ledger
(step 8).

**Two-customer path to $1,000:** 2 × $500 CAD. **Steps 1–4, 6, 8 and 10 are all
broken**, so this is not currently sellable. Meanwhile **six CCLDR products
already take money correctly** via the CDN-served `main` copy ($99/$149/$299/
$499/$999/$1,499) — two Practitioner sales is $998 with **no code change**. The
constraint there is delivery capacity, which I cannot verify from the repo.

**Verified gross revenue to date: $0.00.**

---

## D. PHOENIX CORE AND AVATARS — governance gap retained

**Verified capabilities** (by execution, this and prior sprints): council
lifecycle **27/27**; engine runs with no API key and records honestly
(`stage: INTAKE`, `aiRuntimeStatus: ERROR`, `verification: null`, all five
authority flags `false`, case file `0600`); avatar-lab serves 3 avatars;
`POST /api/council` returns `mode:"proposal-only"`, `humanApprovalRequired:true`.

**Governance weaknesses, unchanged and unfixed:**

1. **`phoenix-core/routes/control.js:22`** reports
   `executed_by: "Phoenix Core"` for work never performed. This is the
   "reports execution when it only routed a proposal" defect you named.
2. **No task-status vocabulary.** Phoenix Core has no representation of
   Proposed / Approved / Executing / Completed / Failed / Blocked. Proposed
   schema addition:
   `status ∈ {PROPOSED, APPROVED, EXECUTING, COMPLETED, FAILED, BLOCKED}`,
   with `COMPLETED` writable **only** on evidence of completed work — never on
   persistence or routing. `council-engine.js:135-136` already does the right
   thing for stages (`outcome.complete > 0 ? "SPECIALIST_ANALYSIS" : "INTAKE"`)
   and is the pattern to extend.
3. **Vigilax is not independent.** `ai-runtime.js` sends **one identical prompt**
   to all three executives in parallel. Per your transparency requirement:
   **Vigilax must not be represented as independent verification** while it
   shares both the provider and the prompt. Fix: build each executive's prompt
   from its own `assignment` string and withhold the others' output from Vigilax.
4. Provider-independent layer: `openai-provider.js` (`gpt-6-astra`) and
   `xai-provider.js` (`grok-4.7`) are implemented, opt-in, `analysis-only`,
   `humanApprovalRequired:true` — and **wired to no router**. Both model IDs
   verified against vendor docs. No live provider call was made.

---

## E. SECURITY FINDINGS — RANKED

| Sev | Finding | Location | Fix | Approval |
|---|---|---|---|---|
| **CRITICAL** | **Forgeable human approval.** 10 routes, zero auth; `approved_by` from the request body defaulting to the owner's name; written to Supabase as the audit record | `zprimedox-ai-graph/app/main.py`, `nodes/human_gate.py:115`, `nodes/deliver.py:49` | auth dependency + delete the default | **YES** |
| **CRITICAL** | Two gate credentials in delivered client code, both live | `dashboard-v3/cisco1170.js`, `empire-dashboard.html` | §1 | **YES — rotation is yours** |
| **CRITICAL** | Webhook fails open; stub; no idempotency | `paypal-service.js:106`, `:195-218` | guard v2 | **YES** |
| **HIGH** | Browser-side Stripe secret entry, **still present** | `revenue-dashboard/index.html:398,574-578`; `revenue-v2.html:341,592` | retire the key-entry path | **YES** |
| **HIGH** | Payment backend binds all interfaces | `server.js:185`, `docker-compose.yml:56` | §2/§4 patch | **YES** |
| **HIGH** | Unauthenticated LLM routes, no rate limit | `main.py:131,336` (limiter exists, only on `:385`) | apply the existing limiter | **YES** |
| **HIGH** | Redis no password; Postgres `primedox:primedox`; both `ENVIRONMENT=production` | `zprimedox-ai-graph/docker-compose.yml:28`, `infra/docker/docker-compose.yml:11,17` | loopback + `--requirepass` | **YES** |
| **HIGH** | `rk_live_` Stripe restricted key exposed in chat; **rotation unverified** | `empire-progress-report.html:709` | rotate | **YES — only you** |
| **MEDIUM** | `/api/command` claims execution | `control.js:22` | truthful status | **YES** |
| **MEDIUM** | Error messages leak internals | `paypal-service.js:215`, `routes/services.js:11` (500 + stack) | generic bodies | **YES** |
| **MEDIUM** | Brand-spelling gates inverted on both feature branches (correct on `main`); 26 workflows armed on `MEva6` | `deploy-omni-guard.yml:19`, `deploy-omniaguard.yml:20` | restore the patterns | **YES** |
| **LOW** | `addAgent()` unvalidated disk write, currently unrouted | `phoenix-core/agents/registry.js:10-15` | keep unrouted | no |

**Competitor intelligence:** inspected again — **no implementation exists**, in
any form. Plans only, no scanner, no scheduled job. I created neither.

---

## F. TEST EVIDENCE

| Command | Result | Status |
|---|---|---|
| `node --test webhook-guard-v2.test.js` | 16 pass / 0 fail | **PASS** |
| `GUARD=./control-current.js node --test webhook-guard-v2.test.js` | 2 pass / **14 fail** | **PASS (negative control)** |
| `GUARD=./control-v1.js node --test webhook-guard-v2.test.js` | 9 pass / **7 fail** | **PASS (negative control)** |
| `node --check proposed/webhook-guard-v2.js` / `idempotency-store.js` | OK | **PASS** |
| `node --check` on the patched `server.js` | OK | **PASS** |
| `node --test …/council/tests/council-lifecycle.test.js` | 27 pass / 0 fail | **PASS** |
| `node --test shared/lead-capture/tests/fhi-intake.test.js` | 23 pass / 0 fail | **PASS** |
| `node --test agents/backend/tests/scanner-smoke.test.js` | 25 pass / 0 fail | **PASS** |
| `node --test agents/backend/tests/marketplace-claims.test.js` | 12 pass / 0 fail | **PASS** |
| `node --test .github/workflows/tests/deploy-safety.test.js` | 9 pass / 0 fail | **PASS** |
| **Real PayPal signature verification** | — | **NOT RUN — needs authorized sandbox** |
| End-to-end payment journey | — | **NOT RUN — would be a real transaction** |
| `paypal.me/techpetcage` reachability | — | **NOT RUN** |
| Dashboard enrollment implementation | — | **NOT RUN — architecture decision pending** |
| `zprimedox-ai-graph` Python suite | — | **NOT RUN — no venv; defects found by source review** |
| Phoenix Core route tests | — | **BLOCKED — `phoenix-core/` is on `main`, not this branch** |
| Avatar model conversation | — | **BLOCKED — no API key, no SDK; installed neither** |

---

## G. PRESERVED WORK

17 held changes at start, **17 at end**. No `reset`/`clean`/`stash`/`restore`.
No file, backup, patch or untracked artifact deleted, renamed or overwritten.
**C3 on HOLD.** Termux unreachable, never touched. Only additions:
`07-controlled-execution-handoff.md` and six files in `proposed/`.

**One disclosure.** While locating the exact extent of the gate in
`empire-dashboard.html`, a `grep` printed line 579 — which contains the
credential — into a tool result you can see. That was my error; the value is in
**no** report, patch or artifact, and I have not repeated it. It does not change
the exposure (the line is already public in the deployed page) but you should
know it appeared.

---

## H. APPROVAL QUEUE

| # | Decision |
|---|---|
| **1** | **Rotate both dashboard credentials.** Live in page source now. Only you. |
| **2** | **CRITICAL — authorize the `zprimedox-ai-graph` auth fix?** Forgeable approval attributed to you, written to Supabase as the audit record. Retained as a separate critical finding, as you asked. |
| **3** | **Dashboard architecture: behind `avatar-lab` (loopback), or accept the pages are public and remove the gates?** Blocks all enrollment work. |
| **4** | Apply the `server.js` ordering + bind patch (blob `e4594faf` → `4ed928eb`)? |
| **5** | Apply the compose loopback patch (blob `d874c7af` → `69a126094`)? |
| **6** | Create `payment_transactions` + `payment_adjustments`? Needed before any revenue total. |
| **7** | Authorize an **authorized sandbox** PayPal run to prove real signature verification? Until then the guard is untested against PayPal. |
| **8** | Connect the guard to real payment writes? **Explicitly not done.** |
| **9** | Set `fhi-intake.js` `ENDPOINT` — to which service? |
| **10** | Add the 14 `PAYPAL_LINKS` entries on `main`? Needs confirmed prices; I will not infer them from product IDs. |
| **11** | Verify `paypal.me/techpetcage` resolves. One click. Six working products depend on it. |
| **12** | Rotate the `rk_live_` Stripe restricted key. |
| **13** | Build one Green Blast offer page, or push the Termux `strategy-session.html`? |
| **14** | Per-executive council prompts, so Vigilax is genuinely independent? |
| **15** | **Commit the now-nine report/artifact files?** Explicitly **not** done — no commit authorization was given or assumed. |

---

## I. CURRENT STATE

```
branch:   claude/revenue-intake-review
HEAD:     056ac1970ba8c2b631f4abd84530a8d80803bb46
worktree: 17 held changes + 9 new untracked documentation/artifact files
staged:   0
```

**Committed: no. Pushed: no. Merged: no. Deployed: no. CI triggered: no.**
**External systems modified: none** — no payment, email, DNS, production
database, live site, credential, paid API call, installation or subscription.
