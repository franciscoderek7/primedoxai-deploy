# FHI SPRINT 2 — WORKSTREAM D / TASK 6
## Deployment Manifest and Pre-Deploy Checklist

Date: 2026-11-01
Method: read-only. No workflow was edited, enabled, disabled or dispatched.

---

## 1. SCALE

| Metric | Count |
|--------|-------|
| Workflow files in `.github/workflows/` | **39** |
| That clone a target repo, wipe it, copy files, and push | **28** |
| Armed on `push` to `claude/francisco-revenue-sprint-MEva6` | **26** |
| Containing a secret-scanning gate | **4** |
| Recorded runs on the sprint branch to date | **304** |

---

## 2. THE CRITICAL GOVERNANCE FINDING

> **Pushing to the development branch deploys to live production domains.**

26 of the 39 workflows declare:

```yaml
on:
  push:
    branches: [main, claude/francisco-revenue-sprint-MEva6]
```

The feature branch is **not** a staging branch. It is a second production
trigger. `claude/francisco-revenue-sprint-MEva6` has **304 recorded workflow
runs**, many with `conclusion: success`, pushing to live sites including
`omniaguard.com`, `franciscoholdingsinc.com`, `zprimedoxaihq.com`, `kiaros.ai`,
`vigilax.com`, `vaultvelocityauto.com`, `ccldr.net` and the swarm sites.

This is why CLAUDE.md's "develop on the feature branch, main needs sign-off"
rule does **not** currently provide the protection it reads as providing. On
this repository, a feature-branch push *is* a production deploy.

**Recommendation:** remove `claude/francisco-revenue-sprint-MEva6` from the
`branches:` list in all 26 workflows, leaving `main` plus the existing
`workflow_dispatch`. Development would then be safe, and deployment would be a
deliberate act (merge to main, or press Run workflow).
**Not done — this edits 26 files and is a production-behaviour change.
Awaiting your authorization.**

---

## 3. THE DESTRUCTIVE PATTERN, EXACTLY AS WRITTEN

All 28 clone-replace-push workflows follow this shape (verbatim from
`deploy-francisco-holdings.yml`):

```bash
# 1. clone the live target repo
git clone https://x-access-token:${{ secrets.DEPLOY_TOKEN }}@github.com/franciscoderek7/francisco-holdings.git /tmp/fh

# 2. DELETE EVERYTHING except .git
find /tmp/fh -mindepth 1 -not -path '/tmp/fh/.git*' -delete

# 3. copy back only files matching an extension allowlist
find . -type f \( -name "*.html" -o -name "*.js" -o -name "*.css" -o -name "*.json" \
  -o -name "*.webp" -o -name "*.jpg" -o -name "*.jpeg" -o -name "*.png" -o -name "*.svg" \
  -o -name "*.gif" -o -name "*.ico" -o -name "*.xml" -o -name "*.txt" -o -name "*.md" \) | ...

# 4. commit and push to the live branch
git add -A
git commit -m "..." || echo "Nothing to commit — already up to date"
git push origin main
```

### Risk register for that pattern

| # | Risk | Severity | Status today |
|---|------|----------|--------------|
| **D1** | **Extension allowlist vs. total wipe.** Step 2 deletes every file; step 3 restores only 14 extensions. Any other file type in the target repo is permanently removed from `main` on the next deploy — `.pdf`, `.woff`/`.woff2`, `.mp4`, `.csv`, `.webmanifest`, `.map`, `.yml`, `.pdf` invoices, anything. | **High (latent)** | **Not currently firing.** I enumerated every extension in `francisco-holdings-site/` — all 9 present types (`html js css json webp jpg png txt xml`) are inside the allowlist. The gap is real but dormant. It fires the first time anyone adds a font or a PDF. |
| **D2** | **Feature branch is a production trigger.** §2. | **High** | **Active.** 304 runs. |
| **D3** | **`|| echo "Nothing to commit"` swallows a failed commit**, and `git push` then runs regardless. A genuine commit failure is reported as success. | Medium | Active in all 28. |
| **D4** | **Loop-A/Loop-B bleed checks that warn instead of failing.** `deploy-francisco-holdings.yml` prints `WARN:` and continues (comment: *"Warn but don't fail — holding co may legitimately reference subsidiaries"*). | Medium | Active. Only 1 workflow does this; CCLDR's equivalent gate correctly `exit 1`s. |
| **D5** | **35 of 39 workflows have no secret scan.** | Medium | Active. See credential report §A.3. |
| **D6** | **`DEPLOY_TOKEN` is interpolated into a clone URL** in all 28. `${{ secrets.* }}` is masked in logs, but a token in a URL is also in the runner's process list and in `/tmp/<dir>/.git/config` for the rest of the job. | Low–Medium | Active. Mitigate by using `git config --global credential.helper` or an `extraheader` instead of embedding in the URL. |
| **D7** | **No post-deploy verification.** The final step prints `FRANCISCO HOLDINGS DEPLOYED` and `Live in: ~2 minutes` unconditionally — it does not check that the push landed or that the page serves. | Low | Active. This is also where "deployed" claims in past reports came from; the banner is a `echo`, not a measurement. |
| **D8** | **`deploy-safety.test.js` exists, passes 9/9, and is never executed by CI.** No workflow references it. `ci.yml` runs only on `dev`/`staging`/`main` and only tests `backend/` and `engine|floors`. | Medium | Active — and the cheapest to fix. |

Plain `git push origin main` (not `--force`) is a genuine safety property here:
it is fast-forward-only, so a concurrently-updated target rejects the push
rather than overwriting it. That behaviour should be preserved in any change.

---

## 4. LIVE FINDING — CCLDR HAS NOT DEPLOYED SINCE 2026-07-12

This came out of the audit and matters more than the rest.

**Last successful `deploy-ccldr` run:** run #66, `workflow_dispatch` on `main`
at `fc8b574`, **2026-07-12**. Every `push`-triggered run since has **failed**.

**Why run #70 failed** (2026-09-05, commit `c4550aab`) — one line:

```
FAIL: Loop B brand bleed detected in CCLDR site
ccldr-site/index.html:756:  <a href="https://omniaguard.com" …>OMNIAGUARD</a>
##[error]Process completed with exit code 1.
```

A single footer link to omniaguard.com in the CCLDR site trips the zero-bleed
gate, which correctly `exit 1`s. The gate is doing its job; the content
violates it.

### What is therefore NOT on ccldr.net

Commit `c4550aab` ("unify all payment links to paypal.me/techpetcage + expand
payment options") has **never deployed**. Live ccldr.net is at the 2026-07-12
state.

**Good news, and a correction to the obvious fear:** I checked the deployed
commit. At `fc8b574`, `ccldr-site/` already contained **144
`paypal.me/techpetcage` links and ZERO `paypal.me/derekfranciaco1`**. The live
site is already on the correct handle. **This is not a payment-handle
emergency.**

**What *is* wrong on the live site** — `ccldr-site/pricing.html` as deployed:

| Live line | Content | Problem |
|-----------|---------|---------|
| 1067 | `<!-- <script src="https://js.stripe.com/v3/"></script> -->` | Stripe.js is **commented out** |
| 1068 | `var stripe=Stripe(STRIPE_PK);` | **NOT** commented out → `Stripe` is undefined → **ReferenceError**, which throws and kills the rest of that script block |
| 1069 | `var STRIPE_LIVE = false;` | the flag says Stripe is off |
| 1073 | `✅ Stripe LIVE. All payment methods active — PayPal, Card (Stripe), and Interac` | **false claim**, contradicts line 1069 |
| 1474 | `Stripe temporarily unavailable — PayPal and Interac accepted.` | **contradicts line 1073 on the same page** |

So the live CCLDR pricing page currently tells a paying customer that card
payment is active, tells them lower down that it is unavailable, and throws a
JavaScript error. **The fix for every one of these already exists on the
branch** (line 1068 commented out, banner rewritten to an accurate multi-method
message) and has been blocked from reaching production for **8 weeks** by the
one-line bleed violation.

### The unblock

Remove or neutralise the OMNIAGUARD footer link at `ccldr-site/index.html:756`.
Options: delete the link; keep the link but drop the visible brand word; or
move it under the `legal-partners` exclusion the gate already honours.

**This is a content change to a Loop-A revenue site and I have not made it.**
It needs your call on which option, because it is a zero-bleed question and
CLAUDE.md puts that under your authority. See §6 for the recommendation.

---

## 5. PRE-DEPLOY CHECKLIST (use before any future deploy)

Run every item. Any **FAIL** stops the deploy.

**Content**
1. `grep -rnE "derek@franciscoholdings\.com|705-307-8080|Kent St W|K9V 2Z8"` over the site folder → must be **0** for every Loop-B site.
2. Zero-bleed: Loop-B brand names (`OMNIAGUARD|Kiaros|SoulStack|CleanSwarm`) must be **0** in Loop-A site folders, and cannabis terms must be **0** in Loop-B folders.
3. Brand spelling: `OMNIAGUARD` in display, `OmniGuard` in sentences; no `OmniaGuard`, `OMNIGUARD`, `Omni Guard`, `Soulstack`, `Primedox`.
4. Payment handle: every `paypal.me/` link must read `techpetcage` (per the 2026-09-05 order). Count them and state the count.
5. No page may claim a payment method is active unless the corresponding code path is actually wired. Check every `LIVE`, `active`, `accepted` banner against its own flag.

**Security**
6. `grep -rnE "(sk|rk)_(live|test)_[0-9A-Za-z]{20,}|whsec_[0-9A-Za-z]{10,}|ghp_[0-9A-Za-z]{36}|AKIA[0-9A-Z]{16}"` → must be **0**. (`pk_live_` is expected and allowed.)
7. No `.env`, `.env.local`, `.pem`, `.key`, `id_rsa` in the deployed set.

**Mechanics**
8. List every file extension in the source folder and diff it against the workflow's copy allowlist. Any extension not on the list **will be deleted from the live site** — see D1.
9. `node --test .github/workflows/tests/deploy-safety.test.js` → 9/9.
10. Confirm the target repo and CNAME in the workflow match the intended domain.

**After**
11. Confirm the workflow run's `conclusion` is `success`. The job's own "DEPLOYED" banner is an unconditional `echo` and proves nothing (D7).
12. Fetch the live URL and verify the specific change is present before calling anything "deployed" or "live".

---

## 6. RECOMMENDED ORDER OF WORK (all awaiting your authorization)

| Priority | Action | Why | Cost |
|---|---|---|---|
| **1** | Unblock the CCLDR deploy — fix `ccldr-site/index.html:756`, then let `c4550aab`'s payment-page corrections reach ccldr.net. | A live revenue page currently makes a false "Stripe LIVE" claim and throws a JS error. 8 weeks stale. Highest customer-facing impact of anything in this sprint. | 1 line + 1 deploy |
| **2** | Wire `deploy-safety.test.js` into `ci.yml`. | A passing safety suite that never runs is not a safety suite. | ~4 lines |
| **3** | Remove the sprint branch from the 26 workflows' `branches:` lists. | Stops development pushes from deploying to production. | 26 one-line edits |
| **4** | Lift the secret-scan gate into the 35 workflows that lack it. | Closes D5. | copy one step ×35 |
| **5** | Replace the extension allowlist with an explicit exclude-list, or fail the job when an unlisted extension is found in the source. | Closes D1 before it fires. | ~6 lines ×28 |
| **6** | Drop `|| echo "Nothing to commit"` in favour of an explicit `git diff --cached --quiet` check. | Closes D3. | 2 lines ×28 |

I have changed nothing. Items 1–6 each need your word, and item 1 additionally
needs your decision on *how* to resolve the bleed.
