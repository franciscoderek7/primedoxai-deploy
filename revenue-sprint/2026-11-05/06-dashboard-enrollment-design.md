# DASHBOARD PASSWORD ENROLLMENT — DESIGN PROPOSAL

Date: 2026-11-05 · Status: **DESIGN ONLY — nothing implemented, deployed, committed or pushed**
Inspected: `056ac19` on `claude/revenue-intake-review`

---

## 0. THE BLOCKING FACT

> **Everything you have specified requires a server. The dashboard has none, and
> its current hosting cannot run one.**

`francisco-holdings-site/` is deployed by `deploy-francisco-holdings.yml:32-90`:
clone `franciscoderek7/francisco-holdings`, copy static files, write
`CNAME: franciscoholdingsinc.com`, `git push origin main`. That is **GitHub
Pages serving static files**. GitHub Pages executes no server-side code — no
Argon2id hashing, no sessions, no rate limiting, no enrollment authorization.

So this is not a code task first. **It is a hosting decision**, and it is the one
thing I need from you before writing a line.

### Three options

| | Where the dashboard lives | Auth possible? | Reach |
|---|---|---|---|
| **A — recommended** | behind `avatar-lab/server.js` (Express, already exists) | **Yes, fully** | **localhost only** — already binds `127.0.0.1` (`server.js:12,157`) |
| B | behind `agents/backend/server.js` | Yes | currently **all interfaces**; needs the loopback + webhook fixes first |
| C | stay on GitHub Pages | **No** | public |

**I recommend A.** An executive command centre showing live revenue, council
proposals and system health has no business being on the public internet. And
`avatar-lab` is already the panel foundation, already enforces the authority
gate server-side, and already binds loopback. The password then protects against
someone at your machine — which is the realistic threat for a local tool —
rather than pretending to protect a public page.

**Option C cannot satisfy your requirements.** If you choose it, the honest move
is to **remove the gate entirely** rather than ship a login screen that implies
protection it cannot provide.

---

## 1. EXISTING AUTHENTICATION CODE — INSPECTED

### `francisco-holdings-site/dashboard-v3/cisco1170.js` (119 lines)

```js
:3   var CODE = '<REDACTED — see the file>';          // the secret, in the delivered file
:4   var SK = 'cc_v3_auth';           // localStorage session key
:5   var LK = 'cc_v3_lock';           // localStorage lockout key
:6   var TTL  = 86400000;             // 24h session
:7   var LOCK = 300000;               // 5min lockout
:42  if (isAuthed()) return;
:44  document.documentElement.style.visibility = 'hidden';
:100 if (input.value.trim() === CODE) { ... }
```

**What is worth keeping:** the 24-hour TTL, the 5-minute lockout, and the
overall shape (gate mounts, hides the page, unhides on success). The *concept*
is right.

**What is fatally wrong:**
1. **`CODE` is in the file the browser downloads.** View Source defeats it.
2. **Comparison happens client-side** (`:100`), so even without reading the
   source, `localStorage.setItem('cc_v3_auth', JSON.stringify({exp: Date.now()+1e9}))`
   in the console grants access — `isAuthed()` at `:9-14` trusts it completely.
3. **The lockout is in the attacker's own `localStorage`** (`:34-36`).
   `localStorage.removeItem('cc_v3_lock')` clears it.
4. **`visibility:hidden` is not protection.** The page's full HTML is already
   delivered; it is hidden, not withheld.

### `francisco-holdings-site/empire-dashboard.html:579`

A second, **different** secret — `const PW = '…'` — same client-side pattern,
same page-source exposure. Both files are live at franciscoholdingsinc.com.

### `agents/access-guard.js` (175 lines, CDN-served from `@main` to 6 pages)

Compares `val === cfg.code` where the calling page supplies `cfg.code` — which
is *why* the secrets end up in page source. It does implement lockout and
session keys properly; the architecture is the problem, not the craft.

**Conclusion: there is no server-side authentication anywhere in the dashboard
stack today. There is nothing to extend — this is a new build on a server.**

---

## 2. CORRECTION — THE DASHBOARD IS NOT 3D

You asked to keep the "3D holographic dashboard experience." Measured:

| File | three.js refs | WebGL | `<canvas>` | "holo*" |
|---|---|---|---|---|
| `dashboard-v3/index.html` | **0** | **0** | **0** | **0** |
| `empire-dashboard.html` | **0** | **0** | **0** | **0** |
| `claude-empire-dashboard.html` | 0 | 0 | 2 | 0 |
| `skyscraper-3d.html` | **1** | 0 | 0 | 0 |

`dashboard-v3/` is a **CSS dashboard** — no 3D, no WebGL, no holographic
shader. The only three.js page in the repository is `skyscraper-3d.html`, which
is a separate skyscraper visualisation.

What *does* create the "holographic" impression in `dashboard-v3/` is the
palette and type, from `empire-v3.css`:

```
--void #050508   --surface #0A0A12   --card #11111A
--gold #C9B896   --cyan  #00D4FF     --green #00FF88
--red  #FF3300   --purple #9D4EDD    --text #F0EAE0
fonts: Orbitron (HUD), plus body and code families
```

plus 4 glow/gradient/blur rules. The existing gate already matches this:
`#050508` background, Orbitron, cyan `#00D4FF` borders, gold `#C9B896` text,
red `#FF3300` errors, 4–6px letter-spacing.

**So "keep the experience" is achievable and cheap** — the enrollment screen
reuses those exact tokens. I am flagging the mismatch so you are not told later
that a 3D engine was preserved when there was never one. **If you want actual
3D, that is a separate piece of work.**

---

## 3. HOW YOU SECURELY ACTIVATE ENROLLMENT

This is the part your requirements rightly insist on: *"Do not allow someone who
merely visits the dashboard to claim the administrator account."*

**Mechanism: a one-time enrollment token the server mints at startup and prints
to the terminal you started it in.**

```
$ node avatar-lab/server.js

  FHI EXECUTIVE WAR ROOM — http://127.0.0.1:8787
  ────────────────────────────────────────────────────────
  NO ADMINISTRATOR ENROLLED.
  Enrollment token (valid 15 minutes, single use):

      7f3c1e9a4b86d05fa2c7e81b35904d6e

  Open  http://127.0.0.1:8787/admin/enroll?t=7f3c1e9a...
  ────────────────────────────────────────────────────────
```

Properties:

- **32 bytes from `crypto.randomBytes(32)`**, hex-encoded. Not guessable.
- **Printed to stdout only**, and written to `./.fhi-enroll-token` with mode
  `0600`. A web visitor cannot read either. **Possession requires access to the
  machine and the terminal session** — which is the correct authorization for
  claiming the admin account on a local tool.
- **Single use.** Consumed on the first successful enrollment.
- **15-minute expiry.** After that, restart the server for a fresh one.
- **Compared in constant time** (`crypto.timingSafeEqual`).
- **Never logged after the banner**, never echoed in an HTTP response, never
  placed in the page.
- If a record already exists, **no token is minted and the banner is not
  printed.**

Why not the alternatives: an email link needs a mail service and an inbox you
have already told me not to route things through; a hardcoded bootstrap password
is the problem we are fixing; "first visitor wins" is exactly what you forbade.

---

## 4. STATE MACHINE

```
┌─ UNPROVISIONED ──────────────────────────────────────────────┐
│  no admin record on disk                                     │
│  GET  /admin/enroll?t=<token>  → setup screen (3 fields)     │
│                                  401 if token bad/expired    │
│  POST /admin/enroll            → see §5                      │
│  every dashboard route         → 503 "not enrolled"          │
└──────────────────────────┬───────────────────────────────────┘
                           │ first successful enrollment
                           ▼
┌─ PROVISIONED (permanent) ────────────────────────────────────┐
│  GET  /admin/enroll            → 404  (route ceases to exist)│
│  POST /admin/enroll            → 404  (even with a token)    │
│  GET  /admin/login             → one password field          │
│  POST /admin/login             → session cookie on success   │
│  every dashboard route         → requires a valid session    │
└──────────────────────────────────────────────────────────────┘
```

The transition is **one-way and atomic**. Enrollment writes the record with
`fs.writeFileSync(path, data, {flag:'wx', mode:0o600})` — `wx` fails if the file
exists, so two concurrent enrollment requests cannot both win, and a second
attempt after provisioning cannot overwrite.

---

## 5. ENROLLMENT — THE THREE FIELDS

**Screen:** three `<input type="password">` fields — *Choose password*,
*Confirm password*, *Confirm again* — in the existing palette and Orbitron type.

**Client:** compares the three only to show inline feedback. It is a convenience,
**never the check**.

**Server, in this order:**

```
POST /admin/enroll   { token, p1, p2, p3 }

 1. state must be UNPROVISIONED            else 404
 2. timingSafeEqual(token, expected)        else 401   (and consume nothing)
 3. token not expired                       else 401
 4. p1 === p2 === p3, all three present     else 400 "entries do not match"
       ← re-checked server-side so a crafted request cannot skip it
 5. length >= 12                            else 400
 6. reject the two previously exposed values explicitly, by hash comparison
                                            else 400 "previously exposed"
 7. hash = argon2id(p1, {memoryCost: 65536, timeCost: 3, parallelism: 1})
 8. write { hash, created_at, algo } with flag 'wx', mode 0600
 9. consume the token; delete .fhi-enroll-token
10. issue a session; redirect to the dashboard
11. zero p1/p2/p3 from memory; never log any of them
```

Step 4 is the direct answer to your requirement: **three matching entries of one
password, verified by the server**, not three different passwords and not a
client-side-only comparison.

Step 6 is the direct answer to *"do not reuse the previously exposed hardcoded
password."* Both exposed values are compared **by hash**, so the plaintext never
enters the new codebase.

---

## 6. SUBSEQUENT SIGN-INS

| Control | Design |
|---|---|
| Fields | **one** password field |
| Verification | `argon2.verify(storedHash, submitted)` — constant time by construction |
| Session | `crypto.randomBytes(32)` id, server-side store, cookie `HttpOnly; Secure; SameSite=Strict; Path=/` |
| Expiry | 24h absolute (matching today's TTL), 2h idle, renewed on activity |
| Rate limit | 5 attempts / 15 min / IP, then a 15-min lockout **held server-side** — not in the visitor's `localStorage` |
| Brute force | Argon2id's own cost (~100ms/attempt) plus the limiter; failures logged with timestamp and IP, **never with the attempted password** |
| Logout | invalidates the session server-side, not just the cookie |
| Hash exposure | the hash **never** leaves the server — no endpoint returns it, it is not in any response, page or log |

### Recovery — unauthenticated visitors cannot trigger it

**There is no web-reachable reset.** Recovery requires machine access:

```bash
# 1. stop the server
# 2. move the record aside (do not delete — keep it)
mv .fhi-admin.json .fhi-admin.json.revoked-$(date +%Y%m%d-%H%M%S)
# 3. restart; the server returns to UNPROVISIONED and prints a fresh token
node avatar-lab/server.js
```

Filesystem access *is* the authentication. No email, no security questions, no
reset endpoint — nothing an unauthenticated visitor can reach, because the
mechanism is not on the network at all. The old record is preserved, not
destroyed.

---

## 7. ACCESSIBILITY — two existing problems to fix, not inherit

1. **`cisco1170.js:44` sets `document.documentElement.style.visibility='hidden'`.**
   With JavaScript disabled or broken, the visitor gets a **blank white page**
   with no explanation. The new gate must render a server-side page, so there is
   nothing to hide and nothing to break.
2. **Contrast.** The existing `#444` on `#050508` ("RESTRICTED ACCESS" line) is
   roughly **2.2:1** — well below the WCAG AA minimum of 4.5:1 for body text.
   `--muted #5A5550` on `--void #050508` is about **3.2:1**, also short.
   **The enrollment screen will use `--text #F0EAE0` or `--gold #C9B896` for all
   instructional copy**, keeping the dim tones for decoration only.

Also: real `<label>` elements (not placeholder-only), `autocomplete="new-password"`
on all three enrollment fields and `autocomplete="current-password"` on login,
`aria-live="polite"` for the match indicator and `aria-live="assertive"` for
errors, visible focus rings at ≥3:1, full keyboard operation, and a
`prefers-reduced-motion` guard on any glow animation.

---

## 8. FILES TO CHANGE

Assuming **Option A**. Nothing below is written yet.

**New — server side**

| File | Purpose |
|---|---|
| `…/avatar-lab/auth/enrollment.js` | token mint/verify/consume; state detection |
| `…/avatar-lab/auth/credentials.js` | Argon2id hash + verify; atomic `wx` record write |
| `…/avatar-lab/auth/sessions.js` | session create/validate/expire/invalidate |
| `…/avatar-lab/auth/rate-limit.js` | server-side attempt counter and lockout |
| `…/avatar-lab/views/enroll.html` | three-field screen, existing palette |
| `…/avatar-lab/views/login.html` | one-field screen |

**Modified**

| File | Change |
|---|---|
| `…/avatar-lab/server.js` | mount `/admin/enroll`, `/admin/login`, `/admin/logout`; require a session on all other routes; print the startup banner |
| `…/avatar-lab/index.html` | served only behind a session; drop any client-side gate |

**Removed from the deployed site** (separate change, your authorization)

| File | Action |
|---|---|
| `francisco-holdings-site/dashboard-v3/cisco1170.js` | delete, and remove the `<script>` at `dashboard-v3/index.html:8` |
| `francisco-holdings-site/empire-dashboard.html:579` | delete the `const PW` line and its gate |

**Untouched:** `empire-v3.css`, `empire-v3.js`, `gap-hunter.js`,
`stripe-checkout.js`, `agents/access-guard.js` (used by 6 other pages — a
separate decision), and all 17 held working-tree changes. **C3 stays on HOLD.**

**New dependency:** `argon2` (native) or `@node-rs/argon2` (prebuilt, usually
easier). `bcrypt` at cost ≥ 12 is an acceptable fallback. **I have installed
nothing** — the assignment forbids it.

---

## 9. SECURITY TESTS — to be written with the implementation

Offline, `node:test`, no network, fictional passwords only.

**Enrollment authorization**
1. `GET /admin/enroll` with **no** token → 401
2. with a **wrong** token → 401, and the real token is **not** consumed
3. with an **expired** token → 401
4. token compared in constant time (no early return on first mismatched byte)
5. no token is minted when a record already exists
6. the token never appears in any HTTP response body or header

**The three fields**
7. `p1===p2===p3` → enrolled
8. `p1 !== p3` (third differs) → 400, **no record written**
9. only `p1` sent, `p2`/`p3` omitted → 400 *(the client-side check cannot be skipped)*
10. password < 12 chars → 400
11. **either previously exposed value → 400 "previously exposed"**
12. plaintext appears in no log, no response, no file — asserted by scanning both

**One-way transition**
13. second `POST /admin/enroll` after success → 404, **even with a valid token**
14. `GET /admin/enroll` after success → 404
15. two concurrent enrollments → exactly **one** succeeds (`wx` flag)
16. dashboard routes in UNPROVISIONED state → 503, never content

**Login and sessions**
17. correct password → session cookie with `HttpOnly`, `Secure`, `SameSite=Strict`
18. wrong password → 401, **no cookie**, no distinction between "no admin" and "wrong password"
19. 6th attempt within 15 min → locked out
20. **clearing browser storage does not clear the lockout** *(the negative control for today's defect)*
21. **forging `localStorage` grants nothing** *(the other negative control)*
22. expired session → 401
23. idle timeout honoured
24. logout invalidates server-side, so the old cookie fails
25. the hash is returned by no endpoint

**Governance — must still hold afterwards**
26. council suite still 27/27
27. all five authority flags still default `false`
28. `POST /api/council` still returns `mode:"proposal-only"`, `humanApprovalRequired:true`

**Tests 20 and 21 matter most.** They are the negative controls: both **pass
trivially against today's client-side gate** — which is precisely why today's
gate is worthless, and why the suite must demonstrate the new one fails them.

---

## 10. WHAT I NEED FROM YOU

| # | Decision |
|---|---|
| **1** | **Option A, B or C?** Nothing can be built until this is settled. A = local-only behind `avatar-lab`, my recommendation. |
| **2** | **Rotate both exposed credentials now.** Independent of this work, and only you can. They are live in page source today. |
| 3 | Confirm "3D holographic" means the `empire-v3.css` palette and Orbitron type, not a 3D engine — see §2. |
| 4 | `argon2` / `@node-rs/argon2` / `bcrypt`? One new dependency either way. |
| 5 | 24h absolute + 2h idle session, matching today's TTL — or different? |
| 6 | Accept filesystem-based recovery (§6), or do you want a second mechanism? |
| 7 | Remove the two client-side gates from the deployed site in the same change, or separately? |

**Nothing is implemented. No file was modified, no dependency installed, no
service started, nothing committed, pushed or deployed.** 17 held changes
preserved; C3 on HOLD.
