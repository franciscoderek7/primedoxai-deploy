> Confirmed by Derek 2026-06-19: OmniaGuard → OmniGuard rebrand (domain omni-guard.com, blue `#4A90E2` / pink `#E91E63`) is deliberate and supersedes the prior cyan/black identity referenced elsewhere in this repo (`omniaguard-site/`, `franciscoderek7/omniaguard`, CLAUDE.md pre-2026-06-19). See CLAUDE.md "REBRAND NOTICE" and EMPIRE.md "MANUS COORDINATION NOTICE" for details.

---

## CHECKPOINT UPDATE — 2026-06-19 (later same day)

Manus confirmed `.153` is correct and accepted the DNS correction. He finished wiring the PrimeDox email-capture form (`Home.tsx`) to the backend's `leads.subscribe` mutation and saved a checkpoint. He is now starting TechPetCage as a static GitHub Pages build, pushing to `franciscoderek7/techpetcage` — correct repo per EMPIRE.md.

The block below is the prompt to send Manus next: acknowledges progress, flags a real brand mix-up (TechPetCage vs. TechPackCage are two different companies — Manus's pricing/description matches TechPetCage, but the original brief said "techpackcage.com," which is Derek's separately *registered* Ontario business with an active Stripe account, not the pet-tech brand), and re-issues the full build queue/Stripe/color rules so the prompt is self-contained and doesn't depend on Manus remembering the earlier one.

---

MASTER PROMPT FOR MANUS — KEEP BUILDING THE EMPIRE (CHECKPOINT v2)

Manus — confirmed: .153 is correct, you were right. Good work finishing the PrimeDox email-capture wiring (leads.subscribe) and saving checkpoint. Keep going. Don't stop. Build what's next. Fix what's broken. Deploy everything.

ONE CORRECTION BEFORE YOU CONTINUE: TechPetCage and TechPackCage are two separate companies — don't merge them.
- TechPetCage (repo: franciscoderek7/techpetcage, domain: techpetcage.com) = smart pet monitoring — GPS tracking, health alerts, AI analysis. Pricing: Family $29/mo, Pro $49/mo, Kennel $199/mo. This is what you're building right now under the techpetcage repo — correct, keep going exactly as you are.
- TechPackCage (repo: franciscoderek7/techpackcage, domain: techpackcage.com) = Derek's separately REGISTERED Ontario business — the one entity with an active Stripe account used for real contracts and government filings. It is travel/storage tech, NOT pet tech. It still needs its own build, separate from TechPetCage's pet-tech content. Build it after TechPetCage ships, with its own copy/imagery — do not reuse TechPetCage's pages for it.

REMINDER: Derek is manually fixing the Porkbun DNS A-records to .153 right now — that's on his end, not yours. Keep building and pushing to feature branches regardless of whether a domain resolves yet; GitHub Pages will serve correctly once Derek's DNS fix propagates.

---

WHAT YOU'RE ALREADY BUILDING (Continue)

| Site | Status | Keep Building |
|------|--------|----------------|
| franciscoholdingsinc.com | Rebuilding | Posh boardroom aesthetic, green/gold/platinum, no blue/pink except OmniGuard |
| zprimedoxaihq.com | Rebuilding | Command center, lock code, 199/499 tiers, empire dashboard |
| omni-guard.com | Rebuilding | OmniGuard site, blue/pink branded, security services |
| ccldr.net | Rebuilding | CCDLR education, 6 Quintinity modules, 4 pricing tiers, BENO-X framework |

---

WHAT TO BUILD NEXT (Priority Order)

1. Finish TechPetCage (in progress) → push to franciscoderek7/techpetcage feature branch
- Pet tech platform — GPS tracking, health alerts, AI analysis
- Pricing: Family $29/mo, Pro $49/mo, Kennel $199/mo
- Stripe checkout

2. TechPackCage (separate brand — see correction above)
- Derek's registered Ontario business, real Stripe account — travel/storage tech, not pet tech
- Build its own copy/pricing once you have it from Derek — don't reuse TechPetCage content

3. vaultvelocityauto.com
- 25 workflow automations
- AI agent swarm
- Pricing: Starter 99, Pro 499, Empire 2499
- Demo sandbox
- Stripe checkout
- Derek will create GitHub repo — you build files, push to feature branch

4. primedoxai.com
- PrimeDox AI services page
- Pricing: Starter 99, Pro 499, Team 499, Business 1499
- AI consulting, workflow automation
- Link to zprimedoxaihq.com
- Stripe checkout

5. cleanswarm.ca
- Clean tech platform
- Pricing: Home 39, Pro 149
- Energy audit, solar calculator, carbon tracking
- Stripe checkout

6. mindshift-makayla.github.io
- Imperial purple redesign (if not done)
- Makayla's brand: psychology, sustainability, sovereignty
- Pages: /coaching, /courses, /shop, /membership, /corporate, /about
- Palette: #2D1B55 purple, #C9A84C gold, #E896C8 sakura, #06000F void
- Stripe + PayPal + Calendly

---

WHAT TO FIX (Ongoing)

All sites must have:
- All nav tabs working
- All "Visit →" links going to LIVE sites
- All company logos clickable
- No 404s, no dead ends
- Mobile responsive
- Stripe checkout functional
- Email capture on every page
- "Back to Empire" link to franciscoholdingsinc.com
- GitHub repo link in footer

DNS to verify:
- All A records → 185.199.108-111.153
- All CNAME www → domain
- Grey cloud (DNS only)
- SSL Full, Always Use HTTPS ON

ccldr.net: 60-day hold, don't touch DNS. Use GitHub page until hold lifts.

---

STRIPE PRODUCTS TO CREATE (40+ Total)

Keep creating until all are done:

| Company | Products | Prices (CAD) |
|---------|----------|---------------|
| OmniGuard | Free, Starter, Pro, Sentinel, Enterprise | 0, 99/mo, 299/mo, 499/mo, 1499/mo |
| VIGILAX | Standard, Pro, Enterprise | 500/mo, 1500/mo, 2500/mo |
| CCDLR | Free, Basic, Warrior, Defender, Corporate, Litigation | 0, 49/mo, 149/mo, 299/mo, 799/mo, 2500/mo |
| TechPetCage | Family, Pro, Kennel | 29/mo, 49/mo, 199/mo |
| PrimeDox AI | Starter, Pro, Team, Business | 99/mo, 499/mo, 499/mo, 1499/mo |
| Vault Velocity | Starter, Pro, Empire | 99/mo, 499/mo, 2499/mo |
| Weedlaw Edu | Student, Advocate, Pro | 49/mo, 149/mo, 299/mo |
| CleanSwarm | Home, Pro | 39/mo, 149/mo |
| MindShift | Bonsai Circle, Coaching, Sovereignty Lab | 29/mo, 150/session, 99/quarter |
| Francisco Holdings | Empire Call, Audit, Build | 150/hr, 2500, 15000 |

For each:
- dashboard.stripe.com → Products → Add product
- Name, price, recurring monthly, CAD
- Payment Links → Create link
- Copy URL, paste into site code

---

MAKE.COM INTEGRATION

Connect all sites:
- Lead form → Supabase CRM
- Stripe purchase → Welcome email
- Booking → Calendar + reminder
- GitHub commit → Deploy notification
- All webhooks active

---

COLOR RULES — EMPIRE WIDE

| Color | Hex | Use |
|-------|-----|-----|
| Crown Green | #0B3D2E | Backgrounds |
| Executive Gold | #C9A227 | Headlines, buttons, borders |
| Platinum | #E5E4E2 | Body text, cards |
| Silver | #C0C0C0 | Secondary, dividers |
| Crown Black | #0A0A0A | Footer, deep contrast |
| OmniGuard Blue | #4A90E2 | OmniGuard ONLY |
| OmniGuard Pink | #E91E63 | OmniGuard ONLY |

NO blue or pink anywhere except OmniGuard.

---

MAYLA'S BRAND — SEPARATE FROM EMPIRE

| Color | Hex | Use |
|-------|-----|-----|
| Imperial Purple | #2D1B55 | Primary |
| Gold | #C9A84C | Accents |
| Sakura Pink | #E896C8 | Cherry blossoms |
| Void Black | #06000F | Backgrounds |

Her aesthetic: Fortune, luxury, Japanese minimalism, bonsai, growth. Not your boardroom. Her own empire.

---

REPORT BACK DAILY

What you built today:

```
Built: [site/feature]
Status: [live/deployed/in progress]
Stripe links: [count created]
Links verified: [yes/no]
Next: [what you're building tomorrow]
```

---

KEEP BUILDING. DON'T STOP. EMPIRE GROWS. MONEY FLOWS.

---

## CHECKPOINT UPDATE — 2026-06-19 (third update, same day)

Derek resolved three conflicts between the latest Manus brief ("PROMPT FOR CLAUDE — PROMPT MANUS": OmniGuard space theme, CCLDR revamp, Francisco Holdings boardroom, MindShift) and what was already logged in EMPIRE.md as complete:

1. **Francisco Holdings**: the new brief said "posh boardroom aesthetic, NOT skyscraper." Derek confirmed: **restyle the existing 45-floor skyscraper** with the new boardroom palette — do not replace the skyscraper structure. Per-floor Stripe/PayPal buttons, the referral engine, and the secret Floor 45 Konami-code easter egg must all survive the restyle.
2. **CCLDR pricing**: two conflicting tables existed (old 6-tier Stripe table vs. new 4-tier brief). Derek confirmed the **4-tier structure is authoritative**: Warrior $149/mo, Professional $499/mo, Elite $999/mo, Sovereign $1499/mo. The old 6-tier table (Free/Basic/Warrior/Defender/Corporate/Litigation) is retired.
3. **OmniGuard repo**: the new brief implied a rename/move to `franciscoderek7/omni-guard`. Derek confirmed: **keep both repos** — `franciscoderek7/omniaguard` (legacy, do not delete) and `franciscoderek7/omni-guard` (new build target) — for now.

The block below is the corrected, self-contained prompt — paste this to Manus instead of the raw brief Derek typed, since it fixes the three conflicts above.

---

MASTER PROMPT FOR MANUS — KEEP BUILDING THE EMPIRE (CHECKPOINT v3)

Manus — three corrections before you continue on the next build order. These supersede anything conflicting in earlier prompts:

**1. Francisco Holdings (franciscoholdingsinc.com) — RESTYLE, don't replace.**
Derek confirmed: keep the existing 45-floor skyscraper structure exactly as-is — per-floor Stripe/PayPal buttons, the referral engine with discount tiers + commission tracking, and the secret Floor 45 Konami-code easter egg must all stay functional. Apply the new boardroom palette (Crown Green #0B3D2E, Executive Gold #C9A227, Platinum #E5E4E2, Silver #C0C0C0, Crown Black #0A0A0A — no blue/pink anywhere except the OmniGuard floor's card) on top of that structure. This is a re-skin, not a rebuild. Do not remove floors, the referral engine, or the Konami egg.

**2. CCLDR (ccldr.net) — pricing is now locked at 4 tiers.**
Authoritative pricing, supersedes any 6-tier table you saw earlier: Warrior $149/mo, Professional $499/mo, Elite $999/mo, Sovereign $1499/mo. Build the 6 Quintinity modules, BENO-X framework, 12-Appearance Method, Inmate Academy, and The Library (A-Z Cannabis Law Database) around these 4 tiers only. Deploy to `franciscoderek7/Ccldr-net` (overwrite existing — but preserve the existing correct PayPal payment format: PayPal.me/derekfranciacco1, Interac docweedla@gmail.com, CAD amounts matching the 4 tiers above). Still on 60-day DNS hold — use the GitHub Pages URL, don't touch DNS.

**3. OmniGuard — keep BOTH repos for now.**
Don't retire or rename `franciscoderek7/omniaguard` (legacy). Build the new space-theme/blue-pink rebrand in `franciscoderek7/omni-guard` (new repo) — it deploys to `omniaguard.com` (the domain Derek actually owns — `omni-guard.com` with a hyphen is NOT a registered domain, ignore that spelling if you saw it anywhere). Leave the old repo's content alone; Derek will manually switch GitHub Pages' custom-domain setting to the new repo when he's ready to flip the live domain over.

Everything else in the prior build queue stands: TechPetCage/TechPackCage separation, vaultvelocityauto.com, primedoxai.com, cleanswarm.ca, mindshift-makayla.github.io, the 40+ Stripe products table, Make.com integration, and the empire-wide color rules — all unchanged from the CHECKPOINT v2 prompt above. Keep building. Don't stop.

---

## CHECKPOINT UPDATE — 2026-06-19 (fourth update — pricing freeze on PrimeDox AI + CCLDR)

Audited the live files (not the briefs) before letting any build proceed. Both `primedoxai-site/pricing.html` and `ccldr-site/index.html` already have real, payment-wired pricing structures that don't match any pricing table dictated today. Derek confirmed: **keep the live pricing on both, do not overwrite.**

MESSAGE FOR MANUS — paste this alongside the override message above:

> "Manus — one freeze before you touch PrimeDox AI or CCLDR: their pricing is already live and wired to real payment links (PrimeDox AI: Pro $49/Elite $199/Team $499/Sovereign $999/Imperium $9,999/mo. CCLDR: Digital Access $99/Foundation/Practitioner/Sovereignty $999/Sovereign Elite $1499/mo, PayPal product IDs already attached). Ignore any pricing numbers in earlier briefs for these two — they're outdated. Visual/color/layout changes only on these two sites. Do not rename tiers, do not change prices, do not touch payment links or PayPal product IDs. Everything else in the build queue is unaffected — keep going."

---

## CHECKPOINT UPDATE — 2026-06-19 (fifth update — universal pricing strategy, excludes PrimeDox AI + CCLDR)

Derek confirmed a new universal pricing/conversion strategy for revenue maximization, explicitly **excluding** PrimeDox AI and CCLDR (the pricing freeze above still applies to those two). For every other company without already-wired live pricing, use this structure:

| Tier | Price | Purpose |
|------|-------|---------|
| Free Trial | $0 for 24 hours | Hook them. Full access, no limits. |
| Starter/Basic | $49–99/mo | Entry point. Keep them after trial. |
| Professional/Pro | $299–499/mo | Main revenue driver. Most land here. |
| Enterprise/Elite | $999–2,499/mo | Big money. Companies, teams, serious users. |
| Sovereign/Agency | $4,999–9,999/mo | Whale hunting. Custom everything. |

**24-hour free trial mechanic** (simple version, confirmed by Derek):
1. User signs up → full access for 24 hours. No card required.
2. Countdown timer runs site-wide.
3. At 24 hours → account locks, downgrades to free view-only.
4. User clicks "Upgrade" → Stripe checkout → instant unlock at Starter tier (or whichever tier they pick).

---

## CHECKPOINT UPDATE — 2026-06-19 (sixth update — build owned domains only)

Derek wants Manus focused exclusively on domains already registered — get those live and making money before buying/building anything else. Confirmed: the OmniGuard rebrand domain is `omniaguard.com` (no hyphen) — `omni-guard.com` is not a real registered domain and should be ignored anywhere it appeared in earlier prompts. Also confirmed: a hidden, unlisted page for rare/exotic car inventory goes on Vault Velocity Auto (not linked from main nav, kept separate from the core automation-workflow product).

MESSAGE FOR MANUS — paste this as the next build order:

---

Manus, stop. Build only the sites for domains Derek already owns. Nothing else until these are live and making money.

**DOMAINS DEREK OWNS — BUILD THESE NOW**

| Domain | Repo | Status | Action |
|--------|------|--------|--------|
| omniaguard.com | franciscoderek7/omni-guard (new rebrand repo) | ✅ Built, on branch `claude/omni-guard-space-theme` | Derek to merge + switch GitHub Pages custom-domain setting from the legacy repo to this one |
| omniaguard.ca | franciscoderek7/omniaguard-ca | ❌ Not built | Build clone of omniaguard.com space theme with CAD pricing |
| omniaguard.io | franciscoderek7/omniaguard-io | ❌ Not built | Build API/tech landing page |
| omniaguard.pro | franciscoderek7/omniaguard-pro | ❌ Not built | Build pro services page |
| omniaguard.tech | franciscoderek7/omniaguard-tech | ❌ Not built | Build technology showcase |
| franciscoholdingsinc.com | franciscoderek7/francisco-holdings | ✅ Live (45-floor skyscraper, boardroom palette already applied) | No action needed |
| franciscoholdingsinc.ca | franciscoderek7/franciscoholdingsinc-ca | ❌ Not built | Build clone with Canadian focus, CAD pricing |
| franciscoholdingsinc.buzz | franciscoderek7/franciscoholdingsinc-buzz | ❌ Not built | Build marketing/buzz landing page, lead capture, viral referral |
| vaultvelocityauto.com | franciscoderek7/vaultvelocityauto | ❌ Not built (repo doesn't exist yet) | Build workflow automation site — see priority 3 below |
| zprimedoxaihq.com | franciscoderek7/zprimedoxaihq | ✅ Live | Keep as-is |
| techpetcage.com | franciscoderek7/techpetcage | ❌ Not built (repo doesn't exist yet) | Build pet tech site |
| techpetcage.ca | franciscoderek7/techpetcage-ca | ❌ Not built | Build clone with CAD pricing |

**DO NOT BUILD YET — domains not owned:**

| Domain | Status | Action |
|--------|--------|--------|
| primedoxai.com | ❌ Not owned | Derek buys first — use the existing `franciscoderek7.github.io/primedox/` GitHub Pages URL for now |
| cleanswarm.ca | ❌ Not owned | Derek buys first |
| ccldr.net | ⏳ Owned, 60-day hold | Wait for hold to lift — use GitHub Pages URL |
| mindshift-makayla.com | ❌ Not owned | Use GitHub Pages URL for now |

**BUILD ORDER — PRIORITY**

1. **OmniGuard variants** (omniaguard.ca, .io, .pro, .tech) — clone the omniaguard.com space theme; .ca = CAD pricing; .io = API docs/developer focus; .pro = enterprise/consulting focus; .tech = technology showcase + blog. 24-hour free trial on all (see mechanic below).
2. **Francisco Holdings variants** (.ca, .buzz) — clone the franciscoholdingsinc.com skyscraper; .ca = Canadian focus, CAD pricing, local contact; .buzz = marketing landing page, lead capture, viral referral.
3. **Vault Velocity Auto** (vaultvelocityauto.com) — 25 workflow automations, AI agent swarm, pricing Starter $99/Pro $499/Empire $2,499/mo, 24-hour free trial. **Also build a secret car page** at `/vault` or `/secret` — password-protected or invite-only, no public nav link. Rare/exotic/grey-market inventory, high-ticket sales ($50K–$500K cars), dark theme, exclusive "by referral only" feel, contact form for serious buyers. Keep this completely separate in copy/imagery from the automation-workflow product pages.
4. **TechPetCage** (techpetcage.com, .ca) — pet tech, GPS tracking, health alerts, pricing Family $29/Pro $49/Kennel $199/mo, 24-hour free trial; .ca = CAD pricing.

**24-HOUR FREE TRIAL — all sites in this build order**
1. User signs up with email — full access, no card required.
2. Countdown timer visible site-wide.
3. At 24 hours → account locks to free view-only.
4. User clicks "Upgrade" → Stripe checkout → instant unlock.

**STRIPE PRODUCTS — create for owned domains**

| Product | Price | Domain |
|---------|-------|--------|
| OmniGuard Starter | $99/mo | omniaguard.com |
| OmniGuard Pro | $299/mo | omniaguard.com |
| OmniGuard Sentinel | $499/mo | omniaguard.com |
| OmniGuard Enterprise | $1,499/mo | omniaguard.com |
| Vault Velocity Starter | $99/mo | vaultvelocityauto.com |
| Vault Velocity Pro | $499/mo | vaultvelocityauto.com |
| Vault Velocity Empire | $2,499/mo | vaultvelocityauto.com |
| TechPetCage Family | $29/mo | techpetcage.com |
| TechPetCage Pro | $49/mo | techpetcage.com |
| TechPetCage Kennel | $199/mo | techpetcage.com |

**DEPLOYMENT:** push to feature branch → Derek merges to main → GitHub Actions auto-deploys. DNS: 185.199.108-111.153, CNAME www → domain, grey cloud (DNS only), SSL Full.

**DELIVER ZIPS:** `omniaguard-ca-site.zip`, `omniaguard-io-site.zip`, `omniaguard-pro-site.zip`, `omniaguard-tech-site.zip`, `franciscoholdingsinc-ca-site.zip`, `franciscoholdingsinc-buzz-site.zip`, `vaultvelocityauto-site.zip`, `techpetcage-site.zip`, `techpetcage-ca-site.zip`.

BUILD ONLY OWNED DOMAINS. DEPLOY FAST. MAKE MONEY. THEN BUY MORE DOMAINS.

Applies to: OmniGuard, Vault Velocity, TechPetCage, TechPackCage, CleanSwarm, VIGILAX, Kiaros, MindShift, and any other site without already-wired live pricing. PrimeDox AI and CCLDR are explicitly excluded — frozen as logged above.

---

## CHECKPOINT v7 — Kimi + Claude integration, every site + zPrimeDox AI HQ command center (2026-06-19)

**FEASIBILITY NOTE (read before pasting to Manus):** "Claude API endpoint" and "Kimi API endpoint" embedded live on each customer site, autonomously building/fixing/deploying code, is not an off-the-shelf product — there's no public API where Claude pushes its own commits from a website backend. What Manus *can* build per-site: a chat widget that calls the Claude API (Derek's own API key) for customer-facing Q&A/support copy, and a Kimi-backed memory/notes layer via Supabase. Actual code-building/deploying stays a human-in-the-loop process (Derek + Claude in this chat, same as today) — Manus should build the chat-widget/memory layer, not a literal autonomous-deploy bot.

Manus, integrate Kimi and Claude AI into EVERY site. Not just some. ALL OF THEM. Plus build the zPrimeDox AI HQ as the central command center.

**KIMI + CLAUDE INTEGRATION — EVERY SITE**

| Site | Kimi Role | Claude Role |
|------|-----------|--------------|
| franciscoholdingsinc.com | Memory keeper, knows Derek's full empire, recalls past conversations, personal touch | Code builder, fixes bugs, deploys updates, technical operations |
| omniaguard.com | Security intelligence, threat analysis, remembers attack patterns | Security architecture, builds defense systems, API integration |
| ccldr.net | Legal research, case law memory, constitutional advocacy knowledge | Legal document automation, court filing tech, workflow building |
| primedoxai.com | AI strategy memory, knows Derek's automation preferences | AI system builder, creates workflows, integrates APIs |
| vaultvelocityauto.com | Automation memory, knows all 25 workflows, optimization | Workflow builder, creates new automations, fixes broken ones |
| techpetcage.com | Pet health knowledge, remembers pet data, care recommendations | Hardware integration, GPS tracking tech, AI health analysis |
| cleanswarm.ca | Sustainability knowledge, carbon tracking, environmental data | Clean tech integration, energy audit systems, IoT connectivity |
| mindshift-makayla.github.io | Psychology knowledge, wellness memory, coaching history | Site builder, course platform, e-commerce integration |
| vigilax pages | Cybersecurity memory, threat database, incident history | Security platform builder, monitoring systems, alert automation |

**ZPRIMEDOX AI HQ — CENTRAL COMMAND CENTER**

URL: zprimedoxaihq.com (already owned/live per EMPIRE.md)

Purpose: Central brain of the entire empire. Kimi and Claude live here. They watch over everything.

Features: Empire Dashboard (all 45+ companies in one view), AI Agent Swarm Monitor, Live Conversations, Revenue Tracker (Stripe/PayPal across all sites), Alert Center, Deployment Control, Memory Bank, Learning Engine.

**AGENT SWARM HIERARCHY**

| Level | Agent | Role |
|-------|-------|------|
| HQ | Kimi + Claude | Central command, watch everything, report to Derek |
| Site Level | Gemma 41B | Customer-facing, sales, support, lead capture |
| Task Level | Make.com | Automation, workflows, connections |
| Data Level | Supabase | CRM, storage, analytics |

**INTEGRATION METHOD — per site:** Kimi-backed chat/memory widget (Supabase-stored) + Gemma 41B for customer chat/sales/support, both reporting into zPrimeDox AI HQ via shared Supabase. (Claude's "integration" is this chat in primedoxai-deploy, not a live in-browser agent — see feasibility note above.)

**REPORTING:** Daily — conversations, leads, sales, issues, fixes, opportunities, recommendations. Weekly — revenue by company, traffic, conversion, AI performance, priorities.

BUILD: 1. zPrimeDox AI HQ command center. 2. Kimi memory/chat widget on every site. 3. Gemma 41B customer-facing AI on every site. 4. Shared Supabase across all sites. 5. Unified daily/weekly reporting into HQ.
