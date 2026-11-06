# FHI — RANKED SECURITY REMEDIATION PLAN

Date: 2026-11-05 · Mode: read-only audit + isolated patch preparation
Repository: `franciscoderek7/primedoxai-deploy` @ `claude/revenue-intake-review` `056ac19`

**Nothing was applied, committed, pushed, merged, deployed or triggered. No real
payment, email or external API call. No credential printed or transmitted. All
17 held changes preserved; C3 on HOLD.** Proposed files live in
`revenue-sprint/2026-11-05/proposed/`, outside the active source tree.

---

## RANKED PLAN

| # | Severity | Finding | Fix size | Approval needed |
|---|---|---|---|---|
| **1** | **CRITICAL** | **Two** gate credentials published in client-side JS on a live site | rotate + remove | **Rotation is yours alone** |
| **2** | **CRITICAL** | PayPal webhook **fails open**; no replay defence; no field validation | patch ready, 12 tests | apply to `main` |
| **3** | **CRITICAL** | `zprimedox-ai-graph` approver forgeable, 10 routes unauthenticated | design below | architecture decision |
| **4** | **HIGH** | Payment backend binds all interfaces; compose publishes it | 1 line + 1 line | apply |
| **5** | **MEDIUM** | Revenue panel needs an aggregate endpoint that cannot leak customers | design below | build decision |

---

## PRIORITY 1 — EXPOSED DASHBOARD CREDENTIALS

### There are TWO, not one

| # | File:line | Secret | Live? |
|---|---|---|---|
| 1 | `francisco-holdings-site/empire-dashboard.html:579` | `const PW = '…'` | **YES** |
| 2 | `francisco-holdings-site/dashboard-v3/cisco1170.js:3` | `var CODE = '…'` | **YES** |

**The two values differ** — they are separate secrets, both exposed. Values are
withheld from this report; both are readable in page source today.

`dashboard-v3/index.html:8` loads `cisco1170.js`, so the second gate is active
on that page.

### Deployment targets — confirmed

Both files sit under `francisco-holdings-site/`.
`.github/workflows/deploy-francisco-holdings.yml:3-9` triggers on
`francisco-holdings-site/**` and `:45` copies every `*.html` and `*.js`
**recursively**, so `dashboard-v3/cisco1170.js` ships too.

| Live site | Serves these files | Confirmed by |
|---|---|---|
| **franciscoholdingsinc.com** (repo `franciscoderek7/francisco-holdings`) | **both** | workflow path + extension allowlist + `CNAME` written at `:58` |

Checked and **clear**: the cloned live `franciscoderek7/omniaguard` and
`franciscoderek7/zprimedoxaihq` trees contain neither string.

### Recommended rotation — yours to perform

1. Treat **both** values as compromised. Anyone who has loaded either page may
   hold them.
2. Rotate through your own authorized channel. **I cannot and will not set a
   credential.**
3. **Rotating alone is not enough.** A new value pasted into the same files is
   exposed the moment the next deploy runs. Rotation must be paired with
   fix #4 below.
4. Until then, treat both dashboards as **public pages**. Do not put anything
   behind them you would not publish.

### Why "three password entries" does not help

A three-entry prompt changes how a human types, not what the file contains.
`cisco1170.js:100` compares `input.value.trim() === CODE`, where `CODE` is in
the delivered file. **An attacker never types anything** — they read the source,
or they call whatever the gate protects directly. Repeating entry adds friction
for the legitimate user and none for anyone else.

What `cisco1170.js` does have is worth keeping: a 24h session TTL, a 5-minute
lockout, and both in `localStorage` (`:3-7`, `:31-39`). **The lockout logic is
sound — it is the client-side comparison that is worthless.**

### Proposed enrollment design — NOT implemented

Server-side, one-time, with a protected setup state:

```
State A — UNPROVISIONED (first use)
  GET  /admin/enroll      → setup form, ONLY while no credential record exists
  POST /admin/enroll      { password, confirm }
     · reject unless password === confirm
     · reject weak input (length ≥ 12; reject the two rotated values explicitly)
     · hash with argon2id (or bcrypt cost ≥ 12) — NEVER store or log plaintext
     · persist the hash server-side; flip state to PROVISIONED
     · ATOMIC: if a record already exists → 409, never overwrite
State B — PROVISIONED
  GET  /admin/enroll      → 404 (the setup route stops existing)
  POST /admin/login       { password }
     · constant-time compare against the stored hash
     · on success issue an HttpOnly, Secure, SameSite=Strict session cookie
     · rate-limit: 5 attempts / 15 min / IP, then the existing lockout
  Every dashboard route → require a valid session server-side
```

**Non-negotiables.** No password, hash or comparison in client-side code. The
client holds only an opaque session cookie it cannot forge. The enrollment route
must be unreachable once provisioned — otherwise it is a credential-reset
endpoint for anyone.

**This needs a server.** The dashboards are static files on GitHub Pages, which
cannot do any of the above. **That is the real decision in Priority 1:** either
host these dashboards behind a server (`avatar-lab` already is one, on
loopback), or accept they are public and remove the gates rather than imply
protection that does not exist.

**I have not written this patch.** It changes authentication and the brief
forbids implementing it without approval.

---

## PRIORITY 2 — PAYPAL WEBHOOK SECURITY

### 1. Current signature behaviour — FAILS OPEN

`agents/backend/paypal-service.js:105-106`

```js
async function verifyWebhookSignature(headers, rawBody) {
  if (!process.env.PAYPAL_WEBHOOK_ID) return true;
```

With `PAYPAL_WEBHOOK_ID` unset — **the default** — every webhook verifies as
valid. The route at `:197-202` then proceeds.

### 2–5. What the handler does and does not do

Full handler, `:195-218`. Verified by reading every line:

| Requirement | Today | Evidence |
|---|---|---|
| Fail closed on missing config | **NO** — fails open | `:106` |
| Verify event identifier | **NO** — `event.id` never read | `:206-210` |
| Verify resource/capture identifier | **NO** — `resource.id` never read | `:207-208` |
| Duplicate / replay handling | **NONE** — no event-id store of any kind | whole handler |
| Verify amount | **NO** — read only to interpolate into a log line | `:208-209` |
| Verify currency | **NO** — never read | — |
| Verify order ID | **NO** — never read | — |
| Verify capture status | **NO** — only `event_type` is compared | `:206` |
| Updates the ledger | **NO** — it only `console.log`s | `:209` |
| Error handling | **leaks** `err.message` to the caller | `:215` |

**A correction to my own earlier report.** I described the webhook as a path
that records payments. It does not. **The only ledger write is in the
`/api/payment/success` redirect handler** (`:147-170`), which calls
`captureOrder` then upserts to Supabase. The webhook is a **logging stub**.

That changes the risk shape: a forged webhook cannot currently create a false
ledger entry, because the webhook writes nothing. It can pollute logs and, more
importantly, **the moment anyone wires the webhook to the ledger — the obvious
next step — the fail-open becomes a direct ledger-forgery path.** Fix it before
that, not after.

### A second, subtler defect: the raw body never reaches the verifier

`paypal-service.js:196` states the requirement:

> `// Note: must be registered BEFORE express.json() middleware so we get raw body`

and `agents/backend/server.js:180` repeats it. **The code does the opposite.**
`server.js:55` applies `express.json({limit:'32kb'})`; `registerPaymentRoutes(app)`
is called at `:182` — **27 lines later**. Express runs middleware in
registration order, so `express.json()` parses the webhook body first and
`express.raw()` at `:198` sees a body already consumed.

Consequence: `verifyWebhookSignature` receives a **parsed object**, not the
transmitted bytes. It passes that object on as `webhook_event`. PayPal's
verify-webhook-signature API may tolerate a re-serialized event, so I am
**not** claiming verification is definitely broken — I could not test it without
calling PayPal, which is out of scope. **I am claiming the code violates its own
stated precondition, and that signature verification over re-serialized JSON is
not reliable.** Either move the registration above `:55`, or mount the webhook
on its own router before the JSON parser.

### Proposed patch — written and tested

`revenue-sprint/2026-11-05/proposed/webhook-guard.js` (74 lines). Every network
dependency is injected, so it is fully testable with no PayPal call.

What it does:
- **Fails closed** on missing `PAYPAL_WEBHOOK_ID`, on missing signature headers, and when the verifier **throws**
- Requires `event.id`, and **rejects a replay** of any id seen in the last 24h
- Validates before any ledger write: `status === 'COMPLETED'`, capture id present, order id present, currency matches `^[A-Z]{3}$`, amount finite and `> 0`
- Returns **422** for an unprocessable capture, **400** for a malformed body, **401** for a rejected signature — and **never echoes an internal message**
- Accepts a raw `Buffer` body, so it works once the ordering is fixed
- Records **only** the five verified fields

### Test results — exact commands and outcomes

```
$ node --check webhook-guard.js
syntax OK

$ node --test webhook-guard.test.js
# tests 12   # pass 12   # fail 0
```

| # | Case | Result |
|---|---|---|
| 1 | missing config → 401, nothing recorded | **PASS** |
| 2 | invalid signature → 401 | **PASS** |
| 3 | verifier throws → fails **closed** | **PASS** |
| 4 | missing signature headers → 401, verifier never called | **PASS** |
| 5 | valid signature + valid capture → 200, recorded once, verified fields | **PASS** |
| 6 | **duplicate event id → 200 but NOT recorded again** | **PASS** |
| 7 | status not COMPLETED → 422 | **PASS** |
| 8 | missing order id → 422 | **PASS** |
| 9 | bad currency / bad amount → rejected | **PASS** |
| 10 | other event types acknowledged, not recorded | **PASS** |
| 11 | malformed body → 400, no message leak | **PASS** |
| 12 | raw Buffer body accepted | **PASS** |

**Negative control — the suite is not vacuous.** I replicated today's
behaviour (`current-behaviour.js`, a faithful transcription of `:105-215`) and
ran the identical 12 tests against it:

```
$ node --test control.test.js
# tests 12   # pass 2   # fail 10
```

**10 of 12 fail against the current code**, including every fail-closed case,
the replay defence and all field validation. Only "invalid signature when config
*is* set" and "Buffer body" pass today.

---

## PRIORITY 3 — BACKEND NETWORK EXPOSURE

### 1. Actual listening interface and port

`agents/backend/server.js:184-185`

```js
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log('PrimeDox AI Backend on port', PORT));
```

**No host argument** → Node binds `0.0.0.0`, all interfaces. Port **3001**.
This process carries the payment routes (`:181-182`).

### 3. Deployment configuration **does** push it public

| File:line | Effect |
|---|---|
| `agents/backend/docker-compose.yml:56` | `"${PORT:-3001}:3001"` — **publishes on all host interfaces** |
| `agents/backend/Dockerfile:15` | `EXPOSE 3001` |
| `agents/backend/Dockerfile:17` | `CMD ["node","gemma-server.js"]` — the image's default is **not** `server.js` |
| `api/Procfile:1` | `--host 0.0.0.0` — a different service (FastAPI `api/`), also public |

So nothing overrides the host toward loopback; two files push the other way.

### 2. Proposed loopback configuration — NOT applied

```diff
-app.listen(PORT, () => console.log('PrimeDox AI Backend on port', PORT));
+const HOST = process.env.BIND_HOST || '127.0.0.1';
+app.listen(PORT, HOST, () => console.log(`PrimeDox AI Backend on ${HOST}:${PORT}`));
```

```diff
-      - "${PORT:-3001}:3001"
+      - "127.0.0.1:${PORT:-3001}:3001"
```

Loopback **by default**, with `BIND_HOST` as the explicit, deliberate opt-out —
so going public becomes a decision someone makes, not the default.

### 4. Authentication and rate-limiting requirements

`server.js` already has `helmet` (`:46`), CORS (`:47`), `express.json` capped at
32kb (`:55`) and a limiter on `/chat` (`:59`). **The payment routes have
neither auth nor a rate limit.**

Minimum before any public exposure:
- `POST /api/payment/create-order` — rate-limit per IP; cap and allow-list the `amount`, or the endpoint mints arbitrary-value PayPal orders in your account's name
- `POST /api/payment/webhook` — no auth (PayPal cannot send one); **the signature IS the authentication**, which is exactly why fail-open matters
- `GET /api/payment/success` — rate-limit; it triggers a capture

**The model to copy is already in the repo.** `vigilax-backend/server.js` does
this properly: `requireApiKey` on all 11 sensitive routes (`:45`), two limiters
(`:73-74`), helmet, CORS allow-list. It is the best-engineered backend here.

---

## PRIORITY 4 — REVENUE PIPELINE: SOURCE EVIDENCE vs VERIFIED BEHAVIOUR

| Stage | Source-code evidence | End-to-end verified? |
|---|---|---|
| 1. Create order | `paypal-service.js:47-75` → `POST {BASE}/v2/checkout/orders`, returns `orderId`, `approvalUrl`, `status` | **NO** |
| 2. Customer approval | `approvalUrl` from the `rel:"approve"` link; `appUrl` from `APP_URL` (default `https://franciscoholdingsinc.com`) | **NO** |
| 3. Capture | `:78-103` → `POST /v2/checkout/orders/{id}/capture`; extracts captureId, amount, currency, payerEmail, payerId | **NO** |
| 4. Verified webhook | `:195-218` — **a logging stub.** Fails open, no replay defence, writes nothing | **NO — and it is not a ledger path at all** |
| 5. Supabase ledger | `:161-170` upsert to `subscribers` on `onConflict: 'email'` — but **only from the `/api/payment/success` redirect**, not the webhook | **NO** |
| 6. Customer notification | `:174` `sendTrialWelcome`, wrapped in try/catch so a missing email config cannot break capture | **NO** |

**Nothing in this pipeline has been verified end-to-end.** Every row is read
from source. No PayPal call was made, in sandbox or live.

**Three structural observations.**

1. **The ledger depends on the customer's browser returning.** The only write is
   in the success redirect. If the customer pays and closes the tab, the capture
   may succeed at PayPal with **no ledger row**. The webhook exists precisely to
   cover that — and it writes nothing. **This is the gap that makes Priority 2
   urgent beyond its security value.**
2. **`onConflict: 'email'`** means a second purchase by the same email
   **overwrites** the first. There is no transaction history, only current state.
   A revenue total cannot be computed from this table.
3. **Sandbox by default** (`:17-19`, live only when `PAYPAL_MODE === 'live'`) —
   a genuinely good fail-safe, worth preserving.

---

## PRIORITY 5 — DASHBOARD REVENUE PANEL

Proposed endpoint, **not implemented**: `GET /api/revenue/summary` on
`avatar-lab/server.js` (already loopback-bound).

```
Response, on success:
  { status: "ok",
    paid_count:       <integer>,
    totals:           [ { currency: "CAD", sum: <number> } ],
    first_payment_at: <ISO date or null>,
    last_payment_at:  <ISO date or null>,
    as_of:            <ISO timestamp> }

Response, unconfigured:
  { status: "not_configured" }      → panel renders "NO DATA"
Response, ledger unreachable:
  { status: "unavailable" }         → panel renders "NO DATA"
```

**Guarantees.**
- **Aggregates only.** No email, payer id, order id, capture id or row-level record ever crosses to the browser. The SQL selects `count(*)`, `sum(amount_cad)` grouped by currency, `min/max(paid_at)` — individual rows are never selected.
- `SUPABASE_SERVICE_KEY` is read server-side from the environment and **never sent to the client** — the opposite of the `revenue-v2.html` pattern.
- **No Stripe or PayPal secret is ever accepted from a browser.** Retire `revenue-dashboard/revenue-v2.html`'s key-entry path rather than port it.
- **Fails honest.** Unconfigured or unreachable renders **NO DATA**, never `$0`. Zero is a measurement; absence is not.
- Requires the Priority 1 session gate before it is reachable.

**Prerequisite:** worthless until `agents/backend` is deployed — and it must not
be deployed before Priority 2 and Priority 3 land. Note also observation 2
above: with `onConflict: 'email'`, these sums under-count repeat customers. **A
correct revenue panel needs a transactions table, not the `subscribers` table.**

---

## PRIORITY 6 — FORGED APPROVER IN `zprimedox-ai-graph`

### The defect

`app/main.py` declares **10 routes and zero authentication** — no `Depends`, no
API-key header, no bearer check. `POST {api_prefix}/run/{thread_id}/resume`
(`:288`) forwards a client-supplied body into the graph (`:307`), and
`app/nodes/human_gate.py:115` supplies the identity:

```python
approved_by = human_input.get("approved_by", "Derek Francisco")
```

On `action == "approve"`, `nodes/deliver.py:49` writes that name into Supabase
as the approval record. **Anyone who can reach the API can approve a workflow
and have it recorded as approved by you.** CORS uses `allow_origins=EMPIRE_ORIGINS`
rather than `*`, but **CORS constrains browsers, not `curl`** — it is not an
access control.

### Proposed remediation — NOT implemented

```python
# 1. One dependency, applied to every state-changing route
api_key_header = APIKeyHeader(name="X-FHI-Admin-Key", auto_error=False)

async def current_principal(key: str = Security(api_key_header)) -> str:
    expected = settings.fhi_admin_key
    if not expected:                        # unset ⇒ DENY, never allow
        raise HTTPException(503, "authorization not configured")
    if not key or not secrets.compare_digest(key, expected):
        raise HTTPException(401, "unauthorized")
    return principal_for(key)               # a real identity, not a literal

# 2. Resume takes its approver from the principal, never from the body
@app.post(f"{settings.api_prefix}/run/{{thread_id}}/resume")
async def resume(thread_id: str, human_input: HumanInput,
                 principal: str = Depends(current_principal)):
    resume_value = {
        "action":   human_input.action,
        "feedback": human_input.feedback or "",
        "edited_document": human_input.edited_document,
        "approved_by": principal,           # <-- authenticated, not client-supplied
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
```

```python
# 3. human_gate.py:115 — DELETE the default. An unattributable approval
#    must be rejected, not attributed.
approved_by = human_input.get("approved_by")
if not approved_by:
    raise ValueError("approval requires an authenticated principal")
```

Also required: remove `approved_by` from the `HumanInput` model so it cannot be
submitted at all; apply the **existing** `check_rate_limit` helper (already used
on `/widget-chat` at `:385`) to `/chat` and `/run`; and bind Redis and Postgres
to loopback with `--requirepass` (`zprimedox-ai-graph/docker-compose.yml:28`,
`infra/docker/docker-compose.yml:11,17`).

### Council behaviour — preserved, and verified preserved

None of the above touches the council. Re-verified this session by execution:

```
$ node --test …/council/tests/council-lifecycle.test.js     # 27 pass / 0 fail
```

and a fresh engine run with no API key recorded `councilPipelineStage: INTAKE`,
`aiRuntimeStatus: ERROR`, `verification: null`, and **all five authority flags
`false`** — `financialExecutionAllowed`, `legalExecutionAllowed`,
`securityExecutionAllowed`, `destructiveExecutionAllowed`,
`productionDeploymentAllowed`. Flags are set at `council-engine.js:92-96`,
**before** the AI block at `:102-115`, so no model output can alter them.
**Proposal-only behaviour is intact and must stay that way.**

---

## ISOLATED PATCH PROPOSALS — INVENTORY

| File | Lines | State |
|---|---|---|
| `proposed/webhook-guard.js` | 74 | **written, 12/12 tests pass, negative control 10/12 fail** |
| `proposed/webhook-guard.test.js` | 12 tests | written and run |
| `proposed/privacy-gate.sh` + `prohibited.txt` | from the earlier package | 10/10 |
| Priority 1 enrollment | — | **designed only** — changes authentication, needs approval |
| Priority 3 bind change | 2 lines | **specified above, not applied** |
| Priority 6 auth dependency | ~20 lines | **specified above, not applied** |

Run the webhook tests:

```bash
cd revenue-sprint/2026-11-05/proposed
node --check webhook-guard.js
node --test webhook-guard.test.js
```

No network, no PayPal, no credentials. Fictional fixtures only.

---

## DECISIONS DEREK MUST MAKE

| # | Decision |
|---|---|
| **1** | **Rotate both exposed gate credentials.** Only you can. Both are readable in page source at franciscoholdingsinc.com now. |
| **2** | **Server or no server for the dashboards?** They are static files on GitHub Pages, which cannot do server-side auth. Either host them behind a server, or **remove the gates and accept the pages are public** — the current state implies protection that does not exist. |
| **3** | **Apply the webhook guard?** Tested, fail-closed, replay-safe. Needs a commit to `main`. |
| **4** | **Fix the middleware ordering** so the raw body reaches the verifier — 1 line moved. |
| **5** | **Bind `agents/backend` to loopback by default?** 2 lines. Do this **before** it is deployed anywhere. |
| **6** | **Add auth to `zprimedox-ai-graph` and delete the `"Derek Francisco"` default?** Response shape changes for any existing caller. |
| **7** | **Build a transactions table?** `onConflict: 'email'` means the current ledger cannot produce a revenue total. A revenue panel needs this first. |
| **8** | **Deploy `agents/backend` at all?** Everything in Priorities 4 and 5 depends on the answer. |

**Sequence, if you want one: 1 → 4 → 3 → 5 → 8.** Credentials first because they
are live; ordering before the guard because the guard's verification depends on
it; binding before deployment, not after.
