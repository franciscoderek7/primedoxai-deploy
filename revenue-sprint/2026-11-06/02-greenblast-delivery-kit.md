# GREEN BLAST — DELIVERY KIT
## Customer-facing copy and internal process. DRAFT — nothing published.

Date: 2026-11-06 · Offer: **$500 CAD**, one-time
**No page was created, no form activated, no email sent.** Every template below
is text for your review.

---

## 1. LANDING-PAGE COPY

> ### Find the three things in your business worth automating — before you spend a dollar automating anything.
>
> Most owner-run businesses know admin work is costing them. Very few can say
> *which* process to fix first, or what fixing it would actually be worth.
>
> The Green Blast Diagnostic answers that in one week.
>
> **A 90-minute working session, then a written diagnostic naming the three
> highest-value processes to automate — with the arithmetic shown, from your
> numbers.**
>
> **$500 CAD. One payment. No subscription.**
>
> **What you get**
> - A recorded 90-minute session walking through how work actually moves through your business
> - A written diagnostic: the three highest-value automatable processes, ranked
> - Hours-recovered estimates **with the calculation shown**, built from the figures you provide
> - What each change would take to implement, and roughly what it would cost
> - Risks and limitations for each — including where automation is the wrong answer
> - A prioritised roadmap, and measurable criteria for whether it worked
> - A 30-minute walkthrough of the report
>
> **What this is not**
> - Not implementation. I do not build, install or configure anything as part of this.
> - Not software resale. I do not take commission on any tool I mention.
> - **Not a guaranteed saving.** Every figure is an estimate derived from your inputs, and labelled as one.
> - Not legal, accounting or tax advice.
>
> **Who it suits**
> Owner-operated Canadian businesses, roughly 2–20 staff, already paying for
> software, with no in-house technical lead, where the owner is still personally
> involved in day-to-day admin.
>
> **Who it does not suit**
> Businesses looking for someone to build the automation. This diagnostic tells
> you what to do; you or a developer then do it.
>
> **Turnaround:** report within **5 business days** of the session.
>
> **If the first opportunity we identify isn't worth more than the fee, I'll tell
> you that in the report.**

---

## 2. SCOPE AND TERMS — plain language

**Price.** $500 CAD, one payment, payable in full before the session.

**What is included.** One 90-minute recorded session; the written diagnostic; one
30-minute walkthrough; one round of clarifying questions by email within 14 days
of delivery.

**What is excluded.** Implementation, code, configuration, software licences,
ongoing support, retainers, and anything not named above.

**Your responsibilities.** Attend the session; nominate one decision-maker;
provide real operational numbers (volumes, hours, hourly rates). **The quality
of the estimates depends entirely on the quality of those numbers** — if you
cannot share them, the diagnostic will be qualitative only, and I will say so.

**Estimates.** Every figure is an estimate calculated from the data you provide.
No outcome is guaranteed. No saving is promised.

**Refunds.** Full refund if you cancel before the session begins. Once the
session has taken place the fee is earned, because the work is the analysis that
follows it.

**Confidentiality.** What you share stays between us. I will not name you as a
client without your written agreement.

**Not professional advice.** This is operational consulting. It is not legal,
accounting, tax or regulatory advice.

---

## 3. INTAKE FORM — fields and copy

Reuse `shared/lead-capture/fhi-intake.js` (23 passing tests, honeypot,
`MIN_SECONDS_ON_FORM`, field caps, five-state status). **It needs `ENDPOINT`
set — decision 7.** Until then it returns `not_configured` and shows a visible
notice, which is honest but captures nothing.

| Field | Required | Notes |
|---|---|---|
| Name | yes | — |
| Email | yes | — |
| Business name | yes | maps to `organisation` |
| What takes the most time right now? | yes | free text, maps to `need` |
| Roughly how many staff? | no | select: 1, 2–5, 6–20, 20+ |
| Where are you located? | no | CASL/timezone context |

**Submit button:** `Request the diagnostic — $500 CAD`
**On success:** "Received. You'll get a reply within one business day with
available session times and payment details. Nothing is charged until you
confirm."
**On failure:** "That didn't send. Email <intake address> directly and I'll pick
it up from there." — **never show success on failure.**

---

## 4. INTERNAL LEAD NOTIFICATION — design only

On a successful submission the destination should produce: timestamp, name,
email, business, the free-text answer, staff band, location, and the
`fhi-intake` status value. **No automated reply to the customer** until you have
chosen the sending path. **Not built** — depends on decision 7.

---

## 5. PAYMENT INSTRUCTIONS AND CONFIRMATION

**Current honest process — manual, and it works:**

1. Customer confirms they want the diagnostic.
2. You send the payment link — `paypal.me/techpetcage/500CAD` — **after
   decision 3 verifies that handle resolves.** Interac to the general FHI intake
   address is the alternative.
3. **You confirm receipt in your own PayPal/bank account.** Not from a webhook,
   not from a dashboard — the account itself.
4. You reply confirming receipt and book the session.
5. Record it: date, amount, currency, method, reference.

**Do not treat a submitted form as a sale.** Do not treat a PayPal notification
email as confirmation without checking the account balance.

**Why manual:** the webhook guard is tested but **disconnected and unverified
against real PayPal signatures**, and `payment_transactions` does not exist yet.
Manual confirmation is the only path that is actually trustworthy today.

---

## 6. DIAGNOSTIC REPORT TEMPLATE

```
GREEN BLAST DIAGNOSTIC — <Business name>
Prepared by Derek Francisco, Francisco Holdings Inc. · <date>
Session held: <date> · Figures supplied by: <name, role>

1. EXECUTIVE SUMMARY
   Three to five sentences. The single most valuable change, and why.

2. YOUR CURRENT SITUATION
   How work moves through the business today, in your own words, played back.
   Volumes and hours as you reported them — sourced, not assumed.

3. OPERATIONAL GAPS IDENTIFIED
   For each: what happens now · where time is lost · how it was measured.
   Mark each as MEASURED (from your figures) or OBSERVED (from the session).

4. AI AND AUTOMATION OPPORTUNITIES — ranked
   For each of the three:
     · What would change
     · Hours recovered per month — SHOW THE ARITHMETIC:
         <volume> × <minutes each> ÷ 60 = <hours>/month
         at <rate>/hr = <$>/month   ← your figures, your rate
     · Confidence: HIGH / MEDIUM / LOW, and why
     · This is an ESTIMATE, not a guarantee

5. IMPLEMENTATION COMPLEXITY
   LOW / MEDIUM / HIGH per opportunity, with what drives it.
   Rough implementation cost range, stated as a range.

6. RISKS AND LIMITATIONS
   Per opportunity: what could go wrong, what it depends on, and where
   automation is the WRONG answer. This section must not be empty.

7. PRIORITISED RECOMMENDATIONS
   Do first / do next / do later / do not do. With reasons.

8. ROADMAP
   Sequence, dependencies, realistic elapsed time. No fixed dates.

9. HUMAN APPROVAL CHECKPOINTS
   Where a person must decide before anything proceeds, and who.

10. MEASURABLE SUCCESS CRITERIA
    Per recommendation: what to measure, baseline today, target, when to check.
    If it cannot be measured, say so rather than inventing a metric.

APPENDIX — Figures you supplied, with dates and sources.
```

**Rules for whoever writes it:** no fabricated benchmarks, no industry averages
presented as the customer's numbers, no "businesses like yours typically see…"
unless a cited source is attached. Every number traceable to section 6's
appendix. **Where `agents/backend/gap-scanner.js:223-303`'s hardcoded
`monthly_value_cad` constants are used, they are assumptions and must be
labelled as such — never presented as findings.**

---

## 7. DELIVERY CHECKLIST

**Before the session**
- [ ] Payment confirmed **in the account**, not from a notification
- [ ] Terms sent and acknowledged in writing
- [ ] Session booked; recording consent obtained in writing
- [ ] Figures requested in advance

**During**
- [ ] Recording running, with consent on the recording
- [ ] Volumes, minutes-per-task and hourly rates captured as the customer states them
- [ ] Anything you could not get a number for — noted as such

**After**
- [ ] Draft written within 3 business days
- [ ] **Every figure traced to the appendix**
- [ ] Risks section non-empty
- [ ] Success criteria measurable
- [ ] No unsupported claim anywhere — read it once specifically for that
- [ ] Delivered within 5 business days
- [ ] Walkthrough booked
- [ ] Recorded: date, amount, currency, method, reference

---

## 8. FOLLOW-UP AND NEXT STEP

**7 days after delivery:** "Have you had a chance to look at it? Happy to answer
questions — that's included."

**21 days:** "If you want the first recommendation implemented, I can quote a
fixed scope. If not, the diagnostic stands on its own and you owe nothing
further."

**No automated sequence. No bulk email. One message at a time, to someone who
paid you.** CASL applies and your consent position is still undecided.

**Explicit:** the diagnostic is complete in itself. It must be useful to a
customer who never buys anything else.
