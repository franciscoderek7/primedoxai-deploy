-- primedox-ai-mvp/sql/schema.sql
-- Run in Supabase SQL Editor: supabase.com/dashboard -> SQL Editor -> New query -> paste -> Run
-- RLS is intentionally DISABLED on every table below per MVP spec — the service role key
-- (server-only, never shipped to the browser) is the only thing that talks to these tables.

-- TABLE: users — one row per signed-up account, created automatically on first auth signup
-- via the trigger at the bottom of this file. id matches auth.users.id 1:1.
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL UNIQUE,
  tier text NOT NULL DEFAULT 'free',                 -- free | starter | growth | empire
  subscription_status text NOT NULL DEFAULT 'inactive', -- inactive | active | past_due | cancelled
  stripe_customer_id text,
  stripe_event_id text,                              -- last Stripe event id applied to this row (idempotency guard)
  ai_requests_this_month integer NOT NULL DEFAULT 0,
  bonus_requests integer NOT NULL DEFAULT 0,          -- extra requests granted via grant_referral_reward
  company_id text,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- TABLE: ai_outputs — one row per AI generation
CREATE TABLE IF NOT EXISTS ai_outputs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  company_id text,
  input_prompt text NOT NULL,
  output_text text,
  task_type text,
  mode text NOT NULL,
  tokens_used integer,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE ai_outputs DISABLE ROW LEVEL SECURITY;

-- TABLE: referrals — one row per referral relationship
CREATE TABLE IF NOT EXISTS referrals (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  referred_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending',  -- pending | converted
  reward_granted boolean NOT NULL DEFAULT false,
  converted_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT no_self_referral CHECK (referrer_id <> referred_id)
);

ALTER TABLE referrals DISABLE ROW LEVEL SECURITY;

-- TABLE: mode_rules — one row per AI "mode" the dashboard can select
CREATE TABLE IF NOT EXISTS mode_rules (
  mode text PRIMARY KEY,
  max_tokens integer NOT NULL,
  system_prompt text NOT NULL
);

ALTER TABLE mode_rules DISABLE ROW LEVEL SECURITY;

INSERT INTO mode_rules (mode, max_tokens, system_prompt) VALUES
  ('default', 800, 'You are PrimeDox AI, a helpful assistant for Francisco Holdings Inc. clients. Be concise and accurate.'),
  ('draft', 1500, 'You are PrimeDox AI in document-drafting mode. Produce a structured first draft. Always note that generated documents are starting points and should be reviewed by a qualified professional before filing or signing.'),
  ('summary', 600, 'You are PrimeDox AI in summary mode. Summarize the input clearly and briefly, preserving key facts and figures.')
ON CONFLICT (mode) DO NOTHING;

-- FUNCTION: consume_request — atomic usage gate. Locks the user's row (FOR UPDATE) so
-- concurrent requests from the same user can't both pass the check before either increments.
CREATE OR REPLACE FUNCTION consume_request(user_uuid uuid)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
  v_tier text;
  v_current integer;
  v_bonus integer;
  v_limit integer;
  v_upgrade_to text;
  v_allowed boolean;
BEGIN
  SELECT tier, ai_requests_this_month, bonus_requests
    INTO v_tier, v_current, v_bonus
    FROM users
    WHERE id = user_uuid
    FOR UPDATE;

  IF v_tier IS NULL THEN
    RETURN jsonb_build_object('allowed', false, 'current', 0, 'limit', 0, 'upgrade_to', 'starter', 'error', 'user_not_found');
  END IF;

  v_limit := CASE v_tier
    WHEN 'free' THEN 10
    WHEN 'starter' THEN 100
    WHEN 'growth' THEN 500
    WHEN 'empire' THEN 999999
    ELSE 10
  END;

  v_upgrade_to := CASE v_tier
    WHEN 'free' THEN 'starter'
    WHEN 'starter' THEN 'growth'
    WHEN 'growth' THEN 'empire'
    ELSE NULL
  END;

  v_allowed := v_current < (v_limit + v_bonus);

  IF v_allowed THEN
    UPDATE users SET ai_requests_this_month = ai_requests_this_month + 1
      WHERE id = user_uuid;
    v_current := v_current + 1;
  END IF;

  RETURN jsonb_build_object(
    'allowed', v_allowed,
    'current', v_current,
    'limit', v_limit + v_bonus,
    'upgrade_to', v_upgrade_to
  );
END;
$$;

-- FUNCTION: grant_referral_reward — adds bonus requests to the referrer once their
-- referred signup converts to a paid tier. Called from the Stripe webhook handler when
-- a checkout.session.completed event includes a referred user with a pending referral row.
CREATE OR REPLACE FUNCTION grant_referral_reward(referrer_uuid uuid)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE users SET bonus_requests = bonus_requests + 50
    WHERE id = referrer_uuid;
END;
$$;

-- TRIGGER: auto-create a public.users row whenever someone signs up via Supabase Auth
CREATE OR REPLACE FUNCTION handle_new_auth_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_auth_user();
