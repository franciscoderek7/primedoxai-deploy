-- CleanSwarm Job Marketplace — Draft Schema
-- DRAFT ONLY. Not executed/applied. Run manually in the Supabase SQL editor
-- (project: https://ilmlnehehfcxwlurzfxd.supabase.co) after Derek/Manus review.
-- No live keys or credentials are embedded in this file.

-- ─── jobs ───────────────────────────────────────────────────────────────────
create table if not exists jobs (
  id          uuid primary key default gen_random_uuid(),
  client_name text not null,
  location    text not null,
  job_type    text not null,                 -- e.g. 'residential', 'commercial', 'industrial', 'specialty'
  status      text not null default 'open',  -- 'open', 'assigned', 'in_progress', 'completed', 'cancelled'
  budget      numeric(10,2),
  created_at  timestamptz not null default now()
);

-- ─── workers ────────────────────────────────────────────────────────────────
create table if not exists workers (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  email       text not null unique,
  skills      text[],                        -- e.g. ARRAY['residential','commercial','yacht']
  rating      numeric(3,2) default 0.0,       -- 0.00 - 5.00
  created_at  timestamptz not null default now()
);

-- ─── job_applications ───────────────────────────────────────────────────────
create table if not exists job_applications (
  id          uuid primary key default gen_random_uuid(),
  job_id      uuid not null references jobs(id) on delete cascade,
  worker_id   uuid not null references workers(id) on delete cascade,
  status      text not null default 'pending', -- 'pending', 'accepted', 'rejected', 'withdrawn'
  created_at  timestamptz not null default now(),
  unique (job_id, worker_id)
);

-- ─── helpful indexes ────────────────────────────────────────────────────────
create index if not exists idx_jobs_status on jobs(status);
create index if not exists idx_job_applications_job_id on job_applications(job_id);
create index if not exists idx_job_applications_worker_id on job_applications(worker_id);
