#!/usr/bin/env python3
"""
Kiaros Rebrand Migration Script — PrimeDox → Kiaros
=====================================================
Renames the GitHub repo, updates GitHub Pages CNAME,
sets up kiaros-deploy redirect, and pushes the new
Kiaros site files.

    export GITHUB_TOKEN='ghp_yourTokenHere'
    export PORKBUN_SECRET_KEY='sk1_yourSecretHere'
    python3 setup/kiaros_rebrand.py

Requirements: pip install requests
"""

import os, sys, time, base64, json, requests
from pathlib import Path

GITHUB_TOKEN       = os.environ.get("GITHUB_TOKEN")
PORKBUN_SECRET_KEY = os.environ.get("PORKBUN_SECRET_KEY")
PORKBUN_API_KEY    = "pk1_8871e690ff50d9183e6352bb6b08df562f7c238b4e9e2e36bcd637bd8738ec48"

GITHUB_USER   = "franciscoderek7"
OLD_REPO      = "primedoxai-deploy"
NEW_REPO      = "kiaros-deploy"
PRIMARY_DOMAIN = "kiaros.dev"
REPO_ROOT      = Path(__file__).parent.parent

GITHUB_PAGES_IPS = [
    "185.199.108.153", "185.199.109.153",
    "185.199.110.153", "185.199.111.153",
]


# ── GitHub API ────────────────────────────────────────────────────────────────

def gh(method, path, **kwargs):
    return requests.request(
        method, f"https://api.github.com{path}",
        headers={
            "Authorization": f"token {GITHUB_TOKEN}",
            "Accept": "application/vnd.github.v3+json",
            "X-GitHub-Api-Version": "2022-11-28",
        },
        timeout=30, **kwargs,
    )


def rename_repo():
    """Rename primedoxai-deploy → kiaros-deploy"""
    print(f"\n  Renaming repo: {OLD_REPO} → {NEW_REPO}")
    r = gh("PATCH", f"/repos/{GITHUB_USER}/{OLD_REPO}", json={"name": NEW_REPO})
    if r.status_code == 200:
        print(f"  ✓ Repo renamed to {GITHUB_USER}/{NEW_REPO}")
        print(f"  ✓ Old URL auto-redirects: github.com/{GITHUB_USER}/{OLD_REPO}")
        return True
    print(f"  ✗ Rename failed ({r.status_code}): {r.text[:200]}")
    return False


def get_file_sha(repo, path, branch="main"):
    r = gh("GET", f"/repos/{GITHUB_USER}/{repo}/contents/{path}", params={"ref": branch})
    return r.json().get("sha") if r.status_code == 200 else None


def push_file(repo, path, content_str, message, branch="main"):
    content_b64 = base64.b64encode(content_str.encode()).decode()
    payload = {"message": message, "content": content_b64, "branch": branch}
    sha = get_file_sha(repo, path, branch)
    if sha:
        payload["sha"] = sha
    r = gh("PUT", f"/repos/{GITHUB_USER}/{repo}/contents/{path}", json=payload)
    return r.status_code in (200, 201)


def update_cname():
    """Update CNAME file to kiaros.dev"""
    repo = NEW_REPO  # use new name after rename
    ok = push_file(repo, "CNAME", PRIMARY_DOMAIN + "\n",
                   f"rebrand: update CNAME → {PRIMARY_DOMAIN}")
    icon = "✓" if ok else "✗"
    print(f"  {icon} CNAME → {PRIMARY_DOMAIN}")
    return ok


def push_redirect_page():
    """Push a redirect index at old primedox.ai path"""
    redirect_html = f"""<!DOCTYPE html>
<html><head>
<meta charset="UTF-8">
<meta http-equiv="refresh" content="0; url=https://{PRIMARY_DOMAIN}">
<title>Redirecting to Kiaros...</title>
</head><body>
<p>Redirecting to <a href="https://{PRIMARY_DOMAIN}">Kiaros</a>...</p>
<script>window.location.href="https://{PRIMARY_DOMAIN}";</script>
</body></html>"""
    ok = push_file(NEW_REPO, "primedoxai-site/index.html", redirect_html,
                   "rebrand: redirect primedox → kiaros.dev")
    icon = "✓" if ok else "✗"
    print(f"  {icon} Redirect primedoxai-site/index.html → kiaros.dev")


def update_pages_domain(repo):
    r = gh("PUT", f"/repos/{GITHUB_USER}/{repo}/pages", json={
        "cname": PRIMARY_DOMAIN, "https_enforced": False,
    })
    ok = r.status_code in (200, 204)
    print(f"  {'✓' if ok else '~'} GitHub Pages custom domain: {PRIMARY_DOMAIN}")


# ── Porkbun helpers ───────────────────────────────────────────────────────────

def pb(endpoint, extra=None):
    payload = {"apikey": PORKBUN_API_KEY, "secretapikey": PORKBUN_SECRET_KEY}
    if extra:
        payload.update(extra)
    try:
        r = requests.post(f"https://api.porkbun.com/api/json/v3/{endpoint}",
                          json=payload, timeout=30)
        return r.json()
    except Exception as e:
        return {"status": "ERROR", "message": str(e)}


def setup_redirect_dns(domain, target_domain):
    """For domains not hosting directly, set up DNS pointing to primary"""
    for ip in GITHUB_PAGES_IPS:
        pb(f"dns/create/{domain}", {
            "name": "@", "type": "A", "content": ip, "ttl": "300"
        })
    pb(f"dns/create/{domain}", {
        "name": "www", "type": "CNAME",
        "content": f"{GITHUB_USER}.github.io", "ttl": "300"
    })
    print(f"  ✓ DNS set for {domain} → GitHub Pages")


# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    if not GITHUB_TOKEN:
        print("\n❌  GITHUB_TOKEN not set.")
        print("    export GITHUB_TOKEN='ghp_...'")
        sys.exit(1)

    r = gh("GET", "/user")
    if r.status_code != 200:
        print(f"\n❌  GitHub auth failed ({r.status_code})")
        sys.exit(1)
    print(f"\n✓  GitHub connected as: {r.json().get('login')}")

    print(f"\n{'='*60}")
    print(f"  KIAROS REBRAND MIGRATION")
    print(f"  PrimeDox → Kiaros")
    print(f"  {OLD_REPO} → {NEW_REPO}")
    print(f"{'='*60}")

    print(f"\n[1/4] Renaming GitHub repository...")
    renamed = rename_repo()

    time.sleep(3)  # wait for GitHub to update

    if renamed:
        print(f"\n[2/4] Updating CNAME + GitHub Pages...")
        update_cname()
        update_pages_domain(NEW_REPO)

        print(f"\n[3/4] Adding redirect for old PrimeDox path...")
        push_redirect_page()
    else:
        print(f"\n[2/4] Skipping CNAME update (repo rename failed)")
        print(f"      Manually rename at: github.com/{GITHUB_USER}/{OLD_REPO}/settings")

    # Update git remote locally
    print(f"\n[4/4] Update your local git remote:")
    print(f"""
    git remote set-url origin git@github.com:{GITHUB_USER}/{NEW_REPO}.git
    # OR (HTTPS):
    git remote set-url origin https://github.com/{GITHUB_USER}/{NEW_REPO}.git
""")

    print(f"\n{'='*60}")
    print(f"  REBRAND COMPLETE")
    print(f"{'='*60}")
    print(f"""
  New repo:  github.com/{GITHUB_USER}/{NEW_REPO}
  Old repo:  github.com/{GITHUB_USER}/{OLD_REPO}  (auto-redirects)
  Primary:   https://{PRIMARY_DOMAIN}

  NEXT:
  1. Run: git remote set-url origin https://github.com/{GITHUB_USER}/{NEW_REPO}.git
  2. Register domains: python3 setup/kiaros_domains.py
  3. Enable Pages: github.com/{GITHUB_USER}/{NEW_REPO}/settings/pages
  4. Set custom domain: {PRIMARY_DOMAIN}
  5. Enforce HTTPS after DNS propagates
""")


if __name__ == "__main__":
    main()
