# ROS v2 vs. Existing Automation Stack — Reconciliation Memo

Manus produced a "Revenue Operating System v2" architecture (Next.js + Supabase +
n8n + Stripe + a 4-agent AI workforce). This repo already has a working,
source-grounded version of most of the same pieces under `automation/`. The two
designs are not compatible as separate systems running in parallel — running both
against live revenue would mean two CRMs with no single source of truth. This memo
maps ROS v2's concepts onto what's already built here, so nothing from the ROS v2
report is lost, and recommends which one to treat as canonical.

## Recommendation

Keep `automation/supabase-tables.sql`, `n8n-workflow-payment.json`,
`openai-prompts.json`, and `chatbot-kb.json` as the source of truth. They are
already committed and already grounded in this empire's real per-company content
(via `automation/chatbot-knowledge/*.md`) — ROS v2's schema and prompts are
generic templates with no company-specific facts loaded into them yet. Building
ROS v2's schema fresh would mean re-deriving the same facts a second time with no
benefit.

## Table mapping (ROS v2 → existing schema)

| ROS v2 table | Existing equivalent | Notes |
|---|---|---|
| `contacts` (lead storage + scoring) | `leads` | Existing table has no scoring column. If lead scoring is wanted, add `score numeric` to `leads` via `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` rather than creating a parallel `contacts` table. |
| `deals` (pipeline stages, value) | *(no equivalent yet)* | Not covered by any existing table. `users.status` (pending/active/cancelled) covers post-sale state, not pre-sale pipeline stage. Would need a new table if pipeline tracking before payment is wanted. |
| `events` (system-wide activity log) | *(no equivalent yet)* | Closest existing analog is `email_logs` (email-specific) and `escalations` (flagged-item-specific) — neither is a general event log. A generic `events` table is the one piece of ROS v2 with no overlap in the current schema. |
| `revenue` (payment/transaction tracking) | `payments` | Functionally the same: amount, currency, status, linked to `users`. No action needed — already covers this. |

## Workflow mapping (ROS v2 engines → existing n8n workflows)

| ROS v2 engine | Existing workflow | Notes |
|---|---|---|
| Payment Engine (Stripe webhook → revenue logging → onboarding → upsell) | `automation/n8n/n8n-workflow-payment.json` | Already built for PayPal-style webhook → Supabase `payments` insert → welcome email. Upsell-trigger step is not yet built. |
| Lead Engine (webhook → Supabase → AI scoring → CRM update → email/SMS) | Workflow 1 (PrimeDox trial, referenced in EMPIRE.md) | Existing workflow does intake + welcome email; no AI scoring step exists yet. |
| Retention Engine, Optimization Engine | *(not built)* | No existing equivalent. |
| Sales Engine (Closer AI → offer → checkout link) | *(not built)* | No existing equivalent — closest is the per-company OpenAI system prompts in `openai-prompts.json`, which are inbound-FAQ/chatbot prompts, not outbound closer/objection-handling prompts. |

## AI workforce mapping (ROS v2 4-agent model → existing prompts)

`openai-prompts.json` currently has one prompt per company (inbound support/FAQ
voice). ROS v2's SDR/Closer/Analyst/Ops roles are a different axis — role-based
rather than company-based — and don't exist anywhere in this repo yet. These
would be new prompts, not a replacement for the per-company ones, if Derek wants
that layer added.

## What's genuinely new in ROS v2 with no existing equivalent

- A general-purpose `events` table / event-driven logging across every action.
- A `deals` pipeline-stage table (pre-payment).
- Retention and Optimization automation engines.
- Role-based (SDR/Closer/Analyst/Ops) AI prompts, as opposed to today's
  company-based prompts.

If any of these are wanted, they can be added as new tables/files alongside the
existing schema rather than standing up ROS v2 as a second, parallel system.
