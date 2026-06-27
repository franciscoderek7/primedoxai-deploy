import { NextResponse, type NextRequest } from "next/server";
import type Stripe from "stripe";
import { stripe, tierFromPriceId } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

// Idempotency note: each user row stores only the *last* processed Stripe event id
// (per the spec's users.stripe_event_id column). That's enough to stop the same event
// being double-applied to the same user on a retry, which is the realistic Stripe-retry
// case. It is not a global event log — two different events landing for two different
// users are tracked independently, which is fine since they touch different rows.

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    return NextResponse.json({ error: `Invalid signature: ${(err as Error).message}` }, { status: 400 });
  }

  const admin = supabaseAdmin();

  async function alreadyProcessed(userId: string) {
    const { data } = await admin.from("users").select("stripe_event_id").eq("id", userId).single();
    return data?.stripe_event_id === event.id;
  }

  async function findUserByCustomerId(customerId: string) {
    const { data } = await admin.from("users").select("id").eq("stripe_customer_id", customerId).single();
    return data;
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.user_id;
      const tier = session.metadata?.tier;
      if (!userId || !tier) break;
      if (await alreadyProcessed(userId)) break;

      await admin
        .from("users")
        .update({
          stripe_customer_id: session.customer as string,
          tier,
          subscription_status: "active",
          stripe_event_id: event.id,
        })
        .eq("id", userId);

      // Referral conversion: if this user was referred and the referral is still pending,
      // mark it converted and reward the referrer.
      const { data: referral } = await admin
        .from("referrals")
        .select("id, referrer_id")
        .eq("referred_id", userId)
        .eq("status", "pending")
        .maybeSingle();

      if (referral) {
        await admin
          .from("referrals")
          .update({ status: "converted", reward_granted: true, converted_at: new Date().toISOString() })
          .eq("id", referral.id);
        await admin.rpc("grant_referral_reward", { referrer_uuid: referral.referrer_id });
      }
      break;
    }

    case "invoice.payment_succeeded": {
      const invoice = event.data.object as Stripe.Invoice;
      const customerId = invoice.customer as string;
      const user = await findUserByCustomerId(customerId);
      if (!user) break;
      if (await alreadyProcessed(user.id)) break;

      await admin
        .from("users")
        .update({
          subscription_status: "active",
          ai_requests_this_month: 0,
          stripe_event_id: event.id,
        })
        .eq("id", user.id);
      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      const customerId = invoice.customer as string;
      const user = await findUserByCustomerId(customerId);
      if (!user) break;
      if (await alreadyProcessed(user.id)) break;

      await admin
        .from("users")
        .update({ subscription_status: "past_due", stripe_event_id: event.id })
        .eq("id", user.id);
      break;
    }

    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;
      const user = await findUserByCustomerId(customerId);
      if (!user) break;
      if (await alreadyProcessed(user.id)) break;

      const priceId = subscription.items.data[0]?.price.id;
      const tier = tierFromPriceId(priceId);
      const statusMap: Record<string, string> = {
        active: "active",
        past_due: "past_due",
        canceled: "cancelled",
        unpaid: "past_due",
        trialing: "active",
      };

      await admin
        .from("users")
        .update({
          ...(tier ? { tier } : {}),
          subscription_status: statusMap[subscription.status] ?? "inactive",
          stripe_event_id: event.id,
        })
        .eq("id", user.id);
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;
      const user = await findUserByCustomerId(customerId);
      if (!user) break;
      if (await alreadyProcessed(user.id)) break;

      await admin
        .from("users")
        .update({ subscription_status: "cancelled", tier: "free", stripe_event_id: event.id })
        .eq("id", user.id);
      break;
    }

    default:
      break;
  }

  return NextResponse.json({ received: true });
}
