# Francisco Holdings — Zero-Touch Deployment Checklist
## Revenue Sprint — 5 Sites / 15 Products / CAD Pricing

---

## PRE-FLIGHT (Do This First)

- [ ] **GitHub Token** — generate at https://github.com/settings/tokens/new
  - Scopes: `repo`, `workflow`
  - Copy the `ghp_xxx` token
- [ ] **Stripe Secret Key** — get at https://dashboard.stripe.com/apikeys
  - Use `sk_test_xxx` for testing, `sk_live_xxx` for production
  - Never paste sk_live into test mode dashboard
- [ ] **git installed** — `git --version` prints a version
- [ ] **curl installed** — `curl --version` prints a version
- [ ] **python3 installed** — `python3 --version` prints a version

---

## OPTION A — ONE-COMMAND DEPLOY (Recommended)

### Mac / Linux
```bash
export GH_TOKEN="ghp_xxx"
export STRIPE_SECRET_KEY="sk_test_xxx"   # or sk_live_xxx
chmod +x DEPLOY-NOW.sh
./DEPLOY-NOW.sh
```

### Windows (PowerShell)
```powershell
$env:GH_TOKEN = "ghp_xxx"
$env:STRIPE_SECRET_KEY = "sk_test_xxx"   # or sk_live_xxx
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\DEPLOY-NOW.ps1
```

**`DEPLOY-NOW.sh` / `DEPLOY-NOW.ps1` does everything:**
- [ ] Creates 15 Stripe products + prices + payment links
- [ ] Fetches all 5 site HTML files from GitHub branch
- [ ] Patches PLACEHOLDER_URL_1..15 with real Stripe URLs
- [ ] Creates GitHub repos (or updates existing ones)
- [ ] Pushes live via `git push --force`
- [ ] Enables GitHub Pages on each repo
- [ ] Saves all payment links to `~/francisco-holdings-payment-links.txt`

---

## OPTION B — STEP BY STEP (If A Fails)

### Step 1 — Create Stripe Products
```bash
export STRIPE_SECRET_KEY="sk_test_xxx"
chmod +x stripe-setup.sh
./stripe-setup.sh
# Output: stripe-payment-links.txt
```
- [ ] `stripe-payment-links.txt` created
- [ ] Contains 15 lines (PLACEHOLDER_URL_1..15)

### Step 2 — Apply Payment Links to HTML
```bash
chmod +x apply-payment-links.sh
./apply-payment-links.sh
# Patches all 5 site HTML files
```
- [ ] No remaining `PLACEHOLDER_URL_` in any HTML file
  - Verify: `grep -r "PLACEHOLDER_URL_" cleanswarm-checkout ccldr-payments revenue-dashboard omniaguard-site primedoxai-site`
  - Should print nothing

### Step 3 — Push to GitHub Pages
```bash
export GH_TOKEN="ghp_xxx"
export GH_USER="franciscoderek7"   # your GitHub username
chmod +x MANUAL-FALLBACKS.sh
# Run only the "github_deploy_site" section at the bottom of MANUAL-FALLBACKS.sh
```
- [ ] `cleanswarm-checkout` repo pushed + Pages enabled
- [ ] `ccldr-payments` repo pushed + Pages enabled
- [ ] `revenue-dashboard` repo pushed + Pages enabled
- [ ] `omniaguard-site` repo pushed + Pages enabled
- [ ] `primedoxai-site` repo pushed + Pages enabled

---

## POST-DEPLOY VERIFICATION

### Wait 60 seconds for DNS, then check each URL:

| Site | URL | Status |
|------|-----|--------|
| CleanSwarm | `https://franciscoderek7.github.io/cleanswarm-checkout` | [ ] Live |
| CCLDR | `https://franciscoderek7.github.io/ccldr-payments` | [ ] Live |
| Revenue Dashboard | `https://franciscoderek7.github.io/revenue-dashboard` | [ ] Live |
| OmniaGuard | `https://franciscoderek7.github.io/omniaguard-site` | [ ] Live |
| PrimeDox AI | `https://franciscoderek7.github.io/primedoxai-site` | [ ] Live |
| MindShift *(untouched)* | `https://franciscoderek7.github.io/mindshift-makayla` | Already live |

### Test Each Checkout Button
- [ ] CleanSwarm Starter button → opens `https://buy.stripe.com/...`
- [ ] CleanSwarm Growth button → opens `https://buy.stripe.com/...`
- [ ] CleanSwarm Scale button → opens `https://buy.stripe.com/...`
- [ ] CCLDR Warrior button → opens `https://buy.stripe.com/...`
- [ ] CCLDR Professional button → opens `https://buy.stripe.com/...`
- [ ] CCLDR Elite button → opens `https://buy.stripe.com/...`
- [ ] CCLDR Sovereign button → opens `https://buy.stripe.com/...`
- [ ] OmniaGuard Starter button → opens `https://buy.stripe.com/...`
- [ ] OmniaGuard Professional button → opens `https://buy.stripe.com/...`
- [ ] OmniaGuard Enterprise button → opens `https://buy.stripe.com/...`
- [ ] PrimeDox Pro button → opens `https://buy.stripe.com/...`
- [ ] PrimeDox Elite button → opens `https://buy.stripe.com/...`

### Test Stripe Checkout (use test card)
- [ ] Card: `4242 4242 4242 4242`
- [ ] Expiry: any future date (e.g., 12/29)
- [ ] CVC: any 3 digits (e.g., 123)
- [ ] Payment completes successfully
- [ ] Charge appears in Stripe Dashboard

### Revenue Dashboard
- [ ] Open `https://franciscoderek7.github.io/revenue-dashboard`
- [ ] Lock screen appears (do NOT hardcode the key)
- [ ] Paste `sk_test_xxx` into the input field
- [ ] Click "Unlock Dashboard"
- [ ] All 6 KPI cards load (balance, pending, revenue, charges, subs, customers)

### Conversion Features
- [ ] Urgency countdown timer visible on each checkout page
- [ ] Social proof toast notification appears after ~10 seconds
- [ ] Email capture modal appears after ~25 seconds (or at 60% scroll)
- [ ] "Only X spots left" scarcity counter visible
- [ ] `?ref=yourname` URL parameter works (check localStorage in DevTools)

---

## STRIPE DASHBOARD VERIFICATION

- [ ] Login to https://dashboard.stripe.com
- [ ] Products > all 15 products visible
- [ ] Payment Links > all 15 links active
- [ ] Test a purchase end-to-end
- [ ] Confirm webhook (if set up) fires correctly

---

## QUICK REFERENCE — PRODUCT PRICING

| # | Product | Price | Type |
|---|---------|-------|------|
| 1 | CleanSwarm Starter | CAD $199/mo | Recurring |
| 2 | CleanSwarm Growth | CAD $499/mo | Recurring |
| 3 | CleanSwarm Scale | CAD $1,249/mo | Recurring |
| 4 | CCLDR Warrior | CAD $149 | One-time |
| 5 | CCLDR Professional | CAD $499 | One-time |
| 6 | CCLDR Elite | CAD $999 | One-time |
| 7 | CCLDR Sovereign | CAD $1,499 | One-time |
| 8 | MindShift Neuro | CAD $497 | One-time |
| 9 | MindShift Group Intensive | CAD $1,997 | One-time |
| 10 | MindShift Premium | CAD $10,000 | One-time |
| 11 | OmniaGuard Starter | CAD $99/mo | Recurring |
| 12 | OmniaGuard Professional | CAD $499/mo | Recurring |
| 13 | OmniaGuard Enterprise | CAD $1,999/mo | Recurring |
| 14 | PrimeDox Pro | CAD $49/mo | Recurring |
| 15 | PrimeDox Elite | CAD $199/mo | Recurring |

---

## REVENUE POTENTIAL (Day 1)

| Brand | Target Conversions | MRR/Revenue |
|-------|-------------------|-------------|
| CleanSwarm (avg $399/mo) | 3 customers | $1,197/mo |
| CCLDR (avg $499 one-time) | 5 sales | $2,495 |
| OmniaGuard (avg $299/mo) | 2 customers | $598/mo |
| PrimeDox (avg $199/mo) | 5 customers | $995/mo |
| **Total Day-1 Target** | | **$5,285** |

---

*MindShift site left in GitHub as requested. Stripe products created and saved to payment-links file.*
*CCLDR disclaimer: NOT LEGAL REPRESENTATION — EDUCATION ONLY — embedded in site header, pricing section, and email modal.*
