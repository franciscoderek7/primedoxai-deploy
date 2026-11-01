# FHI SPRINT 2 — WORKSTREAM A / TASK 4
## Avatar + Council Verification and Capability Matrix

Date: 2026-11-01
Method: the engine and the avatar-lab server were executed for real, in an
isolated copy under the session scratchpad — **not** in the repository working
tree, so no proposal files were written into the repo. The server bound
loopback only and was stopped afterwards. No external service was contacted.
`ANTHROPIC_API_KEY` is **not set** in this environment, which is itself the
condition one half of this test needed.

---

## 1. WHAT WAS ACTUALLY RUN

| Test | Command | Result |
|------|---------|--------|
| Council lifecycle suite | `node --test …/council/tests/council-lifecycle.test.js` | **27 pass, 0 fail** |
| Deploy safety suite | `node --test .github/workflows/tests/deploy-safety.test.js` | **9 pass, 0 fail** |
| Engine, end-to-end, no API key | `node council-engine.js "<a real business question>"` | **ran to completion, wrote a case file, exit 0** |
| Avatar-lab server | `node avatar-lab/server.js`, then HTTP probes on 127.0.0.1:8787 | **started, served, answered** |
| `GET /api/avatars` | curl | **200**, full JSON for 3 avatars |
| `POST /api/council` with a question | curl | **200**, `ok:true`, `mode:"proposal-only"`, `humanApprovalRequired:true` |
| `POST /api/council` with `{}` | curl | **400**, `{"ok":false,"error":"A question is required."}` — input validation works |
| `GET /api/chat` | curl | **404** — this endpoint does not exist (see §4) |

---

## 2. GRACEFUL DEGRADATION — VERIFIED, NOT ASSUMED

With no `ANTHROPIC_API_KEY` and no Anthropic SDK installed (`node_modules` is
absent from the council directory), the engine did **not** crash. The recorded
case file shows:

```
status:                      PROPOSED
humanDecision:               REQUIRED
councilPipelineStage:        INTAKE          ← not SPECIALIST_ANALYSIS
aiRuntimeStatus:             ERROR
aiRuntimeError:              "AI runtime unavailable"
verification:                null
specialistAnalysis:          {total:3, complete:0, unavailable:0, error:0,
                              missing:3, basis:"structural_response_acceptance"}
financialExecutionAllowed:   false
legalExecutionAllowed:       false
securityExecutionAllowed:    false
destructiveExecutionAllowed: false
productionDeploymentAllowed: false
case file mode:              0600
```

Three things worth stating plainly:

1. **The stage did not advance on a failed attempt.** `complete: 0` →
   `councilPipelineStage: "INTAKE"`. The pipeline refuses to claim
   `SPECIALIST_ANALYSIS` merely because the call was tried. That is the
   behaviour the C3 patch was written to produce, and it holds.
2. **`verification` is an explicit `null`,** and the console prints
   `VERIFIED: NO — no verification has been performed`. Nothing in this system
   claims verification it has not done.
3. **Every authority flag is `false`,** and they are set *before* the AI call,
   so no model output can flip them. Confirmed by reading
   `council-engine.js:92-96` (flags) against `:102-115` (the AI block).

The case file is written `mode: 0o600` — owner-read/write only.

---

## 3. AVATAR CAPABILITY MATRIX

Capabilities are what the code **does**, verified by running it. Nothing below
is inferred from a name or a comment.

| Avatar | Declared authority | Can analyse | Can decide | Can spend / deploy | Verified by |
|--------|-------------------|-------------|-----------|--------------------|-------------|
| **PrimeDox AI** — The Scholar<br>document intelligence, legal education, research, knowledge organization | `propose_and_analyze_only` | Yes (when a key is present) | **No** | **No** | `GET /api/avatars` → 200; engine assigns it "knowledge, education, documentation and evidence requirements" |
| **Vigilax AI** — The Sentinel<br>security, privacy, AI-safety, fraud, operational risk | `propose_and_analyze_only` | Yes | **No** | **No** | same |
| **SoulStack AI** — The Strategist<br>customer value, revenue, operations, automation, speed to market | `propose_and_analyze_only` | Yes | **No** | **No** | same |

**System-level capabilities, measured:**

| Capability | State | Evidence |
|------------|-------|----------|
| Create a council case from a business question | **WORKS** | ran end-to-end, exit 0, file written |
| Run without an API key | **WORKS — degrades honestly** | §2 |
| Produce real AI analysis from the three executives | **BLOCKED** | no `ANTHROPIC_API_KEY`; no Anthropic SDK in `node_modules`. `ai-runtime.js` targets `claude-opus-5`, `MAX_TOKENS 500`, and calls all three executives **in parallel with one identical prompt** — see §5 |
| Serve avatars over HTTP | **WORKS** | 200 + full JSON |
| Run a council case over HTTP | **WORKS** | 200, `mode:"proposal-only"` |
| Reject a malformed request | **WORKS** | 400 with a clear message |
| Keep the human approval gate | **WORKS** | `humanApprovalRequired:true` on every response; all five authority flags `false` |
| Bind to localhost only | **WORKS (by source)** | `server.js:12 const HOST="127.0.0.1"`, `:157 server.listen(PORT, HOST)`. I could not test from a non-loopback address because this container has **no non-loopback IPv4** — so this is verified from source and binding arguments, not from an external connection. |
| Voice / ElevenLabs | **NOT IN AVATAR-LAB** | ElevenLabs code lives in `executive-chamber/app.js` and `executive-chamber/server.js`, not in `avatar-lab`. Avatar-lab has no voice path at all. |

---

## 4. TWO DEFECTS FOUND

### A1 — `GET /api/chat` does not exist (404)

If any front-end or document expects `/api/chat` on the avatar lab, it is
pointed at nothing. The server exposes exactly two API routes:
`GET /api/avatars` (`server.js:84`) and `POST /api/council` (`:93`).
**Not fixed** — I do not know whether the intent is to add the endpoint or to
correct the caller, and that is a product decision.

### A2 — `POST /api/council` returns console text, not the proposal

`runCouncil` (`server.js:33-57`) shells out with `execFile(process.execPath,
[ENGINE, question])` and hands back:

```js
callback(null, { output: stdout.trim(), stderr: stderr.trim() })
```

So the HTTP response's `result` is `{output: "<the engine's banner text>",
stderr: ""}`. An API consumer **cannot** read `councilPipelineStage`,
`aiRuntimeStatus`, `specialistAnalysis` or `verification` as fields — it would
have to scrape the ASCII banner. I confirmed this: those keys are absent from
the HTTP response while present in the case file on disk.

**Consequence:** any dashboard built on this endpoint would either scrape text
or, more likely, display nothing and be filled in by hand — which is exactly
how unverified numbers get into dashboards.

**Smallest fix:** the engine already returns `{output, proposal}` from
`createCouncilCase` and already `module.exports`es it. The server could
`require('./…/council-engine')` and call it directly, or the engine could
accept a `--json` flag and print the proposal. **Not implemented — awaiting
your authorization**, because it changes an API response shape.

---

## 5. ONE DESIGN OBSERVATION (not a defect, but you should decide on it)

`ai-runtime.js` sends **one identical prompt** to all three executives in
parallel. The executives' distinct domains and assignments are set in
`council-engine.js` but are not differentiated in the prompt the model
receives. With a key present, you would likely get three similar answers
wearing three different names — which would look like corroboration between
independent specialists while being nothing of the kind.

If the point of a three-executive council is independent perspectives, each
executive needs its own prompt built from its own `assignment` string. That is
a meaningful change to how the council behaves and it is your call.
**Not changed.**

---

## 6. WHAT REMAINS BLOCKED

- **Real AI analysis cannot be verified here.** It needs `ANTHROPIC_API_KEY`
  and `npm install @anthropic-ai/sdk` in the council directory. I did not set a
  key, install anything, or make a network call to Anthropic.
- Until that happens, no one should state that the council "produces executive
  analysis." What is verified is that it **produces a proposal and records
  honestly that no analysis was obtained.**
