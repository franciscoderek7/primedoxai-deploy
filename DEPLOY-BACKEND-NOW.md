# DEPLOY BACKEND NOW — 5-CLICK GUIDE
# Derek Francisco | Francisco Holdings Inc.
# Time: ~30 minutes | Cost: $0 (Railway free tier)

---

## TASK 1 — NODE.JS BACKEND (PrimeDox AI Brain)
**File: agents/backend/gemma-server.js**
**Unlocks: PrimeDox chatbot intelligent, AI routing, auth, webhooks**

### 5 Clicks on Railway:

1. Go to: https://railway.app → "New Project" → "Deploy from GitHub repo"
2. Select: `franciscoderek7/primedoxai-deploy`
3. Railway asks "Root Directory" → type: `agents/backend`
4. Click "Add Variables" → paste ALL vars from the block below
5. Click "Deploy" → wait 2 min → copy the URL Railway gives you

### ENV VARS TO PASTE (copy the whole block):
```
LLM_BACKEND=openai
PORT=3001
OPENAI_API_KEY=           ← paste your OpenAI key
ANTHROPIC_API_KEY=        ← paste your Claude key
CLAUDE_MODEL=claude-haiku-4-5-20251001
STRIPE_SECRET_KEY=        ← paste sk_live_ key (from dashboard.stripe.com → API Keys)
STRIPE_WEBHOOK_SECRET=    ← paste after creating webhook (step below)
JWT_SECRET=               ← generate: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_EXPIRES_IN=7d
SUPABASE_URL=https://ilmlnehehfcxwlurzfxd.supabase.co
SUPABASE_SERVICE_KEY=     ← paste service_role key (supabase.com → project → Settings → API)
DEEPSEEK_API_KEY=         ← paste when you have it (optional, fallback)
QWEN_API_KEY=             ← paste when you have it (optional, fallback)
ADMIN_SECRET=             ← generate: node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"
```

### Verify it works:
```
curl https://YOUR-RAILWAY-URL.railway.app/health
```
Expected: `{"status":"ok","agents":45,"backend":"openai",...}`

### After deploy — set backend URL on all sites:
Paste your Railway URL to Claude and say "wire backend URL to all sites"

---

## TASK 1B — ADD STRIPE WEBHOOK

After backend is live:
1. Go to: https://dashboard.stripe.com/webhooks
2. Click "Add endpoint"
3. Endpoint URL: `https://YOUR-RAILWAY-URL.railway.app/webhooks/stripe`
4. Events to select:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `customer.subscription.created`
   - `customer.subscription.deleted`
5. Click "Add endpoint" → copy "Signing secret" (starts with `whsec_`)
6. Go back to Railway → add `STRIPE_WEBHOOK_SECRET=whsec_...` → redeploy

---

## TASK 2 — PYTHON FASTAPI BACKEND (Floor State + Document Generation)
**File: backend/**
**Unlocks: CCLDR document generation, floor state API**

### 5 Clicks on Railway:

1. Railway dashboard → "New Project" → "Deploy from GitHub repo"
2. Select: `franciscoderek7/primedoxai-deploy`  
3. Root Directory → type: `backend`
4. Add Variables (minimum to start):
```
DATABASE_URL=             ← PostgreSQL URL (Railway can provision free Postgres — click "Add Service" → Database → PostgreSQL → copy URL)
SECRET_KEY=               ← generate: python3 -c "import secrets; print(secrets.token_hex(32))"
STRIPE_SECRET_KEY=        ← same key as above
SUPABASE_URL=https://ilmlnehehfcxwlurzfxd.supabase.co
SUPABASE_SERVICE_KEY=     ← same key as above
```
5. Click "Deploy" → wait 3 min

### Verify:
```
curl https://YOUR-FASTAPI-URL.railway.app/health
```
Expected: `{"status":"healthy","version":"0.2.0"}`

---

## TASK 3 — SUPABASE TABLES (Analytics + Payments + Auth)
**Time: 5 minutes**

1. Go to: https://supabase.com/dashboard/project/ilmlnehehfcxwlurzfxd
2. Click "SQL Editor" in left sidebar
3. Click "New query"
4. Open file: `supabase-migrations.sql` in this repo → copy entire contents → paste → click "Run"
5. Expected: "Success. No rows returned" — means all 7 tables created

### Verify tables:
Paste this in SQL Editor → Run:
```sql
select table_name from information_schema.tables where table_schema = 'public' order by table_name;
```
Expected tables: agent_purchases, agent_reviews, apex_events, documents, gap_scans, marketplace_agents, payments, referral_commissions, referrals, sessions, user_profiles

---

## TASK 4 — STRIPE PAYMENT LINKS
**Derek creates these. Claude wires them in.**

1. Go to: https://dashboard.stripe.com/payment-links → "New"
2. Create each product below → copy the `https://buy.stripe.com/XXXX` URL
3. Paste all URLs to Claude: "Here are my Stripe Payment Links: [paste]"

Products to create:
```
CCLDR — Court Case Access        $97/mo    recurring
CCLDR — Masterclass              $497      one-time
CCLDR — Blueprint                $1,997    one-time
CCLDR — Sovereign Elite          $1,499/mo recurring
PrimeDox — Pro                   $49/mo    recurring
PrimeDox — Enterprise            $497/mo   recurring
PrimeDox — Agent Swarm Setup     $2,997    one-time
AgentForge — Early Access        $997      one-time
AgentForge — Pro                 $497/mo   recurring
AgentForge — Enterprise          $4,997/mo recurring
```

---

## TASK 5 — FORMSPREE (Lead Capture)
**Derek creates forms, Claude replaces placeholders.**

1. Go to: https://formspree.io → Sign up free → "New Form"
2. Create 6 forms (one per site):
```
CCLDR Contact        → copy form ID (looks like: xrgvpkqb)
PrimeDox Contact     → copy form ID
VIGILAX Contact      → copy form ID
CleanSwarm Contact   → copy form ID
Kiaros Contact       → copy form ID
TechPetCage Contact  → copy form ID
```
3. Tell Claude: "Formspree IDs: ccldr=xXXXXX, primedox=xXXXXX, vigilax=xXXXXX, cleanswarm=xXXXXX, kiaros=xXXXXX, techpetcage=xXXXXX"
4. Claude replaces all YOUR_FORM_ID placeholders across all 6 sites in one pass

---

## AFTER ALL TASKS COMPLETE

Tell Claude: "All backends are live at [Node URL] and [FastAPI URL]. Wire them in."
Claude will:
- Set window.PRIMEDOX_BACKEND_URL on all sites pointing at your Railway URL
- Remove all "AI backend not configured" fallback messages
- Enable the AI chatbot on every site that loads chat-widget.js

---
*Last updated: 2026-07-10 | Branch: claude/francisco-revenue-sprint-MEva6*
