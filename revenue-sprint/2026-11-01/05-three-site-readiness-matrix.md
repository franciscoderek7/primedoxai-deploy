# FHI SPRINT 2 — WORKSTREAM C / TASK 3
## Three-Site Readiness Matrix

Date: 2026-11-01
Scope: `francisco-holdings-site/`, `ccldr-site/`, `omniaguard-site/`
Method: read-only measurement of the repository source. No file changed. No
live site was modified. Where a claim is about the *deployed* page rather than
the source, it is labelled as such.

---

## 1. MATRIX

| | **Francisco Holdings** (Loop A) | **CCLDR** (Loop A) | **OMNIAGUARD** (Loop B) |
|---|---|---|---|
| HTML pages | 73 | 61 | 31 |
| Files with a `<form>` | 7 | 17 | 7 |
| Primary inbox | `franciscoderek7@gmail.com` (94) | `franciscoderek7@gmail.com` (70), `docweedlaw@gmail.com` (62) | `omniaguard1@gmail.com` (91) |
| PayPal handle | **`derekfranciaco1` ×140** ⚠ | `techpetcage` ×148 ✅ | **`derekfranciaco1` ×25** ⚠ |
| Personal-info bleed (`derek@franciscoholdings.com`, phone, street, postal) | **0** ✅ | **0** ✅ | **0** ✅ |
| `FHIIntake` lead-capture module wired | 1 page (`assessment.html`) | 0 | 0 |
| Deploy workflow exists | yes | yes | yes |
| Armed on the sprint branch | yes | yes | yes |
| Last successful deploy | 2026-07-15 (run #126) | **2026-07-12** (run #66) ⚠ | 2026-07-15 (run #86) |
| **Revenue-ready?** | **NO** | **NO** | **NO** |

---

## 2. THE BLOCKER THAT OUTRANKS EVERYTHING ELSE

> **165 payment links across two live sites point at `paypal.me/derekfranciaco1`
> — the handle CLAUDE.md records as retired.**

- `francisco-holdings-site/` — **140** occurrences. Worst pages:
  `index.html` (30), `francisco-holdings-expanded.html` (16),
  `empire-os.html` (16), `dashboard-v3/index.html` (13), `pricing.html` (5).
- `omniaguard-site/` — **25** occurrences: `app/index.html` (12),
  `pay.html` (5), `free-scan.html` (4), `index.html` (3), `preorder.html` (1).

If `derekfranciaco1` no longer resolves, **every one of those 165 buttons is a
dead checkout** on a page that invites someone to pay. A visitor who wants to
buy cannot. That is a larger revenue problem than any missing feature in this
sprint.

### Why I have not fixed it

CLAUDE.md's 2026-09-05 order is **CCLDR-scoped**, word for word:

> "`paypal.me/techpetcage` is the confirmed working PayPal handle. **All CCLDR
> payment links use this handle.** `derekfranciaco1` is **retired for CCLDR**."

It does not say what Francisco Holdings and OMNIAGUARD should use. Three
readings are all defensible: (a) techpetcage everywhere, (b) techpetcage for
CCLDR only and `derekfranciaco1` still valid elsewhere, (c) each brand gets its
own handle. **Changing 165 payment links is a money decision and the scope is
genuinely ambiguous, so I am not choosing for you.**

**I need one answer from you:** does `paypal.me/derekfranciaco1` still work?

- **If yes** — nothing is broken; tell me whether you nonetheless want the empire unified on `techpetcage`.
- **If no** — this is the top-priority fix in the whole sprint and I can do it as a mechanical replacement across 165 links on your word.

---

## 3. OTHER CONFIRMED DEFECTS, PER SITE

### CCLDR

| Severity | Finding |
|---|---|
| **High** | **Typo inbox — mail goes nowhere.** `membership.html:466` is an "Email to Book →" button pointing at `mailto:docweedla@gmail.com` (missing the `w`), and `:581` repeats it in the footer. A customer trying to book a document review emails a non-existent address and hears nothing back. A previous commit claimed to have fixed this typo; **two occurrences remain.** |
| **High** | **Deploy blocked 8 weeks.** Last successful deploy 2026-07-12. Every push since fails on one footer link (`index.html:756` → omniaguard.com) tripping the zero-bleed gate. Full detail in `04-deployment-manifest.md` §4. |
| **High** | **The live pricing page contradicts itself and throws a JS error.** As deployed: a `✅ Stripe LIVE. All payment methods active` banner at line 1073, `STRIPE_LIVE = false` at 1069, `Stripe temporarily unavailable` at 1474, and an uncommented `Stripe(STRIPE_PK)` call at 1068 with Stripe.js commented out at 1067 → `ReferenceError`. The corrected version exists on the branch and is stuck behind the blocked deploy. |
| Low | `paypal.me/` with no handle — 1 occurrence. |

### Francisco Holdings

| Severity | Finding |
|---|---|
| **High** | 140 retired-handle payment links (§2). |
| **High** | **The cannabis-only inbox is being used as the parent holding company's payment address.** `francisco-holdings-expanded.html` uses `docweedlaw@gmail.com` as the **Interac e-Transfer destination** (`:754`, `:780`, `:1542`), as the **receipt confirmation address** (`:789`), and as the listed `contact:` for four portfolio entries (`:918`, `:924`, `:931`, `:989`). `no-brainer.html:318` repeats it. Your own brief says: *do not route general FHI inquiries to the cannabis-only inbox.* This does exactly that — for money. |
| **Medium** | **Unverified claim.** `francisco-holdings-expanded.html:754` and `:1542` state "**All payment methods active.**" Nothing in the repository verifies that PayPal, Interac and Bitcoin are all live and monitored. |
| **Medium** | 13 `mailto:omniaguard1@gmail.com` links on a Loop-A site. Not a personal-info bleed, but it does cross-link a Loop-B anonymous brand's inbox from the parent company's pages. The existing bleed gate for this site **warns and continues** rather than failing (see `04-deployment-manifest.md` D4), so it has been deploying. |
| Good | `assessment.html` is the one page wired to the `FHIIntake` module. It is also the only page with a real structured intake path. |

### OMNIAGUARD

| Severity | Finding |
|---|---|
| **High** | 25 retired-handle payment links (§2), including `pay.html` and `preorder.html` — the two pages whose entire job is taking money. |
| Good | **Zero personal-info bleed, zero cannabis references, anonymous identity intact.** The Loop-B separation is holding. |
| Good | Uses its own inbox (`omniaguard1@gmail.com`, plus `security@`/`support@`/`contact@omniaguard.com`) — no cross-brand inbox leakage. |
| Note | The `security@`/`support@`/`contact@omniaguard.com` addresses appear on the site. Whether those mailboxes actually exist and are monitored is **unverified** — I have no way to check from here, and a published address that bounces is worse than no address. |

---

## 4. WHAT "REVENUE-READY" WOULD REQUIRE

All three sites answer **NO** today. The minimum bar, per site:

1. A working payment link a customer can click and complete. *(Blocked on §2 for two of three sites.)*
2. A working inbox the customer's message actually reaches. *(Blocked by the CCLDR typo; unverified for the OMNIAGUARD domain addresses.)*
3. No claim on the page that is not true. *(Blocked by CCLDR's "Stripe LIVE" and Francisco Holdings' "All payment methods active".)*
4. The current source actually deployed. *(Blocked for CCLDR since 2026-07-12.)*

Items 1–4 are all fixable, and three of them are small. None of them is fixed,
and I have changed nothing, because each touches payment routing, published
claims, or production deployment — all of which CLAUDE.md puts under your
sign-off.

---

## 5. ONE THING I COULD NOT CHECK

I did not fetch any of the three live sites. Everything above about the
*deployed* state is derived from git — specifically from the last commit each
workflow successfully deployed. If you want the live pages confirmed as they
actually serve today, say so and I will fetch and diff them; reading a public
page contacts no payment system and initiates nothing.
