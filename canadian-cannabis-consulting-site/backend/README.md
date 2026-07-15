# Francisco Holdings Subscription Backend

FastAPI server handling PayPal / Stripe / Square webhooks and server-side unlock code generation for WeedLaw Pro and Canadian Cannabis Consulting subscriptions.

## Quick Deploy (Render — free tier)

1. Push this `backend/` folder to a GitHub repo (or a subfolder)
2. Go to render.com → New → Web Service → connect your repo
3. Build command: `pip install -r requirements.txt`
4. Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Add all environment variables from `.env.example` in the Render dashboard
6. Your webhook URL will be: `https://your-app.onrender.com/webhooks/paypal`

## Local Development

```bash
cp .env.example .env
# Fill in .env values
pip install -r requirements.txt
uvicorn main:app --reload
```

Server starts at http://localhost:8000

## Webhook Configuration

### PayPal
1. developer.paypal.com → My Apps & Credentials → your app → Webhooks
2. Add webhook URL: `https://your-domain.com/webhooks/paypal`
3. Subscribe to events:
   - `PAYMENT.SALE.COMPLETED`
   - `BILLING.SUBSCRIPTION.ACTIVATED`
   - `BILLING.SUBSCRIPTION.CANCELLED`
   - `BILLING.SUBSCRIPTION.EXPIRED`
4. Copy Webhook ID → set as `PAYPAL_WEBHOOK_ID` in .env

### Stripe
1. dashboard.stripe.com → Developers → Webhooks → Add endpoint
2. URL: `https://your-domain.com/webhooks/stripe`
3. Events: `checkout.session.completed`, `customer.subscription.deleted`
4. Copy signing secret → set as `STRIPE_WEBHOOK_SECRET` in .env

### Square
1. developer.squareup.com → your app → Webhooks → Add webhook
2. URL: `https://your-domain.com/webhooks/square`
3. Events: `payment.completed`, `subscription.updated`
4. Copy signature key → set as `SQUARE_WEBHOOK_SIGNATURE_KEY` in .env

## Test Transaction

```bash
# PayPal sandbox test
curl -X POST https://your-app.onrender.com/webhooks/paypal \
  -H "Content-Type: application/json" \
  -d '{"event_type":"PAYMENT.SALE.COMPLETED","resource":{"payer":{"payer_info":{"email":"test@example.com"}},"id":"TEST-SUB-001"}}'

# Verify code was generated
curl "https://your-app.onrender.com/verify?email=test@example.com&code=GENERATED_CODE&product=weedlaw"
```

## Money Flow
- Customer pays via PayPal.me/techpetcage/[amount] → money goes TO Derek's PayPal account
- PayPal fires webhook → this server generates unlock code → emails customer
- Customer enters code on website → localStorage unlock
- Customer cancels → PayPal fires cancellation webhook → code deactivated

## Security Notes
- Never hardcode secrets — all config via .env / environment variables
- UNLOCK_SECRET_KEY rotates codes monthly (same email+product = different code each month)
- PayPal webhook signature verification enabled in live mode
- Stripe uses official SDK signature verification
- Square uses HMAC-SHA256 signature verification
