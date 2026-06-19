# zPrimeDox AI HQ — Technical Specification (for patent counsel review)

This is a technical description of what's actually built, written so
Derek can hand it to a patent attorney for a real patentability/prior-art
assessment. **This document makes no claim that any of this is patentable
or novel** — that determination requires a registered patent agent/lawyer
to do a prior-art search and is outside what I can assess or represent. If
this is shared publicly or used as marketing copy instead of an internal
spec, the "first/only/patentable AI" framing should be removed — see
`DEPLOY.md`'s "What's marketing language, not implemented" section for why.

## 1. System overview

A FastAPI backend (`zprimedox-ai-graph/`) provides two distinct AI
interaction patterns, both backed by a single Claude model (Anthropic API)
and a shared Supabase Postgres + pgvector store:

1. **Lightweight persona chat** (`/api/v1/widget-chat`) — one Claude API
   call per message, with a per-site system prompt selected from a static
   registry (`app/personas.py`), logged to a `widget_messages` table.
2. **Stateful document-drafting workflow** (`/api/v1/run` and related
   endpoints) — a LangGraph `StateGraph` state machine with a human
   approval gate, described in detail in section 3.

## 2. Component inventory (what exists vs. what's described elsewhere as more)

| Component | What it actually is | What it is NOT |
|---|---|---|
| "10 AI personas" | 10 distinct system-prompt strings keyed by name, in one Python dict (`PERSONAS` in `app/personas.py`), all calling the same underlying Claude model | 10 separate trained/fine-tuned models |
| "Learns and gets smarter" | Each conversation turn is written as a row to `widget_messages` for human review | Any form of model retraining, fine-tuning, or weight update |
| "zPrimeDox AI HQ command center" | A FastAPI service with REST endpoints, a LangGraph state machine, and a Supabase-backed report aggregation endpoint | A standalone "command and control" system with autonomous decision authority |
| "Cross-site swarm intelligence" | All sites' widgets call the same backend and write to the same Supabase project | Any agent-to-agent communication, coordination protocol, or emergent multi-agent behavior |

## 3. The one component with genuine architectural structure: the human-gate workflow

This is the part of the system most likely to have anything specific
enough for a patent attorney to evaluate, so it's described in more detail.

### 3.1 Domain classification and routing
`app/graphs/router.py`'s `router_node` sends the raw user query to Claude
with a JSON-only system prompt, classifying it into one of: `legal`,
`cyber`, `safety`, `business`, `unknown`. `route_to_domain` then dispatches
to one of four independently-compiled LangGraph sub-graphs.

### 3.2 Per-domain sub-graph pipeline
Each domain (e.g., `legal`) runs its own multi-node pipeline of sequential
Claude calls with domain-specific system prompts (intake → research →
draft → review), defined in `app/graphs/legal.py` (and equivalent cyber/
safety/business files). Each node is a single Claude API call with a
specialized prompt from `app/services/llm.py`'s `SYSTEM_PROMPTS` dict;
there is no model-level specialization, only prompt-level specialization.

### 3.3 Human-in-the-loop interrupt/resume
After the review node, the graph reaches a `human_gate` node that calls
LangGraph's `interrupt()` primitive, pausing graph execution and persisting
state via a Redis-backed checkpointer (`RedisSaver`, see
`app/graphs/router.py::_get_checkpointer`). The paused state is queryable
via `GET /api/v1/pending/{thread_id}`. A human reviewer submits a decision
(`approve`/`reject`/`revision`) via `POST /api/v1/run/{thread_id}/resume`,
which calls LangGraph's `Command(resume=...)` to continue execution from
the exact point it paused. `human_gate_timeout_seconds` (default 86400, 24
hours) governs how long a workflow may sit paused before being considered
stale (enforcement of the timeout itself is not yet implemented in code —
see Known Gaps below).

### 3.4 Memory/knowledge graph
`supabase/migrations/002_*.sql` defines `memory_nodes`/`memory_edges`
tables with `vector(1536)` embeddings and an `ivfflat` index, queried via
a `match_memory_nodes` RPC using cosine similarity (`app/services/
vector_db.py::search_similar`). This is a standard retrieval-augmented
pattern (embed → store → cosine-similarity search), not a custom
indexing or retrieval algorithm.

## 4. What a patent attorney would likely tell Derek (general, non-legal-advice observation)

Software patents in this space typically require demonstrating a specific,
non-obvious technical improvement over prior art — not just "using an LLM
for X domain." The most specific, structurally distinct piece of this
system is the combination in section 3.3 (graph-based interrupt/resume tied
to a Redis checkpoint store, gating a multi-step LLM pipeline on human
approval) — but human-in-the-loop approval gates and LangGraph's own
interrupt/Command primitives are themselves publicly documented,
general-purpose features of the open-source LangGraph library, not
something built from scratch here. Whether the *specific combination* used
in this app (4-domain router + per-domain pipeline + human gate + Charter-
specific legal prompts) clears the novelty/non-obviousness bar is a
judgment call only a patent professional doing an actual prior-art search
can make — this document is not that search.

## 5. Known gaps relevant to any "production-grade" claim

- `human_gate_timeout_seconds` is defined in config but not enforced
  anywhere in code — a paused workflow does not currently auto-expire.
- The Redis checkpointer requires Redis Stack (RediSearch module); see
  `DEPLOY.md` for the deployment bug this caused and the fix.
- No automated tests exist for the LangGraph workflows themselves (only
  manual endpoint-level smoke testing has been done — see DEPLOY.md).
