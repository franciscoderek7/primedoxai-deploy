# LIVE SITE AUDIT — omniaguard.com

Date: 2026-11-02
Source: `franciscoderek7/omniaguard` @ `48069977204e2228e5d109f64aa7f957df3a1868`
Commit message: `🔥 FORCE RESET — OmniAGuard`
CNAME: `omniaguard.com`
Read-only shallow clone. Nothing pushed. This repo cannot be pushed to from
this session (read access only).

**This is the first audit of what omniaguard.com actually serves.** Every
previous report described `omniaguard-site/` in the monorepo. That folder is
**not** what is live.

---

## 1. THE LIVE SITE IS A 3-PAGE STUB, NOT THE 31-PAGE SITE

| | pages |
|---|---|
| `primedoxai-deploy/omniaguard-site/` (audited in every prior report) | **31 HTML files** |
| **`franciscoderek7/omniaguard` — what omniaguard.com serves** | **3 HTML files** (`index.html` 38 lines, `devices.html`, `vpn.html`) |

Consequence: **the 25 `paypal.me/derekfranciaco1` links found in
`omniaguard-site/` are NOT live.** The live site contains **zero** PayPal links
and zero payment of any kind. Every purchase button on all three live pages
reads **"🔒 Coming Soon"**. Nothing on omniaguard.com can be bought.

---

## 2. CRITICAL — THE DEPLOY GATE WAS BYPASSED

`deploy-omniaguard.yml` contains a gate that **fails the build** on personal
info:

```yaml
- name: Verify no personal info leaked
  run: |
    LEAKS=$(grep -rn "<four prohibited literals — redacted; see the workflow source>" \
            omniaguard-site/ --include="*.html" | wc -l)
    if [ "$LEAKS" -gt 0 ]; then echo "FAIL: Personal info found in source"; exit 1; fi
```

**And the live site violates it anyway.** `index.html:34`:

```html
<a href="mailto:franciscoderek7@gmail.com?subject=OmniAGuard Enterprise Inquiry"
   class="btn">🛡️ REQUEST ACCESS</a>
```

The gate works. It was **circumvented by a direct force-push to the deploy
repo** — hence the commit message `🔥 FORCE RESET`. The content never passed
through the workflow.

**This is a governance finding, not just a content one:** the empire's
zero-bleed protection depends on workflows that can be bypassed by pushing
straight to the deploy target. Every one of the 28 clone-replace-push workflows
has the same hole.

### Zero-bleed violations now live on an anonymous Loop-B brand

CLAUDE.md: *OMNIAGUARD — Personal Info Visible: **NO — anonymous**. AI
Branding: **Hidden**.*

| Line | Content | Rule broken |
|---|---|---|
| `index.html:34` | `mailto:franciscoderek7@gmail.com` | personal info on an anonymous brand |
| `index.html:36` | "**Francisco Holdings Inc.** © 2026 Phoenix Dominion \| Floor 2 of 392 \| Monitored by **PrimeDox AI Swarm**" | Loop-A parent named; AI branding exposed |
| `devices.html`, `vpn.html` footers | "Floor 2, **FHI Tower**" linking to `franciscoholdingsinc.com` | Loop-A linkage from Loop-B |

---

## 3. CRITICAL — THE BRAND IS MISSPELLED IN THE LIVE PAGE TITLES

CLAUDE.md lists **`OmniAGuard` as explicitly forbidden**. Correct is
`OMNIAGUARD` for display and `OmniGuard` in sentences.

Live occurrences — **in the `<title>` tags, which is what search engines
index**:

- `index.html:6` — `<title>OmniAGuard | Agentic AI Cybersecurity</title>`
- `devices.html` — `<title>OmniAGuard Device Shield | ...` + `<h1>OmniAGuard</h1>`
- `vpn.html` — `<title>OmniAGuard GhostVPN | ...` + `<h1>OmniAGuard</h1>`
- the commit itself — `🔥 FORCE RESET — OmniAGuard`

`deploy-omniaguard.yml` also has a spelling gate ("PASS: OMNIAGUARD spelling
check complete"). Same bypass.

---

## 4. HIGH — FABRICATED AND UNVERIFIABLE CLAIMS, LIVE RIGHT NOW

The claim-removal work reported as done was against the **monorepo folder**.
The live site was never cleaned, and its claims are **worse**.

| File | Claim | Problem |
|---|---|---|
| `index.html:24` | "**WORLD'S FIRST** AGENTIC AI CYBERSECURITY — PHOENIX DOMINION" | superlative market claim, unsupportable |
| `devices.html` | "monitored 24/7 by **12,847 AI agents**" | a specific fabricated number |
| `vpn.html` | "Monitored by **12,847 autonomous agents**" | same number reused |
| `vpn.html` | "**Zero-log policy — verified**" and "**Zero-log verified.** No traffic data retained." | the exact class of contractual/legal claim reported as removed. No VPN service exists to audit |
| `vpn.html` | Uptime "**99.99%**", "**847** Active Nodes" | no service, no measurement |
| `devices.html` | "All monitoring is client-authorized." | there is no monitoring |

### The two fake live telemetry widgets are the worst of it

**`devices.html` — "🔴 Live Threat Monitor — Your Devices"** ships hardcoded
entries about devices the visitor does not own:

```
[SECURE]  iPhone 14 Pro — iOS 17.6.1 — No threats
[SECURE]  MacBook Pro — macOS 14.6 — Firewall active
[WATCH]   Smart TV — Firmware outdated — Update queued
[SECURE]  Router — ASUS AX6000 — Intrusion detection on
[BLOCKED] Unknown device — IP 192.168.1.47 — Quarantined
```

and then a `setInterval` injects a **random** line from a fixed array every 4
seconds, each stamped with `new Date().toLocaleTimeString()` so it reads as live
telemetry:

```js
setInterval(()=>{ ... const line = threats[Math.floor(Math.random()*threats.length)];
  const time = new Date().toLocaleTimeString(); ... }, 4000);
```

**`vpn.html` — "⚡ Speed Test — AI-Optimized Routing"** randomises latency and
throughput every 2 seconds:

```js
setInterval(()=>{
  document.getElementById('latency').innerText=(Math.floor(Math.random()*20)+5)+'ms';
  document.getElementById('throughput').innerText=(Math.random()*3+1).toFixed(1)+' Gbps';
},2000);
```

A visitor is shown randomised numbers presented as a real speed test of a
product that does not exist. Both widgets are sitting on a **public, live
security-vendor site**. This is the most serious truthfulness problem found
anywhere in this engagement — on the brand whose entire proposition is trust.

---

## 5. MEDIUM — BROKEN NAV AND A PUBLISHED BACKUP

- All three pages' nav links to **`./crypto.html`**, which **does not exist** in
  the repo. Every visitor clicking "Crypto" gets a 404.
- **`index.html.AUG15.backup` is published** and publicly fetchable at
  `omniaguard.com/index.html.AUG15.backup`.

---

## 6. WHAT THIS MEANS FOR AUTH-2

The pending request was: *"Commit + push `omniaguard-site/` to main → deploys to
omniaguard.com."*

That would **replace this 3-page stub with the 31-page monorepo site.** Not a
patch — a wholesale site replacement.

**It would fix:** the personal-info leak, the `OmniAGuard` misspelling, the fake
telemetry widgets, the broken `crypto.html` link, the published backup file.
The workflow's gates would also run for the first time.

**It would introduce:** the monorepo folder's own unfixed problems — the
fabricated "2.4B+ threats blocked / 99.97% uptime" stats
(`omniaguard-site/index.html:10,14,428,429`), the contractual guarantee claims
across 7 files (`omniaguard-v3.html:6,1296,1366,1480,1591`), and **25
`paypal.me/derekfranciaco1` links** on a handle recorded as retired.

**It would also fail the build as things stand.** `omniaguard-site/` is clean of
personal info (0 hits, verified), so that gate passes — but the fabricated
stats and guarantee claims are still in the source, and those are the edits the
context dump claims were made. **They do not exist in this repository.**

### Recommendation

**Do not push `omniaguard-site/` yet.** Clean the source first — fabricated
stats, guarantee claims, and the 25 payment links — then deploy through the
workflow so the gates actually run. One deploy, verified, instead of trading one
set of false claims for another.

**Separately and more urgently:** the live site is making fabricated security
claims and showing fake telemetry *today*. If you want that stopped before the
full site is ready, the minimal action is to replace the three live pages with an
honest holding page. That requires a push to `franciscoderek7/omniaguard`, which
**this session cannot do** (read access only) and which needs your
authorization regardless.

---

## 7. VERIFICATION LOG

| Check | Result |
|---|---|
| Clone HEAD | `48069977204e2228e5d109f64aa7f957df3a1868` |
| `remote get-url origin` | `https://github.com/franciscoderek7/omniaguard` ✅ |
| CNAME | `omniaguard.com` |
| Live HTML files | 3 (plus `index.html.AUG15.backup`, `docs/`) |
| `2.4B` / `99.97%` on the live site | **0 occurrences** — the monorepo stats are not live |
| "zero prompt injection" / "backed contractually" live | **0 occurrences** |
| `paypal.me/*` live | **0 occurrences** |
| `franciscoderek7@gmail` live | **1** — `index.html:34` ⚠ |
| `OmniAGuard` (forbidden) live | **4** — all three `<title>`s + 2 `<h1>`s ⚠ |
| `sk_live_` / `rk_live_` live | **0** ✅ |
| Nothing written, committed or pushed | ✅ |
