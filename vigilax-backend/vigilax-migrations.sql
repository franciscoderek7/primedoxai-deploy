-- ═══════════════════════════════════════════════════════════════
-- VIGILAX Sentinel — PostgreSQL Schema
-- Francisco Holdings Inc.
-- Run in: Railway PostgreSQL console OR Supabase SQL Editor
-- Safe to run multiple times (IF NOT EXISTS throughout)
-- ═══════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────
-- SCAN RESULTS — stores every engine output
-- ─────────────────────────────────────────────────
create table if not exists public.vigilax_scans (
  id              bigserial     primary key,
  scan_id         text          not null unique default ('VSCAN-' || floor(extract(epoch from now()) * 1000)::text),
  engine          text          not null,       -- 'click_fraud' | 'review_fraud' | 'influencer_fraud' | 'ad_fraud' | 'gov_fraud' | 'cannabis_monitor'
  verdict         text          not null,       -- 'CLEAN' | 'MONITOR' | 'SUSPICIOUS' | 'FRAUDULENT' | 'HIGH_RISK'
  risk_score      integer       not null default 0,
  severity        text          not null default 'LOW',
  target_entity   text,                          -- campaign_id, business_id, username, domain, etc.
  client_id       text,
  scan_data       jsonb,                         -- full engine output
  findings_count  integer       default 0,
  critical_count  integer       default 0,
  created_at      timestamptz   not null default now()
);

create index if not exists vigilax_scans_engine_idx  on public.vigilax_scans(engine);
create index if not exists vigilax_scans_verdict_idx on public.vigilax_scans(verdict);
create index if not exists vigilax_scans_score_idx   on public.vigilax_scans(risk_score desc);
create index if not exists vigilax_scans_created_idx on public.vigilax_scans(created_at desc);

-- ─────────────────────────────────────────────────
-- EVIDENCE VAULT — chain-of-custody packages
-- ─────────────────────────────────────────────────
create table if not exists public.vigilax_evidence (
  id              bigserial     primary key,
  package_id      text          not null unique,
  scan_id         bigint        references public.vigilax_scans(id),
  case_id         text,
  investigator    text,
  client_name     text,
  jurisdiction    text          default 'Ontario, Canada',
  evidence_hash   text          not null,        -- SHA256 of raw scan data
  schema_version  text          default '2.0',
  package_json    jsonb,                         -- full evidence package
  html_report     text,                          -- HTML report
  le_report       text,                          -- Law enforcement text format
  status          text          default 'draft', -- 'draft' | 'filed' | 'closed'
  notes           text,
  created_at      timestamptz   not null default now(),
  updated_at      timestamptz   not null default now()
);

create index if not exists vigilax_evidence_case_idx on public.vigilax_evidence(case_id);
create index if not exists vigilax_evidence_hash_idx on public.vigilax_evidence(evidence_hash);

-- ─────────────────────────────────────────────────
-- HUMAN REVIEW QUEUE
-- ─────────────────────────────────────────────────
create table if not exists public.vigilax_review_queue (
  id              bigserial     primary key,
  queue_id        text          not null unique,
  scan_id         bigint        references public.vigilax_scans(id),
  status          text          not null default 'PENDING',   -- PENDING | IN_REVIEW | DECIDED | ESCALATED | CLOSED
  priority        integer       not null default 0,
  engine          text,
  verdict         text,
  risk_score      integer,
  severity        text,
  escalation_level integer      default 0,
  human_review_required boolean default true,
  submitted_by    text          default 'VIGILAX-AUTO',
  final_decision  text,                          -- CONFIRMED_FRAUD | FALSE_POSITIVE | CLOSED_BY_REVIEWER
  requires_legal_referral boolean default false,
  created_at      timestamptz   not null default now(),
  updated_at      timestamptz   not null default now()
);

create index if not exists vigilax_queue_status_idx   on public.vigilax_review_queue(status);
create index if not exists vigilax_queue_priority_idx on public.vigilax_review_queue(priority desc);

-- ─────────────────────────────────────────────────
-- REVIEW AUDIT LOG — immutable, append-only
-- ─────────────────────────────────────────────────
create table if not exists public.vigilax_audit_log (
  id              bigserial     primary key,
  queue_id        text,
  action          text          not null,
  actor           text,
  detail          text,
  metadata        jsonb,
  logged_at       timestamptz   not null default now()
);

create index if not exists vigilax_audit_queue_idx  on public.vigilax_audit_log(queue_id);
create index if not exists vigilax_audit_actor_idx  on public.vigilax_audit_log(actor);
create index if not exists vigilax_audit_logged_idx on public.vigilax_audit_log(logged_at desc);

-- audit log is append-only — no UPDATE/DELETE
alter table public.vigilax_audit_log enable row level security;
drop policy if exists "audit_log_append_only" on public.vigilax_audit_log;
create policy "audit_log_append_only" on public.vigilax_audit_log
  for insert with check (true);
-- reads: service_role only
drop policy if exists "audit_log_service_read" on public.vigilax_audit_log;
create policy "audit_log_service_read" on public.vigilax_audit_log
  for select using (auth.role() = 'service_role');

-- ─────────────────────────────────────────────────
-- ALERT LOG — record of all sent alerts
-- ─────────────────────────────────────────────────
create table if not exists public.vigilax_alerts (
  id              bigserial     primary key,
  alert_id        text          not null unique,
  engine          text,
  verdict         text,
  risk_score      integer,
  severity        text,
  target          text,
  channels_sent   text[],       -- ['email','slack','sms']
  acknowledged    boolean       default false,
  acknowledged_by text,
  acknowledged_at timestamptz,
  created_at      timestamptz   not null default now()
);

create index if not exists vigilax_alerts_severity_idx on public.vigilax_alerts(severity);
create index if not exists vigilax_alerts_created_idx  on public.vigilax_alerts(created_at desc);

-- ─────────────────────────────────────────────────
-- INDUSTRY PROFILES — sync from JSON if desired
-- ─────────────────────────────────────────────────
create table if not exists public.vigilax_industry_profiles (
  id              text          primary key,
  group_name      text,
  name            text          not null,
  fraud_risk_level text,
  common_fraud_patterns text[],
  thresholds      jsonb,
  regulatory_bodies text[],
  profile_json    jsonb,
  created_at      timestamptz   not null default now()
);

-- ─────────────────────────────────────────────────
-- VERIFY
-- ─────────────────────────────────────────────────
-- select table_name from information_schema.tables where table_schema = 'public' and table_name like 'vigilax_%' order by table_name;
-- Expected: vigilax_alerts, vigilax_audit_log, vigilax_evidence, vigilax_industry_profiles, vigilax_review_queue, vigilax_scans

-- ─────────────────────────────────────────────────
-- DONE — 6 VIGILAX tables
-- ─────────────────────────────────────────────────
