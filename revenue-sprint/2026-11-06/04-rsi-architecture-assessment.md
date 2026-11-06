# FHI RSI — RECURSIVE INTELLIGENCE ENGINE
## Architecture assessment. **DESIGN ONLY — nothing implemented.**

Date: 2026-11-06 · Branch `claude/revenue-intake-review` @ `1ffc429`
**Nothing committed, pushed, merged, deployed or CI-triggered. No paid model
call. No model weights downloaded. 17 held changes untouched; C3 on HOLD.**

---

## 0. THE FINDING THAT SHOULD DECIDE THE ORDER OF WORK

> **Most of the RSI substrate already exists — and it sits inside the one
> component with zero authentication.**

`zprimedox-ai-graph` already contains a pgvector knowledge graph, semantic
search, session outcomes and a `lessons_learned` table. It is a real RSI
foundation and **must not be rebuilt.**

It is also the component where `app/main.py` exposes **10 routes with no
authentication**, and `nodes/human_gate.py:115` takes `approved_by` from the
request body **defaulting to the owner's name**.

**What RSI changes about that defect.** Today an attacker can forge one
approval and get one document. With a learning loop on top, the same request
writes a memory node, an edge and a lesson — and **every later generation of
every avatar inherits it.** A one-off forgery becomes permanent corruption of
the knowledge base, with a forged human name attached as its provenance.

**Recommendation: fix the authentication before the first learning cycle runs,
not after.** RSI is a force multiplier applied to whatever is already true about
your governance. Build the loop on an unauthenticated substrate and you have
built an amplifier for the defect.

---

## 1. EXISTING INFRASTRUCTURE MAP

### Already built — reuse, do not duplicate

| Capability | Where | State |
|---|---|---|
| **Knowledge graph** | `zprimedox-ai-graph/supabase/migrations/002_memory_graph.sql` | `memory_nodes` + `memory_edges` with typed relationships. **Real graph, 198 lines** |
| **Vector search** | same, `:54`, `:101` | `vector(1536)` with `ivfflat vector_cosine_ops` on nodes **and** documents |
| **Semantic retrieval** | `app/services/vector_db.py` | `search_similar` via `match_memory_nodes` RPC, `match_threshold 0.7` |
| **Embeddings** | `app/config.py:34` | `text-embedding-3-small` (1536 dims, consistent with the column) |
| **Graph API** | `app/services/memory_graph.py` | `add_entity`, `add_relationship`, `get_entity_context(depth=2)`, `update_from_session`, `search_knowledge` |
| **Session outcomes** | `002_memory_graph.sql:12-20` | `sessions` with `domain ∈ {legal,cyber,safety,business}`, `outcome ∈ {approved,rejected,revision,complete,error,pending}` |
| **Lessons learned** | `:106-114` | `lessons_learned(session_id, domain, lesson, applied)` |
| **Case documents** | `:80-101` | `case_documents` with embeddings |
| **Provider gateway** | `agents/backend/chinese-ai-providers.js` (107 lines) | DeepSeek → Qwen → GLM → Kimi → OpenAI. All OpenAI-compatible; keys from env; **skips any provider without a key**. This is already a provider-independent gateway |
| **Local inference** | `agents/backend/gemma-server.js` (874 lines) | local Ollama path |
| **Astra provider** | `…/model-router/openai-provider.js` | `gpt-6-astra`, opt-in, `analysis-only`, `humanApprovalRequired:true`, **wired to no router** |
| **Grok provider** | `…/model-router/xai-provider.js` | `grok-4.7` from `XAI_MODEL`, same posture, **wired to no router** |
| **Council orchestration** | `…/council/council-engine.js` | verified 27/27; authority flags set **before** the AI call; records `basis: structural_response_acceptance` |
| **Agent registry** | `phoenix-core/core/agent-registry.js` (on `main`) | static, 3 agents; 7 identities split across 3 incompatible shapes |
| **Vigilax verification** | `vigilax-backend/server.js` (473 lines) | 6 rule-based engines, `requireApiKey` on all 11 sensitive routes, 2 rate limiters, helmet. **Best-engineered backend in the repo** |
| **Test infrastructure** | repo-wide | 112+ passing across 6 suites; negative-control discipline established |
| **Approval gate** | `…/avatar-lab/server.js` | loopback-only, `humanApprovalRequired:true` enforced server-side |
| **Authority manifest** | `…/empire-manifest.json` | `aiMayExecuteConsequentialActions:false`, `humanApprovalRequired:true` |
| **Domain knowledge** | `automation/chatbot-knowledge/*.md` | 7 brand knowledge files |

### Does not exist

| Claimed | Reality |
|---|---|
| **DreamCore productization** | **no code at all** |
| **Green Blast** | exists only as the gap-scanner work |
| Competitor monitoring | plans only — no scanner, no job |
| Agent-level persistent memory | the graph is **session**-scoped; no per-avatar memory |
| Evaluation datasets / harness | none |
| Prompt or skill versioning | none |
| `payment_transactions` | proposed only |

### One inaccuracy to correct

`002_memory_graph.sql:41` comments the embedding column *"OpenAI ada-002 /
Anthropic compatible."* **Anthropic does not offer an embeddings API.** The
dimension is right for `text-embedding-3-small`; the comment is wrong and would
mislead anyone planning a provider swap.

---

## 2. PROPOSED RSI ARCHITECTURE

Four layers, each mapped to something that already exists.

```
┌─ L4  GOVERNANCE ─────────────────────────────────────────────────┐
│  empire-manifest.json authority · server-side approval ·         │
│  versioned acceptance · audit trail                              │
│  REUSES: avatar-lab authority gate, council flag discipline       │
├─ L3  EVALUATION ─────────────────────────────────────────────────┤
│  eval datasets · regression suites · adversarial review ·        │
│  8 metrics · accept/reject with evidence                         │
│  REUSES: node:test discipline, vigilax-backend, negative controls │
├─ L2  LEARNING ───────────────────────────────────────────────────┤
│  candidate generation · per-avatar objectives · provider routing │
│  REUSES: chinese-ai-providers chain, Astra/Grok providers, council│
├─ L1  KNOWLEDGE ──────────────────────────────────────────────────┤
│  memory_nodes · memory_edges · lessons_learned · case_documents  │
│  + NEW: provenance, confidence, verification status, versions     │
│  REUSES: the existing pgvector graph — EXTEND, do not replace     │
└──────────────────────────────────────────────────────────────────┘
```

**Hard rule at every layer: a model may propose. Only evidence promotes, and
only a human accepts.**

---

## 3. AVATAR LEARNING RESPONSIBILITIES

| Avatar | Learns | Writes to | Must not |
|---|---|---|---|
| **Green Blast** | industry research, customer problems, automation and revenue patterns | `node_type='opportunity'`, domain `business` | assert a customer outcome it did not measure |
| **Phoenix Core** | gap detection, troubleshooting, integration patterns | `node_type='defect'`/`'fix'` + edges to the code touched | mark a task `COMPLETED` on routing or persistence |
| **DreamCore** | productization patterns, reusable tools | `node_type='skill'` with a reuse count | productize anything Vigilax has not cleared |
| **SoulStack** | prioritisation, resource allocation, sequencing | `node_type='priority'` with the ranking rationale | rank on revenue it cannot evidence |
| **Vigilax** | failure modes, regressions, adversarial findings | `node_type='risk'`, `verification_status` transitions | **certify its own safety as the sole evidence** |

**The independence problem, stated plainly.** `council/ai-runtime.js` sends
**one identical prompt** to all three executives in parallel. Their distinct
assignments exist in `council-engine.js:69-74` but never reach the model. So
today **Vigilax is not an independent reviewer** — same provider, same prompt,
same context. Three similar answers wearing three names *look* like
corroboration and are not.

**Required before Vigilax's verdict carries any weight:** build each
executive's prompt from its own `assignment`, withhold the others' output from
Vigilax, and record a `dissent` field. And where reviewers share a provider,
**the record must say so** — `independence: 'shared_provider'` rather than
implying separation that does not exist.

---

## 4. KNOWLEDGE SCHEMA — EXTENSION, NOT REPLACEMENT

Additive columns on the existing `memory_nodes`. Nothing dropped; existing rows
default to the most conservative values.

```sql
-- PROPOSED. Additive only. NOT APPLIED.
alter table memory_nodes
  -- VERIFIED FACT vs MODEL HYPOTHESIS. The central distinction.
  add column verification_status text not null default 'hypothesis'
      check (verification_status in
             ('hypothesis',        -- a model said it. No evidence.
              'corroborated',      -- several models agree. STILL NOT VERIFIED.
              'evidence_backed',   -- a cited, checkable source exists
              'independently_verified',  -- reproduced by a method that is not a model
              'refuted')),
  -- Provenance. Which model, which provider, which version said this.
  add column source_kind text not null default 'model'
      check (source_kind in ('model','document','human','test_result','external_api')),
  add column source_provider text,        -- 'anthropic' | 'openai' | 'xai' | 'deepseek' | ...
  add column source_model text,           -- exact model id, e.g. 'claude-opus-5'
  add column source_uri text,             -- citation, where one exists
  add column source_license text,         -- license of the source material
  -- Confidence is a recorded claim, never a fact.
  add column confidence numeric(3,2) check (confidence between 0 and 1),
  add column confidence_basis text,       -- HOW it was arrived at
  -- Lifecycle.
  add column version integer not null default 1,
  add column supersedes uuid references memory_nodes(id),
  add column review_due date,             -- knowledge expires
  add column refuted_by uuid references memory_nodes(id),
  add column accepted_by text,            -- AUTHENTICATED principal, never a body field
  add column accepted_at timestamptz;

create index on memory_nodes (verification_status);
create index on memory_nodes (review_due) where review_due is not null;

-- CONTRADICTION DETECTION: an explicit, queryable relation, not an inference.
-- memory_edges.relationship already exists; reserve these values:
--   'contradicts' | 'supports' | 'supersedes' | 'derived_from' | 'refutes'

-- FAILED EXPERIMENTS are first-class. A thing that did not work is knowledge.
create table if not exists failed_experiments (
  id            uuid primary key default uuid_generate_v4(),
  hypothesis    text not null,
  what_was_tried text not null,
  why_it_failed text not null,
  evidence_uri  text,
  domain        text,
  avatar        text,
  do_not_retry  boolean not null default false,
  created_at    timestamptz default now()
);

-- REUSABLE SKILLS, with a measured reuse count rather than a claimed one.
create table if not exists skills (
  id             uuid primary key default uuid_generate_v4(),
  name           text not null unique,
  definition     text not null,
  version        integer not null default 1,
  verification_status text not null default 'hypothesis',
  times_applied  integer not null default 0,
  times_succeeded integer not null default 0,   -- measured, not asserted
  owner_avatar   text,
  created_at     timestamptz default now()
);

-- lessons_learned gains the same provenance discipline.
alter table lessons_learned
  add column verification_status text not null default 'hypothesis',
  add column evidence_uri text,
  add column accepted_by text,
  add column superseded_by uuid references lessons_learned(id);
```

### The rule the brief asks for, as a constraint

> **Agreement is not verification.**

`'corroborated'` exists precisely so that "three models agreed" has somewhere to
live **without** being called verified. Promotion to
`'independently_verified'` requires evidence from something that is **not a
language model** — a passing test, a cited primary document, a measured
outcome. **No model output may promote its own record.** Enforce in the write
path, not by convention.

---

## 5. MODEL GATEWAY DESIGN

**Reuse `chinese-ai-providers.js`** — it is already the right shape: a provider
map, env-only keys, a fallback chain that skips unconfigured providers.
Generalise it rather than writing a new one.

```js
// PROPOSED shape. Extends the existing PROVIDERS map.
{ id, provider, model, endpoint, keyEnv,
  capabilities: ['chat','tools','json','vision','long_context'],
  open_weight: true|false,
  license: '<per model card>',
  cost_per_1k_in, cost_per_1k_out,     // for the cost-per-task metric
  max_context,
  posture: 'analysis_only' }           // as Astra and Grok already declare
```

### Provider inventory — and what is actually knowable

| Family | Access FHI has | Open weights? | Downloadable datasets? | Can FHI train? |
|---|---|---|---|---|
| **Claude** | API, in use as the engineering partner | **No** | **No** | **No** |
| **GPT / Astra** | API — `gpt-6-astra` verified against OpenAI's own docs | **No** | **No** | fine-tuning only, where offered |
| **Grok** | API — `grok-4.7` verified against xAI's own page | **No** | **No** | **No** |
| **DeepSeek** | API key slot exists (`DEEPSEEK_API_KEY`) | reported **MIT** for base V3/R1 lines | model weights ≠ training data | fine-tune, if weights are obtained |
| **Qwen** | API key slot exists | **mixed** — smaller models reported Apache-2.0, flagships reported custom/revenue-gated | no | fine-tune, license-dependent |
| **Llama** | not wired | **Llama Community License** — commercial use allowed, >700M MAU needs a separate Meta license, "Built with Llama" attribution required | no | fine-tune under those terms |
| **Gemini** | **not wired, no key slot** | **No** | **No** | **No** |

**Three things I will not claim.**

1. **No proprietary training corpus is accessible to FHI.** Not Claude's, not
   GPT's, not Grok's, not Gemini's. Open *weights* are not open *data*.
2. **The licensing above is leads, not verdicts.** Sources disagree —
   particularly on Qwen, where smaller models and flagships appear to differ.
   **Verify against each model's own Hugging Face card and LICENSE file before
   any download or commercial use.** Licensing changes between releases.
3. **No weights were downloaded and no paid call was made.** The gateway design
   is unexercised.

**Practical consequence:** "learning from approved AI models" means **learning
from their outputs**, captured as `source_kind='model'` with provider and model
recorded — not training on them. Genuine weight training is Phase 6 and needs
licensed data, an isolated environment, and its own budget decision.

---

## 6. EVALUATION AND VERIFICATION FRAMEWORK

### The loop, with the gate that matters

```
Research ─→ Candidate ─→ Independent eval ─→ Regression ─→ Safety ─→ HUMAN ─→ Versioned
   │                          │                  │           │       APPROVAL   acceptance
   │                          │                  │           │          │           │
   └── source_kind recorded   └── NOT by the     └── prior   └── Vigilax └── auth-   └── version++
       provider + model           proposing          evals      adversarial  enticated   supersedes
       license                    model              must       review       principal   set
                                                     still                    only
                                                     pass
```

### The eight metrics, and how each is actually obtained

| Metric | Measured how | Honest caveat |
|---|---|---|
| Task success rate | eval-set pass count | only as good as the eval set |
| Accuracy | against a **held-out** labelled set | needs human labels; none exist yet |
| Regression rate | prior suites re-run on every candidate | **this is the one FHI can already do well** |
| **Hallucination rate** | claims sampled and checked against cited sources | **requires human adjudication. Cannot be self-assessed by the model under test** |
| Security failures | Vigilax adversarial suite + the existing security tests | — |
| Cost per successful task | tokens × provider rate ÷ successes | needs the per-provider rates in §5 |
| Improvement retained | re-run generation N's evals on generation N+1 | catches silent regressions |
| Unseen-task performance | a **sequestered** set, never used for tuning | must be sequestered from the start or it is worthless |

**Acceptance rule:** an improvement is accepted when the **regression suite still
passes** and the **evaluation improves on a set the proposer did not see** —
never because the proposing model asserts it is better. A proposal that cannot
be measured is rejected, not accepted on narrative.

**Negative controls are mandatory.** Every new eval must be shown to **fail**
against the un-improved baseline. This repository has already established that
discipline — 24/24 on the webhook guard with controls failing 14/16 and 7/16 —
and RSI is exactly where it matters most.

---

## 7. SECURITY AND GOVERNANCE MODEL

| Control | Rule |
|---|---|
| **Authentication first** | **No learning cycle runs until `zprimedox-ai-graph` has server-side auth.** §0 |
| Approval identity | from an **authenticated session**. Never a request-body field. Delete the `"Derek Francisco"` default |
| Write path | a model may write only `verification_status='hypothesis'`. Promotion requires non-model evidence |
| Self-promotion | **forbidden** — a model cannot promote a record it authored |
| Self-certification | no avatar's safety claim is sole evidence. Vigilax included |
| Shared provider | recorded as `independence:'shared_provider'`. Never presented as independent review |
| Blast radius | Phase 6 scope only: knowledge, prompts, skills, tool definitions, workflow config, **isolated branches**, eval sets |
| Forbidden | production changes, self-deployment, autonomous spend, credential access, **modifying approval boundaries** |
| Weight training | isolated, reproducible, licensed data, separate evaluation, separate authorization |
| Rollback | every acceptance is versioned with `supersedes`; reverting is selecting the prior version |
| Audit | who accepted, when, on what evidence — and **no password or session secret recorded** |
| Kill switch | one flag that halts all learning writes, reachable without the learning system |

**The governance pattern to copy already exists:** `council-engine.js:92-96`
sets all five authority flags **before** the AI call, so no model output can
alter them. Verified by execution. Extend that, do not reinvent it.

---

## 8. MINIMAL IMPLEMENTATION ROADMAP

| Step | Work | Why first |
|---|---|---|
| **0** | **Authenticate `zprimedox-ai-graph`; remove the forged-approver default** | Without it, RSI amplifies a known defect. **Blocks everything** |
| 1 | Apply the §4 additive migration | Provenance and verified/hypothesis separation must exist before the first write |
| 2 | Fix `ai-runtime.js` so each executive gets its own prompt | Vigilax's verdict is meaningless until then |
| 3 | Fix `/api/council` to return the proposal, not console text | A panel cannot read the loop's state today |
| 4 | Add `status ∈ {PROPOSED,APPROVED,EXECUTING,COMPLETED,FAILED,BLOCKED}` to Phoenix Core; forbid `COMPLETED` without evidence | Truthful reporting is a precondition for measuring anything |
| 5 | Build the regression harness around the existing `node:test` suites | The cheapest real metric FHI can have |
| 6 | Sequester an unseen-task set **before** any tuning | Impossible to do retroactively |
| 7 | One narrow proof of concept — §10 | Prove the loop on something measurable |

**Steps 0–4 are corrections to existing systems, not new infrastructure.** That
is deliberate: the brief says do not duplicate, and the honest reading of Phase 1
is that FHI's RSI problem is mostly *governance debt*, not missing components.

---

## 9. COMPUTE AND API COST — ESTIMATES, CLEARLY LABELLED

**These are arithmetic on public list prices, not measurements. Nothing was
spent.**

| Item | Basis | Estimate |
|---|---|---|
| Embeddings, 10k knowledge records | `text-embedding-3-small`, ~500 tokens each | **well under $1** |
| One council cycle, 3 executives | `MAX_TOKENS 500` each (`ai-runtime.js`), ~2k in / 1.5k out total | **cents per cycle** |
| Grok reference point | xAI's own page: **$2.00 / $6.00** per 1M in/out for `grok-4.7` | — |
| 100 eval tasks × 3 providers | ~3k tokens each | **single-digit dollars per run** |
| pgvector storage | Supabase, 10k × 1536 floats ≈ 60 MB | within typical free/low tiers |
| **Weight training** | — | **NOT ESTIMATED.** Requires licensed data and a GPU budget. Orders of magnitude above everything above. Separate decision |

**The real cost driver is not inference — it is human adjudication.**
Hallucination rate and accuracy both need human labels. **That is your time, and
it is the binding constraint on how fast RSI can actually learn.**

---

## 10. ISOLATED PROOF OF CONCEPT — PROPOSED, NOT BUILT

**Smallest thing that proves the loop end to end, on work that already matters:**

> **Learn one verified improvement to the Green Blast diagnostic method, and
> show the metric moved on a set the proposer never saw.**

```
Input      10 anonymised business-process descriptions, hand-labelled by Derek
           with the automation opportunity he would actually name.
           SPLIT: 7 tuning / 3 SEQUESTERED.

Cycle      1. Phoenix Core proposes a prompt improvement for the diagnostic.
           2. Written as verification_status='hypothesis', provider + model recorded.
           3. Evaluated on the 7 — by a DIFFERENT provider from the proposer.
           4. Regression: the existing 112 tests must still pass.
           5. Vigilax adversarial review, recorded as 'shared_provider' if it is.
           6. Derek accepts or rejects, with the evidence in front of him.
           7. On acceptance: version++, supersedes set, accepted_by = authenticated.
           8. ONLY THEN: scored on the 3 sequestered cases.

Success    accuracy improves on the sequestered 3, zero regressions, and the
           improvement is still present when re-measured a generation later.
Failure    recorded in failed_experiments with why. That is a real result.
```

**Cost: single-digit dollars.** **Scope: prompts and knowledge records only — no
code, no weights, no production.** Runs entirely behind the loopback
`avatar-lab` server. It is small enough to finish and real enough to prove the
mechanism, and it improves the one offer you are trying to sell.

---

## 11. EXACT FILES TO REUSE

| File | Reuse as |
|---|---|
| `zprimedox-ai-graph/supabase/migrations/002_memory_graph.sql` | **L1 foundation — extend with §4** |
| `zprimedox-ai-graph/app/services/memory_graph.py` | graph write/read API |
| `zprimedox-ai-graph/app/services/vector_db.py` | retrieval |
| `agents/backend/chinese-ai-providers.js` | **the model gateway — generalise it** |
| `command-center/living-empire/intelligence/council/council-engine.js` | proposal lifecycle + the authority-flag pattern |
| `…/council/ai-runtime.js` | provider call path (**needs the prompt fix**) |
| `…/model-router/openai-provider.js`, `xai-provider.js` | Astra and Grok adapters, already `analysis_only` |
| `…/avatar-lab/server.js` | loopback host + server-side approval gate |
| `…/empire-manifest.json` | authority declaration |
| `vigilax-backend/server.js` | **the security pattern to copy** — `requireApiKey`, rate limiters, helmet |
| `.github/workflows/tests/deploy-safety.test.js` + the 5 suites | regression harness seed |
| `revenue-sprint/2026-11-05/proposed/webhook-guard-v2.test.js` | the negative-control template |
| `automation/chatbot-knowledge/*.md` | initial domain corpus |
| `shared/lead-capture/fhi-intake.js` | the honest-status pattern worth imitating everywhere |

**Build new only:** the §4 migration, the evaluation harness, the sequestered
set, and the acceptance recorder. Everything else exists.

---

## 12. RISKS, LIMITATIONS, AND DECISIONS FOR DEREK

### Risks

| Risk | Why it matters here |
|---|---|
| **Knowledge poisoning via the unauthenticated API** | §0. The single largest risk. RSI makes one forgery permanent |
| **Agreement mistaken for verification** | the brief names it; `'corroborated'` is the mitigation, and it only works if enforced in the write path |
| **Vigilax is not independent** | same provider, **same prompt**. Reviewing yourself and calling it verification |
| **Eval-set contamination** | if the sequestered set is ever used for tuning, every later number is meaningless. **Must be separated on day one** |
| **Self-assessed hallucination rate** | a model cannot measure its own hallucinations. Needs human labels — your time |
| **Compounding drift** | small unverified improvements accumulate. `supersedes` + re-running generation-N evals on N+1 is the defence |
| **Licensing** | open weights ≠ open data; Qwen flagships and Llama carry conditions. **Verify per model card** |
| **Cost opacity** | cost-per-task is unmeasurable until per-provider rates are in the gateway |

### Limitations of this assessment

- **Nothing here was executed.** No learning cycle, no model call, no weights.
- The `zprimedox-ai-graph` Python code was **read, not run** — no venv, and
  `pip install` would mutate the environment.
- Whether the memory graph has ever held real data is **unverified**; Supabase
  credentials are not available to this session.
- Licensing in §5 is from secondary sources that **disagree**. Leads only.
- DreamCore and Green Blast have **no code**, so their learning objectives are
  specified against components that do not yet exist.

### Decisions requiring Derek

| # | Decision | Blocks |
|---|---|---|
| **1** | **Authenticate `zprimedox-ai-graph` before any learning cycle.** | **everything** |
| **2** | Approve the §4 additive migration? | all knowledge writes |
| **3** | Approve per-executive prompts, so Vigilax is genuinely independent? | any Vigilax verdict |
| **4** | Will you hand-label the 10 PoC cases? **This is the binding constraint, and it is your time, not compute.** | the PoC |
| **5** | Wire a provider into the gateway — and which? Each needs a key and incurs spend. | learning cycles |
| **6** | Authorize any paid API spend, with a ceiling? **None incurred so far.** | all live cycles |
| **7** | Weight training: in scope at all, or outputs-only learning? Changes the cost by orders of magnitude | Phase 6 |
| **8** | Gemini: wire it, or leave it out? No key slot exists today | gateway completeness |
| **9** | Where does the knowledge base live — extend `zprimedox-ai-graph`, or a separate store behind `avatar-lab`? | L1 siting |
| **10** | Approve the PoC in §10 as the first cycle? | the roadmap |

---

**Recommendation in one line:** FHI does not need an RSI engine built — it needs
the RSI substrate it already has **secured, provenanced, and measured**, and
then one small honest cycle run end to end. Steps 0–4 of §8 are corrections, not
construction, and nothing should learn until step 0 is done.
