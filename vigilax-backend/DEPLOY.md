# VIGILAX Sentinel — Zero-Budget Deployment Guide
### Francisco Holdings Inc. | Computer Science Professor Edition
### Last updated: 2026-07-10

> **Total cost: $0.00/month** — Every service below has a permanent free tier.
> You will have a live, HTTPS-secured backend running tonight.

---

## What We're Building

```
Internet
   │
   ▼
vigilax.franciscoholdingsinc.com  (CNAME → Render URL)
   │
   ▼
Render.com free tier ──── Node.js  (port 3002, vigilax-backend/)
   │                       │
   │                   Supabase    (PostgreSQL, 500 MB free)
   │                       │
   │                   Gmail SMTP  (500 emails/day free)
   │                       │
   │                   Slack       (webhook, free forever)
   │
   ▼
Kimi frontend / Admin dashboard   (reads from Render URL)
```

---

## Prerequisites (5 minutes)

You need accounts on these free services. All sign-ups are email only — no credit card.

| Service | URL | What it does | Free limit |
|---------|-----|-------------|------------|
| Render.com | render.com | Hosts your Node.js backend | 750 hrs/month (enough for 1 service) |
| Supabase | supabase.com | PostgreSQL database | 500 MB, 2 projects |
| Upstash | upstash.com | Redis (optional) | 10,000 req/day |
| Ethereal | ethereal.email | Dev email testing | Unlimited (dev only) |

Create all four accounts now. Use `franciscoderek7@gmail.com`.

---

## PART 1 — Supabase (Free PostgreSQL)

### 1.1 Create project

1. Go to **supabase.com** → New Project
2. Name: `vigilax-sentinel`
3. Password: generate a strong one, **save it** — you need it for the connection string
4. Region: **US East (N. Virginia)** — closest to Render's default
5. Click **Create new project** — takes ~2 minutes to provision

### 1.2 Run the schema

1. In Supabase sidebar → **SQL Editor** → New query
2. Open `vigilax-backend/vigilax-migrations.sql` from this repo
3. Paste the entire file content into the editor
4. Click **Run** — you should see "Success. No rows returned."

### 1.3 Get your connection string

1. Supabase sidebar → **Settings** → **Database**
2. Scroll to **Connection string** → choose **URI** tab
3. Copy the string — it looks like:

```
postgresql://postgres:[YOUR-PASSWORD]@db.xxxxxxxxxxxx.supabase.co:5432/postgres
```

4. Replace `[YOUR-PASSWORD]` with your actual project password
5. **Save this string** — you need it in Part 2

### 1.4 Verify the schema ran

In SQL Editor, run:

```sql
select table_name from information_schema.tables
where table_schema = 'public' and table_name like 'vigilax_%'
order by table_name;
```

Expected output — exactly 6 rows:
```
vigilax_alerts
vigilax_audit_log
vigilax_evidence
vigilax_industry_profiles
vigilax_review_queue
vigilax_scans
```

If you see fewer than 6, re-run the migration SQL.

---

## PART 2 — Gmail SMTP (Free Email Alerts)

VIGILAX sends alerts to `franciscoderek7@gmail.com`. Gmail's free SMTP sends up to 500 emails/day — more than enough.

### 2.1 Create a Gmail App Password

You CANNOT use your regular Gmail password. You need an App Password.

1. Go to **myaccount.google.com**
2. Security → 2-Step Verification → **turn it ON** (required for App Passwords)
3. Security → **App passwords**
4. Select app: **Mail** | Select device: **Other** → type `vigilax`
5. Click **Generate**
6. Copy the 16-character password (example: `abcd efgh ijkl mnop`)
7. **Remove the spaces** — save as `abcdefghijklmnop`

That 16-character string is your `SMTP_PASS`.

### 2.2 Your Gmail SMTP config

```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=franciscoderek7@gmail.com
SMTP_PASS=abcdefghijklmnop        ← your 16-char app password, no spaces
ALERT_EMAIL=franciscoderek7@gmail.com
```

---

## PART 3 — Slack Webhook (Free Alerts)

### 3.1 Create the webhook

1. Go to **api.slack.com/apps**
2. Click **Create New App** → **From scratch**
3. App Name: `VIGILAX Sentinel` | Workspace: your workspace → **Create App**
4. Left sidebar → **Incoming Webhooks** → toggle **Activate Incoming Webhooks** ON
5. Scroll down → **Add New Webhook to Workspace**
6. Choose channel: `#vigilax-alerts` (create it first in Slack if needed)
7. Click **Allow**
8. Copy the webhook URL — looks like: `https://hooks.slack.com/services/T.../B.../xxxx`

### 3.2 Test it works

```bash
curl -X POST -H 'Content-type: application/json' \
  --data '{"text":"VIGILAX webhook connected ✅"}' \
  https://hooks.slack.com/services/YOUR/WEBHOOK/URL
```

Should print `ok`. You'll see the message in `#vigilax-alerts`.

### 3.3 Your Slack config

```
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/T.../B.../xxxx
SLACK_CHANNEL=#vigilax-alerts
```

---

## PART 4 — Render.com (Free Node.js Hosting)

### 4.1 Create the Web Service

1. Go to **render.com** → **New** → **Web Service**
2. Connect GitHub → authorize → select `franciscoderek7/primedoxai-deploy`
3. Fill in:

| Field | Value |
|-------|-------|
| Name | `vigilax-sentinel` |
| Region | Oregon (US West) or Ohio (US East) |
| Branch | `claude/francisco-revenue-sprint-MEva6` |
| Root Directory | `vigilax-backend` |
| Runtime | Node |
| Build Command | `npm install` |
| Start Command | `node server.js` |
| Instance Type | **Free** |

4. Click **Create Web Service** — Render will auto-deploy.

> **Free tier note**: Render's free tier spins down after 15 minutes of inactivity.
> First request after idle takes ~30 seconds to cold-start. This is fine for v1.
> When you start generating revenue, upgrade to the $7/month Starter tier for always-on.

### 4.2 Set Environment Variables

In Render dashboard → your service → **Environment** tab → add each variable:

```
PORT=3002
NODE_ENV=production
CORS_ORIGINS=https://vigilax.franciscoholdingsinc.com,https://primedoxaihq.com,https://franciscoholdingsinc.com

# Database
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres

# API Auth
VIGILAX_API_KEYS=generate-a-long-random-key-here
ADMIN_SECRET=generate-another-long-random-key-here

# Email
ALERT_EMAIL=franciscoderek7@gmail.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=franciscoderek7@gmail.com
SMTP_PASS=your16charapppassword

# Slack
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/xxx/xxx/xxx
SLACK_CHANNEL=#vigilax-alerts
```

**How to generate API keys** (run this in any terminal):

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Run it twice — once for `VIGILAX_API_KEYS`, once for `ADMIN_SECRET`.

### 4.3 Trigger first deploy

After saving environment variables:
1. Render → your service → **Manual Deploy** → **Deploy latest commit**
2. Watch the build log — takes ~2 minutes

### 4.4 Get your Render URL

After deploy succeeds, Render shows your URL at the top of the dashboard:
```
https://vigilax-sentinel.onrender.com
```

Copy this URL — you need it for DNS and testing.

---

## PART 5 — Domain Setup (Free Subdomain + SSL)

### 5.1 Add CNAME in Porkbun (your DNS provider)

1. Log in to **porkbun.com**
2. Find `franciscoholdingsinc.com` → **DNS** button
3. Add a new record:

| Type | Host | Answer | TTL |
|------|------|--------|-----|
| CNAME | `vigilax` | `vigilax-sentinel.onrender.com` | 600 |

4. Save. DNS propagates in 5–30 minutes.

### 5.2 Add custom domain in Render

1. Render → your service → **Settings** → **Custom Domains**
2. Click **Add Custom Domain**
3. Enter: `vigilax.franciscoholdingsinc.com`
4. Render will automatically provision a free Let's Encrypt SSL certificate.

### 5.3 Verify SSL is working

```bash
curl -I https://vigilax.franciscoholdingsinc.com/health
```

Expected:
```
HTTP/2 200
content-type: application/json
```

---

## PART 6 — Verify Everything Works

Run these checks in order. Each should succeed before the next.

### Check 1 — Health endpoint

```bash
curl https://vigilax.franciscoholdingsinc.com/health
```

Expected:
```json
{
  "status": "operational",
  "service": "VIGILAX Sentinel",
  "version": "1.0.0",
  "engines": ["click_fraud","review_fraud","influencer_fraud","ad_fraud","gov_fraud","cannabis_monitor"]
}
```

### Check 2 — Authenticated scan

Replace `YOUR_API_KEY` with the value you set for `VIGILAX_API_KEYS`:

```bash
curl -X POST https://vigilax.franciscoholdingsinc.com/api/vigilax/scan \
  -H "Content-Type: application/json" \
  -H "X-Vigilax-Key: YOUR_API_KEY" \
  -d '{
    "entity_type": "campaign",
    "entity_id": "test-campaign-001",
    "industry": "ecommerce_general",
    "data_sources": {
      "click_data": {
        "events": [],
        "total_clicks": 1000,
        "total_impressions": 50000
      }
    }
  }'
```

Expected: JSON with `risk_score`, `verdict`, `human_review_required`, `review_note`.

### Check 3 — Review fraud engine

```bash
curl -X POST https://vigilax.franciscoholdingsinc.com/api/vigilax/review-fraud \
  -H "Content-Type: application/json" \
  -H "X-Vigilax-Key: YOUR_API_KEY" \
  -d '{
    "reviews": [
      { "id": "r1", "text": "Amazing product highly recommend five stars", "rating": 5, "date": "2026-07-10T10:00:00Z" },
      { "id": "r2", "text": "Amazing product highly recommend five stars", "rating": 5, "date": "2026-07-10T10:01:00Z" },
      { "id": "r3", "text": "Amazing product highly recommend five stars", "rating": 5, "date": "2026-07-10T10:02:00Z" }
    ],
    "business_id": "test-business"
  }'
```

Expected: `verdict` of `SUSPICIOUS` or higher with duplicate detection findings.

### Check 4 — Email alert

```bash
curl -X POST https://vigilax.franciscoholdingsinc.com/api/vigilax/scan \
  -H "Content-Type: application/json" \
  -H "X-Vigilax-Key: YOUR_API_KEY" \
  -d '{
    "entity_type": "test",
    "entity_id": "email-test",
    "industry": "general_default",
    "data_sources": { "click_data": { "events": [], "total_clicks": 0 } }
  }'
```

Then check `franciscoderek7@gmail.com` — you should receive an alert if the score is HIGH/CRITICAL.

> To force a HIGH alert for testing, temporarily lower `HIGH` threshold in `server.js`. Revert after testing.

### Check 5 — Review queue

```bash
curl https://vigilax.franciscoholdingsinc.com/api/vigilax/review-queue?status=PENDING \
  -H "X-Vigilax-Key: YOUR_API_KEY"
```

Expected: JSON with `queue`, `total`, `pagination`.

---

## PART 7 — Connect to Kimi Frontend

Kimi makes requests to your backend. Update the backend URL in the frontend config:

```
https://vigilax.franciscoholdingsinc.com
```

All API calls use header: `X-Vigilax-Key: YOUR_API_KEY`

Primary endpoint for Kimi:
```
POST https://vigilax.franciscoholdingsinc.com/api/vigilax/scan
```

WebSocket for real-time alerts:
```
wss://vigilax.franciscoholdingsinc.com
```

---

## PART 8 — Backup Plan (If Render Fails)

If Render is down or cold-start is unacceptable, run locally in 3 minutes.

### Option A: Local + ngrok tunnel

**Step 1 — Install ngrok (free)**

```bash
# macOS
brew install ngrok/ngrok/ngrok

# Windows (download from ngrok.com/download — no install needed)
# Linux
curl -sSL https://ngrok-agent.s3.amazonaws.com/ngrok.asc | sudo tee /etc/apt/trusted.gpg.d/ngrok.asc >/dev/null
echo "deb https://ngrok-agent.s3.amazonaws.com buster main" | sudo tee /etc/apt/sources.list.d/ngrok.list
sudo apt update && sudo apt install ngrok
```

**Step 2 — Sign up and authenticate ngrok (free)**

1. Go to **ngrok.com** → sign up (free)
2. Dashboard → Your Authtoken → copy it
3. Run: `ngrok config add-authtoken YOUR_TOKEN`

**Step 3 — Set up .env locally**

```bash
cd /path/to/primedoxai-deploy/vigilax-backend
cp .env.example .env
```

Edit `.env` — fill in your values (same as Render env vars above).

**Step 4 — Install dependencies and start server**

```bash
npm install
node server.js
```

Server starts on port 3002. You'll see:
```
[vigilax] Server running on port 3002
[vigilax] WebSocket alert channel ready
```

**Step 5 — Open ngrok tunnel in a new terminal**

```bash
ngrok http 3002
```

ngrok prints:
```
Forwarding  https://abc123.ngrok-free.app -> http://localhost:3002
```

Copy that `https://abc123.ngrok-free.app` URL — this IS your public backend URL.
Share it with Kimi. It's live immediately, no DNS needed.

> **ngrok free tier limit**: 1 tunnel, URL changes every restart.
> Run `ngrok http 3002 --subdomain=vigilax` with a paid plan ($8/month) for a fixed URL.
> For tonight: free tier is fine.

### Option B: SQLite fallback (no Supabase)

If Supabase is down or you haven't set it up yet, VIGILAX runs in no-database mode.

In `vigilax-backend/server.js`, the DB is optional — if `DATABASE_URL` is not set, all scan results are stored in memory only (lost on restart) and the evidence vault is disabled.

To run with zero database:

```bash
# Just don't set DATABASE_URL in .env
# Everything else works: engines, alerts, review queue (in-memory)
node server.js
```

You'll see: `[vigilax] Database not configured — running in memory-only mode`

---

## PART 9 — Environment Variable Reference (Complete)

Create `vigilax-backend/.env` (copy from `.env.example`, fill in your values):

```bash
# ── Server ────────────────────────────────────────────────────────────────────
PORT=3002
NODE_ENV=production
CORS_ORIGINS=https://vigilax.franciscoholdingsinc.com,https://primedoxaihq.com

# ── API Keys — generate with: node -e "require('crypto').randomBytes(32).toString('hex')" ──
VIGILAX_API_KEYS=your64hexkeyhere
ADMIN_SECRET=anotherlongkeyhere

# ── Database (Supabase free tier) ─────────────────────────────────────────────
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres

# ── Email (Gmail SMTP — free 500/day) ────────────────────────────────────────
ALERT_EMAIL=franciscoderek7@gmail.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=franciscoderek7@gmail.com
SMTP_PASS=your16charapppassword

# ── Slack (free — no paid plan needed) ───────────────────────────────────────
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/T.../B.../xxx
SLACK_CHANNEL=#vigilax-alerts

# ── SMS (Twilio) — SKIP FOR V1, costs money ───────────────────────────────────
# When Twilio is not configured, VIGILAX automatically sends 3x email
# for any alert with risk_score >= 90. No SMS needed for v1.
# TWILIO_ACCOUNT_SID=ACxxx
# TWILIO_AUTH_TOKEN=xxx
# TWILIO_FROM_NUMBER=+1xxxxxxxxxx
# SMS_ALERT_NUMBER=+1xxxxxxxxxx

# ── Feature Flags ─────────────────────────────────────────────────────────────
VERIFY_DOMAINS=false
```

---

## PART 10 — Troubleshooting

### "Application failed to respond" on Render

- **Cause**: Free tier cold start (up to 30 seconds).
- **Fix**: Wait 30 seconds, retry. If consistently failing, check Render logs.

```
Render Dashboard → your service → Logs tab
```

### "CORS error" in browser

- **Cause**: Your frontend URL isn't in `CORS_ORIGINS`.
- **Fix**: Add the origin to `CORS_ORIGINS` in Render env vars, redeploy.

### "503" or "no healthy upstream"

- **Cause**: Server crashed — likely missing env var or DB connection error.
- **Fix**: Check Render logs. Most common cause: `DATABASE_URL` not set or wrong password.

### Email not arriving

1. Check spam folder first.
2. Verify App Password has no spaces.
3. Verify 2-Step Verification is enabled on your Google account.
4. Test with Ethereal first (set neither `SMTP_HOST` nor `SENDGRID_API_KEY` — VIGILAX auto-creates an Ethereal test account and logs the preview URL).

### Supabase connection refused

- **Cause**: Wrong password or wrong host in `DATABASE_URL`.
- **Fix**: In Supabase dashboard → Settings → Database → copy the connection string fresh, replace `[YOUR-PASSWORD]` with your actual password.

### ngrok URL expired

- **Cause**: ngrok free tier URLs expire when tunnel restarts.
- **Fix**: Re-run `ngrok http 3002` and update the URL wherever you shared it (Kimi config, etc.).

### Port 3002 already in use (local)

```bash
lsof -i :3002        # find the process
kill -9 [PID]        # kill it
node server.js       # restart
```

---

## PART 11 — Post-Launch Checklist

Run through this once the backend is live:

- [ ] `curl https://vigilax.franciscoholdingsinc.com/health` returns `200 operational`
- [ ] Supabase SQL shows all 6 `vigilax_*` tables
- [ ] Test scan returns JSON with `risk_score` and `review_note`
- [ ] Check Gmail — received at least one test alert email
- [ ] Check `#vigilax-alerts` in Slack — received test message
- [ ] Review queue endpoint returns `{"queue":[],"total":0}`
- [ ] Kimi frontend can reach `POST /api/vigilax/scan` (no CORS errors)
- [ ] Custom domain `vigilax.franciscoholdingsinc.com` loads over HTTPS

---

## Summary — What You Built Tonight

| Component | Solution | Cost |
|-----------|----------|------|
| Backend hosting | Render.com free tier | $0 |
| Database | Supabase free tier (500 MB) | $0 |
| Email alerts | Gmail SMTP (500/day) | $0 |
| Slack alerts | Incoming webhook | $0 |
| SMS for critical | 3x email fallback (no Twilio needed) | $0 |
| Domain | Subdomain of existing domain | $0 |
| SSL certificate | Render + Let's Encrypt auto | $0 |
| **Total** | | **$0/month** |

When revenue starts flowing → upgrade Render to Starter ($7/month) for always-on (no cold start).

---

*VIGILAX Sentinel — Francisco Holdings Inc. | Deploy guide by Computer Science Professor mode*
