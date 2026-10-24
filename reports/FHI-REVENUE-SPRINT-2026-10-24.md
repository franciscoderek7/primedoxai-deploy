# FHI FLAGSHIP — EXECUTION REPORT
**Date:** 2026-10-24 · **Branch:** `claude/francisco-revenue-sprint-MEva6` · **Base:** `a267cc6`
**Committed locally. NOT pushed. Nothing deployed.** Reason in §1.

---

## 1. STOP — THIS BRANCH IS WIRED TO PRODUCTION

`.github/workflows/deploy-francisco-holdings.yml:3-9`

```yaml
on:
  push:
    branches: [main, claude/francisco-revenue-sprint-MEva6]
    paths: ['francisco-holdings-site/**', 'empire/**']
```

**27 of 39 workflows trigger on this branch.** The file I added sits in
`francisco-holdings-site/`, so `git push` would publish **live to
franciscoholdingsinc.com** with no further action. Domains reachable this way
include `franciscoholdingsinc.com`, `omniaguard.com`, `techpetcage.com`,
`vaultvelocityauto.com`, `zprimedoxaihq.com` — and **`vigilax.com`**, which
CLAUDE.md records as NOT owned and required to stay unpublished.

I have therefore committed locally and **not pushed**. Pushing is your call and
is a production deployment, not a code review step.

---

## 2. VERIFIED PRODUCTION ENTRY POINT

| Question | Evidence |
|---|---|
| Which repo serves the FHI domain? | `franciscoderek7/primedoxai-deploy`, via `deploy-francisco-holdings.yml` |
| Which directory? | `francisco-holdings-site/` → built to `/tmp/fh`, published with `CNAME: franciscoholdingsinc.com` (`:50`, `:71`) |
| Is the local copy what's live? | **Unverified.** No network egress from this container (DNS `ENOTFOUND`, proxy `CONNECT → 403`), so I could not fetch the live site. Treat local ≠ production. |
| Drupal? | **None.** 0 files reference Drupal; `./backend/core` is unrelated. |
| Working tree | **0 tracked modifications, 1 untracked, 0 stashes** — the "extensive modified and untracked files" are on your Termux copy, not here. Nothing needed preserving, and nothing was overwritten. |

---

## 3. WHAT WAS INSPECTED, AND THE TWO BLOCKERS FOUND

### Blocker A — there is no working enquiry path anywhere

Measured across all sites:

| Mechanism | Count | Works? |
|---|---|---|
| `action="mailto:…"` | **14 forms** | **No.** Hands data to the visitor's mail client; on mobile and webmail it typically does nothing, and the visitor is never told |
| `formspree.io/f/placeholder`, `/YOURFORMID`, `/PLACEHOLDER` | **3 forms** | **No.** Literal placeholder ids — submits to nothing |
| Server-side validation | 0 | — |
| Durable lead recording | 0 | — |

The flagship's only two forms (`index.html:666`, `:852`) are email/newsletter
capture. Every commercial CTA is a `mailto:` or a `paypal.me` link. **An
enquiry today has no reliable route to you.** That is the revenue blocker.

### Blocker B — personal information is published across 30 pages

CLAUDE.md requires that `705-307-8080`, `Kent St W` and `K9V 2Z8` never appear
on public sites. Current state:

| Item | Public `.html` files |
|---|---|
| `705-307-8080` | **30** |
| `7053078080` | 26 |
| `Kent St` | **17** — includes `francisco-holdings-site/partnership.html` |
| `K9V 2Z8` | 15 |

Also `franciscoderek7@gmail.com` appears **690** times and
`omniaguard1@gmail.com` **384** times in public markup.

**I did not change these.** Replacing a home address and mobile number on 30
customer-facing pages needs your decision on what goes there instead — a
business address, a forwarding number, or nothing. Guessing would be worse
than leaving it. This is the fastest high-value fix available and it is one
find-and-replace once you choose.

### Analytics: none, anywhere

Repo-wide search for `gtag(`, `googletagmanager`, `G-XXXXXXXX`: **0 files**,
every site. **No traffic or conversion claim is currently supportable by data.**

---

## 4. WHAT WAS BUILT AND TESTED

Three new files. **No existing file was modified**, so no backup was required;
`git status` confirms 0 tracked modifications before this commit.

| File | Purpose |
|---|---|
| `shared/lead-capture/fhi-intake.js` | Lead intake client, 175 lines, no dependencies |
| `shared/lead-capture/fhi-funnel.js` | Funnel measurement, no dependencies, no PII |
| `francisco-holdings-site/assessment.html` | Working $249 diagnostic intake page |
| `shared/lead-capture/tests/` + `package.json` | 38 tests |

### Test results — actually run, actually observed

```
cd shared/lead-capture && npm test
# tests 38   # pass 38   # fail 0   # skipped 0
```

(`node --test <dir>` on the bare directory exits 1 — a Node quirk, not a test
failure; the glob and `npm test` forms both report 38/38. Use `npm test`.)

**What the tests enforce, and why it matters here:**

- **No unobserved success.** `received` is returned *only* on a 2xx. A 4xx is
  `rejected`, a 5xx/timeout/network error is `unavailable`, an unset endpoint is
  `not_configured` — and in the last two cases the visitor is told their request
  was **NOT recorded**. Tested across 200/201/202/204, 400/403/404/422/429,
  500/502/503, abort and network throw.
- **Nothing is sent when it shouldn't be.** Invalid input, spam, and an unset
  endpoint all assert `fetch` was never called.
- **A click is not a lead; a lead is not revenue.** `fhi-funnel.js` refuses
  `amount_cad` on any stage but `revenue_collected`, and that stage additionally
  requires a positive number **and** a `confirmation_ref` proving collection.
- **No PII leaves the page.** Name, email, phone, organisation and free text are
  stripped; a stray email-shaped value in any field is dropped. Only a random
  `lead_id` and UTM parameters travel.
- **`lead_submitted` is reachable only inside the `received` branch** — asserted
  structurally against the page source.
- **No credential-shaped literal** in the module source; no `paypal.me`,
  Stripe, retired handle, banned personal info, or fabricated social proof on
  the page.

### The page itself

Mobile-first, `lang="en-CA"`, every input labelled, `aria-live` status region,
honeypot plus a 3-second minimum time-on-form. Four required fields. States
plainly what the review is *not* (not a penetration test, no revenue
prediction), and that **no payment is taken on that page**.

---

## 5. LEAD CAPTURE AND ANALYTICS STATUS — HONEST

| | Status |
|---|---|
| Intake client | **Implemented and tested.** Not yet receiving anything |
| Intake endpoint | **NOT configured.** `CONFIG.ENDPOINT` is `''`; the form refuses to submit and says so rather than discarding an enquiry |
| Email delivery | **Not verified, and not claimed.** Nothing has been sent |
| Lead recording | **Not verified.** Depends on the endpoint |
| Analytics | **Implemented, queues locally, delivers nothing.** `status()` reports `configured: false, delivery_verified: false` |
| Payments | **Deliberately absent** from the intake page |
| Deployment | **Not deployed.** See §1 |

---

## 6. THE ONE EXTERNAL STEP THAT ACTIVATES THIS

Create a form endpoint and paste its URL into **one** place:

```
shared/lead-capture/fhi-intake.js  →  CONFIG.ENDPOINT
```

Formspree is already partially adopted here (21 files reference it), so it is
the lowest-friction choice; any endpoint meeting the contract at the foot of
`fhi-intake.js` works. Set the destination inbox to **techpetcage@gmail.com**,
the designated diagnostic intake address.

I cannot do this step: it needs an account I must not create, and the URL is
yours to own. It is the only thing standing between the page and a working
funnel. Everything else is built and tested.

**Do not put any API key in that file.** The endpoint URL is public by design;
anything privileged belongs behind it.

---

## 7. FASTEST CREDIBLE ROUTE TO THE FIRST $1,000

Four sales of the $249 diagnostic = $996. Five = $1,245.

**Why this offer and not another:** it is the only service where delivery
capability is demonstrable today. The scanner exists, is repaired, and passes
32/32 and 41/41 on its own suites. Every other listed service (retainers,
$2,999/mo swarms, $10M dynasty tiers) has no delivery evidence behind it.

**The honest precondition, unchanged:** no live internet scan has ever been
run, so real-world accuracy is unmeasured. Before charging, complete one sample
review of a site you own with **every field confirmed by hand**. That artifact
is both your quality control and your sales proof.

**Next three revenue actions:**

1. **Configure the endpoint** (§6). Until then the page cannot take an enquiry.
2. **Produce one sample review** of a site you own, every field hand-verified.
   This is the precondition for charging and the only credible proof you have.
3. **Approach five businesses you already know** — trades, clinics, accounting —
   offering the first review free in exchange for permission to use it as a
   reference, then ask that person for one referral. No ads.

---

## 8. BLOCKERS, RANKED

1. **This branch deploys to production on push** (§1). Decide deliberately.
2. **Intake endpoint unset** (§6) — one external step, blocks all revenue.
3. **Personal address and phone on 30 public pages** (§3B) — needs your
   decision on the replacement.
4. **No live scan ever performed** — accuracy unmeasured; blocks honest selling.
5. **`vigilax.com` is deployable from this branch** but is not an owned domain.
6. **`paypal.me/derekfranciaco1`** (retired handle) still appears throughout the
   flagship's pricing, including `index.html:1083`, `:1090`, `:1144`.

## 9. NEXT ENGINEERING TASK

Replace the 14 `mailto:` form actions and 3 placeholder Formspree forms with
`fhi-intake.js`, highest-traffic page first. The module and its tests exist;
this is mechanical once the endpoint is live — and pointless before it.

---

**Not claimed anywhere in this report:** that anything was deployed, that any
email was delivered, that any lead was recorded, that analytics is active, that
any revenue was collected, or that any customer exists. No client, testimonial,
saving, certification or partnership has been invented.
