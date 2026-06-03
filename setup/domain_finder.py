#!/usr/bin/env python3
"""
Domain Availability Checker — AI Brand Name Finder
====================================================
Checks 30+ hand-curated superhero/AI brand .com candidates
against the Porkbun API in real time. Prints which are
available and their exact registration price.

Run from anywhere:

    export PORKBUN_API_KEY='pk1_yourKeyHere'
    export PORKBUN_SECRET_KEY='sk1_yourSecretHere'
    python3 setup/domain_finder.py

Porkbun keys: https://porkbun.com/account/api
"""

import os
import sys
import time
import requests

PORKBUN_API_KEY    = os.environ.get("PORKBUN_API_KEY")
PORKBUN_SECRET_KEY = os.environ.get("PORKBUN_SECRET_KEY")

# ── Candidate domain names ────────────────────────────────────────────────────
# Curated for superhero AI feel, short, memorable, Claude/Kimi/Munus style.
# Grouped by vibe. The script checks ALL of them.

CANDIDATES = [
    # ── Latin power words (like "Munus") ──
    "munus.com",       # gift / duty / service — user's own suggestion
    "velox.com",       # swift / fast
    "nexus.com",       # connection / center (likely taken but worth checking)
    "aevum.com",       # eternity / age (Latin)
    "vexo.com",        # confirmed for sale — price unknown
    "solux.com",       # sun / light
    "korax.com",       # strength (rare)
    "aurox.com",       # gold / dawn

    # ── Clean 4-letter tech ──
    "kova.com",        # powerful invented word
    "vael.com",        # mystical / otherworldly
    "aevo.com",        # evolution
    "lyra.com",        # constellation (Vega's constellation)
    "orbi.com",        # orbit / sphere
    "axio.com",        # axis / core
    "vexa.com",        # vector + extra

    # ── Superhero / cosmic ──
    "helix.com",       # DNA / spiral (probably taken)
    "nexara.com",      # invented — nexus + ara constellation
    "aevix.com",       # invented futuristic — aevum + ix
    "lyrix.com",       # invented — lyra + ix
    "vexara.com",      # vexo + ara — cosmic
    "solai.com",       # sol + AI — solar intelligence
    "axira.com",       # axis + ira — power
    "korova.com",      # strong invented word

    # ── Simple & punchy (like Kimi / Claude) ──
    "kairo.com",       # Cairo respelled — timing (kairos = perfect moment)
    "kael.com",        # short and strong
    "zael.com",        # unique z-sound
    "vynn.com",        # invented, distinctive
    "ovox.com",        # voice + ov
    "pyxis.com",       # southern constellation / navigation box

    # ── AI / intelligence ──
    "nurai.com",       # neural + AI
    "synai.com",       # synapse + AI
    "cortai.com",      # cortex + AI
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
            timeout=15,
        )
        return r.json()
    except Exception as e:
        return {"status": "ERROR", "message": str(e)}


def check_domain(domain):
    """Returns (available: bool, price: str or None, message: str)"""
    sld, tld = domain.rsplit(".", 1)
    r = pb(f"domain/checkDomain/{sld}/{tld}")
    if r.get("status") == "SUCCESS":
        avail = r.get("available") == "yes"
        price = r.get("regularPrice") or r.get("price") or "?"
        return avail, price, ""
    # Fallback: try pricing endpoint
    r2 = pb(f"pricing/get/{tld}")
    if r2.get("status") == "SUCCESS":
        pricing = r2.get("pricing", {})
        reg_price = pricing.get("registration", "?")
        return None, reg_price, f"availability uncertain (API: {r.get('message', '?')[:60]})"
    return None, None, r.get("message", "unknown error")[:80]


def main():
    if not PORKBUN_API_KEY or not PORKBUN_SECRET_KEY:
        print("\n❌  Missing Porkbun credentials.\n")
        print("    export PORKBUN_API_KEY='pk1_...'")
        print("    export PORKBUN_SECRET_KEY='sk1_...'")
        sys.exit(1)

    # Test auth
    r = pb("ping")
    if r.get("status") != "SUCCESS":
        print(f"\n❌  Porkbun auth failed: {r}")
        sys.exit(1)
    print(f"\n✓  Porkbun connected (IP: {r.get('yourIp', 'ok')})")
    print(f"   Checking {len(CANDIDATES)} domain candidates...\n")

    available   = []
    taken       = []
    uncertain   = []

    for domain in CANDIDATES:
        avail, price, msg = check_domain(domain)
        price_str = f"${price}/yr" if price and price != "?" else "price unknown"

        if avail is True:
            print(f"  ✅  {domain:<22}  {price_str}")
            available.append((domain, price_str))
        elif avail is False:
            print(f"  ✗   {domain:<22}  TAKEN")
            taken.append(domain)
        else:
            print(f"  ?   {domain:<22}  uncertain  [{msg}]")
            uncertain.append((domain, msg))

        time.sleep(0.3)  # respect rate limits

    # ── Summary ──────────────────────────────────────────────────────────────
    print(f"\n{'='*60}")
    print("AVAILABLE DOMAINS")
    print(f"{'='*60}")

    if available:
        print(f"\n  {'DOMAIN':<25} PRICE")
        print(f"  {'-'*40}")
        for domain, price in available:
            print(f"  {domain:<25} {price}")
        print(f"\n  → Register at: https://porkbun.com")
        print(f"  → Or run: python3 setup/domain_register.py {available[0][0]}")
    else:
        print("\n  None of the candidates were confirmed available.")
        print("  Try checking manually at https://porkbun.com or https://instantdomainsearch.com")

    print(f"\n{'='*60}")
    print("TOP RECOMMENDATION FOR AI CLONE BRAND")
    print(f"{'='*60}")
    print("""
  Ranking by fit for superhero AI tech clone brand:

  Tier 1 — Best brand fit (if available):
    munus.com    Latin "gift/service" — exactly like Claude/Kimi in vibe
    kairo.com    Kairos = perfect moment — powerful AI positioning
    aevum.com    Latin "eternity" — timeless, premium feel
    vexo.com     For sale — edgy, modern, memorable

  Tier 2 — Strong but slightly generic:
    nexara.com   Invented, cosmic, 6 letters
    aevix.com    Futuristic, invented
    solai.com    Solar + AI — clear positioning
    nurai.com    Neural + AI — clear but descriptive

  Tier 3 — Check .ai TLD if .com is taken:
    kairo.ai     (Porkbun .ai ~$37/yr)
    vexo.ai
    aevum.ai
    lyra.ai
""")

    if taken:
        print(f"\n  Taken ({len(taken)}): {', '.join(taken[:8])}{'...' if len(taken) > 8 else ''}")


if __name__ == "__main__":
    main()
