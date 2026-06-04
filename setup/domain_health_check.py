#!/usr/bin/env python3
"""
Empire Domain Health Monitor
=============================
Checks DNS resolution, SSL expiry, and GitHub Pages status
for every domain in the Francisco Holdings empire.

    python3 setup/domain_health_check.py
    python3 setup/domain_health_check.py --json        # machine-readable
    python3 setup/domain_health_check.py --domain ccldr.net  # single domain

Sends Telegram alert on failures if TELEGRAM_BOT_TOKEN + TELEGRAM_CHAT_ID set.
"""

import os, sys, json, socket, ssl, datetime, argparse, requests
from urllib.request import urlopen

TELEGRAM_BOT_TOKEN = os.environ.get("TELEGRAM_BOT_TOKEN")
TELEGRAM_CHAT_ID   = os.environ.get("TELEGRAM_CHAT_ID")

GITHUB_PAGES_IPS = {"185.199.108.153","185.199.109.153","185.199.110.153","185.199.111.153"}

EMPIRE_DOMAINS = [
    {"domain": "kiaros.dev",              "company": "Kiaros",             "repo": "kiaros-deploy"},
    {"domain": "omniaguard.com",          "company": "OmniaGuard",         "repo": "omniaguard"},
    {"domain": "cleanswarm.com",          "company": "CleanSwarm",         "repo": "cleanswarm"},
    {"domain": "ccldr.net",               "company": "CCLDR",              "repo": "ccldr-net"},
    {"domain": "franciscoholdingsinc.com","company": "Francisco Holdings", "repo": "franciscoholdingsinc"},
    {"domain": "techpetcage.com",         "company": "Tech Pet Cage",      "repo": "techpetcage"},
    {"domain": "kiaros.app",              "company": "Kiaros",             "repo": "kiaros-deploy"},
    {"domain": "kiaros.pro",              "company": "Kiaros",             "repo": "kiaros-deploy"},
]


def check_dns(domain):
    """Returns (ok, resolved_ips, points_to_github)"""
    try:
        infos  = socket.getaddrinfo(domain, None)
        ips    = list({i[4][0] for i in infos})
        on_gh  = bool(GITHUB_PAGES_IPS.intersection(set(ips)))
        return True, ips, on_gh
    except Exception as e:
        return False, [], False


def check_ssl(domain):
    """Returns (ok, days_remaining, expiry_date)"""
    try:
        ctx = ssl.create_default_context()
        with ctx.wrap_socket(socket.socket(), server_hostname=domain) as s:
            s.settimeout(8)
            s.connect((domain, 443))
            cert = s.getpeercert()
        expiry = datetime.datetime.strptime(cert["notAfter"], "%b %d %H:%M:%S %Y %Z")
        days   = (expiry - datetime.datetime.utcnow()).days
        return True, days, expiry.strftime("%Y-%m-%d")
    except ssl.SSLCertVerificationError:
        return False, -1, "invalid"
    except Exception:
        return False, -1, "unavailable"


def check_http(domain):
    """Returns (reachable, status_code, redirect_url)"""
    try:
        r = requests.get(f"https://{domain}", timeout=10,
                         allow_redirects=True, headers={"User-Agent": "EmpireBot/1.0"})
        return True, r.status_code, r.url
    except Exception:
        try:
            r = requests.get(f"http://{domain}", timeout=10, allow_redirects=True)
            return True, r.status_code, r.url
        except Exception:
            return False, 0, ""


def send_telegram(message):
    if not TELEGRAM_BOT_TOKEN or not TELEGRAM_CHAT_ID:
        return
    try:
        requests.post(
            f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage",
            json={"chat_id": TELEGRAM_CHAT_ID, "text": message, "parse_mode": "Markdown"},
            timeout=10,
        )
    except Exception:
        pass


def check_domain(entry):
    domain  = entry["domain"]
    company = entry["company"]

    dns_ok, ips, on_github = check_dns(domain)
    ssl_ok, ssl_days, ssl_exp = check_ssl(domain)
    http_ok, status, final_url = check_http(domain)

    issues = []
    if not dns_ok:              issues.append("DNS FAILED")
    if dns_ok and not on_github:issues.append("DNS not → GitHub Pages")
    if ssl_days < 14:           issues.append(f"SSL expires in {ssl_days}d")
    if not http_ok:             issues.append("HTTP unreachable")
    if http_ok and status >= 400: issues.append(f"HTTP {status}")

    return {
        "domain":    domain,
        "company":   company,
        "dns":       {"ok": dns_ok, "ips": ips[:4], "github_pages": on_github},
        "ssl":       {"ok": ssl_ok, "days_remaining": ssl_days, "expiry": ssl_exp},
        "http":      {"ok": http_ok, "status": status, "url": final_url},
        "issues":    issues,
        "healthy":   len(issues) == 0,
        "checked_at": datetime.datetime.utcnow().isoformat() + "Z",
    }


def print_report(results, json_mode=False):
    if json_mode:
        print(json.dumps(results, indent=2))
        return

    print(f"\n{'='*65}")
    print(f"  FRANCISCO HOLDINGS EMPIRE — DOMAIN HEALTH REPORT")
    print(f"  {datetime.datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC')}")
    print(f"{'='*65}\n")

    healthy_count = sum(1 for r in results if r["healthy"])
    print(f"  {'DOMAIN':<28} DNS   SSL      HTTP   STATUS")
    print(f"  {'-'*60}")

    alerts = []
    for r in results:
        dns_icon  = "✓" if r["dns"]["ok"]  else "✗"
        ssl_icon  = "✓" if r["ssl"]["ok"]  else "✗"
        http_icon = "✓" if r["http"]["ok"] else "✗"
        gh_icon   = "↑" if r["dns"]["github_pages"] else "✗"
        ssl_days  = r["ssl"]["days_remaining"]
        ssl_str   = f"{ssl_days}d" if ssl_days > 0 else "ERR"
        status_str= "🟢 OK" if r["healthy"] else "🔴 " + " | ".join(r["issues"])
        print(f"  {r['domain']:<28} {dns_icon}{gh_icon}    {ssl_icon}{ssl_str:<6}  {http_icon}      {status_str}")
        if r["issues"]:
            alerts.append(r)

    print(f"\n  {healthy_count}/{len(results)} domains healthy")

    if alerts:
        print(f"\n⚠  ALERTS:")
        alert_lines = []
        for r in alerts:
            line = f"  🔴 {r['domain']}: {', '.join(r['issues'])}"
            print(line)
            alert_lines.append(line)
        tg_msg = (f"🚨 *Empire Health Alert*\n"
                  f"{datetime.datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC')}\n\n"
                  + "\n".join(alert_lines))
        send_telegram(tg_msg)
    else:
        print(f"\n  All systems nominal. 🟢")
        send_telegram("✅ *Empire health check passed* — all domains nominal.")

    print()


def main():
    parser = argparse.ArgumentParser(description="Empire domain health checker")
    parser.add_argument("--json",   action="store_true", help="JSON output")
    parser.add_argument("--domain", metavar="DOMAIN",    help="Check one domain only")
    args = parser.parse_args()

    targets = EMPIRE_DOMAINS
    if args.domain:
        targets = [{"domain": args.domain, "company": "—", "repo": "—"}]

    results = []
    for entry in targets:
        if not args.json:
            print(f"  Checking {entry['domain']}...", end="", flush=True)
        r = check_domain(entry)
        results.append(r)
        if not args.json:
            print("\r", end="")

    print_report(results, json_mode=args.json)

    # Exit 1 if any domain unhealthy (for CI)
    sys.exit(0 if all(r["healthy"] for r in results) else 1)


if __name__ == "__main__":
    main()
