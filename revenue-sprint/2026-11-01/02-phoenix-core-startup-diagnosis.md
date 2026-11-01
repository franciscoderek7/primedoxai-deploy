# FHI SPRINT 2 / EMERGENCY SPRINT — STEP 2
## Phoenix Core Startup Dependency — Diagnosis

Date: 2026-11-01
Method: read-only inspection of git history. No file was modified, staged,
committed or pushed. No module was created.

---

## 1. ROOT CAUSE — CONFIRMED, SINGLE LINE

**File:** `phoenix-core/index.js` (on branch `main` — see §4)
**Line 21:**

```js
const businessRoute=require('../primedoxai-system/api/business');
```

**Line 93:**

```js
app.use('/api/business',businessRoute);
```

`require` at line 21 runs at module load, before `app.listen()`. It resolves to
a path **one directory above `phoenix-core/`** — a sibling folder named
`primedoxai-system`. That folder does not exist, so Node throws
`MODULE_NOT_FOUND` and the process dies before the server ever binds a port.

This is the entire failure. It is not a dependency-version problem, not an
`npm install` problem, and not a configuration problem.

---

## 2. EVIDENCE THAT `primedoxai-system` IS NOT IN THIS REPOSITORY

| Check | Command | Result |
|-------|---------|--------|
| Present on disk | `ls -d primedoxai-system` | No such file or directory |
| In any branch's tree | `git ls-tree -r <ref>` over every local and remote ref | **absent from every ref** |
| Ever added in history | `git log --all --diff-filter=A --name-only` | **never added** |
| Referenced anywhere else | grep across the whole working tree | 0 other references |

So the module has **never been committed to `primedoxai-deploy`**. It exists
only outside this repository — most plausibly as an untracked folder in the
Termux / phone copy, which this session cannot reach.

**Corollary:** the `/api/business` endpoint has never worked from a clean clone
of this repository. It is not a regression; it is a reference to code that was
never checked in.

### Every other require in `phoenix-core/index.js` resolves

All other requires are relative to `phoenix-core/` and their targets are
committed on `main`: `routes/agents.js`, `routes/logs.js`, `commands/router.js`,
`routes/status.js`, `routes/control.js`, `routes/tasks.js`,
`routes/dashboard-live.js`, `routes/command-center.js`, `core/module-loader.js`,
`routes/router.js`, `routes/services.js`, `routes/system.js`,
`routes/dashboard.js`. Line 21 is the **only** dangling require in the whole
`phoenix-core` tree (verified by grepping every `.js` file for `require('../../`
and for `primedoxai-system`).

`phoenix-core/package.json` declares axios, compression, cors, dotenv, express 5,
express-rate-limit, morgan, socket.io, uuid — and `node_modules` is committed,
so npm dependencies are not the blocker either.

---

## 3. OPTIONS — AND WHAT I WILL NOT DO

The brief says: **do not create a fake replacement module just to make startup
succeed.** I have not, and will not. Creating a stub `api/business` would make
the banner print while `/api/business` silently returned nothing real — that is
exactly the false-green outcome the instruction forbids.

| # | Option | Effect | Verdict |
|---|--------|--------|---------|
| **A** | **Supply the real module.** Locate `primedoxai-system/api/business` where it actually exists and commit it into this repo (or vendor it under `phoenix-core/`). | `/api/business` works for real. | **Correct fix — blocked.** The source is not reachable from this session. Needs the file from the machine that has it. |
| **B** | **Delete lines 21 and 93.** | Phoenix Core starts. `/api/business` returns 404. | **Smallest honest fix.** Removes a route that has never functioned in this repo. Loses nothing that worked. |
| **C** | Guard the require in `try/catch` and mount a route that returns HTTP 503 with an explicit "business module not present in this deployment" body. | Starts; the endpoint tells the truth about why it is unavailable. | Acceptable — it does not pretend to work — but more code than B for no gain unless you want the endpoint to be self-documenting. |
| **D** | Restore `phoenix-core/index.js.backup` (89 lines) over the current 103-line file. | Starts, but **regresses.** | **Rejected.** The backup predates `commandCenterRoute`, `dashboardLiveRoute` and `loadModules(app)`, and re-enables a `routes/products` require that is also commented out as "route not created yet". Reverting to it would trade one broken require for another and drop three working features. |

### Recommendation

**Option B**, as a two-line deletion, *if and only if* you confirm you do not
need `/api/business` served by Phoenix Core right now. If you do need it,
Option A is the real fix and I need the module's contents.

Proposed diff (NOT applied):

```diff
@@ phoenix-core/index.js:21
-const businessRoute=require('../primedoxai-system/api/business');
-
@@ phoenix-core/index.js:93
-app.use('/api/business',businessRoute);
-
```

---

## 4. WHY THIS IS NOT A ONE-COMMAND FIX — BRANCH SCOPE

`phoenix-core/` exists **only on `main`** (added in `7085b54`, extended in
`eec63d5`). It is **not present** on `claude/francisco-revenue-sprint-MEva6`, and
not on the current working branch `claude/revenue-intake-review`.

Per CLAUDE.md, pushing to any repo's `main` requires your direct order. So:

- I cannot land this fix on the designated feature branch — the file is not there.
- Landing it on `main` needs your explicit sign-off.

**Status: BLOCKED pending your decision on (a) Option A vs B vs C, and
(b) authorization to touch `main`.**

---

## 5. WHAT I HAVE NOT VERIFIED

- I have **not run** Phoenix Core. The `MODULE_NOT_FOUND` conclusion is derived
  from static analysis of the require path plus proof the target is absent from
  every ref; it is not a reproduced stack trace. The reported startup failure
  you described is consistent with it, but I did not observe the failure myself.
- I have not checked whether the Termux copy's `index.js` matches `main`'s. If
  the phone copy has diverged, the failing line there may differ.
- Phoenix Core is **not deployed** anywhere I can see: no workflow under
  `.github/workflows/` references `phoenix-core`. It is local-run only.
