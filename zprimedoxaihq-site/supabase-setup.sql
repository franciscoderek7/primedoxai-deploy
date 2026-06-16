-- ============================================================
-- PrimeDox HQ — Supabase Database Setup
-- Run this ONCE in Supabase SQL Editor:
--   dashboard.supabase.com → project → SQL Editor → New query
-- ============================================================

-- ── TABLES ───────────────────────────────────────────────────

-- USER PROFILES (extends auth.users — auto-created on signup)
create table if not exists public.user_profiles (
  id           uuid        primary key references auth.users(id) on delete cascade,
  email        text        not null,
  referral_code text       unique,
  discount_tier text       not null default 'none',
  created_at   timestamptz not null default now()
);

-- REFERRALS (codes Derek or users hand out)
create table if not exists public.referrals (
  id               uuid        primary key default gen_random_uuid(),
  code             text        unique not null,
  referrer_email   text        not null,
  uses             integer     not null default 0,
  discount_percent integer     not null default 10,
  created_at       timestamptz not null default now()
);

-- TRIAL SIGNUPS
create table if not exists public.trial_signups (
  id             uuid        primary key default gen_random_uuid(),
  email          text        unique not null,
  referral_code  text,
  signup_date    timestamptz not null default now(),
  trial_end_date timestamptz,
  converted      boolean     not null default false
);

-- ── ROW LEVEL SECURITY ────────────────────────────────────────

alter table public.user_profiles enable row level security;
alter table public.referrals     enable row level security;
alter table public.trial_signups enable row level security;

-- user_profiles: users see + update only their own row
drop policy if exists "user_profiles_select_own" on public.user_profiles;
create policy "user_profiles_select_own" on public.user_profiles
  for select using (auth.uid() = id);

drop policy if exists "user_profiles_insert_own" on public.user_profiles;
create policy "user_profiles_insert_own" on public.user_profiles
  for insert with check (auth.uid() = id);

drop policy if exists "user_profiles_update_own" on public.user_profiles;
create policy "user_profiles_update_own" on public.user_profiles
  for update using (auth.uid() = id);

-- referrals: anyone can read (to verify a code)
drop policy if exists "referrals_public_read" on public.referrals;
create policy "referrals_public_read" on public.referrals
  for select using (true);

-- trial_signups: anyone can insert; nobody reads (server-side only)
drop policy if exists "trial_signups_public_insert" on public.trial_signups;
create policy "trial_signups_public_insert" on public.trial_signups
  for insert with check (true);

-- ── AUTO-CREATE PROFILE ON SIGNUP ────────────────────────────

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
  -- Generate unique FHI-REF-XXXX code
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

-- ── SEED: DEREK'S MASTER REFERRAL CODE ───────────────────────
-- Gives 20% off to anyone who signs up with this code

insert into public.referrals (code, referrer_email, discount_percent)
values ('FHI-DEREK-2026', 'franciscoderek7@gmail.com', 20)
on conflict (code) do nothing;

-- ── DONE ─────────────────────────────────────────────────────
-- Verify with:
--   select * from public.user_profiles;
--   select * from public.referrals;
--   select * from public.trial_signups;
