# Manus Build Prep — Owned Domains Sprint (2026-06-19)

Prep work for the 9-site Manus build queue. Items I can't execute directly (no repo-creation permission on my GitHub token, no Stripe/Make.com API access) are marked **DEREK TO DO** with exact steps. Everything else is ready to copy/paste.

---

## 1. REPOS TO CREATE — BLOCKED, DEREK TO DO

Tried `create_repository` via my GitHub tools — got `403: Resource not accessible by integration`. My token can't create repos. You'll need to do these 9 manually (same steps you already listed):

`github.com/new` → Name (below) → Public → Add README → Create → Settings → Pages → Source: `main` / root

- [ ] `franciscoderek7/omniaguard-ca`
- [ ] `franciscoderek7/omniaguard-io`
- [ ] `franciscoderek7/omniaguard-pro`
- [ ] `franciscoderek7/omniaguard-tech`
- [ ] `franciscoderek7/franciscoholdingsinc-ca`
- [ ] `franciscoderek7/franciscoholdingsinc-buzz`
- [ ] `franciscoderek7/vaultvelocityauto`
- [ ] `franciscoderek7/techpetcage`
- [ ] `franciscoderek7/techpetcage-ca`

---

## 2. STRIPE PRODUCTS — DEREK TO DO (no Stripe API access on my side)

`dashboard.stripe.com` → Products → Add product → Name/Price/Recurring/CAD → Save → Payment Links → Create → copy URL into the site code.

| Product | Price | Currency |
|---------|-------|----------|
| OmniGuard CA Starter | 99/mo | CAD |
| OmniGuard CA Pro | 299/mo | CAD |
| OmniGuard CA Sentinel | 499/mo | CAD |
| Vault Velocity Starter | 99/mo | CAD |
| Vault Velocity Pro | 499/mo | CAD |
| Vault Velocity Empire | 2499/mo | CAD |
| TechPetCage Family | 29/mo | CAD |
| TechPetCage Pro | 49/mo | CAD |
| TechPetCage Kennel | 199/mo | CAD |

---

## 3. DNS RECORDS — ready to copy/paste into Porkbun

Same template for every domain below — only the `CNAME www` target changes:

```
A     @     185.199.108.153
A     @     185.199.109.153
A     @     185.199.110.153
A     @     185.199.111.153
CNAME www   [domain]
```

Apply to: `omniaguard.ca`, `omniaguard.io`, `omniaguard.pro`, `omniaguard.tech`, `franciscoholdingsinc.ca`, `franciscoholdingsinc.buzz`, `vaultvelocityauto.com`, `techpetcage.com`, `techpetcage.ca`.

Cloud setting: grey cloud (DNS only, no proxy). SSL: Full. Always Use HTTPS: ON.

---

## 4. DEPLOYMENT CHECKLIST — per site, run this 9 times

| # | Step | Done |
|---|------|------|
| 1 | Download zip from Manus | ☐ |
| 2 | Extract files | ☐ |
| 3 | Push to repo feature branch | ☐ |
| 4 | Merge to main | ☐ |
| 5 | Verify GitHub Pages deployed | ☐ |
| 6 | Set DNS A records (§3 above) | ☐ |
| 7 | Set CNAME www | ☐ |
| 8 | Test `https://[domain]` | ☐ |
| 9 | Test Stripe checkout | ☐ |
| 10 | Test 24-hour trial lock/unlock | ☐ |

---

## 5. MAKE.COM AUTOMATION TEMPLATES — spec ready, Derek wires up in Make.com (no API access on my side)

| Trigger | Action |
|---------|--------|
| Lead capture form submit | → Supabase CRM insert |
| Stripe purchase webhook | → Welcome email send |
| Trial at hour 20 | → Upgrade-reminder email/in-app notice |
| Trial expired (hour 24, no upgrade) | → Re-engagement email sequence (day 1, day 3, day 7) |

---

## 6. MONITORING MANUS'S BUILD — limitation

I have no direct visibility into Manus (separate app, Derek drives it manually) — I can't watch its build process in real time. What I *can* do: review any zip/file/screenshot you share here for build errors, missing files, wrong colors (must be blue `#4A90E2`/pink `#E91E63` for OmniGuard, Crown Green/Gold/Platinum for Francisco Holdings variants), broken links, or pricing mismatches against what's locked in `MASTER_PROMPT_MANUS_KEEP_BUILDING.md` — just paste/upload it and I'll flag anything wrong immediately.
