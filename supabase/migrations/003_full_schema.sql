-- Migration 003 — Full empire schema (users, payments, cases, email_logs + leads extension)
-- Run in Supabase SQL Editor: supabase.com/dashboard -> SQL Editor -> New query -> paste -> Run
--
-- Note: this is written for Derek to run himself in the SQL Editor. The Supabase
-- service_role key n8n uses for inserts/selects is a data-API key (PostgREST) — it
-- cannot run schema-creation (DDL) statements like CREATE TABLE over the REST API,
-- so Claude cannot execute this migration directly. Paste it once in the SQL Editor
-- and every table below is live immediately; n8n's service_role key will then be
-- able to read/write all of them (service_role bypasses RLS by design).
--
-- Overlap note: migration 002 already created a `subscribers` table for the
-- Weedlaw-paywall n8n workflow specifically (email/tier/amount_paid/paypal_txn_id).
-- This migration's `users` + `payments` tables below are the broader, multi-company
-- version from Derek's full-automation prompt. Both can coexist for now — decide
-- later whether to consolidate `subscribers` into `users`+`payments`, or keep
-- `subscribers` as the Weedlaw-specific table. Not collapsing them here since that's
-- a data-model decision, not something to make unilaterally.

-- Extend the existing `leads` table (created in migration 001) with the two new
-- columns Derek's latest spec calls for, instead of recreating it.
ALTER TABLE leads ADD COLUMN IF NOT EXISTS company_interest text;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS status text DEFAULT 'new';

-- TABLE: users — one row per paying customer, across any empire company
CREATE TABLE users (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email text NOT NULL UNIQUE,
  company text NOT NULL,        -- e.g. 'OmniGuard', 'PrimeDox', 'CCLDR', 'TechPetCage'
  tier text,                    -- e.g. 'Basic', 'Pro', 'Enterprise'
  status text DEFAULT 'pending', -- pending | active | cancelled
  payment_date timestamp with time zone,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow auth select" ON users FOR SELECT USING (auth.role() = 'authenticated');

-- TABLE: payments — one row per transaction, linked to a user
CREATE TABLE payments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  amount numeric NOT NULL,
  currency text DEFAULT 'CAD',
  status text NOT NULL,         -- completed | failed | refunded
  payment_method text,          -- PayPal | Stripe
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow auth select" ON payments FOR SELECT USING (auth.role() = 'authenticated');

-- TABLE: cases — DB-backed record of CCLDR/Weedlaw cases (the live site pages
-- themselves are static HTML for now; this table is for future dashboard/API use)
CREATE TABLE cases (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  case_name text NOT NULL,
  case_number text,
  status text DEFAULT 'active', -- active | closed | pending
  subscriber_only boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow auth select" ON cases FOR SELECT USING (auth.role() = 'authenticated');

-- TABLE: email_logs — every inbound/outbound email the automation touches
CREATE TABLE email_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  to_email text,
  from_email text,
  subject text,
  body text,
  status text DEFAULT 'sent',   -- sent | failed | bounced
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow auth select" ON email_logs FOR SELECT USING (auth.role() = 'authenticated');
