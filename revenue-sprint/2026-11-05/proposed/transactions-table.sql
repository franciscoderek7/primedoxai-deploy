-- PROPOSED — append-only payment transaction history. NOT APPLIED.
-- Replaces reliance on `subscribers`, which upserts onConflict:'email' and
-- therefore cannot express "the same customer paid twice".
create table if not exists payment_transactions (
  id              bigserial primary key,
  -- PayPal identifiers. capture_id is the money-moving event: UNIQUE on it is
  -- the database-level idempotency guarantee, independent of the app's store.
  capture_id      text        not null unique,
  order_id        text        not null,
  event_id        text        not null unique,
  -- Amounts are NUMERIC, never float. 'amount_minor' is the integer source of
  -- truth; 'amount' is derived for readability.
  amount_minor    bigint      not null check (amount_minor > 0),
  currency        char(3)     not null check (currency ~ '^[A-Z]{3}$'),
  amount          numeric(12,2) generated always as (amount_minor::numeric / 100) stored,
  capture_status  text        not null check (capture_status = 'COMPLETED'),
  paypal_mode     text        not null check (paypal_mode in ('sandbox','live')),
  -- Provenance: which path recorded this row.
  source          text        not null check (source in ('webhook','capture_redirect','manual')),
  occurred_at     timestamptz not null,
  recorded_at     timestamptz not null default now(),
  raw_event       jsonb       not null
);
-- APPEND-ONLY, enforced by the database, not by convention.
revoke update, delete on payment_transactions from public;
create rule no_update as on update to payment_transactions do instead nothing;
create rule no_delete as on delete to payment_transactions do instead nothing;
-- Corrections are new rows in a separate adjustments table, never edits.
create table if not exists payment_adjustments (
  id             bigserial primary key,
  transaction_id bigint      not null references payment_transactions(id),
  kind           text        not null check (kind in ('REFUND','REVERSAL','CHARGEBACK','CORRECTION')),
  amount_minor   bigint      not null,
  currency       char(3)     not null,
  reason         text        not null,
  authorized_by  text        not null,   -- authenticated principal, never client-supplied
  occurred_at    timestamptz not null,
  recorded_at    timestamptz not null default now(),
  raw_event      jsonb
);
create index if not exists idx_txn_occurred on payment_transactions (occurred_at desc);
create index if not exists idx_txn_currency on payment_transactions (currency);
-- Revenue totals come from a view over the ledger plus adjustments. Aggregates
-- only: no email, no payer id, nothing row-level crosses to a browser.
create or replace view revenue_summary as
select t.currency,
       count(*)                                        as paid_count,
       sum(t.amount_minor)                             as gross_minor,
       coalesce(sum(a.amount_minor), 0)                as adjustments_minor,
       sum(t.amount_minor) - coalesce(sum(a.amount_minor), 0) as net_minor,
       min(t.occurred_at)                              as first_payment_at,
       max(t.occurred_at)                              as last_payment_at
from payment_transactions t
left join payment_adjustments a on a.transaction_id = t.id
where t.paypal_mode = 'live'          -- sandbox never counts as revenue
group by t.currency;
