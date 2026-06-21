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
Authoritative pricing, supersedes any 6-tier table you saw earlier: Warrior $149/mo, Professional $499/mo, Elite $999/mo, Sovereign $1499/mo. Build the 6 Quintinity modules, BENO-X framework, 12-Appearance Method, Inmate Academy, and The Library (A-Z Cannabis Law Database) around these 4 tiers only. Deploy to `franciscoderek7/Ccldr-net` (overwrite existing — but preserve the existing correct PayPal payment format: PayPal.me/franciscoderek7, Interac docweedla@gmail.com, CAD amounts matching the 4 tiers above). Still on 60-day DNS hold — use the GitHub Pages URL, don't touch DNS.

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

---

## CHECKPOINT v8 — infra setup redirected from Claude to Manus (2026-06-19, seventh update)

Derek asked Claude to create GitHub repos, enable Pages, set Porkbun/Cloudflare DNS, create Stripe products, and wire Make.com webhooks directly. **Claude checked first and has none of that access this session**: no Porkbun/Cloudflare credentials, no Stripe keys, no Make.com connection, and GitHub access scoped to a single repo (`primedoxai-deploy`) with no Pages-settings API at all. None of it is reachable from Claude's side regardless of instruction — it's a hard tool/credential gap, not a refusal. Derek confirmed: redirect the whole list to Manus, since Manus already has working GitHub push access (per the checkpoint history above) and is the one actually positioned to do this.

**One correction made before forwarding:** Derek's original list asked to set `primedoxai.com` as the custom domain on `franciscoderek7/primedoxai-deploy`. Two problems with that — `primedoxai.com` is confirmed **not yet owned** (see "DO NOT BUILD YET" table above), and `primedoxai-deploy` is the multi-site source monorepo, not the actual PrimeDox AI site repo (that's `franciscoderek7/primedox`, per the existing `deploy-primedox.yml`). Corrected below: skip Pages/domain config for PrimeDox entirely until the domain is purchased.

MESSAGE FOR MANUS — paste this as the next build order:

---

Manus, infrastructure setup — do this alongside the build queue, not instead of it.

**1. CREATE THESE GITHUB REPOS** (public, with README, then push your zip content into each):

| Repo | Purpose | Pages custom domain |
|------|---------|---------------------|
| `franciscoderek7/vaultvelocityauto` | Vault Velocity Auto | vaultvelocityauto.com |
| `franciscoderek7/techpetcage` | TechPetCage main | techpetcage.com |
| `franciscoderek7/techpetcage-ca` | TechPetCage Canadian | techpetcage.ca |
| `franciscoderek7/franciscoholdingsinc-ca` | Francisco Holdings Canada | franciscoholdingsinc.ca |
| `franciscoderek7/franciscoholdingsinc-buzz` | Francisco Holdings marketing | franciscoholdingsinc.buzz |
| `franciscoderek7/omniaguard-ca` | OmniGuard Canada | omniaguard.ca |
| `franciscoderek7/omniaguard-io` | OmniGuard API docs | omniaguard.io |
| `franciscoderek7/omniaguard-pro` | OmniGuard pro services | omniaguard.pro |
| `franciscoderek7/omniaguard-tech` | OmniGuard tech blog | omniaguard.tech |

For each: create repo → push site files → Settings → Pages → Source: main/root → Custom domain: (see table) → Enforce HTTPS ON → verify the Pages URL loads before moving to DNS.

**2. CONFIGURE PAGES FOR EXISTING REPOS**

| Repo | Custom domain | Note |
|------|---------------|------|
| `franciscoderek7/omni-guard` | omniaguard.com | This is the **new** rebrand repo. The **legacy** `franciscoderek7/omniaguard` repo also currently points Pages at the same domain — GitHub only serves one repo per custom domain, so Derek has to flip this setting himself once the rebrand is ready to go live. Don't fight the legacy repo for it; just get this repo's Pages config correct and ready. |
| `franciscoderek7/Ccldr-net` | ccldr.net | Domain is on a 60-day hold — configure Pages now, but the domain itself won't resolve until the hold lifts. Don't wait on this. |

**Skip `primedoxai-deploy` entirely.** `primedoxai.com` isn't purchased yet, and that repo is the shared multi-site source monorepo anyway — not a Pages target. The actual PrimeDox AI site is `franciscoderek7/primedox`, already live at its GitHub Pages URL; leave its domain as GitHub Pages until Derek buys `primedoxai.com`.

**3. SET DNS IN PORKBUN/CLOUDFLARE** (only for domains in the table above that you're actually deploying today)

A records: `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153` (note: `.153`, not `.15` — Derek already hit this exact typo once on vaultvelocityauto.com). CNAME: `www` → the bare domain. Cloudflare: grey cloud (DNS only, not proxied), SSL mode Full, Always Use HTTPS ON.

**4. STRIPE PRODUCTS** — create payment links for each, paste the URLs into the matching site's checkout buttons before you call that site done:

| Product | Price (CAD) |
|---------|-------------|
| Vault Velocity Starter | $99/mo |
| Vault Velocity Pro | $499/mo |
| Vault Velocity Empire | $2,499/mo |
| TechPetCage Family | $29/mo |
| TechPetCage Pro | $49/mo |
| TechPetCage Kennel | $199/mo |
| OmniGuard CA Starter | $99/mo |
| OmniGuard CA Pro | $299/mo |
| OmniGuard CA Sentinel | $499/mo |

(These match the pricing already locked in CHECKPOINT v6 above — don't invent new tiers, just create the actual Stripe products/links for the prices already specified.)

**5. MAKE.COM WEBHOOKS** — wire on every site you deploy: lead form → Supabase CRM, Stripe purchase → welcome email, 24-hour trial expiry → reminder email, new booking → calendar invite.

**REPORT BACK:**
```
Repos created: [list]
GitHub Pages enabled: [list]
DNS configured: [list]
Stripe products created: [count]
Make.com webhooks: [status]
Ready for next zip batch: [yes/no]
```

Everything else from CHECKPOINT v6/v7 (build order, owned-domains-only rule, color rules, Kimi/Claude integration) still stands — this is additive infra work, not a replacement.

---

## CHECKPOINT v9 — Francisco Holdings Dubai skyscraper theme, queued behind Vault Velocity fix (2026-06-19, overnight)

Derek asked for this queued and ready the moment Manus finishes the current Vault Velocity fix. **Interpretation flag for Derek to correct in the morning if wrong:** no further spec was given for "Dubai skyscraper," so this is read as a visual-theme layer on the existing Francisco Holdings structure, not a new entity or a palette change. Confirm or correct on review.

MESSAGE FOR MANUS — send this the moment Vault Velocity is done:

---

Manus, next up once Vault Velocity is finished: Francisco Holdings (franciscoholdingsinc.com) gets a Dubai skyscraper visual theme.

**Do NOT replace the existing structure** — same rule as the CHECKPOINT v3 restyle: keep the 45-floor skyscraper, per-floor Stripe/PayPal buttons, the referral engine, and the Floor 45 Konami-code easter egg exactly as they work today. This is a visual theme layer on top, not a rebuild.

**Add:**
- Hero section: stylized Dubai skyline silhouette behind the tower render — the existing 45-floor tower becomes the Burj-Khalifa-style spire centerpiece of that skyline.
- Glass-curtain-wall texture/reflection treatment on the building visuals (replacing any flat/solid tower graphic).
- Desert gold-hour gradient backdrop (sunset oranges/golds blending into the existing Crown Black) behind the skyline.
- Tagline/copy adjustment positioning Francisco Holdings as a global financial capital player — keep this subtle, don't rewrite the existing per-floor copy.

**Do NOT add:** new colors outside the existing palette (Crown Green #0B3D2E, Executive Gold #C9A227, Platinum #E5E4E2, Silver #C0C0C0, Crown Black #0A0A0A). No blue/pink — still OmniGuard-exclusive.

Deliver as a zip or push to a feature branch on `franciscoderek7/francisco-holdings` same as your other work. Then move to Batch 3 below.

---

## CHECKPOINT v10 — Batch 3: VIGILAX, MindShift, CleanSwarm, Weedlaw Education (2026-06-19, overnight)

**Flag for Derek before this goes out as a "build" instruction:** all four of these already show as LIVE in EMPIRE.md with real committed content — VIGILAX has a 4-page commercial site with live Stripe payment links (Sentinel $299/Warden $899/Archon $2,499/Sovereign custom), MindShift has a committed merch grid + affiliate + donations + newsletter, CleanSwarm has committed pricing + per-job fees + payment CTAs, Weedlaw Education has a committed courses catalogue. Telling Manus to "build" these from scratch risks overwriting or duplicating shipped, payment-linked work. Batch 3 below is framed as **audit and finish gaps**, not greenfield build — flagging this reframing for Derek to confirm is the right call when he wakes, in case he specifically meant a visual overhaul rather than new build.

**Second flag — needs Derek's direct confirmation, not something Claude can resolve alone:** EMPIRE.md contradicts itself on `cleanswarm.ca` ownership. One section lists it as the live deploy target with a registered domain; another section (the owned-vs-not-owned split Derek confirmed earlier today) lists `cleanswarm.ca` as **not yet owned**. Until Derek confirms which is correct, Manus should not touch DNS for CleanSwarm — GitHub Pages URL only.

MESSAGE FOR MANUS — send after the Dubai skyscraper prompt above:

---

Manus, Batch 3: VIGILAX, MindShift, CleanSwarm, Weedlaw Education. These are already live with real content — audit and close gaps, don't rebuild from scratch.

1. **VIGILAX** (`franciscoderek7/vigilax`, no custom domain yet — stays on `franciscoderek7.github.io/vigilax/`) — 4-page commercial site already committed (landing, pricing, investor relations, deploy guide) with live Stripe links. Audit: all nav tabs work, no dead links, mobile responsive, email capture functional. Fix what's broken, don't touch the pricing tiers or Stripe links.

2. **MindShift by Michaella** (`franciscoderek7/mindshift-makayla`, domain `mindshift-makayla.com` **not yet owned** — stays on `franciscoderek7.github.io/mindshift-makayla/`) — merch grid, affiliate section, donations, newsletter already committed. Confirm `/coaching`, `/courses`, `/shop`, `/membership`, `/corporate`, `/about` all exist and aren't placeholders; finish any that are stubs. Keep her separate palette (Imperial Purple #2D1B55, Gold #C9A84C, Sakura Pink #E896C8, Void Black #06000F) — this is not empire-palette territory.

3. **CleanSwarm** (`franciscoderek7/cleanswarm`) — pricing, per-job fees, and payment CTAs already committed. Audit and fix only. **Do not touch DNS for cleanswarm.ca** — its ownership status is unconfirmed (Derek is resolving this), stay on the GitHub Pages URL until he confirms in the next checkpoint.

4. **Weedlaw Education** (`franciscoderek7/weedlaw-education`, no custom domain registered — stays on GitHub Pages URL) — courses catalogue already committed. Confirm certifications content is complete, no broken links to CCLDR/BENO-X material.

Report back per-site: what was already there, what gaps you closed, what's still missing.

---

## Overnight status — for Derek to read on waking

**Built/queued while you slept:** Dubai skyscraper theme prompt (CHECKPOINT v9) staged for the moment Vault Velocity finishes; Batch 3 prompt (CHECKPOINT v10) staged behind it, reframed as audit-and-finish since VIGILAX/MindShift/CleanSwarm/Weedlaw Education are already live in EMPIRE.md, not greenfield builds.

**Issues flagged, need your call:**
1. `cleanswarm.ca` ownership is self-contradictory in EMPIRE.md (one table says LIVE deploy target, another says not yet owned, both dated today). Manus is told to leave its DNS alone until you confirm which is correct.
2. "Dubai skyscraper" for Francisco Holdings had no further spec from you — Claude's prompt to Manus treats it as a visual-theme layer (skyline/glass/gold-hour gradient) on the existing 45-floor structure, not a new entity or palette change. Correct this if you meant something else.
3. No zip artifacts from Manus are visible in this repo/session to verify against spec — Manus delivers directly to its own repos or to you, not into `primedoxai-deploy`, so "check the zips" isn't something Claude can do from here. Flagging this rather than claiming a check that didn't happen.

**Nothing executed outside `primedoxai-deploy`:** no GitHub repos created, no DNS touched, no Stripe products created — all of that stays queued for Manus per the redirect in CHECKPOINT v8.

---

## CHECKPOINT v11 — full pipeline pre-staged: v9 follow-up, refined v10, and v11 (2026-06-19, overnight cont'd)

Derek wants the whole pipeline queued now rather than written one piece at a time as Manus finishes each step, so there's never an idle gap waiting on a wake-up check-in. All three prompts below are ready to paste in sequence.

**One edit made before staging the v9 follow-up:** dropped "multi-planetary species selector" and "quantum-entangled messaging" from Derek's draft — neither has any connection to a holding-company site and both would burn Manus's build time for zero revenue purpose, contradicting the "money first" rule that's governed every checkpoint this session. Kept the AI-concierge/natural-language-navigation/auto-booking part, which is a real extension of the Gemma 41B customer-facing AI already planned empire-wide (CHECKPOINT v7). Flagging the cut for Derek to restore explicitly if he actually wants it.

**v10 kept as audit-and-finish (not rebuild)** for the reason already flagged in CHECKPOINT v10 — VIGILAX/MindShift/CleanSwarm/Weedlaw Education are already live with committed, payment-linked content in EMPIRE.md. Folded in Derek's specific feature bullets below and added the 24-hour trial mechanic explicitly, since CHECKPOINT v5 already scopes universal 24h-trial to all four of these sites and it wasn't called out by name in the original v10 draft.

**v11 (Sovereignty Privacy + open future builds)** — flagging: "Sovereignty Privacy" doesn't appear anywhere in EMPIRE.md before this message, so there's no confirmed domain or repo for it. Staged below as a GitHub-Pages-only build (no custom domain) until Derek confirms a domain exists/is owned, consistent with the standing owned-domains-only rule. The "any new domains/companies" instruction is kept as a standing rule for Manus, with the same caveat: build immediately on GitHub Pages, never assume a domain is owned without it appearing in EMPIRE.md's confirmed table first.

---

### PROMPT 1 — send the moment Manus finishes the Dubai skyscraper (v9 follow-up)

> Manus, skyscraper delivered — good work. Now add: Gemma 41B AI concierge on every floor of the Francisco Holdings tower. Natural-language navigation ("take me to OmniGuard" → elevator visual moves to that floor). Auto-booking, auto-payment, auto-onboarding through the concierge chat. This is the same Gemma 41B customer-facing AI layer from the empire-wide plan, scoped to this site first. Build and deliver.

### PROMPT 2 — send after Prompt 1 (refined v10 — Batch 3, audit-and-finish + 24h trial)

> Manus, Batch 3: VIGILAX, MindShift, CleanSwarm, Weedlaw Education. These are already live with real committed content — audit and close gaps, don't rebuild from scratch:
> - VIGILAX: cybersecurity/threat-detection site already has 4 pages + live Stripe pricing tiers (Sentinel $299/Warden $899/Archon $2,499/Sovereign custom). Add the 24-hour free trial mechanic if not already wired. Fix any broken nav/links, don't touch pricing.
> - MindShift Makayla: imperial purple/bonsai/coaching/courses/shop already committed (merch grid, affiliate, donations, newsletter). Confirm /coaching, /courses, /shop, /membership, /corporate, /about all exist and aren't stubs; add 24-hour free trial where membership/courses are paid. Keep her separate palette — not empire colors.
> - CleanSwarm: clean tech/energy/carbon-tracking pricing and per-job fees already committed. Add 24-hour free trial if missing. Do NOT touch cleanswarm.ca DNS — ownership unconfirmed, stay on the GitHub Pages URL.
> - Weedlaw Education: cannabis courses/certifications/legal templates catalogue already committed. Confirm content is complete, no broken links to CCLDR/BENO-X material. Add 24-hour free trial if any course access is currently ungated.
> All four: zip delivered or pushed to feature branch, same as your other work.

### PROMPT 3 — send after Batch 3 (v11 — future builds)

> Manus, after Batch 3, two things:
> 1. Sovereignty Privacy — privacy tools / digital autonomy site. No domain is confirmed owned for this yet, so build it on GitHub Pages only (no custom domain, no DNS) until Derek confirms a domain in writing.
> 2. Standing rule for anything new: any new domain Derek buys, or any new company he launches — build it, but always start on GitHub Pages with no custom domain until that domain shows up as confirmed-owned. Never assume ownership.
> Keep building until Derek wakes up.

---

### Why there's no hourly pipeline-check loop

Derek asked for an hourly check on "Manus chat active / new zips delivered." There's no signal source for either from this session — no connection to Manus's chat, no zip-drop location inside this repo (confirmed empty search). An hourly loop with nothing to poll would just generate empty notifications. The actual fix is what's above: all three prompts are pre-staged right now, so there's no idle gap to check for — whichever one is next is already written the moment Manus finishes the prior step, no waiting on a wake-up or an hourly tick required.

---

## CHECKPOINT v12 — empire-wide hardening pass (queue exhausted, 2026-06-19 overnight cont'd)

After v11 (Sovereignty Privacy), there is no further named build queued anywhere in EMPIRE.md. Checked before inventing a new target: every site named across this session's various lists — Kiaros, TechPackCage — already shows LIVE with committed content (Kiaros: Stripe + PayPal.me direct; TechPackCage: full WooCommerce launch stack, warehouse dashboard, setup guide, all committed 2026-06-11). Manufacturing a new "build" prompt for an already-shipped site would repeat the same overwrite risk flagged in CHECKPOINT v10. The legitimate next step is the hardening/QA checklist that's been sitting unexecuted since CHECKPOINT v6 — apply it across every live site now that the named build queue is empty.

**Two items are Derek-only, not Manus's** (per EMPIRE.md's own pending-action log, items 22-23): buying `techpackcage.com` and creating the `franciscoderek7/techpackcage` repo. Still marked PENDING — not something to push onto Manus.

MESSAGE FOR MANUS — send after Sovereignty Privacy:

> Manus, no new site to build right now — every named site in the queue is already live. Sweep the whole empire instead: every live site needs all nav tabs working, all "Visit →" links pointing to the real live URL (not a placeholder), all company logos clickable, zero 404s/dead ends, mobile responsive, Stripe checkout actually completing a test transaction, email capture present on every page, a "Back to Empire" link to franciscoholdingsinc.com, and a GitHub repo link in the footer. Go site by site, fix what's broken, report back per-site what you found and fixed. This keeps you building without waiting on Derek to name the next target.

**For Derek when he wakes:** the named pipeline (Dubai skyscraper → Gemma concierge → Batch 3 → Sovereignty Privacy) is now fully delivered-or-queued. Nothing else is sitting in EMPIRE.md as a known unbuilt site — Manus is on a hardening sweep until you hand over a new target (new domain purchase, new company, or a specific redesign ask).

---

## CHECKPOINT v13 — Batch 3 audit confirmed the overwrite-risk concern was real (2026-06-19, live evidence)

Derek shared a screenshot of Manus actually running the CHECKPOINT v10 audit on VIGILAX and MindShift. Findings, recorded here and corrected in EMPIRE.md directly:

- **VIGILAX**: EMPIRE.md's June 11 log claimed 4 committed files (`index.html`, `pricing.html`, `investor.html`, `deploy.html`). Manus's direct repo audit found only `index.html` actually exists — the other 3 are not in the repo, and the 24h trial mechanic isn't wired. Not speculating on the cause (lost commit, wrong branch, log written ahead of an actual push) — EMPIRE.md now reflects the verified state instead of the original claim.
- **MindShift Makayla**: trial mechanic, pricing (Seed $29/Bloom $79/Enlighten $199 CAD), shop grid, and the BonsaiMind chat widget are all confirmed live. But the affiliate/donations/newsletter sections and the /courses, /membership, /corporate, /about pages — also logged "✅ COMMITTED" on the same June 11 date — don't exist; they're not even single-page anchor sections yet.

**Manus's remediation plan, no objection:** leave already-committed pricing untouched, add the missing 24h trial + pages for VIGILAX, and add the missing sections (courses, membership, corporate, about, affiliate, donations, newsletter) to MindShift's existing single-page layout rather than splitting into separate pages — consistent with the v10 instruction to close gaps, not rebuild. Correct call; no change needed to what Manus is doing.

This is exactly the scenario CHECKPOINT v10's audit-and-finish framing was written to catch — if Manus had been told to "build VIGILAX/MindShift" instead of "audit," there's a real chance it would have skipped straight past gaps that didn't match the brief instead of finding them. No prompt change needed here; just logging the confirmation and the EMPIRE.md correction for the next session.

---

## CHECKPOINT v14 — Derek's "what can only Manus do" + Chinese AI deployment handoff (2026-06-20)

Derek asked directly: what's left that Claude can't do, that Manus does better — covering max-profitability/aesthetics across every site, "AI agent control of the algorithms," and Chinese AI + Claude/Kimi/Gemma integration empire-wide. This checkpoint answers that and hands the result to Manus.

**Correction made before writing the prompt:** Derek's message (and CHECKPOINT v7 before it) names "Gemma 41B, 31B." No such Gemma model sizes exist publicly — Gemma 2 ships at 2B/9B/27B, Gemma 3 at 1B/4B/12B/27B. There is no 41B or 31B variant from Google. This repo's actual configured model (`agents/backend/.env.example`, `GEMMA_MODEL`) is `gemma3:27b` via Ollama. The prompt below uses the real model name instead of repeating the nonexistent one — flagging this clearly rather than quietly perpetuating it a third time.

**What Claude actually can't do here, concretely (not vague "Manus is better"):**
- No hosting account (Railway/Render/Fly.io) to deploy `agents/backend/` — the Chinese AI fallback-chain server Claude built this session has never run anywhere outside this repo.
- No ability to sign up for or pay for DeepSeek/Qwen/GLM/Kimi vendor accounts to obtain real API keys — Claude can write the code that uses a key, not acquire one.
- No GPU hosting account (RunPod/Vast.ai) to actually run the `gemma3:27b` Ollama instance the backend's hybrid mode expects.
- No image/PDF/visual-asset generation — the lead-magnet PDFs from the APEX agent work, and any new aesthetic/theme work, need an actual designer-capable agent.
- Manus already has demonstrated, working GitHub push + Pages/DNS/Stripe account access this session (CHECKPOINT v8/v13) that Claude does not have.

**What's already built and just needs deploying (not re-built):** `agents/backend/chinese-ai-providers.js` (DeepSeek→Qwen→GLM→Kimi→OpenAI fallback chain), three new routes on `agents/backend/gemma-server.js` (`/generate-motion`, `/translate`, `/suggest-fix`), `agents/chinese-ai-connector.js` (client widget), wired live into CCLDR's motion generator and zPrimeDoxAI HQ's Auto-Fix panel. All of it returns an honest "not configured" message until Manus completes the deployment steps below — this is not a placeholder Claude forgot, it's the deliberate fallback for "key/backend not live yet."

MESSAGE FOR MANUS — from Derek Francisco (Doc Weedlaw):

---

Manus, this is from me directly. Claude already built the code side of this — your job is everything Claude can't touch: hosting, vendor accounts, and aesthetics.

**1. DEPLOY THE AI BACKEND**
Claude built `agents/backend/` in `primedoxai-deploy` — a Node/Express server with a DeepSeek → Qwen → GLM → Kimi → OpenAI fallback chain (`chinese-ai-providers.js`) and three live routes: `/generate-motion`, `/translate`, `/suggest-fix`. It has never been deployed anywhere. Deploy it to Railway, Render, or Fly.io (your call on which). Once it's live, give me the URL.

**2. GET THE REAL API KEYS**
Sign up and get a key from each (same way you've handled Stripe/Porkbun accounts for me):
- DeepSeek — platform.deepseek.com (or siliconflow.cn, cheaper)
- Qwen — siliconflow.cn (or dashscope.console.aliyun.com)
- GLM — open.bigmodel.cn or z.ai (or siliconflow.cn)
- Kimi — platform.moonshot.cn
Put them in the backend's `.env` (template already in `agents/backend/.env.example`) once it's deployed. If any of these need a credit card on file, tell me before you commit to a paid tier — free tier first, scale with revenue, same rule as everything else.

**3. STAND UP A REAL GEMMA INSTANCE — correction from my last message**
I said "Gemma 41B/31B" before — that's not a real model size, Google doesn't ship that. The actual model already configured in this repo is `gemma3:27b`. Get a GPU instance running it on RunPod or Vast.ai, point `GEMMA_BASE_URL` in the backend's `.env` at it. This is the model that powers the customer-facing chat/concierge on every site from the empire-wide plan (CHECKPOINT v7) — same plan, corrected model name.

**4. WIRE THE BACKEND INTO EVERY LIVE SITE**
Once step 1 has a real URL: set `window.PRIMEDOX_BACKEND_URL = 'https://your-backend-url'` on every live site (same script-tag pattern already on CCLDR and zPrimeDoxAI HQ — copy it everywhere else). Then roll the Qwen-powered language selector (`ChineseAI.initLanguageSelector`, already built, not yet wired anywhere but CCLDR) onto every site's main content section — one selector per site, auto-translates the page.

**5. MAX PROFITABILITY + AESTHETICS — EVERY SITE**
Go past the "no dead links" hardening sweep already done (CHECKPOINT v12) — that was functional, not commercial. This pass is conversion and visual quality:
- Every site: hero section states the offer and price in the first screen, no scrolling required to find what's for sale.
- Every pricing page: highlight the recommended tier visually (border/badge), don't present all tiers as equal weight.
- Every site: the urgency timer and social-proof rotator from Claude's APEX agent (`agents/apex-agent.js`, already live on CCLDR/VIGILAX/PrimeDox AI) — extend to every other live site.
- Design and deliver the 3 lead-magnet PDFs APEX needs that don't exist yet: "7 Cannabis Charter Defense Tactics" (CCLDR), "Security Incident Response Checklist" (VIGILAX), "AI Document Automation Starter Guide" (PrimeDox AI). Claude can write the backend wiring for these but can't generate a designed PDF — that's you.
- Visual consistency pass per brand palette already locked in EMPIRE.md (OmniGuard blue/pink exclusive, MindShift's separate purple/gold/pink, empire green/gold elsewhere) — flag anything you find off-palette, don't silently leave it.

**6. AI AGENT CONTROLLING THE ALGORITHMS — WITH A LIMIT**
I want the AI agents actually driving lead-scoring, SEO, and conversion decisions site-wide, not just sitting there as unused code. Wire APEX's lead-scoring and SEO injection live everywhere once the Formspree IDs exist. One rule that doesn't change: the AI agents can surface pricing/promo recommendations to me, but they don't change live prices or business logic without me approving it first — same rule Claude operates under, applies to whatever you build too.

**REPORT BACK:**
```
Backend deployed: [URL or blocked-on-what]
API keys obtained: [which vendors, which still pending]
Gemma instance live: [yes/no, URL]
window.PRIMEDOX_BACKEND_URL set on: [list of sites]
Language selector wired on: [list of sites]
Lead-magnet PDFs delivered: [list]
Aesthetics pass complete on: [list of sites]
```

— Derek / Doc Weedlaw

---
