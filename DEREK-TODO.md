# DEREK-TODO.md — Exact Step-by-Step Revenue Actions
# Priority: Highest ROI with zero cost
# Last Updated: 2026-06-15 | Francisco Holdings Sprint
# Authority: PrimeDox (Derek Francisco) only

---

## 🚨 CRITICAL PATH — Do These First (Revenue Blocked)

---

### 1. ENABLE GITHUB PAGES ON EVERY REPO (30 min total, free)

For EACH repo below, go to the repo URL → Settings → Pages:

| Action | URL | Source | Custom Domain |
|--------|-----|--------|---------------|
| franciscoderek7/omniaguard | github.com/franciscoderek7/omniaguard/settings/pages | main / root | omniaguard.com |
| franciscoderek7/Ccldr-net | github.com/franciscoderek7/Ccldr-net/settings/pages | main / root | (leave blank — ccldr.net on hold) |
| franciscoderek7/vigilax | github.com/franciscoderek7/vigilax/settings/pages | main / root | vigilax.com |
| franciscoderek7/kiaros | github.com/franciscoderek7/kiaros/settings/pages | main / root | kiaros.com |
| franciscoderek7/vaultvelocityauto | github.com/franciscoderek7/vaultvelocityauto/settings/pages | main / root | vaultvelocityauto.com |
| franciscoderek7/techpetcage | github.com/franciscoderek7/techpetcage/settings/pages | main / root | techpetcage.com (if owned) |
| franciscoderek7/techpackcage | github.com/franciscoderek7/techpackcage/settings/pages | main / root | (leave blank) |
| franciscoderek7/zprimedoxaihq | github.com/franciscoderek7/zprimedoxaihq/settings/pages | main / root | zprimedoxaihq.com |

**Settings → Pages steps:**
1. Click "Pages" in left sidebar
2. Source: "Deploy from a branch"
3. Branch: "main" / Folder: "/ (root)"
4. Click Save
5. If adding custom domain: enter domain → Save → GitHub shows DNS instructions

---

### 2. CREATE GITHUB REPOS THAT DON'T EXIST YET

Claude tried and got 403 (MCP API restriction). You must create manually:

```
github.com/new
```

Create these repos (all public, initialize with README):

| Repo Name | Description |
|-----------|-------------|
| `nightingale-console` | Francisco Holdings Nightingale Empire Console |
| `empire-agents` | PrimeDox Payment and Referral Agent Scripts (CDN) |

After creating: push once to main branch, then enable GitHub Pages.

---

### 3. CREATE STRIPE PAYMENT LINKS (15 min, free, no backend needed)

Go to: **dashboard.stripe.com/payment-links** → "New"

Create these links and paste the URLs into `agents/stripe-payment-links.js`:

| Product | Amount | Type | Config | Variable Name |
|---------|--------|------|--------|---------------|
| OmniaGuard Security Audit | $500 CAD | One-time | Currency: CAD | `OMNIGUARD_AUDIT_500` |
| OmniaGuard VPN Monthly | $99 CAD/mo | Recurring | Monthly subscription | `OMNIGUARD_VPN_99` |
| CCLDR Foundation | $149 CAD | One-time | | `CCLDR_FOUNDATION_149` |
| CCLDR Practitioner | $499 CAD | One-time | | `CCLDR_PRACTITIONER_499` |
| CCLDR Elite | $1,499 CAD | One-time | | `CCLDR_ELITE_1499` |
| TechPetCage Basic | $19 CAD/mo | Recurring | Monthly | `TECHPET_BASIC_19` |
| TechPetCage Plus | $49 CAD/mo | Recurring | Monthly | `TECHPET_PLUS_49` |
| TechPetCage Family | $149 CAD/mo | Recurring | Monthly | `TECHPET_FAMILY_149` |
| FH Strategy Session | $500 CAD | One-time | | `FH_STRATEGY_500` |
| Kiaros Professional | $79 CAD/mo | Recurring | Monthly | `KIAROS_PRO_79` |
| Kiaros Enterprise | $249 CAD/mo | Recurring | Monthly | `KIAROS_ENTERPRISE_249` |
| Vault Velocity Scout | $99 CAD/mo | Recurring | Monthly | `VAULTVELOCITY_SCOUT_99` |
| Vault Velocity Fleet | $499 CAD/mo | Recurring | Monthly | `VAULTVELOCITY_FLEET_499` |
| zprimedoxaihq Individual | $199 CAD/mo | Recurring | Monthly | `ZPRIMEDOX_INDIVIDUAL_199` |
| zprimedoxaihq Team | $499 CAD/mo | Recurring | Monthly | `ZPRIMEDOX_TEAM_499` |

**After creating each link:**
1. Copy the `https://buy.stripe.com/XXXX` URL
2. Open `agents/stripe-payment-links.js` in GitHub (github.com/franciscoderek7/primedoxai-deploy/blob/main/agents/stripe-payment-links.js)
3. Replace `'REPLACE_WITH_STRIPE_LINK'` with your actual link
4. Commit the change → triggers auto-deploy

**Or send Claude the links** and Claude will wire them in.

---

### 4. CREATE FORMSPREE FORMS (10 min, free — 50 submissions/month per form)

Go to: **formspree.io** → Sign Up

**Account 1 (franciscoderek7@gmail.com) — Loop A forms:**
Create forms for:
- CCLDR contact → copy form ID → replace in `ccldr-site/contact.html`
- TechPetCage contact → replace in `techpetcage-site/contact.html`
- FH Strategy inquiry → replace in `francisco-holdings-site/book.html`
- OmniaGuard free scan → replace in `omniaguard-site/free-scan.html` (action URL)

**Account 2 (omniaguard1@gmail.com) — Loop B forms:**
- OmniaGuard contact → replace in `omniaguard-site/contact.html`
- Vigilax quote request → replace in `vigilax-site/pricing.html`

Form ID looks like: `xpwzybkv` → full URL: `https://formspree.io/f/xpwzybkv`

Send Claude the form IDs and Claude will wire them in everywhere.

---

### 5. PORKBUN DNS SETUP (15 min, free)

Go to: **porkbun.com** → Your Domains → [domain] → DNS

For each owned domain, add these A records pointing to GitHub Pages:
```
Type: A    Host: @    Answer: 185.199.108.153    TTL: 600
Type: A    Host: @    Answer: 185.199.109.153    TTL: 600
Type: A    Host: @    Answer: 185.199.110.153    TTL: 600
Type: A    Host: @    Answer: 185.199.111.153    TTL: 600
Type: CNAME  Host: www  Answer: franciscoderek7.github.io  TTL: 600
```

Domains to configure:
- omniaguard.com → then GitHub Pages: add custom domain
- vigilax.com → then GitHub Pages: add custom domain
- franciscoholdingsinc.com → then GitHub Pages: add custom domain
- zprimedoxaihq.com → then GitHub Pages: add custom domain
- techpetcage.com (if owned) → then GitHub Pages: add custom domain
- vaultvelocityauto.com → then GitHub Pages: add custom domain
- kiaros.com (if owned) → then GitHub Pages: add custom domain

DNS propagation: 15 min to 48 hours.

---

### 6. MERGE FEATURE BRANCH → MAIN (5 min)

All Claude's work is on `claude/francisco-revenue-sprint-MEva6`. To deploy:

```
github.com/franciscoderek7/primedoxai-deploy/compare/main...claude/francisco-revenue-sprint-MEva6
```

Click "Create Pull Request" → "Merge Pull Request"

OR via git:
```bash
git checkout main
git merge claude/francisco-revenue-sprint-MEva6
git push origin main
```

This triggers ALL GitHub Actions deploy workflows automatically.

---

### 7. SUPABASE — PAY INVOICE TO PREVENT SUSPENSION

Go to: **supabase.com** → Project: FHInc_17x17 → Settings → Billing

Pay the outstanding invoice to keep the `referral_commissions` table live.

After paying, create this table:
```sql
CREATE TABLE referral_commissions (
  id uuid default gen_random_uuid() primary key,
  code text not null,
  discount_percent numeric(5,2),
  product_id text,
  gross_amount numeric(10,2),
  commission_amount numeric(10,2),
  commission_type text, -- 'first_sale' or 'recurring'
  referrer_id text,
  created_at timestamptz default now()
);
```

---

### 8. PAYPAL BUSINESS BUTTONS (10 min)

Go to: **paypal.com/ca/webapps/mpp/button-factory**

Create recurring subscription buttons for:
- TechPetCage Basic $19/mo
- TechPetCage Plus $49/mo
- Kiaros Pro $79/mo

For Loop A (franciscoderek7@gmail.com account):
After creating, send Claude the button HTML → Claude wires in everywhere.

For Loop B (omniaguard1@gmail.com):
- OmniaGuard VPN $99/mo
- Vigilax Retainer $10,000/mo

---

### 9. CREATE `empire-agents` REPO FOR CDN

Current CDN URLs reference `primedoxai-deploy@main` for `payment-provider.js` and `referral-engine.js`. After merging to main, jsDelivr will serve them. But you can also:

1. Create `franciscoderek7/empire-agents` repo (github.com/new)
2. Copy `agents/payment-provider.js` and `agents/referral-engine.js` there
3. Enable as CDN: `cdn.jsdelivr.net/gh/franciscoderek7/empire-agents@main/`
4. Send Claude the new CDN URL → Claude updates all references

---

## 📊 REVENUE POTENTIAL BY SITE (free tier)

| Site | Primary Product | Price | Monthly Revenue at 5 sales |
|------|----------------|-------|---------------------------|
| OmniaGuard (free-scan → $500 audit) | Security Audit | $500 CAD | $2,500 |
| CCLDR (Foundation → Elite) | Legal education | $149–$1,499 | $745–$7,495 |
| TechPetCage | Subscriptions | $19–$149/mo | $95–$745/mo |
| Francisco Holdings (skyscraper) | Strategy sessions | $500 | $2,500 |
| Kiaros | AI consulting | $79–$999/mo | $395–$4,995/mo |
| Vault Velocity | Fleet AI | $99–$2,500/mo | $495–$12,500/mo |
| Vigilax | Enterprise security | $499–$10,000/mo | $2,495–$50,000/mo |
| zprimedoxaihq HQ | AI access | $199–$999/mo | $995–$4,995/mo |

**Conservative estimate at 2-3 sales/site:** $8,000–$15,000 CAD/month

---

## ✅ WHAT CLAUDE HAS ALREADY BUILT (branch: claude/francisco-revenue-sprint-MEva6)

| Item | File | Status |
|------|------|--------|
| PayPal links (33 files fixed) | Empire-wide | ✅ Done |
| Referral engine | `agents/referral-engine.js` | ✅ Done |
| Payment provider | `agents/payment-provider.js` | ✅ Done |
| FH Skyscraper 45 floors | `francisco-holdings-site/index.html` | ✅ Done + Stripe buttons |
| OmniaGuard free-scan lead funnel | `omniaguard-site/free-scan.html` | ✅ Done + $500 upsell |
| OmniaGuard $500 audit section | `omniaguard-site/free-scan.html` | ✅ Done |
| CCLDR education hub | `ccldr-site/education.html` | ✅ Done |
| Kiaros pricing | `kiaros-site/index.html` | ✅ Done |
| Vault Velocity pricing | `vaultvelocityauto-site/index.html` | ✅ Done |
| TechPackCage pricing | `techpackcage-site/index.html` | ✅ Done |
| Vigilax pricing tiers | `vigilax-site/pricing.html` | ✅ Done |
| TechPetCage 3-tier + trust badges | `techpetcage-site/index.html` | ✅ Done |
| Stripe LIVE banners (all sites) | Empire-wide | ✅ Done |
| zprimedoxaihq Enterprise tier | `zprimedoxaihq-site/index.html` | ✅ Done |
| Deploy workflows (all sites) | `.github/workflows/` | ✅ Done — trigger on push to main |
| SEO meta tags + sitemap + robots.txt | Empire-wide | ✅ Done |
| Stripe Payment Links config | `agents/stripe-payment-links.js` | ✅ Done — Derek fills URLs |

---

## 🔴 BLOCKED — Requires Derek Only

| Task | Reason | Priority |
|------|--------|----------|
| Enable GitHub Pages per repo | Browser action, no API | CRITICAL |
| Create Stripe Payment Links | Stripe dashboard (no API) | CRITICAL |
| Merge feature branch → main | Triggers all deployments | CRITICAL |
| Create GitHub repos (nightingale-console, empire-agents) | MCP API returns 403 | HIGH |
| Porkbun DNS setup | Browser action | HIGH |
| Pay Supabase invoice | Billing action | HIGH |
| Formspree setup + form IDs | Account needed | MEDIUM |
| PayPal Business recurring buttons | PayPal dashboard | MEDIUM |
| RunPod GPU backend | Needs funds | LOW (defer) |

---

*Next command for Claude: "Claude — merge branch, push, and confirm all workflows ran successfully"*
*Or: "Claude — here are my Stripe Payment Link URLs: [paste links]. Wire them in."*
