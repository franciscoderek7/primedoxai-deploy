# DNS SETUP GUIDE — FRANCISCO HOLDINGS EMPIRE
# All domains on Porkbun | Account: franciscoderek7@gmail.com
# GitHub Pages target: franciscoderek7.github.io
# Last updated: 2026-06-03

---

## GITHUB PAGES A RECORDS (add to EVERY domain)

In Porkbun: Domain → DNS → Add Record (type: A)

| Host | Answer | TTL |
|---|---|---|
| (blank/@ = apex) | 185.199.108.153 | 600 |
| (blank/@ = apex) | 185.199.109.153 | 600 |
| (blank/@ = apex) | 185.199.110.153 | 600 |
| (blank/@ = apex) | 185.199.111.153 | 600 |
| www | franciscoderek7.github.io | 600 |

---

## DOMAIN → SITE MAPPING

### franciscoholdingsinc.com (CROWN JEWEL — DO FIRST)

**Porkbun DNS:**
- A records: 4x GitHub IPs above
- CNAME www → franciscoderek7.github.io

**GitHub Pages (primedoxai-deploy repo settings):**
- Settings → Pages → Custom domain: franciscoholdingsinc.com
- Enforce HTTPS: ✅ ON
- Note: This sets the WHOLE repo's custom domain

**Wait:** 24–48 hours for DNS propagation (usually faster on Porkbun)

---

### omniaguard.com (HIGHEST REVENUE — DO SECOND)

The omniaguard.com site lives in a SEPARATE REPO: franciscoderek7/omniaguard

**Porkbun DNS:**
- A records: 4x GitHub IPs above
- CNAME www → franciscoderek7.github.io

**GitHub Pages (omniaguard repo settings):**
- Settings → Pages → Custom domain: omniaguard.com
- Enforce HTTPS: ✅ ON

**CRITICAL FIX STILL NEEDED:**
The live omniaguard.com site has spelling errors. Fixed version is at:
`/omniaguard-site/omniaguard-live-hotfix.html` in THIS repo.
Copy its contents to: github.com/franciscoderek7/omniaguard/edit/main/index.html

---

### omniaguard.io / omniaguard.pro / omniaguard.tech

Set up as permanent redirects to omniaguard.com:

**Option A (Porkbun URL redirect):**
- In Porkbun: Domain → URL Forward
- Forward to: https://omniaguard.com
- Type: Permanent (301)
- Include path: YES

**Option B (GitHub Pages redirect):**
Create `index.html` that does meta refresh:
```html
<meta http-equiv="refresh" content="0; url=https://omniaguard.com">
```

---

### ccldr.net (ICANN lock = transfer blocked, DNS works NOW)

The domain is in 60-day ICANN lock (can't transfer registrar).
DNS STILL WORKS — go live immediately.

**Porkbun DNS for ccldr.net:**
- A records: 4x GitHub IPs above
- CNAME www → franciscoderek7.github.io

**GitHub Pages:**
- Create repo: franciscoderek7/ccldr OR use subdirectory in primedoxai-deploy
- Custom domain: ccldr.net

---

### franciscoholdingsinc.ca

Redirect to franciscoholdingsinc.com:
- Porkbun URL Forward → https://franciscoholdingsinc.com (permanent 301)

---

## STEP-BY-STEP: SETTING UP franciscoholdingsinc.com RIGHT NOW

1. **Porkbun Dashboard** → franciscoholdingsinc.com → DNS
2. Delete any existing A records / CNAME for @ and www
3. Add 4 A records (@ → each GitHub IP)
4. Add CNAME: www → franciscoderek7.github.io
5. Save

6. **GitHub** → franciscoderek7/primedoxai-deploy → Settings → Pages
7. Under "Custom domain": type `franciscoholdingsinc.com`
8. Click Save — GitHub creates a CNAME file in repo automatically
9. Check "Enforce HTTPS" (may take a few minutes after DNS propagates)

10. Test: https://franciscoholdingsinc.com (live in 15 min – 48 hours)

---

## CURRENT GITHUB PAGES STATUS

The primedoxai-deploy repo is deployed at:
`franciscoderek7.github.io/primedoxai-deploy/`

Sites accessible NOW (no custom domain needed):
- `.../francisco-holdings-site/` → Francisco Holdings Inc.
- `.../omniaguard-site/` → OmniaGuard
- `.../omniaguard-site/app/` → OmniaGuard PWA
- `.../ccldr-site/` → CCLDR
- `.../cleantech-automation-site/` → CleanSwarm
- `.../telus-kudos-pitch/` → Telus pitch deck

---

## DNS PROPAGATION CHECK

Test after setting DNS:
```
# On any device:
nslookup franciscoholdingsinc.com
# Should return 185.199.108.153 (or any of the 4 IPs)
```

Or use: https://dnschecker.org — type your domain, check A record

---

*Francisco Holdings Inc. | Tech Pet Cage | Derek Francisco*
*705-307-8080 | franciscoderek7@gmail.com*
