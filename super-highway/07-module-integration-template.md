# Super Highway — Module Integration Template
**Phase 1 Deliverable 7 of 7 — June 6, 2026**

Use this template every time you add one of the 45 properties to the Super Highway. Copy the files, fill in the placeholders, run the checklist. Consistent format across all modules is what makes the superstore work at scale.

---

## Step 1 — Fill in the Module Manifest

Create `super-highway/modules/[MODULE_KEY]/module_config.json`:

```json
{
  "module_key": "REPLACE_ME",
  "display_name": "REPLACE_ME",
  "domain": "REPLACE_ME.com",
  "loop": "A",
  "category": "subscription",
  "stripe_account_id": "acct_REPLACE_ME",
  "stripe_webhook_secret": "whsec_REPLACE_ME",
  "active": true,
  "sort_order": 99,

  "products": [
    {
      "external_id": "module-internal-sku-001",
      "sku": "MODULEKEY-TIERNAME-PRICECENTS",
      "name": "Tier Display Name",
      "short_desc": "One sentence description for superstore listing",
      "price_cents": 9900,
      "currency": "CAD",
      "product_type": "subscription_monthly",
      "category": "subscription",
      "tags": ["tag1", "tag2"],
      "image_url": "https://cdn.franciscoholdings.com/products/MODULE_KEY-TIER.webp",
      "stripe_price_id": "price_REPLACE_ME"
    }
  ],

  "delivery": {
    "type": "digital",
    "instant": true,
    "access_grant_endpoint": "https://MODULE_DOMAIN.com/api/access-grant",
    "access_revoke_endpoint": "https://MODULE_DOMAIN.com/api/access-revoke"
  },

  "analytics": {
    "loop": "A",
    "plausible_domain": "MODULE_DOMAIN.com",
    "ga4_measurement_id": "G-REPLACE_ME",
    "fb_pixel_id": "REPLACE_ME"
  },

  "email": {
    "sender_name": "Derek Francisco / Doc Weedlaw",
    "sender_address": "derek@MODULE_DOMAIN.com",
    "reply_to": "franciscoderek7@gmail.com",
    "unsubscribe_list_id": "REPLACE_ME"
  },

  "cross_sell": [
    {
      "target_sku": "OTHER-MODULE-SKU",
      "reason": "Copy shown in superstore recommendations",
      "priority": 1
    }
  ]
}
```

**For Loop B modules:** change `"loop": "B"` and clear `ga4_measurement_id` and `fb_pixel_id` — they must be null for Loop B.

---

## Step 2 — Register the Module in Hub DB

Run this against the **Hub Supabase project** (not Loop A or B):

```sql
INSERT INTO modules (module_key, display_name, domain, loop, category, stripe_account_id, active, sort_order)
VALUES (
  'YOUR_MODULE_KEY',
  'Your Module Display Name',
  'yourmodule.com',
  'A',             -- 'A' or 'B'
  'subscription',  -- 'digital' | 'physical' | 'service' | 'subscription' | 'hybrid'
  'acct_xxx',      -- Stripe Connect account ID
  true,
  10               -- controls superstore sort order
);
```

Then sync products via the API:
```bash
curl -X POST https://hub.franciscoholdings.com/api/v1/modules/YOUR_MODULE_KEY/products/sync \
  -H "Authorization: Bearer $MODULE_SERVICE_TOKEN" \
  -H "Content-Type: application/json" \
  -d @super-highway/modules/YOUR_MODULE_KEY/products.json
```

---

## Step 3 — Implement the Module API Adapter

Every module exposes three standard endpoints. Implement them in the module's existing codebase (as a Next.js API route, Supabase Edge Function, or plain serverless function — your choice):

### `GET /api/sh/products`
Returns this module's product catalog in the standard format.

```typescript
// Example: primedoxai-site/pages/api/sh/products.ts
import { NextApiRequest, NextApiResponse } from 'next'
import { products } from '../../data/products'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Verify hub service token
  const authHeader = req.headers.authorization
  if (authHeader !== `Bearer ${process.env.HUB_MODULE_TOKEN}`) {
    return res.status(401).json({ error: 'unauthorized' })
  }

  res.status(200).json({
    module_key: 'primedox',
    products: products.map(p => ({
      external_id:   p.id,
      sku:           p.sku,
      name:          p.name,
      short_desc:    p.shortDesc,
      price_cents:   p.priceCents,
      currency:      'CAD',
      product_type:  p.type,
      category:      p.category,
      tags:          p.tags,
      image_url:     p.imageUrl,
      stripe_price_id: p.stripePriceId,
    }))
  })
}
```

### `POST /api/sh/access-grant`
Called by the Delivery Engine after a successful payment. Creates the user's access in this module.

```typescript
// Example: primedoxai-site/pages/api/sh/access-grant.ts
import { createClient } from '@supabase/supabase-js'
import { NextApiRequest, NextApiResponse } from 'next'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()
  
  // Verify hub service token
  if (req.headers.authorization !== `Bearer ${process.env.HUB_MODULE_TOKEN}`) {
    return res.status(401).json({ error: 'unauthorized' })
  }

  const { hub_order_id, loop_user_id, product_sku, access_level, expires_at } = req.body

  // Upsert access grant
  const { data, error } = await supabase
    .from('access_grants')
    .upsert({
      user_id:       loop_user_id,
      hub_order_ref: hub_order_id,
      product_sku:   product_sku,
      access_level:  access_level,
      expires_at:    expires_at ?? null,
      granted_at:    new Date().toISOString(),
    })
    .select()
    .single()

  if (error) return res.status(500).json({ error: error.message })

  res.status(201).json({
    access_id:    data.id,
    access_token: data.access_token, // generate a short-lived login token if needed
    granted_at:   data.granted_at,
  })
}
```

### `DELETE /api/sh/access-revoke/:access_id`
Called on subscription cancellation or chargeback.

```typescript
// Example: primedoxai-site/pages/api/sh/access-revoke/[access_id].ts
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'DELETE') return res.status(405).end()
  if (req.headers.authorization !== `Bearer ${process.env.HUB_MODULE_TOKEN}`) {
    return res.status(401).json({ error: 'unauthorized' })
  }

  const { access_id } = req.query

  const { error } = await supabase
    .from('access_grants')
    .update({ revoked_at: new Date().toISOString(), status: 'revoked' })
    .eq('id', access_id)

  if (error) return res.status(500).json({ error: error.message })
  res.status(204).end()
}
```

---

## Step 4 — Environment Variables

Add to the module's `.env` (and to Vercel/hosting env vars):

```bash
# Hub issues this token for this module — generate with: openssl rand -base64 32
HUB_MODULE_TOKEN=generate_and_store_in_vault

# Loop-appropriate Supabase credentials
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_LOOP_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...  # NEVER expose this client-side

# Stripe (connected account — not the platform account)
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Analytics (Loop B: OMIT the GA4 and FB_PIXEL vars entirely — don't even leave them blank)
NEXT_PUBLIC_GA4_ID=G-XXX              # Loop A only
NEXT_PUBLIC_FB_PIXEL_ID=XXX           # Loop A only
NEXT_PUBLIC_PLAUSIBLE_DOMAIN=yoursite.com
```

---

## Step 5 — Superstore Product Listing Card Component

When this module's products appear in the Super Highway superstore, they render using this standard component. The hub provides the data; the superstore frontend renders it — no custom module code needed:

```tsx
// super-highway/frontend/components/ProductCard.tsx (hub codebase)
interface Product {
  id: string
  sku: string
  module_key: string
  loop: 'A' | 'B'
  name: string
  short_desc: string
  price_cents: number
  currency: string
  product_type: string
  image_url: string
  tags: string[]
}

export function ProductCard({ product }: { product: Product }) {
  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-5 hover:shadow-lg transition-shadow">
      {product.image_url && (
        <img src={product.image_url} alt={product.name}
          className="w-full h-40 object-cover rounded-lg mb-4" />
      )}
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-base leading-snug">{product.name}</h3>
        <span className="text-sm font-bold whitespace-nowrap">
          ${(product.price_cents / 100).toFixed(2)} {product.currency}
        </span>
      </div>
      <p className="text-sm text-zinc-500 mt-1 mb-3">{product.short_desc}</p>
      <button
        onClick={() => addToCart(product.sku)}
        className="w-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900
                   text-sm font-semibold py-2 rounded-lg hover:opacity-90 transition-opacity"
      >
        {product.product_type === 'subscription_monthly' ? 'Subscribe' : 'Buy Now'}
      </button>
    </div>
  )
}
```

---

## Step 6 — Pre-Launch Checklist

Run this before making the module visible in the superstore:

**Hub registration:**
- [ ] Row inserted in `modules` table in hub DB
- [ ] Products synced via `/modules/:key/products/sync` — verify `hub_products` count matches
- [ ] `module_config.json` committed to `super-highway/modules/MODULE_KEY/`

**Module API:**
- [ ] `GET /api/sh/products` returns valid data (test with `curl` + module token)
- [ ] `POST /api/sh/access-grant` creates a real access grant in the module's DB (test with a $0 test order)
- [ ] `DELETE /api/sh/access-revoke/:id` revokes successfully
- [ ] All three endpoints return 401 without the correct `HUB_MODULE_TOKEN`

**Payments:**
- [ ] Stripe connected account onboarded and verified
- [ ] Stripe webhook configured to send to `/webhooks/stripe` on hub
- [ ] Test mode: place a $0.50 test charge, confirm webhook fires, confirm access grant created

**Identity loop:**
- [ ] Loop assignment (A or B) is correct for this module
- [ ] Analytics stack matches the loop (Loop B = Plausible only)
- [ ] Email sender address matches the module's brand (not Derek's personal address for Loop B)
- [ ] `module_config.json` `loop` field matches the Supabase project this module talks to

**Superstore visibility:**
- [ ] `active: true` in module registry
- [ ] At least one product with `active: true` and a valid `image_url`
- [ ] `short_desc` fits in 120 characters (truncated in card UI otherwise)
- [ ] Product card renders correctly in Storybook or local preview

**Cross-sell:**
- [ ] `cross_sell` array in `module_config.json` references valid SKUs from the same loop
- [ ] No cross-sell references point across loop boundaries

---

## Module Registry — Current Status

| Module Key          | Loop | Status         | Products Synced | API Adapter |
|---------------------|------|----------------|-----------------|-------------|
| `ccldr`             | A    | ✅ Live        | ❌ Pending sync  | ❌ Build needed |
| `primedox`          | A    | ✅ Live        | ❌ Pending sync  | ❌ Build needed |
| `weedlaw-education` | A    | ✅ Live        | ❌ Pending sync  | ❌ Build needed |
| `francisco-holdings`| A    | ✅ Live        | ❌ Pending sync  | ❌ Build needed |
| `ccc`               | A    | ✅ Live        | ❌ Pending sync  | ❌ Build needed |
| `omniaguard`        | B    | ✅ Live        | ❌ Pending sync  | ❌ Build needed |
| `kiaros`            | B    | ✅ Live        | ❌ Pending sync  | ❌ Build needed |
| `cleanswarm`        | B    | ✅ Live        | ❌ Pending sync  | ❌ Build needed |
| `soulstack`         | B    | ⏳ Pending     | ❌              | ❌          |
| `techpetcage`       | B    | ✅ Live        | ❌ Pending sync  | ❌ Build needed |
| `space-swarm` …×8   | B    | ✅ Live (GH Pages) | ❌          | ❌ Build needed |
| [+27 planned]       | TBD  | ❌ Not started | ❌              | ❌          |

*Next action: build API adapters for the 10 live modules — they're the revenue-generating priority. Planned modules come after.*
