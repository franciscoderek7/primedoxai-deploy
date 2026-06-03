# EMPIRE HUB — ARCHITECTURE DECISION
# Francisco Holdings Inc. | Lead Architect: PrimeDox AI
# Decision Date: 2026-06-03

---

## DECISION: OPTION C — HYBRID (CHOSEN)

**Empire Hub parent platform + 10 specialized Guilds per vertical.**

### Why not A (One Mega-Platform)?
Single monolith serves everyone → serves no one well. A cannabis compliance user and a defense contractor have zero overlap. One feed becomes noise. Brand dilution.

### Why not B (10 Separate Verticals)?
Too fragmented. 10 separate login systems, 10 billing flows, 10 support teams. No network effects. Loses the "41 companies, one empire" power.

### Why C wins:
- **One login** — user joins Empire Hub, gets all 10 Guilds
- **Network effects** — content and intelligence flow across guilds (ShieldMind protects ALL 10)
- **Brand amplification** — every Guild carries "A Francisco Holdings Inc. Platform" + "Powered by PrimeDox AI"
- **Revenue multiplication** — sell access at Empire Hub level (Pro $29/mo → Sovereign $199/mo) + Guild-specific upsells
- **Stealth compliance** — no founder name on any guild; corporate + AI moderator voice throughout
- **Scalable** — add Guild #11 by copying guild-template.html and editing 10 config lines

---

## PLATFORM ARCHITECTURE

```
EMPIRE HUB (Parent)
├── Auth Layer (single login, all guilds)
├── Payment Layer (Stripe + Interac + PayPal + Crypto)
├── AI Layer (PrimeDox API → 14 Heroes)
├── Security Layer (OmniaGuard SDK)
└── 10 GUILDS
    ├── CyberGuard Guild    → OmniaGuard        → ShieldMind
    ├── HealthSwarm Guild   → Health Swarm       → MediMind
    ├── LegalDefense Guild  → CCLDR/Weedlaw      → LexMind + CannaMind
    ├── CleanOps Guild      → CleanSwarm         → SwarmMind
    ├── FinancePro Guild    → Fintech/FH/Vent.   → FinMind
    ├── AeroDefense Guild   → Aero Shield/Def.   → AeroMind + ShieldMind
    ├── QuantumBio Guild    → Quantum/Biotech/Sp → QubitMind + GenMind
    ├── AutoLogistics Guild → Auto/Logistics     → DriveMind + FlowMind
    ├── EnergyGreen Guild   → Energy/CleanTech   → VoltMind
    └── DataSov Guild       → Sov.Data/AI Gov.   → GhostMind
```

---

## GUILD-TO-COMPANY MAPPING

| Guild | Companies | AI Moderator | Primary Revenue |
|---|---|---|---|
| CyberGuard | OmniaGuard, Omnia Shield | ShieldMind | $499–$99,999/mo |
| HealthSwarm | Health Swarm, PrimeDox Health | MediMind | $999–$9,999/mo |
| LegalDefense | CCLDR, Cannabis Compliance Canada, CCC, Global Cannabis Alliance, Weedlaw Defense, BENO-X, Weedlaw Education, Weedlaw Publishing, Weedlaw Trinity, Doc Weedlaw Media, Constitutional Defense Labs | LexMind + CannaMind | $149–$1,499/mo |
| CleanOps | CleanSwarm, CleanTech Automation | SwarmMind | $399–$2,499/mo |
| FinancePro | Fintech Swarm, Francisco Holdings, Francisco Ventures, Francisco Family Office, SupplyChain Pro | FinMind | $999–$9,999/mo |
| AeroDefense | Aero Shield, Defense Swarm | AeroMind + ShieldMind | $4,999–$49,999/mo |
| QuantumBio | Quantum Swarm, Biotech Swarm, Space Swarm | QubitMind + GenMind | $2,999–$14,999/mo |
| AutoLogistics | Auto Swarm, Logistics Swarm | DriveMind + FlowMind | $999–$4,999/mo |
| EnergyGreen | Energy Swarm, CleanTech | VoltMind | $799–$3,999/mo |
| DataSov | Sovereignty Data Systems, AI Governance Canada, Lindsay Innovation Hub, Agent Swarm Tech | GhostMind | $299–$9,999/mo |

---

## STEALTH MODE — FOUNDER INVISIBILITY PROTOCOL

**WHAT IS REMOVED from all sites:**
- "Derek Francisco, CEO & Founder" → removed from all except Francisco Holdings Inc.
- "Doc Weedlaw" → removed from non-cannabis sites (keep ONLY on CCLDR, CCC, Weedlaw Education, Doc Weedlaw Media, Weedlaw Defense)
- Personal headshots → none except Francisco Holdings Inc. (Leadership page)
- "I built this" / "My vision" → replace with "The empire built" / "The platform's mission"

**WHAT STAYS:**
- "Francisco Holdings Inc." as parent — visible in ALL footers
- "A Francisco Holdings Inc. Company" — standard footer on all 41 sites
- "Powered by PrimeDox AI" — all sites
- "Protected by OmniaGuard" — all sites

**ANONYMOUS AUTHORITY VOICE:**
> "Built by the empire. Backed by 20 years of litigation. Secured by 14 AI Heroes."
> "41 Companies. One Vision. Zero Compromise."

**EXCEPTION LIST (Derek/Doc Weedlaw ALLOWED):**
- Francisco Holdings Inc. (derek@franciscoholdings.com, Leadership page)
- Doc Weedlaw Media (brand = Doc Weedlaw)
- CCLDR Academy (Doc Weedlaw is the educational brand)
- Weedlaw Education, Weedlaw Publishing, Weedlaw Defense, Weedlaw Trinity (brand context)
- PrimeDox AI hero section quote: anonymous ("built by a mind that gets humbled daily") ✓

---

## EMPIRE HUB PRICING TIERS

| Tier | Price | Access | Revenue/1000 users |
|---|---|---|---|
| Empire Free | $0/mo | 1 Guild, basic chat, AI support | $0 (funnel) |
| Empire Pro | $29/mo | All 10 Guilds, video, jobs, events | $29,000 MRR |
| Empire Sovereign | $199/mo | Full platform, analytics, API, white-label | $199,000 MRR |

**Revenue path:** 1,000 Pro users = $29K MRR. 500 Sovereign = $99.5K MRR. Both = $128.5K MRR from Empire Hub alone, before any Guild-specific upsells.

---

## DEPLOYMENT SEQUENCE (8 AM Revenue Path)

### Phase 1: Static HTML (NOW — tonight)
- [x] empire-hub-site/index.html — landing page
- [x] empire-hub-site/guild-template.html — reusable Guild template
- [ ] Create empire-hub-site/guilds/ directory, copy 10 guild instances
- [ ] Update each guild's GUILD_CONFIG (10 min per guild = 100 min total)

### Phase 2: GitHub Pages (1 hour)
- [ ] Push to GitHub
- [ ] Enable Pages on: empire-hub-site, plus all existing 41 sites
- [ ] Verify DNS for custom domains (see PORKBUN-DOMAINS.md)

### Phase 3: Stripe (2 hours)
- [ ] Create Empire Hub Pro ($29/mo) and Sovereign ($199/mo) Payment Links
- [ ] Replace PASTE_STRIPE_LINK_HERE_EMPIREHUB_PRO and _SOVEREIGN in all guild files
- [ ] Test with card 4242 4242 4242 4242

### Phase 4: Go Live (8 AM)
- [ ] Announce on all social channels
- [ ] Send to warm contacts: "Empire Hub is live — your single login to 41 companies"
- [ ] Target: 10 Pro signups Day 1 = $290 Day 1 MRR

---

## FUTURE PHASES (Post-Launch)

| Phase | Feature | Stack | Timeline |
|---|---|---|---|
| 2.0 | Real auth (email/password) | Supabase Auth | Week 2 |
| 2.1 | Real-time chat | Supabase Realtime | Week 3 |
| 2.2 | Video hosting | Cloudflare Stream | Week 4 |
| 3.0 | Mobile app | React Native + Expo | Month 2 |
| 3.1 | PrimeDox API integration | REST → 14 heroes | Month 2 |
| 4.0 | Full analytics dashboard | Supabase + Recharts | Month 3 |

---

*Francisco Holdings Inc. | Empire Hub Architecture v1 | 2026-06-03*
*Architect: PrimeDox AI | Security: OmniaGuard | Framework: BENO-X*
