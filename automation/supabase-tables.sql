-- automation/supabase-tables.sql — Consolidated Empire Schema (single-paste version)
-- Run in Supabase SQL Editor: supabase.com/dashboard -> SQL Editor -> New query -> paste -> Run
--
-- This file consolidates and supersedes manually running 001_leads.sql, 002_subscribers.sql,
-- and 003_full_schema.sql one-by-one. It covers every table those three migrations created
-- (leads, subscribers, users, payments, cases, email_logs) PLUS the new `escalations` table
-- (not previously defined anywhere — see note below). Every CREATE TABLE below uses
-- `IF NOT EXISTS`, so this is safe to paste-and-run even if some tables already exist from
-- running 001-003 individually. Existing data in those tables is left untouched.
--
-- Note: same limitation as 003_full_schema.sql — the Supabase service_role key n8n uses
-- works through the data API (PostgREST), which cannot run schema-creation (DDL) statements.
-- Only the SQL Editor can create tables. Claude cannot run this directly; Derek must paste
-- it into the SQL Editor himself.
--
-- Table-by-table source:
--   leads, payments     -> new design below (leads: 001_leads.sql baseline + 003's
--                          company_interest/status columns folded in directly, since
--                          IF NOT EXISTS create can't "ALTER" an existing table — see
--                          the ALTER TABLE ADD COLUMN IF NOT EXISTS lines further down)
--   users, cases,
--   email_logs           -> 003_full_schema.sql, unchanged
--   escalations           -> NEW, not yet defined anywhere — designed for this file (see
--                          "Design note: escalations" below)
--   subscribers           -> NOT included here on purpose. 002_subscribers.sql's
--                          `subscribers` table is the Weedlaw-paywall-specific table and
--                          003_full_schema.sql already noted the users/payments vs.
--                          subscribers consolidation is an open data-model decision, not
--                          something to resolve unilaterally. Run 002_subscribers.sql
--                          separately if you still want that table; it is not recreated
--                          or touched here.

-- TABLE: leads — one row per inbound lead (matches 001_leads.sql + 003's two added columns)
CREATE TABLE IF NOT EXISTS leads (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email text NOT NULL UNIQUE,
  name text,
  company text,
  source text DEFAULT 'zprimedoxaihq',
  company_interest text,
  status text DEFAULT 'new',
  created_at timestamp with time zone DEFAULT now()
);

-- In case `leads` already existed from 001_leads.sql alone (without 003's columns yet
-- applied), add the two columns 003 introduced — IF NOT EXISTS makes this idempotent too.
ALTER TABLE leads ADD COLUMN IF NOT EXISTS company_interest text;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS status text DEFAULT 'new';

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public insert" ON leads;
CREATE POLICY "Allow public insert" ON leads FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow auth select" ON leads;
CREATE POLICY "Allow auth select" ON leads FOR SELECT USING (auth.role() = 'authenticated');

-- TABLE: users — one row per paying customer, across any empire company (from 003_full_schema.sql)
CREATE TABLE IF NOT EXISTS users (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email text NOT NULL UNIQUE,
  company text NOT NULL,        -- e.g. 'OmniGuard', 'PrimeDox', 'CCLDR', 'TechPetCage'
  tier text,                    -- e.g. 'Basic', 'Pro', 'Enterprise'
  status text DEFAULT 'pending', -- pending | active | cancelled
  payment_date timestamp with time zone,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow auth select" ON users;
CREATE POLICY "Allow auth select" ON users FOR SELECT USING (auth.role() = 'authenticated');

-- TABLE: payments — one row per transaction, linked to a user (FK to users, from 003_full_schema.sql)
CREATE TABLE IF NOT EXISTS payments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  amount numeric NOT NULL,
  currency text DEFAULT 'CAD',
  status text NOT NULL,         -- completed | failed | refunded
  payment_method text,          -- PayPal | Stripe
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow auth select" ON payments;
CREATE POLICY "Allow auth select" ON payments FOR SELECT USING (auth.role() = 'authenticated');

-- TABLE: cases — DB-backed record of CCLDR/Weedlaw cases (from 003_full_schema.sql)
CREATE TABLE IF NOT EXISTS cases (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  case_name text NOT NULL,
  case_number text,
  status text DEFAULT 'active', -- active | closed | pending
  subscriber_only boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow auth select" ON cases;
CREATE POLICY "Allow auth select" ON cases FOR SELECT USING (auth.role() = 'authenticated');

-- TABLE: email_logs — every inbound/outbound email the automation touches (from 003_full_schema.sql,
-- referenced by workflow-3-email-routing-BUILD-GUIDE.md)
CREATE TABLE IF NOT EXISTS email_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  to_email text,
  from_email text,
  subject text,
  body text,
  status text DEFAULT 'sent',   -- sent | failed | bounced
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow auth select" ON email_logs;
CREATE POLICY "Allow auth select" ON email_logs FOR SELECT USING (auth.role() = 'authenticated');

-- TABLE: escalations — NEW (not yet defined anywhere else in this repo). Design note below.
--
-- Design note: escalations
-- Workflow 3 (email routing) classifies inbound mail and, on anything it doesn't
-- recognize as safe (legal / partnership / complaint / "other"), logs it into
-- `email_logs` with status = 'flagged' but workflow-3's guide never specified a
-- dedicated table for tracking *resolution* of those flagged items — it only logs
-- that an email arrived and was flagged, not whether Derek has acted on it yet. This
-- table closes that gap: one row per flagged item that needs a human decision, with
-- a status Derek can update as he works through them. Columns, as specified in the
-- build order for this file:
--   id            uuid PK
--   source_email  text   -- the inbox the flagged message came from (e.g. omniaguard1@gmail.com)
--   category      text   -- e.g. 'legal' | 'partnership' | 'complaint' | 'other' (matches
--                         -- the keyword classifier categories in workflow-3's Code node)
--   reason        text   -- free-text note on why it was flagged (e.g. matched keyword,
--                         -- or "ambiguous, no keyword match")
--   status        text DEFAULT 'open'        -- open | resolved
--   assigned_to   text DEFAULT 'derek'        -- who is responsible for resolving it; defaults
--                                              -- to Derek since CLAUDE.md / workflow-3 both say
--                                              -- legal/partnership/complaint mail is never
--                                              -- auto-handled and always needs his judgment
--   created_at    timestamp with time zone DEFAULT now()
--   resolved_at   timestamp with time zone     -- null until status is set to 'resolved'
-- This is an inference built to match the existing email_logs / workflow-3 conventions —
-- flag this design with Derek before relying on it operationally, since it was not
-- specified in any existing file.
CREATE TABLE IF NOT EXISTS escalations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  source_email text,
  category text,
  reason text,
  status text DEFAULT 'open',     -- open | resolved
  assigned_to text DEFAULT 'derek',
  created_at timestamp with time zone DEFAULT now(),
  resolved_at timestamp with time zone
);

ALTER TABLE escalations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow auth select" ON escalations;
CREATE POLICY "Allow auth select" ON escalations FOR SELECT USING (auth.role() = 'authenticated');
