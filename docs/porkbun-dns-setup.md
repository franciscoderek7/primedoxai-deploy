# Porkbun DNS Setup — GitHub Pages Custom Domains
# Francisco Holdings Inc. — All Registered Domains
# Last updated: 2026-06-07

---

## Overview

GitHub Pages serves each site from `franciscoderek7/<repo>.github.io`. To point your Porkbun domains there you need:
1. A CNAME record (for `www`) pointing to the GitHub Pages domain
2. Four A records (for `@` / apex) pointing to GitHub's IP addresses
3. Enable "Enforce HTTPS" in the GitHub repo Settings → Pages after DNS propagates

GitHub Pages apex IPs (never change):
```
185.199.108.153
185.199.109.153
185.199.110.153
185.199.111.153
```

---

## Step-by-Step: Porkbun DNS Editor

1. Log in at **porkbun.com**
2. Click **Account → Domain Management**
3. Click the domain → **DNS** (not just the row — click the DNS button)
4. Delete any existing A or CNAME records pointing to parking pages
5. Add the records below for each domain
6. DNS propagation: 5 min – 48 hrs (usually <30 min for Porkbun)

---

## Per-Domain Records

### `omniaguard.com` → franciscoderek7/omniaguard

| Type | Host | Answer | TTL |
|------|------|--------|-----|
| A | @ | 185.199.108.153 | 600 |
| A | @ | 185.199.109.153 | 600 |
| A | @ | 185.199.110.153 | 600 |
| A | @ | 185.199.111.153 | 600 |
| CNAME | www | franciscoderek7.github.io | 600 |

GitHub repo settings: **Settings → Pages → Custom domain → `omniaguard.com`**

---

### `franciscoholdingsinc.com` → franciscoderek7/francisco-holdings

| Type | Host | Answer | TTL |
|------|------|--------|-----|
| A | @ | 185.199.108.153 | 600 |
| A | @ | 185.199.109.153 | 600 |
| A | @ | 185.199.110.153 | 600 |
| A | @ | 185.199.111.153 | 600 |
| CNAME | www | franciscoderek7.github.io | 600 |

GitHub repo: **Settings → Pages → Custom domain → `franciscoholdingsinc.com`**

---

### `zprimedoxaihq.com` → franciscoderek7/zprimedoxaihq

| Type | Host | Answer | TTL |
|------|------|--------|-----|
| A | @ | 185.199.108.153 | 600 |
| A | @ | 185.199.109.153 | 600 |
| A | @ | 185.199.110.153 | 600 |
| A | @ | 185.199.111.153 | 600 |
| CNAME | www | franciscoderek7.github.io | 600 |

GitHub repo: **Settings → Pages → Custom domain → `zprimedoxaihq.com`**
> Note: Consider setting the GitHub repo to **Private** (still serves Pages) to prevent public source viewing.

---

### `omniaguard.ca` → franciscoderek7/omniaguard (same repo, redirect)

Option A — 301 redirect from .ca → .com via Porkbun URL forwarding:
- Porkbun → Domain → URL Forwarding
- Source: `omniaguard.ca` → Destination: `https://omniaguard.com` → Type: 301 Permanent

Option B — Same GitHub Pages content (duplicate CNAME entry in repo):
- Not recommended; GitHub Pages only serves one custom domain per repo

**Recommended: Option A (301 redirect)**

---

### `omniaguard.io` / `omniaguard.pro` / `omniaguard.tech`

Same as `.ca` — set up 301 URL forwards in Porkbun to `https://omniaguard.com`.

---

### `vaultvelocityauto.com`

Pending scope from PrimeDox. Set an A record + CNAME now so DNS is ready:

| Type | Host | Answer | TTL |
|------|------|--------|-----|
| A | @ | 185.199.108.153 | 600 |
| CNAME | www | franciscoderek7.github.io | 600 |

GitHub repo needed: `franciscoderek7/vaultvelocityauto` (create when ready)

---

### `franciscoholdingsinc.ca`

301 URL forward → `https://franciscoholdingsinc.com` in Porkbun.

---

## GitHub Repository Checklist

You need these repos to exist with GitHub Pages enabled. Create any that are missing:

| Repo | Domain | Pages Branch | Status |
|------|--------|-------------|--------|
| `franciscoderek7/omniaguard` | omniaguard.com | main | ✅ EXISTS |
| `franciscoderek7/ccldr` | ccldr.net | main | ⬜ CREATE IF MISSING |
| `franciscoderek7/primedox` | primedoxai.com | main | ⬜ CREATE IF MISSING |
| `franciscoderek7/cleanswarm` | cleanswarm.ca | main | ⬜ CREATE IF MISSING |
| `franciscoderek7/francisco-holdings` | franciscoholdingsinc.com | main | ⬜ CREATE IF MISSING |
| `franciscoderek7/zprimedoxaihq` | zprimedoxaihq.com | main | ⬜ CREATE IF MISSING |
| `franciscoderek7/vaultvelocityauto` | vaultvelocityauto.com | main | ⬜ CREATE WHEN READY |

### To create a new repo with GitHub Pages:
1. github.com → New repository → Name: `<repo-name>` → Public → Initialize with README
2. Settings → Pages → Source: Deploy from branch → Branch: `main` → `/root` → Save
3. Wait for first Pages build (green checkmark in Actions)
4. Settings → Pages → Custom domain → enter your domain → Save
5. Check "Enforce HTTPS" (appears after DNS propagates)

---

## CNAME File

Each deploy workflow already writes the correct CNAME file to the repo root. Do NOT manually add a custom domain in GitHub Settings before the first deploy — let the workflow write CNAME and then set the custom domain in Settings, or they'll conflict.

**Correct order:**
1. Merge feature branch → main (triggers deploy workflow)
2. Workflow runs → pushes files + CNAME to target repo
3. GitHub detects CNAME → GitHub Pages starts serving on custom domain
4. Set DNS records in Porkbun (as above)
5. Once DNS propagates → "Enforce HTTPS" appears → click it

---

## Verification

After DNS propagates, run these checks:

```bash
# Check DNS resolution
dig +short omniaguard.com
# Expected: 185.199.108.153 (one of the four IPs)

dig +short www.omniaguard.com CNAME
# Expected: franciscoderek7.github.io

# Or use online: https://dnschecker.org/#A/omniaguard.com
```

Pages should be live within 5–10 minutes of DNS propagation.

---

*Last updated: 2026-06-07 | Authority: PrimeDox*
