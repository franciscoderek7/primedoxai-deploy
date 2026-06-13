# zPrimeDox AI HQ

The World's First Cannabis Constitutional Intelligence Engine.

## Quick Start

```bash
cp .env.local.example .env.local
# fill in NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY

npm install
npm run dev        # http://localhost:3000
npm run build      # static export → ./dist
```

## Required Secrets (GitHub Actions)

Add these in the `franciscoderek7/primedoxai-deploy` repo → Settings → Secrets:

| Secret | Where to get it |
|--------|-----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | supabase.com → Project Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | supabase.com → Project Settings → API → anon public key |
| `DEPLOY_TOKEN` | Already set |

## Supabase Setup

Run `../supabase/migrations/001_leads.sql` in the Supabase SQL Editor once.

## Deploy

Push to `main` — GitHub Actions builds and deploys to `franciscoderek7/zprimedoxaihq` → `zprimedoxaihq.com`.
