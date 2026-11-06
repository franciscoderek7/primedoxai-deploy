# FHI — REVENUE ACTIVATION AND SECURITY COMPLETION

Date: 2026-11-06 · Branch `claude/revenue-intake-review` @ `056ac19`
**Nothing applied, committed, pushed, merged, deployed or CI-triggered. No
purchase, payment-config change, email or external contact. No credential value
in this document. All 17 held changes preserved; C3 on HOLD.**

---

## A. CCLDR REVENUE READINESS — I WAS WRONG, AND YOU WERE RIGHT TO CHECK

> **Correction: my "$998 with no code change" claim does not survive
> verification. A customer can pay. A customer cannot receive the product.**

### 1–2. The six products — purchasable, prices confirmed

All six are on the **live** page (`ccldr-site/index.html` in deployed commit
`fc8b574`), and the live page loads `payment-provider.js` from jsDelivr `@main`
at line 1305.

| Product | Live price | Billing shown | One-time? |
|---|---|---|---|
| Digital | **$99 CAD** | **/mo** | no |
| charter education Course | **$299 CAD** | **once** | **YES** |
| Foundation | **$149 CAD** | **/mo** | no |
| **Practitioner** | **$499 CAD** | **/mo** | no |
| Sovereignty | **$999 CAD** | **/mo** | no |
| Elite | **$1,499 CAD** | **/mo** | no |

Three more are wired but **unmapped**: Live $97/mo, Masterclass $497, Blueprint $1,997.

### 4. Payment destination — CORRECT, and better than I thought

Every live button carries a **hardcoded** `href`:
`https://paypal.me/techpetcage/499CAD`. The handle is right, the amount is right,
and the `CAD` suffix is explicit. **This does not depend on the price map at all.**

**A finding that reverses an earlier one.** `payment-provider.js` `init()`
attaches a click listener that calls `e.preventDefault()` and routes through
`checkout()`. For the six mapped products that still produces the correct URL.
But for **Live $97, Masterclass $497 and Blueprint $1,997** — unmapped, and with
no `data-paypal-amount` — the JS sends the customer to
`paypal.me/techpetcage/` **with no amount**, discarding a perfectly correct
`href` that already had it.

> **The JavaScript actively breaks three buttons that work fine without it.**
> If the CDN script fails to load, `window.PrimeDoxPayment` is undefined, no
> listener attaches, and **all nine buttons work correctly.** The page is more
> reliable with JavaScript disabled.

**Smallest fix is therefore not "add 14 map entries" — it is one line.** Make
`init()` skip buttons whose `href` already contains a paypal.me amount, or drop
the `preventDefault()`. That is smaller and safer than editing the map.

### 3. What Practitioner includes — and whether it exists

Advertised: *Everything in Foundation · Boardroom AI consultation access · Live
case strategy frameworks · Cannabis charge defense playbooks · Charter argument
templates · Priority email support.*

| Promised | Exists? |
|---|---|
| Boardroom AI consultation | `ccldr-site/boardroom.html` — **972 lines, exists**, 0 `fetch(` calls |
| Charter argument templates | `ccldr-site/templates/` — **7 `.txt` files**, real content |
| Member rooms | **6 gated pages** — boardroom, classroom, judges-chambers, lobby, login, records-room |
| Priority email support | manual, via `docweedlaw@gmail.com` — correct inbox for cannabis |

**So substantive material does exist.** This is not vapour.

### 5. CAN THE CUSTOMER RECEIVE IT? **NO.**

`ccldr-site/membership.js` is well-designed — its own header says it replaces
`localStorage.getItem('ccldr_tier')` with a tier verified server-side by
Supabase via a `get_my_tier()` RPC. Correct architecture. But:

```js
:18  const SUPABASE_URL      = 'SUPABASE_PROJECT_URL';       // placeholder
:19  const SUPABASE_ANON_KEY = 'SUPABASE_ANON_PUBLIC_KEY';   // placeholder
```

**Both are placeholders.** `getVerifiedTier()` catches the failure and returns
`{tier:'free', loggedIn:false}` — it **fails closed**, which is correct
security, and which means **no paying customer can ever be granted access.**

Worse, the tiers do not map to the products:

```
membership.js TIER_ORDER: free, warrior, professional, elite, sovereign
sold products:           digital, course, foundation, practitioner, sovereignty, elite
```

**There is no `practitioner` tier, no `foundation` tier, no `digital` tier.**
Even fully configured, a Practitioner purchase maps to nothing.

And `paypal.me` provides **no webhook and no callback**, so nothing could
provision access automatically even if the tiers matched.

### 6–7. Fulfilment responsibility and capacity

**Derek, manually, for everything.** There is no automated provisioning, no
account creation, no receipt, no access email. Capacity for the *$299 Course* is
real — the files exist and can be emailed. Capacity for the **recurring** tiers
is the problem: see 8.

### 8. Terms, refunds, limitations — and a billing-integrity problem

**No terms document, no refund policy, no limitations page exists anywhere.**

> **Five of six products are advertised `/mo`, but `paypal.me` can only take a
> one-time payment. It cannot create a subscription.**

A customer clicking "Pay via PayPal — $499/mo" sends **one** $499 payment and
has **no recurring billing**. They would reasonably expect continuing monthly
access. FHI would have taken money for a subscription it cannot operate and
cannot bill again. **That is the single strongest reason not to sell these
today.**

### 9. UNSUPPORTED CLAIM — live right now

`ccldr-site/index.html:976` (live): **"35+ court-ready document templates"**.

Actual count: **7**.

That is a quantified claim on a live sales page overstating the deliverable by
roughly five times. **It must be corrected before any sale.**

### 10. Smallest action to make a legitimate sale deliverable

**Sell the $299 Course only, and fix one claim first.**

| # | Action | Why |
|---|---|---|
| 1 | Change "35+ court-ready document templates" → **"7 court-ready document templates"** (or add the missing 28) | removes an unsupported claim |
| 2 | Hide or mark "Coming soon" the five `/mo` tiers | `paypal.me` cannot bill recurring |
| 3 | Write a one-page terms + refund note | currently absent |
| 4 | Fulfil manually: on payment notification, email the 7 templates + course material | works today, no code |
| 5 | Optional: the one-line `init()` fix so the 3 unmapped buttons stop losing their amount | smaller than the map edit |

### Two-customer plan — ONLY after fulfilment is real

With the Course at $299 one-time: **4 sales = $1,196**, or 3 sales = $897.
Two sales = **$598**, not $1,000. **The $499 Practitioner route is withdrawn**
until recurring billing exists.

**Projected revenue is not revenue.** Nothing below is counted as earned.

| | |
|---|---|
| **Verified gross revenue to date** | **$0.00** |
| Projected, if 4 Course sales close | $1,196 CAD — **projection only** |
| Paying customers | **0** |
| Inquiries | **0** (intake captures nothing) |

---

## B. GREEN BLAST READINESS — EXACT REMAINING BLOCKERS

Offer, scope, terms, intake copy, report template and delivery checklist are in
`revenue-sprint/2026-11-06/02-greenblast-delivery-kit.md`.

| # | Journey step | State | Blocker |
|---|---|---|---|
| 1 | Discovers Green Blast | **BROKEN** | no page exists |
| 2 | Understands the offer | **PREPARED** | copy written; needs a page |
| 3 | Submits an inquiry | **BROKEN** | `fhi-intake.js:32 ENDPOINT:''` |
| 4 | FHI receives it | **BROKEN** | nothing transmits |
| 5 | Receives a response | manual — works | — |
| 6 | Reviews terms | **PREPARED** | written in the kit |
| 7 | Payment option | **PARTIAL** | `paypal.me/techpetcage` **still never tested** |
| 8 | Payment confirmed | **BROKEN** | ledger needs the browser to return |
| 9 | Work delivered | feasible, manual | — |
| 10 | Report + next step | **PREPARED** | template in the kit |

**The one blocker that gates everything: `ENDPOINT` is unset.** Until a
submission destination exists, steps 3 and 4 cannot work and no inquiry reaches
you. `fhi-intake.js` is otherwise the strongest asset in the repo — 23 passing
tests, five-state status taxonomy, honeypot, `MIN_SECONDS_ON_FORM`, field-length
caps, and a status that **refuses to claim a send that did not happen**.

**I did not test a form submission**, because every available destination is a
live external service. Per your rule, I do not claim the form works.

---

## C. PAYMENT SECURITY AND WEBHOOK v2 — 24/24, STILL DISCONNECTED

```
$ node --test webhook-guard-v2.test.js               16 pass /  0 fail
$ node --test webhook-guard-v2-recovery.test.js       8 pass /  0 fail
$ GUARD=./control-current.js node --test …v2.test.js  2 pass / 14 fail   (negative control)
$ GUARD=./control-v1.js      node --test …v2.test.js  9 pass /  7 fail   (negative control)
```

### The eight cases you specified

| Case | Result | How |
|---|---|---|
| Expired lease, original worker still running | **PASS** | lease expires mid-flight; **the database**, not the filesystem, prevents the second row |
| Concurrent claims across separate processes | **PASS** | three independent store instances, one ledger row, exactly one `recorded` |
| Duplicate capture id under a **different** event id | **PASS** | `capture_id UNIQUE` catches it → `already_in_ledger` |
| Crash after append, before commit | **PASS** | stale claim is retried; DB uniqueness is the backstop; exactly one row survives |
| Retry after failed database write | **PASS** | `release()` on failure; redelivery succeeds |
| Database uniqueness conflict | **PASS** | `code 23505` ⇒ 200 `already_in_ledger`, claim committed — drift resolves, no endless retry |
| Refund / reversal adjustments | **PASS** | original row **untouched**, amount preserved; refund noted, never credited |
| Out-of-order events | **PASS** | a reversal arriving **before** the capture creates no revenue |

`appendTransaction` is now **mandatory** — the constructor throws without it, so
a guard can no longer 200 a payment it never recorded.

### Two test failures I hit, and what they actually were

Being explicit, because both looked like code defects and neither was:

1. **v2 test 12 failed with `appendTransaction required`.** Caused by my own
   change making it mandatory; the fixture constructed a guard without one.
   **Test-fixture problem.** Fixture updated.
2. **Recovery test 4 failed:** `r2.reason` was `claim_held` (409), not
   `recorded`. I debugged it rather than adjust the assertion: the first worker
   had **not yet reached `store.claim()`** when I advanced the clock, so the
   lease was fresh and **409 was the correct answer**. **Test-fixture problem** —
   the test needed to wait for the claim before expiring it. Fixed with an
   explicit wait, and documented in the test.

Neither was a guard defect. Both are recorded here rather than quietly fixed.

### Recovery process for interrupted transactions

```
A claim exists but no ledger row  → lease expires (default 5 min) → next
                                     PayPal delivery retries → row written
A ledger row exists but no commit → next delivery hits capture_id UNIQUE
                                     (23505) → 200 already_in_ledger, claim
                                     committed → no duplicate row
A claim is held by a live worker  → 409, PayPal retries later
Store and database have drifted   → the DATABASE wins. UNIQUE on capture_id and
                                     event_id is the authority; the filesystem
                                     store is only an optimisation
Manual audit                      → select from payment_transactions where
                                     capture_id not in (<PayPal's report>)
```

**Design principle: the filesystem claim store is advisory. The database
constraint is the guarantee.** That is what makes the two safe to be
inconsistent.

### Remaining production requirements — unchanged

1. **Real PayPal signature verification is NOT established.** All 24 tests
   inject the verifier. **Nothing here proves PayPal's
   `/v1/notifications/verify-webhook-signature` works against real headers.**
   Needs an authorized sandbox run. **Not production-ready.**
2. The guard is **not connected** to any live payment route, per instruction.
3. `payment_transactions` does not exist yet; the schema is proposed only.
4. The capture-redirect path still upserts `onConflict:'email'` and is untouched.

---

## D. APPROVAL QUEUE AND NEXT THREE ACTIONS

### Decision register

| # | Decision | Impact | Evidence | Recommendation | Blocks revenue? | Needs Derek? |
|---|---|---|---|---|---|---|
| **1** | Correct "35+ templates" → 7 | **CRITICAL** — unsupported claim on a live sales page | `index.html:976` vs 7 files | correct it before any sale | **YES** | **YES** |
| **2** | Hide the five `/mo` tiers | **CRITICAL** — `paypal.me` cannot bill recurring | live cards vs paypal.me capability | hide or mark "coming soon" | **YES** | **YES** |
| **3** | Verify `paypal.me/techpetcage` | **CRITICAL** — untested, every product depends on it | never loaded | one click | **YES** | **YES** |
| **4** | Rotate both dashboard credentials | **CRITICAL** — live in page source | `cisco1170.js`, `empire-dashboard.html` | rotate, then remove | no | **YES — only you** |
| **5** | Rotate the `rk_live_` Stripe key | **CRITICAL** | `empire-progress-report.html:709` | rotate | no | **YES — only you** |
| **6** | Fix forgeable approval in `zprimedox-ai-graph` | **CRITICAL** — approval attributed to you, forgeable | `human_gate.py:115`, no auth on 10 routes | auth + delete the default | no | **YES** |
| **7** | Set `fhi-intake.js` `ENDPOINT` | **HIGH** — gates Green Blast steps 3–4 | `:32 ENDPOINT:''` | choose a destination | **YES** | **YES** |
| **8** | Write CCLDR terms + refund policy | **HIGH** — none exists | repo-wide search | one page | **YES** | **YES** |
| **9** | Configure Supabase in `membership.js`, map tiers to products | **HIGH** — fails closed, so nobody gets access | `:18-19` placeholders; tier mismatch | configure + remap | **YES** (for tiers) | **YES** |
| **10** | Apply `server.js` ordering + bind patch | HIGH | blob `e4594faf`→`4ed928eb` | apply | no | **YES** |
| **11** | Apply compose loopback patch | HIGH | blob `d874c7af`→`69a12609` | apply | no | **YES** |
| **12** | Create `payment_transactions` | HIGH — no revenue total possible without it | `onConflict:'email'` overwrites | create | later | **YES** |
| **13** | Authorized PayPal sandbox test | HIGH — only way to prove verification | 24 tests all inject the verifier | authorize | later | **YES** |
| **14** | One-line `init()` fix for the 3 amount-losing buttons | MEDIUM | href correct, JS overrides it | apply | partial | **YES** |
| **15** | Dashboard architecture: loopback or remove the gates | MEDIUM | Pages cannot do server auth | behind `avatar-lab` | no | **YES** |
| 16 | Per-executive council prompts | MEDIUM — Vigilax not independent | one shared prompt | fix before relying on review | no | **YES** |
| 17 | Connect the guard to live payments | — | — | **not yet** | no | **YES** |

**Urgent (blocks revenue or customer trust): 1, 2, 3, 7, 8, 9.**
**Important but can wait: 4, 5, 6, 10, 11, 12, 13.**
**Improvements: 14, 15, 16, 17.**

### Recommended next three actions

**1. Correct the "35+ templates" claim and hide the five `/mo` tiers.**
Those two edits are the difference between a legitimate sale and taking money
for something you cannot deliver or bill. Nothing else should ship first.

**2. Open `paypal.me/techpetcage`.** One click. Every product on every property
depends on it and it has never been tested. If it does not resolve, nothing else
in this report matters.

**3. Decide the Course-only launch.** $299 CAD one-time, 7 templates plus the
BENO-X course material, manual fulfilment by email, terms written from the kit.
**That is the only product FHI can honestly sell and deliver this week.**
4 sales = $1,196. It is slower than the $499 route I previously suggested, and
it is the one that does not create an obligation you cannot meet.

---

## PRESERVED WORK

17 held changes at start, **17 at end**. No `reset`/`clean`/`stash`/`restore`.
Nothing deleted, renamed or overwritten. **C3 on HOLD.** New files only:
`revenue-sprint/2026-11-06/01-…`, `02-…`, and four updated artifacts in
`revenue-sprint/2026-11-05/proposed/`.

**Current state:** branch `claude/revenue-intake-review` @ `056ac19`, 0 staged,
nothing committed, pushed, merged, deployed or CI-triggered, no external system
modified.
