# PrimeDox AI — Master Deployment Checklist V2
## Francisco Holdings Inc. | Derek Francisco
## Time: ~45 minutes | Cost: $0 (all free tiers)

---

## PHASE 0 — KEYS YOU NEED BEFORE STARTING

Collect these before touching Railway. Open each link, copy the value:

| Key | Where to get it | What it looks like |
|-----|----------------|-------------------|
| OpenAI OR DeepSeek API key | platform.openai.com OR platform.deepseek.com | sk-... |
| Anthropic API key | console.anthropic.com | sk-ant-... |
| Supabase service_role key | supabase.com → project → Settings → API | eyJ... |
| Stripe secret key | dashboard.stripe.com → Developers → API Keys | sk_live_... |
| JWT_SECRET (generate) | Run: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` | 64 hex chars |
| ADMIN_SECRET (generate) | Run: `node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"` | 32 hex chars |

**DeepSeek shortcut**: If no OpenAI credits, use DeepSeek free $5:
- Set `OPENAI_API_KEY=<your-deepseek-key>`
- Set `OPENAI_BASE_URL=https://api.deepseek.com/v1`
- Set `OPENAI_MODEL=deepseek-chat`
- DeepSeek's API is 100% OpenAI-compatible — no code changes needed.

---

## STEP 1 — Deploy Node.js Backend (Railway)

**Time: 5 minutes**

### 1a. Create Railway project

- [ ] Go to: https://railway.app → Log in with GitHub
- [ ] Click "New Project" → "Deploy from GitHub repo"
- [ ] Select: `franciscoderek7/primedoxai-deploy`
- [ ] Railway asks "Root Directory" → type: `agents/backend` → confirm
- [ ] Click "Add Variables" (do NOT deploy yet)

### 1b. Paste ALL environment variables

Copy the entire block below → paste into Railway "Variables" tab:

```
LLM_BACKEND=openai
PORT=3001
OPENAI_API_KEY=                    ← paste key (OpenAI or DeepSeek)
OPENAI_BASE_URL=                   ← leave blank for OpenAI; paste https://api.deepseek.com/v1 for DeepSeek
OPENAI_MODEL=gpt-4o                ← or deepseek-chat
ANTHROPIC_API_KEY=                 ← paste Claude key
CLAUDE_MODEL=claude-haiku-4-5-20251001
STRIPE_SECRET_KEY=                 ← paste sk_live_ key
STRIPE_WEBHOOK_SECRET=             ← fill in after Step 2 below
JWT_SECRET=                        ← paste generated hex string
JWT_EXPIRES_IN=7d
SUPABASE_URL=https://ilmlnehehfcxwlurzfxd.supabase.co
SUPABASE_SERVICE_KEY=              ← paste service_role key
ADMIN_SECRET=                      ← paste generated hex string
CORS_ORIGINS=https://primedoxaihq.com,https://franciscoholdingsinc.com,https://ccldr.net,https://omni-guard.com
SWARM_MAX_AGENTS=8
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
```

- [ ] Click "Deploy"
- [ ] Wait 2–3 minutes for build to complete
- [ ] Copy the Railway URL (looks like: `https://primedox-backend-production.up.railway.app`)

### 1c. Verify backend is live

```bash
curl https://YOUR-RAILWAY-URL.railway.app/health
```

**Expected response:**
```json
{"status":"ok","agents":45,"backend":"openai","uptime":12}
```

If you see `{"status":"ok"...}` → ✅ Backend is live.

**Common errors:**
- `ECONNREFUSED` → Railway still deploying, wait 1 more minute
- `{"error":"..."}` → Check Railway logs → Deployments → View logs → look for missing env var
- Build fails → Railway → Deployments → click failed deploy → check build log

---

## STEP 2 — Create Stripe Webhook

**Time: 3 minutes**

- [ ] Go to: https://dashboard.stripe.com/webhooks
- [ ] Click "Add endpoint"
- [ ] Endpoint URL: `https://YOUR-RAILWAY-URL.railway.app/webhooks/stripe`
- [ ] Click "Select events" → choose ALL of:
  - `checkout.session.completed`
  - `payment_intent.succeeded`
  - `customer.subscription.created`
  - `customer.subscription.deleted`
- [ ] Click "Add endpoint"
- [ ] On the webhook page: click "Reveal" next to "Signing secret"
- [ ] Copy the `whsec_...` value
- [ ] Go back to Railway → Variables → add `STRIPE_WEBHOOK_SECRET=whsec_...`
- [ ] Railway auto-redeploys (wait 1 min)

### Verify webhook:
```bash
curl https://YOUR-RAILWAY-URL.railway.app/health
# Should now show "stripe":true
```

---

## STEP 3 — Create Supabase Tables

**Time: 5 minutes**

- [ ] Go to: https://supabase.com/dashboard/project/ilmlnehehfcxwlurzfxd
- [ ] Click "SQL Editor" in left sidebar
- [ ] Click "New query"
- [ ] Open file `supabase-migrations.sql` in this repo → copy ENTIRE contents
- [ ] Paste into SQL Editor → click "Run"
- [ ] Expected: "Success. No rows returned"

### Verify tables exist:
Paste this query → Run:
```sql
select table_name from information_schema.tables
where table_schema = 'public'
order by table_name;
```

**Expected 11 tables:**
```
agent_purchases
agent_reviews
apex_events
documents
gap_scans
marketplace_agents
payments
referral_commissions
referrals
sessions
user_profiles
```

If any table is missing → paste the relevant section of supabase-migrations.sql and run again.

**Rollback**: If something went wrong:
```sql
drop table if exists agent_purchases cascade;
drop table if exists agent_reviews cascade;
drop table if exists marketplace_agents cascade;
drop table if exists gap_scans cascade;
drop table if exists payments cascade;
drop table if exists apex_events cascade;
drop table if exists documents cascade;
drop table if exists sessions cascade;
drop table if exists user_profiles cascade;
drop table if exists referral_commissions cascade;
drop table if exists referrals cascade;
```
Then re-run the migration.

---

## STEP 4 — Create Stripe Products + Payment Links

**Time: 15 minutes**

Go to: https://dashboard.stripe.com/payment-links → "New"

Create exactly these 10 products:

| Product Name | Price | Type | Note |
|-------------|-------|------|------|
| CCLDR — Court Case Access | $97/mo CAD | Recurring | |
| CCLDR — Constitutional Masterclass | $497 CAD | One-time | |
| CCLDR — Self-Rep Blueprint | $1,997 CAD | One-time | |
| CCLDR — Sovereign Elite | $1,499/mo CAD | Recurring | |
| PrimeDox — Pro | $49/mo CAD | Recurring | |
| PrimeDox — Enterprise | $497/mo CAD | Recurring | |
| PrimeDox — Agent Swarm Setup | $2,997 CAD | One-time | |
| AgentForge — Early Access | $997 CAD | One-time | |
| AgentForge — Pro | $497/mo CAD | Recurring | |
| AgentForge — Enterprise | $4,997/mo CAD | Recurring | |

After creating all 10:
- Copy all the `https://buy.stripe.com/XXXX` URLs
- Tell Claude: "Here are my Stripe Payment Links: [paste all 10 URLs]"
- Claude will wire them into all site HTML files in one pass

---

## STEP 5 — Wire Backend URL to All Sites

After getting your Railway URL:

Tell Claude: "Wire backend URL `https://YOUR-URL.railway.app` to all sites"

Claude will:
- [ ] Set `window.PRIMEDOX_BACKEND_URL` in all site HTML files
- [ ] Remove "AI backend not configured" fallback messages
- [ ] Enable AI chatbot on every site that loads `chat-widget.js`

---

## STEP 6 — Formspree Lead Capture

**Time: 5 minutes**

- [ ] Go to: https://formspree.io → Sign up free
- [ ] Create 6 forms (one per site), copy each form ID:

| Site | Form Name |
|------|-----------|
| CCLDR | CCLDR Contact |
| PrimeDox AI | PrimeDox Contact |
| VIGILAX | VIGILAX Contact |
| CleanSwarm | CleanSwarm Contact |
| Kiaros | Kiaros Contact |
| TechPetCage | TechPetCage Contact |

- [ ] Tell Claude: "Formspree IDs: ccldr=xXXXXX, primedox=xXXXXX, vigilax=xXXXXX, cleanswarm=xXXXXX, kiaros=xXXXXX, techpetcage=xXXXXX"
- Claude runs `bash scripts/wire-formspree.sh <ids>` and commits the result

---

## STEP 7 — Fix DNS Records (Porkbun)

**Time: 10 minutes**

All A records currently point to `185.199.x.15` — WRONG. Should be `.153`.

Go to: https://porkbun.com → Domain Management → each domain → DNS

Change ALL A records from `185.199.x.15` → `185.199.x.153`

GitHub Pages requires all 4 A records:
```
185.199.108.153
185.199.109.153
185.199.110.153
185.199.111.153
```

Domains to fix:
- primedoxaihq.com
- ccldr.net
- vigilax.com (or current domain)
- cleanswarm.com (or current domain)
- kiaros.com (or current domain)
- techpetcage.ca

Verify DNS propagation (wait 5–30 min after change):
```bash
dig primedoxaihq.com A +short
# Should return 185.199.108.153 (and 3 others)
```

---

## STEP 8 — Run Integration Tests

**Time: 2 minutes**

```bash
# Basic test (no auth token)
node agents/backend/tests/integration.test.js https://YOUR-RAILWAY-URL.railway.app

# Full test with admin token
node agents/backend/tests/integration.test.js https://YOUR-RAILWAY-URL.railway.app eyJ...
```

**Expected output:**
```
═══════════════════════════════════════════
  PrimeDox AI Backend — Integration Tests
═══════════════════════════════════════════
  Target: https://xxx.railway.app

[Suite 1] Health Check
  GET /health returns 200 ... PASS
  GET /health includes agent count ... PASS
  ...

Results: 35 tests
✓ PASSED:  30
○ SKIPPED: 5  (need auth token / Stripe secret)
```

If any test FAILS → check Railway logs:
- Railway → your project → Deployments → click latest → Logs tab
- Look for the specific error (missing env var, database connection, etc.)

---

## STEP 9 — Open Admin Dashboard

Open in browser:
```
admin-dashboard/index.html
```

Or deploy to GitHub Pages:
- [ ] Go to GitHub → repo settings → Pages → Source: Deploy from branch
- [ ] Branch: `claude/francisco-revenue-sprint-MEva6` → folder: `/admin-dashboard`
- [ ] Access at: `https://franciscoderek7.github.io/primedoxai-deploy/admin-dashboard/`

Enter your Railway URL in the "Backend URL" field → click "Connect"

---

## PHASE 2 — POST-LAUNCH (24 hours after go-live)

- [ ] Monitor Railway logs for errors (check every 2 hours first day)
- [ ] Verify Stripe webhook events arriving (dashboard.stripe.com → Webhooks → your endpoint → Events)
- [ ] Check Supabase `apex_events` table has data (confirms analytics tracking working)
- [ ] Run a test gap scan on a real competitor site
- [ ] Test full checkout flow: gap scan → quote → PayPal link

---

## ROLLBACK PROCEDURES

### Rollback backend deployment:
1. Railway → your project → Deployments
2. Click an older successful deployment
3. Click "Redeploy" → confirm
4. New deploy replaces current in ~2 minutes

### Rollback Supabase tables:
Run the DROP TABLE block from Step 3, then re-run migration from a known-good version.

### Rollback a site:
```bash
git log --oneline  # find the commit hash before the bad change
git revert <hash>
git push -u origin claude/francisco-revenue-sprint-MEva6
```

---

## COMMON ERRORS & FIXES

| Error | Cause | Fix |
|-------|-------|-----|
| `Cannot find module './chinese-ai-providers'` | Missing file on Railway | Ensure all files committed and pushed to feature branch |
| `STRIPE_SECRET_KEY is not valid` | Wrong key format | Must start with `sk_live_` or `sk_test_` |
| `JWT_SECRET is too short` | Weak secret | Generate 32+ bytes: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `Supabase: relation "payments" does not exist` | Tables not created | Run supabase-migrations.sql in SQL Editor |
| `No Access-Control-Allow-Origin` (CORS) | Site domain not in CORS_ORIGINS | Add domain to Railway CORS_ORIGINS env var |
| Railway build: `npm: not found` | Wrong root directory | Ensure root dir is set to `agents/backend` not repo root |
| Health endpoint returns empty `{}` | Port mismatch | Ensure PORT=3001 is set; Railway uses internal port |
| Stripe webhook: `No signatures found matching the expected signature` | Wrong secret | Re-copy `whsec_...` from Stripe → update STRIPE_WEBHOOK_SECRET in Railway |

---

## VERIFICATION COMMANDS (Copy-Paste Ready)

```bash
# 1. Health check
curl https://YOUR-URL.railway.app/health

# 2. Industries list (Gap Scanner)
curl https://YOUR-URL.railway.app/api/gap-scan/industries | python3 -m json.tool

# 3. Marketplace agents
curl https://YOUR-URL.railway.app/api/marketplace/agents | python3 -m json.tool

# 4. Test gap scan (uses example.com)
curl -X POST https://YOUR-URL.railway.app/api/gap-scan \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com"}' | python3 -m json.tool

# 5. Test auth register
curl -X POST https://YOUR-URL.railway.app/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"TestPass123!"}' | python3 -m json.tool

# 6. Full integration test suite
node agents/backend/tests/integration.test.js https://YOUR-URL.railway.app
```

---

*Last updated: 2026-07-10 | Branch: claude/francisco-revenue-sprint-MEva6*
*Total backend endpoints: 25+ | Tables: 11 | Agents: 45 | Industries: 20*
