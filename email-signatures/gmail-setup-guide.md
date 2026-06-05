# Gmail Integration Setup Guide
# Francisco Holdings Inc. — All Business Accounts
# Last Updated: June 5, 2026

---

## OVERVIEW

This guide covers:
1. Adding email signatures (9 businesses)
2. Email templates (canned responses) for common inquiries
3. Auto-labeling rules by business
4. Signature auto-selection
5. Vacation responder templates

---

## PART 1: ADD EMAIL SIGNATURES

### Step-by-Step:
1. Open Gmail (docweedlaw@gmail.com)
2. Click ⚙️ Settings (top right) → **See All Settings**
3. Go to **General** tab → scroll to **Signature** section
4. Click **"Create New"** → name it (e.g., "CCLDR — Doc WeedLaw")
5. Open `email-signatures/signatures.html` in browser
6. Click **"Copy HTML"** button for that signature
7. In Gmail signature editor: click the **<>** (HTML source) button
8. Paste the HTML code → Click OK
9. Set as default for new emails from docweedlaw@gmail.com
10. Repeat for each business

### Which Signature for Which Email Context:
| When sending from/about | Use Signature |
|------------------------|---------------|
| CCLDR / cannabis defense | CCLDR — Doc WeedLaw |
| CCC consulting inquiries | CCC — Canadian Cannabis Consulting |
| OmniaGuard security | OmniaGuard |
| CleanSwarm workforce | CleanSwarm |
| TechPetCage products | TechPetCage |
| SoulStack marketing | SoulStack.ai |
| ZPrimeDoxAI tech | ZPrimeDoxAI |
| Investor/corporate | Francisco Holdings Inc. |
| Weddings/ceremonies | Cannabis Church |

---

## PART 2: EMAIL TEMPLATES (CANNED RESPONSES)

### Enable Canned Responses:
1. Settings → **Advanced** tab → **Templates** → Enable → Save Changes
2. Compose a new email → write the template → click the 3-dot menu (⋮) in compose → **Templates** → **Save draft as template** → **Save as new template**

### Templates to Create:

---

### TEMPLATE 1: New Client Inquiry — General
**Template Name:** "CCC — New Client Welcome"
**Subject:** Re: Your Inquiry to Canadian Cannabis Consulting

```
Thank you for reaching out to Canadian Cannabis Consulting.

I'm Derek Francisco (Doc WeedLaw), founder and principal consultant. I've been working in cannabis law, compliance, and consulting since 2004 — through every regulatory era from MMAR to the Cannabis Act.

To best assist you, I'd love to know a bit more about what you're looking to accomplish:
- Are you looking to start or grow a cannabis business?
- Do you need help with ACMPR/medical access?
- Are you facing a legal challenge?
- Are you interested in our AI consulting tools (ZPrimeDoxAI)?

I'm available for a free 30-minute consultation — phone, video, or in-person (Lindsay, ON). Reply to this email or call 705-307-8080 to schedule.

Looking forward to working with you.
```

---

### TEMPLATE 2: Pricing Request
**Template Name:** "Pricing — Standard Response"
**Subject:** Re: Pricing Information

```
Thank you for your interest in [BUSINESS NAME].

Our current pricing is available at [URL]/pricing.html — you'll find full details on all tiers and packages there.

For a personalized recommendation based on your specific situation, I'm happy to jump on a quick call. We frequently find that clients need a different tier than they initially expected — sometimes less, sometimes more.

Free 30-minute consultation: Reply here or call 705-307-8080.
```

---

### TEMPLATE 3: Legal Defense Intake — CCLDR
**Template Name:** "CCLDR — Legal Intake"
**Subject:** Re: Legal Defense Inquiry — CCLDR.NET

```
Thank you for contacting CCLDR.NET.

Before we proceed, I want to be clear: CCLDR provides educational frameworks and self-represented litigation support — not legal representation. For formal legal representation, please consult a licensed lawyer.

That said, I've spent 20+ years as a self-represented litigant in cannabis cases, and I can help you understand your rights and options.

Please provide:
1. Brief description of your situation (1-2 sentences)
2. The court / jurisdiction you're dealing with
3. Any upcoming dates or deadlines
4. What specific help you're looking for

If you're in immediate legal jeopardy (arrest, imminent court date), please call 705-307-8080 directly.

[CCLDR Signature]
```

---

### TEMPLATE 4: OmniaGuard Product Support
**Template Name:** "OmniaGuard — Support Response"
**Subject:** Re: OmniaGuard Support Request

```
Thank you for contacting OmniaGuard support.

To help you most efficiently, please provide:
1. Your account tier (Sentinel/Guardian/Warden/Protector)
2. Brief description of the issue
3. Any error messages or screenshots
4. Your deployment environment (cloud provider, AI stack)

Our response SLA:
- Sentinel: 48 business hours
- Guardian: 24 business hours  
- Warden: 4 business hours
- Protector: 1 hour (24/7)

[OmniaGuard Signature]
```

---

### TEMPLATE 5: Partnership / Investment Inquiry
**Template Name:** "FHI — Partnership Inquiry"
**Subject:** Re: Partnership / Investment Inquiry — Francisco Holdings Inc.

```
Thank you for your interest in Francisco Holdings Inc.

We are actively building a 45-company empire across AI security, cannabis consulting, workforce automation, legal defense education, and adjacent verticals. We are open to strategic partnerships and equity arrangements on selective opportunities.

To evaluate fit, please share:
1. Your name, company, and role
2. What type of partnership you're envisioning
3. Your investment range or resource commitment
4. Timeline expectations

I'll review personally and respond within 48 hours.

Derek Francisco
CEO, Francisco Holdings Inc.
```

---

### TEMPLATE 6: Media / Interview Request
**Template Name:** "Media — Interview Response"
**Subject:** Re: Media/Interview Request

```
Thank you for your interest in speaking with Derek Francisco / Doc WeedLaw.

I'm available for interviews, podcasts, and media appearances covering:
- Cannabis law and constitutional rights in Canada
- The CCLDR Virtual Courthouse and Francisco Protocol
- AI-powered legal defense tools
- Building a 45-company empire on a bootstrap budget
- The future of cannabis regulation in Canada

Please share:
1. Publication/platform name and audience size
2. Proposed topic/angle
3. Preferred format (written, podcast, video)
4. Proposed date/time

I'm in Lindsay, Ontario and available for video calls at most times.

[Relevant signature]
```

---

## PART 3: AUTO-LABELING RULES

### Set Up Labels First:
1. Gmail sidebar → **Create new label** → Create these labels:
   - `Empire/CCLDR`
   - `Empire/OmniaGuard`
   - `Empire/CleanSwarm`
   - `Empire/CCC`
   - `Empire/Legal`
   - `Empire/Investment`
   - `Empire/ZPrimeDoxAI`

### Create Filters:
1. Settings → **Filters and Blocked Addresses** → **Create a new filter**

| From/To/Subject Contains | Label |
|-------------------------|-------|
| docweedlaw@gmail.com received | `Empire/CCLDR` |
| Subject: OmniaGuard OR omniaguard.com | `Empire/OmniaGuard` |
| Subject: CleanSwarm OR cleanswarm | `Empire/CleanSwarm` |
| Subject: CCC OR cannabis consulting | `Empire/CCC` |
| Subject: legal defense OR charter OR court | `Empire/Legal` |
| Subject: investment OR partnership OR equity | `Empire/Investment` |
| Subject: ZPrimeDox OR primedox | `Empire/ZPrimeDoxAI` |

---

## PART 4: OUT-OF-OFFICE TEMPLATES

### Vacation Responder:
1. Settings → **General** → **Vacation responder**
2. Turn on → set dates → paste template:

```
Thank you for your email. I'm currently unavailable and will respond within [X] business days.

For urgent matters:
📞 705-307-8080 (text "URGENT" for same-day response)

My businesses:
🛡️ OmniaGuard — omniaguard.com
⚖️ CCLDR.NET — ccldr.net  
🍁 Canadian Cannabis Consulting — ccc.net
🧹 CleanSwarm — cleanswarm.ca

— Derek Francisco / Doc WeedLaw
CEO, Francisco Holdings Inc.
```

---

## PART 5: SEND MAIL AS (Multiple Business Emails)

To send from business email addresses without separate accounts:
1. Settings → **Accounts and Import** → **Send mail as** → **Add another email address**
2. Add each business email:
   - info@ccldr.net
   - info@ccc.net
   - info@cleanswarm.ca
   - info@omniaguard.com (if configured)
3. Verify each email
4. Each "From" address can have its own signature

---

*Guide maintained by ZPrimeDoxAI builder (Claude). Update when business email addresses are confirmed.*
