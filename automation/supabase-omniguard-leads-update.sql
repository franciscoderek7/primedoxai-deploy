-- automation/supabase-omniguard-leads-update.sql
-- Run in Supabase SQL Editor (dashboard -> SQL Editor -> New query -> paste -> Run).
--
-- Adds the one column the OmniGuard lead-capture form needs that the existing
-- `leads` table (see automation/supabase-tables.sql) doesn't have yet: a free-text
-- message field for "describe your security concern." Everything else the form
-- submits (email, name, company) already has a matching column. Idempotent —
-- safe to run even if this has already been applied.
--
-- Do NOT run automation/supabase-tables.sql again if `leads` already exists from
-- an earlier run — this file only adds to it.

ALTER TABLE leads ADD COLUMN IF NOT EXISTS message text;

-- Existing RLS policies on `leads` (public insert, authenticated select) already
-- cover this column — no policy changes needed.
