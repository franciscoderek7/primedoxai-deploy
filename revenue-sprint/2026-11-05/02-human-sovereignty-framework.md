# FHI HUMAN SOVEREIGNTY FRAMEWORK
## Proposed governance document — NOT ADOPTED, NOT IMPLEMENTED

Date: 2026-11-05 · Status: **PROPOSAL** · Authority: Derek Francisco
No existing authorization logic was changed by this document.

---

## 1. HUMAN AUTHORITY

**Principle.** No AI component may grant itself additional permissions or
override a human authorization decision.

**Rules.**
1. Permission state is **data an AI reads, never data an AI writes.**
2. Authority flags are set **before** any model call and are immutable for the
   life of a request.
3. An absent or unreadable permission record means **denied**, never "assume
   allowed."
4. An approval must name a **human principal derived from an authenticated
   session** — never a string taken from a request body.

**Where the codebase already complies.**
`council-engine.js:92-96` sets `financialExecutionAllowed`,
`legalExecutionAllowed`, `securityExecutionAllowed`,
`destructiveExecutionAllowed` and `productionDeploymentAllowed` to `false`
**before** the AI block at `:102-115`. Verified by execution: all five remained
`false`. **This is the pattern to copy.**

**Where it is breached today.**
- `zprimedox-ai-graph/app/nodes/human_gate.py:115` —
  `approved_by = human_input.get("approved_by", "Derek Francisco")`. The
  approver's identity is taken from the request body and **defaults to Derek**.
  `app/main.py` has **no authentication on any of its 10 routes.** Anyone
  reachable can forge an approval attributed to the owner, and
  `nodes/deliver.py:49` writes it to Supabase as the audit record.
- `phoenix-core/routes/control.js:22` — `/api/command` returns
  `executed_by: "Phoenix Core"` for work it never performed.

**Implementation points.** Add `APIKeyHeader + Depends` to every
state-changing route in `zprimedox-ai-graph`; derive `approved_by` from the
authenticated principal; **delete the default**.

---

## 2. INDEPENDENT VERIFICATION

**Principle.** Vigilax must evaluate consequential proposals independently, not
endorse Phoenix Core's conclusion.

**Rules.**
1. A consequential proposal requires a **separate** Vigilax assessment, formed
   without Phoenix Core's recommendation in its input.
2. Vigilax must be able to record **dissent**, and dissent must survive into the
   human-facing record.
3. "Both agreed" is only evidence when the two were genuinely independent.

**Defect blocking this today.** `council/ai-runtime.js` sends **one identical
prompt** to all three executives in parallel. Their distinct domains and
assignments are set in `council-engine.js:69-74` but are **not differentiated in
the prompt the model receives.** With a key present you would get three similar
answers wearing three names — which *looks* like corroboration between
independent specialists while being nothing of the kind.

**Implementation point.** Build each executive's prompt from its own
`assignment` string, and give Vigilax the problem **without** PrimeDox's or
SoulStack's output. Add a `dissent` field to the proposal schema.

---

## 3. RESTRICTED AUTONOMY

No AI agent may independently acquire infrastructure, acquire unrestricted
compute, replicate beyond an authorized environment, modify its governing
restrictions, authorize its own production deployment, disable monitoring or
shutdown, or control critical infrastructure.

**Rules.**
1. Every one of those actions is **proposal-only**, terminating at a human gate.
2. The gate's code path must not be reachable by anything an AI can write to.
3. A "self-approval" shape — any path where AI output becomes the approval
   record — is a **defect by definition**, regardless of intent.

**Current standing.** Phoenix Core is proposal-only and, verified, **has no
payment code path at all.** The council records
`basis: "structural_response_acceptance"` and
`VERIFIED: NO — no verification has been performed`, which is exactly the right
honesty. **Dormant risk:** `phoenix-core/agents/registry.js:10-15` exports
`addAgent()`, which writes to `registry.json` with no validation, no
authentication and no audit. It is currently unrouted. **It must stay
unrouted** — any dynamic registration feature would be tempted to use it.

---

## 4. LEAST PRIVILEGE

**Rules.**
1. Each integration gets only the permissions its authorized task needs.
2. Secrets arrive from the environment, never from source, and never appear in
   logs.
3. Service ports bind to loopback unless public reach is a stated requirement.
4. CI jobs declare `permissions:` explicitly.

**Breaches found.**
- `zprimedox-ai-graph/docker-compose.yml:28` and
  `infra/docker/docker-compose.yml:17` publish Redis `"6379:6379"` with **no
  `--requirepass`**. `infra/docker:11` publishes Postgres `5432` with
  `primedox:primedox`. Docker's form binds `0.0.0.0` and bypasses host firewall
  rules on many setups.
- `agents/backend/server.js:185` — `app.listen(PORT)` with **no host argument**,
  so it binds all interfaces. It carries the live payment routes (§5 of the
  main report).
- No workflow in `primedoxai-deploy` declares a `permissions:` block.
- `DEPLOY_TOKEN` is interpolated into a clone URL in 28 workflows.

**Compliant example.** `avatar-lab/server.js:12,157` binds `127.0.0.1` only.

---

## 5. HUMAN CONTINUITY

Every important workflow needs audit records, human override, recovery
procedures, documented ownership, a reliable shutdown, and a succession plan.

| Workflow | Audit | Override | Recovery | Owner | Shutdown | Succession |
|---|---|---|---|---|---|---|
| Council proposals | ✅ case files, mode `0600` | ✅ human gate | ✅ files on disk | Derek | ✅ process exit | ❌ undocumented |
| PayPal payment capture | ✅ Supabase `subscribers` | ⚠ none in-code | ⚠ PayPal console only | Derek | ✅ stop the server | ❌ undocumented |
| Site deployment | ⚠ workflow logs only | ✅ dispatch | ⚠ git history | Derek | ⚠ disable workflow | ❌ undocumented |
| `zprimedox-ai-graph` approvals | ❌ **forgeable** (§1) | ❌ no auth | ⚠ Redis checkpoints | Derek | ✅ compose down | ❌ undocumented |

**Succession is undocumented for every workflow.** That is the largest gap in
this section and it is a writing task, not a coding one.

---

## 6. INDEPENDENT SAFETY

**Principle.** No AI may certify its own safety as the sole source of evidence.

**Rules.**
1. A safety claim requires evidence a human can inspect: a command, its exact
   output, an exit status.
2. A passing syntax check is **never** evidence that an integration works.
3. A test suite is evidence only if it has been shown to **fail** against the
   unfixed code.
4. An AI's statement that it complied is not compliance.

**Precedent to keep.** The audit work in this engagement used negative controls
throughout — the payment suite fails 7 of 16 against the regressed branch copy;
the Phoenix guard's unpatched original exits 1. Those failures are what make the
passes meaningful.

---

## 7. ADOPTION — what this would require

| # | Change | Where |
|---|---|---|
| 1 | Authenticate every state-changing route; derive `approved_by` from the principal; delete the `"Derek Francisco"` default | `zprimedox-ai-graph/app/main.py`, `nodes/human_gate.py:115` |
| 2 | Stop `/api/command` claiming `executed_by` | `phoenix-core/routes/control.js:22` |
| 3 | Per-executive prompts + a `dissent` field | `council/ai-runtime.js`, `PROPOSAL-SCHEMA.json` |
| 4 | Bind Redis/Postgres/backends to loopback; add `--requirepass` | both `docker-compose.yml`, `agents/backend/server.js:185` |
| 5 | `permissions: contents: read` on all workflows | `.github/workflows/*` |
| 6 | Fail webhook verification **closed** | `agents/backend/paypal-service.js:106` |
| 7 | Keep `addAgent()` unrouted; document it as a restricted primitive | `phoenix-core/agents/registry.js` |
| 8 | Write succession and shutdown procedures per workflow | new `GOVERNANCE.md` |

**None of these is implemented.** Items 1, 4 and 6 are security fixes and should
be sequenced first. Item 3 changes how the council behaves and is Derek's call.
