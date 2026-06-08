# Super Highway — Identity Loop Implementation Guide
**Phase 1 Deliverable 6 of 7 — June 6, 2026**

Zero cross-contamination between Loop A (Derek-identity brands) and Loop B (anonymous brands) is the single most critical technical constraint in this system. This guide covers every layer where isolation must be enforced, and the exact mechanism at each layer.

---

## 1. The Core Problem

A user who buys CCLDR Warrior access and OmniaGuard Guardian access must never have those two facts algorithmically linked — not in analytics, not in ads retargeting, not in a database query, not in an error log. One set of facts could expose Derek Francisco to cross-brand contamination (e.g., a court adversary correlating OmniaGuard with CCLDR). The other could deanonymize what was supposed to be an anonymous security product purchase.

This isn't a privacy preference — it's a business-critical and potentially legally material requirement.

---

## 2. Infrastructure Separation (Layer 0 — Hardest Boundary)

**Three separate Supabase projects:**
- `fhi-hub` — hub sessions, cart, module registry, affiliate system. No PII.
- `fhi-loop-a` — all Loop A user data, orders, subscriptions, course progress.
- `fhi-loop-b` — all Loop B user data, orders, subscriptions, audit requests.

**Why separate projects and not separate schemas?**
Separate schemas in one Postgres instance share: connection credentials, pg_stat statements (query logs), backup files, Supabase dashboard access, and service role keys. A single credential leak or dashboard access grants cross-loop data visibility. Separate projects eliminate this: separate API URLs, separate anon keys, separate service role keys, separate backups, separate dashboards.

**Network isolation:**
- Loop A project's API URL is only called by hub edge functions with Loop A service key.
- Loop B project's API URL is only called by hub edge functions with Loop B service key.
- Neither loop project is ever called directly by client-side code — all access goes through hub Edge Functions that enforce authZ.

---

## 3. Authentication Separation (Layer 1)

**No shared auth session between loops.**

When a user signs up for both a Loop A and a Loop B property, they create two independent auth identities — `user_a_id` in the Loop A Supabase project and `user_b_id` in the Loop B project. These may share the same email address, but that link is never stored in any queryable index.

**The Hub's role in SSO:**
1. Hub session has a UUID (`hub_session_id`) with no PII.
2. When a user authenticates to Loop A, the hub:
   - Fetches the Loop A JWT from Loop A's Supabase
   - Stores an **encrypted** reference (`loop_a_ref_encrypted`) on the hub session
   - The encryption key is NOT stored in the hub DB — it's a Supabase Vault secret accessed only at runtime
3. Same for Loop B.
4. The hub never stores: a plaintext mapping of `(loop_a_user_id, loop_b_user_id)`, or `(email, loop_a_user_id)`, or any join that would let a query cross loops.

**Cookie separation:**
```
Loop A: cookie name = __loop_a_rt  (httpOnly, Secure, SameSite=Lax, Domain=.franciscoholdings.com)
Loop B: cookie name = __loop_b_rt  (httpOnly, Secure, SameSite=Lax, Domain=.franciscoholdings.com)
Hub:    cookie name = __hub_rt     (httpOnly, Secure, SameSite=Lax, Domain=.franciscoholdings.com)
```

These cookies are never read by client-side JS (`httpOnly`). The hub server reads them independently. A browser dev-tools inspection reveals three separate opaque tokens — no cross-loop data visible.

---

## 4. Database-Level Isolation (Layer 2)

**No foreign keys across loops.** The `hub_orders` table references `loop_a_order_ref` and `loop_b_order_ref` as raw UUIDs — **not** as FK constraints pointing at the loop databases. This is intentional: the hub cannot JOIN into loop tables.

**No cross-loop queries.** Hub Edge Functions that need Loop A data call the Loop A Supabase API. Those that need Loop B data call the Loop B Supabase API. No Edge Function is ever given both service keys simultaneously.

**Service role key storage:**
```
Supabase Vault — fhi-hub project:
  LOOP_A_SERVICE_KEY  = "eyJ..." (Loop A service role key)
  LOOP_B_SERVICE_KEY  = "eyJ..." (Loop B service role key)
```

The vault enforces: only named Edge Functions can retrieve each key, and only at invocation time. The keys do not appear in environment variables visible to the dashboard.

**Row-Level Security as defense-in-depth:**
Every table in every project has RLS enabled with a default-deny policy. Even if a bug in an Edge Function passes the wrong JWT, Postgres will reject the query.

```sql
-- Default deny on all tables (set once per project)
CREATE POLICY "default_deny" ON users_a FOR ALL USING (false);
-- Then selectively allow:
CREATE POLICY "self_read"    ON users_a FOR SELECT USING (auth.uid() = id);
CREATE POLICY "self_update"  ON users_a FOR UPDATE USING (auth.uid() = id);
-- Service role bypasses RLS (this is Supabase's built-in behavior — service role is never sent to the browser)
```

---

## 5. Analytics Separation (Layer 3)

| Property | Analytics Stack | Why |
|---|---|---|
| Loop A properties (CCLDR, PrimeDox, Weedlaw Ed, Francisco Holdings, CCC) | Google Analytics 4 + Plausible | GA4 is acceptable because Derek's identity is already public on these sites; cross-property linking is desired for funnel optimization |
| Loop B properties (OmniaGuard, Kiaros, SoulStack, CleanSwarm, etc.) | Plausible (privacy-first) only — NO Google Analytics | GA4 cross-device fingerprinting could theoretically link anonymous Loop B behavior to a Google identity; Plausible has no cookies, no fingerprinting, no cross-site tracking |

**Loop B analytics implementation:**
```html
<!-- Paste this on ALL Loop B sites — NOT Loop A -->
<script defer data-domain="omniaguard.com" src="https://plausible.io/js/script.js"></script>
<!-- NOTE: data-domain must match the specific site — do not use a shared domain key across Loop B sites,
     as that would aggregate Loop B events into a single queryable dataset that could be subpoenaed -->
```

**Loop A analytics implementation:**
```html
<!-- GA4 — Loop A sites only -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-LOOP_A_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-LOOP_A_ID', { 'send_page_view': true });
</script>
<!-- Plausible also (for privacy-respecting aggregate view) -->
<script defer data-domain="ccldr.net" src="https://plausible.io/js/script.js"></script>
```

**Cross-promo traffic (from Phase 2 traffic loop snippet) — CRITICAL:**
When a Loop A site cross-links to a Loop B site (only if explicitly authorized per CLAUDE.md):
- The link must be a plain `<a href>` with `rel="noopener noreferrer"` — no UTM parameters that carry user identity
- No `document.referrer` must be readable by the Loop B site (the `noreferrer` handles this)
- The Phase 2 snippet already handles this: all cross-loop links include `rel="noopener noreferrer"` by default

---

## 6. Email Separation (Layer 4)

Loop A emails: Sent from Derek's personal brand (e.g., `derek@ccldr.net`, `derek@primedoxai.com`)
Loop B emails: Sent from impersonal brand addresses (e.g., `team@omniaguard.com`, `hello@cleanswarm.ca`)

**Never use the same email sending account for both loops.** Dedicated email domains per loop, ideally separate SendGrid/Mailchimp/ConvertKit accounts so the subscriber lists are physically separate.

**Unsubscribe lists are separate.** A user unsubscribing from CCLDR emails must NOT unsubscribe them from OmniaGuard emails, and vice versa. They're independent subscriptions from the user's perspective.

---

## 7. Advertising Separation (Layer 5)

**Loop A:** May use Facebook Pixel, GA4 audiences, retargeting — Derek's identity is already public.

**Loop B:** NO tracking pixels that enable cross-site behavioral profiles. If running ads:
- Use first-party email lists only (no lookalike audiences derived from cross-site pixel data)
- Use contextual targeting only (keyword/topic targeting, not behavioral)
- No Facebook Pixel on Loop B properties (Facebook's cross-site tracking would link Loop B visitors to their Facebook identity, which could deanonymize the anonymous brand)

---

## 8. Error Logging and Observability Separation (Layer 6)

**Use separate Sentry or equivalent projects for each loop.** A unified error tracking project would see stack traces that contain user IDs from both loops in the same dashboard.

**Log retention policy:**
- Hub logs: 30 days (no PII — session UUIDs only)
- Loop A logs: 90 days
- Loop B logs: 30 days (shorter, by design — minimize data available to potential legal discovery)

**What to NEVER log:**
- Email addresses in plain text in any log
- Cross-loop session mappings
- IP addresses in plain text (hash them: `SHA256(ip + daily_salt)`)
- Payment card details (Stripe handles these — never touch them in code)

---

## 9. Enforcement Checklist — Per Module Deployment

Before a new module goes live, verify all of the following:

**Database:**
- [ ] Module's tables are in the correct loop's Supabase project (A or B)
- [ ] RLS is enabled on all module tables
- [ ] No FK references cross loop boundaries
- [ ] Service role key for this loop is in Vault, not in `.env` or code

**Authentication:**
- [ ] Module uses its loop's Supabase Auth (anon key), not the other loop's or the hub's
- [ ] Magic link emails send from the correct branded address
- [ ] Cookie names use the loop-prefixed convention (`__loop_a_rt` or `__loop_b_rt`)

**Analytics:**
- [ ] Loop B: Plausible only, correct `data-domain`, NO GA4, NO Facebook Pixel
- [ ] Loop A: GA4 + Plausible, correct property IDs
- [ ] No UTM parameters in cross-loop links (use plain URLs + `noreferrer`)

**Email:**
- [ ] Sending domain matches the module's brand (not Derek's personal addresses for Loop B)
- [ ] Unsubscribe list is module-specific

**Cross-promo content (if using Phase 2 traffic loop snippet):**
- [ ] Loop B config only cross-links to other Loop B modules (never to CCLDR, PrimeDox, Weedlaw Ed, or Francisco Holdings)
- [ ] Loop A config only cross-links to other Loop A modules (never to OmniaGuard, Kiaros, SoulStack, CleanSwarm)

**Advertising:**
- [ ] Loop B: No tracking pixels, contextual-only ad targeting
- [ ] Loop A: Pixels acceptable, retargeting acceptable

**Error logging:**
- [ ] Module logs to the correct Sentry project (A or B)
- [ ] No PII or cross-loop IDs in log messages

---

## 10. Incident Response — If Cross-Contamination Is Detected

1. **Isolate immediately:** Take the affected endpoint or module offline (return 503) until the leak is contained
2. **Identify scope:** Determine which user records, log entries, or analytics events contain cross-loop data
3. **Purge contaminated data:** Delete affected log entries, anonymize affected analytics events, null out any cross-loop field in the DB
4. **Audit the boundary:** Walk the full data flow that caused the leak — auth layer? analytics tag? email sender? referrer header?
5. **Fix and re-verify against checklist above before bringing module back online**
6. **Document in EMPIRE.md:** Log the incident, scope, fix, and date — no exceptions
