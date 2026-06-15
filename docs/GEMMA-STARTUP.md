# Gemma 3 27B — RunPod Startup Guide

## Prerequisites
- RunPod GPU pod with NVIDIA GPU (A100 or H100 recommended)
- Docker + Docker Compose installed
- Port 3001 open (API), port 11434 open (Ollama)

## Step 1 — Pull repo to RunPod

```bash
git clone https://github.com/franciscoderek7/primedoxai-deploy.git ~/primedox
cd ~/primedox/agents/backend
```

## Step 2 — Create .env file

```bash
cp .env.example .env
nano .env
```

Fill in:
```
LLM_BACKEND=hybrid
OPENAI_API_KEY=sk-...your-openai-key...
GEMMA_BASE_URL=http://ollama:11434/v1
GEMMA_MODEL=gemma3:27b
PORT=3001
CORS_ORIGINS=https://omniaguard.com,https://ccldr.net,https://franciscoholdingsinc.com,https://techpetcage.com
SWARM_MAX_AGENTS=8
```

## Step 3 — Start services

```bash
docker compose up -d
```

Wait ~30 seconds, then verify Ollama is running:

```bash
docker logs ollama --tail 20
curl http://localhost:11434/api/tags
```

## Step 4 — Pull Gemma model

```bash
docker exec -it ollama ollama pull gemma3:27b
```

This downloads ~17GB. Takes 5–15 minutes depending on connection.
Monitor progress:

```bash
docker exec -it ollama ollama list
```

## Step 5 — Verify API

```bash
curl http://localhost:3001/health
```

Expected response:
```json
{"status":"ok","backend":"hybrid","gemmaModel":"gemma3:27b","agents":45}
```

## Step 6 — Set PRIMEDOX_API_URL on empire sites

On each empire site, add before `</body>`:
```html
<script>window.PRIMEDOX_API_URL = 'https://YOUR_RUNPOD_IP:3001';</script>
```

## Hybrid Mode Agent Routing

| Tier | Agents | Model |
|------|--------|-------|
| Gold (6) | phoenix, archivist, counsel, barrister, ledger, alpha | GPT-4o |
| Emerald (39) | All others | Gemma 3 27B (local) |

Switch to full-Gemma mode: Set `LLM_BACKEND=gemma` in `.env` → `docker compose restart api`

## Troubleshooting

**Ollama not starting:** Check GPU driver — `nvidia-smi`
**Model load slow:** Normal for 27B — first response ~30s cold start
**API 503:** Ollama not ready yet — `docker compose ps` to check status
**Out of memory:** Gemma 3 27B needs ~20GB VRAM — use A100 40GB+
