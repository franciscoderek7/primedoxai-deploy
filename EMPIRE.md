# EMPIRE.md — Francisco Holdings Master State Document
# Last Updated: 2026-06-07
# Authority: PrimeDox (Derek Francisco) — Human Final Authority
# Override: PrimeDocs — Activated only by PrimeDox explicit instruction

---

## 1. HOLDING STRUCTURE

| Entity | Role | Loop | Status | Domain | Repo |
|--------|------|------|--------|--------|------|
| Francisco Holdings Inc. | Parent holding company | A | ACTIVE | franciscoholdingsinc.com | franciscoderek7/francisco-holdings |
| CleanSwarm | SaaS for cleaning businesses | B | LIVE | cleanswarm.ca | franciscoderek7/cleanswarm |
| CCLDR.net | Cannabis defense education | A | LIVE | ccldr.net | franciscoderek7/ccldr |
| CCC.net | Cannabis compliance/consulting | A | LIVE | ccc.net | GitHub |
| OmniaGuard | AI security / agent protection | B | LIVE | omniaguard.com | franciscoderek7/omniaguard |
| Kiaros | AI consulting | B | LIVE | kiaros.ai | GitHub |
| Weedlaw Education | Doc Weedlaw educational platform | A | LIVE | weedlaw-education | GitHub |
| PrimeDox AI | Derek's AI persona/clone | A | LIVE | primedoxai.com | franciscoderek7/primedox |
| ZPrimeDoxAI HQ | Private command center | A | LIVE | zprimedoxaihq.com | franciscoderek7/zprimedoxaihq |
| Vault Velocity Auto | Auto AI (pending scope) | B | PENDING | vaultvelocityauto.com | franciscoderek7/vaultvelocityauto |
| Tech Pack Cage | Registered business (Stripe acct) | B | ACTIVE | — | — |
| SoulStack.ai | AI infrastructure layer | B | PENDING | soulstack.ai | PENDING |
| [RESERVED] 9 additional entities | TBD | — | PLANNED | — | — |

**Target: 22 companies by Year 1, 392 by Year 4**

### Porkbun Registered Domains (Confirmed)
| Domain | Brand | Loop | DNS Status |
|--------|-------|------|-----------|
| omniaguard.ca | OmniaGuard | B | ⬜ Set 301 → omniaguard.com |
| omniaguard.com | OmniaGuard | B | ⬜ Set A+CNAME (see docs/porkbun-dns-setup.md) |
| omniaguard.io | OmniaGuard | B | ⬜ Set 301 → omniaguard.com |
| omniaguard.pro | OmniaGuard | B | ⬜ Set 301 → omniaguard.com |
| omniaguard.tech | OmniaGuard | B | ⬜ Set 301 → omniaguard.com |
| franciscoholdingsinc.com | Francisco Holdings | A | ⬜ Set A+CNAME |
| franciscoholdingsinc.ca | Francisco Holdings | A | ⬜ Set 301 → .com |
| franciscoholdingsinc.buzz | Francisco Holdings | A | ⬜ Set 301 → .com |
| vaultvelocityauto.com | Vault Velocity Auto | B | ⬜ Set A+CNAME (when site ready) |
| zprimedoxaihq.com | ZPrimeDoxAI HQ | A | ⬜ Set A+CNAME |

---

## 2. SITE DEPLOYMENT TRACKER

| Site | Market | Loop | Status | Deploy Workflow | Domain | Last Deploy |
|------|--------|------|--------|----------------|--------|-------------|
| OmniaGuard | AI Security | B | LIVE | deploy-omniaguard.yml | omniaguard.com | 2026-06-04 |
| CCLDR.net | Cannabis Education | A | LIVE → REDEPLOY READY | deploy-ccldr.yml | ccldr.net | 2026-06-07 |
| CCC.net | Cannabis Compliance | A | LIVE | — | ccc.net | 2026-04-15 |
| Weedlaw Education | Doc Weedlaw Platform | A | LIVE | — | weedlaw-education | 2026-05-31 |
| PrimeDox AI | AI Persona | A | LIVE → REDEPLOY READY | deploy-primedox.yml | primedoxai.com | 2026-06-07 |
| Kiaros | AI Consulting | B | LIVE | kiaros-deploy.yml | kiaros.ai | 2026-06-03 |
| CleanSwarm | Cleaning SaaS | B | LIVE → REDEPLOY READY | deploy-cleanswarm.yml | cleanswarm.ca | 2026-06-07 |
| Francisco Holdings | Parent Holding Co | A | LIVE → REDEPLOY READY | deploy-francisco-holdings.yml | franciscoholdingsinc.com | 2026-06-07 |
| ZPrimeDoxAI HQ | Private Command Center | A | LIVE → REDEPLOY READY | deploy-zprimedoxaihq.yml | zprimedoxaihq.com | 2026-06-07 |
| Vault Velocity Auto | Auto AI | B | PENDING SCOPE | — | vaultvelocityauto.com | — |
| space-swarm-site | Space Ops AI | B | LIVE | — | GitHub Pages | 2026-06-03 |
| auto-swarm-site | AV Intelligence | B | LIVE | — | GitHub Pages | 2026-06-03 |
| quantum-swarm-site | Quantum AI | B | LIVE | — | GitHub Pages | 2026-06-03 |
| biotech-swarm-site | Drug Discovery AI | B | LIVE | — | GitHub Pages | 2026-06-03 |
| health-swarm-site | Clinical AI | B | LIVE | — | GitHub Pages | 2026-06-03 |
| fintech-swarm-site | Payment AI | B | LIVE | — | GitHub Pages | 2026-06-03 |
| energy-swarm-site | Renewables AI | B | LIVE | — | GitHub Pages | 2026-06-03 |
| logistics-swarm-site | Supply Chain AI | B | LIVE | — | GitHub Pages | 2026-06-03 |

**Deploy workflows in `.github/workflows/` — all trigger on `main` push to their respective `paths:`**

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
| 9 | Porkbun DNS for all domains | Derek (browser) | ASAP | PENDING — see docs/porkbun-dns-setup.md |
| 10 | GitHub Pages config — custom domains + HTTPS | Derek (browser) | ASAP | PENDING — 5 new repos needed |
| 11 | Merge feature branch → main to trigger all 5 deploy workflows | Derek | ASAP | PENDING — Claude built workflows |
| 12 | Create GitHub repos (ccldr, primedox, cleanswarm, francisco-holdings, zprimedoxaihq) | Derek | Before merge | PENDING |
| 13 | Legal: Affidavit of Service + Default Judgment motion + CPL | Derek | **JUNE 9 CRITICAL** | PENDING — docs ready in legal-filings/ |
| 14 | Super Highway Phase 2: Provision 3 Supabase projects | Derek | When ready | PENDING |
| 15 | Stripe payment links (12 products across OmniaGuard/CCLDR/CleanSwarm) | Derek | ASAP | PENDING |
| 16 | Vault Velocity Auto — confirm scope/positioning | Derek | TBD | PENDING — domain registered |

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
  - [ ] CCLDR Warrior — $149/mo → paste to Claude
  - [ ] CCLDR Professional — $499/mo → paste to Claude
  - [ ] CCLDR Elite — $999/mo → paste to Claude
  - [ ] CCLDR Sovereign — $1,499/mo → paste to Claude
  - [ ] CCC Grow — $99/mo → paste to Claude
  - [ ] CCC Harvest — $299/mo → paste to Claude
  - [ ] CCC Empire — $999/mo → paste to Claude
  - [ ] CleanSwarm Worker — $500/mo → paste to Claude

---

## 9. JUNE 5, 2026 BUILD SESSION — COMPLETED

### CCLDR Virtual Courthouse (ALL 8 ROOMS BUILT ✅)
| File | Room | Tier Required | Status |
|------|------|--------------|--------|
| lobby.html | Hub/Navigation | Free | ✅ Committed |
| courtroom.html | Active Cases | Free | ✅ Committed |
| practice-courtroom.html | AI Trial Simulator | Free (3 trials) | ✅ Committed |
| library.html | Case Law Library | Free | ✅ Committed |
| clerks-office.html | Filing Guide | Free | ✅ Committed |
| classroom.html | Course Modules | Warrior+ | ✅ Committed |
| judges-chambers.html | AI Justices | Professional+ | ✅ Committed |
| boardroom.html | Case Strategy | Professional+ | ✅ Committed |
| records-room.html | Document Templates | Elite+ | ✅ Committed |

### CCLDR Francisco Protocol (ALL 5 SITES BUILT ✅)
| File | Description | Status |
|------|-------------|--------|
| constitution.html | 7-Article WeedLaw Constitution | ✅ Committed |
| justices.html | 7 AI Justices + Deliberation Simulator | ✅ Committed |
| blockchain-court.html | Docket Explorer + Hash Verifier | ✅ Committed |
| dao.html | People's Jury + JUSTICE Token System | ✅ Committed |
| treaty.html | Global Cannabis Treaty + Country Tracker | ✅ Committed |

### OmniaGuard Robot Fix (LIVE ✅)
- Hero: robot-350.jpg (silver, 60vh, centered floating) — DEPLOYED
- Defense Force: text moved BELOW images — zero overlay — DEPLOYED
- "INJECTION" → "INTERCEPTION" in agent card branding — DEPLOYED
- Push: franciscoderek7/omniaguard main branch ✅

### CleanSwarm v2.0 Rebuild
| File | Status |
|------|--------|
| index.html | ✅ Rebuilt |
| workers.html | ✅ Built |
| customers.html | ✅ Built |
| pricing.html | ✅ Built |

### CCC v2.0 Rebuild
| File | Status |
|------|--------|
| index.html | ✅ Rebuilt — 22 AI agents, 4 Farm Stacks |
| about.html | 🔄 Building |
| pricing.html | 🔄 Building |
| contact.html | 🔄 Building |
| weddings.html | 🔄 Building |
| church.html | 🔄 Building |

### Email Signatures
- 9 business signatures with copy-to-clipboard — ✅ Committed
- File: email-signatures/signatures.html

### OmniaGuard PWA
| File | Status |
|------|--------|
| manifest.json | 🔄 Building |
| service-worker.js | 🔄 Building |
| app.js | 🔄 Building |
| threat-dashboard.html | 🔄 Building |
| primedox-portal.html | 🔄 Building |
| install-guide.html | 🔄 Building |
| offline.html | 🔄 Building |
| security-sdk-roadmap.html | 🔄 Building |

---

## 10. ACTIVE LEGAL CASES — TRACK URGENTLY

| Case | Amount | Status | Next Date | Priority |
|------|--------|--------|-----------|---------|
| Francisco v. AG Canada | $35,000,000 | Active investigation | TBD | 🟡 HIGH |
| Francisco v. Denby | $3,300,000 | Default judgment + New claim | **JUNE 17, 2026** | 🔴 CRITICAL |

**Court docs filled:** statement-of-claim.txt, sheriff-instruction-letter.txt, form-31A.txt, certificate-pending-litigation.txt, writ-seizure-sale.txt
**Still needed:** Defendant names, specific facts, lawyer review before June 17

---

## 11. DOMAINS TO REGISTER (Derek Action Required)

| Domain | Business | Registrar | Est. Cost/Year |
|--------|---------|----------|----------------|
| cleanswarm.ca | CleanSwarm | Porkbun | ~$15 CAD |
| canadiancannabisconsulting.com | CCC | Porkbun | ~$12 USD |
| zprimedoxai.com | ZPrimeDoxAI | Porkbun | ~$12 USD |
| franciscoholdings.com | FHI | Porkbun | ~$12 USD |
| soulstack.ai | SoulStack | Cloudflare | ~$80 USD |
| techpetcage.com | TechPetCage | Porkbun | ~$12 USD |
| vaultvelocityauto.com | VaultVelocityAuto | Porkbun | ~$12 USD |

---

---

## 12. JUNE 7, 2026 BUILD SESSION — COMPLETED

### Deploy Workflows Built ✅
| Workflow | Target Domain | Target Repo | Guard |
|----------|-------------|-------------|-------|
| deploy-ccldr.yml | ccldr.net | franciscoderek7/ccldr | Loop A — no Loop B bleed |
| deploy-primedox.yml | primedoxai.com | franciscoderek7/primedox | Loop A — no cannabis bleed |
| deploy-cleanswarm.yml | cleanswarm.ca | franciscoderek7/cleanswarm | Loop B — no Derek, no cannabis |
| deploy-francisco-holdings.yml | franciscoholdingsinc.com | franciscoderek7/francisco-holdings | Loop A — parent co |
| deploy-zprimedoxaihq.yml | zprimedoxaihq.com | franciscoderek7/zprimedoxaihq | Private HQ — no server secrets |

### ZPrimeDoxAI HQ (Private Command Center) ✅
- File: zprimedoxaihq-site/index.html
- Lock screen with JS access code (FHI2026 — editable in source)
- 6 views: Dashboard, Action Queue, Legal Tracker, Loop A, Loop B, Domain Vault
- All 10 Porkbun domains listed with expiry dates
- Links: financial-dashboard, deal-room, GitHub, Supabase, Stripe, Porkbun

### DNS Setup Guide ✅
- File: docs/porkbun-dns-setup.md
- Per-domain A + CNAME records
- 301 redirect instructions for .ca/.io/.pro/.tech variants
- GitHub Pages repo creation + HTTPS enforcement checklist

### Derek Action Required to Go Live:
1. Create 5 GitHub repos (ccldr, primedox, cleanswarm, francisco-holdings, zprimedoxaihq)
2. Enable GitHub Pages on each repo (branch: main, root: /)
3. Merge `claude/francisco-revenue-sprint-MEva6` → `main` to trigger all workflows
4. Set DNS in Porkbun per docs/porkbun-dns-setup.md
5. After DNS propagation: enable "Enforce HTTPS" in each GitHub Pages Settings

---

## 13. JUNE 8, 2026 BUILD SESSION — 9-PHASE REVENUE SPRINT COMPLETE

### Phase Status
| Phase | Description | Files | Status |
|-------|-------------|-------|--------|
| 1 | OmniaGuard spelling audit + cannabis check | — | ✅ CLEAN |
| 2 | OmniaGuard Shield Network + lead capture | omniaguard-site/shield-network.html, assessment.html | ✅ COMMITTED |
| 3 | CCLDR Warrior Network + all 4 pricing tiers | ccldr-site/warrior-network.html | ✅ COMMITTED |
| 4 | PrimeDox emergency defense page | primedoxai-site/get-help-now.html | ✅ COMMITTED |
| 5 | Francisco Holdings investor hub | francisco-holdings-site/investors.html | ✅ ALREADY LIVE |
| 6 | CleanSwarm pricing + per-job fees + payment CTAs | cleanswarm-checkout/pricing.html | ✅ COMMITTED |
| 7 | Weedlaw Education courses catalogue | ccldr-site/courses.html | ✅ COMMITTED |
| 8 | Email sequences — all 3 brands (5 emails each) | content-marketing/email-sequences/*.md | ✅ COMMITTED |
| 9 | Deploy (awaiting Derek: merge → main) | — | ⬜ PENDING DEREK ACTION |

### New Pages Summary
| Page | URL | Payment Method | Loop |
|------|-----|----------------|------|
| Shield Network | omniaguard.com/shield-network | contact@omniaguard.com | B |
| AI Assessment | omniaguard.com/assessment | contact@omniaguard.com | B |
| Warrior Network | ccldr.net/warrior-network | PayPal + Interac | A |
| Courses | ccldr.net/courses | PayPal + Interac | A |
| Emergency Defense | primedoxai.com/get-help-now | PayPal + Interac | A |
| CleanSwarm Pricing | cleanswarm.ca/pricing | Interac (Loop B) | B |

### Email Sequences Ready for Mailchimp/ConvertKit
| Sequence | FROM | Emails | CTA |
|----------|------|--------|-----|
| omniaguard-sequence.md | security@omniaguard.com | 5 (Day 0/1/3/7/14) | contact@omniaguard.com |
| ccldr-sequence.md | derek@ccldr.net | 5 (Day 0/1/3/7/14) | PayPal + Interac |
| primedox-sequence.md | derek@primedoxai.com | 5 (Day 0/1/3/7/14) | PayPal + Interac |

### Pending Actions Added
| # | Action | Owner | Status |
|---|--------|-------|--------|
| 17 | Load email sequences into Mailchimp or ConvertKit | Derek | PENDING |
| 18 | Connect assessment/warrior-network forms to email automation | Derek | PENDING |
| 19 | Deploy Phase 9: merge feature branch → main | Derek | PENDING |

---

---

## 14. JUNE 11, 2026 BUILD SESSION — MONETIZATION ACCELERATION + TECHPACKCAGE COMPLETE

### Session Overview
Full revenue acceleration sprint: VIGILAX commercial site, MindShift shop, urgency banners, email capture, court print package, CCLDR case tracker, and complete TechPackCage.com launch stack.

### VIGILAX — 4-Page Commercial Site ✅
| File | Description | Status |
|------|-------------|--------|
| vigilax-site/index.html | Landing page (hero + terminal + SVG architecture diagram + testimonials + email capture) | ✅ COMMITTED |
| vigilax-site/pricing.html | 4-tier pricing (Sentinel $299, Warden $899, Archon $2,499, Sovereign custom) + urgency banner | ✅ COMMITTED |
| vigilax-site/investor.html | Investor relations ($300B market, IP assets, Y1-Y5 projections, Derek Francisco team) | ✅ COMMITTED |
| vigilax-site/deploy.html | Purchase + 5-step deployment guide + 24hr SLA guarantee | ✅ COMMITTED |

**VIGILAX is Loop B: no Derek Francisco identity, no cannabis, no paypal.me/derekfrancisco**

### Monetization Additions ✅
| Site | Addition | Status |
|------|----------|--------|
| OmniaGuard pricing.html | Urgency banner (pulse dot) + VIGILAX upsell section + email capture | ✅ COMMITTED |
| Francisco Holdings services.html | Urgency banner (20% off Q2) + partner strip + social proof | ✅ COMMITTED |
| MindShift/Makayla index.html | Merchandise grid (4 items, PayPal.me links) + affiliate section + donations + newsletter | ✅ COMMITTED |

### Court Package — June 11, 2026 ✅
| File | Description | Status |
|------|-------------|--------|
| court-print-package-june11.html | Printable doc: priority list 1-11, Dylan's 5 affidavit questions, exhibits checklist, instructions, library email template, June 17 deadline note | ✅ COMMITTED |
| ccldr-site/denby-case.html | Public case tracker: timeline, criminal counts, civil demands, documents table | ✅ COMMITTED |

### TechPackCage.com — Full Launch Stack ✅
| File | Description | Status |
|------|-------------|--------|
| techpackcage-site/index.html | Full landing page — 15 categories, 8 product cards, Job Shipping section, email capture, social proof popup | ✅ COMMITTED |
| techpackcage-site/woocommerce-theme.css | Complete WooCommerce CSS — green/gold empire branding, all selectors, CSS variables | ✅ COMMITTED |
| techpackcage-site/warehouse-dashboard.html | Virtual warehouse — login gate (empire2026), order pipeline, revenue chart, supplier panel, inventory alerts, leaderboard | ✅ COMMITTED |
| techpackcage-site/setup-guide.html | WooCommerce launch guide — ~$148 CAD cost breakdown, 4-week plan, profit calculator, Job Shipping PHP, launch checklist | ✅ COMMITTED |
| .github/workflows/deploy-techpackcage.yml | Auto-deploy → franciscoderek7/techpackcage on push to main | ✅ COMMITTED |

### TechPackCage Derek Action Required
1. Buy domain `techpackcage.com` at Namecheap (~$10.98 CAD)
2. Buy Hostinger hosting (~$3.99/mo = $47.88/yr)
3. Install WordPress + WooCommerce (free)
4. Buy AliDropship plugin ($89 one-time) at alidropship.com
5. Paste `woocommerce-theme.css` into Appearance → Customize → Additional CSS
6. Create GitHub repo `franciscoderek7/techpackcage` (enables deploy workflow)
7. Set DNS: techpackcage.com A-record → GitHub Pages IP, CNAME www → techpackcage.github.io

### Stripe Placeholders — Need Real URLs (REVENUE BLOCKER)
| Placeholder | Product | Price |
|-------------|---------|-------|
| STRIPE_LINK_VIGILAX_SENTINEL | VIGILAX Sentinel | $299/mo |
| STRIPE_LINK_VIGILAX_WARDEN | VIGILAX Warden | $899/mo |
| STRIPE_LINK_VIGILAX_ARCHON | VIGILAX Archon | $2,499/mo |
| STRIPE_LINK_FH_STARTER | FH Agency Starter | TBD |
| STRIPE_LINK_FH_GROWTH | FH Agency Growth | TBD |
| STRIPE_LINK_FH_ENTERPRISE | FH Agency Enterprise | TBD |

→ Create at dashboard.stripe.com → Payment Links → paste `buy.stripe.com/xxx` to Claude

### Critical Dates
| Date | Event | Status |
|------|-------|--------|
| June 11, 2026 | Court appearance | Court package READY at court-print-package-june11.html |
| June 17, 2026 | CPL + Default Motion hearing | Dylan Affidavit needed — questions pending |

### Pending Actions Added
| # | Action | Owner | Status |
|---|--------|-------|--------|
| 20 | Paste real Stripe payment link URLs (6 placeholders) | Derek → Claude | PENDING — REVENUE BLOCKER |
| 21 | Dylan's 5 affidavit questions answers | Derek | PENDING — June 17 deadline |
| 22 | Create GitHub repo franciscoderek7/techpackcage | Derek | PENDING |
| 23 | TechPackCage domain + hosting purchase (~$148 CAD) | Derek | PENDING |
| 24 | Makayla real social handles (FB/LinkedIn/X/IG/PayPal) | Derek → Claude | PENDING |
| 25 | BTC + XMR wallet addresses for OmniaGuard | Derek → Claude | PENDING |
| 26 | Formspree ID for OmniaGuard contact.html | Derek → Claude | PENDING |
| 27 | First 10 Job Shipping drivers (Lindsay/Oshawa/Toronto) | Derek | PENDING |

---

*Updated: 2026-06-11 | Session: Francisco Revenue Sprint | Builder: Claude*
*Source of truth for the Francisco Holdings empire. Update after every deployment.*
