# PrimeDox AI — MVP

Usage-gated AI request product: Next.js 14 (App Router, TypeScript) + Supabase (auth + Postgres) + Stripe (subscriptions) + OpenAI (gpt-4o).

## Setup

1. `cp .env.local.example .env.local` and fill in real values.
2. In the Supabase SQL Editor, run `sql/schema.sql` (creates tables, RPC functions, and the auth-signup trigger). RLS is disabled on every table by design — the service role key is the only thing that talks to these tables.
3. In Stripe, create three subscription Prices (Starter / Growth / Empire) and put their IDs in `STRIPE_PRICE_STARTER` / `STRIPE_PRICE_GROWTH` / `STRIPE_PRICE_EMPIRE`.
4. Point a Stripe webhook at `https://<your-domain>/api/stripe/webhook` listening for: `checkout.session.completed`, `invoice.payment_succeeded`, `invoice.payment_failed`, `customer.subscription.updated`, `customer.subscription.deleted`. Copy the signing secret into `STRIPE_WEBHOOK_SECRET`.
5. `npm install`
6. `npm run dev`

## Auth flow

Magic-link only (no passwords). `/login` posts an email to `/api/auth/magic-link` (server-side, uses the anon key — never the browser SDK). Supabase emails a link to `/api/auth/callback?code=...`, which exchanges the code for a session cookie and redirects to `/dashboard`. `middleware.ts` refreshes that session cookie on every request.

## Usage gating

`consume_request(user_uuid)` (Postgres function, `FOR UPDATE` row lock) is the single chokepoint for whether a request is allowed. Tier limits are defined inside that function: free=10, starter=100, growth=500, empire=unlimited, plus any `bonus_requests` earned via referrals. `/api/ai` calls it before ever calling OpenAI.

## Referrals

`/dashboard` shows each user a `?ref=<user_id>` link. Visiting `/` with that param sets a 30-day `pdx_ref` cookie (`components/ReferralCapture.tsx`). When that visitor later signs up and lands on `/api/auth/callback`, a `referrals` row (`status: 'pending'`) is created linking them to the referrer (self-referral and duplicate-row attempts are both blocked). When the referred user completes a paid checkout, the Stripe webhook's `checkout.session.completed` handler marks the referral `converted` and calls `grant_referral_reward`, which credits the referrer 50 bonus requests for the current billing cycle.

## Deploying to Vercel

Set every variable from `.env.local.example` as a Vercel project environment variable (including `NEXT_PUBLIC_URL` set to the real deployed URL, not localhost). No code changes needed.
