-- CCLDR.NET — Real Membership System — Supabase SQL Schema
-- Run this once in Supabase SQL editor (Dashboard → SQL Editor → New query)
-- Replaces the fake `localStorage.getItem('ccldr_tier')` client-side flag.

create extension if not exists pgcrypto;

create table if not exists members (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  tier text not null default 'free'
    check (tier in ('free','warrior','professional','elite','sovereign')),
  stripe_customer_id text,
  stripe_subscription_id text,
  status text not null default 'inactive'
    check (status in ('active','past_due','cancelled','inactive')),
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists members_email_idx on members (email);
create index if not exists members_stripe_sub_idx on members (stripe_subscription_id);

-- Row Level Security: a logged-in visitor can read ONLY their own row,
-- matched against the verified email in their Supabase Auth JWT.
alter table members enable row level security;

drop policy if exists "members read own row" on members;
create policy "members read own row"
  on members for select
  using (auth.jwt() ->> 'email' = email);

-- No insert/update/delete policies for normal users — only the Edge Function
-- (using the service_role key, which bypasses RLS) may write to this table.

-- Server-verified tier lookup. SECURITY DEFINER lets it read any row,
-- but the WHERE clause locks it to the caller's own verified JWT email —
-- the visitor cannot pass in someone else's email and get their tier.
create or replace function get_my_tier()
returns table(tier text, status text, current_period_end timestamptz)
language sql security definer
set search_path = public
as $$
  select tier, status, current_period_end
  from members
  where email = auth.jwt() ->> 'email'
    and status = 'active'
  limit 1;
$$;

grant execute on function get_my_tier() to authenticated;

-- Auto-update `updated_at` on every row write.
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists members_set_updated_at on members;
create trigger members_set_updated_at
  before update on members
  for each row execute function set_updated_at();

-- ── Course progress (replaces the localStorage `ccldr_progress_modN` keys
--    used in classroom.html — optional, but keeps progress tied to the
--    verified account instead of the browser). ──
create table if not exists course_progress (
  email text not null,
  module_id int not null,
  percent numeric not null default 0 check (percent between 0 and 100),
  updated_at timestamptz not null default now(),
  primary key (email, module_id)
);

alter table course_progress enable row level security;

drop policy if exists "progress read own" on course_progress;
create policy "progress read own"
  on course_progress for select
  using (auth.jwt() ->> 'email' = email);

drop policy if exists "progress upsert own" on course_progress;
create policy "progress upsert own"
  on course_progress for insert
  with check (auth.jwt() ->> 'email' = email);

drop policy if exists "progress update own" on course_progress;
create policy "progress update own"
  on course_progress for update
  using (auth.jwt() ->> 'email' = email)
  with check (auth.jwt() ->> 'email' = email);
