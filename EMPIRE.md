# EMPIRE.md — Francisco Holdings Master State Document
# Last Updated: 2026-06-20
# Authority: PrimeDox (Derek Francisco) — Human Final Authority
# Override: PrimeDocs — Activated only by PrimeDox explicit instruction

---

## ⚠️ MANUS COORDINATION NOTICE (2026-06-19)

Derek is running a second AI builder, **Manus**, concurrently with Claude on the following sites. Claude sessions should **check with Derek before making further changes to these sites** to avoid clobbering Manus's in-progress rebuilds (repo push target for Manus's work was not confirmed — may be same repo, may be separate):

- **Francisco Holdings** (franciscoholdingsinc.com) — Manus rebuilding posh boardroom aesthetic (green/gold/platinum, see new color table below)
- **zprimedoxaihq.com** — Manus rebuilding command center / lock code / empire dashboard
- **OmniGuard** (omni-guard.com) — Manus rebuilding under the new rebrand (see Spelling table in CLAUDE.md — OmniaGuard retired, now OmniGuard, blue/pink)
- **ccldr.net** — Manus rebuilding CCLDR education modules + pricing tiers (still on 60-day domain hold — do not touch DNS)

**Empire-wide color rule (Manus directive, confirmed by Derek):** Crown Green `#0B3D2E`, Executive Gold `#C9A227`, Platinum `#E5E4E2`, Silver `#C0C0C0`, Crown Black `#0A0A0A` — empire-wide. **No blue or pink anywhere except OmniGuard** (`#4A90E2` blue / `#E91E63` pink, OmniGuard-exclusive).

**MindShift by Michaella is explicitly separate** from the empire palette — her own brand: Imperial Purple `#2D1B55`, Gold `#C9A84C`, Sakura Pink `#E896C8`, Void Black `#06000F`.

Manus's next-priority build queue (informational, not yet assigned to Claude): vaultvelocityauto.com, primedoxai.com, cleanswarm.ca, mindshift-makayla.github.io, techpackcage.com — plus 40+ Stripe products across the empire and Make.com webhook integration. See `MASTER_PROMPT_MANUS_KEEP_BUILDING.md` for the full brief Derek gave Manus.

**Three decisions confirmed by Derek 2026-06-19 (resolving conflicts in Manus's latest brief — locked, do not re-litigate):**
1. **Francisco Holdings** — RESTYLE the existing 45-floor skyscraper with the new boardroom palette; do NOT replace it. Per-floor Stripe/PayPal buttons, the referral engine, and the secret Floor 45 Konami-code egg must survive.
2. **CCLDR pricing** — the 4-tier structure is authoritative: Warrior $149/mo, Professional $499/mo, Elite $999/mo, Sovereign $1499/mo. The earlier 6-tier table (Free/Basic/Warrior/Defender/Corporate/Litigation) is retired.
3. **OmniGuard repos** — keep BOTH `franciscoderek7/omniaguard` (legacy) and `franciscoderek7/omni-guard` (new build target) for now. Do not retire or rename either.

See `MASTER_PROMPT_MANUS_KEEP_BUILDING.md` CHECKPOINT v3 for the corrected prompt sent to Manus reflecting these decisions.

**CRITICAL CORRECTION confirmed by Derek 2026-06-19 — DO NOT overwrite live pricing on PrimeDox AI or CCLDR:** Audited the actual deployed files (not just the briefs) and found both sites already have real, PayPal-wired pricing structures that differ from every pricing table dictated in Manus's briefs today:
- **PrimeDox AI** (`primedoxai-site/pricing.html`) — LIVE/authoritative: Pro $49/mo, Elite $199/mo, Team $499/mo, Sovereign $999/mo, Imperium $9,999/mo. Do NOT replace with the brief's Starter/Pro/Team/Business $99/$499/$499/$1499 table.
- **CCLDR** (`ccldr-site/index.html`) — LIVE/authoritative: Digital Access $99/mo, charter education Course, Foundation, Practitioner, Sovereignty $999/mo (PayPal product ID `ccldr-sovereignty-999`), Sovereign Elite $1499/mo. Do NOT replace with either the old 6-tier table or the 4-tier Warrior/Professional/Elite/Sovereign table — both are now retired as far as these two live files go.
Manus/Claude work on these two sites must be **visual-only** (colors/layout/type per the differentiation brief) — never touch pricing, copy, or payment product IDs on them without a fresh, explicit, file-specific instruction from Derek.

**Universal pricing strategy confirmed by Derek 2026-06-19 (applies to every site EXCEPT PrimeDox AI + CCLDR, which stay frozen above):** Free Trial $0/24hr (full access, no card required) → Starter/Basic $49–99/mo → Professional/Pro $299–499/mo → Enterprise/Elite $999–2,499/mo → Sovereign/Agency $4,999–9,999/mo (sales-assisted). At 24hr, account locks to free view-only; user clicks "Upgrade" → Stripe checkout → instant unlock. See `MASTER_PROMPT_MANUS_KEEP_BUILDING.md` CHECKPOINT v4/v5 for the Manus-facing prompt.

---

## STATE OF THE ART PASS — 2026-06-20

Responding to Derek's "STATE OF THE ART — EVERY SITE" directive. Triaged the live deploy targets (18 workflows in `.github/workflows/`, ~35 other `*-site/` folders in the repo have NO matching deploy workflow — built but never actually live, a Manus follow-up, not a content fix) and worked Derek's stated priority order: payments → navigation → visuals.

**PayPal handle note:** Derek's message named a new handle `paypal.me/derekfranciac01`, conflicting with the `franciscoderek7` handle verified working empire-wide. Did not mass-replace — kept `franciscoderek7` (real, tested, money-moving) since overwriting it with an unverified handle risks misdirecting customer payments. Flag for Derek: confirm if `derekfranciac01` is a real, intentional new PayPal account before any site is repointed to it.

**Payments — referral engine rollout (commit `fd5c55d`):** `agents/referral-engine.js` (10% discount/commission codes) was only loaded on 6 sites despite Derek's "on EVERY site" instruction. Added it (+ `payment-provider.js` where missing) to every other live site with real PayPal buy buttons: BENO-X, Doc Weedlaw, Kiaros, MindShift, PrimeDox AI (5 pages), TechPackCage, CleanSwarm (2 pages), Weedlaw Education (2 pages). Confirmed no other dead `window.stripeCheckout` buttons remain on any live page (only hit left is in the orphaned, non-deployed `vaultvelocityauto-site/index.html`).

**Navigation — dead-link sweep:** Checked `href="#"` across all named sites. Found mostly intentional JS-handled buttons (`onclick=...;return false;`, modal links) — not actually dead. Real fix applied: Francisco Holdings `partnership.html` nav-brand logo pointed at `#` instead of `index.html` (reachable page, linked from `investors.html`) — fixed. Other `href="#"` hits (OmniGuard legacy `omniaguard-v3.html`/`docs.html`, FH `continuity.html`, CleanSwarm `cleanswarm-v2.html`) are on orphaned alt-version pages not linked from any live nav — left alone rather than polishing pages no visitor can reach; flagged here so a future session doesn't assume they're live.

**Visuals — zero-bleed check:** Grepped all live non-OmniGuard sites for `#4A90E2`/`#E91E63`/blue/pink — zero hits. Brand color separation is clean.

**Not attempted this pass (too large for a single turn, would need staging):** GSAP/Three.js animation framework, `js/agent-swarm.js`/`window.askGemma()`, natural-language elevator navigation, Web Speech API voice commands, PWA manifests — none of this exists anywhere in the repo yet as working infra. Full floor-by-floor link audit of the 45-floor Francisco Holdings skyscraper also not done (single-page JS app, too large to verify in this pass). These need a dedicated build session or a Manus prompt, not a quick fix.

---

## APEX AGENT v1 — 2026-06-20 (commit `007f5c4`)

Built `agents/apex-agent.js` per Derek's "DUAL TRACK — MONEY + APEX" directive. Scoped to what's actually real and working client-side, with no fabricated capability:

**Real and working today:** `Apex.injectSEO()` (meta description/keywords + Schema.org JSON-LD), exit-intent lead-capture popup with local lead scoring (cold/warm/hot by time-on-page + clicks) forwarding to Formspree, `Apex.wireShareButtons()` (Twitter/X, LinkedIn, Facebook share-intent dialogs — no API keys needed for these), `Apex.initUrgencyTimer()` (persists per-visitor like the existing 24h trial countdowns), `Apex.initSocialProof()` (rotates testimonials/counts Derek supplies — never auto-fabricates numbers), and `Apex.trackEvent()`/`Apex.getLocalStats()` (localStorage event log, Supabase mirror if `window.supabase` exists — same graceful no-op pattern as `referral-engine.js`).

**Wired into 3 live sites** (no real traffic data exists to pick "highest-traffic," chose highest revenue-potential per DEREK-TODO.md instead): CCLDR, VIGILAX, PrimeDox AI — each with an exit-intent lead magnet placeholder. **The lead-magnet PDFs themselves do not exist yet** — Derek needs to create/upload "7 Cannabis Charter Defense Tactics" (CCLDR), "Security Incident Response Checklist" (VIGILAX), "AI Document Automation Starter Guide" (PrimeDox AI) before those specific offers are real; the capture mechanism itself works today regardless. Formspree IDs are still the `YOUR_FORM_ID` placeholder (same as every other Formspree integration in this repo) until Derek creates the forms per `DEREK-TODO.md` step 4.

**BLOCKED — not built, would be dishonest to fake:** auto-posting to Twitter/X, LinkedIn, Facebook (needs an OAuth app + API keys per platform — none exist in this repo), automated email drip sequences (needs an email service like SendGrid/Mailchimp + backend — none exist here), sitemap auto-submission to Google/Bing Search Console (needs Search Console API auth), a "Gemma 41B endpoint" (no such endpoint exists anywhere in this repo), and real cross-visitor analytics/revenue-attribution reporting (`Apex.getLocalStats()` is per-browser localStorage only — a real dashboard needs GA4/Plausible or the Supabase table actually wired and paid for, see Supabase invoice note in `DEREK-TODO.md` step 7).

---

## SEO + APEX ANALYTICS FIX — 2026-06-21

Responding to Derek's "optimize SEO... AI analytics... its own branding... automated" message. Two real, working fixes (no new fabricated capability):

**1. SEO scaffolding gap closed on the 3 worst sites** (`primedoxai-site`, `zprimedoxaihq-site`, `cleanswarm-checkout` — confirmed via grep audit they were the only flagship sites missing OG tags/canonical links entirely): added `og:*`/`twitter:*`/`canonical` tags matching the pattern already used on `omniaguard-site`/`ccldr-site`/etc., plus `robots.txt` + `sitemap.xml` following the existing `ccldr-site` template. `primedoxai-site`'s canonical points to its GitHub Pages fallback URL (NOT-YET-OWNED domain rule, §"Porkbun Registered Domains" below). Also fixed `deploy-primedox.yml`/`deploy-cleanswarm.yml` — neither copied `.txt`/`.xml` files on deploy, so the new sitemap/robots files would have been silently dropped.

**2. Apex's Supabase mirror was a silent no-op everywhere — found and fixed the real bug**, not a new feature: `apex-agent.js` and `referral-engine.js` both checked `window.supabase.from` before inserting, but `window.supabase` (from the CDN SDK script) is the SDK namespace — `.from()` only exists on a client returned by `.createClient()`. No page was creating that client under the global `window.supabase` name (the one place a real client exists, `zprimedoxaihq-site/supabase-client.js`, stores it as `window.FHI_SUPA` instead). Fixed both files to create and cache their own lightweight client using the same already-public Supabase project/publishable key `zprimedoxaihq-site/supabase-client.js` uses. `apex-agent.js` also now self-loads the `supabase-js` CDN script if a page doesn't already include it, so this works without editing every site's `<head>`.

**Derek/Manus action required for this to actually persist cross-visitor data:** the `apex_events` table (and whatever `referral-engine.js` inserts into — check its `_supabaseInsert` call sites for table names) must exist in the Supabase project (`ilmlnehehfcxwlurzfxd`) or every insert silently no-ops (caught, by design — never breaks the page). Claude has no Supabase dashboard/migration access from this environment to create tables directly.

**Wired `apex-agent.js` onto the 3 flagship sites that were missing it** (`omniaguard-site`, `kiaros-site`, `docweedlaw-site` — every other flagship site already had it). Did not touch `omniaguard-site/index.html`'s pre-rebrand "OmniaGuard" spelling or anything else on that page beyond the one added script tag — that site is still flagged as Manus's in-progress rebuild per the REBRAND NOTICE above, out of scope without Derek's go-ahead.

**Not built — explicitly declined, not a fabricated placeholder:** automated social media posting and paid-ad-campaign automation. Both require Derek to personally create developer credentials first (Meta Business app + access token, X/Twitter Developer app, Google Ads API OAuth) — none of which exist in this repo and none of which Claude can create on Derek's behalf. `Apex.wireShareButtons()` (manual visitor-triggered share dialogs, no API keys needed) is the only "social" capability that can honestly exist today. "AI analytics" beyond rule-based local lead-scoring (cold/warm/hot) and aggregate event counts would need an LLM call over the Supabase data — technically possible once `agents/backend/` is deployed (still not deployed anywhere, see CHINESE AI INTEGRATION section above), not built here.

---

## DEPLOY-GATE FAILURES FOUND DURING "MERGE TO MAIN" — 2026-06-21

Derek ordered "merge to main for all." On merge, GitHub Actions logs showed 2 deploys had been silently failing on **every** push to `main` for a while (pre-existing, not caused by this session's changes) — investigated and fixed both rather than leaving them broken:

1. **Kiaros + CleanSwarm Loop B identity-leak check had a false-positive bug**: the grep pattern flagged the CDN script URL itself (`cdn.jsdelivr.net/gh/franciscoderek7/...`) as a "Derek Francisco identity leak," because the GitHub org name is literally `franciscoderek7` — but every Loop B site has always had to load shared `agents/*.js` from that exact CDN path. Fixed `deploy-kiaros.yml`/`deploy-cleanswarm.yml` to exclude that CDN line from the leak check while still catching real leaks (visible "Derek Francisco" text, personal email, etc.).
2. **Doc Weedlaw, BENO-X — real leaks, not false positives**: both had Derek's personal phone number (`705-307-8080`) hardcoded and were correctly being blocked by their own security gate. Removed it from both (kept the public email contact, which is correct for these Loop A sites).
3. **VIGILAX had `franciscoderek7@gmail.com` in 7 places** despite EMPIRE.md (§ VIGILAX MONEY ONLY pass) explicitly documenting VIGILAX as Loop B ("no Derek Francisco identity"). Replaced with `omniaguard1@gmail.com` — the anonymous Interac-transfer email the same page already used for payment instructions — so the whole page is now internally consistent.

**Found but NOT fixed — flagging, not silently sweeping:** `705-307-8080` also appears in ~37 other HTML files across the repo (`francisco-holdings-site/{constitutional-ai,continuity,partnership}.html`, `ccldr-site/{index-new-design,pricing}.html`, `email-signatures/signatures.html`, `signatures/*.html`, and ~30 experimental/concept site stubs like `koolduce-motors-site`, `fintech-swarm-site`, `health-swarm-site`, etc. — most of these aren't wired to any deploy workflow, so they're not live, but some like `ccldr-site/pricing.html` and the `francisco-holdings-site` pages ARE live). This is a much larger cleanup than the 2 deploy-blockers above — Derek should confirm whether he wants a full empire-wide sweep before one is done, since it touches ~37 files outside this session's scope.

---

## BROKEN PAYPAL HANDLE — EMPIRE-WIDE FIX — 2026-06-21 (commit pending)

Derek confirmed `paypal.me/derekfranciacco1` is **dead** (manual test, logged-in browser check). This handle was baked into `agents/payment-provider.js`'s default PayPal fallback table (and a duplicate copy in `cleanswarm-checkout/payment-provider.js`), `stripe-config.js`'s PayPal fallback per tier, and hardcoded directly in 67 site/agent files — meaning most "Buy Now" buttons empire-wide were sending customers to a dead PayPal page. This directly contradicts the § STATE OF THE ART PASS note above, which assumed `franciscoderek7` (the separately-confirmed-working handle, used in 79 other places) was already the dominant handle — it wasn't; `derekfranciacco1` was actually the more widely wired default.

**Fix:** global `derekfranciacco1` → `franciscoderek7` swap, 70 files (`sed`, exact-string replace, amount suffixes like `/99CAD` preserved untouched — `paypal.me/<handle>/<amount>` format unaffected by the handle swap). Verified zero remaining `derekfranciacco1` references repo-wide. Money flow direction unaffected by this fix — `PrimeDoxPayment.checkout()` only ever does `window.open(link)`, a customer-side redirect; nothing in the code path debits Derek.

**Revenue-ready now (PayPal button on a live, deployed site, pointing at the confirmed-working handle):** CCLDR (11 tiers), Francisco Holdings (45-floor skyscraper + investors.html + book.html), BENO-X, Doc Weedlaw, Kiaros, TechPackCage, TechPetCage, PrimeDox AI (5 pages), CleanSwarm, Weedlaw Education, VIGILAX, zPrimeDoxAI HQ, MindShift/Makayla.

**Not revenue-ready (PayPal/Stripe wired but NOT a live deploy target — fixed in source, but no workflow ships these):** `vaultvelocityauto-site/index.html` (the real live site is `vault-velocity-auto-site/`, hyphenated, which has no checkout at all — pre-existing gap, not part of this fix), `payment-portal/stripe-checkout.html`, `nightingale-console/*` (internal dashboard, not public-facing).

---

## CHINESE AI INTEGRATION — 2026-06-20

Responding to Derek's "CHINESE AI INTEGRATION — Build This Now" directive (DeepSeek/Qwen/GLM/Kimi stack). Built the secure server-proxy architecture rather than a client-only connector, because every one of these vendor APIs requires a secret key in the request header — putting a real key in any `agents/*.js` file would leak it to every site visitor via view-source within minutes (same risk class as the Stripe secret key, never done elsewhere in this repo).

**What's real and working today (once the backend is deployed and at least one vendor key is set):**
- `agents/backend/chinese-ai-providers.js` (new) — `chineseAIComplete(messages, chain, opts)`: tries DeepSeek → Qwen → GLM → Kimi → OpenAI in the order given, skips any provider with no API key configured, throws a descriptive error only if every provider in the chain fails or is unconfigured. All four vendors are OpenAI-compatible endpoints (same pattern `gemma-server.js` already uses for Ollama) — only `apiKey`/`baseURL`/`model` differ per provider.
- `agents/backend/gemma-server.js` (extended) — three new rate-limited (20 req/min) POST routes: `/generate-motion` (DeepSeek-first, reuses the existing `archivist` agent prompt for legal-document drafting, always appends the "educational template, not legal advice" disclaimer), `/translate` (Qwen-first), `/suggest-fix` (GLM-first, **read-only** — returns text suggestions only, never writes to any file or applies anything automatically; an external LLM should never get write access to live site code without a human review step).
- `agents/backend/.env.example` (extended) — documents all 8 new env vars (`DEEPSEEK_API_KEY`/`BASE_URL`/`MODEL`, same for QWEN/GLM/KIMI) and where to get each key. No real `.env` exists in this repo (only `.env.example`) — same as before this change.
- `agents/chinese-ai-connector.js` (new) — client-side bridge (`window.ChineseAI.generateMotion/translate/suggestFix`), CDN-loadable. Calls `window.PRIMEDOX_BACKEND_URL` (the existing `agents/backend/` server, still not deployed anywhere) instead of any vendor directly. Until that backend is deployed and `window.PRIMEDOX_BACKEND_URL` is set on a page, every call returns an honest "AI backend not configured yet" message — same placeholder convention as `YOUR_FORM_ID`/`REPLACE_WITH_STRIPE_LINK`. Also ships a reusable `initLanguageSelector()` widget (not yet wired into any site UI).
- **CCLDR** (`ccldr-site/templates.html`) — fully wired "Generate a Motion Draft" UI: motion-type dropdown, facts textarea, button → `ChineseAI.generateMotion()` → renders the draft (or the honest not-configured message) inline.
- **ZPrimeDoxAI HQ** (`zprimedoxaihq-site/index.html`) — new "Auto-Fix (GLM)" nav item + `view-autofix` panel: paste an error/code snippet → `autofixSuggest()` → `ChineseAI.suggestFix()` → suggestion rendered as text, explicitly labeled "review and apply manually."

**⚠️ NEEDS API KEY before any of this produces a real response on a live site:**
- DeepSeek — platform.deepseek.com (or siliconflow.cn, cheaper proxy)
- Qwen — siliconflow.cn (or dashscope.console.aliyun.com)
- GLM — open.bigmodel.cn / z.ai (or siliconflow.cn)
- Kimi — platform.moonshot.cn

**⚠️ NEEDS DEPLOYMENT before any key matters:** `agents/backend/` (Node/Express) is not running anywhere — needs Railway/Render/Fly.io per its own header comments, then `window.PRIMEDOX_BACKEND_URL` set on each page that loads `chinese-ai-connector.js`.

**❌ BLOCKED — not built:** Qwen auto-translate is not wired into "All empire sites" as Derek's directive requested — only the reusable widget exists; rolling it onto all ~20 live sites is a larger follow-up pass, not done silently here. Kimi swarm orchestration ("replace agent-swarm.js... 100 sub-agents... all 45 sites") was **not** built — the existing `/swarm` endpoint in `gemma-server.js` has an explicit, intentional 5-agent cap (`SWARM_MAX_AGENTS=8` env ceiling); raising that 20x to 100 is a cost/infra decision that needs Derek's explicit sign-off before being implemented, not something to change unilaterally. No `agents/agent-swarm.js` file exists in this repo to "replace" — flagging rather than inventing one.

**CONTINUED BUILD — 2026-06-20 (same day, "keep building" directive, while Manus handles deployment per CHECKPOINT v14):**
- `agents/apex-agent.js` — added `Apex.initStickyBuyBar()`: dismissible fixed-bottom CTA bar that appears after a scroll threshold, links to a real checkout URL (PayPal/Stripe), tracks clicks via the existing `trackEvent()`. Wired onto CCLDR (`templates.html`, $149/mo Foundation), VIGILAX (`pricing.html`, $499/mo Guardian — the tier already marked recommended), and PrimeDox AI (`index.html`, $49/mo Pro).
- `agents/gemma-chat-widget.js` (new) — floating chat bubble that calls the existing `/chat` route on `agents/backend/gemma-server.js` (same `agent_id`/`messages`/`session_id` shape that route already expects — no new backend code needed). Same security model and same "not configured yet" honest fallback as `chinese-ai-connector.js` until the backend is actually deployed (see CHECKPOINT v14 — that's Manus's job, not built here). Wired into zPrimeDoxAI HQ as the `primedox` concierge agent, matching the "central command center" role CHECKPOINT v7 already assigned that site.
- Not yet extended to the remaining live sites (OmniGuard, Francisco Holdings, Kiaros, CleanSwarm, MindShift, Weedlaw Education, TechPetCage, Vault Velocity Auto) — same components, just needs the same two-line wiring repeated per site in a follow-up pass.

---

## 1. HOLDING STRUCTURE

| Entity | Role | Loop | Status | Domain | Repo |
|--------|------|------|--------|--------|------|
| Francisco Holdings Inc. | Parent holding company | A | LIVE — 45-FLOOR SKYSCRAPER + STRIPE/PAYPAL PER FLOOR | franciscoholdingsinc.com | franciscoderek7/franciscoholdings |
| CleanSwarm | Physical + Document Cleaning AI | A | LIVE | cleanswarm.ca | franciscoderek7/cleanswarm |
| CCLDR | Cannabis charter defense education | A | LIVE + REFERRAL ENGINE + EDUCATION HUB | franciscoderek7.github.io/Ccldr-net/ | franciscoderek7/Ccldr-net |
| OmniGuard | AI security / agent protection | B | REBRANDING (was OmniaGuard) — Manus rebuilding under new name/domain/colors (blue #4A90E2 / pink #E91E63) | omni-guard.com | franciscoderek7/omniaguard |
| BENO-X / Doc Weedlaw | Cannabis constitutional defense | A | LIVE | franciscoderek7.github.io/Ccldr-net/ | franciscoderek7/beno-x |
| VIGILAX | Enterprise threat response | B | LIVE — PRICING UPDATED + STRIPE LIVE | franciscoderek7.github.io/vigilax/ | franciscoderek7/vigilax |
| Kiaros | AI strategy consulting | B | LIVE — STRIPE LIVE + PAYPAL.ME DIRECT | franciscoderek7.github.io/kiaros/ | franciscoderek7/kiaros |
| Weedlaw Education | Doc Weedlaw educational platform | A | LIVE | franciscoderek7.github.io/weedlaw-education/ | franciscoderek7/weedlaw-education |
| PrimeDox AI | Derek's AI persona/clone | A | LIVE | franciscoderek7.github.io/primedox/ | franciscoderek7/primedox |
| ZPrimeDoxAI HQ | AI Concierge HQ (password: FHI2026) | A | LIVE — CONCIERGE DEPLOYED | zprimedoxaihq.com | franciscoderek7/zprimedoxaihq |
| Vault Velocity Auto | Auto AI | A | LIVE | franciscoderek7.github.io/vaultvelocityauto/ | franciscoderek7/vaultvelocityauto |
| TechPetCage | Smart pet monitoring | A | LIVE | franciscoderek7.github.io/techpetcage/ | franciscoderek7/techpetcage |
| TechPackCage | Registered business (Stripe acct) | A | LIVE | franciscoderek7.github.io/techpackcage/ | franciscoderek7/techpackcage |
| MindShift by Michaella | Mental wellness AI | A | LIVE | franciscoderek7.github.io/mindshift-makayla/ | franciscoderek7/mindshift-makayla |
| SoulStack.ai | AI infrastructure layer | B | PENDING | soulstack.ai | PENDING |
| [Floors 14-44] | Space/Energy/Fintech Swarms + more | B | COMING SOON — shown in skyscraper | — | — |
| Francisco Phoenix (Floor 45) | Dynasty-level equity partner | B | SECRET — Konami code only | — | — |

**Target: 45 companies live Year 1 → $1B+ by 2035**
**NOTE: ccldr.net domain on 60-day hold — using GitHub Pages URL until resolved**
**NOTE: Stripe account under review ($406.80 pending) — use PayPal/Interac for all transactions**

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
| vaultvelocityauto.com | Vault Velocity Auto | B | ⬜ Set A+CNAME — DNS A-record typo confirmed by Derek (.15 should be .153); Derek fixing in Porkbun directly (2026-06-21) |
| zprimedoxaihq.com | ZPrimeDoxAI HQ | A | ⬜ Set A+CNAME — Derek confirmed (2026-06-21): legacy HTML site (`zprimedoxaihq-site/`) is the live build, NOT the Next.js rebuild (no Supabase secrets configured). `deploy-zprimedoxaihq-nextjs.yml` auto-trigger disabled to stop it overwriting the legacy deploy. |
| techpetcage.ca | TechPetCage | A | ⬜ Set A+CNAME — Derek confirmed owned (2026-06-21). `techpetcage.com` is NOT owned (see below) — `deploy-techpetcage.yml` and all in-repo references (canonical URLs, sitemap, contact emails) switched from `.com` to `.ca`. |
| kiaros.ai | Kiaros | B | ⬜ Set A+CNAME — Derek confirmed (2026-06-21) this is the domain to use; deploy already targeted this correctly. Site contact emails switched from `hello@kiaros.com` to `hello@kiaros.ai` to match. Legacy `kiaros-deploy.yml` (referenced `kiaros.dev`, deployed whole repo root) retired — auto-trigger disabled per Derek's order. |

**DISPUTED — DO NOT TREAT AS OWNED (2026-06-21):** `techpetcage.com` is NOT Derek's — a live web search found it serving an unrelated, real pet-breeding/training business in Belton, TX. Derek confirmed (2026-06-21) he owns `techpetcage.ca` instead — the site and deploy workflow now target that. `kiaros.com` and `kiaros.dev` are also not in use — Derek confirmed `kiaros.ai` is correct.

**OMNIGUARD.COM REPO CONFLICT — RESOLVED 2026-06-21:** Two repos both tried to claim `omniaguard.com` — legacy `franciscoderek7/omniaguard` (has real content) and new `franciscoderek7/omni-guard` (rebrand target, but `omni-guard-site/` is currently an **empty folder**, nothing built yet). Derek confirmed (2026-06-21): **keep the old repo live** until the rebrand is actually built — do not switch GitHub Pages custom domain to the new repo yet. Identity leaks found and fixed in the legacy `omniaguard-site/` (personal/parent-brand emails replaced with `enterprise@omniaguard.com` / `partnerships@omniaguard.com`). `free-scan.html`'s two "Book Full Audit" buttons point to `paypal.me/derekfranciaço1` — Derek's personal PayPal handle on an anonymous Loop B brand. This is a known zero-bleed tradeoff, not an oversight: Derek explicitly named `OmniaGuard` in his 2026-06-21 confirmed-handle payment table, so the leak is accepted by direct instruction rather than fixed.

**PAYPAL HANDLE — CONFIRMED 2026-06-21 (resolves the 2026-06-20 flag below):** Derek confirmed three times, the third "EXACT AS SHOWN IN ACCOUNT," that the real, working PayPal.me handle is `paypal.me/derekfranciaço1` (note: contains `ç`, not plain ASCII — PayPal.me normally restricts usernames to ASCII letters/numbers, so this is unusual but Derek insists it's literally what the account page shows). The old `franciscoderek7` handle referenced below has been replaced empire-wide with `derekfranciaço1`. Claude has no live network access to click-test the link or confirm money actually lands in the account — this could not be verified end-to-end, only that the URLs are now syntactically consistent and correctly formed across all files.

**NOT YET OWNED (confirmed by Derek 2026-06-19) — do not build live custom-domain deploy targets for these; use GitHub Pages URLs until purchased:** `primedoxai.com`, `cleanswarm.ca`, `mindshift-makayla.com`. (`ccldr.net` is owned but on the separately-tracked 60-day hold above — different case, don't conflate.)

**PAYPAL HANDLE — SUPERSEDED 2026-06-22:** Derek's 2026-06-21 triple-confirmation of `paypal.me/derekfranciaço1` (note above) has been overridden by a direct 2026-06-22 order: the `ç` was a copy/paste corruption, not a real PayPal.me username (PayPal.me usernames are ASCII-only and could never contain `ç`). Replaced `derekfranciaço1` → `derekfranciaco1` in 68 files across 14 site folders (everywhere except this historical log entry, kept as-is for the record). Two pages use a *third*, untouched variant, `paypal.me/derekfrancisco` (no `ç`, no `1`) — `weedlaw-education/course-sales.html` (live course-purchase button) and `zprimedoxaihq-site/empire-report-june11.html` (internal report, not linked, no live exposure). Left alone pending Derek's confirmation of which handle is actually correct.

**PAYPAL HANDLE — CORRECTED AGAIN 2026-06-22 (typo in the entry above, not a new Derek instruction):** The `derekfranciacao1` value used in the "SUPERSEDED" fix immediately above was Claude's own transcription error (an extra "a" — manually typed instead of copy-pasted, 16 characters instead of 15). Derek caught this by sending the real PayPal.me link (`paypal.me/derekfranciaco1`) followed by a screenshot of his actual PayPal app profile page showing username `@derekfranciaco1`, name "Derek Francisco," joined 2019. Verified character-by-character (`derekfranciaco1`, no double-a) before touching any files. Replaced `derekfranciacao1` → `derekfranciaco1` across all 72 previously-touched files plus this file. Post-fix verification: zero remaining `derekfranciacao1` matches; 512 occurrences of the corrected `derekfranciaco1`; the `ç` variant now exists only in the historical log line above (line 182) and in git's internal logs — not in any live site content. The two untouched third-variant pages (`weedlaw-education/course-sales.html`, `zprimedoxaihq-site/empire-report-june11.html`, both using plain `paypal.me/derekfrancisco`) are still unchanged, still flagged, still pending Derek's call on whether to fix them too.

**DEPLOY PIPELINE GAPS FOUND 2026-06-22 (during the PayPal fix push):** (1) `deploy-vault-velocity.yml`'s path filter is `vault-velocity-auto-site/**` but the real folder is `vaultvelocityauto-site/` (no hyphens) — this workflow has never actually triggered off changes to that site, on any branch. (2) `deploy-nightingale-console.yml` failed on this push: `git push origin main` after a fresh `git init`-equivalent clone, but the local default branch was `master`, not `main` — "src refspec main does not match any". Pre-existing workflow bug, unrelated to the PayPal content fix, not corrected here (out of scope of the requested fix). (3) Six workflows only trigger on `main`, not the `claude/francisco-revenue-sprint-MEva6` feature branch — `deploy-primedox.yml`, `deploy-docweedlaw.yml`, `deploy-weedlaw-education.yml`, `deploy-mindshift-makayla.yml`, `deploy-beno-x.yml`, `deploy-cleanswarm.yml`. The PayPal fix is committed to `primedoxai-site/`, `docweedlaw-site/`, `weedlaw-education/`, `mindshift-makayla/`, `beno-x-site/`, `cleanswarm-checkout/` on the feature branch, but **has not yet auto-deployed to those 6 live sites** — needs a merge to `main` (Derek sign-off required per CLAUDE.md) or a `workflow_dispatch` manual run.

**OmniGuard domain/repo correction (2026-06-19):** the new rebrand repo `franciscoderek7/omni-guard` deploys to `omniaguard.com` (the domain actually owned, confirmed by Derek) — NOT `omni-guard.com`, which isn't in this owned-domains list and doesn't exist as a registered domain. Fixed in `.github/workflows/deploy-omni-guard.yml`. Both the legacy `franciscoderek7/omniaguard` repo and this new repo now target the same `omniaguard.com` domain — GitHub Pages only serves one repo per custom domain, so **Derek must manually switch the custom-domain setting to the new `omni-guard` repo** (GitHub repo Settings → Pages → Custom domain) once he's ready for the rebrand to go live. Not done automatically by either workflow.

### 1a. "Fix Every Card on PrimeDox HQ" pass (2026-06-21)

Derek's audit of the 9 property cards on `zprimedoxaihq-site/index.html` (the zprimedoxaihq.com landing page). Source-of-truth for each fix was the confirmed-owned-domains table above + each site's actual `.github/workflows/deploy-*.yml` (whatever CNAME the live workflow writes is what's actually being served), not guesswork:

1. **CCLDR** — was linking straight to `ccldr.net` (still on the 60-day hold). Fixed both card instances to `https://franciscoderek7.github.io/Ccldr-net/` (confirmed via `deploy-ccldr.yml`'s clone target `franciscoderek7/Ccldr-net`).
2. **OmniGuard** — display name was the retired spelling `OmniaGuard` in 3 places on this page (zero-tolerance spelling violation per CLAUDE.md); fixed to `OmniGuard`. The link itself was already correct (`omniaguard.com`, the owned domain). "Doesn't work" is a DNS issue, not a code bug — Porkbun DNS Status table above still shows `omniaguard.com` as "⬜ Set A+CNAME," which is Derek's action item (queue #8), not something fixable from this repo.
3. **PrimeDox AI** — was linking to `primedoxai.com`, which is in the NOT-YET-OWNED list above. Changed to `zprimedoxaihq.com` (this page's own owned domain) per Derek's instruction, money-link repointed to `pricing.html` (the real access-paywall page on this domain — `emergency-defense.html` doesn't exist here).
4. **Vault Velocity Auto** — **REVISED 2026-06-21, supersedes the entry below.** Derek's first pass on this card flagged the live `vault-velocity-auto-site/index.html` as a fabricated-stats luxury auction marketplace ($47M+ sales, 2,400+ vehicles, 16K YouTube subs) and asked for it to become a vehicle-history/maintenance-plan service site instead. Derek then explicitly reversed that direction with a follow-up "LUXURY ONLY" order: front page rebuilt around a supercar (2024 Porsche 911 GT3 RS), a private jet (Gulfstream G650), and a 360' superyacht — headline "Where Legends Change Hands" kept verbatim per his instruction, new subhead "The world's most exclusive marketplace for supercars, jets, and yachts." All fabricated stats removed (no invented sales/vehicle/subscriber numbers); trust band uses honest non-numeric claims (Curated Listings, Verified Provenance, Discretion Guaranteed). Revenue model implemented as specified: $99/mo or $499/yr standard listing + 5% commission, optional $199/mo featured-placement add-on, $999/mo Premium Seller tier (unlimited listings, 3% commission, dedicated account manager). CTAs: "Browse Collection," "List Your Vehicle" (sell.html), "Request Private Viewing" (contact.html). **Not yet done:** the site's other pages (`auctions.html`, `sell.html`, `financing.html`, `shipping.html`, `dashboard.html`, `auction-detail.html`) still describe the old bidding-auction business model — index.html no longer links to most of them (only `sell.html`/`about.html`/`contact.html`/`legal.html` remain linked), but the orphaned files still exist standalone and need a follow-up rewrite/removal pass to match the new private-viewing/listing-fee model.
5. **Kiaros** — found a real domain mismatch: `.github/workflows/deploy-kiaros.yml` was writing CNAME `kiaros.com`, while every other record (Holding Structure, Site Tracker, this HQ card, the Stripe/PayPal-live note) uses `kiaros.ai`. A third legacy workflow (`kiaros-deploy.yml`, still wired to trigger on push to `main`) references a third domain, `kiaros.dev`. Fixed `deploy-kiaros.yml`'s CNAME to `kiaros.ai` to match the dominant record. **Flag for Derek:** neither `kiaros.ai` nor `kiaros.com` nor `kiaros.dev` appears in the confirmed-owned Porkbun table above — please confirm which one is actually registered. `kiaros-deploy.yml` is legacy/stale (deploys the whole repo root, not just `kiaros-site/`) and should probably be deleted, but deletion wasn't done here since Claude doesn't delete files without sign-off.
6. **TechPetCage** — site itself is real and built (`techpetcage-site/index.html`, not a placeholder), but every "Buy Now" button is an unconfigured `STRIPE_LINK_TPC_*` placeholder (honest-placeholder convention, not a bug) — can't process payments until Derek creates the Stripe Payment Links. `techpetcage.com` domain is confirmed owned but DNS Status above still shows "⬜ Set A+CNAME" — same as OmniGuard, this is Derek's action, not a code fix.
7. **CleanSwarm** — **unresolved contradiction in this file, flagged rather than guessed:** Holding Structure (§1) and Site Tracker (§2) both say CleanSwarm is LIVE at `cleanswarm.ca`, and the active `deploy-cleanswarm.yml` workflow has been pushing CNAME `cleanswarm.ca` to `franciscoderek7/cleanswarm` — but the NOT-YET-OWNED line above explicitly lists `cleanswarm.ca` as unowned (confirmed by Derek 2026-06-19). Left the HQ card pointed at `cleanswarm.ca` (the more heavily corroborated, already-functioning state) rather than risk breaking a live link by guessing wrong — **Derek needs to confirm: is `cleanswarm.ca` actually registered, or was that NOT-YET-OWNED note correct and this domain has been silently non-functional?**
8. **Weedlaw Education** — was linking to `ccldr.net` (wrong site entirely). It's a real, separately-built site (`weedlaw-education/index.html`, real "Doc Weedlaw Course Platform" content) deployed via `deploy-weedlaw-education.yml` to `franciscoderek7.github.io/weedlaw-education/` (no custom domain). Fixed both card instances to that URL, money-link to `course-sales.html`.
9. **Francisco Holdings** — verified: real content, true 45-floor building directory + Floor 45 Phoenix Konami-code egg both present in `francisco-holdings-site/index.html`. No bug found; left as-is.

**CCLDR backup requirement:** Derek asked for everything on `ccldr.net` to be copied/archived before the new site goes live. No separate scrape was needed — `ccldr-site/` in this repo is already the full, version-controlled source that `deploy-ccldr.yml` pushes live to `ccldr.net`, so git history here already is the backup. (Claude has no raw-HTML scraping tool — only a markdown-summarizing web fetch — so a byte-for-byte mirror of the live domain itself isn't something Claude can produce; not needed here since the source already lives in this repo.)

### 1b. "Build Empire Infrastructure Now (placeholders, no live keys)" pass (2026-06-21)

Derek's directive to wire up the shared payment/referral/AI-concierge framework with placeholders, real keys to follow once his Stripe account is verified. Most of the requested infrastructure (deploy pipeline, payment engine framework, referral engine, AI concierge routing) **already existed from earlier sessions** — this pass extended/corrected it rather than rebuilding from scratch:

1. **Payment engine** — `process.env.STRIPE_PUBLISHABLE_KEY` as literally requested does not work: these are static GitHub Pages sites with no Node build step, so `process` is undefined in the browser and every page using it would throw on load. Used the existing working equivalent instead — `window.EMPIRE_PAYMENTS.STRIPE_PK` in `stripe-config.js`, one shared file every site reads, same "flip one flag to go live" behavior Derek wants. Flagged inline in the file so a future session doesn't reintroduce the `process.env` bug.
2. **Per-floor pricing restructure** (per Derek's 3-5 tier directive, applied in `stripe-config.js`): OmniGuard $99/$299/$999/mo + custom Enterprise (was a 6-tier Starter–Imperium structure); CCLDR $99/$499/$1,499 one-time (was 5-tier $49–$2,499/mo); PrimeDox AI (zprimedox) $49/$149/$499/mo (was $199/$499/$1,999/mo); TechPetCage $199/$499/$999 one-time + existing per-item marketplace model kept alongside. Added a new `vaultvelocityauto` block matching the live luxury-marketplace site built earlier tonight ($99/$499/$999/mo). Old tier structures aren't deleted from the empire, just superseded in this config — recoverable from git history if Derek wants to revert.
3. **Referral/commission engine** (`agents/referral-engine.js`) — codes updated to match Derek's exact spec: `SENIOR`/`VETERAN`/`FIXED` prefixes → 10% (was 15/20/15%), `TERMINAL` prefix → 20% (renamed from `CARE`, was 25%). Recurring commission rate updated to 20% (was 15%); first-sale rate left at 25% (Derek's message only specified the recurring rate).
4. **AI concierge escalation** — `agents/primedox-router.js` and `agents/chat-widget.js` now both flag low-confidence/no-match queries and offer a "Talk to a Person" mailto link to `docweedlaw@gmail.com`. **Not verified:** Claude cannot confirm this inbox exists or is monitored — please confirm.
5. **Zero-tolerance spelling fix** — found and fixed ~15 leftover `OmniaGuard` instances across `agents/agent-config.js`, `agents/chat-widget.js`, `agents/primedox-router.js`, `agents/stripe-payment-links.js`, `agents/backend/gemma-server.js`, `agents/backend/create-assistants.js`. One of these (`gemma-server.js`'s Timmy/SoulStack oversight prompt) had the rebrand instruction *backwards* — it was telling the observer AI to enforce "OmniaGuard — not OmniGuard," i.e. literally the wrong direction. Fixed.
6. **Deploy pipeline** — already fully built (20 GitHub Actions workflows in `.github/workflows/`, one per floor, push-to-build-to-Pages). Nothing rebuilt here; confirmed working as-is.
7. **Branding note — flagged, not silently changed:** Derek's message said "Green/gold branding everywhere. No blue/pink." CLAUDE.md has an explicit, more specific, Derek-confirmed exception: OmniGuard is the *only* brand permitted to use blue (`#4A90E2`) / pink (`#E91E63`) as part of its 2026-06-19 rebrand. Treated the new instruction as applying to every floor except OmniGuard rather than silently overriding a standing written rule — **please confirm this is correct, or say explicitly if OmniGuard's blue/pink should also be dropped.**
8. **Still blocked on Derek's action, not a code task:** real Stripe Payment Links, Calendly events, Gumroad/Sellfy products, and Mailchimp/SendGrid keys — none of these can be created without Derek's account access. `STRIPE_LIVE` flag and every `PLACEHOLDER_`/`REPLACE_WITH_STRIPE_LINK` slot are ready to receive real values the moment they exist.

---

## 2. SITE DEPLOYMENT TRACKER

| Site | Market | Loop | Status | Deploy Workflow | Domain | Last Deploy |
|------|--------|------|--------|----------------|--------|-------------|
| OmniGuard | AI Security | B | LIVE (legacy, mobile fixed) — REBRAND PENDING (Manus rebuilding under franciscoderek7/omni-guard, blue/pink; Derek must flip Pages custom-domain to new repo to go live) | deploy-omniaguard.yml / deploy-omni-guard.yml | omniaguard.com | 2026-06-16 |
| CCLDR.net | Cannabis Education | A | LIVE → REDEPLOY READY | deploy-ccldr.yml | ccldr.net | 2026-06-07 |
| CCC.net | Cannabis Compliance | A | LIVE | — | ccc.net | 2026-04-15 |
| Weedlaw Education | Doc Weedlaw Platform | A | LIVE | — | weedlaw-education | 2026-05-31 |
| PrimeDox AI | AI Persona | A | LIVE → REDEPLOY READY | deploy-primedox.yml | primedoxai.com | 2026-06-07 |
| Kiaros | AI Consulting | B | LIVE | kiaros-deploy.yml | kiaros.ai | 2026-06-03 |
| CleanSwarm | Cleaning SaaS | B | LIVE → REDEPLOY READY | deploy-cleanswarm.yml | cleanswarm.ca | 2026-06-07 |
| Francisco Holdings | Parent Holding Co — 45-Floor Skyscraper | A | LIVE — DEPLOYING | deploy-francisco-holdings.yml | franciscoholdingsinc.com | 2026-06-13 |
| ZPrimeDoxAI HQ | AI Concierge HQ (6 specialists, KB routing) | A | LIVE | deploy-zprimedoxaihq.yml | zprimedoxaihq.com | 2026-06-13 |
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
| Year 1 (2026) | $1M ARR | IN PROGRESS — 45 floors live |
| Year 2 (2027) | $4.2M ARR | PLANNED |
| Year 3 (2028) | $42M ARR | PLANNED |
| Year 4 (2029) | $400M+ ARR | PLANNED — skyscraper ARR bars show $8.5M Yr4 / $22M Yr5 |
| Year 5 (2030) | $1B+ ARR | PHOENIX DOMINION TARGET |

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
| 2 | ~~AI Concierge HQ (zprimedoxaihq.com) — 6 specialists, KB routing~~ | Claude | 2026-06-13 | ✅ COMPLETE — pw: FHI2026 |
| 3 | ~~45-Floor Phoenix Dominion Skyscraper (franciscoholdingsinc.com)~~ | Claude | 2026-06-13 | ✅ COMPLETE — DEPLOYING |
| 4 | ~~Bootstrap all 14 missing GitHub Pages repos~~ | Claude | 2026-06-13 | ✅ COMPLETE — both bootstrap runs: success |
| 5 | ~~Chatbot routing fixes (CCLDR/OmniaGuard/CleanSwarm/pricing)~~ | Claude | 2026-06-13 | ✅ COMPLETE |
| 6 | ~~Force-merge feature branch → main~~ | Claude | 2026-06-13 | ✅ COMPLETE |
| 7 | BTC + XMR wallet addresses on site | Derek → Claude | ASAP | PENDING — awaiting addresses |
| 8 | Porkbun DNS for all domains (185.199.108-111.153) — CONFIRMED 2026-06-19: A records were entered as `.15` instead of `.153`, breaking custom-domain GitHub Pages resolution (e.g. vaultvelocityauto.com). Fix: edit each A record in Porkbun/Cloudflare to end in `.153`, save, wait 5-10 min for propagation | Derek (browser) | ASAP | PENDING |
| 9 | Custom domain HTTPS in GitHub Pages settings | Derek (browser) | After DNS | PENDING |
| 10 | ccldr.net domain — 60-day hold resolves | Derek (wait) | ~Aug 2026 | PENDING |
| 11 | File provisional patents CIPO/USPTO (8 inventions) | Derek → IP lawyer | ASAP | PENDING — NOT filed yet despite Phoenix Dominion text |
| 12 | ~~Stripe account recovery~~ | Derek | DONE | ✅ COMPLETE — acct_1TG0cIASsTLqnu8V LIVE as of June 2026 |
| 13 | ~~PayPal.me links: derekfrancisco → franciscoderek7 CA format~~ | Claude | DONE | ✅ COMPLETE — 33 files fixed 2026-06-15 |
| 14 | Francisco Realty — RECO licensing | Derek | Q4 2026 | PENDING |
| 15 | Francisco Legal — partner lawyer network | Derek | Q1 2027 | PENDING |
| 16 | Crypto wallet addresses (BTC/XMR/ETH) to wire into skyscraper | Derek → Claude | When ready | PENDING |
| 17 | SoulStack.ai domain registration | Derek | When funded | PENDING |
| 18 | Extend skyscraper to 80 floors (Floors 46-80 Phoenix Dominion) | Claude | On order | PENDING — 45 floors live first |
| 19 | ~~Empire-wide referral engine~~ | Claude | 2026-06-15 | ✅ COMPLETE — referral-engine.js + discount tiers + commission tracking |
| 20 | ~~Add Stripe buttons to all 45 skyscraper floors~~ | Claude | 2026-06-15 | ✅ COMPLETE — PayPal + Stripe per floor |
| 21 | ~~OmniaGuard $500 deep audit upsell~~ | Claude | 2026-06-15 | ✅ COMPLETE — free-scan.html upsell + comparison table |
| 22 | Add Stripe Price IDs to payment-provider.js | Derek (Stripe dashboard) | ASAP | PENDING — create at dashboard.stripe.com then send to Claude |
| 23 | Create PayPal Business recurring buttons | Derek (PayPal dashboard) | ASAP | PENDING — paypal.com/buttons |
| 24 | Supabase referral_commissions table | Derek (Supabase) | ASAP | PENDING — table not yet created |
| 25 | ~~Pricing pages: Kiaros/VaultVelocity/TechPackCage/Vigilax/TechPetCage~~ | Claude | 2026-06-15 | ✅ COMPLETE |
| 26 | ~~"Fix every card on PrimeDox HQ" pass — see §1a below for full breakdown~~ | Claude | 2026-06-21 | ✅ COMPLETE (8/9 cards fixed; CleanSwarm domain ownership flagged, not guessed) |

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

### VIGILAX — 4-Page Commercial Site — ✅ UPDATED 2026-06-20 (MONEY ONLY pass)
| File | Description | Status |
|------|-------------|--------|
| vigilax-site/index.html | Landing page (hero + terminal + SVG architecture diagram + testimonials + email capture) | ✅ COMMITTED |
| vigilax-site/pricing.html | 4-tier pricing — Sentinel $199/mo, Guardian $499/mo, Fortress $1,499/mo, Custom $10k+ | ✅ COMMITTED — Manus added the file after the 2026-06-19 audit note below; repriced to Derek's exact spec 2026-06-20 |
| vigilax-site/investor.html | Investor relations ($300B market, IP assets, Y1-Y5 projections, Derek Francisco team) | ✅ COMMITTED — added by Manus, not re-audited this pass |
| vigilax-site/deploy.html | Purchase + 5-step deployment guide + 24hr SLA guarantee | ✅ COMMITTED — added by Manus, not re-audited this pass |

**VIGILAX is Loop B: no Derek Francisco identity, no cannabis, no paypal.me/derekfrancisco**

**FIX 2026-06-20 (MONEY ONLY directive):** All 3 "Pay by Card (Stripe)" buttons on pricing.html called `window.stripeCheckout(...)`, a function that does not exist anywhere except inside `omniaguard-site/index.html` — clicking did nothing. Rewired to `window.PrimeDoxPayment.checkout(...)` (already loaded on the page via `agents/payment-provider.js`), which falls back to a correctly-directed PayPal checkout (money → franciscoderek7). Also repriced Sentinel/Guardian/Warden ($499/$2,499/$5,000) → Sentinel/Guardian/Fortress ($199/$499/$1,499) per Derek's exact spec, and added a "Start 24-Hour Free Trial" button on every tier (`vigilaxStartTrial()`, localStorage + Formspree capture — same `YOUR_FORM_ID` placeholder pattern as primedoxai-site/pricing.html; Derek needs to create a Formspree form and paste the real ID in both places). The same dead `window.stripeCheckout` bug was found and fixed on TechPackCage and TechPetCage (see below) — Vault Velocity Auto's *stub* folder `vaultvelocityauto-site/` has it too but is **not deployed by any workflow** (the real, live site is `vault-velocity-auto-site/` — note the hyphens — which has no Stripe/PayPal checkout at all; flagged separately, not fixed this pass).

**AUDIT NOTE (2026-06-19, Manus live audit during CHECKPOINT v10 — superseded by the fix above):** This log entry said all 4 files were "✅ COMMITTED" on 2026-06-11. Manus's direct repo audit at the time found only `index.html` actually existed. Manus has since added the other 3 files (confirmed in repo as of 2026-06-20).

### Monetization Additions
| Site | Addition | Status |
|------|----------|--------|
| OmniaGuard pricing.html | Urgency banner (pulse dot) + VIGILAX upsell section + email capture | ✅ COMMITTED |
| Francisco Holdings services.html | Urgency banner (20% off Q2) + partner strip + social proof | ✅ COMMITTED |
| MindShift/Makayla index.html | Merchandise grid (4 items, PayPal.me links) + affiliate section + donations + newsletter | ⚠️ PARTIAL — merch grid (4 items) and chat widget confirmed live by Manus's 2026-06-19 audit; affiliate section, donations, and newsletter were logged COMMITTED here but Manus found them missing — closing the gap now under CHECKPOINT v10. |

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

**FIX 2026-06-20 (MONEY ONLY directive):** Same dead `window.stripeCheckout` bug as VIGILAX (see above) — all 3 "Pay by Card (Stripe)" buttons (Starter $49, Growth $149, Enterprise $499) rewired to `window.PrimeDoxPayment.checkout(...)`. PayPal buttons next to them were already correctly wired (paypal.me/derekfranciaço1) and untouched. TechPetCage (`techpetcage-site/index.html`) had the identical bug on its Basic $19 / Plus $49 / Family $149 tiers — fixed the same way.

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
| STRIPE_LINK_VIGILAX_SENTINEL | VIGILAX Sentinel | $199/mo (corrected 2026-06-20) |
| STRIPE_LINK_VIGILAX_GUARDIAN | VIGILAX Guardian | $499/mo (corrected 2026-06-20) |
| STRIPE_LINK_VIGILAX_FORTRESS | VIGILAX Fortress | $1,499/mo (corrected 2026-06-20, was "Warden $5,000/mo") |
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

## 15. SESSION LOG — June 11 (Continued)

### Fixes Applied
| File | Change | Status |
|------|--------|--------|
| techpetcage-site/index.html | Added CSS for .pay-options, .pay-btn, .pay-stripe, .pay-paypal, .pay-interac, .pay-email, .pay-options-dark payment button styles | ✅ COMMITTED |
| francisco-holdings-site/index.html | Fixed 4 "Begin the Conversation" buttons — contact@franciscoholdings.com → franciscoderek7@gmail.com | ✅ COMMITTED |
| francisco-holdings-site/index.html | Changed --pink: #e8a0b8 → --green: #2E8B5A (empire green palette alignment) | ✅ COMMITTED |
| francisco-holdings-site/index.html | Added dead-link JS fix — converts co-link[href="#"] to mailto:franciscoderek7@gmail.com with company name in subject; wires live sites (OmniaGuard, CCLDR, PrimeDox AI, TechPetCage) to their real URLs | ✅ COMMITTED |

### Stripe Placeholders — TechPetCage Membership (Still Needed)
| Placeholder | Plan | Monthly Price |
|-------------|------|--------------|
| STRIPE_LINK_TPC_BASIC | Basic Plan | $19 CAD/mo |
| STRIPE_LINK_TPC_PRO | Pro Plan | $49 CAD/mo |
| STRIPE_LINK_TPC_KENNEL | Kennel Plan | $149 CAD/mo |

→ Create at dashboard.stripe.com → Payment Links → paste `buy.stripe.com/xxx` to Claude for immediate wiring

---

**PRICING PAGES BUILT 2026-06-22:** Per Derek's "MASTER PROMPT" order, built unique-design `/pricing.html` pages for 7 of the 8 requested sites: `zprimedoxaihq-site/` (PrimeDox AI), `vigilax-site/` (VIGILAX), `francisco-holdings-site/` (new file), `cleanswarm-checkout/` (CleanSwarm), `techpetcage-site/` (new file), `vault-velocity-auto-site/` (new file — NOT the smaller unused `vaultvelocityauto-site/` folder, which is not wired to any deploy workflow). Each has a self-contained inline HTML/CSS/JS page: 4 pricing tiers, a demographic discount selector (Senior 10% / Veteran 15% / Fixed Income 10%, no Terminal Illness — that's cannabis-only), a referral code input (regex `^[A-Za-z0-9]{4,12}$`, flat +5%, capped combined discount at 35%, stored in `localStorage` key `referralCode`), and PayPal `<a href="#PASTE-PAYPAL-LINK-HERE">` placeholders for Derek to fill in. No blue/pink used anywhere (reserved for OmniGuard only), no personal contact info, no Stripe (per "Stripe locked" instruction), no fake urgency/testimonials.

**CCLDR pricing page handled differently (additive, not a rebuild):** `ccldr-site/pricing.html` already had a live, revenue-generating 5-tier structure with real `paypal.me/derekfranciaco1` links and its own annual/monthly toggle — overwriting it with placeholder links would have been a regression. Instead, added a new "Weedlaw Education" section (Course $79 / Certification $199 / Partnership $499 / White Label $999) below the existing tiers, using the same real verified PayPal handle (matching the page's existing convention) and a scoped discount selector that includes the Terminal Illness (20%) option, since this is the cannabis-context site. New buttons carry `data-paypal-product` attributes so the existing `referral-engine.js` (already loaded on this page, prefix-coded referral system: TERMINAL 50% / FIXED 40% / VETERAN 35% / SENIOR 30% / general 10% — a different, larger-discount mechanic than the new flat-5%-referral system used on the other 6 pages) auto-injects its own widget under them, avoiding a duplicate/conflicting referral UI on one page.

**NOTE — two different referral discount systems now coexist empire-wide, flagged for Derek's awareness:** `agents/referral-engine.js` (prefix-coded codes like `SENIOR2026`, larger %s, used on CCLDR) vs. the flat 5%-on-any-valid-code system on the 6 new pricing pages. Not reconciled — Derek should decide if these should be unified.

**OmniGuard pricing page skipped (needs Derek's input):** `omni-guard-site/` (the active rebrand deploy target for omniaguard.com) is currently empty in this repo — building a pricing page there and letting it deploy would wipe out whatever Manus has live, since the deploy workflow does a full wipe-and-replace from that folder. Per CLAUDE.md's standing caution not to silently edit the OmniGuard site without confirming scope, this was left undone. OmniGuard tiers from Derek's master prompt (Personal $39 / Business $89 / Enterprise $179 / Critical $349) are logged here so they aren't lost.

**TechPetCage PayPal handle updated 2026-06-22:** Derek confirmed `paypal.me/techpetcage` as TechPetCage's own business PayPal handle. Replaced `paypal.me/derekfranciaco1` → `paypal.me/techpetcage` in `techpetcage-site/index.html` (4 occurrences) and filled in the same handle on the new `techpetcage-site/pricing.html` placeholders. **NOT** applied to any other site — a separate, unverified instruction asked to route ALL 45+ empire sites' payment buttons to this TechPetCage business account, which was declined pending stronger justification/verification (see chat log), consistent with this session's PayPal-handle verification standard after an earlier typo incident.

---

*Updated: 2026-06-22 | Session: Francisco Revenue Sprint (cont.) | Builder: Claude*
*Source of truth for the Francisco Holdings empire. Update after every deployment.*
