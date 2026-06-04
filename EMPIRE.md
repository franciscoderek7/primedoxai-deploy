# EMPIRE.md — Francisco Holdings Master State Document
# Last Updated: 2026-06-04
# Authority: PrimeDox (Derek Francisco) — Human Final Authority
# Override: PrimeDocs — Activated only by PrimeDox explicit instruction

---

## 1. HOLDING STRUCTURE

| Entity | Role | Status | Domain | Repo |
|--------|------|--------|--------|------|
| Francisco Holdings Inc. | Parent holding company | ACTIVE | — | — |
| CleanSwarm | SaaS for cleaning businesses | LIVE | cleanswarm.ca | GitHub |
| CCLDR.net | Cannabis defense education | LIVE | ccldr.net | GitHub |
| CCC.net | Cannabis compliance/consulting | LIVE | ccc.net | GitHub |
| OmniaGuard | AI security / agent protection | LIVE | omniaguard.com | GitHub |
| Kiaros | AI consulting | LIVE | kiaros.ai | GitHub |
| Weedlaw Education | Doc Weedlaw educational platform | LIVE | weedlaw-education | GitHub |
| PrimeDox AI | Derek's AI persona/clone | LIVE | primedoxai-deploy | GitHub |
| Tech Pack Cage | Registered business (Stripe acct) | ACTIVE | — | — |
| SoulStack.ai | AI infrastructure layer | PENDING | soulstack.ai | PENDING |
| [RESERVED] 11 additional entities | TBD | PLANNED | — | — |

**Target: 22 companies by Year 1, 392 by Year 4**

---

## 2. SITE DEPLOYMENT TRACKER

| Site | Market | Status | URL | Last Deploy |
|------|--------|--------|-----|-------------|
| OmniaGuard | AI Security | LIVE | omniaguard.com | 2026-06-04 |
| CCLDR.net | Cannabis Education | LIVE | ccldr.net | 2026-04-15 |
| CCC.net | Cannabis Compliance | LIVE | ccc.net | 2026-04-15 |
| Weedlaw Education | Doc Weedlaw Platform | LIVE | weedlaw-education | 2026-05-31 |
| PrimeDox AI | AI Persona | LIVE | primedoxai-deploy | 2026-06-04 |
| Kiaros | AI Consulting | LIVE | kiaros.ai | 2026-06-03 |
| CleanSwarm | Cleaning SaaS | LIVE | cleanswarm.ca | 2026-06-01 |
| space-swarm-site | Space Ops AI | BUILT — PENDING DEPLOY | GitHub Pages | 2026-06-03 |
| auto-swarm-site | AV Intelligence | BUILT — PENDING DEPLOY | GitHub Pages | 2026-06-03 |
| quantum-swarm-site | Quantum AI | BUILT — PENDING DEPLOY | GitHub Pages | 2026-06-03 |
| biotech-swarm-site | Drug Discovery AI | BUILT — PENDING DEPLOY | GitHub Pages | 2026-06-03 |
| health-swarm-site | Clinical AI | BUILT — PENDING DEPLOY | GitHub Pages | 2026-06-03 |
| fintech-swarm-site | Payment AI | BUILT — PENDING DEPLOY | GitHub Pages | 2026-06-03 |
| energy-swarm-site | Renewables AI | BUILT — PENDING DEPLOY | GitHub Pages | 2026-06-03 |
| logistics-swarm-site | Supply Chain AI | BUILT — PENDING DEPLOY | GitHub Pages | 2026-06-03 |

---

## 3. REVENUE TARGETS

| Year | Target | Status |
|------|--------|--------|
| Year 1 | $696K ARR | IN PROGRESS |
| Year 2 | $4.2M ARR | PLANNED |
| Year 3 | $42M ARR | PLANNED |
| Year 4 | $400M+ ARR | PLANNED |

---

## 4. WALLET / PAYMENT PLACEHOLDERS

| Item | Cost | Status | Priority |
|------|------|--------|----------|
| SoulStack.ai domain (Cloudflare) | ~$80 CAD/yr | PENDING | HIGH |
| Stripe Payment Link — Sentinel $499/mo | $0 (create in dashboard) | PENDING | CRITICAL |
| Stripe Payment Link — Guardian $2,499/mo | $0 (create in dashboard) | PENDING | CRITICAL |
| Stripe Payment Link — Warden $5,000/mo | $0 (create in dashboard) | PENDING | CRITICAL |
| Stripe Payment Link — Protector $10,000/mo | $0 (create in dashboard) | PENDING | CRITICAL |
| BTC wallet address | — | PENDING | HIGH |
| XMR wallet address | — | PENDING | HIGH |
| Additional .ai domains (TBD) | Variable | PENDING | MEDIUM |
| Supabase billing | ~$45/mo | PENDING | MEDIUM |
| GitHub Pro/Teams | $0 (free tier) | ACTIVE | LOW |

---

## 5. PENDING ACTIONS QUEUE

| # | Action | Assigned To | Due | Status |
|---|--------|-------------|-----|--------|
| 1 | ~~Fix OmniaGuard spelling on omniaguard.com~~ | Claude | DONE | ✅ COMPLETE |
| 2 | Stripe Payment Links (4 tiers) | Derek → Claude | ASAP | IN PROGRESS — awaiting URLs |
| 3 | BTC + XMR wallet addresses on site | Derek → Claude | ASAP | PENDING — awaiting addresses |
| 4 | SoulStack.ai domain registration | Derek | When funded | PENDING |
| 5 | Deploy 8 swarm sites from PR#2 | Claude | 2026-06-04 | PENDING — checking PR#2 |
| 6 | FOI requests (6 provincial + medical + CRU + Ombudsman) | Derek | ASAP | PENDING |
| 7 | BDC investor contact follow-up | Derek | 2026-06-05 | PENDING |
| 8 | Kiaros site rebuild (Cyan #00D4FF + Black + Gold) | Claude | TBD | PENDING |
| 9 | Porkbun DNS for ccldr.net | Derek (local) | TBD | PENDING |
| 10 | GitHub Pages config — omniaguard custom domain + HTTPS | Derek (browser) | ASAP | PENDING |

---

## 6. AUTHORITY CHAIN

```
PrimeDox (Derek Francisco)     — HUMAN FINAL AUTHORITY — absolute
    ↓
PrimeDocs                      — Override/backup AI — activated by PrimeDox only
    ↓
SoulStack                      — Observer layer — watches empire, flags, reports up
    ↓
OmniaGuard                     — Security layer — guards all sites + agents
    ↓
Claude                         — Builder/executor — acts on direct PrimeDox order only
```

---

## 7. SECURITY RULES (PERMANENT)

1. NEVER commit Stripe secret keys (`sk_live_` or `sk_test_`)
2. NEVER hardcode Porkbun Secret Key — use `os.environ.get()`
3. NEVER expose personal info (phone/address/email) on OmniaGuard, Kiaros, SoulStack
4. ZERO cannabis bleed on AI/tech sites
5. ZERO AI tech disclosure on cannabis/legal sites
6. OmniaGuard spelling: O-M-N-I-A-G-U-A-R-D — zero tolerance for variants
7. Derek Francisco INVISIBLE on: OmniaGuard, Kiaros, SoulStack
8. Derek Francisco VISIBLE on: CCLDR, Doc Weedlaw, Francisco Holdings

---

## 8. STRIPE INTEGRATION STATUS

- **Publishable Key:** `pk_live_51TG0cIASsTLq...` — set in omniaguard/index.html ✅
- **DEPLOY_TOKEN:** Set as GitHub Actions secret ✅
- **Payment Links needed (create at dashboard.stripe.com → Payment Links):**
  - [ ] Sentinel — $499/mo CAD recurring → paste `buy.stripe.com/xxx` to Claude
  - [ ] Guardian — $2,499/mo CAD recurring → paste `buy.stripe.com/xxx` to Claude
  - [ ] Warden — $5,000/mo CAD recurring → paste `buy.stripe.com/xxx` to Claude
  - [ ] Protector — $10,000/mo CAD recurring → paste `buy.stripe.com/xxx` to Claude

---

*Update this document after every deployment, domain registration, payment integration, or architecture change.*
*Source of truth for the Francisco Holdings empire.*
