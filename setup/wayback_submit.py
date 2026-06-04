#!/usr/bin/env python3
"""
Wayback Machine — Auto Submit Empire URLs to Archive.org
=========================================================
Submits all empire URLs to web.archive.org/save/ for preservation.
Handles rate limiting and returns confirmation links.

    python3 setup/wayback_submit.py
    python3 setup/wayback_submit.py --url https://ccldr.net  # single URL

No API key required — Wayback Machine Save API is public.
"""

import sys, time, datetime, argparse, requests

EMPIRE_URLS = [
    # Priority — CCLDR under DNS transfer
    "https://ccldr.net",
    "https://ccldr.net/index.html",
    "https://ccldr.net/charged.html",
    "https://ccldr.net/pricing.html",
    "https://ccldr.net/documents.html",
    "https://ccldr.net/partnerships.html",
    "https://ccldr.net/law.html",
    "https://ccldr.net/defense.html",
    "https://ccldr.net/history.html",
    "https://ccldr.net/glossary.html",
    "https://ccldr.net/guides.html",

    # GitHub Pages fallbacks
    "https://franciscoderek7.github.io/ccldr-website/",
    "https://franciscoderek7.github.io/primedoxai-deploy/ccldr-site/",
    "https://franciscoderek7.github.io/kiaros-deploy/ccldr-site/",

    # Live empire sites
    "https://omniaguard.com",
    "https://kiaros.dev",
    "https://cleanswarm.com",
    "https://franciscoholdingsinc.com",
    "https://techpetcage.com",
]


def submit_url(url, session):
    """Submit a URL to Wayback Machine. Returns (success, archive_url, message)"""
    save_url = f"https://web.archive.org/save/{url}"
    try:
        r = session.get(
            save_url,
            headers={
                "User-Agent": "EmpireArchiveBot/1.0 (franciscoderek7@gmail.com)",
            },
            timeout=30,
            allow_redirects=True,
        )
        # Wayback returns 200 with Content-Location header on success
        content_loc = r.headers.get("Content-Location", "")
        if content_loc:
            archive_url = f"https://web.archive.org{content_loc}"
            return True, archive_url, "saved"
        if r.status_code == 200:
            return True, f"https://web.archive.org/web/*/{url}", "queued"
        if r.status_code == 429:
            return False, "", "rate-limited (wait 60s)"
        if r.status_code == 523:
            return False, "", "origin unreachable"
        return False, "", f"status {r.status_code}"
    except requests.Timeout:
        return False, "", "timeout"
    except Exception as e:
        return False, "", str(e)[:60]


def main():
    parser = argparse.ArgumentParser(description="Submit empire URLs to Wayback Machine")
    parser.add_argument("--url", metavar="URL", help="Submit a single URL")
    parser.add_argument("--delay", type=float, default=4.0, help="Seconds between requests (default 4)")
    args = parser.parse_args()

    targets = [args.url] if args.url else EMPIRE_URLS

    print(f"\n{'='*60}")
    print(f"  WAYBACK MACHINE — EMPIRE PRESERVATION")
    print(f"  {datetime.datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC')}")
    print(f"  Submitting {len(targets)} URLs (delay: {args.delay}s each)")
    print(f"{'='*60}\n")

    session  = requests.Session()
    saved    = []
    failed   = []
    retry_q  = []

    for i, url in enumerate(targets):
        print(f"  [{i+1:02d}/{len(targets):02d}] {url[:55]:<55}", end="", flush=True)
        ok, archive_url, msg = submit_url(url, session)

        if ok:
            print(f"  ✓ {msg}")
            saved.append({"url": url, "archive": archive_url})
        else:
            print(f"  ✗ {msg}")
            failed.append({"url": url, "reason": msg})
            if "rate-limited" in msg:
                print(f"       ⏳ Rate limited — waiting 65s...")
                time.sleep(65)
                # Retry once
                ok2, au2, msg2 = submit_url(url, session)
                if ok2:
                    print(f"       ✓ Retry succeeded: {msg2}")
                    saved.append({"url": url, "archive": au2})
                    failed.pop()
                else:
                    print(f"       ✗ Retry failed: {msg2}")

        if i < len(targets) - 1:
            time.sleep(args.delay)

    # Summary
    print(f"\n{'='*60}")
    print(f"  PRESERVATION SUMMARY")
    print(f"{'='*60}")
    print(f"\n  ✓ Archived: {len(saved)}/{len(targets)}")
    print(f"  ✗ Failed:   {len(failed)}")

    if saved:
        print(f"\n  Archive links:")
        for s in saved[:8]:
            print(f"    {s['archive']}")
        if len(saved) > 8:
            print(f"    ... and {len(saved)-8} more")

    if failed:
        print(f"\n  Failed URLs:")
        for f in failed:
            print(f"    ✗ {f['url']} — {f['reason']}")

    print(f"\n  Verify at: https://web.archive.org/web/*/ccldr.net\n")


if __name__ == "__main__":
    main()
