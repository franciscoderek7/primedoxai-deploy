# FHI REVENUE READINESS — AUDIT, TEST, PROPOSE

Date: 2026-11-01
Repository: `franciscoderek7/primedoxai-deploy`
Working branch: `claude/revenue-intake-review` @ `2a4558a`
`main` @ `fe20af45` · MEva6 @ `a267cc60`
Working tree: **17 held changes preserved untouched.** Nothing reset, cleaned,
stashed or overwritten. No deploy, no charge, no email, no production config
change. No secret printed. **Nothing committed or pushed for this audit.**

Audit work was done in a disposable copy under the session scratchpad.

---

## 0. THE FINDING THAT REFRAMES EVERYTHING

> **`main` is a CDN origin. Every live site loads its checkout code from
> `main` through jsDelivr, independently of any deploy workflow.**

**29 HTML files** contain:

```html
<script src="https://cdn.jsdelivr.net/gh/franciscoderek7/primedoxai-deploy@main/agents/payment-provider.js"></script>
```

Files served live from `main` this way:

| Served file | HTML files loading it |
|---|---|
| `agents/referral-engine.js` | 22 |
| `agents/payment-provider.js` | **19** |
| `agents/apex-agent.js` | 12 |
| `agents/stripe-payment-links.js` | 6 |
| `agents/access-guard.js` | 6 |
| `agents/chinese-ai-connector.js` | 3 |
| `agents/chat-widget.js` | 2 |
| `agents/agent-config.js` | 2 |
| `agents/gemma-chat-widget.js` | 1 |

**This is a production deployment surface the workflow audit did not cover.**
The deployment manifest counted 39 workflows and 26 armed branches; it did not
record that a push to `main` changes live checkout behaviour on every site
through a CDN, with no workflow involved. `@main` is a branch ref, so jsDelivr
caches it (roughly 12 hours) — changes propagate with delay, not instantly.

### And it inverts the PayPal-handle finding

| Copy | `techpetcage` | `derekfranciaco1` |
|---|---|---|
| **`main` — the file actually served to customers** | **31** | **0** |
| worktree / branch copy | 0 | 31 |

Blobs: `main` = `cab6d8d2…`, worktree = `15e447be…`. The diff is **only** the
handle swap plus an `OmniGuard` → `OMNIAGUARD` comment rename — 94 diff lines,
no logic change.

**Live checkout already uses `techpetcage`. The branch is the regression.**

My earlier report said 165 links sit on a retired handle. That count was taken
from the branch, and for every button routed through `PrimeDoxPayment.checkout()`
the handle comes from the CDN file on `main` — which is correct. The earlier
report should not be used to justify a deploy.

**The live risk runs the other way:** deploying `francisco-holdings-site/` or
`omniaguard-site/` from this branch, or merging this branch into `main`, would
**overwrite the correct live handle with the retired one.** That is precisely
what AUTH-2 and AUTH-3 would have done. Holding those deploys was the right
call.

---

## 1. REVENUE BLOCKER MATRIX

Severity is measured by "can a willing customer complete a payment".

| # | Blocker | Severity | Verified how | Fix size |
|---|---|---|---|---|
| **B1** | **14 of 20 live checkout buttons open a PayPal page with NO amount.** The customer must guess the price. | **CRITICAL** | traced through the live code with an offline harness; 16/16 tests | 14 map entries |
| **B2** | **`primedoxai-site/pricing.html:1853` POSTs the visitor's email and free-text "situation" to `https://formspree.io/f/YOUR_FORM_ID`** — a non-existent third-party endpoint — then swallows the failure and shows a success panel. | **CRITICAL** (lead loss + data sent to a third party) | source read; the `fetch` is unguarded, unlike every other Formspree call site | 1 guard |
| **B3** | **`canadian-cannabis-consulting-site/index.html:515-525` tells the visitor "✓ Checklist on its way! Check your inbox within 5 minutes"** while transmitting nothing. The lead is written to the visitor's own `localStorage`. | **HIGH** (false promise to a prospect) | source read | 1 message + 1 ID |
| **B4** | **10 Apex exit-intent popups capture leads into the visitor's own browser and transmit nothing.** Derek can never read them. | **HIGH** (silent lead loss) | `agents/apex-agent.js:173` guard | 1 ID, 10 call sites |
| **B5** | **The $500 strategy session cannot be bought.** `fh-strategy-500` has a valid live PayPal URL but **no page sells it**, and `strategy-session.html` does not exist in this repository. | **HIGH** (blocks the stated $1,000 path) | 0 HTML references | needs a page |
| **B6** | **The $249 assessment captures nothing.** `shared/lead-capture/fhi-intake.js:32` has `ENDPOINT: ''`, so submission returns `status:'not_configured'`. | **HIGH** | source read | 1 endpoint |
| **B7** | **23 of 29 mapped products are not wired to any page** — including every OMNIAGUARD, TechPetCage, Vigilax, BENO-X and Francisco Holdings product. | MEDIUM | cross-reference | per product |
| **B8** | Branch-vs-`main` handle regression (§0) — a latent trap, not currently affecting customers. | **HIGH if deployed** | blob diff | revert branch copy |
| **B9** | The "🔒 Card (Stripe)" buttons on `francisco-holdings-site/index.html:1751` and `francisco-holdings-expanded.html:1569` silently open **PayPal**. | MEDIUM (honesty) | tested: Stripe is never constructed | label change |

**Stripe Price IDs are NOT a blocker.** See §2.

---

## 2. STRIPE PRICE ID AUDIT — THE REPORTED BLOCKER IS NOT ONE

### Byte-identity: confirmed

`agents/payment-provider.js` and `cleanswarm-checkout/payment-provider.js` are
**identical** — same blob `15e447be…`, same 11,278 bytes, `cmp` reports no
differences. No third copy exists. (Both are the *branch* version; `main`
carries `cab6d8d2…`.)

### The map is empty — on `main` as well as on the branch

```js
var STRIPE_PRICE_IDS = {
  // 'ccldr-digital-99':       'price_xxxxxxxxxxxxx',
  // 'ccldr-foundation-149':   'price_xxxxxxxxxxxxx',
  // 'omniguard-vpn-99':       'price_xxxxxxxxxxxxx',
};
```

### Why that does not block revenue

1. **Stripe is opt-in.** `var PROVIDER = window.PAYMENT_PROVIDER || 'paypal'` —
   the default is PayPal on every page.
2. **The missing-ID path already fails closed to PayPal:**
   `_stripeCheckout` → no `priceId` → `console.warn` → `_paypalCheckout`.
   Verified: with an empty map, **zero of 29 products ever construct `Stripe()`**.
3. Two further fallbacks exist: `Stripe()` throwing, and
   `redirectToCheckout` resolving with an error — both fall back to PayPal.
   Both tested.

So a customer clicking "Card (Stripe)" is quietly handed PayPal (B9) and **can
still pay**. Populating the Price IDs would add a card option; it would not
unblock anything.

### Required configuration, per product

**No real Price ID exists anywhere in this repository.** A scan for
`price_[0-9A-Za-z]{14,}` across every file returns **zero matches**. Every
occurrence is a placeholder (`price_xxxxxxxxxxxxx`) in `payment-provider.js`,
`CCLDR-MEMBERSHIP-SYSTEM-DESIGN.md`, `stripe-checkout-snippets.html`, and the
`super-highway/` specs.

**I will not invent Price IDs.** Missing-information list — each must be read
from the Stripe Dashboard (Products → the product → Pricing → the `price_…` ID):

| Product ID | Price | Billing mode the code will request |
|---|---|---|
| `ccldr-digital-99` | 99 | subscription (amount ≥ 100 ⇒ subscription; 99 ⇒ **payment**) |
| `ccldr-course-299` | 299 | subscription |
| `ccldr-foundation-149` | 149 | subscription |
| `ccldr-practitioner-499` | 499 | subscription |
| `ccldr-sovereignty-999` | 999 | subscription |
| `ccldr-elite-1499` | 1499 | subscription |
| `fh-strategy-500` | 500 | subscription |
| the other 22 mapped products | various | per the same rule |

**A latent bug in that rule:** `mode: amount >= 100 ? 'subscription' : 'payment'`
(`payment-provider.js:130`). Price is being used to infer billing type. A
one-time $500 strategy session would be requested as a **subscription**, and a
$99 recurring plan as a one-time **payment**. Both would fail against a
correctly configured Stripe product. This must be fixed *before* any Price ID is
added, or card checkout will break in a way PayPal fallback masks.

### Also noted

`payment-provider.js` header claims *"Stripe LIVE account active (recovered June
2026) / pk_live key active"*, while line 64 says *"Populate these when Stripe is
re-enabled"*. The same file contradicts itself about whether Stripe works.

---

## 3. FORMSPREE INVENTORY — 23 FILES, NOT 19

**The reported count is not confirmed.** Measured: **23 files, 48 occurrences**
of `YOUR_FORM_ID`.

Formspree and FormSubmit.co are **separate services**. Nothing below is affected
by the FormSubmit activation task (AUTH-5), and AUTH-5 fixes none of it.

### 3a. Files with real forms (13) — the ones that matter

| # | File:line | Purpose | Handler | Destination when placeholder | Visible outcome | Minimum fix |
|---|---|---|---|---|---|---|
| 1 | `primedoxai-site/pricing.html:1816,1853` | 24-hour free-trial signup | **unguarded** `fetch(FORMSPREE)` | **POSTs email + "situation" to `formspree.io/f/YOUR_FORM_ID`**, `.catch((){})` silences it | **"Success" panel shown regardless** | add a placeholder guard **and** a real ID |
| 2 | `canadian-cannabis-consulting-site/index.html:515-517` | ACMPR checklist lead magnet | guarded `fetch` | nothing sent; `localStorage` only | **"✓ Checklist on its way! Check your inbox within 5 minutes"** — false | correct the message, then add an ID |
| 3 | `ccldr-site/contact.html:150,164` | contact form | guarded `fetch` | `mailto:franciscoderek7@gmail.com` | honest: "Your email client opened" | add an ID (works today via mailto) |
| 4 | `omniaguard-site/contact.html:525,526,535` | secure contact form | guarded `fetch` | `mailto:omniaguard1@gmail.com` | honest: "Opening Email Client" | add an ID (works today) |
| 5 | `francisco-holdings-site/index.html:2820` | Apex exit-intent | `apex-agent.js` guard | **nothing transmitted** | popup claims the magnet is coming | add an ID |
| 6 | `francisco-holdings-site/francisco-holdings-expanded.html:2626` | Apex exit-intent | same | **nothing transmitted** | same | add an ID |
| 7 | `ccldr-site/index.html:1384` | Apex exit-intent | same | **nothing transmitted** | same | add an ID |
| 8 | `primedoxai-site/index.html:1374` | Apex exit-intent | same | **nothing transmitted** | same | add an ID |
| 9 | `vigilax-site/index.html:557` | Apex exit-intent | same | **nothing transmitted** | same | add an ID |
| 10 | `zprimedoxaihq-site/index.html:2069` | Apex exit-intent | same | **nothing transmitted** | same | add an ID |
| 11 | `vault-velocity-auto-site/index.html:571` | Apex exit-intent | same | **nothing transmitted** | same | add an ID |
| 12 | `mindshift-makayla/index.html:1584` | Apex exit-intent | same | **nothing transmitted** | same | add an ID |
| 13 | `cleanswarm-checkout/index.html:1186` | Apex exit-intent | same | **nothing transmitted** | same | add an ID |

**The Apex pattern (rows 5–13, nine sites):** `agents/apex-agent.js:173` guards
on `opts.formspreeId !== 'YOUR_FORM_ID'`. When it is the placeholder the lead is
written to the **visitor's own** `localStorage` under `apex_lead` and
`trackEvent('lead_captured')` fires locally. **Derek never receives it.** The
popup still presents as if the magnet is on its way. Nine sites, every lead
lost, silently.

### 3b. Library copies (2)

`agents/apex-agent.js:171,173` and `cleanswarm-checkout/apex-agent.js:141,143`
— duplicated guard logic, will drift. `agents/apex-agent.js` is served live from
`main` via jsDelivr to 12 HTML files.

### 3c. Documentation and tooling (8) — no code effect

`EMPIRE.md`, `master-progress-report.html`, `empire-status-dashboard.html`,
`empire-progress-report.html`, `DEPLOY-BACKEND-NOW.md`,
`agents/chinese-ai-connector.js` (comment), `scripts/wire-formspree.sh`,
`revenue-sprint/2026-11-01/00-STATUS.md`.

**`scripts/wire-formspree.sh` already exists** and does the replacement, taking
six IDs as arguments — but it covers only ccldr, primedox, vigilax, cleanswarm,
kiaros and techpetcage. It **misses** francisco-holdings, omniaguard,
vault-velocity, zprimedoxaihq, canadian-cannabis and mindshift. Using it as-is
would leave six sites unwired.

**Missing information:** real Formspree form IDs. One per account, created at
formspree.io. Not derivable from the repository. I will not invent them.

---

## 4. FIRST $1,000 — WHAT IS ACTUALLY SELLABLE

| Offer | Page exists | Payment link | Can a customer pay? | Verdict |
|---|---|---|---|---|
| **CCLDR Digital $99** | yes | `paypal.me/techpetcage/99` from the map | **yes, with the price shown** | **SELLABLE** |
| CCLDR Course $299 | yes | mapped | yes | **SELLABLE** |
| CCLDR Foundation $149 | yes | mapped | yes | **SELLABLE** |
| CCLDR Practitioner $499 | yes | mapped | yes | **SELLABLE** |
| CCLDR Sovereignty $999 | yes | mapped | yes | **SELLABLE** |
| CCLDR Elite $1,499 | yes | mapped | yes | **SELLABLE** |
| CCLDR Live $97 / Masterclass $497 / Blueprint $1,997 | yes | **unmapped** | opens an **amountless** page | blocked by B1 |
| WeedLaw ×4, VaultVelocity ×3, PrimeDox ×4 | yes | **unmapped** | opens an **amountless** page | blocked by B1 |
| **FH Strategy Session $500** | **NO PAGE** | mapped, valid | **no — nothing to click** | blocked by B5 |
| FHI Diagnostic $249 | `assessment.html` | — | inquiry **not captured** (`ENDPOINT:''`) | blocked by B6 |

### The shortest credible route is NOT the strategy session

Two $500 strategy sessions require building a page that does not exist, then
deploying it — and deploying `francisco-holdings-site/` from this branch would
regress the live PayPal handle (§0).

**Six CCLDR products already take money correctly today**, at the right handle,
with the price attached, served from `main` via CDN. Two CCLDR Practitioner
sales ($499 × 2 = $998) or one Elite ($1,499) reaches the target **with no code
change at all**.

The constraint on that route is not the code — it is **delivery**. Each is an
educational product; whether the material exists and can be handed over on
payment is not something I can verify from this repository. **Do not treat any
of these as revenue until a payment is confirmed received.**

### Payment destination: NOT verified

`paypal.me/techpetcage/<amount>` appears in the live code and CLAUDE.md records
it as confirmed on 2026-09-05. **A URL appearing in source is not evidence it
resolves.** I have not loaded it and cannot confirm the handle is live, the
account is in good standing, or that it accepts CAD. **One manual check is
required before relying on any of the six sellable products.**

---

## 5. SMALLEST PROPOSED PATCH SET

Ordered by revenue per line changed. **None applied.**

| # | File | Change | Expected effect |
|---|---|---|---|
| **P1** | `agents/payment-provider.js` **on `main`** | Add the 14 missing products to `PAYPAL_LINKS` with their prices | 14 dead buttons start showing a price. One file, CDN-served, **no site deploy needed.** Biggest effect for the least risk. |
| **P2** | `primedoxai-site/pricing.html:1853` | Wrap the `fetch` in the same `!== 'YOUR_FORM_ID'` guard every other call site uses | Stops sending visitor email + free text to a dead third-party endpoint |
| **P3** | `primedoxai-site/pricing.html` | Show an honest message when unconfigured instead of the success panel | Stops claiming a trial was registered when nothing was sent |
| **P4** | `canadian-cannabis-consulting-site/index.html:524` | Replace "✓ Checklist on its way! Check your inbox within 5 minutes" with a truthful message | Stops a false promise to a prospect |
| **P5** | `agents/payment-provider.js:130` | Replace `amount >= 100 ? 'subscription' : 'payment'` with an explicit per-product mode | Prevents card checkout breaking when Price IDs are eventually added |
| **P6** | `francisco-holdings-site/index.html:1751` + `-expanded.html:1569` | Relabel "🔒 Card (Stripe)" or hide it while the price map is empty | Button stops misrepresenting what it does |
| **P7** | `agents/payment-provider.js` (branch copy) ×2 | Revert the branch copies to `main`'s handle | Removes the merge/deploy trap in §0 |
| **P8** | `scripts/wire-formspree.sh` | Extend to the six uncovered sites | Makes the existing tool complete before IDs arrive |

**P1 is the one to do first.** It is a single file, it reaches every site through
the CDN without touching a deploy workflow, and it converts 14 broken buttons
into working ones.

---

## 6. TEST RESULTS

Offline only. No network, no real Stripe, no real PayPal, no charges. Every
outbound call captured by a harness; `window.open`, `fetch`, `Stripe`,
`localStorage` and the DOM are all shimmed.

**`payment-provider.test.js` — 16 tests, 16 pass, 0 fail** against the **live**
`main` copy:

| Test | Covers |
|---|---|
| default provider is PayPal | opt-in design |
| known product opens its mapped URL | happy path |
| **every mapped product uses the expected handle** | **regression guard** |
| unknown product + amount → built URL | dynamic fallback |
| unknown product + no amount → amountless page | documents actual behaviour |
| amount `"0"` → mailto | the reachable mailto branch (`!'0'` is false) |
| donate keeps its open-amount URL | open-amount case |
| Stripe + no price ID → PayPal, `Stripe()` never constructed | **fail-closed** |
| Stripe + `Stripe()` throws → PayPal | malformed config |
| Stripe + `redirectToCheckout` error → PayPal | runtime error |
| empty map ⇒ 0 of 29 products reach Stripe | the central claim of §2 |
| conversion recorded locally | tracking |
| mapped product + no amount → priced URL | why 6 buttons work |
| unmapped + no amount → amountless | why 14 do not |
| **all 14 unmapped-but-wired land amountless** | **B1, exhaustively** |
| all 6 mapped-and-wired carry their price | the sellable set |

### Negative controls — the suite is not vacuous

| Run | Expected handle | Result |
|---|---|---|
| live `main` copy | `techpetcage` | **16 pass** |
| **branch copy** | `techpetcage` | **7 FAIL** — including the handle guard |
| branch copy | `derekfranciaco1` | 16 pass |

The suite catches the §0 regression in both directions. Had it been in CI, the
branch divergence could not have survived.

**One correction on record:** my first version of the "no amount" test asserted
a `mailto:` fallback. That was **my error, not the code's** — `!amount` routes to
the open-amount page. The test was corrected to assert real behaviour, and a
separate test added for the `"0"` case that genuinely reaches `mailto`.

### Missing coverage, not written

- Formspree call sites have **no tests at all**. P2/P3/P4 should each ship with one.
- `apex-agent.js` lead-forwarding has no test (would have caught B4).
- No test asserts that every `data-paypal-product` in the HTML exists in the price map — that single test would have caught B1 across the whole repo.
- `referral-engine.js` mutates the amount before checkout and is untested.

Test files live in the scratchpad, not the repository. Say the word and I will
move them into `agents/tests/`.

---

## 7. DEPLOYMENT SURFACE FOR THE PROPOSED CHANGES

| Patch | Touches | Workflows that fire | Notes |
|---|---|---|---|
| **P1, P5, P7** | `agents/payment-provider.js` | **none** — no `deploy-*.yml` watches `agents/**` | but **reaches every live site via jsDelivr `@main`**, with ~12h CDN cache. A push to `main` also runs `ci.yml` and GitHub's `pages build and deployment`. |
| P2, P3 | `primedoxai-site/pricing.html` | `deploy-primedox.yml` (main + dispatch) | |
| P4 | `canadian-cannabis-consulting-site/` | `deploy-canadian-cannabis-consulting.yml` (**push to main, no dispatch**) | |
| P6 | `francisco-holdings-site/` | `deploy-francisco-holdings.yml` | **armed on MEva6.** Its bleed check warns rather than fails. |
| P8 | `scripts/` | none | |

**`claude/francisco-revenue-sprint-MEva6` must not be pushed to** — 26 workflows
are armed on it. Confirmed count: **39 workflows, 26 armed** (the reported 27 is
off by one).

**Correction to the earlier deployment manifest:** it stated no workflow watches
`phoenix-core/`, which is true, and I concluded a `main` push "publishes
nothing". That was wrong. Any push to `main` triggers `ci.yml` (failing on main
since before today) and GitHub's native `pages build and deployment`. Observed
on commit `fe20af45`.

---

## 8. VERIFIED / REPORTED-BUT-UNVERIFIED / ASSUMED

### Verified in this session
- `main` and worktree copies of `payment-provider.js` differ; `main` uses `techpetcage` (31/0), branch uses `derekfranciaco1` (31/0). Blobs `cab6d8d2` vs `15e447be`.
- The two worktree copies are byte-identical (`cmp`, same blob).
- `STRIPE_PRICE_IDS` is empty on both `main` and the branch; **0** real `price_` IDs repo-wide.
- With an empty map, 0 of 29 products construct `Stripe()`. Three fallback paths all reach PayPal. 16/16 tests.
- 20 `data-paypal-product` buttons exist; **0** carry `data-paypal-amount`; 6 are mapped, 14 are not.
- 23 of 29 mapped products are wired to no page, including `fh-strategy-500`.
- 23 files / 48 occurrences of `YOUR_FORM_ID`; 13 real-form files, 2 libraries, 8 docs.
- `primedoxai-site/pricing.html:1853` `fetch` is unguarded.
- `canadian-cannabis-consulting-site/index.html:524` claims delivery while sending nothing.
- `apex-agent.js:173` guard ⇒ 9 sites lose every exit-intent lead.
- `fhi-intake.js:32 ENDPOINT: ''` ⇒ `status:'not_configured'`.
- 29 HTML files load code from jsDelivr `@main`.
- 39 workflows, 26 armed on MEva6.
- `strategy-session.html` does not exist in this repository.

### Reported but NOT verified
- That `paypal.me/techpetcage` resolves and accepts payment. Source presence is not proof.
- That `paypal.me/derekfranciaco1` is dead. CLAUDE.md says retired *for CCLDR*; I have tested neither.
- That the Stripe `rk_live_` key was rotated (`empire-progress-report.html:709`, flagged CRITICAL). **Still the only confirmed credential exposure.**
- That the Termux copy holds omniaguard stat fixes, FHI form fixes and `strategy-session.html`. Absent here.
- That the six sellable CCLDR products can actually be delivered on payment.

### Assumed (stated, not proven)
- jsDelivr `@main` cache is roughly 12 hours. Order of magnitude, from jsDelivr's documented branch behaviour; not measured.
- The 14 unmapped products' prices can be read from their IDs (`weedlaw-course-79` ⇒ $79). Plausible and consistent, but each should be confirmed against the page copy before being written into the map.
- Products priced ≥ $100 in the map are intended as subscriptions. The code assumes this; no product definition in the repository confirms it.

---

## 9. DECISIONS FOR DEREK

| # | Decision | Blocks |
|---|---|---|
| 1 | **Does `paypal.me/techpetcage` resolve and accept payment?** One click. | all six sellable products |
| 2 | Apply **P1** (14 price-map entries on `main`)? Confirm each price from page copy first. | 14 dead buttons |
| 3 | Apply **P2/P3** — guard the unguarded Formspree POST and stop the false success panel? | visitor data + lead loss |
| 4 | Apply **P4** — correct the "check your inbox" claim? | a false promise now live |
| 5 | Revert the branch copies of `payment-provider.js` to `main`'s handle (**P7**), closing the merge trap? | prevents a live-handle regression |
| 6 | Create Formspree form IDs (one per account) and hand them over? I will not invent them. | 13 forms |
| 7 | Extend `scripts/wire-formspree.sh` to the six uncovered sites (**P8**)? | tooling completeness |
| 8 | Build `strategy-session.html` here, or push the Termux version? | the $500 offer |
| 9 | Set `fhi-intake.js` `ENDPOINT` — and to which service? | the $249 offer |
| 10 | Move the 16 tests into `agents/tests/` and wire them into `ci.yml`? | regression protection |
| 11 | **Verify the Stripe `rk_live_` rotation.** | the one open security item |
| 12 | Fix the `amount >= 100 ⇒ subscription` rule (**P5**) before any Price ID is added? | future card checkout |

---

## 10. SINGLE HIGHEST-VALUE NEXT ACTION

> **Confirm `paypal.me/techpetcage` accepts a payment — then apply P1: add the
> 14 missing products to `PAYPAL_LINKS` in `agents/payment-provider.js` on `main`.**

One click plus one file. Because every site loads that file from `main` through
jsDelivr, it fixes 14 amountless checkout buttons across every property **with
no site deploy, no workflow run, and no exposure to the branch's handle
regression.** Combined with the six products that already work, that is the
shortest verified path to $1,000 — and the $1,000 is reachable from CCLDR alone,
without the strategy session page that does not yet exist.
