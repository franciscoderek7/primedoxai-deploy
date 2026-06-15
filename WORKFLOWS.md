# Francisco Empire — Customer Delivery Workflows
## When a Customer Pays — What Happens Next

---

## OmniaGuard WORKFLOWS

### Starter ($99/yr) — VPN + Password Manager
**Customer pays via PayPal → You get email → Do this:**

1. Log into VPN reseller dashboard (sign up at NordLayer.com/reseller OR Tailscale.com)
2. Create new user account with customer's email
3. Set plan: Business Basic (costs you ~$5-10/mo)
4. Copy credentials
5. Open email template (see below), fill in customer name + credentials
6. Send within 2 hours of payment
7. Log order in spreadsheet (Date, Name, Email, Plan, Amount, Delivered Y/N)

**VPN Reseller Options (Derek must sign up):**
- NordLayer: nordlayer.com/reseller — best for branded experience
- Tailscale: tailscale.com/kb/1352/resellers — easiest technical setup
- Perimeter81: perimeter81.com/partners — enterprise-grade

**Email Template — Starter Delivery:**
```
Subject: Your OmniaGuard Starter — VPN + Password Manager Active

Hi [NAME],

Your OmniaGuard Starter is now active. Here's how to get started:

VPN ACCESS:
Service: OmniaGuard Shield (powered by [reseller])
Email: [their email]
Temporary password: [TEMP_PASS]
→ Download app: [reseller app link]
→ Force-change password on first login

PASSWORD MANAGER:
[Send Bitwarden/NordPass invite link]

Need help? Reply to this email or contact omniaguard1@gmail.com

— OmniaGuard Security Team
```

**Time per delivery: ~15 minutes**

---

### Professional ($499/yr) — Starter + Security Audit
**Same as Starter PLUS:**

1. Ask customer for website URL (send "welcome" email with form link → free-scan.html)
2. Run scan tools (free, no signup needed):
   - SSL: https://www.ssllabs.com/ssltest/
   - Headers: https://securityheaders.com
   - Exposed files: https://pentest-tools.com/website-vulnerability-scanner/website-scanner
   - Tech fingerprint: https://builtwith.com + https://whatcms.org
3. Screenshot all findings
4. Open report template (create in Google Docs or Canva)
5. Fill in: Client name, URL, findings, risk score (A-F), action items
6. Export as PDF with OmniaGuard branding
7. Email PDF + "Monthly Security Newsletter" (can be simple email update)
8. Schedule: Repeat audit in 3 months

**PDF Report Template (create once, reuse):**
- Cover: OmniaGuard logo, client name, date, "CONFIDENTIAL SECURITY REPORT"
- Page 2: Executive summary, overall score
- Pages 3-5: Each finding (SSL, headers, exposed files, software)
- Page 6: Priority action plan (Critical/High/Medium/Low)
- Page 7: Remediation services offer (link to pricing.html)

**Time per delivery: ~3-4 hours (first time), ~1 hour (subsequent)**

---

### Enterprise ($2,499/yr) — Full Package + 2 Consulting Calls
**Same as Professional PLUS:**

1. Send Calendly booking link (sign up at calendly.com — free plan works)
2. Create event: "OmniaGuard Security Strategy Call — 60 min"
3. Set: Zoom link, PayPal payment required before booking (Calendly + PayPal integration)
4. Customer books → Zoom link auto-generated
5. YOU SHOW UP. Talk for 60 min. Cover their specific security concerns.
6. Send follow-up email within 24 hrs: Summary of call, action items, next steps
7. Quarterly audits: Same as Professional, 4x per year

**Consulting Call Structure:**
- 0-10 min: Review their current setup, their goals
- 10-30 min: Review their scan report findings in detail
- 30-50 min: Tailored recommendations for their business
- 50-60 min: Next steps, Q&A, optional upsell discussion

**Time per call: 1 hour + 30 min prep + 30 min follow-up**

---

### Security Remediation ($1,500 flat — from free-scan.html upsell)

1. Customer emails omniaguard1@gmail.com requesting remediation
2. Send PayPal.Me link: paypal.me/derekfrancisco/1500
3. After payment confirmed:
   - Request FTP/SSH access OR WordPress admin access
   - Fix critical + high findings from their scan report
   - Test fixes, run second scan to confirm clean
4. Deliver clean PDF report showing "before/after" results
5. Send 30-day warranty note: "Contact us if any issue recurs"

**Common fixes (quick wins):**
- Add security headers: 5 lines of Apache/nginx config, ~30 min
- SSL renewal: Via hosting panel, ~15 min
- Remove exposed files: Delete or password-protect, ~30 min
- Update CMS/plugins: Via WP dashboard, ~1 hour

**Time per delivery: 4-8 hours depending on findings**

---

## BENO-X / CCLDR STRATEGY SESSION ($500)

1. Customer books via email (until Calendly set up): franciscoderek7@gmail.com
2. Send PayPal.Me link: paypal.me/derekfrancisco/500
3. Confirm payment → send Zoom link manually (or Google Meet)
4. 60-min constitutional education session on their specific situation
5. Follow-up: Send educational resources (links to CCLDR content)
6. Optional: Offer ongoing CCLDR membership

**Note: Derek is a LEGAL EDUCATOR, NOT A LAWYER. Sessions are educational only.**

---

## TECHPETCAGE — PRODUCT DELIVERY

### Option A: Dropshipping (Derek must set up AliExpress supplier)
1. Customer orders on site
2. You forward order to AliExpress supplier with customer shipping address
3. Supplier ships direct (10-20 days from China)
4. Track order, handle any customer issues
5. Profit = your price minus supplier cost

**Suggested markup: 3-4x supplier cost**

### Option B: Amazon Affiliate (no inventory, instant setup)
1. Sign up at affiliate-program.amazon.com
2. Get affiliate links for popular pet products
3. Add to TechPetCage product pages
4. Customer clicks → goes to Amazon → buys
5. You earn 4-8% commission automatically

**Derek must do:** Sign up for Amazon Associates account

---

## STRIPE SWAP PROCEDURE (When Account Unlocked)

When Stripe support unlocks acct_1TG0cIASsTLqnu8V:

1. Log into dashboard.stripe.com
2. Create Payment Links (buy.stripe.com) for each product
3. Open `/home/user/primedoxai-deploy/stripe-config.js`
4. Set `STRIPE_LIVE: true`
5. Replace each `PLACEHOLDER_[SERVICE]_[PLAN]` with actual `buy.stripe.com/...` URL
6. Push to main branch
7. All sites update automatically within 2 minutes

**Estimated swap time: 10-15 minutes**

---

## TOOLS DEREK NEEDS TO SET UP

| Tool | Purpose | Cost | Signup URL |
|------|---------|------|-----------|
| NordLayer Reseller | VPN white-label | $5-10/user/mo | nordlayer.com/reseller |
| Calendly | Booking calls | Free plan works | calendly.com |
| Canva Pro | PDF report templates | $17/mo | canva.com |
| Google Sheets | Order tracking | Free | sheets.google.com |
| Amazon Associates | TechPetCage affiliate | Free | affiliate-program.amazon.com |
| AliExpress Dropship | TechPetCage products | Free | aliexpress.com |

---

## DAILY OPERATIONS CHECKLIST

Every morning:
- [ ] Check omniaguard1@gmail.com for new orders/scan requests
- [ ] Check franciscoderek7@gmail.com for PayPal payment notifications
- [ ] Deliver any pending orders (VPN credentials, audit reports)
- [ ] Check zprimedoxaihq.com Stripe status
- [ ] Update CCLDR case tracking if any court developments

Every week:
- [ ] Review analytics (Google Analytics if set up)
- [ ] Update empire status in EMPIRE.md
- [ ] Post case updates to ccldr.net/cases.html

---

*Last updated: June 14, 2026 | Francisco Holdings Inc. — Internal Operations Manual*
