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
| space-swarm-site | Space Ops AI | LIVE | GitHub Pages | 2026-06-03 |
| auto-swarm-site | AV Intelligence | LIVE | GitHub Pages | 2026-06-03 |
| quantum-swarm-site | Quantum AI | LIVE | GitHub Pages | 2026-06-03 |
| biotech-swarm-site | Drug Discovery AI | LIVE | GitHub Pages | 2026-06-03 |
| health-swarm-site | Clinical AI | LIVE | GitHub Pages | 2026-06-03 |
| fintech-swarm-site | Payment AI | LIVE | GitHub Pages | 2026-06-03 |
| energy-swarm-site | Renewables AI | LIVE | GitHub Pages | 2026-06-03 |
| logistics-swarm-site | Supply Chain AI | LIVE | GitHub Pages | 2026-06-03 |

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

*Updated: 2026-06-05 | Session: Francisco Revenue Sprint | Builder: Claude*
*Source of truth for the Francisco Holdings empire. Update after every deployment.*
