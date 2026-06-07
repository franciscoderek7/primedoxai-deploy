import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createHubServerClient } from '@/lib/supabase'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' })

// Stripe sends webhooks to this endpoint after payment events.
// We handle fulfillment here, not on the client — so the user
// always gets access even if they close the browser early.
export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  if (!sig) {
    return NextResponse.json({ error: 'missing_signature' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    console.error('Stripe webhook signature verification failed:', err)
    return NextResponse.json({ error: 'invalid_signature' }, { status: 400 })
  }

  const hub = createHubServerClient()

  switch (event.type) {
    case 'payment_intent.succeeded': {
      const pi = event.data.object as Stripe.PaymentIntent
      await handlePaymentSucceeded(hub, pi)
      break
    }
    case 'payment_intent.payment_failed': {
      const pi = event.data.object as Stripe.PaymentIntent
      await handlePaymentFailed(hub, pi)
      break
    }
    case 'customer.subscription.updated': {
      const sub = event.data.object as Stripe.Subscription
      await handleSubscriptionUpdated(hub, sub)
      break
    }
    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription
      await handleSubscriptionDeleted(hub, sub)
      break
    }
    case 'invoice.payment_failed': {
      const inv = event.data.object as Stripe.Invoice
      await handleInvoiceFailed(hub, inv)
      break
    }
    default:
      // Ignore unhandled event types
      break
  }

  // Always return 200 to Stripe within 5 seconds
  return NextResponse.json({ received: true })
}

async function handlePaymentSucceeded(hub: ReturnType<typeof createHubServerClient>, pi: Stripe.PaymentIntent) {
  const hub_order_id = pi.metadata?.hub_order_id
  if (!hub_order_id) return

  await hub
    .from('hub_orders')
    .update({
      payment_status: 'paid',
      stripe_payment_intent_id: pi.id,
      updated_at: new Date().toISOString(),
    })
    .eq('id', hub_order_id)

  // Trigger fulfillment — calls the module's access-grant endpoint
  // This runs async via a Supabase Edge Function queue
  await hub.functions.invoke('trigger-fulfillment', {
    body: { hub_order_id, stripe_payment_intent_id: pi.id }
  })
}

async function handlePaymentFailed(hub: ReturnType<typeof createHubServerClient>, pi: Stripe.PaymentIntent) {
  const hub_order_id = pi.metadata?.hub_order_id
  if (!hub_order_id) return
  await hub
    .from('hub_orders')
    .update({ payment_status: 'failed', updated_at: new Date().toISOString() })
    .eq('id', hub_order_id)
}

async function handleSubscriptionUpdated(hub: ReturnType<typeof createHubServerClient>, sub: Stripe.Subscription) {
  // Sync subscription status back to the correct loop's DB via Edge Function
  await hub.functions.invoke('sync-subscription', {
    body: {
      stripe_subscription_id: sub.id,
      status: sub.status,
      current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
      cancel_at: sub.cancel_at ? new Date(sub.cancel_at * 1000).toISOString() : null,
    }
  })
}

async function handleSubscriptionDeleted(hub: ReturnType<typeof createHubServerClient>, sub: Stripe.Subscription) {
  await hub.functions.invoke('sync-subscription', {
    body: {
      stripe_subscription_id: sub.id,
      status: 'cancelled',
      current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
      cancel_at: null,
    }
  })
  // Revoke access after cancellation
  await hub.functions.invoke('revoke-access', {
    body: { stripe_subscription_id: sub.id }
  })
}

async function handleInvoiceFailed(hub: ReturnType<typeof createHubServerClient>, inv: Stripe.Invoice) {
  const subscription_id = inv.subscription as string | null
  if (!subscription_id) return
  await hub.functions.invoke('sync-subscription', {
    body: { stripe_subscription_id: subscription_id, status: 'past_due' }
  })
}
