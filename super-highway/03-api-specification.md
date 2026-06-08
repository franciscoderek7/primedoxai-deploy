# Super Highway — API Specification
**Phase 1 Deliverable 3 of 7 — June 6, 2026**

Base URL: `https://hub.franciscoholdings.com/api/v1`

All requests require `Content-Type: application/json`.
All responses return `Content-Type: application/json`.
All timestamps are ISO 8601 UTC.
All monetary values are integers in the smallest currency unit (CAD cents).

---

## Authentication

### Session creation (anonymous — no login required to browse)
```
POST /sessions

Response 201:
{
  "session_id": "uuid",
  "expires_at": "2026-06-13T00:00:00Z",
  "loop_a_enrolled": false,
  "loop_b_enrolled": false
}
```

### SSO — Loop A login / signup
```
POST /auth/loop-a

Body:
{
  "email": "user@example.com",
  "magic_link": true       // sends magic link email; OR
  // "password": "..."     // for password flow (future)
}

Response 200:
{
  "status": "magic_link_sent"
}
```

### SSO — Loop B login / signup
```
POST /auth/loop-b

Body:
{
  "email": "user@example.com",
  "magic_link": true
}

Response 200:
{
  "status": "magic_link_sent"
}
```

### Token exchange (called by magic-link redirect handler)
```
POST /auth/token

Body:
{
  "session_id": "uuid",
  "magic_token": "one-time-token-from-email",
  "loop": "A"  // or "B"
}

Response 200:
{
  "hub_access_token": "JWT",    // 15 min TTL — used for hub API calls
  "loop_token": "JWT",           // 15 min TTL — forwarded to loop's Supabase
  "refresh_token": "opaque",     // 7 day TTL, stored in httpOnly cookie
  "loop_a_enrolled": true,
  "loop_b_enrolled": false
}
```

### Token refresh
```
POST /auth/refresh
Cookie: refresh_token=<opaque>

Response 200:
{
  "hub_access_token": "JWT",
  "loop_token": "JWT"
}
```

### Logout
```
POST /auth/logout
Authorization: Bearer <hub_access_token>

Response 204: (no body)
```

---

## Module Registry

### List all active modules
```
GET /modules?loop=A|B|all  (default: all)

Response 200:
{
  "modules": [
    {
      "module_key": "ccldr",
      "display_name": "CCLDR.net",
      "domain": "ccldr.net",
      "loop": "A",
      "category": "subscription"
    },
    ...
  ]
}
```

### Get single module
```
GET /modules/:module_key

Response 200:
{
  "module_key": "omniaguard",
  "display_name": "OmniaGuard",
  "domain": "omniaguard.com",
  "loop": "B",
  "category": "subscription",
  "stripe_account_id": "acct_xxx",
  "active": true
}
```

---

## Product Catalog

### List products (superstore browse)
```
GET /products
  ?module=ccldr,primedox          // filter by module (comma-separated)
  &loop=A                          // filter by loop
  &category=subscription           // filter by category
  &tag=legal,defense               // filter by tags (AND)
  &sort=price_asc|price_desc|name  // default: sort_order
  &page=1&limit=24                 // pagination

Response 200:
{
  "products": [
    {
      "id": "uuid",
      "sku": "PRIMEDOX-EMERGENCY-099",
      "module_key": "primedox",
      "loop": "A",
      "name": "Emergency Defense",
      "short_desc": "24/7 framework walkthrough + Charter rights card",
      "price_cents": 9900,
      "currency": "CAD",
      "product_type": "one_time",
      "category": "service",
      "tags": ["legal","defense","emergency"],
      "image_url": "https://cdn.franciscoholdings.com/products/primedox-emergency.webp"
    },
    ...
  ],
  "total": 87,
  "page": 1,
  "limit": 24
}
```

### Get single product
```
GET /products/:sku

Response 200: { ...full product object... }

Response 404:
{ "error": "product_not_found" }
```

### Search products (full-text + AI recommendations)
```
POST /products/search

Body:
{
  "query": "cannabis charges defense",
  "loop_scope": "A",   // only show loop-appropriate results for current session
  "limit": 10
}

Response 200:
{
  "results": [...product objects...],
  "suggestions": [
    { "query": "BENO-X framework", "reason": "related_term" }
  ]
}
```

---

## Cart

All cart endpoints require `X-Session-Id: <session_id>` header.
If user is authenticated, `Authorization: Bearer <hub_access_token>` merges any existing session cart.

### Get cart
```
GET /cart

Response 200:
{
  "cart_id": "uuid",
  "items": [
    {
      "id": "uuid",
      "product": { ...product object... },
      "quantity": 1,
      "unit_price_cents": 9900,
      "line_total_cents": 9900
    }
  ],
  "loop_a_subtotal": 9900,
  "loop_b_subtotal": 0,
  "discount_cents": 0,
  "grand_total_cents": 9900,
  "currency": "CAD",
  "coupon_code": null,
  "loyalty_credits_available": 0
}
```

### Add item
```
POST /cart/items

Body:
{
  "sku": "PRIMEDOX-EMERGENCY-099",
  "quantity": 1
}

Response 201: { ...updated cart... }

Response 409:
{ "error": "loop_mismatch", "message": "This item belongs to Loop A. Your current session is Loop B only." }
// Note: items from both loops CAN coexist in cart — they split at checkout
// This error only fires if the session has NO credentials for that loop
```

### Update item quantity
```
PATCH /cart/items/:item_id

Body: { "quantity": 2 }

Response 200: { ...updated cart... }
```

### Remove item
```
DELETE /cart/items/:item_id

Response 200: { ...updated cart... }
```

### Apply coupon / affiliate code
```
POST /cart/coupon

Body: { "code": "CCLDR-PARTNER-SMITH-001" }

Response 200:
{
  "discount_cents": 990,
  "discount_type": "percentage",
  "discount_pct": 10,
  "message": "Affiliate code applied — 10% off"
}

Response 422:
{ "error": "invalid_code", "message": "Code not found or expired" }
```

### Redeem loyalty credits
```
POST /cart/loyalty

Body: { "credits_to_redeem": 500 }

Response 200: { ...updated cart with credits applied... }
```

---

## Checkout

### Create checkout session
```
POST /checkout

Authorization: Bearer <hub_access_token>   // required — must be authenticated before checkout
X-Session-Id: <session_id>

Body:
{
  "payment_method": "stripe",  // "stripe" | "crypto" | "invoice"
  "shipping_address": {         // only required if cart has physical items
    "name": "Jane Smith",
    "line1": "123 Main St",
    "city": "Toronto",
    "province": "ON",
    "postal_code": "M5V 1A1",
    "country": "CA"
  },
  "save_payment": false
}

Response 201:
{
  "checkout_id": "uuid",
  "hub_order_id": "uuid",
  "loop_a_order_id": "uuid | null",
  "loop_b_order_id": "uuid | null",
  "payment_method": "stripe",
  // For Stripe:
  "stripe_client_secret": "pi_xxx_secret_xxx",
  // For crypto:
  "crypto_payment_address": null,
  "crypto_amount_btc": null,
  "crypto_expires_at": null,
  // For invoice:
  "invoice_pdf_url": null,
  "due_date": null,
  "total_cents": 9900,
  "currency": "CAD"
}
```

### Confirm payment (client-side Stripe confirmation calls Stripe SDK directly — this endpoint handles the post-confirm webhook trigger)
```
POST /checkout/:checkout_id/confirm

Body: { "stripe_payment_intent_id": "pi_xxx" }   // for Stripe
// OR
Body: { "crypto_tx_hash": "0x..." }               // for crypto

Response 200:
{
  "status": "confirmed",
  "fulfillment_status": "processing",
  "receipt_url": "https://hub.franciscoholdings.com/orders/uuid"
}
```

---

## Orders

### List orders (authenticated user's orders)
```
GET /orders?loop=A|B|all&status=paid&page=1&limit=20

Authorization: Bearer <hub_access_token>

Response 200:
{
  "orders": [
    {
      "id": "uuid",
      "created_at": "2026-06-06T12:00:00Z",
      "total_cents": 9900,
      "payment_status": "paid",
      "fulfillment_status": "fulfilled",
      "items": [...],
      "loop": "A"
    }
  ],
  "total": 3,
  "page": 1,
  "limit": 20
}
```

### Get order
```
GET /orders/:order_id

Authorization: Bearer <hub_access_token>

Response 200: { ...full order object with line items and fulfillment status... }
```

---

## Subscriptions

### List user's active subscriptions
```
GET /subscriptions

Authorization: Bearer <hub_access_token>

Response 200:
{
  "subscriptions": [
    {
      "id": "uuid",
      "module_key": "ccldr",
      "tier": "warrior",
      "status": "active",
      "price_cents": 14900,
      "billing_period": "monthly",
      "current_period_end": "2026-07-06T00:00:00Z",
      "cancel_at": null
    }
  ]
}
```

### Cancel subscription
```
POST /subscriptions/:subscription_id/cancel

Body:
{
  "cancel_at_period_end": true,  // graceful (default) or immediate
  "reason": "too_expensive"      // optional — for churn tracking
}

Response 200:
{
  "status": "cancelled",
  "access_until": "2026-07-06T00:00:00Z"
}
```

### Upgrade/downgrade subscription tier
```
PATCH /subscriptions/:subscription_id

Body: { "tier": "professional" }

Response 200: { ...updated subscription... }
```

---

## Webhooks (inbound — from Stripe and crypto processors)

### Stripe webhook endpoint
```
POST /webhooks/stripe

Headers:
  Stripe-Signature: t=...,v1=...

Body: { ...raw Stripe event payload... }

Events handled:
  payment_intent.succeeded       → trigger fulfillment
  payment_intent.payment_failed  → update order to failed, notify user
  customer.subscription.updated  → sync subscription status
  customer.subscription.deleted  → cancel subscription in DB
  invoice.payment_failed         → flag past_due, send retry email

Response 200: { "received": true }
// Must return 200 within 5s — all heavy processing via queued Edge Functions
```

### Crypto webhook endpoint
```
POST /webhooks/crypto

Headers:
  X-Nowpayments-Sig: <hmac-sha512>  // or BTCPay equivalent

Body: { ...payment processor event... }

Events handled:
  payment_status: "confirmed"    → trigger fulfillment (after 6 confirmations)
  payment_status: "failed"       → update order

Response 200: { "received": true }
```

---

## Module Integration Endpoints (called by property modules — server-to-server)

All require `Authorization: Bearer <module_service_token>` (issued per-module, stored as Supabase secret).

### Grant digital access (called by Delivery Engine after payment confirmed)
```
POST /modules/:module_key/access-grant

Body:
{
  "hub_order_id": "uuid",
  "loop_user_id": "uuid",
  "product_sku": "PRIMEDOX-EMERGENCY-099",
  "access_level": "emergency",
  "expires_at": null  // null = lifetime; ISO date = time-limited
}

Response 201:
{
  "access_id": "uuid",
  "access_token": "opaque-token-for-module",
  "granted_at": "2026-06-06T12:00:00Z"
}
```

### Revoke access (on subscription cancel/chargeback)
```
DELETE /modules/:module_key/access-grant/:access_id

Response 204
```

### Module webhook: push product catalog update
```
POST /modules/:module_key/products/sync

Body:
{
  "products": [
    {
      "external_id": "module-internal-id",
      "sku": "CCLDR-WARRIOR-149",
      "name": "Warrior Tier",
      "price_cents": 14900,
      "product_type": "subscription_monthly",
      ...
    }
  ]
}

Response 200: { "synced": 4, "errors": [] }
```

---

## Cross-Sell AI Recommendations

### Get recommendations for current cart/user
```
POST /recommendations

X-Session-Id: <session_id>
Authorization: Bearer <hub_access_token>  // optional — improves recommendations

Body:
{
  "context": "cart",     // "cart" | "product_page" | "post_purchase"
  "product_sku": "CCLDR-WARRIOR-149",  // for product_page context
  "limit": 3
}

Response 200:
{
  "recommendations": [
    {
      "product": { ...product object... },
      "reason": "CCLDR subscribers also use PrimeDox for 24/7 AI support",
      "score": 0.92
    }
  ],
  "ab_variant": "v2_social_proof"
}
```

---

## Investor Portal (Loop A — Derek identity only)

```
POST /investor/inquiry

Body:
{
  "name": "John Smith",
  "email": "john@example.com",
  "organization": "Smith Capital",
  "tier_interest": "growth",  // "seed" | "growth" | "strategic"
  "message": "..."
}

Response 201:
{
  "inquiry_id": "uuid",
  "status": "received",
  "next_steps": "Derek Francisco will contact you within 48 hours at john@example.com"
}
```

---

## Standard Error Responses

| Code | error string             | When                                               |
|------|--------------------------|----------------------------------------------------|
| 400  | `invalid_request`        | Malformed request body                             |
| 401  | `unauthorized`           | Missing or invalid auth token                      |
| 403  | `loop_access_denied`     | Session has no credentials for this loop           |
| 403  | `cross_loop_forbidden`   | Attempt to access Loop B resource with Loop A token|
| 404  | `not_found`              | Resource doesn't exist                             |
| 409  | `conflict`               | Duplicate order, cart merge conflict, etc.         |
| 422  | `unprocessable`          | Validation error (includes `field_errors` array)   |
| 429  | `rate_limited`           | Requests/minute exceeded (see Retry-After header)  |
| 500  | `internal_error`         | Unexpected server error (includes `trace_id`)      |
| 503  | `module_unavailable`     | Downstream module timed out                        |

Error body format:
```json
{
  "error": "loop_access_denied",
  "message": "Your session does not have Loop B credentials. Sign up at the relevant property first.",
  "trace_id": "trace_abc123",
  "field_errors": null
}
```

---

## Rate Limits

| Endpoint group             | Unauthenticated | Authenticated |
|----------------------------|-----------------|---------------|
| `/products`, `/modules`    | 60/min          | 200/min       |
| `/cart/*`                  | 30/min          | 120/min       |
| `/checkout`, `/auth/*`     | 10/min          | 30/min        |
| `/recommendations`         | 20/min          | 60/min        |
| `/webhooks/*`              | N/A (IP-locked) | N/A           |
| `/modules/*/products/sync` | N/A             | 5/min         |
