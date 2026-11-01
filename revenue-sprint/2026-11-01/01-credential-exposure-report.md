# FHI SPRINT 2 / EMERGENCY SPRINT — STEP 1
## Credential Exposure Report

Date: 2026-11-01
Repository: `franciscoderek7/primedoxai-deploy`
Method: read-only inspection. No file was modified, staged, committed or pushed.
No credential value is printed anywhere in this report.

---

## 1. VERDICT

**NO CONFIRMED CREDENTIAL EXPOSURE FOUND IN THIS REPOSITORY.**

Specifically: the `SK` variable in `revenue-dashboard/index.html` is **not** a
committed secret. It is an empty string in source.

**This is not the same as "the system is secure."** Section 5 lists what these
scans do not cover. Section 4 raises a real **architectural** finding that
should be treated as a defect even though no secret leaked.

---

## 2. THE `SK` VARIABLE — TRACED IN FULL

File: `revenue-dashboard/index.html` (29,617 bytes, tracked, unmodified vs HEAD)

| Line | Code | Meaning |
|------|------|---------|
| 398 | `let SK = '';` | **Declared as an empty string.** Length 0. SHA-256 of the value = `e3b0c44298fc…` (the hash of the empty string). |
| 277 | `<input type="password" id="sk-input" …>` | The key is typed in by a human at runtime. |
| 574 | `const k=document.getElementById('sk-input').value.trim();` | Read from the DOM. |
| 575 | `if(!k||(!k.startsWith('sk_test_')&&!k.startsWith('sk_live_')))` | Format validation only. |
| 578 | `SK=k;` | Assigned in memory. |
| 408 | `fetch('https://api.stripe.com/v1/'+path,{headers:{'Authorization':'Bearer '+SK}})` | Sent browser → Stripe as a Bearer token. |
| 553 | `const isTest=SK.includes('test');` | Test/live badge. |
| 400–405 | `logout(){ SK=''; … }` | Cleared on logout. |

### Classification

**Placeholder / not-a-key.** The committed value is the empty string. It is
neither a publishable key, a test secret, nor a live secret. There is nothing
to redact at line 398 because there is no value there.

### Supporting evidence

- **No persistence.** Zero occurrences of `localStorage`, `sessionStorage`,
  `document.cookie` or `indexedDB` in the file. The key exists only in page
  memory for the life of the tab.
- **No third-party script.** No external `<script src>` on the page, so no
  foreign JS is positioned to read `SK` from the page's scope.
- **Not published.** No file under `.github/workflows/` references
  `revenue-dashboard`. Confirmed: `grep -rl "revenue-dashboard" .github/workflows/`
  → no matches. The page is not built or deployed by any workflow in this repo.

---

## 3. REPOSITORY-WIDE SECRET SCAN

Entropy-requiring patterns were used (a prefix alone matches validation code,
not secrets — see the correction note below).

Patterns: `sk_live_[0-9A-Za-z]{20,}`, `sk_test_[0-9A-Za-z]{20,}`,
`rk_live_[0-9A-Za-z]{20,}`, `ghp_[0-9A-Za-z]{36}`, `AKIA[0-9A-Z]{16}`,
`AIza[0-9A-Za-z_-]{35}`

| Scope | Result |
|-------|--------|
| Working tree (all files, excluding `.git`) | **0 files match** |
| Full git history, all 45 commits (`git log -S` / `-G`) | **0 matches** |

**Correction on record:** an earlier pass of this scan used prefix-only `-S`
searches and reported 15 / 14 / 8 hits. Those were **false positives** — they
matched the validation code itself (`k.startsWith('sk_live_')`) and the input
placeholder text, not secrets. The entropy-requiring rerun returns zero. The
false-alarm count should not be carried forward into any other report.

### `primedox-mvp/.env.local` — tracked, but holds no real credential

This file is **committed to the repository** (confirmed via
`git ls-files --error-unmatch`) and is **not** covered by `.gitignore`
(confirmed via `git check-ignore` → not ignored). It is `.env.local`, not
`.env.example`, so the filename alone is a legitimate cause for alarm.

All 10 variables were classified **without printing any value**, by length and
by hash-grouping:

| Variable | Classification |
|----------|---------------|
| `NEXT_PUBLIC_URL` | URL (non-secret) |
| `SUPABASE_URL` | URL (non-secret) |
| `SUPABASE_ANON_KEY` | PLACEHOLDER |
| `SUPABASE_SERVICE_ROLE_KEY` | PLACEHOLDER |
| `STRIPE_SECRET_KEY` | PLACEHOLDER |
| `STRIPE_WEBHOOK_SECRET` | PLACEHOLDER |
| `STRIPE_PRICE_STARTER` | PLACEHOLDER |
| `STRIPE_PRICE_GROWTH` | PLACEHOLDER |
| `STRIPE_PRICE_EMPIRE` | PLACEHOLDER |
| `OPENAI_API_KEY` | PLACEHOLDER |

Basis for "PLACEHOLDER": each value is 8 or 13 characters long — far shorter
than any real key of these types — and the eight values collapse into just two
distinct SHA-256 digests (`45fd925c6c…`, `2bc36ee44c…`), i.e. the same two
dummy strings repeated. **No real credential is present.**

Recommendation (housekeeping, not an incident): add `.env.local` to
`.gitignore` and rename the committed file to `.env.example`, so a future
`.env.local` with real values cannot be committed by habit. **Not done — this
is a file change and is outside a read-only step. Awaiting your authorization.**

---

## 4. ARCHITECTURAL FINDING — DESIGN DEFECT, NOT A LEAK

> `revenue-dashboard/index.html` is **designed** to accept a live Stripe
> **secret** key (`sk_live_…`) into a browser page and transmit it from the
> client to `api.stripe.com`.

No secret has leaked. But the page's intended operating mode conflicts with
FHI's own governance rule — *"do not place secret API credentials in browser
JavaScript"* — and with Stripe's documented position that secret keys are
server-side only. Line 279 already carries a hand-written warning
(`⚠ Do not use sk_live_ on shared or public devices.`), which is an
acknowledgement of the risk rather than a mitigation of it.

Concrete exposure the design creates whenever a real key is pasted in:

1. The key sits in page memory and in the DOM input's value, readable by any
   browser extension with page access, by devtools, and by anything injected
   into the page.
2. Browser autofill / password managers may capture it (`autocomplete="off"` at
   line 277 reduces but does not guarantee this).
3. A live secret key grants **full account authority** — charges, refunds,
   payouts, customer data — not read-only dashboard access.
4. The page has no origin restriction; if it were ever served publicly, any
   modification of it would silently harvest the key.

### Recommendation

- Treat `revenue-dashboard/index.html` as **NOT FIT FOR USE WITH A LIVE KEY.**
  Use it only with `sk_test_…`, and only on a trusted local machine.
- The correct fix is a small server-side proxy that holds the key in an
  environment variable and exposes only the handful of read-only Stripe
  endpoints the dashboard needs. That is a new component and needs your
  explicit go-ahead; it is **not** built.
- **If an `sk_live_…` key has ever been pasted into this page on any device,
  revoke and rotate it in the Stripe Dashboard** (Developers → API keys → roll
  the secret key), then review the Stripe account's recent API-request log for
  calls you do not recognise.

**I have not touched any credential, any Stripe setting, or any account.
Revocation and rotation are yours to perform; I will not do it and cannot.**

---

## 5. LIMITS OF THIS INVESTIGATION (read this before concluding "secure")

A text scan finding no matching key is **weak** evidence. These scans do not
cover, and this report makes no claim about:

- **The Termux / phone copy of the repository.** It is not reachable from this
  session. Files that exist only there were never scanned.
- **Other repositories**, including `franciscoderek7/omniaguard` and
  `franciscoderek7/zprimedoxaihq`. Session scope is `primedoxai-deploy` only.
- **Environment variables and GitHub Actions secrets** (e.g. `DEPLOY_TOKEN`).
  Their values are not readable here and were not inspected.
- **Runtime memory, browser profiles, clipboard history, shell history, and
  screenshots** on any machine where a key may have been pasted.
- **Credentials that do not match a known prefix pattern** — any bespoke token,
  password or connection string with no recognisable shape would be missed.
- **Deleted branches and unreachable objects** beyond the 45 commits reachable
  from the scanned refs.

### Independent check you can run that this scan cannot substitute for

GitHub's own secret scanning covers push-protection and partner-token patterns
this grep does not. I can invoke it read-only (`run_secret_scanning`) on your
word — say so and I will. Stripe also detects and auto-revokes keys it finds
published; absence of such a notice is further (still not conclusive) evidence.

---

## 6. ONE MORE THING YOU SHOULD KNOW — BRANCH STATE

The working tree is currently on branch **`claude/revenue-intake-review`**
(HEAD `69aa969`), **not** the designated development branch
`claude/francisco-revenue-sprint-MEva6` (tip `8f3a624`). The two have diverged.

This is not a security finding, but it affects every later step in the sprint:
work committed from here does not land on the designated branch. **I have not
switched branches** — that is a working-tree change and needs your instruction.
Tell me which branch Sprint 2 work should land on and I will proceed there.

---

## APPENDIX A — ADDED AFTER THE DEPLOYMENT AUDIT (same day)

The §3 scan patterns covered **secret** key shapes (`sk_`, `rk_`, `ghp_`,
`AKIA`, `AIza`). They did **not** cover `pk_` (publishable). A later pass
during the deployment audit found publishable keys in the repository. They are
reported here so this document states the full picture.

### A.1 — Stripe publishable keys: present, and that is by design

**2 distinct `pk_live_…` values** (both 107 characters, both on the same Stripe
account prefix) appear across **23 files**, including `stripe-config.js`,
`EMPIRE.md`, and the pricing/index pages of ccldr, primedoxai, omniaguard,
kiaros, vigilax, zprimedoxaihq, vaultvelocityauto and francisco-holdings.

**Classification: PUBLISHABLE — not a secret.** Stripe publishable keys are
intended to be embedded in browser code. They cannot create charges, read
customer data, or move money on their own. Their presence in HTML is **not** an
exposure incident and **needs no rotation**.

Values are redacted here regardless, per your standing instruction.

**One thing it does prove:** the account is in **live mode**, not test mode.
That upgrades §4 from a theoretical concern to a live one — the
`revenue-dashboard/index.html` page is pointed at a real, live Stripe account,
so a `sk_live_…` key pasted into it would carry real authority over real money.

### A.2 — Confirming the negative, more broadly

Re-ran without the entropy floor, to catch anything the §3 patterns might have
been too strict for:

| Pattern | Occurrences | Assessment |
|---------|-------------|------------|
| `(sk\|rk)_(live\|test)_[0-9A-Za-z]{6,}` | 1 | `revenue-dashboard/revenue-v2.html:341` → `sk_live_xxxxxxxxxxxx` — an obvious **placeholder** (literal x's) |
| `whsec_[0-9A-Za-z]{10,}` | **0** | no Stripe webhook secrets |
| bare `sk_live_` / `sk_test_` strings | 20 | **all** in secret-scanning gates inside 4 workflows, in `.github/workflows/tests/deploy-safety.test.js`, and in deploy documentation — i.e. the literals are *detection rules*, not keys |

**The §1 verdict stands: no real secret credential is committed to this
repository.** The §5 limits still apply in full.

### A.3 — A gap worth closing

Only **4 of 39 workflows** (`deploy-beno-x`, `deploy-docweedlaw`,
`deploy-primedox`, `deploy-zprimedoxaihq`) contain a secret-scanning gate. The
other **35 deploy workflows publish to live domains with no secret scan at
all.** Any future commit that did carry a real `sk_live_…` into one of those
site folders would deploy it to a public website unchallenged.

This is the single cheapest security improvement available: lift the existing
gate into the 35 workflows that lack it, or run it once in `ci.yml`.
**Not done — awaiting your authorization.** See
`04-deployment-manifest.md` §5.

---

## APPENDIX B — MATERIAL AMENDMENT (2026-11-01, later same day)

A report from another session surfaced something my scans could not see, and it
changes §1. Recording it here rather than leaving §1 to stand alone.

### B.1 — A restricted Stripe key was reportedly exposed outside this repository

`empire-progress-report.html:709`, a file committed in this repository, contains
this as a **P1 / CRITICAL** action item written for Derek:

> "**Rotate Stripe keys** — `pk_live_` and `rk_live_` were shared in chat
> plaintext. Rotate immediately." — owner: Derek (browser), 5 min

**This matters, and it is different from everything in §1–§3.**

- `pk_live_` is publishable. Sharing it is harmless (Appendix A.1).
- **`rk_live_` is a *restricted* key.** Unlike a publishable key, a restricted
  key carries real, scoped API authority against the live account. Depending on
  the permissions it was created with, it can read customer and payment data and
  potentially perform write operations. **Exposure of an `rk_live_` key is a
  genuine credential incident requiring rotation.**

### B.2 — Why my scans did not and could not find it

My scans are still accurate, and so is their result: `rk_live_[0-9A-Za-z]{20,}`
returns **0 matches** in the working tree and **0** across all 45 commits. The
key's *value* is not in this repository.

The exposure was **in a chat transcript**, not in a file. §5 of this report
named exactly this class of gap — "credentials pasted into a chat, clipboard
history, or shell history" sits outside what a repository scan can reach. This
is that gap turning out to be occupied.

**So §1's verdict needs this qualifier:** no secret credential is *committed to
this repository*, **and** at least one live-mode restricted key has reportedly
been exposed elsewhere and may never have been rotated.

### B.3 — Required action — yours, not mine

1. Open the Stripe Dashboard → Developers → API keys.
2. Check whether the `rk_live_…` restricted key referenced in that item still
   exists and is still active. If it is, **roll it.**
3. Roll the `pk_live_` keys too if you want a clean slate — not required for
   security, but it costs nothing and the repository holds 2 of them across 23
   files, which would then need updating.
4. Review the account's recent API request log for calls you do not recognise.
5. Treat `empire-progress-report.html:709` as unresolved until you have
   confirmed rotation. The item has been sitting in the repository flagged
   CRITICAL; nothing in the repository records that it was ever done.

**I cannot verify rotation status and I will not touch any credential.** This is
the one item in this whole sprint that only you can close, and it is the only
confirmed credential-exposure event found.
