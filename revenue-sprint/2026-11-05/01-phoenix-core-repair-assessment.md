# PHOENIX CORE — COORDINATED REPAIR ASSIGNMENT
## STOPPED AT BASELINE VERIFICATION — assessment delivered, patch not built

Date: 2026-11-05
Assignment baseline: `278662d9be2e482b163fa44fcdfbc4f050207c78` in `~/fhi-main-containment` (branch `main`)
**Result: baseline CANNOT be verified from this session. Per the assignment's own
instruction — "If anything has changed, stop and report the discrepancy" — I
stopped before building the patch.**

Nothing was modified, applied, committed, pushed, deployed or started. No
service was run. No secret was read.

---

## BASELINE VERIFICATION — FAILED

| Check | Expected | Actual | Verdict |
|---|---|---|---|
| Repository path | `~/fhi-main-containment` | `/root/fhi-main-containment` → **No such file or directory** | **ABSENT** |
| Baseline commit present locally | `278662d9…` | `git cat-file -t` → *could not get object info* | **NOT FOUND** |
| Baseline commit on the remote | `278662d9…` | `git fetch origin 278662d9…` → **`remote error: upload-pack: not our ref`** | **DOES NOT EXIST in `franciscoderek7/primedoxai-deploy`** |
| Branch | `main` | this session is on `claude/revenue-intake-review` @ `056ac19` | mismatch |
| Recorded target-file hashes | "hashes recorded" | **not supplied in the assignment** | **cannot compare** |
| Untracked file `tatus --short` | present, preserve | **not present on this machine** | absent |
| Modifications to `index.js`, `routes/tasks.js`, `services/task-engine.js` | present, preserve | **no phoenix-core file is modified in this working tree** | absent |

### What this means

`278662d9` is **not a commit in `primedoxai-deploy`** — the remote rejected the
fetch outright. Combined with the absent directory, the absent anomalous file,
and the absent working-tree modifications, the conclusion is firm:

> **The assignment describes a different checkout — the Termux
> `~/fhi-main-containment` tree, which this cloud session cannot reach.** It is
> either a separate repository or `primedoxai-deploy` with unpushed local
> history.

**I did not build the patch.** Building against an unverified baseline is the
precise failure the assignment's baseline-protection clause guards against: the
diff would not apply, or worse would apply with silent drift.

### What I did instead

All seven target files **do exist** on `origin/main` of `primedoxai-deploy`
(`fe20af45`). The assignment permits inspecting source files, so I inspected all
seven in full — 177 lines total — and **independently confirmed every defect
A–F**. That is the whole analytical body of work. Once you confirm a baseline,
the patch is mechanical.

### Hashes of the seven files as they exist here — for comparison with yours

Baseline: `origin/main` = `fe20af45102acfe6554001a0e3c6e2ce0c82e6ab`

| File | blob | lines | sha256 (first 32) |
|---|---|---|---|
| `core/task-router.js` | `8bd5089a` | 24 | `ec7536a2a4b799cad332ad9774039095` |
| `core/agent-registry.js` | `71adca79` | 48 | `07a663a9cd7446286f4d4d5f27908cc0` |
| `services/registry.js` | `dca605a5` | 29 | `35ceb4cb215a113013920a85c2cdb67e` |
| `routes/services.js` | `1a4fbe6f` | 15 | `ce3dc5faa1304b048528e33196f1b81a` |
| `routes/agents.js` | `3935caf6` | 13 | `e973e6eff82781c1042a72ff2c1ecee6` |
| `routes/control.js` | `0eb17593` | 29 | `08d400fbe4a475dba963def6e98af773` |
| `routes/router.js` | `64648bb9` | 19 | `a94fcbb3bb66d80d3aae5d9900916d62` |

**Compare these against your recorded hashes.** If they match, the two trees
agree on these seven files and I can build the patch against `fe20af45` on your
word. If they differ, the Termux tree has diverged and I need its copies.

---

## DEFECTS CONFIRMED — all six areas, with line references

### A — Agent registry: identities are split across two incompatible shapes

There is no canonical registry. Three files hold overlapping, differently
shaped data:

| Source | Identities | Shape |
|---|---|---|
| `core/agent-registry.js:1-33` | `phoenix-core`, `vigilax`, `primedox-ai` | `capabilities[]` |
| `data/agents.json` | `phoenix-core`, `vigilax`, `primedox-ai` | **`permissions[]`** — same agents, **different key name** |
| `agents/registry.json` | `primedox`, `revenue`, `automation`, `omniguard`, `research` | **`role` string, no capabilities at all** |

**The alias requirement is grounded in real data.** The union is 8 records but 7
distinct identities, because:

- `primedox` ("PrimeDox Executive") and `primedox-ai` ("PrimeDox AI") are the
  same agent under two IDs
- `omniguard` ("OmniGuard Sentinel", role *security monitoring*) and `vigilax`
  ("Vigilax Sentinel", capabilities *security_monitoring*) are the same agent

So `primedox → primedox-ai` and `omniguard → vigilax` are exactly the two
aliases needed. **Confirmed, not assumed.**

Also confirmed: **`data/agents.json` uses `permissions`, while
`core/agent-registry.js` uses `capabilities`.** Any canonical registry must
reconcile that, and `findAgent()` searching `capabilities` would silently find
nothing in the `data/` shape.

Status values present: `online` (phoenix-core, vigilax), `planned`
(primedox-ai), **and nothing at all** for the five in `agents/registry.json`.
The assignment's requirement to distinguish *planned / available / verified
operational* is well founded — **`status:"online"` in a JSON file is not
evidence that anything is running.**

### B — Registry API: no ID lookup, no aliases, no validation

`core/agent-registry.js:35-48` exports exactly two functions:

```js
function getAgents(){ return agents; }                    // :35 returns the live array by reference
function findAgent(capability){                           // :39
  return agents.find(a => a.capabilities.includes(capability));
}
```

Confirmed gaps: **no find-by-ID**, **no alias resolution**, **no safe resolution
of an unknown ID**, **no structure validation**, and `getAgents()` **returns the
internal array by reference** so any caller can mutate the registry in place.
`findAgent` returns `undefined` for an unknown capability — a bare `undefined`,
not a controlled result.

### C — Task routing: hardcoded substring checks, and a latent crash

`core/task-router.js` in full is 24 lines:

```js
const registry = require('./agent-registry');   // :1  REQUIRED BUT NEVER USED
function routeTask(command){
  let agent = "phoenix-core";
  if(command.includes("security")){ agent = "vigilax";     }   // :7
  if(command.includes("document")){ agent = "primedox-ai";  }   // :11
  return { command, assigned_agent: agent, routed_at: new Date().toISOString() };
}
```

Confirmed:
- Hardcoded substring matching, not capability-driven. **`registry` is imported
  at line 1 and never referenced** — the registry has no influence on routing at
  all.
- **No command validation.** `command.includes` throws `TypeError` for any
  non-string — a number, an object, `null`. This is a live crash path reachable
  from `/api/execute`.
- Priority is implicit: both `if`s run unconditionally, so a command containing
  **both** "security" and "document" always routes to `primedox-ai` because
  line 11 overwrites line 7. That ordering is accidental, not documented — and
  it is the opposite of what a security-first policy would want.
- Fallback to `phoenix-core` works (`:5`).
- It does not execute, which is correct. But the field name
  **`assigned_agent`** reads as an assignment of work rather than a proposal.

### D — API semantics: two endpoints assert things that did not happen

**`routes/router.js` — `/api/execute`:**

```js
const command = req.body.command || "unknown";   // :8  no validation; invents "unknown"
const result  = taskRouter.routeTask(command);   // :10
res.json({ accepted: true, result });            // :12-15
```

- A missing command yields the **string `"unknown"`** and **HTTP 200** with
  `accepted: true`. Requirement: HTTP 400. **Confirmed defect.**
- An invalid *type* (`{"command": 5}`) reaches `routeTask`, which throws
  `TypeError` on `.includes` → Express returns **500 with a stack trace**.
  **Confirmed defect**, and it breaches the no-stack-trace requirement.
- The endpoint is named `/api/execute` and answers `accepted: true` for an
  operation that is **only a routing decision**. Nothing identifies the result
  as a proposal. **Confirmed defect.**

**`routes/control.js` — `/api/command`:**

```js
const command = req.body?.command || "none";     // :17
res.json({
  accepted: true,                                 // :20
  command: command,
  executed_by: "Phoenix Core",                    // :22  <-- CLAIMS EXECUTION
  timestamp: new Date().toISOString()
});
```

**This is the most serious finding.** The endpoint accepts any body, does
nothing with it, and replies `accepted: true` with **`executed_by: "Phoenix
Core"`**. It asserts that Phoenix Core executed a command it never even parsed.
A missing command becomes the string `"none"` and still reports
`executed_by`. **Confirmed defect, and a governance breach** — this is precisely
the "claims work that did not happen" pattern the assignment forbids.

### E — Service registration: calls a function that does not exist

`routes/services.js:9-13`:

```js
router.post('/api/services/register',(req,res)=>{
  res.json( registry.registerService(req.body) );   // :11
});
```

`services/registry.js:26-29` exports **only** `getAgents` and `getServices`.
`registry.registerService` is **`undefined`** → `TypeError: registry.registerService is not a function` →
**HTTP 500 with a stack trace** on every call. **Confirmed.** HTTP 501 is the
right answer, as the assignment specifies.

### F — Legacy compatibility, and a second CWD-relative path

- **`services/registry.js:5`** — `fs.readFileSync('./data/agents.json','utf8')`
  is **CWD-relative**. It resolves only when the process is started from
  `phoenix-core/`. Started from the repository root, `/api/control` (which calls
  `registry.getAgents()` at `control.js:10`) throws `ENOENT`. **Confirmed** — and
  it is exactly why requirement B specifies `__dirname`.
- **`api/server.js:21`** — `fs.readFileSync("../agents/registry.json")`, also
  **CWD-relative**, same class of bug, in the secondary API. The assignment says
  not to modify that file unless essential; this is a **pre-existing** defect,
  not one the patch creates, so I recommend leaving it and recording it.
- **`agents/registry.js` is clean and already correct**: it uses
  `path.join(__dirname,'registry.json')` (`:4`). It is the only file of the
  three that does this right, and is the model to follow.
- **`agents/registry.js:10-15` exports `addAgent()`, which WRITES to
  `registry.json`** with no validation, no authentication and no audit. It is
  **not currently routed** — `api/server.js` reads the JSON directly rather than
  using this module — so it is a dormant write primitive, not a live hole.
  **It must not be wired up by this repair.** Flagging it because any
  "registerService" implementation would be tempted to reach for it.

The legacy data shape in `agents/registry.json` (`{agents:[{id,name,role}]}`) is
read directly by `api/server.js`. **A canonical registry must not change that
file**, which matches the assignment's instruction.

---

## ARCHITECTURE DECISIONS — proposed, not implemented

1. **New canonical file `core/agent-registry.json`.** Additive. The two legacy
   files stay byte-identical and keep serving their existing readers.
2. **Canonical record carries both key names.** `capabilities[]` as primary,
   with `permissions[]` preserved verbatim where a legacy record had it, so
   neither shape's readers break.
3. **Explicit `aliases: []` per record**, holding `primedox` on `primedox-ai`
   and `omniguard` on `vigilax`. Identity names and roles preserved exactly,
   including both display names (`PrimeDox Executive` / `PrimeDox AI`) recorded
   as `name` and `legacy_name`.
4. **Three-state status**: `planned | available | verified_operational`.
   Every record migrates in at **`planned`** or **`available`** — **nothing
   becomes `verified_operational` without evidence of a running process**, which
   this repair does not gather. Existing `status:"online"` maps to `available`,
   not to verified.
5. **Deterministic priority**: capability match ranked by a documented, ordered
   capability list, then by registry declaration order, with a single winner
   and the losers reported in a `considered[]` field. Security capabilities
   rank above document capabilities, which **reverses** today's accidental
   ordering — a behaviour change that needs your sign-off.
6. **Rename the routing output field** `assigned_agent` → keep it for
   compatibility **and** add `proposed_agent`, `reason`, `basis` and
   `routed_at`. No existing consumer loses a field.
7. **All file reads via `path.join(__dirname, …)`.**
8. **`/api/services/register` returns HTTP 501** with an explanatory body. No
   dynamic registration is built.

---

## TEST MATRIX — designed, NOT YET RUN

All 15 required cases map to Node's built-in `node:test` runner with no new
dependencies. **None has been executed, because there is no patch to execute
them against.**

| # | Case | Target |
|---|---|---|
| 1 | registry loads | `core/agent-registry.json` parses, schema validates |
| 2 | all seven identities represented | Phoenix Core, Vigilax Sentinel, PrimeDox Executive/AI, Revenue, Automation, OmniGuard Sentinel, Research |
| 3 | `primedox`→`primedox-ai`, `omniguard`→`vigilax` resolve | alias map |
| 4 | unknown ID safely handled | controlled result, not `undefined`, no throw |
| 5 | capability lookup works | `fraud_detection` → vigilax |
| 6 | unknown capability → safe fallback | phoenix-core, with a reason |
| 7 | security and document requests route correctly | router |
| 8 | routing deterministic | same input ⇒ same output, incl. the both-keywords case |
| 9 | missing command → **400** | `/api/execute` |
| 10 | invalid command type → **400** | `/api/execute` (today: 500 + stack trace) |
| 11 | valid command → routing **proposal**, not execution | `/api/execute` |
| 12 | `/api/command` does **not** claim execution | `control.js` — today it sends `executed_by` |
| 13 | service registration → **501** | `/api/services/register` (today: 500) |
| 14 | malformed registry fails safely | fixture with a broken record |
| 15 | legacy registry JSON unchanged and still parses | byte-compare `agents/registry.json` |

Plus four negative controls I would add, so the suite cannot pass vacuously:
each of cases 9, 10, 12 and 13 must **fail against the unpatched sources**.
Verified by inspection that all four currently would.

No external API would be contacted. No xAI, Stripe, PayPal or Gmail call
appears anywhere in these seven files.

---

## SECURITY AND GOVERNANCE

- Phoenix Core stays **proposal-only**. Nothing in the proposed design executes
  a task, and `/api/execute`'s own body would say so.
- **No payment, email, deployment, credential access or autonomous execution**
  is introduced.
- **No pathway around human approval** is created. The 501 on service
  registration deliberately adds no write path.
- `agents/registry.js:addAgent()` — a pre-existing, unrouted, unvalidated write
  to disk — **stays unrouted.**
- Two stack-trace leaks (`/api/execute` on a bad type, `/api/services/register`
  always) would be closed by the 400/501 handling.
- **Governance defect to record now, independent of any patch:** `/api/command`
  currently tells every caller `executed_by: "Phoenix Core"` for work it never
  performed. If anything downstream logs or trusts that field, the audit trail
  is already wrong.

---

## REMAINING RISKS AND LIMITATIONS

1. **The baseline is unresolved.** Everything above is verified against
   `primedoxai-deploy @ fe20af45`, not against `278662d9`. If the Termux tree
   has diverged on these seven files, parts of this assessment may not apply.
2. **No hashes were supplied** in the assignment, so I could not compare even
   in principle. Mine are tabled above for you to check.
3. **Priority reversal is a behaviour change.** Ranking security above documents
   changes where a "security document review" command routes today. Your call.
4. **The three preserved files** (`index.js`, `routes/tasks.js`,
   `services/task-engine.js`) are **unmodified in this tree**, so I could not
   verify that the patch avoids colliding with your local changes to them. On
   the Termux tree that check still needs doing.
5. `index.js` on `origin/main` here already carries the business-route guard
   (commit `fe20af45`, blob `d71ca3e8`). If your Termux `index.js` predates
   that, the two trees differ on a file this assignment says to preserve.

---

## SAFE APPLICATION PLAN — for whichever baseline you confirm

```bash
# 0. Establish the real baseline FIRST
cd <repo>
git rev-parse HEAD
git status --short
for f in phoenix-core/core/task-router.js phoenix-core/core/agent-registry.js \
         phoenix-core/services/registry.js phoenix-core/routes/services.js \
         phoenix-core/routes/agents.js phoenix-core/routes/control.js \
         phoenix-core/routes/router.js; do
  printf '%s  %s\n' "$(sha256sum "$f" | cut -c1-32)" "$f"
done

# 1. Timestamped backup of every file the patch touches — before anything
TS=$(date +%Y%m%d-%H%M%S)
for f in <files in patch>; do cp "$f" "$f.backup-$TS"; done

# 2. Dry run. If this fails, STOP. Do not use -3 or --reject.
git apply --check -p1 <patch>

# 3. Apply
git apply -p1 <patch>

# 4. Verify — syntax, then the isolated suite
for f in <files in patch>; do node --check "$f"; done
node --test phoenix-core/tests/registry.test.js \
            phoenix-core/tests/routing.test.js \
            phoenix-core/tests/api-semantics.test.js

# 5. Confirm the legacy files are untouched
git diff --stat phoenix-core/agents/registry.json phoenix-core/data/agents.json
#    expect: no output

# 6. Confirm the three preserved files are untouched
git diff --stat phoenix-core/index.js phoenix-core/routes/tasks.js \
                phoenix-core/services/task-engine.js
#    expect: no output
```

Rollback is `cp "$f.backup-$TS" "$f"` per file; the backups are the only
recovery path and must not be deleted.

---

## DECISIONS REQUIRING DEREK'S APPROVAL

| # | Decision |
|---|---|
| **1** | **Which baseline?** Compare your seven recorded hashes against the table above. Either confirm `primedoxai-deploy @ fe20af45`, or send me the Termux copies / push that branch. **This blocks everything else.** |
| 2 | Approve the three-state status model, with **nothing** entering as `verified_operational`. |
| 3 | Approve the **priority reversal** — security capabilities ranked above document capabilities. This changes today's behaviour. |
| 4 | Approve keeping `assigned_agent` **and** adding `proposed_agent`, rather than renaming. |
| 5 | Confirm `/api/command` should stop sending `executed_by`. Any downstream consumer of that field would see a response-shape change. |
| 6 | Confirm HTTP 501 for `/api/services/register` rather than implementing registration. |
| 7 | Confirm `api/server.js` stays untouched despite its CWD-relative read at `:21`. |
| 8 | Whether to record the `/api/command` false-execution claim as a standing governance defect now, before any patch lands. |

---

## INTEGRITY STATEMENT

- No existing source file was modified. No patch was applied.
- Nothing was committed, pushed, merged or deployed. No service was started.
- No file, backup, patch or untracked artifact was deleted, renamed or cleaned.
- The task engine and xAI provider were not touched.
- No secret was read, printed or transmitted. No external API was called.
- The 17 held working-tree changes in this session's repository remain
  untouched, and the C3 council patch remains on HOLD.
- One new file was written: this report.
