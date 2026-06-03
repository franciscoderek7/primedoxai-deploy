# STRIPE SETUP GUIDE — FRANCISCO HOLDINGS INC.
# 8 AM REVENUE ACTIVATION — DEREK FRANCISCO

---

## STEP 1: STRIPE ACCOUNT (5 minutes)

1. Go to https://dashboard.stripe.com/register
2. Use: franciscoderek7@gmail.com
3. Business name: Tech Pet Cage (registered entity)
4. Country: Canada
5. Currency: CAD
6. Bank: Connect your Canadian bank account
7. Enable test mode (toggle top-left): START HERE

---

## STEP 2: CREATE PRODUCTS (20 minutes)

Go to: Dashboard → Products → Add Product

### OMNIAGUARD PRODUCTS:

| Product Name | Price | Billing |
|---|---|---|
| OmniaGuard Sentinel | $499.00 CAD | Monthly recurring |
| OmniaGuard Warden | $1,999.00 CAD | Monthly recurring |
| OmniaGuard Archon | $4,999.00 CAD | Monthly recurring |
| OmniaGuard Sovereign | $24,999.00 CAD | Monthly recurring |
| OmniaGuard Imperium | $99,999.00 CAD | Monthly recurring |

### PRIMEDOX AI PRODUCTS:

| Product Name | Price | Billing |
|---|---|---|
| PrimeDox Pro | $49.00 CAD | Monthly recurring |
| PrimeDox Elite | $199.00 CAD | Monthly recurring |
| PrimeDox Sovereign | $999.00 CAD | Monthly recurring |
| PrimeDox Imperium | $9,999.00 CAD | Monthly recurring |

### CCLDR PRODUCTS:

| Product Name | Price | Billing |
|---|---|---|
| CCLDR Warrior Monthly | $149.00 CAD | Monthly recurring |
| CCLDR Warrior Annual | $1,490.00 CAD | One-time or annual |
| CCLDR Professional Monthly | $499.00 CAD | Monthly recurring |
| CCLDR Professional Annual | $4,990.00 CAD | One-time or annual |
| CCLDR Elite Monthly | $999.00 CAD | Monthly recurring |
| CCLDR Elite Annual | $9,990.00 CAD | One-time or annual |
| CCLDR Sovereign Monthly | $1,499.00 CAD | Monthly recurring |
| CCLDR Sovereign Annual | $14,990.00 CAD | One-time or annual |

### CLEANSWARM PRODUCTS:

| Product Name | Price | Billing |
|---|---|---|
| CleanSwarm Starter | $399.00 CAD | Monthly recurring |
| CleanSwarm Growth | $999.00 CAD | Monthly recurring |
| CleanSwarm Scale | $2,499.00 CAD | Monthly recurring |

---

## STEP 3: CREATE PAYMENT LINKS (10 minutes)

For EACH product above:
1. Go to product → Click "Create Payment Link"
2. Set success URL: https://[your-domain]/success.html
3. Set cancel URL: https://[your-domain]/cancel.html
4. Click "Create Link"
5. Copy the link (format: https://buy.stripe.com/test_XXXXXXXX)

---

## STEP 4: PASTE LINKS INTO SITE FILES

In each pricing HTML file, find the placeholder text:
  `PASTE_STRIPE_LINK_HERE_[TIER_NAME]`

Replace with your actual Stripe Payment Link URL.

Example:
  BEFORE: href="PASTE_STRIPE_LINK_HERE_SENTINEL"
  AFTER:  href="https://buy.stripe.com/test_abc123xyz"

---

## STEP 5: TEST (5 minutes)

Use Stripe test card:
- Card: 4242 4242 4242 4242
- Expiry: Any future date
- CVC: Any 3 digits
- ZIP: Any 5 digits

Click a "Pay Now" button → complete test checkout → verify success page.

---

## STEP 6: GO LIVE

When ready:
1. Complete Stripe identity verification
2. Toggle test mode OFF in Stripe Dashboard
3. Recreate Payment Links in LIVE mode (they start with https://buy.stripe.com/ not https://buy.stripe.com/test_)
4. Update all LIVE_ placeholders in HTML files
5. Push to GitHub → money flows

---

## INTERAC E-TRANSFER (IMMEDIATE — NO STRIPE NEEDED)

Start collecting payments TODAY while Stripe verifies:

- Email: franciscoderek7@gmail.com
- Reference: [Client Name] + [Product] + [Tier]
- Turnaround: Grant access within 4 hours of confirmed receipt

All pricing pages include Interac instructions automatically.

---

## PLACEHOLDER REFERENCE TABLE

Replace these in the HTML files:

| Placeholder | Product |
|---|---|
| PASTE_STRIPE_LINK_HERE_OMNIAGUARD_SENTINEL | OmniaGuard Sentinel $499/mo |
| PASTE_STRIPE_LINK_HERE_OMNIAGUARD_WARDEN | OmniaGuard Warden $1,999/mo |
| PASTE_STRIPE_LINK_HERE_OMNIAGUARD_ARCHON | OmniaGuard Archon $4,999/mo |
| PASTE_STRIPE_LINK_HERE_OMNIAGUARD_SOVEREIGN | OmniaGuard Sovereign $24,999/mo |
| PASTE_STRIPE_LINK_HERE_OMNIAGUARD_IMPERIUM | OmniaGuard Imperium $99,999/mo |
| PASTE_STRIPE_LINK_HERE_PRIMEDOX_PRO | PrimeDox Pro $49/mo |
| PASTE_STRIPE_LINK_HERE_PRIMEDOX_ELITE | PrimeDox Elite $199/mo |
| PASTE_STRIPE_LINK_HERE_PRIMEDOX_SOVEREIGN | PrimeDox Sovereign $999/mo |
| PASTE_STRIPE_LINK_HERE_PRIMEDOX_IMPERIUM | PrimeDox Imperium $9,999/mo |
| PASTE_STRIPE_LINK_HERE_CCLDR_WARRIOR_M | CCLDR Warrior $149/mo |
| PASTE_STRIPE_LINK_HERE_CCLDR_WARRIOR_A | CCLDR Warrior $1,490/yr |
| PASTE_STRIPE_LINK_HERE_CCLDR_PRO_M | CCLDR Professional $499/mo |
| PASTE_STRIPE_LINK_HERE_CCLDR_PRO_A | CCLDR Professional $4,990/yr |
| PASTE_STRIPE_LINK_HERE_CCLDR_ELITE_M | CCLDR Elite $999/mo |
| PASTE_STRIPE_LINK_HERE_CCLDR_ELITE_A | CCLDR Elite $9,990/yr |
| PASTE_STRIPE_LINK_HERE_CCLDR_SOVEREIGN_M | CCLDR Sovereign $1,499/mo |
| PASTE_STRIPE_LINK_HERE_CCLDR_SOVEREIGN_A | CCLDR Sovereign $14,990/yr |
| PASTE_STRIPE_LINK_HERE_CLEANSWARM_STARTER | CleanSwarm Starter $399/mo |
| PASTE_STRIPE_LINK_HERE_CLEANSWARM_GROWTH | CleanSwarm Growth $999/mo |
| PASTE_STRIPE_LINK_HERE_CLEANSWARM_SCALE | CleanSwarm Scale $2,499/mo |

---

## REVENUE PROJECTION (8 AM LAUNCH)

If 1 client per product signs up in Week 1:

| Product | Revenue/Month |
|---|---|
| OmniaGuard (avg 1 Sentinel) | $499 |
| PrimeDox (avg 1 Pro) | $49 |
| CCLDR (avg 1 Warrior) | $149 |
| CleanSwarm (avg 1 Starter) | $399 |
| **Total MRR Week 1** | **$1,096/mo** |

Scale: 10 clients/product = $10,960/mo MRR within 30 days.
Scale: OmniaGuard Enterprise client (Archon+) = $4,999–$99,999/mo per client.

---

*Francisco Holdings Inc. | Tech Pet Cage (Registered) | Derek Francisco, CEO*
*Emergency Revenue Sprint — Generated 2026-06-03*
