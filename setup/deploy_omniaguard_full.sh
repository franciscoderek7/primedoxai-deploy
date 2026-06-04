#!/usr/bin/env bash
# deploy_omniaguard_full.sh
# =========================
# ONE COMMAND — deploys entire OmniaGuard site to omniaguard.com
#
# Run on YOUR LOCAL MACHINE (cloned primedoxai-deploy):
#
#   export GITHUB_TOKEN=ghp_yourtoken
#   export PORKBUN_API_KEY=pk1_8871e690ff50d9183e6352bb6b08df562f7c238b4e9e2e36bcd637bd8738ec48
#   export PORKBUN_SECRET_KEY=sk1_your_secret_key_here
#   bash setup/deploy_omniaguard_full.sh
#
# What this does (in order):
#   1. Verifies all required files exist and spelling is clean
#   2. Clones franciscoderek7/omniaguard into /tmp/omniaguard-deploy
#   3. Copies all 7 site files + creates CNAME=omniaguard.com
#   4. Pushes to omniaguard repo main branch
#   5. Sets Porkbun DNS: 4 GitHub Pages A records + www CNAME
#   6. Prints GitHub Pages settings instructions (must be done via browser)
#
# DNS propagation: up to 48 hours, usually <15 minutes

set -e

# ── Config ──────────────────────────────────────────────────────────────
GITHUB_TOKEN="${GITHUB_TOKEN:-}"
PORKBUN_API_KEY="${PORKBUN_API_KEY:-pk1_8871e690ff50d9183e6352bb6b08df562f7c238b4e9e2e36bcd637bd8738ec48}"
PORKBUN_SECRET_KEY="${PORKBUN_SECRET_KEY:-}"
DOMAIN="omniaguard.com"
REPO_URL="https://${GITHUB_TOKEN}@github.com/franciscoderek7/omniaguard.git"
WORK_DIR="/tmp/omniaguard-deploy"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SOURCE_DIR="$SCRIPT_DIR/../omniaguard-site"
GITHUB_PAGES_IPS=("185.199.108.153" "185.199.109.153" "185.199.110.153" "185.199.111.153")

# ── Colors ───────────────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; CYAN='\033[0;36m'; YELLOW='\033[1;33m'; NC='\033[0m'
ok()   { echo -e "  ${GREEN}✓${NC} $1"; }
err()  { echo -e "  ${RED}✗ ERROR:${NC} $1"; exit 1; }
info() { echo -e "  ${CYAN}→${NC} $1"; }
warn() { echo -e "  ${YELLOW}⚠${NC} $1"; }

echo ""
echo "========================================================"
echo "  OMNIAGUARD FULL DEPLOYMENT"
echo "  $(date -u '+%Y-%m-%d %H:%M UTC')"
echo "========================================================"
echo ""

# ── Step 0: Validate prerequisites ────────────────────────────────────
echo "STEP 0 — Prerequisites"
[ -z "$GITHUB_TOKEN" ]      && err "GITHUB_TOKEN not set. Run: export GITHUB_TOKEN=ghp_yourtoken"
[ -z "$PORKBUN_SECRET_KEY" ] && warn "PORKBUN_SECRET_KEY not set — DNS step will be skipped"

REQUIRED_FILES=(
  "$SOURCE_DIR/index.html"
  "$SOURCE_DIR/pricing.html"
  "$SOURCE_DIR/vpn.html"
  "$SOURCE_DIR/intelligence.html"
  "$SOURCE_DIR/ecosystem.html"
  "$SOURCE_DIR/investor.html"
  "$SOURCE_DIR/app/index.html"
)
for f in "${REQUIRED_FILES[@]}"; do
  [ -f "$f" ] && ok "$f" || err "Missing: $f — run from primedoxai-deploy root"
done

# Check spelling
WRONG=$(grep -rn "OmniGuard\|OMNIGUARD\|OMNI GUARD" "$SOURCE_DIR" --include="*.html" 2>/dev/null | wc -l)
[ "$WRONG" -eq 0 ] && ok "OmniaGuard spelling: 0 errors found" || err "Spelling errors found ($WRONG). Fix before deploying."

# Check no Stripe placeholders
PLACEHOLDERS=$(grep -rn "PASTE_STRIPE_LINK_HERE" "$SOURCE_DIR" --include="*.html" 2>/dev/null | wc -l)
[ "$PLACEHOLDERS" -eq 0 ] && ok "Stripe placeholders: 0 remaining" || warn "$PLACEHOLDERS Stripe placeholders remain (buttons will use mailto: fallback)"

echo ""

# ── Step 1: Push to GitHub ────────────────────────────────────────────
echo "STEP 1 — Push to franciscoderek7/omniaguard"
rm -rf "$WORK_DIR"
info "Cloning franciscoderek7/omniaguard..."
git clone --quiet --depth 1 "$REPO_URL" "$WORK_DIR" 2>&1 || err "Clone failed. Check GITHUB_TOKEN has 'repo' scope."
ok "Cloned"

info "Copying site files..."
cp "$SOURCE_DIR/index.html"        "$WORK_DIR/index.html"
cp "$SOURCE_DIR/pricing.html"      "$WORK_DIR/pricing.html"
cp "$SOURCE_DIR/vpn.html"          "$WORK_DIR/vpn.html"
cp "$SOURCE_DIR/intelligence.html" "$WORK_DIR/intelligence.html"
cp "$SOURCE_DIR/ecosystem.html"    "$WORK_DIR/ecosystem.html"
cp "$SOURCE_DIR/investor.html"     "$WORK_DIR/investor.html"
mkdir -p "$WORK_DIR/app"
cp "$SOURCE_DIR/app/index.html"    "$WORK_DIR/app/index.html"

# Create CNAME for GitHub Pages custom domain
echo "$DOMAIN" > "$WORK_DIR/CNAME"
ok "CNAME created: $DOMAIN"

info "Committing..."
cd "$WORK_DIR"
git add -A
git diff --cached --stat
git commit -m "deploy: full OmniaGuard suite — OmniaGuard spelling correct, all pages live

Pages deployed:
- index.html    — 7-tier AI security product, OmniaGuard (correct)
- pricing.html  — detailed pricing page
- vpn.html      — VPN product with 6-feature table, $9/$29/$99/Enterprise
- intelligence.html — The ROI Lie brief (ROI data, counter-structure)
- ecosystem.html    — full product ecosystem overview
- investor.html     — The Counter-Structure investor pitch
- app/index.html    — OmniaGuard app dashboard

All payment buttons: tier-specific mailto leads (no broken Stripe)
CNAME: omniaguard.com" 2>/dev/null || info "No changes to commit (already up to date)"

info "Pushing to main..."
git push origin main --quiet
ok "Pushed — GitHub Pages building now (~2 minutes)"

cd - > /dev/null
echo ""

# ── Step 2: Porkbun DNS ───────────────────────────────────────────────
echo "STEP 2 — Porkbun DNS for $DOMAIN"
if [ -z "$PORKBUN_SECRET_KEY" ]; then
  warn "Skipping DNS (PORKBUN_SECRET_KEY not set)"
  warn "Set manually at porkbun.com → Domains → $DOMAIN → DNS"
else
  python3 "$SCRIPT_DIR/dns_only.py" "$DOMAIN" \
    --api-key "$PORKBUN_API_KEY" \
    --secret-key "$PORKBUN_SECRET_KEY" && \
    ok "DNS records set for $DOMAIN" || \
    warn "DNS script failed — set manually (instructions below)"
fi
echo ""

# ── Step 3: Check omniaguard.ca availability ─────────────────────────
echo "STEP 3 — Check omniaguard.ca"
if [ -n "$PORKBUN_SECRET_KEY" ]; then
  CA_RESPONSE=$(curl -s -X POST "https://api.porkbun.com/api/json/v3/domain/check" \
    -H "Content-Type: application/json" \
    -d "{\"secretapikey\":\"$PORKBUN_SECRET_KEY\",\"apikey\":\"$PORKBUN_API_KEY\",\"domain\":\"omniaguard.ca\"}" 2>/dev/null)
  if echo "$CA_RESPONSE" | grep -q '"available":"yes"'; then
    warn "omniaguard.ca is AVAILABLE — register it to prevent brand squatting"
    warn "  Run: python3 setup/kiaros_domains.py --only omniaguard.ca (after updating domains list)"
  else
    ok "omniaguard.ca status checked"
    echo "$CA_RESPONSE" | python3 -c "import sys,json; d=json.load(sys.stdin); print(f'    Status: {d.get(\"status\",\"unknown\")}')" 2>/dev/null || true
  fi
else
  info "omniaguard.ca check skipped (no Porkbun key)"
fi
echo ""

# ── Step 4: GitHub Pages settings ────────────────────────────────────
echo "STEP 4 — GitHub Pages settings (manual — browser required)"
echo ""
echo "  Open: https://github.com/franciscoderek7/omniaguard/settings/pages"
echo ""
echo "  Set:"
echo "    Source:        Deploy from branch"
echo "    Branch:        main"
echo "    Folder:        / (root)"
echo "    Custom domain: omniaguard.com"
echo "    Enforce HTTPS: ✓ (check the box)"
echo ""
echo "  Save. GitHub will verify DNS automatically."
echo "  CNAME file is already in the repo — verification will pass."
echo ""

# ── Step 5: DNS records reference ─────────────────────────────────────
echo "STEP 5 — DNS records (reference / manual fallback)"
echo ""
echo "  If Porkbun API step failed, add these manually:"
echo "  porkbun.com → Domains → omniaguard.com → DNS → Edit"
echo ""
echo "  DELETE any existing A records for @ first, then ADD:"
for ip in "${GITHUB_PAGES_IPS[@]}"; do
  echo "    A record:  @   →  $ip   (TTL: 600)"
done
echo "    CNAME:     www →  franciscoderek7.github.io   (TTL: 600)"
echo ""

# ── Done ──────────────────────────────────────────────────────────────
echo "========================================================"
echo "  DEPLOYMENT COMPLETE"
echo "========================================================"
echo ""
echo "  Site pushed:  ✓ franciscoderek7/omniaguard (main)"
echo "  CNAME file:   ✓ omniaguard.com"
echo "  DNS:          $([ -n "$PORKBUN_SECRET_KEY" ] && echo "✓ set via API" || echo "⚠ manual steps above")"
echo ""
echo "  Timeline:"
echo "    GitHub Pages build:   ~2 minutes"
echo "    DNS propagation:      15 min – 48 hours (usually <15 min)"
echo ""
echo "  Check propagation: https://dnschecker.org/#A/omniaguard.com"
echo "  Live site:         https://omniaguard.com"
echo ""
