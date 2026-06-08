// CCLDR.NET — Stripe Webhook → Supabase Edge Function
// Deploy: supabase functions deploy stripe-webhook --no-verify-jwt
// (Stripe calls this endpoint directly — it is not an authenticated user request,
//  so it must be signature-verified instead of JWT-verified.)
//
// Required function secrets (set with `supabase secrets set`):
//   STRIPE_SECRET_KEY            — Stripe secret key (sk_live_... / sk_test_...)
//   STRIPE_WEBHOOK_SECRET        — from Stripe Dashboard → Webhooks → Signing secret (whsec_...)
//   SUPABASE_URL                 — auto-provided by Supabase
//   SUPABASE_SERVICE_ROLE_KEY    — service role key (bypasses RLS — server-side ONLY,
//                                  never expose this in any browser-facing file)

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  apiVersion: "2023-10-16",
  httpClient: Stripe.createFetchHttpClient(),
});
const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET")!;

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

// ── Map Stripe Price IDs → CCLDR membership tiers ──────────────────────────
// Replace these placeholders with real Price IDs from Stripe Dashboard →
// Products. Each tier has a monthly and an annual price (8 total).
const TIER_BY_PRICE: Record<string, string> = {
  PRICE_ID_WARRIOR_MONTHLY: "warrior",
  PRICE_ID_WARRIOR_ANNUAL: "warrior",
  PRICE_ID_PROFESSIONAL_MONTHLY: "professional",
  PRICE_ID_PROFESSIONAL_ANNUAL: "professional",
  PRICE_ID_ELITE_MONTHLY: "elite",
  PRICE_ID_ELITE_ANNUAL: "elite",
  PRICE_ID_SOVEREIGN_MONTHLY: "sovereign",
  PRICE_ID_SOVEREIGN_ANNUAL: "sovereign",
};

function statusFromStripe(stripeStatus: string, cancelAtPeriodEnd: boolean): string {
  if (stripeStatus === "active" || stripeStatus === "trialing") {
    return cancelAtPeriodEnd ? "active" : "active"; // still active until period end
  }
  if (stripeStatus === "past_due" || stripeStatus === "unpaid") return "past_due";
  if (stripeStatus === "canceled" || stripeStatus === "incomplete_expired") return "cancelled";
  return "inactive";
}

serve(async (req) => {
  const signature = req.headers.get("stripe-signature");
  if (!signature) return new Response("Missing stripe-signature header", { status: 400 });

  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(rawBody, signature, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return new Response("Signature verification failed", { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const email = session.customer_details?.email ?? session.customer_email;
        if (!email) {
          console.error("checkout.session.completed had no email — skipping");
          break;
        }

        const subscriptionId = session.subscription as string | null;
        let tier = "free";
        let status = "active";
        let periodEnd: string | null = null;
        let subId: string | null = null;

        if (subscriptionId) {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          const priceId = subscription.items.data[0]?.price?.id ?? "";
          tier = TIER_BY_PRICE[priceId] ?? "free";
          status = statusFromStripe(subscription.status, subscription.cancel_at_period_end);
          periodEnd = new Date(subscription.current_period_end * 1000).toISOString();
          subId = subscription.id;
        }

        const { error } = await supabase.from("members").upsert(
          {
            email,
            tier,
            stripe_customer_id: (session.customer as string) ?? null,
            stripe_subscription_id: subId,
            status,
            current_period_end: periodEnd,
          },
          { onConflict: "email" }
        );
        if (error) console.error("Supabase upsert error:", error.message);
        break;
      }

      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const priceId = subscription.items.data[0]?.price?.id ?? "";
        const tier = TIER_BY_PRICE[priceId];
        const status = statusFromStripe(subscription.status, subscription.cancel_at_period_end);
        const periodEnd = new Date(subscription.current_period_end * 1000).toISOString();

        const update: Record<string, unknown> = { status, current_period_end: periodEnd };
        if (tier) update.tier = tier;

        const { error } = await supabase
          .from("members")
          .update(update)
          .eq("stripe_subscription_id", subscription.id);
        if (error) console.error("Supabase update error:", error.message);
        break;
      }

      default:
        // Ignore all other event types — no-op, return 200 so Stripe stops retrying.
        break;
    }
  } catch (err) {
    console.error("Webhook handler error:", err.message);
    return new Response("Internal handler error", { status: 500 });
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
