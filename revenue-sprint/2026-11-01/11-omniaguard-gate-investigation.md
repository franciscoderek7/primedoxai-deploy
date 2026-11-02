# OMNIAGUARD — LIVE-SITE AUDIT & RECOVERY (P0–P7)

Audit date: 2026-11-02
Repository examined: `franciscoderek7/omniaguard`
Commit examined: `48069977204e2228e5d109f64aa7f957df3a1868`
Domain: `omniaguard.com`
Access: **read-only** — this session cannot push to that repository.

---

## A. EXECUTIVE SUMMARY

1. **The bypass is CONFIRMED — and it is not a gate failure. The workflow was
   never used.** The live content matches **neither** source folder in the
   monorepo. `devices.html` does not exist in `omniaguard-site/` **or**
   `omni-guard-site/`. The live site was published by a **direct push to the
   deploy repository**, which has no CI of its own, so no gate was ever
   evaluated.
2. **Two workflows publish to the same live repository** —
   `deploy-omniaguard.yml` and `deploy-omni-guard.yml`. Either can overwrite
   omniaguard.com, from different source folders, with different gates.
3. **Both spelling gates are broken, in opposite directions.**
   `deploy-omniaguard.yml:20` is a **self-cancelling grep** that can essentially
   never fire, and is **non-blocking** anyway. `deploy-omni-guard.yml:19` is
   **inverted** — it fails the build when it finds the *correct* brand name.
   **Neither tests for `OmniAGuard`, the forbidden form actually on the live
   site.**
4. **Both personal-info gates scan the SOURCE folder, never the publish
   artifact.** Anything introduced during the wipe/copy/CNAME steps is
   unscanned.
5. **The live page count is 7 tracked HTML files, not 3.** `docs/` holds four
   more, with its **own `CNAME` also set to `omniaguard.com`**.
6. **Live payment status: none.** Zero `paypal.me` links; every purchase button
   reads "🔒 Coming Soon". The 25 `derekfranciaco1` links in `omniaguard-site/`
   are **not live** and must not be reported as such.
7. **A fail-closed replacement gate was written and tested — 10/10 cases
   behave correctly, and it catches 8 real violations on the current live
   site** that the existing gates do not.

---

## B. LIVE-SOURCE CONFIRMATION (P0)

| Item | Value | Verified |
|---|---|---|
| Repository | `franciscoderek7/omniaguard` | ✅ `git remote get-url origin` |
| Commit | `48069977204e2228e5d109f64aa7f957df3a1868` | ✅ `git rev-parse HEAD` |
| Commit subject | `🔥 FORCE RESET — OmniAGuard` | ✅ |
| Branches / tags | `main` only; **no tags** | ✅ |
| Root `CNAME` | `omniaguard.com` | ✅ |
| **`docs/CNAME`** | **`omniaguard.com`** — a second CNAME in-tree | ✅ |
| Tracked HTML, reproducible count | **7** | ✅ `git ls-files '*.html' \| wc -l` |
| Build process | **none** — no build step, no generator | ✅ |
| Output directory | **the repository root** — raw static files, served as committed | ✅ |
| Jekyll / Pages config in-tree | **none** — no `_config.yml`, **no `.nojekyll`**, no `.github/` | ✅ |
| Publication mechanism | GitHub Pages serving the repo | ⚠ **UNVERIFIED** — Pages source branch/dir and branch protection are repository *settings*, not readable with anonymous read access |

### The 7 tracked HTML files

```
index.html            devices.html          vpn.html
docs/index.html       docs/demo.html        docs/services-products.html
docs/vigilax/index.html
```

Plus `index.html.AUG15.backup` — **a backup file published and publicly
fetchable**.

**Correction to the supplied audit:** it reported 3 pages. That is the root
count. The reproducible tracked count is **7**, because `docs/` was not
inspected. Which of the two CNAMEs GitHub Pages honours depends on the Pages
source setting, which I cannot read — so **whether `docs/` is also being served
is unverified.** If Pages is set to `/docs`, the *live* site is the `docs/` tree
and not the root at all. **This must be checked in the repository settings
before any recovery step.**

### Workflows that can publish this domain

| Workflow | Source folder | Trigger | Gates |
|---|---|---|---|
| `deploy-omniaguard.yml` | `omniaguard-site/**` | push to `main` **and `claude/francisco-revenue-sprint-MEva6`**, + dispatch | spelling (inert, non-blocking), personal-info (blocking, source-only) |
| `deploy-omni-guard.yml` | `omni-guard-site/**` | push to `main`, + dispatch | spelling (**inverted**, blocking), personal-info (blocking, source-only) |

Both end with `git push origin main` to `franciscoderek7/omniaguard`. CLAUDE.md
says of `omni-guard-site/`: *"do not deploy without Derek's explicit
instruction."* It is nevertheless armed on every push to `main` that touches
that path.

---

## C. GATE INVESTIGATION (P1)

### Classification: **CONFIRMED BYPASS** — publication occurred outside CI

**Confidence: high.** Evidence, three independent lines:

**1. The live content matches no workflow source.**

| File | `omniaguard-site/` | `omni-guard-site/` | live |
|---|---|---|---|
| `index.html` | differs | differs (`1c0c08c5…` vs live `91c166af…`) | `91c166af…` |
| `devices.html` | **absent** | **absent** | present |
| `vpn.html` | differs | **absent** | present |

`devices.html` exists in **neither** source folder. No run of either workflow
could have produced it: both wipe the target and copy only from their own
folder.

**2. The live content would have FAILED the personal-info gate.**
Live `index.html:34` contains a prohibited `@gmail.com` address.
`omniaguard-site/` scans **0** prohibited occurrences; `omni-guard-site/` scans
**0**. So the violation was not in either source — it entered via the push
itself.

**3. The deploy repository has no CI.** `git ls-files` shows **no `.github/`
directory**. Nothing validates a push to `franciscoderek7/omniaguard`.

**Therefore:** the gate was not defeated. It was **not in the path.** Whoever
pushed `48069977` wrote directly to the deploy target. The commit subject
(`🔥 FORCE RESET`) is consistent with this but is **not** the evidence — the
file-level mismatch is.

### Independently, both spelling gates are defective

**`deploy-omniaguard.yml:20` — self-cancelling and non-blocking:**

```bash
ERRORS=$(grep -rn "OMNIAGUARD\|OmnIAGuard\|OMNIAGUARD" omniaguard-site/ \
         --include="*.html" | grep -v "OMNIAGUARD" | wc -l)
if [ "$ERRORS" -gt 0 ]; then
  echo "WARN: Retired OMNIAGUARD spelling detected (non-blocking)"
  ...
fi
echo "PASS: OMNIAGUARD spelling check complete"
```

Two defects. First, alternatives 1 and 3 of the pattern are the **same string**
as the `grep -v` filter, so every line they match is immediately discarded —
`ERRORS` is 0 in practice. Second, even when non-zero the step **prints a
warning and exits 0**: there is no `exit 1`. The in-file comment
(*"OMNIAGUARD is RETIRED. Only OMNIAGUARD (no 'ia') is correct"*) names the same
string on both sides of the sentence and cannot be satisfied as written.

**`deploy-omni-guard.yml:19` — inverted:**

```bash
ERRORS=$(grep -rln "OMNIAGUARD\|OMNIGUARD\|Omni Guard\|OMNI GUARD" \
         omni-guard-site/ --include="*.html" | wc -l)
if [ "$ERRORS" -gt 0 ]; then
  echo "FAIL: Wrong OMNIAGUARD spelling detected"
  exit 1
fi
echo "PASS: OMNIAGUARD spelling correct on all pages"
```

The first alternative is `OMNIAGUARD` — **the correct display name per
CLAUDE.md**. The gate therefore **fails the build on the correct spelling**,
while its success message claims the opposite. Any properly branded page cannot
deploy through this workflow.

**Neither gate tests `OmniAGuard`** — the form CLAUDE.md forbids and the form
in all three live `<title>` tags.

### Both personal-info gates scan source, not the artifact

```bash
# deploy-omniaguard.yml:30  (and deploy-omni-guard.yml:30, same shape)
LEAKS=$(grep -rn "<four prohibited literals — redacted; see the workflow source>" \
        omniaguard-site/ --include="*.html" | wc -l)
if [ "$LEAKS" -gt 0 ]; then exit 1; fi
```

These **do** block correctly — `exit 1`, and the pattern is right. Four
limitations:

1. **Scope is the source folder, never `/tmp/omniaguard`** — the publish
   artifact. The gates run at steps ~17–36; the artifact is assembled at
   ~40–59, where `CNAME` and `.nojekyll` are written **after** all validation.
   Nothing re-checks the output.
2. **`--include="*.html"` only.** A prohibited string in a `.js`, `.json`,
   `.svg`, `manifest.json` or `CNAME` is not scanned. `omni-guard-site/`
   contains `sw.js`, `manifest.json`, two `.svg` icons and six `empire/*.js`
   files — all copied, none scanned.
3. **On failure the gate `grep`s the matches into the log**, printing the
   personal information it just detected into CI output.
4. **The publishing step does not depend on validation via `needs:`** — all
   steps are in one job, so ordering is the only thing stopping publication. A
   step inserted out of order, or `continue-on-error`, would publish unchecked.
   No `continue-on-error` is present today (verified).

### Other items

- **Workflow permissions:** neither workflow declares a `permissions:` block,
  so both inherit the repository default. **Least-privilege is not applied.**
- **`DEPLOY_TOKEN` in the clone URL** (both, line 40) — masked in logs, but
  present in the runner's process list and in `/tmp/omniaguard/.git/config` for
  the remainder of the job.
- **Branch protection on `franciscoderek7/omniaguard`: UNVERIFIED.** It is a
  repository setting and this session has anonymous read only. **If no
  protection exists, the direct-push path stays open regardless of any workflow
  fix.** This is the single most important unverified item in the report.

---

## D. PRIVACY FINDINGS (categories and locations only)

No prohibited value is reproduced below.

| Category | Location | Status |
|---|---|---|
| personal email address | live `index.html:34` (a `mailto:` in the primary CTA) | **CONFIRMED on the live site** |
| forbidden brand spelling | live `index.html:6` (`<title>`), `index.html:34`, `devices.html:2`, `vpn.html:2`, `docs/demo.html:29`, `docs/index.html:3`, `docs/index.html:17` | **CONFIRMED, 7 occurrences** |
| Loop-A brand on a Loop-B site | live `index.html:36`; `devices.html` / `vpn.html` footers | **CONFIRMED** |
| AI branding exposed on an anonymous brand | live `index.html:36` | **CONFIRMED** |
| secret-shaped credentials | live tree | **0 — none found** ✅ |
| published backup artifact | `index.html.AUG15.backup` | **CONFIRMED, publicly fetchable** |

CLAUDE.md's identity table requires OMNIAGUARD to show **no personal
information** and keep **AI branding hidden**. Rows 1, 3 and 4 breach that on
the live site now.

**I have not remediated any of these.** Per the brief, detected information is
classified, not rewritten.

---

## E. 3-PAGE vs 31-PAGE RECONCILIATION (P4)

### What `FORCE RESET` actually changed — partially established

History deepened to 50 commits. The eight most recent:

```
4806997  🔥 FORCE RESET — OmniAGuard          <- live
cf2c384  🌐 OmniAGuard — The Best Looking Website on the Internet
07b370c  🎥 Interactive Demo — T Empire
1580c9e  🏛️ T Empire Aesthetics
c401700  💰 3-Tier Revenue System — Starter, Professional, Enterprise
8df1db0  🛡️ Restored OmniAGuard
f39341a  🛡️ OmniAGuard — The Most Secure Empire on Earth
173697d  🧠 Triumvirate Architecture — FHI + OmniAGuard + PrimeDox AI
```

`8df1db0` *"Restored OmniAGuard"* indicates this has happened before — the
repository has a history of wholesale resets, not incremental edits. **I did not
diff `cf2c384..4806997`**; the brief forbids treating the message as proof, and
a file-level diff of the parent is the right evidence. That is a cheap next step
and is listed in §J.

**What is established:** the live tree matches neither monorepo source, so this
is not a reduced copy of the 31-page site. It is a **separate lineage**.

### Is the stub safer than the 31-page site?

**Neither is safe. They fail differently.**

| | live 3-page stub | monorepo `omniaguard-site/` (31 pages) |
|---|---|---|
| personal info | **1 occurrence** ⚠ | **0** ✅ |
| forbidden brand spelling | **7 occurrences** ⚠ | 0 in the audited sample |
| fabricated statistics | **"12,847 AI agents", "WORLD'S FIRST", "99.99% uptime", "847 nodes"** ⚠ | **"2.4B+ threats blocked", "99.97% uptime"** ⚠ |
| contractual/guarantee claims | **"Zero-log policy — verified"** ⚠ | **"Zero Prompt Injection Guarantee — backed contractually"**, "zero breach rate", "zero-downtime guarantee" ⚠ |
| **fake live telemetry** | **2 widgets** — randomised threat feed (4s) and speed test (2s) ⚠⚠ | none found |
| retired payment handle | **0** ✅ | **25 links** ⚠ |
| broken nav | **`./crypto.html` 404 on all 3 pages** ⚠ | unassessed |
| published backup file | **yes** ⚠ | n/a |

**Restoring all 31 pages would remove the fake telemetry and the personal-info
leak, and introduce 25 retired-handle payment links plus the contractual
guarantee claims.** It is a trade, not a fix. **Do not treat the larger site as
the safer site.**

### Proposed target sitemap — review each page individually

| Page | Disposition |
|---|---|
| `index.html` | **REWRITE.** Remove the personal email, the Loop-A/AI footer, "WORLD'S FIRST", and the forbidden spelling. Keep the honest "Early Access" framing. |
| `devices.html` | **RETIRE or REWRITE.** The fake threat monitor must go before this page is served at all. |
| `vpn.html` | **RETIRE or REWRITE.** Remove "Zero-log — verified", the randomised speed test, and the uptime/node figures. |
| `crypto.html` | **CREATE or DE-LINK.** Currently a 404 from every page. |
| `index.html.AUG15.backup` | **DELETE from the published tree.** |
| `docs/**` (4 pages) | **ASSESS.** Not covered by the supplied audit; carries its own CNAME and 3 forbidden-spelling occurrences. |
| `omniaguard-site/` 31 pages | **PAGE-BY-PAGE REVIEW.** Not a drop-in replacement. |

---

## F. LIVE-SITE DEFECTS (P3)

| Sev | Finding | Evidence | User impact |
|---|---|---|---|
| **CRIT** | Fake "Live Threat Monitor" presents randomised strings as real monitoring of the visitor's own devices | `devices.html` — hardcoded entries naming an iPhone 14 Pro, MacBook Pro, ASUS AX6000 and a "quarantined" IP, plus `setInterval(...,4000)` injecting a random line from a fixed array, each stamped `new Date().toLocaleTimeString()` | A visitor believes their devices are being monitored. Nothing is. |
| **CRIT** | Fake "Speed Test" for a non-existent VPN | `vpn.html` — `setInterval(...,2000)` randomising latency (`Math.random()*20+5`) and throughput (`Math.random()*3+1`) | Fabricated performance data on a security product |
| **CRIT** | Personal email on an anonymous Loop-B brand | `index.html:34` | Identity bleed; breaches CLAUDE.md |
| **HIGH** | "**Zero-log policy — verified**" / "Zero-log verified. No traffic data retained." | `vpn.html` | A verification claim with no service and no audit. Legally exposed. |
| **HIGH** | "**WORLD'S FIRST** AGENTIC AI CYBERSECURITY" | `index.html:24` | Unsupportable superlative |
| **HIGH** | "monitored 24/7 by **12,847 AI agents**" (both pages), "**99.99%** uptime", "**847** Active Nodes" | `devices.html`, `vpn.html` | Fabricated specifics |
| **HIGH** | Forbidden brand spelling in all three `<title>` tags | `index.html:6`, `devices.html:2`, `vpn.html:2` | This is what search engines index |
| **MED** | Loop-A parent and AI branding named on the anonymous brand | `index.html:36` footer | Cross-contamination |
| **MED** | "All monitoring is client-authorized." | `devices.html` footer | Implies monitoring exists |
| **MED** | Dead nav link `./crypto.html` on all three pages | nav bars | Guaranteed 404 |
| **MED** | Backup file published | `index.html.AUG15.backup` | Unintended disclosure surface |
| **LOW** | "🔒 Coming Soon" buttons sit beside concrete monthly prices ($29/$79/$299, $12/$29/$99) | `devices.html`, `vpn.html` | A visitor may believe the service is purchasable |

**Mitigating, and worth stating:** the "Coming Soon" buttons are honest, there
is **no form and no data collection** on any live page, **no external scripts or
trackers**, and **no credentials**. Nothing collects visitor data. The damage
here is to truthfulness, not to privacy-in-transit.

No form was submitted and no intrusive testing was performed.

---

## G. PAYMENT READINESS (P5)

**Live OmniAGuard payment integration: NOT IMPLEMENTED.** Zero `paypal.me`
links, zero checkout logic, zero third-party payment scripts. All purchase
buttons read "🔒 Coming Soon".

**Whether this is intentional is UNDOCUMENTED.** Nothing in the repository
states a decision. Given the fabricated telemetry, "Coming Soon" is the only
accurate element of the commercial presentation.

| Advertised item | Price shown | Provider | Destination verified | Backend | Deliverable? | Status |
|---|---|---|---|---|---|---|
| Single Device | $29/mo | none | n/a | none | **no product exists** | **NOT IMPLEMENTED** |
| Family Shield | $79/mo | none | n/a | none | **no** | **NOT IMPLEMENTED** |
| Enterprise Fleet | $299/mo | none | n/a | none | **no** | **NOT IMPLEMENTED** |
| Ghost Basic | $12/mo | none | n/a | none | **no VPN exists** | **NOT IMPLEMENTED** |
| Ghost Pro | $29/mo | none | n/a | none | **no** | **NOT IMPLEMENTED** |
| Ghost Enterprise | $99/mo | none | n/a | none | **no** | **NOT IMPLEMENTED** |
| monorepo `omniguard-vpn-99`, `-vault-99`, `-bundle-149`, `-audit-500`, `-session-500` | 99/99/149/500/500 | PayPal (`derekfranciaco1`) | **UNVERIFIED** | none | **unknown** | **NOT LIVE** — present only in `omniaguard-site/`, wired to no live page |

**Account ownership for `paypal.me/derekfranciaco1` and
`paypal.me/techpetcage` is UNVERIFIED.** Neither has been loaded. A URL in
source is not evidence that it resolves or that the account is in good standing.

**The 25 PayPal links in `omniaguard-site/` are NOT live OmniAGuard payment
links** and are not reported as such anywhere in this document.

No payment was initiated. No payment credential was accessed.

---

## H. PROPOSED CHANGES (P2) AND TEST RESULTS (P6)

Patch kept **separate from the audited source**, at
`revenue-sprint/2026-11-01/proposed/`:

- `privacy-gate.sh` (48 lines)
- `prohibited.txt` (11 rules)

Design: **scans the publish artifact**, not the source. Covers `.html .htm .js
.json .svg .xml .txt .md .css .webmanifest CNAME`. **Never prints a matched
value** — only category, path and line. **Fails closed**: exit `2` when it
cannot produce a definitive answer (missing directory, empty artifact, missing
or empty rule file, no scannable files). Exit `1` on a finding, `0` on a clean
pass. It **classifies**; it never deletes or rewrites.

### Test matrix — fictional data only, no real personal information used

| # | Case | Expected | Actual | Result |
|---|---|---|---|---|
| T1 | clean artifact | exit 0 | exit 0, "PASS — 1 file(s) scanned" | **PASS** |
| T2 | prohibited email (fictional) | exit 1 | exit 1, redacted finding | **PASS** |
| T3 | forbidden brand only | exit 1 | exit 1 | **PASS** |
| T4 | secret-shaped key in a **`.js`** | exit 1 | exit 1 | **PASS** — the current gates miss this (`*.html` only) |
| T5 | carrier is **`.json`** | exit 1 | exit 1 | **PASS** — ditto |
| T6 | **empty** artifact | exit 2 | exit 2, "FAILING CLOSED" | **PASS** — an empty dir would otherwise scan clean |
| T7 | artifact directory missing | exit 2 | exit 2 | **PASS** |
| T8 | no argument given | exit 2 | exit 2 | **PASS** |
| T9 | **rule file missing** (scan tool cannot run) | exit 2 | exit 2 | **PASS** |
| T10 | **the real live site** | exit 1 | **exit 1 — 8 findings, all redacted** | **PASS** |

`bash -n` syntax check: clean.

**T10 is the point:** the proposed gate flags the live site's 1 personal-email
and 7 forbidden-brand occurrences, by category and line, with no value
disclosed. The current gates do not — one is inert, one is inverted, and
neither was in the publication path at all.

**Measurement correction:** my first run of T9 printed `exit=0`. That was a
**harness artifact** — `$?` had captured the exit status of `tail` in a
pipeline, not the script. Re-measured directly: **exit 2**, correct.

### Workflow changes proposed — NOT applied

1. Add `permissions: contents: read` to both workflows (least privilege).
2. Split each into two jobs: `validate` and `publish`, with
   `publish: needs: [validate]`, so publication **cannot** run unless
   validation succeeded. Ordering within one job is not a dependency.
3. Move the privacy gate to run against `/tmp/omniaguard` **after** the copy and
   CNAME steps and **before** `git commit`/`git push`.
4. Drop the `grep` that echoes matches into the log; use the gate's redacted
   output.
5. **Fix `deploy-omni-guard.yml:19`** — it currently fails on the correct brand.
6. **Fix `deploy-omniaguard.yml:20`** — remove the self-cancelling `grep -v`,
   target `OmniaGuard|OmniAGuard|OMNIGUARD|Omni Guard`, and make it `exit 1`.
7. Remove `claude/francisco-revenue-sprint-MEva6` from
   `deploy-omniaguard.yml`'s `branches:`.
8. Resolve the two-workflows-one-domain conflict: retire one, or gate both
   behind the same required check.

### Remaining uncertainties

- **Branch protection on `franciscoderek7/omniaguard` — UNVERIFIED.** Without
  it, every workflow fix above is bypassable by the same direct push that
  produced the current live site. **This is the limiting factor.**
- **GitHub Pages source (root vs `/docs`) — UNVERIFIED.** Two in-tree CNAMEs.
  If Pages serves `/docs`, the live site is a different tree than audited.
- `cf2c384..4806997` not diffed.
- The detector's limits: `[a-z0-9._%+-]+@gmail\.com` will flag **any** gmail
  address, including a legitimate public business contact. **It is a
  review-trigger, not a verdict.** Ambiguous findings need human review, and
  the rule set must not be broadened into treating every name as a violation.

---

## I. APPROVAL QUEUE

**Local review only (no repository change)**
1. Accept or amend `proposed/privacy-gate.sh` and `prohibited.txt`.
2. Approve the target sitemap in §E.

**Repository changes (need authorization; `primedoxai-deploy` is writable)**
3. Apply workflow fixes 1–8 in §H.
4. Clean `omniaguard-site/`: fabricated stats, guarantee claims, 25 retired-handle links.

**Repository settings (only Derek can do these — I have no access)**
5. **Enable branch protection on `franciscoderek7/omniaguard`.** Without it, nothing else holds.
6. **Confirm the GitHub Pages source** (root or `/docs`) and resolve the duplicate CNAME.

**Production deployment (explicitly NOT authorized, not recommended yet)**
7. Replace the live three pages.
8. Deploy `omniaguard-site/` — **not until §I-4 is done.**

---

## J. FIRST THREE ACTIONS FOR DEREK

**1. Two repository settings, in the browser, five minutes.**
`github.com/franciscoderek7/omniaguard` → Settings → Branches → add a protection
rule on `main`. Then Settings → Pages → record whether the source is the root or
`/docs`. **Until branch protection exists, every fix in this report is
bypassable by the same push that caused the problem.**

**2. Decide on the fake telemetry — today.**
`devices.html` and `vpn.html` present randomised numbers as live monitoring and
a real speed test, on a public security-vendor site. That is the most serious
finding here. Either authorize replacing those two pages with an honest
holding page, or authorize taking them down. **This session cannot push to that
repository** — read access only — so this needs you or the window that has
write access.

**3. Then, and only then, diff the reset.**
```bash
git -C <omniaguard clone> diff --stat cf2c384 4806997
```
That establishes exactly what `FORCE RESET` removed, which the brief rightly
required not be inferred from the commit message.

---

## K. INTEGRITY STATEMENT

- **Commit examined:** `48069977204e2228e5d109f64aa7f957df3a1868` in
  `franciscoderek7/omniaguard`, verified by `git rev-parse HEAD` and
  `git remote get-url origin`.
- **Files changed in that repository: NONE.** The clone is read-only; this
  session cannot push to it.
- **Committed, pushed, deployed or published to `franciscoderek7/omniaguard`:
  NOTHING.**
- **No workflow was triggered.** No DNS, hosting, repository setting or live
  file was modified.
- **No safety gate was weakened or removed.** The two defective gates were
  documented, not edited.
- **No mock replaced real functionality.** The proposed gate is new validation,
  not a stand-in for anything.
- **No prohibited value is reproduced in this report.** Findings give category,
  path and line only.
- Test fixtures used **fictional** data exclusively.
- New files written, in `primedoxai-deploy` only:
  `revenue-sprint/2026-11-01/11-omniaguard-gate-investigation.md`,
  `revenue-sprint/2026-11-01/proposed/privacy-gate.sh`,
  `revenue-sprint/2026-11-01/proposed/prohibited.txt`.
- **All 17 pre-existing held working-tree changes preserved.**
