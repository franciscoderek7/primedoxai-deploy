#!/usr/bin/env bash
# push_to_omniaguard.sh
# =====================
# Pushes the fixed OmniaGuard site files to franciscoderek7/omniaguard repo.
# Run this on YOUR LOCAL MACHINE with a GitHub token that has 'repo' scope.
#
#   export GITHUB_TOKEN=ghp_yourtoken
#   bash setup/push_to_omniaguard.sh
#
# What this does:
#   1. Clones franciscoderek7/omniaguard into /tmp/omniaguard-deploy
#   2. Copies the fixed omniaguard-site/index.html, pricing.html, app/index.html
#   3. Commits with fix message
#   4. Pushes to main — live on omniaguard.com within 2 minutes

set -e

GITHUB_TOKEN="${GITHUB_TOKEN:-}"
if [ -z "$GITHUB_TOKEN" ]; then
  echo "ERROR: Set GITHUB_TOKEN before running."
  echo "  export GITHUB_TOKEN=ghp_yourtoken"
  exit 1
fi

REPO_URL="https://${GITHUB_TOKEN}@github.com/franciscoderek7/omniaguard.git"
WORK_DIR="/tmp/omniaguard-deploy"
SOURCE_DIR="$(cd "$(dirname "$0")/.." && pwd)/omniaguard-site"

echo ""
echo "======================================="
echo "  OMNIAGUARD DEPLOY — HOTFIX"
echo "======================================="
echo ""

# Clean previous clone
rm -rf "$WORK_DIR"
echo "  Cloning franciscoderek7/omniaguard..."
git clone --depth 1 "$REPO_URL" "$WORK_DIR"

echo "  Copying fixed files..."
cp "$SOURCE_DIR/index.html"            "$WORK_DIR/index.html"
cp "$SOURCE_DIR/pricing.html"          "$WORK_DIR/pricing.html"
cp "$SOURCE_DIR/vpn.html"              "$WORK_DIR/vpn.html"
cp "$SOURCE_DIR/intelligence.html"     "$WORK_DIR/intelligence.html"
cp "$SOURCE_DIR/ecosystem.html"        "$WORK_DIR/ecosystem.html"
cp "$SOURCE_DIR/investor.html"         "$WORK_DIR/investor.html"
mkdir -p "$WORK_DIR/app"
cp "$SOURCE_DIR/app/index.html"        "$WORK_DIR/app/index.html"

echo "  Staging and committing..."
cd "$WORK_DIR"
git add index.html pricing.html vpn.html intelligence.html ecosystem.html investor.html app/index.html
git diff --cached --stat

git commit -m "fix: OMNIAGUARD spelling + Stripe mailto fallback on all 7 tiers

- Hero H1 now reads OMNIAGUARD (was OMNIGUARD on live site)
- All 35 PASTE_STRIPE_LINK_HERE_* placeholders replaced with
  tier-specific mailto: links so every button click generates a lead
- OmniaGuard referral URL corrected (omniguard.com → omniaguard.com)
- Comprehensive 7-tier pricing replaces older 3-tier design"

echo "  Pushing to main..."
git push origin main

echo ""
echo "  DONE. omniaguard.com will update in ~2 minutes."
echo "  Verify: https://omniaguard.com"
echo ""
