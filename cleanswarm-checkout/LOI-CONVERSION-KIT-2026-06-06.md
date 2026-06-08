# CleanSwarm — LOI Conversion Kit (2026-06-06)
For closing Ali, Andrew, and Matt (and any similar warm leads) into paying CleanSwarm customers today.

No Stripe access yet — every path below routes to **PayPal.me/derekfrancisco** or **Interac e-Transfer to franciscoderek7@gmail.com**, with manual activation (you send the access link by email once payment lands).

---

## 1. CALL SCRIPT (use for Ali, Andrew, Matt — adjust the bracketed parts)

**Opening (10 sec):**
"Hey [Name], it's Derek — got 2 minutes? I'm calling because I think CleanSwarm could save your crew real hours this month, and I want to get you set up before the offer changes."

**The hook (20 sec):**
"In short: CleanSwarm automates the scheduling, dispatch, and client-follow-up grind for cleaning businesses — the stuff that eats your evenings. Most owners tell me it gives them back 5-10 hours a week."

**The offer (15 sec):**
"I'm running a free 14-day trial right now — no card needed to start. If it saves you time, it's [pricing.html plan price]/mo after that, cancel anytime. If you want in today, I can have you live within the hour."

**Close — ask directly:**
"Want me to set that up for you right now while we're on the phone? I just need your email and I'll send the activation link."

**If they hesitate:**
"No pressure — want me to text you the link so you can try it tonight and we talk tomorrow?"

**If they say yes to paying now:**
"Perfect — easiest way is PayPal or e-transfer, I'll text you the link right now. The second it clears I'll have you live within the hour."

---

## 2. EMAIL TEMPLATES

### A) Ali — follow-up after a call or first contact
**Subject:** CleanSwarm — your 14-day trial is ready, Ali

Hi Ali,

Great talking with you. As promised — here's your CleanSwarm trial, no card required:
👉 [TRIAL_SIGNUP_LINK or cleanswarm-checkout/index.html]

Quick recap of what it handles for you:
- Automated scheduling & dispatch for your crews
- Client follow-up and review requests (so you stop chasing them manually)
- One dashboard for jobs, invoices, and team status

If it's saving you time after the 14 days, plans start at [PRICE]/mo:
💳 PayPal: https://www.paypal.me/derekfrancisco/[AMOUNT]cad
🏦 Interac e-Transfer: franciscoderek7@gmail.com (include "CleanSwarm — Ali" in the message)

Send your receipt to this email and I'll have you fully activated within the hour.

Derek Francisco
Francisco Holdings Inc.

---

### B) Andrew — cold-to-warm intro
**Subject:** Built something for cleaning businesses like yours — 14 days free

Hi Andrew,

Derek Francisco here — I build automation tools for service businesses, and I just finished one specifically for cleaning operations: **CleanSwarm**.

It handles scheduling, dispatch, and client follow-up automatically — the admin work that quietly eats hours every week.

I'd rather you try it than take my word for it: 14 days, completely free, no card needed.
👉 [TRIAL_SIGNUP_LINK]

Got 15 minutes this week for a quick walkthrough? I can show you exactly how it'd slot into your current workflow.

Derek
705-307-XXXX *(confirm before sending — see note at bottom)*

---

### C) Matt — ready-to-buy / fast close
**Subject:** Let's get you live on CleanSwarm today

Hi Matt,

Following up — want to get you set up on CleanSwarm today so you can start saving hours this week.

Two ways to go:
1. **Free trial first (14 days, no card):** 👉 [TRIAL_SIGNUP_LINK]
2. **Skip the trial, start now:** [PRICE]/mo — pay via:
   💳 PayPal: https://www.paypal.me/derekfrancisco/[AMOUNT]cad
   🏦 Interac: franciscoderek7@gmail.com ("CleanSwarm — Matt" in the message)

Either way, reply or send your receipt and I'll have your account live within the hour.

Derek Francisco

---

## 3. PAYMENT LINKS — READY TO SEND

| Plan | Amount | PayPal.me Link | Interac |
|---|---|---|---|
| Starter | $[X]/mo | https://www.paypal.me/derekfrancisco/[X]cad | franciscoderek7@gmail.com |
| Growth | $[Y]/mo | https://www.paypal.me/derekfrancisco/[Y]cad | franciscoderek7@gmail.com |
| Pro | $[Z]/mo | https://www.paypal.me/derekfrancisco/[Z]cad | franciscoderek7@gmail.com |

*(Fill in [X]/[Y]/[Z] from `cleanswarm-checkout/pricing.html` — I left them as placeholders since I want to confirm I'm quoting the same numbers that are live on the page before texting them to prospects.)*

**Manual activation reminder:** since there's no Stripe webhook wired up yet, when a payment lands you'll need to manually email the customer their access link/credentials. Keep a simple log (spreadsheet: name, email, plan, amount, date paid, activated Y/N) so nobody falls through the cracks.

---

## 4. NOTES

- **Phone number placeholder (`705-307-XXXX`) in template B:** I didn't fill in the full number because CLAUDE.md flags `705-307-8080` as personal contact info that shouldn't be broadcast publicly — but a 1:1 sales email to a named warm lead is a different context than a public webpage. Your call on whether to include it; I left it blank rather than assume.
- **Trial signup link:** point this at whatever live CleanSwarm page actually has the sign-up form (`cleanswarm-checkout/index.html` in the source repo) — I don't have a live CleanSwarm deploy target to push to, so I can't confirm the exact public URL.
