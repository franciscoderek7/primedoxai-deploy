# CCLDR.NET — REAL MEMBERSHIP SYSTEM DESIGN
# Replacing fake localStorage auth with Stripe + Supabase
# Derek Francisco | June 6, 2026

---

## THE PROBLEM (current state)

`ccldr-site/lobby.html` (and other gated rooms) currently do this:

```javascript
const saved = localStorage.getItem('ccldr_tier') || 'free';
document.getElementById('tier-name').textContent = tiers[saved] || 'Free / Lobby';
```

Anyone can open devtools and run `localStorage.setItem('ccldr_tier','sovereign')` to unlock every
room for free. There is no server-side check, no real login, no payment verification. This MUST be
replaced before CCLDR takes real money.

---

## TARGET ARCHITECTURE

```
Visitor → Pricing Page → Stripe Checkout (hosted) → Stripe Webhook
                                                          ↓
                                          Supabase Edge Function (verifies signature,
                                          writes tier + email to `members` table)
                                                          ↓
Visitor → Magic Link Login (Supabase Auth) → Session token in browser
                                                          ↓
Gated Room Page → calls Supabase `get_my_tier()` → server returns real tier
                  → page shows/hides content based on verified tier
```

No passwords. No localStorage trust. GitHub Pages stays 100% static — Supabase is the only backend,
on the free tier.

---

## 1. STRIPE SIDE (client-side Checkout, 4 tiers × 2 billing periods = 8 Price IDs)

Create 8 Prices in Stripe Dashboard → Products (test mode first, then live):

| Tier | Monthly Price ID (placeholder) | Annual Price ID (placeholder) |
|------|-------------------------------|-------------------------------|
| Warrior | `price_warrior_monthly_149` | `price_warrior_annual_1490` |
| Professional | `price_pro_monthly_499` | `price_pro_annual_4990` |
| Elite | `price_elite_monthly_999` | `price_elite_annual_9990` |
| Sovereign | `price_sovereign_monthly_1499` | `price_sovereign_annual_14990` |

`pricing.html` buttons call Stripe.js Checkout directly (no server needed for the redirect):

```html
<script src="https://js.stripe.com/v3/"></script>
<script>
const stripe = Stripe('pk_live_REPLACE_WITH_PUBLISHABLE_KEY');

async function startCheckout(priceId, tier) {
  const { error } = await stripe.redirectToCheckout({
    lineItems: [{ price: priceId, quantity: 1 }],
    mode: 'subscription',
    successUrl: `https://ccldr.net/welcome.html?tier=${tier}&session_id={CHECKOUT_SESSION_ID}`,
    cancelUrl: 'https://ccldr.net/pricing.html?cancelled=1',
    customerEmail: undefined // let Stripe collect it — required for magic-link match later
  });
  if (error) console.error(error);
}
</script>
<button onclick="startCheckout('price_warrior_monthly_149','warrior')">Join Warrior — $149/mo</button>
```

**Critical:** Stripe Checkout must collect the customer's email (it does, by default, when you don't
pre-fill `customerEmail`). That email is the join key between Stripe and Supabase Auth.

---

## 2. SUPABASE SIDE (free tier — Postgres + Auth + 1 Edge Function)

### 2a. Database schema

```sql
create table members (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  tier text not null default 'free' check (tier in ('free','warrior','professional','elite','sovereign')),
  stripe_customer_id text,
  stripe_subscription_id text,
  status text not null default 'inactive' check (status in ('active','past_due','cancelled','inactive')),
  current_period_end timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Row Level Security: members can only ever read their OWN row
alter table members enable row level security;

create policy "members read own row"
  on members for select
  using (auth.jwt() ->> 'email' = email);

-- Helper function the client calls to get a verified tier (runs server-side, trusted)
create or replace function get_my_tier()
returns table(tier text, status text, current_period_end timestamptz)
language sql security definer
as $$
  select tier, status, current_period_end
  from members
  where email = auth.jwt() ->> 'email'
    and status = 'active'
  limit 1;
$$;
```

`security definer` means the function runs with elevated rights but only ever returns the row
matching the **verified JWT email** from Supabase Auth — the visitor cannot spoof this client-side.

### 2b. Edge Function — Stripe webhook handler (`stripe-webhook`)

Deploy with `supabase functions deploy stripe-webhook --no-verify-jwt` (Stripe calls this directly,
not an authenticated user).

```typescript
// supabase/functions/stripe-webhook/index.ts
import { serve } from "https://deno.land/std/http/server.ts";
import Stripe from "https://esm.sh/stripe@14?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, { apiVersion: "2023-10-16" });
const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET")!;
const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!  // bypasses RLS — server-only, never exposed to browser
);

const TIER_BY_PRICE: Record<string, string> = {
  price_warrior_monthly_149: "warrior", price_warrior_annual_1490: "warrior",
  price_pro_monthly_499: "professional", price_pro_annual_4990: "professional",
  price_elite_monthly_999: "elite", price_elite_annual_9990: "elite",
  price_sovereign_monthly_1499: "sovereign", price_sovereign_annual_14990: "sovereign",
};

serve(async (req) => {
  const sig = req.headers.get("stripe-signature")!;
  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(body, sig, webhookSecret);
  } catch (err) {
    return new Response(`Webhook signature verification failed`, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const email = session.customer_details?.email;
      const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
      const priceId = subscription.items.data[0].price.id;
      const tier = TIER_BY_PRICE[priceId] ?? "free";

      await supabase.from("members").upsert({
        email,
        tier,
        stripe_customer_id: session.customer as string,
        stripe_subscription_id: subscription.id,
        status: "active",
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        updated_at: new Date().toISOString(),
      }, { onConflict: "email" });
      break;
    }
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      const status = sub.status === "active" ? "active"
                    : sub.status === "past_due" ? "past_due"
                    : sub.cancel_at_period_end || sub.status === "canceled" ? "cancelled"
                    : "inactive";
      await supabase.from("members")
        .update({ status, current_period_end: new Date(sub.current_period_end * 1000).toISOString(), updated_at: new Date().toISOString() })
        .eq("stripe_subscription_id", sub.id);
      break;
    }
  }

  return new Response(JSON.stringify({ received: true }), { status: 200 });
});
```

Set in Stripe Dashboard → Webhooks: endpoint URL =
`https://<project-ref>.supabase.co/functions/v1/stripe-webhook`, listen for
`checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`.

### 2c. Magic-link login (Supabase Auth, zero passwords)

```html
<!-- login.html -->
<script type="module">
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
const supabase = createClient('https://<project-ref>.supabase.co', '<anon-public-key>');

document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value.trim();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: 'https://ccldr.net/lobby.html' }
  });
  document.getElementById('status').textContent = error
    ? `Error: ${error.message}`
    : `Check ${email} for your sign-in link.`;
});
</script>
```

The visitor clicks the emailed link → Supabase redirects back to `lobby.html` with a session in
the URL hash → `supabase-js` automatically picks it up and persists the session in
`localStorage` **as an encrypted, signed JWT** (this is fine — it's a verified token, not a
client-set flag).

### 2d. Real tier check on gated pages (replaces the fake localStorage line)

```javascript
// shared/membership.js — include on every gated room page
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
const supabase = createClient('https://<project-ref>.supabase.co', '<anon-public-key>');

export async function getVerifiedTier() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return { tier: 'free', loggedIn: false };

  const { data, error } = await supabase.rpc('get_my_tier');
  if (error || !data?.length) return { tier: 'free', loggedIn: true };
  return { tier: data[0].tier, status: data[0].status, loggedIn: true };
}

// Usage in lobby.html:
// const { tier, loggedIn } = await getVerifiedTier();
// document.getElementById('tier-name').textContent = TIER_LABELS[tier];
// document.querySelectorAll('[data-requires-tier]').forEach(el => {
//   el.style.display = tierMeetsRequirement(tier, el.dataset.requiresTier) ? '' : 'none';
// });
```

The gate now lives in a Postgres function gated by Row Level Security + a verified JWT — not in a
browser-editable key/value store.

---

## 3. ROLLOUT PLAN

1. **Supabase project** — create free-tier project (already have an account per `SUPABASE-REPLY-TEMPLATE.md`; confirm it's downgraded to Free or create a fresh one for CCLDR specifically — keep CCLDR's data isolated from other empire products).
2. **Run the schema SQL** above in the Supabase SQL editor.
3. **Deploy the Edge Function** (`stripe-webhook`) with `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `SUPABASE_SERVICE_ROLE_KEY` as function secrets (never in client code).
4. **Create the 8 Stripe Prices** (test mode), wire the webhook endpoint, test end-to-end with Stripe's test cards.
5. **Add `login.html`** (magic link) and `shared/membership.js` to `ccldr-site/`.
6. **Replace every `localStorage.getItem('ccldr_tier')`** in `lobby.html`, `boardroom.html`, `dao.html`, `judges-chambers.html`, `clerks-office.html`, `records-room.html`, `classroom.html` with `getVerifiedTier()`.
7. **Test the full loop**: pay → webhook fires → row appears in `members` → magic link login → gated room unlocks for real.
8. **Switch Stripe to live mode**, swap publishable/secret keys and Price IDs, go live.

## 4. WHAT THIS COSTS

- Supabase: $0/mo (free tier — 500MB DB, 50k monthly active users, 500k Edge Function invocations)
- Stripe: 2.9% + $0.30 CAD per transaction, no monthly fee
- GitHub Pages: $0/mo

No new infrastructure spend. Fully within the GitHub Pages → Supabase stack already specified.

---

**STATUS: Design complete, ready to build on PrimeDox order.**
**Next order needed to proceed: "Build the CCLDR membership system" → I will create the Supabase
project SQL, the Edge Function file, `login.html`, `shared/membership.js`, and patch all gated
room pages in this repo, then report back for your Supabase/Stripe key entry.**
