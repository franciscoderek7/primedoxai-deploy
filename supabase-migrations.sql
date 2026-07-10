-- ============================================================
-- Francisco Holdings Inc. — Supabase Full Migration
-- Project: ilmlnehehfcxwlurzfxd
-- Run in: Supabase dashboard → SQL Editor → New query → Run
-- Safe to run multiple times (all CREATE TABLE use IF NOT EXISTS)
-- ============================================================

-- ─────────────────────────────────────────────────
-- APEX EVENTS (analytics — tracks every user action)
-- ─────────────────────────────────────────────────
create table if not exists public.apex_events (
  id           bigserial   primary key,
  session_id   text        not null,
  event_type   text        not null,             -- 'page_view' | 'cta_click' | 'exit_intent' | 'purchase'
  site         text,                              -- 'ccldr' | 'primedox' | 'vigilax' etc.
  page         text,
  metadata     jsonb,
  lead_score   integer     not null default 0,   -- 0=cold, 25=warm, 75=hot (from apex-agent.js)
  created_at   timestamptz not null default now()
);
create index if not exists apex_events_session_idx on public.apex_events(session_id);
create index if not exists apex_events_site_idx    on public.apex_events(site);
create index if not exists apex_events_created_idx on public.apex_events(created_at desc);

alter table public.apex_events enable row level security;
drop policy if exists "apex_events_public_insert" on public.apex_events;
create policy "apex_events_public_insert" on public.apex_events
  for insert with check (true);               -- anyone can write an event
drop policy if exists "apex_events_admin_read" on public.apex_events;
create policy "apex_events_admin_read" on public.apex_events
  for select using (auth.role() = 'service_role');  -- only service key can read

-- ─────────────────────────────────────────────────
-- REFERRAL COMMISSIONS (tracks earnings per referral code)
-- ─────────────────────────────────────────────────
create table if not exists public.referral_commissions (
  id               bigserial   primary key,
  referral_code    text        not null,
  referrer_email   text        not null,
  buyer_email      text,
  product          text        not null,         -- 'ccldr-warrior' | 'primedox-pro' etc.
  sale_amount      numeric(10,2) not null,
  commission_rate  integer     not null,         -- 10 or 20 (percent)
  commission_amount numeric(10,2) generated always as (sale_amount * commission_rate / 100) stored,
  stripe_payment_id text,
  paypal_txn_id    text,
  status           text        not null default 'pending',  -- 'pending' | 'paid' | 'cancelled'
  created_at       timestamptz not null default now()
);
create index if not exists referral_comm_code_idx on public.referral_commissions(referral_code);
create index if not exists referral_comm_email_idx on public.referral_commissions(referrer_email);

alter table public.referral_commissions enable row level security;
drop policy if exists "referral_comm_insert" on public.referral_commissions;
create policy "referral_comm_insert" on public.referral_commissions
  for insert with check (true);
drop policy if exists "referral_comm_service_all" on public.referral_commissions;
create policy "referral_comm_service_all" on public.referral_commissions
  for all using (auth.role() = 'service_role');

-- ─────────────────────────────────────────────────
-- PAYMENTS (Stripe + PayPal transaction log)
-- ─────────────────────────────────────────────────
create table if not exists public.payments (
  id               bigserial   primary key,
  stripe_event_id  text        unique,
  paypal_txn_id    text        unique,
  provider         text        not null,         -- 'stripe' | 'paypal'
  status           text        not null,         -- 'succeeded' | 'failed' | 'refunded' | 'pending'
  amount           numeric(10,2) not null,
  currency         text        not null default 'CAD',
  product_id       text,                         -- stripe price id or product name
  customer_email   text,
  customer_name    text,
  referral_code    text,
  metadata         jsonb,
  created_at       timestamptz not null default now()
);
create index if not exists payments_provider_idx    on public.payments(provider, status);
create index if not exists payments_email_idx       on public.payments(customer_email);
create index if not exists payments_created_idx     on public.payments(created_at desc);

alter table public.payments enable row level security;
drop policy if exists "payments_service_all" on public.payments;
create policy "payments_service_all" on public.payments
  for all using (auth.role() = 'service_role');

-- ─────────────────────────────────────────────────
-- DOCUMENTS (generated documents — CCLDR, PrimeDox)
-- ─────────────────────────────────────────────────
create table if not exists public.documents (
  id               bigserial   primary key,
  user_id          uuid        references auth.users(id) on delete set null,
  session_id       text,
  document_type    text        not null,         -- 'motion' | 'affidavit' | 'claim' | 'template'
  title            text        not null,
  content          text        not null,
  ai_provider      text,                         -- which AI generated it
  jurisdiction     text,
  status           text        not null default 'draft',  -- 'draft' | 'paid' | 'downloaded'
  payment_id       bigint      references public.payments(id),
  created_at       timestamptz not null default now()
);
create index if not exists documents_user_idx    on public.documents(user_id);
create index if not exists documents_session_idx on public.documents(session_id);

alter table public.documents enable row level security;
drop policy if exists "documents_owner_read" on public.documents;
create policy "documents_owner_read" on public.documents
  for select using (auth.uid() = user_id);
drop policy if exists "documents_service_all" on public.documents;
create policy "documents_service_all" on public.documents
  for all using (auth.role() = 'service_role');

-- ─────────────────────────────────────────────────
-- SESSIONS (authenticated user sessions — backend-issued JWTs)
-- ─────────────────────────────────────────────────
create table if not exists public.sessions (
  id            bigserial   primary key,
  user_id       uuid        references auth.users(id) on delete cascade,
  token_hash    text        not null unique,     -- sha256(jwt) — never store raw JWTs
  ip_address    text,
  user_agent    text,
  expires_at    timestamptz not null,
  revoked       boolean     not null default false,
  created_at    timestamptz not null default now()
);
create index if not exists sessions_user_idx    on public.sessions(user_id);
create index if not exists sessions_expires_idx on public.sessions(expires_at);

alter table public.sessions enable row level security;
drop policy if exists "sessions_service_all" on public.sessions;
create policy "sessions_service_all" on public.sessions
  for all using (auth.role() = 'service_role');

-- ─────────────────────────────────────────────────
-- USER PROFILES (already in supabase-setup.sql — safe to re-run)
-- ─────────────────────────────────────────────────
create table if not exists public.user_profiles (
  id            uuid        primary key references auth.users(id) on delete cascade,
  email         text        not null,
  full_name     text,
  role          text        not null default 'customer',   -- 'customer' | 'admin' | 'derek-superadmin'
  tier          text        not null default 'free',       -- 'free' | 'pro' | 'enterprise'
  referral_code text        unique,
  discount_tier text        not null default 'none',
  stripe_customer_id text   unique,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

alter table public.user_profiles enable row level security;
drop policy if exists "user_profiles_select_own" on public.user_profiles;
create policy "user_profiles_select_own" on public.user_profiles
  for select using (auth.uid() = id);
drop policy if exists "user_profiles_insert_own" on public.user_profiles;
create policy "user_profiles_insert_own" on public.user_profiles
  for insert with check (auth.uid() = id);
drop policy if exists "user_profiles_update_own" on public.user_profiles;
create policy "user_profiles_update_own" on public.user_profiles
  for update using (auth.uid() = id);
drop policy if exists "user_profiles_service_all" on public.user_profiles;
create policy "user_profiles_service_all" on public.user_profiles
  for all using (auth.role() = 'service_role');

-- ─────────────────────────────────────────────────
-- REFERRALS (already in supabase-setup.sql — safe to re-run)
-- ─────────────────────────────────────────────────
create table if not exists public.referrals (
  id               uuid        primary key default gen_random_uuid(),
  code             text        unique not null,
  referrer_email   text        not null,
  uses             integer     not null default 0,
  discount_percent integer     not null default 10,
  created_at       timestamptz not null default now()
);

alter table public.referrals enable row level security;
drop policy if exists "referrals_public_read" on public.referrals;
create policy "referrals_public_read" on public.referrals
  for select using (true);
drop policy if exists "referrals_service_all" on public.referrals;
create policy "referrals_service_all" on public.referrals
  for all using (auth.role() = 'service_role');

-- ─────────────────────────────────────────────────
-- AUTO-CREATE PROFILE ON SIGNUP (trigger)
-- ─────────────────────────────────────────────────
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  gen_code text;
  attempts  int := 0;
begin
  loop
    gen_code := 'FHI-REF-' || lpad(floor(random() * 9000 + 1000)::text, 4, '0');
    exit when not exists (select 1 from public.user_profiles where referral_code = gen_code);
    attempts := attempts + 1;
    exit when attempts > 20;
  end loop;

  insert into public.user_profiles (id, email, referral_code)
  values (new.id, new.email, gen_code)
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─────────────────────────────────────────────────
-- SEED: DEREK'S MASTER REFERRAL CODE
-- ─────────────────────────────────────────────────
insert into public.referrals (code, referrer_email, discount_percent)
values ('FHI-DEREK-2026', 'franciscoderek7@gmail.com', 20)
on conflict (code) do nothing;

-- ─────────────────────────────────────────────────
-- VERIFY (run these to confirm tables exist)
-- ─────────────────────────────────────────────────
-- select table_name from information_schema.tables where table_schema = 'public' order by table_name;
-- Expected: apex_events, documents, payments, referral_commissions, referrals, sessions, user_profiles

-- ─────────────────────────────────────────────────
-- DONE — 7 tables created with RLS policies
-- ─────────────────────────────────────────────────
