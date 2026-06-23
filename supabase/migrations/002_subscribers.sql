-- Migration 002 — Subscribers table (PrimeDox / OmniGuard / CCLDR paid access)
-- Run in Supabase SQL Editor: supabase.com/dashboard -> SQL Editor -> New query -> paste -> Run

CREATE TABLE subscribers (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email text NOT NULL,
  name text,
  tier text NOT NULL,           -- e.g. 'PrimeDox Basic', 'OmniGuard Pro', 'Weedlaw Basic Follower'
  amount_paid numeric,
  paypal_txn_id text,
  source text DEFAULT 'n8n_form',
  status text DEFAULT 'active', -- active | cancelled | refunded
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;

-- n8n writes new subscriber rows via the service_role key (bypasses RLS), so no public insert policy is needed.
-- This policy only covers anything queried with the public anon key — kept locked down by default.
CREATE POLICY "Allow auth select" ON subscribers FOR SELECT USING (auth.role() = 'authenticated');
