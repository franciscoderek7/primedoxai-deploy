-- Migration 001 — Leads table
-- Run in Supabase SQL Editor: supabase.com/dashboard → SQL Editor → New query → paste → Run

CREATE TABLE leads (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email text NOT NULL UNIQUE,
  name text,
  company text,
  source text DEFAULT 'zprimedoxaihq',
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public insert" ON leads FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow auth select" ON leads FOR SELECT USING (auth.role() = 'authenticated');
