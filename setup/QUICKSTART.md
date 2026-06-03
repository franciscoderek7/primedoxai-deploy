# Empire Deployment — Quickstart

## One-time setup (5 min)

### 1. Install dependency
```bash
pip install requests
```

### 2. Generate GitHub Personal Access Token
Go to: https://github.com/settings/tokens/new
- Name: `empire-deploy`
- Expiration: 90 days
- Scopes: ✓ **repo** (this covers pages too)
- Click **Generate token** — copy it immediately

### 3. Get Porkbun keys
Go to: https://porkbun.com/account/api
- Make sure API access is enabled for each domain
  (Domain Management → Details → API Access → ON)

### 4. Set environment variables
```bash
export GITHUB_TOKEN='ghp_yourTokenHere'
export PORKBUN_API_KEY='pk1_yourKeyHere'
export PORKBUN_SECRET_KEY='sk1_yourSecretHere'
```

---

## Deploy everything (repos + files + Pages + DNS)
```bash
cd /path/to/primedoxai-deploy
python3 setup/deploy_all.py
```
This creates all repos, pushes all HTML, enables GitHub Pages, sets DNS. ~5 min.

---

## DNS only (repos already exist)
```bash
python3 setup/dns_only.py
```

Single domain:
```bash
python3 setup/dns_only.py cleanswarm.com
```

---

## Enable Pages only (files already pushed)
```bash
python3 setup/enable_pages.py
```

---

## After running

| What | When |
|------|------|
| DNS propagates | 5–30 min |
| GitHub Pages builds | 1–3 min after push |
| HTTPS available | After DNS propagates |
| Enable HTTPS | Go to each repo → Settings → Pages → **Enforce HTTPS** |

---

## Domain → Repo mapping

| Domain | Repo | Source dir |
|--------|------|-----------|
| cleanswarm.com | franciscoderek7/cleanswarm | cleantech-automation-site/ |
| primedox.ai | franciscoderek7/primedox-ai | primedoxai-site/ |
| omniaguard.com | franciscoderek7/omniaguard | omniaguard-site/ |
| ccldr.net | franciscoderek7/ccldr-net | ccldr-site/ |
| franciscoholdingsinc.com | franciscoderek7/franciscoholdingsinc | francisco-holdings-site/ |
| techpetcage.com | franciscoderek7/techpetcage | tech-pet-cage-site/ |

---

## Verify DNS is working
```bash
# Check A records
dig cleanswarm.com A +short
dig primedox.ai A +short

# Should return:
# 185.199.108.153
# 185.199.109.153
# 185.199.110.153
# 185.199.111.153
```

Online checker: https://dnschecker.org
