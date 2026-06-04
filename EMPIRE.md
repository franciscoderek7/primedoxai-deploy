# EMPIRE.md — Francisco Holdings Inc. Master State
## Living Document — Update After Every Deployment

**Owner:** Derek Francisco (Doc Weedlaw)
**Holding Company:** Francisco Holdings Inc. / Tech Pet Cage
**Empire Scale:** 22+ companies
**Last Updated:** 2026-06-04

---

## Revenue Targets

| Year | ARR Target | Status |
|------|-----------|--------|
| Y1 (2026) | $696,000 | Building |
| Y2 (2027) | $2,000,000 | Projected |
| Y3 (2028) | $10,000,000 | Projected |
| Y4 (2029) | $400,000,000+ | Counter-structure thesis |

---

## Site Registry

### LIVE — Deployed

| Site | Domain | Repo | Stack | Status |
|------|--------|------|-------|--------|
| OmniaGuard | omniaguard.com | franciscoderek7/omniaguard | GitHub Pages | ✅ LIVE |
| CCLDR | ccldr.net | TBD | GitHub Pages | ⚠️ DNS pending |

### IN BUILD

| Site | Domain | Repo | Stack | Status |
|------|--------|------|-------|--------|
| Kiaros | kiaros.com | primedoxai-deploy/kiaros-site | GitHub Pages | 🔨 Building |
| SoulStack | soulstack.ai | TBD | TBD | 📋 Domain not yet registered |

### PLANNED

| Site | Domain | Status |
|------|--------|--------|
| Francisco Holdings | franciscoholdings.com | Planned |
| Doc Weedlaw Media | docweedlaw.com | Planned |
| Weedlaw Education | weedlaweducation.com | Planned |

---

## OmniaGuard — Current State

**URL:** https://omniaguard.com
**Repo:** franciscoderek7/omniaguard (main branch → GitHub Pages)
**Source:** primedoxai-deploy/omniaguard-site/

### Pages Deployed (9)

| Page | File | Status |
|------|------|--------|
| Homepage | index.html | ✅ Live |
| Pricing | pricing.html | ✅ Live |
| VPN | vpn.html | ✅ Live |
| Intelligence Brief | intelligence.html | ✅ Live |
| Ecosystem | ecosystem.html | ✅ Live |
| Investor Pitch | investor.html | ✅ Live |
| About | about.html | ✅ Live |
| Contact | contact.html | ✅ Live |
| App Dashboard | app/index.html | ✅ Live |
| Payment Success | payment-success.html | ✅ Live |
| Payment Cancel | payment-cancel.html | ✅ Live |

### Payment Status

| Tier | Price | Method | Status |
|------|-------|--------|--------|
| Sentinel | $499/mo | Stripe | ⚠️ Mailto fallback — needs buy.stripe.com URL |
| Guardian | $2,499/mo | Stripe | ⚠️ Mailto fallback — needs buy.stripe.com URL |
| Warden | $5,000/mo | Stripe | ⚠️ Mailto fallback — needs buy.stripe.com URL |
| Protector | $10,000/mo | Stripe | ⚠️ Mailto fallback — needs buy.stripe.com URL |
| Archon | $15,000/mo | Briefing Modal | ✅ Working |
| Sovereign | $25,000/mo | Briefing Modal | ✅ Working |
| Custom | Contact | Telegram + Email | ✅ Working |
| Bitcoin (BTC) | Any | Crypto | ⚠️ Needs real wallet address |
| Monero (XMR) | Any | Crypto | ⚠️ Needs real wallet address |

### Stripe Integration

- **Publishable Key:** `pk_live_51TG0cIASsTLq...` (set in index.html)
- **DEPLOY_TOKEN:** Set as GitHub Actions secret ✅
- **Stripe Payment Links needed:**
  - [ ] Sentinel $499/mo CAD → `buy.stripe.com/???`
  - [ ] Guardian $2,499/mo CAD → `buy.stripe.com/???`
  - [ ] Warden $5,000/mo CAD → `buy.stripe.com/???`
  - [ ] Protector $10,000/mo CAD → `buy.stripe.com/???`

### Crypto Wallets Needed

- [ ] BTC address → replace in index.html, pricing.html, vpn.html
- [ ] XMR address → replace in index.html, pricing.html, vpn.html

---

## Domain Registry

| Domain | Registrar | Status | Points To |
|--------|-----------|--------|-----------|
| omniaguard.com | Porkbun | ✅ Live | GitHub Pages (franciscoderek7/omniaguard) |
| ccldr.net | Porkbun | ⚠️ DNS pending | TBD |
| soulstack.ai | — | ❌ NOT REGISTERED | Register at Cloudflare — $80/yr |
| ghostforge.ai | — | Available | Optional |
| nexself.ai | — | Available | Optional |

---

## Pending Actions Queue

### CRITICAL (Revenue-Blocking)

- [ ] **Stripe Payment Links** — create 4 recurring links in dashboard.stripe.com, paste URLs to Claude
- [ ] **BTC wallet address** — provide real address to replace placeholder
- [ ] **XMR wallet address** — provide real address to replace placeholder

### HIGH PRIORITY

- [ ] **Register soulstack.ai** — Cloudflare, $80/yr — available now
- [ ] **GitHub Pages config on omniaguard** — verify custom domain + HTTPS enforced
- [ ] **Porkbun DNS for ccldr.net** — run `python3 setup/dns_only.py ccldr.net` locally with PORKBUN_SECRET_KEY
- [ ] **Kiaros site rebuild** — needs Cyan #00D4FF + Black + Gold, 3 tiers: Core (free) / Pro ($49/mo) / Enterprise ($199/mo)

### PLANNED

- [ ] **SoulStack site** — build after domain registered
- [ ] **Francisco Holdings site** — holding company presence
- [ ] **Telegram bot @OmniguardSec_bot** — configure to respond to crypto payment confirmations
- [ ] **Stripe webhooks** — requires backend (not possible on static GitHub Pages — needs serverless function)

---

## Tech Stack Reference

| Component | Technology |
|-----------|-----------|
| Hosting | GitHub Pages (static) |
| Deploy pipeline | GitHub Actions (`deploy-omniaguard.yml`) |
| DNS | Porkbun API |
| Payments | Stripe Payment Links (static) + crypto mailto fallback |
| Domain repo | franciscoderek7/primedoxai-deploy |
| Deploy token | DEPLOY_TOKEN secret in primedoxai-deploy repo settings |

---

## Authority Chain

```
PrimeDox (Derek Francisco)  — ABSOLUTE
PrimeDocs                   — Override/backup
SoulStack                   — Observer/watchdog
OmniaGuard                  — Security layer
Claude                      — Builder/executor
```

---

## Security Rules (Permanent)

1. NEVER commit Stripe secret keys (`sk_live_` or `sk_test_`)
2. NEVER hardcode Porkbun Secret Key — use `os.environ.get()`
3. NEVER expose personal info on OmniaGuard, Kiaros, or SoulStack sites
4. ZERO cannabis bleed on AI/tech sites
5. ZERO AI tech disclosure on cannabis sites
6. OmniaGuard spelling: O-M-N-I-A-G-U-A-R-D — zero tolerance for variants

---

*This document is the source of truth for the Francisco Holdings empire. Update it after every deployment, domain registration, payment integration, or architecture change.*
