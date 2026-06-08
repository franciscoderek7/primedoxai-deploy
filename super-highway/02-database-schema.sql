-- =============================================================================
-- SUPER HIGHWAY — DATABASE SCHEMA
-- Phase 1 Deliverable 2 of 7 — June 6, 2026
--
-- THREE Supabase projects required:
--   Project HUB:    Hub session + registry only (no PII, no purchases)
--   Project LOOP_A: All Derek-identity-brand data (CCLDR, PrimeDox, Weedlaw, etc.)
--   Project LOOP_B: All anonymous-brand data (OmniaGuard, Kiaros, SoulStack, etc.)
--
-- Run each section against its corresponding project.
-- Never run Loop A schema against Loop B project or vice versa.
-- =============================================================================


-- =============================================================================
-- HUB PROJECT — hub sessions, module registry, universal cart, affiliate system
-- =============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Hub sessions (opaque — stores NO PII, NO email, NO name)
-- The hub only knows: "this session has credentials for loop(s) X"
CREATE TABLE hub_sessions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_active     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  loop_a_enrolled BOOLEAN NOT NULL DEFAULT FALSE,
  loop_b_enrolled BOOLEAN NOT NULL DEFAULT FALSE,
  -- These IDs are opaque references — no way to reverse-look a person from them
  loop_a_ref      UUID, -- encrypted reference to loop A user (stored encrypted, key NOT in this DB)
  loop_b_ref      UUID, -- encrypted reference to loop B user (stored encrypted, key NOT in this DB)
  device_fingerprint TEXT, -- for fraud detection only, not identity
  ip_hash         TEXT  -- SHA-256 of IP, not raw IP
);

CREATE INDEX idx_hub_sessions_created ON hub_sessions(created_at);

-- Module registry — the 45 properties
CREATE TABLE modules (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_key         TEXT UNIQUE NOT NULL, -- e.g. 'ccldr', 'omniaguard', 'primedox'
  display_name       TEXT NOT NULL,
  domain             TEXT NOT NULL,
  loop               TEXT NOT NULL CHECK (loop IN ('A', 'B')),
  category           TEXT NOT NULL CHECK (category IN ('digital', 'physical', 'service', 'subscription', 'hybrid')),
  stripe_account_id  TEXT, -- Stripe Connect account ID for this module
  active             BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order         INT NOT NULL DEFAULT 99,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed known modules (insert in deploy script)
INSERT INTO modules (module_key, display_name, domain, loop, category, sort_order) VALUES
  ('ccldr',             'CCLDR.net',                   'ccldr.net',              'A', 'subscription', 1),
  ('primedox',          'PrimeDox AI',                 'primedoxai.com',          'A', 'subscription', 2),
  ('weedlaw-education', 'Weedlaw Education',           'weedlaw-education',       'A', 'digital',      3),
  ('francisco-holdings','Francisco Holdings',          'franciscoholdings.com',   'A', 'service',      4),
  ('ccc',               'CCC.net',                     'ccc.net',                 'A', 'hybrid',       5),
  ('omniaguard',        'OmniaGuard',                  'omniaguard.com',          'B', 'subscription', 1),
  ('kiaros',            'Kiaros',                      'kiaros.ai',               'B', 'service',      2),
  ('soulstack',         'SoulStack',                   'soulstack.ai',            'B', 'subscription', 3),
  ('cleanswarm',        'CleanSwarm',                  'cleanswarm.ca',           'B', 'subscription', 4),
  ('techpetcage',       'TechPetCage',                 'techpetcage.com',         'B', 'physical',     5),
  ('space-swarm',       'Space Swarm',                 'space-swarm.franciscoholdings.com', 'B', 'subscription', 10),
  ('auto-swarm',        'Auto Swarm',                  'auto-swarm.franciscoholdings.com',  'B', 'subscription', 11),
  ('quantum-swarm',     'Quantum Swarm',               'quantum-swarm.franciscoholdings.com','B','subscription',12),
  ('biotech-swarm',     'BioTech Swarm',               'biotech-swarm.franciscoholdings.com','B','subscription',13),
  ('health-swarm',      'Health Swarm',                'health-swarm.franciscoholdings.com', 'B','subscription',14),
  ('fintech-swarm',     'FinTech Swarm',               'fintech-swarm.franciscoholdings.com','B','subscription',15),
  ('energy-swarm',      'Energy Swarm',                'energy-swarm.franciscoholdings.com', 'B','subscription',16),
  ('logistics-swarm',   'Logistics Swarm',             'logistics-swarm.franciscoholdings.com','B','subscription',17);

-- Hub-level product catalog (mirrors module products — source of truth is each module)
CREATE TABLE hub_products (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id       UUID NOT NULL REFERENCES modules(id),
  external_id     TEXT NOT NULL, -- the product ID within the module's own DB
  sku             TEXT UNIQUE NOT NULL,
  name            TEXT NOT NULL,
  short_desc      TEXT,
  price_cents     INT NOT NULL, -- CAD cents
  currency        TEXT NOT NULL DEFAULT 'CAD',
  product_type    TEXT NOT NULL CHECK (product_type IN ('one_time','subscription_monthly','subscription_annual','lifetime')),
  category        TEXT NOT NULL,
  tags            TEXT[],
  image_url       TEXT,
  active          BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (module_id, external_id)
);

CREATE INDEX idx_hub_products_module ON hub_products(module_id);
CREATE INDEX idx_hub_products_active  ON hub_products(active);
CREATE INDEX idx_hub_products_tags    ON hub_products USING gin(tags);

-- Universal cart (session-scoped, not user-scoped — users not required to browse)
CREATE TABLE carts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id      UUID NOT NULL REFERENCES hub_sessions(id) ON DELETE CASCADE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at      TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '7 days',
  coupon_code     TEXT,
  discount_cents  INT NOT NULL DEFAULT 0,
  loop_a_subtotal INT NOT NULL DEFAULT 0, -- cents
  loop_b_subtotal INT NOT NULL DEFAULT 0  -- cents
);

CREATE TABLE cart_items (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id         UUID NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
  product_id      UUID NOT NULL REFERENCES hub_products(id),
  quantity        INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit_price_cents INT NOT NULL,
  added_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_cart_items_cart ON cart_items(cart_id);

-- Hub-level orders (one order per checkout — may span multiple modules)
CREATE TABLE hub_orders (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id        UUID NOT NULL REFERENCES hub_sessions(id),
  loop_a_order_ref  UUID, -- FK to loop A's orders table (opaque)
  loop_b_order_ref  UUID, -- FK to loop B's orders table (opaque)
  total_cents       INT NOT NULL,
  currency          TEXT NOT NULL DEFAULT 'CAD',
  payment_method    TEXT NOT NULL CHECK (payment_method IN ('stripe','crypto','invoice','interac')),
  payment_status    TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending','processing','paid','failed','refunded')),
  stripe_payment_intent_id TEXT,
  crypto_tx_hash    TEXT,
  invoice_number    TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_hub_orders_session    ON hub_orders(session_id);
CREATE INDEX idx_hub_orders_payment_status ON hub_orders(payment_status);
CREATE INDEX idx_hub_orders_created    ON hub_orders(created_at);

-- Affiliate system (loop-agnostic — affiliates earn across both loops)
CREATE TABLE affiliates (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code            TEXT UNIQUE NOT NULL, -- e.g. 'CCLDR-PARTNER-SMITH-001'
  name            TEXT,
  email           TEXT NOT NULL,
  commission_pct  NUMERIC(5,2) NOT NULL DEFAULT 15.00,
  tier            TEXT NOT NULL DEFAULT 'affiliate' CHECK (tier IN ('affiliate','preferred','strategic')),
  loop_scope      TEXT NOT NULL DEFAULT 'A' CHECK (loop_scope IN ('A','B','both')),
  active          BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE affiliate_conversions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id    UUID NOT NULL REFERENCES affiliates(id),
  order_id        UUID NOT NULL REFERENCES hub_orders(id),
  commission_cents INT NOT NULL,
  status          TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','paid','reversed')),
  payout_date     DATE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_affiliate_conversions_affiliate ON affiliate_conversions(affiliate_id);
CREATE INDEX idx_affiliate_conversions_status    ON affiliate_conversions(status);

-- Loyalty credits (hub-level — spendable across all properties in same loop)
CREATE TABLE loyalty_ledger (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id      UUID NOT NULL REFERENCES hub_sessions(id),
  loop            TEXT NOT NULL CHECK (loop IN ('A','B')),
  change_credits  INT NOT NULL, -- positive = earned, negative = spent
  reason          TEXT NOT NULL, -- 'purchase', 'referral', 'bonus', 'redemption'
  order_id        UUID REFERENCES hub_orders(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_loyalty_session ON loyalty_ledger(session_id, loop);

-- A/B test variants (for cross-sell AI optimization)
CREATE TABLE ab_experiments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL UNIQUE,
  active          BOOLEAN NOT NULL DEFAULT TRUE,
  variants        JSONB NOT NULL, -- [{id, weight, config}]
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Row Level Security on hub tables
ALTER TABLE hub_sessions        ENABLE ROW LEVEL SECURITY;
ALTER TABLE hub_products        ENABLE ROW LEVEL SECURITY;
ALTER TABLE carts               ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items          ENABLE ROW LEVEL SECURITY;
ALTER TABLE hub_orders          ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliates          ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_conversions ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_ledger      ENABLE ROW LEVEL SECURITY;

-- Hub service role can read/write everything (internal API only)
-- Public users cannot query these tables directly — all access goes via Edge Functions


-- =============================================================================
-- LOOP A PROJECT — Derek-identity brands (CCLDR, PrimeDox, Weedlaw Ed, FHI, CCC)
-- Deploy to Supabase Project A ONLY
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Loop A users (full identity — name and email required, Derek's brands are personal)
CREATE TABLE users_a (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email           TEXT UNIQUE NOT NULL,
  full_name       TEXT,
  phone           TEXT,
  province        TEXT,
  country         TEXT NOT NULL DEFAULT 'CA',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_login      TIMESTAMPTZ,
  marketing_opt_in BOOLEAN NOT NULL DEFAULT FALSE,
  -- Encrypted reference back to hub (for SSO only — decrypted only by hub service role)
  hub_ref_encrypted TEXT
);

CREATE INDEX idx_users_a_email ON users_a(email);

-- Subscriptions
CREATE TABLE subscriptions_a (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users_a(id) ON DELETE CASCADE,
  module_key      TEXT NOT NULL, -- 'ccldr', 'primedox', 'weedlaw-education', etc.
  tier            TEXT NOT NULL, -- 'warrior', 'professional', 'elite', 'sovereign' etc.
  status          TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','paused','cancelled','past_due')),
  price_cents     INT NOT NULL,
  currency        TEXT NOT NULL DEFAULT 'CAD',
  billing_period  TEXT NOT NULL DEFAULT 'monthly' CHECK (billing_period IN ('monthly','annual','lifetime')),
  stripe_subscription_id TEXT,
  current_period_start TIMESTAMPTZ,
  current_period_end   TIMESTAMPTZ,
  cancel_at       TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_subs_a_user   ON subscriptions_a(user_id);
CREATE INDEX idx_subs_a_module ON subscriptions_a(module_key);
CREATE INDEX idx_subs_a_status ON subscriptions_a(status);

-- Orders (Loop A purchases — one-time + subscription invoices)
CREATE TABLE orders_a (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hub_order_ref   UUID UNIQUE NOT NULL, -- links back to hub_orders (opaque)
  user_id         UUID NOT NULL REFERENCES users_a(id),
  module_key      TEXT NOT NULL,
  line_items      JSONB NOT NULL, -- [{sku, name, qty, unit_price_cents}]
  subtotal_cents  INT NOT NULL,
  discount_cents  INT NOT NULL DEFAULT 0,
  tax_cents       INT NOT NULL DEFAULT 0,
  total_cents     INT NOT NULL,
  currency        TEXT NOT NULL DEFAULT 'CAD',
  payment_method  TEXT NOT NULL,
  payment_status  TEXT NOT NULL DEFAULT 'pending',
  fulfillment_status TEXT NOT NULL DEFAULT 'pending' CHECK (fulfillment_status IN ('pending','processing','fulfilled','failed')),
  affiliate_code  TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_orders_a_user   ON orders_a(user_id);
CREATE INDEX idx_orders_a_module ON orders_a(module_key);
CREATE INDEX idx_orders_a_status ON orders_a(payment_status);

-- CCLDR-specific: case tracking (premium feature for Warrior+ subscribers)
CREATE TABLE ccldr_case_tracker (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users_a(id) ON DELETE CASCADE,
  charge_description TEXT,
  court_location  TEXT,
  next_appearance DATE,
  appearance_count INT NOT NULL DEFAULT 0,
  beno_x_status   TEXT, -- 'not_reviewed', 'exemption_found', 'no_exemption'
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- PrimeDox-specific: AI session log (for billing and quality review)
CREATE TABLE primedox_sessions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users_a(id) ON DELETE CASCADE,
  session_type    TEXT NOT NULL CHECK (session_type IN ('emergency','standard','document_prep')),
  started_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at        TIMESTAMPTZ,
  message_count   INT NOT NULL DEFAULT 0,
  frameworks_used TEXT[],
  satisfaction    INT CHECK (satisfaction BETWEEN 1 AND 5)
);

-- Weedlaw Education: course progress
CREATE TABLE weedlaw_enrollments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users_a(id) ON DELETE CASCADE,
  course_sku      TEXT NOT NULL,
  enrolled_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  progress_pct    INT NOT NULL DEFAULT 0 CHECK (progress_pct BETWEEN 0 AND 100),
  completed_at    TIMESTAMPTZ,
  certificate_url TEXT
);

-- Row Level Security — Loop A
ALTER TABLE users_a             ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions_a     ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders_a            ENABLE ROW LEVEL SECURITY;
ALTER TABLE ccldr_case_tracker  ENABLE ROW LEVEL SECURITY;
ALTER TABLE primedox_sessions   ENABLE ROW LEVEL SECURITY;
ALTER TABLE weedlaw_enrollments ENABLE ROW LEVEL SECURITY;

-- Users can read/write their own data only
CREATE POLICY "users_a_self" ON users_a
  FOR ALL USING (auth.uid() = id);

CREATE POLICY "subs_a_self" ON subscriptions_a
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "orders_a_self" ON orders_a
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "ccldr_tracker_self" ON ccldr_case_tracker
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "primedox_sessions_self" ON primedox_sessions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "weedlaw_self" ON weedlaw_enrollments
  FOR ALL USING (auth.uid() = user_id);


-- =============================================================================
-- LOOP B PROJECT — Anonymous brands (OmniaGuard, Kiaros, SoulStack, CleanSwarm, etc.)
-- Deploy to Supabase Project B ONLY
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Loop B users (minimal PII — email only, name NOT required, by design)
CREATE TABLE users_b (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email           TEXT UNIQUE NOT NULL,
  -- Deliberately no full_name, phone, province fields — anonymous by design
  country         TEXT NOT NULL DEFAULT 'CA',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_login      TIMESTAMPTZ,
  marketing_opt_in BOOLEAN NOT NULL DEFAULT FALSE,
  hub_ref_encrypted TEXT
);

CREATE INDEX idx_users_b_email ON users_b(email);

-- Subscriptions (Loop B)
CREATE TABLE subscriptions_b (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users_b(id) ON DELETE CASCADE,
  module_key      TEXT NOT NULL, -- 'omniaguard', 'kiaros', 'cleanswarm', etc.
  tier            TEXT NOT NULL,
  status          TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','paused','cancelled','past_due')),
  price_cents     INT NOT NULL,
  currency        TEXT NOT NULL DEFAULT 'CAD',
  billing_period  TEXT NOT NULL DEFAULT 'monthly' CHECK (billing_period IN ('monthly','annual','lifetime')),
  stripe_subscription_id TEXT,
  current_period_start TIMESTAMPTZ,
  current_period_end   TIMESTAMPTZ,
  cancel_at       TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_subs_b_user   ON subscriptions_b(user_id);
CREATE INDEX idx_subs_b_module ON subscriptions_b(module_key);
CREATE INDEX idx_subs_b_status ON subscriptions_b(status);

-- Orders (Loop B)
CREATE TABLE orders_b (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hub_order_ref   UUID UNIQUE NOT NULL,
  user_id         UUID NOT NULL REFERENCES users_b(id),
  module_key      TEXT NOT NULL,
  line_items      JSONB NOT NULL,
  subtotal_cents  INT NOT NULL,
  discount_cents  INT NOT NULL DEFAULT 0,
  tax_cents       INT NOT NULL DEFAULT 0,
  total_cents     INT NOT NULL,
  currency        TEXT NOT NULL DEFAULT 'CAD',
  payment_method  TEXT NOT NULL,
  payment_status  TEXT NOT NULL DEFAULT 'pending',
  fulfillment_status TEXT NOT NULL DEFAULT 'pending',
  affiliate_code  TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_orders_b_user   ON orders_b(user_id);
CREATE INDEX idx_orders_b_module ON orders_b(module_key);

-- OmniaGuard-specific: audit requests and security scan results
CREATE TABLE omniaguard_audits (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES users_b(id), -- nullable (pre-auth audit requests)
  company_name    TEXT,
  ai_stack_desc   TEXT,
  contact_email   TEXT NOT NULL,
  status          TEXT NOT NULL DEFAULT 'requested' CHECK (status IN ('requested','in_progress','complete','delivered')),
  findings        JSONB, -- stored encrypted in production
  tier_recommended TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- CleanSwarm-specific: client/crew management data per account
CREATE TABLE cleanswarm_accounts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users_b(id) ON DELETE CASCADE,
  business_name   TEXT NOT NULL,
  crew_count      INT NOT NULL DEFAULT 1,
  client_count    INT NOT NULL DEFAULT 0,
  trial_started   TIMESTAMPTZ,
  trial_ends      TIMESTAMPTZ,
  onboarding_done BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Physical order fulfillment (TechPetCage + any physical products)
CREATE TABLE physical_fulfillments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id        UUID NOT NULL REFERENCES orders_b(id),
  shipstation_order_id TEXT,
  tracking_number TEXT,
  carrier         TEXT,
  shipped_at      TIMESTAMPTZ,
  delivered_at    TIMESTAMPTZ,
  status          TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','label_created','shipped','delivered','returned'))
);

-- Row Level Security — Loop B
ALTER TABLE users_b             ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions_b     ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders_b            ENABLE ROW LEVEL SECURITY;
ALTER TABLE omniaguard_audits   ENABLE ROW LEVEL SECURITY;
ALTER TABLE cleanswarm_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE physical_fulfillments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_b_self" ON users_b
  FOR ALL USING (auth.uid() = id);

CREATE POLICY "subs_b_self" ON subscriptions_b
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "orders_b_self" ON orders_b
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "audits_b_self" ON omniaguard_audits
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "cleanswarm_self" ON cleanswarm_accounts
  FOR ALL USING (auth.uid() = user_id);


-- =============================================================================
-- SHARED UTILITIES — run against all three projects
-- =============================================================================

-- Audit log (append-only — captures every write for compliance)
CREATE TABLE audit_log (
  id          BIGSERIAL PRIMARY KEY,
  ts          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  actor_id    UUID,        -- user or service-role UUID
  table_name  TEXT NOT NULL,
  record_id   UUID NOT NULL,
  operation   TEXT NOT NULL CHECK (operation IN ('INSERT','UPDATE','DELETE')),
  old_data    JSONB,
  new_data    JSONB
);

CREATE INDEX idx_audit_ts    ON audit_log(ts);
CREATE INDEX idx_audit_actor ON audit_log(actor_id);

-- Trigger function for automatic audit logging
CREATE OR REPLACE FUNCTION fn_audit_trigger()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO audit_log (actor_id, table_name, record_id, operation, old_data, new_data)
  VALUES (
    auth.uid(),
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    TG_OP,
    CASE WHEN TG_OP = 'INSERT' THEN NULL ELSE row_to_json(OLD)::jsonb END,
    CASE WHEN TG_OP = 'DELETE' THEN NULL ELSE row_to_json(NEW)::jsonb END
  );
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Apply audit trigger to sensitive tables (run per-project as appropriate)
-- Example for Loop A:
-- CREATE TRIGGER audit_users_a    AFTER INSERT OR UPDATE OR DELETE ON users_a    FOR EACH ROW EXECUTE FUNCTION fn_audit_trigger();
-- CREATE TRIGGER audit_orders_a   AFTER INSERT OR UPDATE OR DELETE ON orders_a   FOR EACH ROW EXECUTE FUNCTION fn_audit_trigger();
-- CREATE TRIGGER audit_subs_a     AFTER INSERT OR UPDATE OR DELETE ON subscriptions_a FOR EACH ROW EXECUTE FUNCTION fn_audit_trigger();

-- updated_at auto-update trigger
CREATE OR REPLACE FUNCTION fn_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Apply to all tables with updated_at column (example — repeat for each table):
-- CREATE TRIGGER set_updated_at BEFORE UPDATE ON users_a FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();
