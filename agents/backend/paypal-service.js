/**
 * PayPal Orders API v2 — Customer Checkout
 * The CUSTOMER pays into Derek's PayPal Business account.
 * This is NOT paypal.me (P2P). This is merchant checkout.
 *
 * Flow:
 *   1. POST /api/payment/create-order  → returns approvalUrl
 *   2. Redirect customer to approvalUrl
 *   3. Customer approves on PayPal
 *   4. PayPal redirects to GET /api/payment/success?token=ORDER_ID
 *   5. Server captures order → payment complete
 *   6. POST /api/payment/webhook → unlock trial in Supabase
 */

const axios = require('axios');

const BASE = process.env.PAYPAL_MODE === 'live'
  ? 'https://api-m.paypal.com'
  : 'https://api-m.sandbox.paypal.com';

let tokenCache = null;

async function getAccessToken() {
  if (tokenCache && tokenCache.expiresAt > Date.now() + 60_000) return tokenCache.token;

  if (!process.env.PAYPAL_CLIENT_ID || !process.env.PAYPAL_CLIENT_SECRET) {
    throw new Error('PayPal not configured — set PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET');
  }

  const resp = await axios.post(
    `${BASE}/v1/oauth2/token`,
    'grant_type=client_credentials',
    {
      auth: { username: process.env.PAYPAL_CLIENT_ID, password: process.env.PAYPAL_CLIENT_SECRET },
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      timeout: 10_000,
    }
  );

  tokenCache = {
    token: resp.data.access_token,
    expiresAt: Date.now() + (resp.data.expires_in - 60) * 1_000,
  };
  return tokenCache.token;
}

async function createOrder({ amount = 49, currency = 'CAD', description = 'PrimeDox AI — Gap Scanner Pro Trial' }) {
  const token = await getAccessToken();
  const appUrl = process.env.APP_URL || 'https://franciscoholdingsinc.com';

  const resp = await axios.post(
    `${BASE}/v2/checkout/orders`,
    {
      intent: 'CAPTURE',
      purchase_units: [{
        description,
        amount: { currency_code: currency, value: Number(amount).toFixed(2) },
      }],
      application_context: {
        brand_name:           'PrimeDox AI by Francisco Holdings Inc.',
        return_url:           `${appUrl}/api/payment/success`,
        cancel_url:           `${appUrl}/api/payment/cancel`,
        shipping_preference:  'NO_SHIPPING',
        user_action:          'PAY_NOW',
        locale:               'en-CA',
      },
    },
    {
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      timeout: 15_000,
    }
  );

  const approvalUrl = resp.data.links.find(l => l.rel === 'approve')?.href;
  return { orderId: resp.data.id, approvalUrl, status: resp.data.status };
}

async function captureOrder(orderId) {
  const token = await getAccessToken();

  const resp = await axios.post(
    `${BASE}/v2/checkout/orders/${orderId}/capture`,
    {},
    {
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      timeout: 15_000,
    }
  );

  const unit    = resp.data.purchase_units?.[0];
  const capture = unit?.payments?.captures?.[0];

  return {
    orderId:    resp.data.id,
    status:     resp.data.status,
    captureId:  capture?.id,
    amount:     capture?.amount?.value,
    currency:   capture?.amount?.currency_code,
    payerEmail: resp.data.payer?.email_address,
    payerId:    resp.data.payer?.payer_id,
    payerName:  [resp.data.payer?.name?.given_name, resp.data.payer?.name?.surname].filter(Boolean).join(' ') || null,
  };
}

async function verifyWebhookSignature(headers, rawBody) {
  if (!process.env.PAYPAL_WEBHOOK_ID) return true;

  const token = await getAccessToken();
  const resp = await axios.post(
    `${BASE}/v1/notifications/verify-webhook-signature`,
    {
      auth_algo:         headers['paypal-auth-algo'],
      cert_url:          headers['paypal-cert-url'],
      transmission_id:   headers['paypal-transmission-id'],
      transmission_sig:  headers['paypal-transmission-sig'],
      transmission_time: headers['paypal-transmission-time'],
      webhook_id:        process.env.PAYPAL_WEBHOOK_ID,
      webhook_event:     typeof rawBody === 'string' ? JSON.parse(rawBody) : rawBody,
    },
    {
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      timeout: 10_000,
    }
  );
  return resp.data.verification_status === 'SUCCESS';
}

// ── Express route registration ────────────────────────────────────────────────

function registerPaymentRoutes(app) {
  const express = require('express');

  // POST /api/payment/create-order
  app.post('/api/payment/create-order', async (req, res) => {
    const { amount = 49, currency = 'CAD', description } = req.body || {};
    try {
      const order = await createOrder({ amount, currency, description });
      res.json({ success: true, ...order });
    } catch (err) {
      if (err.message.includes('not configured')) return res.status(503).json({ error: err.message });
      console.error('[paypal create-order]', err.message);
      res.status(500).json({ error: 'Order creation failed', message: err.message });
    }
  });

  // GET /api/payment/success?token=ORDER_ID
  app.get('/api/payment/success', async (req, res) => {
    const { token: orderId } = req.query;
    if (!orderId) return res.redirect('/?payment=cancelled');

    try {
      const capture = await captureOrder(orderId);

      if (capture.status === 'COMPLETED') {
        // Activate trial in Supabase if configured
        try {
          const { createClient } = require('@supabase/supabase-js');
          if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY) {
            const db = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
            await db.from('subscribers').upsert({
              email:          capture.payerEmail,
              plan:           'trial',
              paypal_order_id: capture.orderId,
              paypal_payer_id: capture.payerId,
              amount_cad:     parseFloat(capture.amount),
              currency:       capture.currency,
              paid_at:        new Date().toISOString(),
              trial_expires:  new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
              active:         true,
            }, { onConflict: 'email' });

            // Send welcome email
            try {
              const { sendTrialWelcome } = require('./email-service');
              await sendTrialWelcome(capture.payerEmail);
            } catch { /* email not configured */ }
          }
        } catch (dbErr) {
          console.error('[paypal success db]', dbErr.message);
        }

        res.redirect(`/?payment=success&amount=${capture.amount}&currency=${capture.currency}`);
      } else {
        res.redirect(`/?payment=failed&status=${capture.status}`);
      }
    } catch (err) {
      console.error('[paypal success]', err.message);
      res.redirect('/?payment=error');
    }
  });

  // GET /api/payment/cancel
  app.get('/api/payment/cancel', (req, res) => res.redirect('/?payment=cancelled'));

  // POST /api/payment/webhook — PayPal webhook (IPN v2)
  // Note: must be registered BEFORE express.json() middleware so we get raw body
  app.post('/api/payment/webhook',
    express.raw({ type: 'application/json' }),
    async (req, res) => {
      try {
        const isValid = await verifyWebhookSignature(req.headers, req.body);
        if (!isValid) return res.status(401).json({ error: 'Invalid webhook signature' });

        const event = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

        if (event.event_type === 'PAYMENT.CAPTURE.COMPLETED') {
          const email  = event.resource?.payer?.email_address;
          const amount = event.resource?.amount?.value;
          console.log(`[paypal webhook] CAPTURE.COMPLETED — $${amount} from ${email}`);
        }

        res.status(200).json({ received: true });
      } catch (err) {
        console.error('[paypal webhook]', err.message);
        res.status(500).json({ error: err.message });
      }
    }
  );
}

module.exports = { createOrder, captureOrder, verifyWebhookSignature, registerPaymentRoutes };
