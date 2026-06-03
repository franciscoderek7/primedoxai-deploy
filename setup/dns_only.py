#!/usr/bin/env python3
"""
Porkbun DNS Setup — GitHub Pages records for all empire domains
===============================================================
Use this script if GitHub repos are already set up and you only
need to update or reset DNS records.

    export PORKBUN_API_KEY='pk1_yourKeyHere'
    export PORKBUN_SECRET_KEY='sk1_yourSecretHere'
    python3 setup/dns_only.py

Or target a single domain:
    python3 setup/dns_only.py cleanswarm.com
"""

import os
import sys
import requests

PORKBUN_API_KEY    = os.environ.get("PORKBUN_API_KEY")
PORKBUN_SECRET_KEY = os.environ.get("PORKBUN_SECRET_KEY")
GITHUB_USER        = "franciscoderek7"

GITHUB_PAGES_IPS = [
    "185.199.108.153",
    "185.199.109.153",
    "185.199.110.153",
    "185.199.111.153",
]

# All empire domains — add more here as new sites go live
DOMAINS = [
    "cleanswarm.com",
    "primedox.ai",
    "omniaguard.com",
    "ccldr.net",
    "franciscoholdingsinc.com",
    "techpetcage.com",
]


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


def setup_domain(domain):
    print(f"\n  {domain}")

    # Get existing records
    existing = pb(f"dns/retrieve/{domain}")
    if existing.get("status") != "SUCCESS":
        print(f"    ✗ Cannot retrieve records: {existing.get('message', 'unknown error')}")
        print(f"      Make sure '{domain}' is in your Porkbun account and API access is enabled.")
        return False

    records = existing.get("records", [])

    # Remove conflicting A records at apex
    for rec in records:
        if rec.get("type") == "A" and rec.get("name") in (domain, "@", ""):
            r = pb(f"dns/delete/{domain}/{rec['id']}")
            print(f"    ~ Removed old A record: {rec.get('content')}")

    # Remove conflicting CNAME for www
    for rec in records:
        if rec.get("type") == "CNAME" and rec.get("name") in ("www", f"www.{domain}"):
            r = pb(f"dns/delete/{domain}/{rec['id']}")
            print(f"    ~ Removed old CNAME www")

    # Create 4 A records pointing to GitHub Pages IPs
    all_ok = True
    for ip in GITHUB_PAGES_IPS:
        r = pb(f"dns/create/{domain}", {
            "name":    "@",
            "type":    "A",
            "content": ip,
            "ttl":     "300",
        })
        ok = r.get("status") == "SUCCESS"
        icon = "✓" if ok else "✗"
        print(f"    {icon} A @ → {ip}")
        if not ok:
            print(f"      Error: {r.get('message', r)}")
            all_ok = False

    # Create CNAME www → franciscoderek7.github.io
    r = pb(f"dns/create/{domain}", {
        "name":    "www",
        "type":    "CNAME",
        "content": f"{GITHUB_USER}.github.io",
        "ttl":     "300",
    })
    ok = r.get("status") == "SUCCESS"
    icon = "✓" if ok else "✗"
    print(f"    {icon} CNAME www → {GITHUB_USER}.github.io")
    if not ok:
        print(f"      Error: {r.get('message', r)}")
        all_ok = False

    return all_ok


def main():
    if not PORKBUN_API_KEY or not PORKBUN_SECRET_KEY:
        print("\n❌  Missing Porkbun credentials.\n")
        print("    export PORKBUN_API_KEY='pk1_...'")
        print("    export PORKBUN_SECRET_KEY='sk1_...'")
        print("\n    Keys at: https://porkbun.com/account/api")
        sys.exit(1)

    # Test connection
    r = pb("ping")
    if r.get("status") != "SUCCESS":
        print(f"\n❌  Porkbun auth failed: {r}")
        sys.exit(1)

    print(f"\n✓  Porkbun connected (IP: {r.get('yourIp', 'ok')})")
    print("   Setting GitHub Pages DNS records...\n")

    # Target a single domain if passed as CLI arg
    targets = sys.argv[1:] if len(sys.argv) > 1 else DOMAINS

    results = []
    for domain in targets:
        ok = setup_domain(domain)
        results.append((domain, ok))

    print(f"\n{'='*50}")
    print("DNS SETUP SUMMARY")
    print(f"{'='*50}")
    for domain, ok in results:
        icon = "✓" if ok else "✗"
        print(f"  {icon}  {domain}")

    print(f"\n⏱️  Propagation: 5–30 minutes")
    print(f"   Check: https://dnschecker.org\n")


if __name__ == "__main__":
    main()
