#!/usr/bin/env python3
"""
GitHub Pages Enablement Script
================================
Enables GitHub Pages on all empire repos and sets custom domains.
Run this AFTER deploy_all.py if Pages wasn't enabled automatically,
OR after manually creating the repos.

    export GITHUB_TOKEN='ghp_yourTokenHere'
    python3 setup/enable_pages.py

Requires 'repo' scope on the token.
Generate at: https://github.com/settings/tokens/new
"""

import os
import sys
import time
import requests

GITHUB_TOKEN = os.environ.get("GITHUB_TOKEN")
GITHUB_USER  = "franciscoderek7"

# Repo → custom domain mapping
REPOS = [
    ("cleanswarm",          "cleanswarm.com"),
    ("primedox-ai",         "primedox.ai"),
    ("omniaguard",          "omniaguard.com"),
    ("ccldr-net",           "ccldr.net"),
    ("franciscoholdingsinc","franciscoholdingsinc.com"),
    ("techpetcage",         "techpetcage.com"),
]


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


def enable_pages(owner, repo):
    r = gh("POST", f"/repos/{owner}/{repo}/pages", json={
        "source": {"branch": "main", "path": "/"}
    })
    if r.status_code in (200, 201):
        return "enabled"
    if r.status_code == 409:
        return "already_enabled"
    return f"error_{r.status_code}"


def set_custom_domain(owner, repo, domain):
    r = gh("PUT", f"/repos/{owner}/{repo}/pages", json={
        "cname": domain,
        "https_enforced": False,
    })
    return r.status_code in (200, 204)


def get_pages_status(owner, repo):
    r = gh("GET", f"/repos/{owner}/{repo}/pages")
    if r.status_code == 200:
        data = r.json()
        return {
            "status": data.get("status"),
            "url":    data.get("html_url"),
            "cname":  data.get("cname"),
        }
    return None


def main():
    if not GITHUB_TOKEN:
        print("\n❌  GITHUB_TOKEN not set.")
        print("    export GITHUB_TOKEN='ghp_...'")
        print("    Generate: https://github.com/settings/tokens/new  (scope: repo)")
        sys.exit(1)

    r = gh("GET", "/user")
    if r.status_code != 200:
        print(f"\n❌  GitHub auth failed ({r.status_code})")
        sys.exit(1)
    print(f"\n✓  GitHub connected as: {r.json().get('login')}")
    print("   Enabling Pages on all repos...\n")

    for repo, domain in REPOS:
        print(f"  {GITHUB_USER}/{repo}  →  {domain}")

        # Enable Pages
        result = enable_pages(GITHUB_USER, repo)
        if result == "enabled":
            print(f"    ✓ Pages enabled")
        elif result == "already_enabled":
            print(f"    ~ Pages already enabled")
        else:
            print(f"    ✗ {result}")
            continue

        time.sleep(1)

        # Set custom domain
        ok = set_custom_domain(GITHUB_USER, repo, domain)
        icon = "✓" if ok else "~"
        print(f"    {icon} Custom domain: {domain}")

        time.sleep(1)

        # Check status
        status = get_pages_status(GITHUB_USER, repo)
        if status:
            print(f"    ℹ  Pages URL:  {status.get('url')}")
            print(f"    ℹ  CNAME set:  {status.get('cname')}")
            print(f"    ℹ  Status:     {status.get('status')}")

        print()

    print("="*50)
    print("NEXT STEPS")
    print("="*50)
    print("""
  1. DNS must propagate before HTTPS works (5–30 min)
  2. After DNS propagates, enable HTTPS in each repo:
       GitHub → Repo → Settings → Pages → Enforce HTTPS ✓
  3. Check live status:
       https://dnschecker.org
  4. Verify Pages build:
       https://github.com/franciscoderek7/<repo>/actions
""")


if __name__ == "__main__":
    main()
