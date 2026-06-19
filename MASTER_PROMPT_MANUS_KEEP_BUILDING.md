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
Don't retire or rename `franciscoderek7/omniaguard` (legacy). Build the new space-theme/blue-pink rebrand in `franciscoderek7/omni-guard` (new repo) and deploy that to omni-guard.com. Leave the old repo alone — Derek will decide later whether to retire it.

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

**24-hour free trial mechanic** (Derek's original message cut off after "Day 1" — this is the standard SaaS pattern filled in, no objection raised when checked):
1. User signs up → instant full access, no feature limits, card required at signup.
2. 24-hour countdown banner visible site-wide from the moment they start.
3. At hour 20: reminder email/in-app notice — trial ends in 4 hours, billed at [Starter price] unless cancelled.
4. At hour 24: card on file → auto-charge Starter tier, account stays fully active (the lock-in — no action required from the user, so most convert by default). No card on file → account drops to a locked/read-only view with an upgrade CTA, data preserved but features gated.
5. Upsell prompts at usage ceilings push Starter users toward Pro; Enterprise/Sovereign are sales-assisted (book-a-call CTA, not self-serve checkout).

Applies to: OmniGuard, Vault Velocity, TechPetCage, TechPackCage, CleanSwarm, VIGILAX, Kiaros, MindShift, and any other site without already-wired live pricing. PrimeDox AI and CCLDR are explicitly excluded — frozen as logged above.
