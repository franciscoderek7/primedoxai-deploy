# MASTER PROMPT — EMPIRE-WIDE VISUAL DIFFERENTIATION REVAMP
**For: Manus AI**
**From: Derek Francisco (PrimeDox), Francisco Holdings Inc.**
**Repo: `franciscoderek7/primedoxai-deploy`**
**Objective: Make every site in this empire visually distinct from every other site. No two brands should look like the same template with swapped text.**

---

## 0. YOUR ROLE

You are doing a visual/design revamp pass across ~50 static HTML sites that currently share too much DNA (same layout skeletons, same color logic, same component shapes). Derek's businesses span cannabis law, AI security, fintech, autos, family office, and a dozen "swarm" sector brands — right now several of them are visually indistinguishable from each other except for the headline text. Your job is to give each one (or each cluster, where sites are legitimately sub-brands of one parent) a genuinely distinct design identity: different color system, different type pairing, different layout grid, different motion language, different imagery/iconography style.

**Do not touch backend logic, payment integrations, JS functionality, or copy/content meaning.** This is a visual/CSS/layout pass, not a rewrite. Preserve every existing feature (payment modals, currency converters, forms, calculators, filters) — just re-skin them.

---

## 1. NON-NEGOTIABLE CONSTRAINTS (violating any of these is a failed task)

1. **Zero Bleed Rule**: OmniGuard, Vigilax, Kiaros, SoulStack, CleanSwarm (Loop B / anonymous brands) must **never** reference cannabis, Derek Francisco by name, or legal/cannabis imagery. CCLDR, Doc Weedlaw, Beno-X, Weedlaw-* sites (Loop A) must **never** reference AI security products, swarm tech, or threat-detection language. Cross-contamination between loops is a critical failure.
2. **No personal info on public sites**: never add or surface `derek@franciscoholdings.com`, `705-307-8080`, the Kent St W address, or postal code `K9V 2Z8` anywhere in a public-facing page.
3. **Brand spelling — zero tolerance**: `OmniGuard` (rebranded 2026-06-19, formerly OmniaGuard — never use the old name; never Omni Guard/OMNIGUARD), `SoulStack` (never Soulstack/Soul Stack), `Kiaros` (never kiaros/KIAROS), `PrimeDox` (never Primedox — PrimeDocs is a different entity), `Francisco Holdings Inc.` (never just "Francisco Holdings" or "FHI" in headers).
4. **Do not change**: payment links/buttons (PayPal.me/franciscoderek7, Interac docweedla@gmail.com, BTC address, Stripe checkout calls), GitHub repo URLs, email addresses, Supabase keys, Stripe publishable keys. Never introduce or expose a Stripe **secret** key (`sk_live_`/`sk_test_`) in any frontend file.
5. **No new domains, no new repos.** Work only within the existing site folders in this repo (or the separate `omniaguard` repo if you're given access to it).
6. **Branch discipline**: create one branch per site-cluster (see naming convention in §5). Never push directly to `main`. Never force-push, never delete branches.
7. **Mobile-first**: every redesign must be tested/responsive down to 360px width (Samsung-class devices). No horizontal overflow, no squished grids, no text clipping.
8. **Don't break what works**: if a site has a working calculator, currency converter, payment modal, filter system, or animation — it must still work identically after the redesign. Re-skin, don't gut.

---

## 2. THE PROBLEM

Most of these sites were scaffolded from the same generator and share: the same dark navy/cyan gradient hero, the same card-grid stats section, the same pill-shaped badges, the same sans-serif type stack, the same button shapes. Visually scanning the empire today, you cannot tell `space-swarm-site` apart from `biotech-swarm-site` apart from `fintech-swarm-site` except by reading the words. That sameness undermines credibility — it looks like 50 instances of one template, not 50 real companies.

## 3. THE DIFFERENTIATION FRAMEWORK

For every site (or cluster), assign a unique combination across these six axes. **No two sites in the same cluster-tier may share more than one axis value.**

| Axis | What varies |
|------|-------------|
| **Color system** | Base palette + accent (not just "swap the accent color" — vary saturation, contrast, light/dark balance) |
| **Type pairing** | Headline font family + body font family (serif/sans/mono combinations, weight, tracking) |
| **Layout grid** | Symmetric centered vs. asymmetric split vs. editorial column vs. dashboard-tile vs. single-column narrative |
| **Motion language** | Subtle fade-ins vs. mechanical/glitch vs. organic/fluid vs. none (static/editorial) |
| **Imagery/iconography** | Photography vs. line-icon vs. abstract gradient blobs vs. data-viz/charts vs. illustration |
| **Voice-coded chrome** | Corporate/institutional vs. tactical/military vs. clinical/lab vs. consumer-playful vs. luxury-minimal |

Below are concrete assignments for every live or near-live site, grouped by cluster. Use these as your starting brief — you have creative license on exact hex values and fonts as long as you stay inside the lane described and don't collide with a neighboring brand's lane.

---

## 4. PER-SITE / PER-CLUSTER DESIGN DIRECTION

### A. Flagship anchors (already have a working distinct identity — preserve, polish, do not genericize)
| Site | Folder | Current identity — KEEP |
|------|--------|--------------------------|
| Francisco Holdings | `francisco-holdings-site` | 45-floor skyscraper concept, black/gold, corporate-finance |
| OmniGuard | `omniaguard-site` (folder predates rebrand — confirm with Derek before editing; Manus is rebuilding under omni-guard.com) | **SUPERSEDED 2026-06-19** — rebranded from OmniaGuard. New identity: blue `#4A90E2` / pink `#E91E63` (OmniGuard-exclusive colors, empire-wide ban on blue/pink elsewhere) |
| ZPrimeDoxAI HQ | `zprimedoxaihq-site` | Green/gold/black concierge luxury, empire-index master page |
| Vault Velocity Auto | `vault-velocity-auto-site` | Dubai luxury auto marketplace, Burj Khalifa hero, gold/black |

### B. Cannabis / legal-defense cluster (Loop A — Derek visible, zero AI-security language)
| Site | Folder | Distinct direction |
|------|--------|---------------------|
| CCLDR | `ccldr-site` | Constitutional/courtroom editorial: deep forest green + aged parchment cream, serif headlines (Georgia/Lora-style), document/case-file layout with numbered sections |
| CCLDR Academy | `ccldr-academy-site` | Educational/campus: warm terracotta + navy, rounded sans headline, lesson-card grid layout |
| Doc Weedlaw (main) | `docweedlaw-site` | Personal-brand/authority: Derek's portrait-forward layout, charcoal + amber, bold condensed headline type |
| Doc Weedlaw Media | `doc-weedlaw-media-site` | Press/magazine: editorial 2-column masthead layout, black/white/red accent, big pull-quotes |
| Beno-X | `beno-x-site` | Tactical defense network: matte olive + black, stencil/military type, grid-overlay background |
| Weedlaw Defense Network | `weedlaw-defense-network-site` | Network/coalition: interconnected node-map imagery, slate blue + safety orange |
| Weedlaw Publishing | `weedlaw-publishing-site` | Book/publishing house: cream paper texture, classic serif, spine-label color blocks |
| Weedlaw Trinity | `weedlaw-trinity-site` | Three-pillar concept: triptych layout (literally 3 columns everywhere), deep purple + gold |
| Canna Deliver | `canna-deliver-site` | Consumer delivery app: playful rounded cards, leaf-green + white, mobile-app-mockup hero |
| Cannabis Compliance Canada | `cannabis-compliance-canada-site` | Government/regulatory: red+white Canada palette, formal institutional layout, checklist/badge motifs |
| Global Cannabis Alliance | `global-cannabis-alliance-site` | International coalition: world-map motif, teal + gold, flag-strip accents |
| CCC | `ccc-site` | Compliance certification body: navy + silver, seal/certificate badge iconography |

### C. AI-security / swarm-tech cluster (Loop B — anonymous, zero cannabis language)
| Site | Folder | Distinct direction |
|------|--------|---------------------|
| Vigilax | `vigilax-site` | War-room/enterprise threat response: black + blood-red, monospace terminal type, radar-sweep motion |
| Kiaros | `kiaros-site` | AI strategy consulting, minimalist/zen: warm cream + muted gold, generous whitespace, thin-weight serif headlines, no tech clichés |
| SoulStack | `soulstack-site` | Observer-AI infrastructure layer: ethereal abstract, deep indigo/violet gradients, flowing particle/neural-thread visuals |
| CleanSwarm | `cleantech-automation-site` | Clean autonomous tech: white + teal, dot-grid swarm pattern, crisp rounded-corner cards |
| Cyberguard | `cyberguard-site` | Classic cybersecurity terminal: pure black + neon green, scanline/CRT texture, fixed-width type |
| Omnia Shield | `omnia-shield-site` | Enterprise B2B armor (sister to OmniGuard's consumer angle): slate gray + chrome silver, angular/faceted shapes. **No blue or pink** — those are OmniGuard-exclusive empire-wide |
| Aero Shield | `aero-shield-site` | Aviation/airspace security: sky blue gradient + steel gray, radar-ring iconography, horizon-line layout |
| Sovereignty | `sovereignty-site` | Data sovereignty/vault: deep purple + antique gold, fortress/vault imagery, heavy borders |
| Sovereignty Data | `sovereignty-data-site` | Data-specific sibling: same purple family as Sovereignty but swap gold for electric teal, data-stream visual motif (distinguish from parent) |
| AI Governance Canada | `ai-governance-canada-site` | Government/policy: red+white Canada formal palette, institutional serif, policy-document layout |
| Defense Swarm | `defense-swarm-site` | (see §D — sector swarm) |
| Agent Swarm Tech | `agent-swarm-tech-site` | Parent/meta swarm brand: brushed chrome + electric blue, abstract node-network diagram as hero visual |

### D. The 12 sector-swarm sites (currently most likely to look like clones — give each a hard sector-specific palette + motif, no shared cyan/navy default)
| Site | Folder | Sector palette | Motif |
|------|--------|-----------------|-------|
| Space Swarm | `space-swarm-site` | Deep space navy/black + starfield white | Orbital rings, satellite trajectories |
| Auto Swarm | `auto-swarm-site` | Carbon-fiber black + racing red | Speed-line motion blur, tire-tread texture |
| Quantum Swarm | `quantum-swarm-site` | Ultraviolet/electric purple + black | Particle/wave interference patterns |
| Biotech Swarm | `biotech-swarm-site` | Clinical white + emerald green | DNA helix, molecular bond lines |
| Health Swarm | `health-swarm-site` | Soft clinical blue + white | Heartbeat/pulse-line motif, rounded clinical cards |
| Med Swarm | `med-swarm-site` | White + surgical cyan | Precision crosshair/scalpel-line iconography |
| Pharma Swarm | `pharma-swarm-site` | Navy + muted teal | Capsule/pill-shape repeating pattern |
| Fintech Swarm | `fintech-swarm-site` | Deep green + gold | Ticker-tape, candlestick chart motif |
| Energy Swarm | `energy-swarm-site` | Amber/sunset gradient + sky blue | Solar-panel grid, wind-turbine blade curves |
| Logistics Swarm | `logistics-swarm-site` | Steel gray + safety orange | Route-line map, shipping-container grid |
| Defense Swarm | `defense-swarm-site` | Matte black + crimson | Radar sweep, tactical grid overlay |
| Supply Chain Pro | `supplychain-pro-site` | Industrial gray + cobalt blue | Conveyor/network-node diagram |

**Rule for this cluster specifically**: no two swarm sites may share the same primary hue family. Audit the full set together before starting — if two land on similar blues, reassign one.

### E. Family office / holdings / ventures cluster
| Site | Folder | Distinct direction |
|------|--------|---------------------|
| Kent Street Holdings | `kent-street-holdings-site` | Boutique real-estate holding: warm stone/taupe tones, architectural blueprint-line accents |
| Francisco Family Office | `francisco-family-office-site` | Heritage/trust: navy + cream, classic serif, generational/legacy framing, understated luxury |
| Francisco Ventures | `francisco-ventures-site` | Modern VC: electric blue gradient + white, bold geometric sans, portfolio-grid layout |
| Lindsay Innovation | `lindsay-innovation-site` | R&D/innovation lab: clinical white + signal orange, lab-notebook grid lines |

### F. Consumer product brands
| Site | Folder | Distinct direction |
|------|--------|---------------------|
| Tech Pet Cage | `tech-pet-cage-site` / `techpetcage-site` | Playful consumer hardware: rounded shapes, warm coral + cream, pet-paw iconography (consolidate duplicate folders — flag for Derek, see §6) |
| Tech Pack Cage | `techpackcage-site` | Travel/storage tech: rugged charcoal + safety yellow, modular-grid packing-cube motif |
| KoolDuce Motors | `koolduce-motors-site` | Distinct from Vault Velocity Auto — budget/everyday auto marketplace: bright white + cobalt blue, friendly rounded sans, no luxury cues |

### G. PrimeDox cluster
| Site | Folder | Distinct direction |
|------|--------|---------------------|
| PrimeDox AI | `primedoxai-site` | AI persona/clone — warm bronze + black, portrait-driven hero, human-but-futuristic |
| PrimeDox Email | `primedox-email-site` | Utilitarian SaaS product page: clean blue/white, inbox-UI mockup imagery |
| PrimeDox Health | `primedox-health-site` | Calming clinical AI health vertical: sage green + white, soft rounded cards |

### H. Other standalone
| Site | Folder | Distinct direction |
|------|--------|---------------------|
| Constitutional Defense Labs | `constitutional-defense-labs-site` | Academic/legal R&D: deep maroon + parchment, footnote/citation-styled layout |
| Empire Hub | `empire-hub-site` | Internal dashboard utility (not public marketing) — keep purely functional, dense data-table aesthetic, dark slate |

---

## 5. WORKFLOW & DELIVERY

1. **Branch per cluster**: `claude/manus-revamp-<cluster-name>` (e.g. `claude/manus-revamp-swarm-sites`, `claude/manus-revamp-cannabis-cluster`). Do not lump unrelated clusters into one branch.
2. **One commit per site** within each branch, descriptive message naming the site and what changed (color system, type, layout).
3. **Never push to `main`.** Push each branch to origin and stop — Derek/Claude will review and merge.
4. **Before/after note**: for each site, include a 2-3 line summary of what design lane it was assigned and why it's now distinct from its nearest neighbor.
5. **Do not** rename files, move directories, or change `<title>`/meta/SEO content unless it conflicts with the new brand spelling rules in §1.3.

## 6. FLAG, DON'T FIX (report these, don't auto-resolve)

- **Duplicate auto-brand folders**: `vault-velocity-auto-site`, `vaultvelocityauto-site`, and `velocity-vault-site` all appear to exist for the same brand. Do not redesign all three — flag this to Derek for consolidation before spending design effort on it.
- **Duplicate pet-tech folders**: `tech-pet-cage-site` and `techpetcage-site` both exist. Flag for consolidation.
- Any site folder you find with placeholder/lorem content or no real copy — flag it as "not ready for visual revamp" rather than designing around fake content.

## 7. QA CHECKLIST (every site, before you call it done)

- [ ] Loads correctly at 360px, 768px, 1440px widths — no horizontal scroll, no clipped text
- [ ] All existing buttons/links/forms/calculators still function exactly as before
- [ ] No cannabis content on any Loop B site; no AI-security language on any Loop A site
- [ ] Brand name spelling matches §1.3 exactly
- [ ] No personal contact info introduced
- [ ] No secret keys, no hardcoded payment amounts changed
- [ ] Color/type/layout combination doesn't collide with any other site in the same cluster tier
- [ ] Page weight reasonable — no multi-MB unoptimized images added

---

*End of master prompt. Paste this entire document to Manus as the task brief.*
