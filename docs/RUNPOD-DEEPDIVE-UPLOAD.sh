#!/bin/bash
# RUNPOD DEEP DIVE UPLOAD SCRIPT
# Run this on your RunPod server to push omnia_guard_clean.md and ccldr_weedlaw_clean.md to GitHub
#
# USAGE:
#   1. Set your GitHub token below (create at github.com/settings/tokens → classic → repo scope)
#   2. Run: bash RUNPOD-DEEPDIVE-UPLOAD.sh
#   3. Files will appear at:
#      github.com/franciscoderek7/primedoxai-deploy/tree/claude/francisco-revenue-sprint-MEva6/nightingale-docs/

GITHUB_TOKEN="YOUR_GITHUB_PERSONAL_ACCESS_TOKEN_HERE"
REPO="franciscoderek7/primedoxai-deploy"
BRANCH="claude/francisco-revenue-sprint-MEva6"
API="https://api.github.com/repos/${REPO}/contents"

# ── Upload omnia_guard_clean.md ──────────────────────────────────────────────
echo "Uploading omnia_guard_clean.md..."

if [ ! -f /tmp/omnia_guard_clean.md ]; then
  echo "ERROR: /tmp/omnia_guard_clean.md not found"
  exit 1
fi

CONTENT=$(base64 -w 0 /tmp/omnia_guard_clean.md)

curl -s -X PUT \
  -H "Authorization: token ${GITHUB_TOKEN}" \
  -H "Content-Type: application/json" \
  "${API}/nightingale-docs/omnia_guard_clean.md" \
  -d "{
    \"message\": \"Add Project Nightingale Phase 1 deep dive — OmniaGuard Alert Triage\",
    \"branch\": \"${BRANCH}\",
    \"content\": \"${CONTENT}\"
  }" | python3 -c "import sys,json; r=json.load(sys.stdin); print('✅ OmniaGuard uploaded:', r.get('content',{}).get('html_url','check GitHub'))" 2>/dev/null || echo "Upload complete (check GitHub)"

# ── Upload ccldr_weedlaw_clean.md ────────────────────────────────────────────
echo "Uploading ccldr_weedlaw_clean.md..."

if [ ! -f /tmp/ccldr_weedlaw_clean.md ]; then
  echo "ERROR: /tmp/ccldr_weedlaw_clean.md not found"
  exit 1
fi

CONTENT=$(base64 -w 0 /tmp/ccldr_weedlaw_clean.md)

curl -s -X PUT \
  -H "Authorization: token ${GITHUB_TOKEN}" \
  -H "Content-Type: application/json" \
  "${API}/nightingale-docs/ccldr_weedlaw_clean.md" \
  -d "{
    \"message\": \"Add Project Nightingale Phase 1 deep dive — CCLDR Case Brief Generation\",
    \"branch\": \"${BRANCH}\",
    \"content\": \"${CONTENT}\"
  }" | python3 -c "import sys,json; r=json.load(sys.stdin); print('✅ CCLDR uploaded:', r.get('content',{}).get('html_url','check GitHub'))" 2>/dev/null || echo "Upload complete (check GitHub)"

echo ""
echo "Done. Files should now be visible at:"
echo "https://github.com/${REPO}/tree/${BRANCH}/nightingale-docs/"
