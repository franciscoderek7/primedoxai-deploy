import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createHubServerClient } from '@/lib/supabase'
import { z } from 'zod'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' })

const CheckoutBody = z.object({
  session_id: z.string().uuid(),
  payment_method: z.enum(['stripe', 'crypto', 'invoice', 'interac']),
  shipping_address: z.object({
    name: z.string(),
    line1: z.string(),
    city: z.string(),
    province: z.string(),
    postal_code: z.string(),
    country: z.string().default('CA'),
  }).optional(),
})

export async function POST(req: NextRequest) {
  const body = CheckoutBody.safeParse(await req.json())
  if (!body.success) {
    return NextResponse.json({ error: 'invalid_request', field_errors: body.error.flatten() }, { status: 422 })
  }

  const { session_id, payment_method } = body.data
  const hub = createHubServerClient()

  // Fetch cart for this session
  const { data: cart, error: cartErr } = await hub
    .from('carts')
    .select('*, cart_items(*, hub_products(*))')
    .eq('session_id', session_id)
    .single()

  if (cartErr || !cart || cart.cart_items.length === 0) {
    return NextResponse.json({ error: 'cart_empty_or_not_found' }, { status: 404 })
  }

  // Create hub order
  const { data: order, error: orderErr } = await hub
    .from('hub_orders')
    .insert({
      session_id,
      total_cents: cart.loop_a_subtotal + cart.loop_b_subtotal - cart.discount_cents,
      currency: 'CAD',
      payment_method,
      payment_status: 'pending',
    })
    .select()
    .single()

  if (orderErr || !order) {
    return NextResponse.json({ error: 'internal_error', message: orderErr?.message }, { status: 500 })
  }

  if (payment_method === 'stripe') {
    // Split into Loop A and Loop B line items
    const loopAItems = cart.cart_items.filter((i: any) => i.hub_products.loop === 'A')
    const loopBItems = cart.cart_items.filter((i: any) => i.hub_products.loop === 'B')

    const responses: any = { checkout_id: order.id, payment_method: 'stripe' }

    if (loopAItems.length > 0) {
      const loopATotal = cart.loop_a_subtotal - Math.round(cart.discount_cents * (cart.loop_a_subtotal / (cart.loop_a_subtotal + cart.loop_b_subtotal)))
      const pi = await stripe.paymentIntents.create({
        amount: loopATotal,
        currency: 'cad',
        automatic_payment_methods: { enabled: true },
        metadata: { hub_order_id: order.id, loop: 'A' },
        // application_fee_amount: Math.round(loopATotal * 0.10), // 10% platform fee
        // transfer_data: { destination: process.env.STRIPE_LOOP_A_ACCOUNT_ID! },
      })
      responses.loop_a_client_secret = pi.client_secret
    }

    if (loopBItems.length > 0) {
      const loopBTotal = cart.loop_b_subtotal
      const pi = await stripe.paymentIntents.create({
        amount: loopBTotal,
        currency: 'cad',
        automatic_payment_methods: { enabled: true },
        metadata: { hub_order_id: order.id, loop: 'B' },
        // application_fee_amount: Math.round(loopBTotal * 0.10),
        // transfer_data: { destination: process.env.STRIPE_LOOP_B_ACCOUNT_ID! },
      })
      responses.loop_b_client_secret = pi.client_secret
    }

    return NextResponse.json(responses, { status: 201 })
  }

  if (payment_method === 'interac') {
    const invoiceNumber = `FHI-${new Date().getFullYear()}-${String(order.id).slice(0, 8).toUpperCase()}`
    await hub.from('hub_orders').update({ invoice_number: invoiceNumber }).eq('id', order.id)
    return NextResponse.json({
      checkout_id: order.id,
      payment_method: 'interac',
      invoice_number: invoiceNumber,
      send_to: 'franciscoderek7@gmail.com',
      amount: `$${((cart.loop_a_subtotal + cart.loop_b_subtotal - cart.discount_cents) / 100).toFixed(2)} CAD`,
      memo: `Francisco Holdings — ${invoiceNumber}`,
      due_date: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
    }, { status: 201 })
  }

  return NextResponse.json({ error: 'payment_method_not_implemented' }, { status: 501 })
}
