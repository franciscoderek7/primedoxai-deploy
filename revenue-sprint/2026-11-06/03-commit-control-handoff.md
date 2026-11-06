# FHI — HANDOFF, COMMIT CONTROL & REVENUE STATUS

Date: 2026-11-06 · Branch `claude/revenue-intake-review` @ `056ac19`
(local == origin, 0 ahead / 0 behind)

**Nothing committed, pushed, merged, deployed or CI-triggered. 17 held changes
untouched. C3 on HOLD.**

---

## PART 1 — THE COMMIT: STOPPED, AS YOUR OWN BRANCH INSTRUCTS

> **The nine-file list cannot be identified unambiguously, so I did not commit a
> guessed selection. And the "nine" was my miscount — not yours.**

### The actual inventory

```
19 porcelain entries
 ├─ 17  the held changes  ────────────── EXCLUDED, untouched
 └─  2  report directories ──── expand to 18 FILES
```

| Set | Contents | Count |
|---|---|---|
| **A** | "Seven reports" — `2026-11-05/01…07-*.md` | **7** |
| **B** | "Proposed security artifacts" — `2026-11-05/proposed/*` | **9** |
| **C** | `2026-11-06/01`, `02` — written *after* your inventory was described | **2** |

**A = 7 · B = 9 · C = 2 · A+B = 16 · A+B+C = 18.**

### Why "nine" is ambiguous — three readings, one numerically exact and wrong

1. **A+B = 16.** This is what your stated inventory literally describes:
   *"Seven reports. Proposed security artifacts."* **No guessing required** — it
   includes everything in both named categories.
2. **B alone = 9.** This matches the number **exactly**. But it would commit the
   nine artifacts and **none of the seven reports** your inventory lists first.
   Numerically perfect, semantically backwards.
3. **A+B+C = 18.** Everything, including two reports your inventory predates.

**Where the number came from: me.** After the 2026-11-05 sprint I wrote "nine
files — seven reports and the `proposed/` artifacts." At that moment A+B was
**15**, not nine. I miscounted, then repeated it. The 15 in your breakdown is
the correct contemporaneous figure; the nine never corresponded to any real set.
**The discrepancy you flagged is my error, and you were right to stop on it.**

Because reading 2 is numerically exact while meaning the opposite of your
inventory, this is precisely the case where guessing would be wrong. **Nothing
was staged.**

### A HARD BLOCKER found during pre-commit verification

Running the privacy scan before staging caught something that would have been
irreversible:

| File | Contained |
|---|---|
| `2026-11-05/04-dashboard-avatar-integration-audit.md` | **exposed credential A, in 4 places** |
| `2026-11-05/06-dashboard-enrollment-design.md` | **exposed credential B, in 1 place** |

`primedoxai-deploy` is a **public** repository. Committing those two files
as-written would have **published both compromised dashboard credentials into
public git history permanently** — unreachable by any later edit.

I wrote both files before your "do not reproduce the credentials" instruction
arrived, which is why they were non-compliant. **I have redacted both.** The
values were read programmatically from the source files and never typed; the
redaction script substitutes placeholders.

| File | Blob before | Blob after |
|---|---|---|
| `04-dashboard-avatar-integration-audit.md` | `d55b625b4bc3` | **`5125121768b2`** |
| `06-dashboard-enrollment-design.md` | `2893bc7aa365` | **`196fd58beeee`** |

**Re-scan of all 18 files: 0 hits** for either credential, for the four
never-publish literals, and for `sk_/rk_/whsec_/ghp_` secret shapes.

### Pre-commit verification — complete, so one word finishes this

| Check | Result |
|---|---|
| Branch / baseline | `claude/revenue-intake-review` @ `056ac19`, **0 ahead / 0 behind** |
| Commit hooks | **none active** — only `.sample` files in `.git/hooks/` |
| `core.hooksPath` override | **not set** |
| Workflows firing on this branch | **NONE** — no `branches:` filter matches it, no path filter covers `revenue-sprint/` |
| CI from a commit | **impossible** — CI fires on push, and no push is authorized |
| 17 held changes | **excluded**, all 17 present and unmodified |
| C3 (`council-engine.js`) | **excluded, on HOLD** — worktree blob `ae568f65`, HEAD blob `3d4fc522`, unchanged |
| Credentials / secrets in the candidate files | **0 after redaction** |
| Checksums | all 18 recorded (§below) |

### Checksums — all 18 candidates, post-redaction

```
A  01-phoenix-core-repair-assessment.md          e8fcd8db4a41   19,851 B
A  02-human-sovereignty-framework.md             4d5d2ed0c177    8,049 B
A  03-execution-work-package-report.md           6f14c908d681   25,179 B
A  04-dashboard-avatar-integration-audit.md      5125121768b2  (redacted)
A  05-security-remediation-plan.md               299e06eed6dd   22,082 B
A  06-dashboard-enrollment-design.md             196fd58beeee  (redacted)
A  07-controlled-execution-handoff.md            ae3e57a918b9   23,308 B
B  proposed/compose-loopback.patch               c39a93bb7841      290 B
B  proposed/idempotency-store.js                 8f00eacf8b1b    2,015 B
B  proposed/server-js-ordering-and-bind.patch    337e3fcd8c88    1,247 B
B  proposed/transactions-table.sql               8f3faddec88b    3,335 B
B  proposed/webhook-guard-v2-recovery.test.js    aff3c4a2d0ae    6,525 B
B  proposed/webhook-guard-v2.js                  105b2acbb50d    5,728 B
B  proposed/webhook-guard-v2.test.js             a686d6552a98    8,546 B
B  proposed/webhook-guard.js                     fb1099d5777d    3,729 B
B  proposed/webhook-guard.test.js                e6bf298edfad    5,771 B
C  2026-11-06/01-ccldr-and-greenblast-readiness.md  46c851632b80  16,541 B
C  2026-11-06/02-greenblast-delivery-kit.md         c6207fe8b7f8   9,588 B
```

### What I need — one word

| Say | I stage and commit |
|---|---|
| **"commit A+B"** | the 16 files your inventory describes — **my recommendation** |
| **"commit B"** | the 9 artifacts only (matches the number, omits all seven reports) |
| **"commit all"** | all 18, including the two newest reports |
| **"commit A"** | the 7 reports only |

Your authorization is already on record; I am not asking for a second one. I am
asking which set, because the number and the description point at different
things and I will not choose for you.

---

## PART 2 — DASHBOARD CREDENTIAL REMEDIATION

### Both exposure locations — values not reproduced

| # | File:line | Live? |
|---|---|---|
| 1 | `francisco-holdings-site/empire-dashboard.html:579` | **YES** — ships to franciscoholdingsinc.com |
| 2 | `francisco-holdings-site/dashboard-v3/cisco1170.js:3` | **YES** — loaded by `dashboard-v3/index.html:8` |

Both under `francisco-holdings-site/`, both matched by
`deploy-francisco-holdings.yml`'s `paths:` and its recursive `*.html`/`*.js`
copy. The two values **differ** — they are separate secrets.

### Account-level actions required — yours alone

These are not repository actions. **Nothing in git revokes them.**

1. **Treat both as compromised.** Anyone who has loaded either page may hold them.
2. **Change them wherever they also grant access** — if either string is reused
   for any account, mailbox, device or service, change it there first. A gate
   password reused elsewhere is the real exposure.
3. **Removal and rotation must happen together.** A new value in the same files
   is public again on the next deploy.
4. **Until both are removed, treat both dashboards as public pages.** Put nothing
   behind them you would not publish.

**I have not rotated anything and make no claim that rotation has occurred.**

### Removal changes — specified, not written

A removal diff necessarily contains the deleted line, so these are **specified**
rather than committed as patches:

| File | Baseline blob | Edit |
|---|---|---|
| `dashboard-v3/cisco1170.js` | `9ebb0bf89bfb5d08` | delete the file (119 lines) |
| `dashboard-v3/index.html` | `fd2287e6417be2e4` | delete line 8 |
| `empire-dashboard.html` | `1a80143509648763` | delete line 579, `unlock()` at 581-596, the session at 588/598, lock markup at 320-324 |

### Server-side authentication — designed, blocked on one decision

Full design in `2026-11-05/06-dashboard-enrollment-design.md` (now redacted):
one-time server-minted enrollment token, single-use, 15-minute expiry, printed
to the launching terminal and written `0600`; three matching entries
**re-verified server-side** so the UI requirement is honoured without treating
repeated entry as authentication; Argon2id; `HttpOnly/Secure/SameSite=Strict`
sessions, 24h absolute + 2h idle; server-side rate limiting and lockout;
filesystem-based recovery no unauthenticated visitor can reach; audit logging
that records neither passwords nor session secrets.

Behind **`avatar-lab/server.js`** — already loopback-only (`:12`, `:157`),
already proposal-only with the authority gate enforced server-side.
**Not exposed publicly, not moved, not implemented.** Visual identity preserved:
`--void #050508`, `--cyan #00D4FF`, `--gold #C9B896`, Orbitron. Accessibility
corrections specified (the existing gate's `#444`-on-`#050508` is ~2.2:1,
against a 4.5:1 AA minimum; the `visibility:hidden` approach yields a blank page
without JS).

**Blocked on:** GitHub Pages cannot run any of it. The architecture decision —
host behind a server, or remove the gates — gates all implementation.

---

## PART 3 — GREEN BLAST

All nine deliverables you listed are written:
**`2026-11-06/02-greenblast-delivery-kit.md`** — landing-page copy, $500 CAD
scope with explicit inclusions/exclusions, intake fields and copy, lead-delivery
design, engagement terms with refund policy, payment instructions, payment
**confirmation requirements**, the 10-section diagnostic report template, and the
pre/during/post delivery checklist.

**One blocker gates steps 3–4:** `shared/lead-capture/fhi-intake.js:32`
`ENDPOINT: ''`. Until a destination exists, no inquiry reaches you. **I did not
test a submission** — every destination is a live external service, so per your
rule I do not claim the form works.

Payment confirmation is deliberately **manual**: confirm receipt in the account
itself, not from a notification email and not from a dashboard. The webhook
guard is tested but disconnected and unverified against real PayPal signatures,
and `payment_transactions` does not exist.

---

## PART 4 — CCLDR VERIFIED SALES READINESS

Verified in `2026-11-06/01`. Summary:

| Question | Answer |
|---|---|
| Payment destination | **CORRECT** — hardcoded `paypal.me/techpetcage/<amount>CAD` on every live button, independent of the price map |
| Actual prices | Digital **$99/mo** · Course **$299 once** · Foundation **$149/mo** · Practitioner **$499/mo** · Sovereignty **$999/mo** · Elite **$1,499/mo** |
| Customer deliverables | **Partly real** — `boardroom.html` (972 lines) and 6 gated rooms exist; **7** templates exist |
| Fulfilment process | **BROKEN.** `membership.js:18-19` holds Supabase **placeholders**; `getVerifiedTier()` fails closed to `free`, so no payer is ever granted access |
| Tier mapping | **BROKEN.** Tiers are `free/warrior/professional/elite/sovereign`; products are `digital/course/foundation/practitioner/sovereignty/elite`. **No `practitioner` tier exists** |
| Delivery capacity | Manual only, Derek. Real for the **$299 Course**; not for the recurring tiers |
| Refunds / support | **NONE EXISTS** — no terms, no refund policy, no limitations page anywhere |

**Two blockers that make selling today illegitimate:**

1. **`index.html:976` claims "35+ court-ready document templates." There are 7.**
   Live, in front of buyers.
2. **Five of six products advertise `/mo`, and `paypal.me` cannot bill
   recurring.** One payment, no subscription, customer expects ongoing access.

**The $499 Practitioner route is withdrawn.** Only the **$299 Course** is
honestly sellable, after the claim is corrected — 4 sales = $1,196.

| | |
|---|---|
| **Verified gross revenue** | **$0.00** |
| Paying customers | **0** |
| Inquiries | **0** |
| Projected (4 Course sales) | $1,196 CAD — **projection, not revenue** |

---

## PART 5 — REMAINING DECISIONS AND NEXT THREE ACTIONS

### Decisions requiring you

| # | Decision | Blocks revenue? |
|---|---|---|
| **1** | **Which commit set — A+B (16), B (9), A (7), or all (18)?** | no |
| **2** | Correct "35+ templates" → 7 | **YES** |
| **3** | Hide the five `/mo` tiers | **YES** |
| **4** | Verify `paypal.me/techpetcage` resolves | **YES** |
| **5** | Set `fhi-intake.js` `ENDPOINT` | **YES** |
| **6** | Write CCLDR terms + refund policy | **YES** |
| **7** | Configure Supabase + remap tiers to products | **YES** (tiers only) |
| **8** | Rotate both dashboard credentials | no — trust |
| **9** | Rotate the `rk_live_` Stripe key | no — trust |
| **10** | Fix forgeable approval in `zprimedox-ai-graph` | no — **CRITICAL** |
| **11** | Apply the `server.js` ordering + bind patch | no |
| **12** | Apply the compose loopback patch | no |
| **13** | Create `payment_transactions` | later |
| **14** | Authorized PayPal sandbox test | later |
| **15** | Dashboard architecture: server or remove the gates | no |
| **16** | One-line `init()` fix (3 buttons lose their amount) | partial |
| **17** | Per-executive council prompts | no |

### The three highest-value next actions

**1. Correct the "35+ templates" claim and hide the five `/mo` tiers.**
Those two edits separate a legitimate sale from taking money for something you
cannot deliver or bill again. Nothing else should ship first.

**2. Open `paypal.me/techpetcage`.** One click, still never tested. Every
product on every property routes through it. If it does not resolve, nothing
else in this report matters.

**3. Answer the commit question with one word** — A+B is my recommendation —
and the handoff is closed. The redaction blocker is already cleared.

---

## PRESERVED WORK

| | |
|---|---|
| Held changes at start / end | 17 / **17** |
| C3 | **HOLD** — worktree `ae568f65`, HEAD `3d4fc522`, unmodified |
| `reset` / `clean` / `stash` / `restore` | **none** |
| Files deleted, renamed or overwritten | **none** |
| Staged | **0** |
| Committed / pushed / merged / deployed / CI | **none** |
| External systems modified | **none** |
| Changed this session | 2 files redacted (my own reports, to remove credentials) + this handoff |
