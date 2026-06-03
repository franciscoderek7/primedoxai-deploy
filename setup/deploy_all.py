#!/usr/bin/env python3
"""
Francisco Holdings Empire — Full Deployment Script
===================================================
Creates GitHub repos, pushes all site files, enables GitHub Pages,
and sets Porkbun DNS records for every domain. Run once — done.

Run from the primedoxai-deploy/ root directory:

    cd /path/to/primedoxai-deploy
    export GITHUB_TOKEN='ghp_yourTokenHere'
    export PORKBUN_API_KEY='pk1_yourKeyHere'
    export PORKBUN_SECRET_KEY='sk1_yourSecretHere'
    python3 setup/deploy_all.py

Requirements: pip install requests

GitHub token scopes needed: repo, pages (both covered by 'repo' scope)
Generate at: https://github.com/settings/tokens/new
"""

import os
import sys
import time
import base64
import requests
from pathlib import Path

# ── Credentials (never hardcoded) ───────────────────────────────────────────
GITHUB_TOKEN       = os.environ.get("GITHUB_TOKEN")
PORKBUN_API_KEY    = os.environ.get("PORKBUN_API_KEY")
PORKBUN_SECRET_KEY = os.environ.get("PORKBUN_SECRET_KEY")

GITHUB_USER = "franciscoderek7"
REPO_ROOT   = Path(__file__).parent.parent  # primedoxai-deploy root

GITHUB_PAGES_IPS = [
    "185.199.108.153",
    "185.199.109.153",
    "185.199.110.153",
    "185.199.111.153",
]

# ── Site manifest ────────────────────────────────────────────────────────────
# priority=1 deploys first; existing=True skips repo creation
SITES = [
    {
        "domain":      "cleanswarm.com",
        "repo":        "cleanswarm",
        "dir":         "cleantech-automation-site",
        "description": "CleanSwarm AI — Autonomous Cleantech Intelligence Platform",
        "priority":    1,
        "existing":    False,
    },
    {
        "domain":      "primedox.ai",
        "repo":        "primedox-ai",
        "dir":         "primedoxai-site",
        "description": "PrimeDox AI — Document Intelligence Platform",
        "priority":    1,
        "existing":    False,
    },
    {
        "domain":      "omniaguard.com",
        "repo":        "omniaguard",
        "dir":         "omniaguard-site",
        "description": "OmniaGuard — Enterprise AI Security Platform",
        "priority":    2,
        "existing":    True,  # repo already exists at franciscoderek7/omniaguard
        "skip_files":  [      # old versioned files — don't push these
            "omniaguard-live-hotfix.html",
            "omniaguard-v2.html",
            "omniaguard-v3.html",
        ],
    },
    {
        "domain":      "ccldr.net",
        "repo":        "ccldr-net",
        "dir":         "ccldr-site",
        "description": "CCLDR.NET — Canadian Cannabis Legal Defense Resources",
        "priority":    2,
        "existing":    False,
    },
    {
        "domain":      "franciscoholdingsinc.com",
        "repo":        "franciscoholdingsinc",
        "dir":         "francisco-holdings-site",
        "description": "Francisco Holdings Inc. — Parent Company",
        "priority":    3,
        "existing":    False,
    },
    {
        "domain":      "techpetcage.com",
        "repo":        "techpetcage",
        "dir":         "tech-pet-cage-site",
        "description": "Tech Pet Cage — Registered Ontario Business",
        "priority":    3,
        "existing":    False,
    },
]


# ── GitHub API helpers ───────────────────────────────────────────────────────

def gh(method, path, **kwargs):
    return requests.request(
        method,
        f"https://api.github.com{path}",
        headers={
            "Authorization": f"token {GITHUB_TOKEN}",
            "Accept": "application/vnd.github.v3+json",
            "X-GitHub-Api-Version": "2022-11-28",
        },
        timeout=30,
        **kwargs,
    )


def create_repo(name, description):
    r = gh("POST", "/user/repos", json={
        "name":        name,
        "description": description,
        "private":     False,
        "auto_init":   True,  # creates main branch so we can push files
        "has_issues":  False,
        "has_wiki":    False,
        "has_projects": False,
    })
    if r.status_code in (200, 201):
        _ok(f"Repo created: {GITHUB_USER}/{name}")
        return True
    if r.status_code == 422:
        _ok(f"Repo already exists: {GITHUB_USER}/{name}")
        return True
    _err(f"Create repo failed ({r.status_code}): {r.text[:300]}")
    return False


def get_file_sha(owner, repo, path, branch="main"):
    r = gh("GET", f"/repos/{owner}/{repo}/contents/{path}", params={"ref": branch})
    if r.status_code == 200:
        return r.json().get("sha")
    return None


def push_file(owner, repo, path, content_str, message, branch="main"):
    content_b64 = base64.b64encode(content_str.encode("utf-8")).decode("utf-8")
    payload = {"message": message, "content": content_b64, "branch": branch}
    sha = get_file_sha(owner, repo, path, branch)
    if sha:
        payload["sha"] = sha
    r = gh("PUT", f"/repos/{owner}/{repo}/contents/{path}", json=payload)
    return r.status_code in (200, 201)


def enable_pages(owner, repo):
    r = gh("POST", f"/repos/{owner}/{repo}/pages", json={
        "source": {"branch": "main", "path": "/"}
    })
    if r.status_code in (200, 201):
        _ok("GitHub Pages enabled")
        return True
    if r.status_code == 409:
        _ok("GitHub Pages already enabled")
        return True
    _warn(f"Pages enable status {r.status_code}: {r.text[:200]}")
    return False


def set_pages_domain(owner, repo, domain):
    r = gh("PUT", f"/repos/{owner}/{repo}/pages", json={
        "cname": domain,
        "https_enforced": False,  # can't enforce until DNS propagates
    })
    if r.status_code in (200, 204):
        _ok(f"Custom domain set: {domain}")
        return True
    _warn(f"Domain set returned {r.status_code} (may still work)")
    return False


# ── Porkbun API helpers ──────────────────────────────────────────────────────

def pb(endpoint, extra=None):
    payload = {
        "apikey":       PORKBUN_API_KEY,
        "secretapikey": PORKBUN_SECRET_KEY,
    }
    if extra:
        payload.update(extra)
    try:
        r = requests.post(
            f"https://api.porkbun.com/api/json/v3/{endpoint}",
            json=payload,
            timeout=30,
        )
        return r.json()
    except Exception as e:
        return {"status": "ERROR", "message": str(e)}


def pb_get_records(domain):
    r = pb(f"dns/retrieve/{domain}")
    return r.get("records", []) if r.get("status") == "SUCCESS" else []


def pb_delete_record(domain, record_id):
    pb(f"dns/delete/{domain}/{record_id}")


def setup_dns(domain):
    print(f"    Setting DNS records for {domain}...")

    # Remove existing A records and www CNAME to avoid conflicts
    existing = pb_get_records(domain)
    for rec in existing:
        if rec.get("type") == "A" and rec.get("name") in (domain, "@", ""):
            pb_delete_record(domain, rec["id"])
            print(f"    ~ Removed old A record: {rec.get('content')}")
        if rec.get("type") == "CNAME" and rec.get("name") in ("www", f"www.{domain}"):
            pb_delete_record(domain, rec["id"])
            print(f"    ~ Removed old CNAME www")

    # Add 4 GitHub Pages A records
    for ip in GITHUB_PAGES_IPS:
        r = pb(f"dns/create/{domain}", {
            "name": "@", "type": "A", "content": ip, "ttl": "300"
        })
        icon = "✓" if r.get("status") == "SUCCESS" else "✗"
        print(f"    {icon} A @ → {ip}  [{r.get('status')}]")

    # Add CNAME www
    r = pb(f"dns/create/{domain}", {
        "name": "www", "type": "CNAME",
        "content": f"{GITHUB_USER}.github.io", "ttl": "300"
    })
    icon = "✓" if r.get("status") == "SUCCESS" else "✗"
    print(f"    {icon} CNAME www → {GITHUB_USER}.github.io  [{r.get('status')}]")


# ── Logging helpers ──────────────────────────────────────────────────────────

def _ok(msg):   print(f"    ✓ {msg}")
def _err(msg):  print(f"    ✗ {msg}")
def _warn(msg): print(f"    ~ {msg}")


# ── Deploy one site ──────────────────────────────────────────────────────────

def deploy_site(site):
    domain      = site["domain"]
    repo        = site["repo"]
    site_dir    = REPO_ROOT / site["dir"]
    description = site["description"]
    existing    = site.get("existing", False)
    skip_files  = set(site.get("skip_files", []))

    print(f"\n{'═'*60}")
    print(f"  🚀  {domain}")
    print(f"      repo:  {GITHUB_USER}/{repo}")
    print(f"      files: {site_dir.name}/")
    print(f"{'═'*60}")

    if not site_dir.exists():
        _err(f"Directory not found: {site_dir}")
        return False

    # 1 ─ Create repo (skip if it already exists)
    if not existing:
        if not create_repo(repo, description):
            _err("Aborting site — could not create repo")
            return False
        time.sleep(3)  # let GitHub initialise the main branch
    else:
        _ok(f"Using existing repo: {GITHUB_USER}/{repo}")

    # 2 ─ Push site files
    pushed = 0
    extensions = {".html", ".js", ".json", ".css", ".txt", ".svg", ".xml"}
    for fp in sorted(site_dir.rglob("*")):
        if not fp.is_file():
            continue
        if fp.suffix.lower() not in extensions:
            continue
        if fp.name in skip_files:
            _warn(f"Skipped (version file): {fp.name}")
            continue

        rel = fp.relative_to(site_dir)
        try:
            content = fp.read_text(encoding="utf-8", errors="replace")
            ok = push_file(GITHUB_USER, repo, str(rel), content, f"deploy: {rel}")
            icon = "✓" if ok else "✗"
            print(f"    {icon} {rel}")
            if ok:
                pushed += 1
            time.sleep(0.4)  # stay well under GitHub rate limits
        except Exception as e:
            _err(f"{rel}: {e}")

    # 3 ─ CNAME + .nojekyll
    if push_file(GITHUB_USER, repo, "CNAME", domain + "\n", f"deploy: CNAME → {domain}"):
        _ok(f"CNAME → {domain}")
    if push_file(GITHUB_USER, repo, ".nojekyll", "", "deploy: disable Jekyll"):
        _ok(".nojekyll")

    # 4 ─ Enable GitHub Pages
    time.sleep(2)
    enable_pages(GITHUB_USER, repo)
    time.sleep(1)
    set_pages_domain(GITHUB_USER, repo, domain)

    # 5 ─ DNS
    setup_dns(domain)

    print(f"\n    ✓ {pushed} files pushed")
    print(f"    → https://{domain}  (live in ~10 min after DNS propagates)")
    return True


# ── Entry point ──────────────────────────────────────────────────────────────

def main():
    print("\n🏛️   Francisco Holdings Empire — Full Deployment")
    print("="*60)

    # Validate env vars
    missing = [v for v in ("GITHUB_TOKEN", "PORKBUN_API_KEY", "PORKBUN_SECRET_KEY")
               if not os.environ.get(v)]
    if missing:
        print(f"\n❌  Missing environment variables: {', '.join(missing)}")
        print("\n    Set them with:")
        for v in missing:
            print(f"      export {v}='your-value-here'")
        print("\n    GitHub token: https://github.com/settings/tokens/new")
        print("    Porkbun keys: https://porkbun.com/account/api")
        sys.exit(1)

    # Ping Porkbun
    print("\n🔑  Porkbun API...")
    r = pb("ping")
    if r.get("status") != "SUCCESS":
        print(f"    ✗ Auth failed: {r}")
        sys.exit(1)
    print(f"    ✓ Connected (your IP: {r.get('yourIp', 'ok')})")

    # Ping GitHub
    print("\n🔑  GitHub API...")
    r = gh("GET", "/user")
    if r.status_code != 200:
        print(f"    ✗ Auth failed ({r.status_code}): {r.text[:200]}")
        sys.exit(1)
    print(f"    ✓ Connected as: {r.json().get('login')}")

    # Deploy — priority 1 first, then 2, then 3
    sites_sorted = sorted(SITES, key=lambda s: s.get("priority", 9))
    results = []
    for site in sites_sorted:
        ok = deploy_site(site)
        results.append((site["domain"], ok))

    # Summary
    print(f"\n{'='*60}")
    print("📊  DEPLOYMENT SUMMARY")
    print(f"{'='*60}")
    for domain, ok in results:
        icon = "✓" if ok else "✗"
        print(f"    {icon}  {domain}")

    success = sum(1 for _, ok in results if ok)
    print(f"\n    {success}/{len(results)} sites deployed successfully")
    print(f"\n⏱️   DNS propagation: 5–30 min")
    print(f"🔒  HTTPS: enable in GitHub repo Settings → Pages → Enforce HTTPS")
    print(f"         (available once DNS propagates)")
    print(f"\n💰  You're live. Go make money.\n")


if __name__ == "__main__":
    main()
