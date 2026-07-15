# primedoxai-deploy

## Runtime Engine (FloorManager)

- `engine/` — `FloorInterface.js` (init/update/destroy contract), `FloorManager.js`
  (mounts exactly one floor at a time: destroy old → fetch state → init new),
  `FloorRegistry.js` (hard imports for floors 1–10, no dynamic imports elsewhere).
- `floors/Floor1` — Francisco Holdings HQ placeholder.
- `floors/Floor2` — OMNIAGUARD, wrapping the existing Three.js scene in
  `empire/floors/floor4-omniguard.js` into the FloorInterface contract.
- `floors/Floor3`–`Floor10` — minimal branded placeholder stubs.
- `backend/` — FastAPI skeleton: `GET /api/floors/{id}/state`, `GET /health`.
  In-memory state only (`state_store.py`), GET-only, no WebSockets, no auth yet.

## GitOps Deployment Flow

```
feature/* → dev → staging → main
```

- `main` is production. **Never push directly to `main`.**
- All work lands on a `feature/*` branch, merges up to `dev`, then `staging`,
  then `main` — each step is a PR.
- `staging → main` is **CI-gated**: `.github/workflows/ci.yml` must pass
  (backend pytest, frontend JS syntax check, `/health` boot check) before
  that merge happens.
- **Manual step required from Derek**: GitHub branch protection (PR required,
  1 review minimum, status checks required, no force-push on `main`) must be
  turned on in this repo's Settings → Branches UI. That cannot be configured
  from a workflow file or from this assistant's repo-scoped tools — it's a
  one-time setting only an account owner can flip.
