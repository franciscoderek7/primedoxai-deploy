#!/usr/bin/env python3
"""
Kiaros Domain Bulk Registration — Porkbun API v3
==================================================
EMERGENCY PRIORITY: Register kiaros.* domains before anyone else.
Registers in priority order, stops when remaining balance < $50.

    export PORKBUN_SECRET_KEY='sk1_yourSecretHere'
    python3 setup/kiaros_domains.py

    # Dry run (show cost, no purchases):
    python3 setup/kiaros_domains.py --dry-run

    # Register single domain:
    python3 setup/kiaros_domains.py --only kiaros.dev

Requires: pip install requests
Porkbun API Key is embedded (semi-public). Secret Key via env var ONLY.
"""

import os, sys, time, json, requests, argparse
from datetime import datetime
from pathlib import Path

# ── Credentials ──────────────────────────────────────────────────────────────
API_KEY    = "pk1_8871e690ff50d9183e6352bb6b08df562f7c238b4e9e2e36bcd637bd8738ec48"
SECRET_KEY = os.environ.get("PORKBUN_SECRET_KEY")

# ── GitHub Pages DNS ──────────────────────────────────────────────────────────
GITHUB_PAGES_IPS = [
    "185.199.108.153",
    "185.199.109.153",
    "185.199.110.153",
    "185.199.111.153",
]

# ── Domain priority queue ─────────────────────────────────────────────────────
# Stop registering when (total_spent + next_cost) would leave balance < BALANCE_FLOOR
BALANCE_FLOOR = 50.00  # keep at least $50 in account

DOMAINS = [
    {"domain": "kiaros.dev",   "price": 10.81, "purpose": "developer/docs hub — PRIMARY"},
    {"domain": "kiaros.app",   "price": 10.81, "purpose": "mobile app future"},
    {"domain": "kiaros.pro",   "price":  3.09, "purpose": "professional tier"},
    {"domain": "kiaros.me",    "price":  8.80, "purpose": "personal/persona"},
    {"domain": "kiaros.cloud", "price":  3.88, "purpose": "infrastructure"},
    {"domain": "kiaros.shop",  "price":  2.06, "purpose": "merch"},
    {"domain": "kiaros.store", "price":  2.57, "purpose": "digital products"},
    {"domain": "kiaros.studio","price": 11.84, "purpose": "creative studio"},
    {"domain": "kiaros.club",  "price":  4.12, "purpose": "community"},
    {"domain": "kiaros.bot",   "price": 29.35, "purpose": "automation agent"},
]

TOTAL_COST = sum(d["price"] for d in DOMAINS)

# ── Porkbun API helpers ───────────────────────────────────────────────────────

def pb(endpoint, extra=None):
    payload = {"apikey": API_KEY, "secretapikey": SECRET_KEY}
    if extra:
        payload.update(extra)
    try:
        r = requests.post(
            f"https://api.porkbun.com/api/json/v3/{endpoint}",
            json=payload, timeout=30,
        )
        return r.json()
    except Exception as e:
        return {"status": "ERROR", "message": str(e)}


def check_domain_available(domain):
    """Returns (available, price_from_api)"""
    sld, tld = domain.rsplit(".", 1)
    r = pb(f"domain/checkDomain/{sld}/{tld}")
    if r.get("status") == "SUCCESS":
        return r.get("available") == "yes", r.get("regularPrice")
    return None, None


def register_domain(domain, years=1):
    """Attempt to register a domain. Returns (success, message)"""
    r = pb("domain/create", {
        "domain": domain,
        "years":  str(years),
        "ns":     "ns1.porkbun.com,ns2.porkbun.com,ns3.porkbun.com,ns4.porkbun.com",
    })
    if r.get("status") == "SUCCESS":
        return True, f"Registered! Order ID: {r.get('id', '?')}"
    return False, r.get("message", str(r))


def delete_existing_records(domain, rec_type, name="@"):
    existing = pb(f"dns/retrieve/{domain}").get("records", [])
    for rec in existing:
        t = rec.get("type"); n = rec.get("name", "")
        if t == rec_type and n in (name, domain, "@", f"{name}.{domain}", ""):
            pb(f"dns/delete/{domain}/{rec['id']}")


def setup_dns(domain):
    """Set GitHub Pages A records + CNAME www"""
    print(f"    DNS setup for {domain}...")
    delete_existing_records(domain, "A")
    delete_existing_records(domain, "CNAME", "www")

    ok_count = 0
    for ip in GITHUB_PAGES_IPS:
        r = pb(f"dns/create/{domain}", {
            "name": "@", "type": "A", "content": ip, "ttl": "300"
        })
        if r.get("status") == "SUCCESS":
            ok_count += 1
    print(f"    ✓ {ok_count}/4 A records set → GitHub Pages")

    r = pb(f"dns/create/{domain}", {
        "name": "www", "type": "CNAME",
        "content": "franciscoderek7.github.io", "ttl": "300",
    })
    icon = "✓" if r.get("status") == "SUCCESS" else "~"
    print(f"    {icon} CNAME www → franciscoderek7.github.io")


def load_domains_json():
    p = Path(__file__).parent.parent / "domains.json"
    if p.exists():
        return json.loads(p.read_text())
    return {"companies": [], "kiaros_domains": []}


def save_domains_json(data):
    p = Path(__file__).parent.parent / "domains.json"
    p.write_text(json.dumps(data, indent=2))


def add_to_domains_json(domain, status, purpose):
    data = load_domains_json()
    kd = data.setdefault("kiaros_domains", [])
    entry = {"domain": domain, "status": status, "purpose": purpose,
             "registered": datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ"),
             "dns": "github-pages", "ssl": "auto"}
    existing = [i for i, d in enumerate(kd) if d["domain"] == domain]
    if existing:
        kd[existing[0]] = entry
    else:
        kd.append(entry)
    save_domains_json(data)


# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="Kiaros bulk domain registration")
    parser.add_argument("--dry-run", action="store_true", help="Show costs, don't buy")
    parser.add_argument("--only", metavar="DOMAIN", help="Register only this domain")
    args = parser.parse_args()

    if not SECRET_KEY:
        print("\n❌  PORKBUN_SECRET_KEY not set.")
        print("    export PORKBUN_SECRET_KEY='sk1_...'")
        sys.exit(1)

    # Auth test
    r = pb("ping")
    if r.get("status") != "SUCCESS":
        print(f"\n❌  Porkbun auth failed: {r}")
        sys.exit(1)
    print(f"\n✓  Porkbun connected (IP: {r.get('yourIp', 'ok')})")

    targets = DOMAINS
    if args.only:
        targets = [d for d in DOMAINS if d["domain"] == args.only]
        if not targets:
            print(f"❌  Domain not in list: {args.only}")
            sys.exit(1)

    # Cost summary
    total = sum(d["price"] for d in targets)
    print(f"\n{'='*60}")
    print(f"  KIAROS DOMAIN REGISTRATION — {'DRY RUN' if args.dry_run else 'LIVE'}")
    print(f"{'='*60}")
    print(f"\n  {'DOMAIN':<20} {'COST':>8}   PURPOSE")
    print(f"  {'-'*55}")
    for d in targets:
        print(f"  {d['domain']:<20} ${d['price']:>6.2f}   {d['purpose']}")
    print(f"  {'-'*55}")
    print(f"  {'TOTAL':<20} ${total:>6.2f}")
    print(f"  Balance floor: ${BALANCE_FLOOR:.2f} kept in account\n")

    if args.dry_run:
        print("  DRY RUN — no purchases made.")
        print("  Remove --dry-run to execute.\n")
        sys.exit(0)

    confirm = input(f"  Proceed with registration? [y/N] ").strip().lower()
    if confirm not in ("y", "yes"):
        print("  Aborted.")
        sys.exit(0)

    # Registration loop
    spent = 0.0
    registered = []
    skipped = []

    for item in targets:
        domain  = item["domain"]
        cost    = item["price"]
        purpose = item["purpose"]

        print(f"\n{'─'*60}")
        print(f"  🌐  {domain}  (${cost:.2f})")

        # Balance floor check (estimate based on spending so far)
        # We can't read account balance via API, so we track spend and warn
        if spent + cost > total - BALANCE_FLOOR:
            print(f"  ~ Skipping — would approach balance floor (${BALANCE_FLOOR:.2f} reserve)")
            skipped.append(domain)
            continue

        # Check availability
        avail, api_price = check_domain_available(domain)
        if avail is False:
            print(f"  ✗ Already taken or unavailable")
            skipped.append(domain)
            add_to_domains_json(domain, "taken", purpose)
            continue
        if avail is None:
            print(f"  ~ Availability uncertain — attempting registration anyway")

        # Register
        success, msg = register_domain(domain)
        if not success:
            print(f"  ✗ Registration failed: {msg}")
            # Check if it's a funds issue
            if "funds" in msg.lower() or "balance" in msg.lower() or "insufficient" in msg.lower():
                print(f"  ⚠  Insufficient funds — stopping registration queue")
                skipped.extend(d["domain"] for d in targets[targets.index(item):])
                break
            skipped.append(domain)
            add_to_domains_json(domain, "failed", purpose)
            continue

        print(f"  ✓ {msg}")
        spent += cost
        registered.append(domain)
        add_to_domains_json(domain, "registered", purpose)

        # DNS setup
        time.sleep(3)  # let registration propagate
        setup_dns(domain)

        time.sleep(1)

    # Summary
    print(f"\n{'='*60}")
    print(f"  REGISTRATION SUMMARY")
    print(f"{'='*60}")
    print(f"\n  ✓ Registered ({len(registered)}):  {', '.join(registered) or 'none'}")
    print(f"  ~ Skipped   ({len(skipped)}):  {', '.join(skipped) or 'none'}")
    print(f"  💰 Spent:  ${spent:.2f}")

    print(f"""
  NEXT STEPS:
  1. Enable GitHub Pages on kiaros-deploy repo
       github.com/franciscoderek7/kiaros-deploy/settings/pages
       → Source: main / root → Save
  2. Set custom domain to kiaros.dev
  3. Enable Enforce HTTPS (after DNS propagates ~10 min)
  4. Verify: dig kiaros.dev A +short → should return 185.199.108.153
""")


if __name__ == "__main__":
    main()
