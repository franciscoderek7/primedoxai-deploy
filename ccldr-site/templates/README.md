# CCLDR document templates — content for the locked "Warrior+"/"PRO+" cards

`documents.html` already advertises 6 paywalled document cards (Expanded
Disclosure, Section 8/9/10(b) Charter Applications, BENO-X Medical
Necessity Package, ACMPR Designated Grower Package, Jordan Application)
with real titles, descriptions, and case-law tags — but none of them had
any actual content behind them. The 2 free cards ("Disclosure Request
Letter — Standard" and "Arrest/Search Documentation Log") work because
their text is embedded directly in `documents.html`'s `downloadTemplate()`
JS function; the paid ones just redirect to `index.html#pricing` with
nothing to actually deliver once someone pays.

This folder fills that gap: actual drafted template content for each of
those 6 locked cards, matching the format and disclaimer style of the two
free ones already live on the site.

| File | Matches documents.html card |
|---|---|
| `expanded-disclosure-video-warrant.txt` | Expanded Disclosure Request — Video & Warrant Package |
| `s8-charter-application.txt` | Section 8 Charter Application — Notice of Motion |
| `s9-arbitrary-detention.txt` | Section 9 Arbitrary Detention — Charter Application |
| `s10b-right-to-counsel.txt` | Section 10(b) Right to Counsel — Charter Application |
| `beno-x-medical-necessity-package.txt` | BENO-X Medical Necessity — Full Application Package |
| `acmpr-designated-grower-package.txt` | ACMPR Access Application — Designated Grower Education Package |
| `jordan-application-s11b.txt` | Jordan Application — Unreasonable Trial Delay (s.11(b)) |

## What this is, and isn't

These are educational drafting templates — bracketed placeholders, Ontario
style of cause, and a disclaimer block, same as the free templates already
live on the site. They are not legal advice, not filing-ready documents,
and case citations should be independently verified by a lawyer before any
real use (flagged inline in each file). I did not fabricate any case
citations — every case cited is one already used elsewhere in this repo
(`archive/ccldr/case-law.json`, `archive/ccldr/beno-x.json`,
`documents.html`'s own doc-tags) or a well-established case directly named
on the existing doc-tags (R v Mann, R v Jordan) that I'm matching, not
inventing.

## What's NOT done here — a real gap, flagged for Derek/Manus

I deliberately did **not** wire these into `documents.html`'s
`downloadTemplate()` function or change the locked buttons. Doing so would
make this paid content downloadable by anyone for free, since the site has
no login/paid-status check today — the "locked" cards currently just
redirect to `index.html#pricing`, there's no mechanism that verifies
someone actually paid before showing them. Wiring real content behind a
real paywall needs an actual unlock mechanism (tied to Stripe webhook
status, the 24-hour-trial account state, or some other auth check) — that's
frontend/auth work, not a backend/content task, so it's Manus's build, not
this folder's job. Once that exists, the content here is ready to drop in.
