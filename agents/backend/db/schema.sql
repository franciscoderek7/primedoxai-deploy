-- ═══════════════════════════════════════════════════════════════════════════
-- Empire Gap Scanner — Database Schema
-- Francisco Holdings Inc. · Supabase Project: ilmlnehehfcxwlurzfxd
--
-- Deploy: Supabase Dashboard → SQL Editor → paste → Run
-- Or: supabase db push (with Supabase CLI)
-- ═══════════════════════════════════════════════════════════════════════════

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- for fuzzy domain search

-- ── leads ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS leads (
  id                UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  url               TEXT        NOT NULL,
  domain            TEXT        NOT NULL,
  business_name     TEXT,
  score             SMALLINT    CHECK (score >= 0 AND score <= 100),
  lead_type         TEXT        CHECK (lead_type IN ('HOT','WARM','COLD','PASS','UNKNOWN')) DEFAULT 'UNKNOWN',
  gap_count         SMALLINT    DEFAULT 0,
  issues            TEXT[]      DEFAULT '{}',
  est_value_cad     INTEGER,
  detected_industry TEXT,
  email             TEXT,
  contacted         BOOLEAN     NOT NULL DEFAULT FALSE,
  contacted_at      TIMESTAMPTZ,
  notes             TEXT,
  raw_scan          JSONB,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS leads_url_idx        ON leads (url);
CREATE INDEX        IF NOT EXISTS leads_domain_idx      ON leads (domain);
CREATE INDEX        IF NOT EXISTS leads_lead_type_idx   ON leads (lead_type);
CREATE INDEX        IF NOT EXISTS leads_contacted_idx   ON leads (contacted);
CREATE INDEX        IF NOT EXISTS leads_score_idx       ON leads (score);
CREATE INDEX        IF NOT EXISTS leads_created_at_idx  ON leads (created_at DESC);
CREATE INDEX        IF NOT EXISTS leads_industry_idx    ON leads (detected_industry);

-- Auto-update updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;

DROP TRIGGER IF EXISTS leads_updated_at ON leads;
CREATE TRIGGER leads_updated_at
  BEFORE UPDATE ON leads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── subscribers ──────────────────────────────────────────────────────────────
-- Records PayPal trial purchases — activated by /api/payment/success
CREATE TABLE IF NOT EXISTS subscribers (
  id               UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  email            TEXT        UNIQUE NOT NULL,
  plan             TEXT        NOT NULL DEFAULT 'trial',
  paypal_order_id  TEXT,
  paypal_payer_id  TEXT,
  amount_cad       NUMERIC(10,2),
  currency         TEXT        DEFAULT 'CAD',
  paid_at          TIMESTAMPTZ,
  trial_expires    TIMESTAMPTZ,
  active           BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS subscribers_email_idx ON subscribers (email);

-- ── email_events ─────────────────────────────────────────────────────────────
-- Populated by POST /api/email/webhook (Resend event webhooks)
CREATE TABLE IF NOT EXISTS email_events (
  id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  email_id    TEXT,
  event_type  TEXT        NOT NULL,
  lead_id     UUID        REFERENCES leads(id) ON DELETE SET NULL,
  to_email    TEXT,
  domain      TEXT,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS email_events_lead_id_idx    ON email_events (lead_id);
CREATE INDEX IF NOT EXISTS email_events_occurred_at_idx ON email_events (occurred_at DESC);

-- ── apex_events ──────────────────────────────────────────────────────────────
-- Empire-wide analytics events (referenced by apex-agent.js)
CREATE TABLE IF NOT EXISTS apex_events (
  id         UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_name TEXT        NOT NULL,
  properties JSONB       DEFAULT '{}',
  session_id TEXT,
  page_url   TEXT,
  site       TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS apex_events_event_name_idx ON apex_events (event_name);
CREATE INDEX IF NOT EXISTS apex_events_created_at_idx ON apex_events (created_at DESC);
CREATE INDEX IF NOT EXISTS apex_events_site_idx       ON apex_events (site);

-- ── referral_commissions ──────────────────────────────────────────────────────
-- Referral tracking (referenced by referral-engine.js)
CREATE TABLE IF NOT EXISTS referral_commissions (
  id             UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  referrer_id    TEXT        NOT NULL,
  referred_email TEXT,
  order_id       TEXT,
  amount_cad     NUMERIC(10,2),
  commission_cad NUMERIC(10,2),
  status         TEXT        CHECK (status IN ('pending','approved','paid','cancelled')) DEFAULT 'pending',
  paid_at        TIMESTAMPTZ,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS referral_commissions_referrer_idx ON referral_commissions (referrer_id);
CREATE INDEX IF NOT EXISTS referral_commissions_status_idx   ON referral_commissions (status);

-- ── Row Level Security ───────────────────────────────────────────────────────
ALTER TABLE leads                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscribers           ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_events          ENABLE ROW LEVEL SECURITY;
ALTER TABLE apex_events           ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_commissions  ENABLE ROW LEVEL SECURITY;

-- Service role has full access (used by backend with SUPABASE_SERVICE_KEY)
DO $$ BEGIN
  CREATE POLICY "service_full" ON leads                FOR ALL TO service_role USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "service_full" ON subscribers          FOR ALL TO service_role USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "service_full" ON email_events         FOR ALL TO service_role USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "service_full" ON apex_events          FOR ALL TO service_role USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "service_full" ON referral_commissions FOR ALL TO service_role USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
