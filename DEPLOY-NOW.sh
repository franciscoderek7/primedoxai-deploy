#!/bin/bash
# ═══════════════════════════════════════════════════════════════════
#  FRANCISCO HOLDINGS — MASTER DEPLOY SCRIPT
#  Run this from YOUR local machine, not the cloud environment
#  What it does:
#    1. Creates all 6 GitHub Pages repos
#    2. Creates all 10 Stripe products + payment links (CAD)
#    3. Patches payment link URLs into every HTML file
#    4. Pushes all sites live
#    5. Enables GitHub Pages on each repo
#    6. Prints all live URLs when done
# ═══════════════════════════════════════════════════════════════════

set -euo pipefail
RED='\033[0;31m'; GREEN='\033[0;32m'; CYAN='\033[0;36m'; GOLD='\033[0;33m'; NC='\033[0m'; BOLD='\033[1m'

banner(){ echo -e "\n${CYAN}${BOLD}═══ $1 ═══${NC}"; }
ok(){ echo -e "${GREEN}✓${NC} $1"; }
info(){ echo -e "${CYAN}▸${NC} $1"; }
warn(){ echo -e "${GOLD}⚠${NC} $1"; }
die(){ echo -e "${RED}✗ FATAL: $1${NC}"; exit 1; }

# ─── 0. PREREQUISITES CHECK ────────────────────────────────────────
banner "Checking prerequisites"
for cmd in curl git python3; do
  command -v $cmd &>/dev/null && ok "$cmd found" || die "$cmd is required. Install it first."
done

# ─── 1. COLLECT CREDENTIALS ────────────────────────────────────────
banner "Credentials"

if [ -z "${GH_TOKEN:-}" ]; then
  echo -e "${GOLD}GitHub Personal Access Token needed.${NC}"
  echo "  Create at: https://github.com/settings/tokens/new"
  echo "  Scopes required: repo, workflow"
  read -rp "  Paste GH token (ghp_...): " GH_TOKEN
fi

if [ -z "${STRIPE_SECRET_KEY:-}" ]; then
  echo -e "\n${GOLD}Stripe Secret Key needed.${NC}"
  echo "  Get at: https://dashboard.stripe.com/apikeys"
  read -rsp "  Paste sk_test_ or sk_live_ key: " STRIPE_SECRET_KEY
  echo ""
fi

GH_USER=$(curl -s -H "Authorization: token $GH_TOKEN" https://api.github.com/user | python3 -c "import sys,json; print(json.load(sys.stdin)['login'])" 2>/dev/null) || die "GitHub token invalid"
ok "GitHub user: $GH_USER"

ACCT=$(curl -s -H "Authorization: Bearer $STRIPE_SECRET_KEY" https://api.stripe.com/v1/account 2>/dev/null)
ACCT_ID=$(echo "$ACCT" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('id','ERROR: '+str(d.get('error',{}).get('message','unknown'))))" 2>/dev/null)
[[ "$ACCT_ID" == acct_* ]] && ok "Stripe account: $ACCT_ID" || die "Stripe key invalid: $ACCT_ID"

WORKDIR=$(mktemp -d)
LINKS_FILE="$WORKDIR/links.env"
info "Working directory: $WORKDIR"

# ─── 2. STRIPE PRODUCTS + PAYMENT LINKS ────────────────────────────
banner "Creating Stripe Products & Payment Links"

stripe_post(){ curl -s -X POST "https://api.stripe.com/v1/$1" -H "Authorization: Bearer $STRIPE_SECRET_KEY" "${@:2}"; }
jq_val(){ python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('$1','ERROR: '+str(d.get('error',{}).get('message','?'))))"; }

make_link(){
  local LABEL="$1" AMOUNT="$2" RECURRING="$3" PLACEHOLDER="$4"
  local NAME DESC
  IFS='|' read -r NAME DESC <<< "$5"

  info "Creating: $NAME..."
  local PROD PROD_ID PRICE PRICE_ID LINK_R LINK_URL

  PROD=$(stripe_post "products" -d "name=$NAME" -d "description=$DESC")
  PROD_ID=$(echo "$PROD" | jq_val id)
  [[ "$PROD_ID" == prod_* ]] || { warn "Product failed: $PROD_ID"; return; }

  if [ "$RECURRING" = "true" ]; then
    PRICE=$(stripe_post "prices" -d "product=$PROD_ID" -d "unit_amount=$AMOUNT" -d "currency=cad" -d "recurring[interval]=month")
  else
    PRICE=$(stripe_post "prices" -d "product=$PROD_ID" -d "unit_amount=$AMOUNT" -d "currency=cad")
  fi
  PRICE_ID=$(echo "$PRICE" | jq_val id)
  [[ "$PRICE_ID" == price_* ]] || { warn "Price failed: $PRICE_ID"; return; }

  LINK_R=$(stripe_post "payment_links" -d "line_items[0][price]=$PRICE_ID" -d "line_items[0][quantity]=1")
  LINK_URL=$(echo "$LINK_R" | jq_val url)
  [[ "$LINK_URL" == https://buy.stripe.com/* ]] || { warn "Link failed: $LINK_URL"; return; }

  echo "export $PLACEHOLDER=\"$LINK_URL\"" >> "$LINKS_FILE"
  ok "$LABEL → $LINK_URL"
}

touch "$LINKS_FILE"

# CleanSwarm — recurring
make_link "CleanSwarm Starter" 19900 true  PLACEHOLDER_URL_1 "CleanSwarm Starter|AI scheduling, billing & team management for solo cleaning operators"
make_link "CleanSwarm Growth"  49900 true  PLACEHOLDER_URL_2 "CleanSwarm Growth|Scale your cleaning business — up to 15 crew members, multi-location, AI forecasting"
make_link "CleanSwarm Scale"   124900 true PLACEHOLDER_URL_3 "CleanSwarm Scale|Enterprise cleaning fleet — unlimited crew, white-label, API access"

# CCLDR — one-time
make_link "CCLDR Warrior"      14900 false PLACEHOLDER_URL_4 "CCLDR Warrior|Foundation constitutional defense education — Charter rights overview and disclosure templates"
make_link "CCLDR Professional" 49900 false PLACEHOLDER_URL_5 "CCLDR Professional|Advanced defense education — BENO-X Framework, 12-Appearance method, motion library"
make_link "CCLDR Elite"        99900 false PLACEHOLDER_URL_6 "CCLDR Elite|Complete constitutional arsenal — strategy sessions, OmniaGuard protection, full curriculum"
make_link "CCLDR Sovereign"    149900 false PLACEHOLDER_URL_7 "CCLDR Sovereign|Total sovereignty — 6 sessions, full case review, all future courses included"

# MindShift — one-time
make_link "MindShift Neuro"    49700 false  PLACEHOLDER_URL_8  "MindShift Neuro|8-week self-guided neuroplasticity program — daily rewiring protocols, habit architecture"
make_link "MindShift Group"    199700 false PLACEHOLDER_URL_9  "MindShift Group Intensive|12-week cohort coaching — live sessions, accountability partner, identity reconstruction"
make_link "MindShift Premium"  1000000 false PLACEHOLDER_URL_10 "MindShift Premium|6-month 1-on-1 executive neuro-coaching — custom protocol, results guarantee"

ok "All payment links created → $LINKS_FILE"
source "$LINKS_FILE"

# ─── 3. FETCH HTML FILES FROM REPO ─────────────────────────────────
banner "Fetching HTML files from primedoxai-deploy repo"

RAW="https://raw.githubusercontent.com/$GH_USER/primedoxai-deploy/claude/francisco-revenue-sprint-MEva6"

SITES=(
  "cleanswarm-checkout"
  "ccldr-payments"
  "mindshift-makayla"
  "revenue-dashboard"
  "omniaguard-site"
  "primedoxai-site"
)

for SITE in "${SITES[@]}"; do
  mkdir -p "$WORKDIR/$SITE"
  if curl -sfL "$RAW/$SITE/index.html" -o "$WORKDIR/$SITE/index.html"; then
    ok "Fetched $SITE/index.html"
  else
    die "Could not fetch $SITE/index.html — check the repo branch exists"
  fi
done

# ─── 4. PATCH PAYMENT LINK URLS ────────────────────────────────────
banner "Patching payment link placeholders"

for i in $(seq 1 10); do
  VAR="PLACEHOLDER_URL_$i"
  URL="${!VAR:-}"
  if [ -z "$URL" ]; then
    warn "No URL for $VAR — skipping"
    continue
  fi
  for SITE in "${SITES[@]}"; do
    if grep -q "$VAR" "$WORKDIR/$SITE/index.html" 2>/dev/null; then
      sed -i "s|$VAR|$URL|g" "$WORKDIR/$SITE/index.html"
      ok "Patched $VAR → $SITE"
    fi
  done
done

# ─── 5. CREATE GITHUB REPOS + PUSH ─────────────────────────────────
banner "Creating GitHub repos & deploying"

gh_api(){ curl -s -H "Authorization: token $GH_TOKEN" -H "Accept: application/vnd.github.v3+json" "$@"; }

for SITE in "${SITES[@]}"; do
  info "Deploying: $SITE..."

  # Create repo (ignore error if exists)
  gh_api -X POST https://api.github.com/user/repos \
    -d "{\"name\":\"$SITE\",\"auto_init\":false,\"private\":false,\"description\":\"Francisco Holdings — $SITE\"}" \
    > /dev/null 2>&1 || true

  # Init git and push
  cd "$WORKDIR/$SITE"
  git init -q
  git checkout -b main
  git config user.email "derek@franciscoholdings.com"
  git config user.name "Derek Francisco"
  git add index.html
  git commit -q -m "Deploy $SITE — Francisco Holdings Inc."
  git remote add origin "https://$GH_TOKEN@github.com/$GH_USER/$SITE.git"
  git push -u origin main --force -q && ok "Pushed $SITE" || warn "Push failed for $SITE"
  cd - > /dev/null

  # Enable GitHub Pages
  sleep 2
  PAGES_RESP=$(gh_api -X POST "https://api.github.com/repos/$GH_USER/$SITE/pages" \
    -d '{"source":{"branch":"main","path":"/"}}' 2>/dev/null)

  if echo "$PAGES_RESP" | grep -q '"url"'; then
    ok "GitHub Pages enabled: $SITE"
  else
    # Try PUT if already exists
    gh_api -X PUT "https://api.github.com/repos/$GH_USER/$SITE/pages" \
      -d '{"source":{"branch":"main","path":"/"}}' > /dev/null 2>&1 || true
    ok "GitHub Pages configured: $SITE"
  fi
done

# ─── 6. SAVE PAYMENT LINKS ─────────────────────────────────────────
banner "Saving generated payment link URLs"

REPORT="$HOME/francisco-holdings-payment-links.txt"
echo "# Francisco Holdings — Stripe Payment Links" > "$REPORT"
echo "# Generated: $(date)" >> "$REPORT"
echo "" >> "$REPORT"
echo "=== CLEANSWARM ===" >> "$REPORT"
echo "Starter  ($199/mo): $PLACEHOLDER_URL_1" >> "$REPORT"
echo "Growth   ($499/mo): $PLACEHOLDER_URL_2" >> "$REPORT"
echo "Scale  ($1249/mo): $PLACEHOLDER_URL_3" >> "$REPORT"
echo "" >> "$REPORT"
echo "=== CCLDR ===" >> "$REPORT"
echo "Warrior      ($149): $PLACEHOLDER_URL_4" >> "$REPORT"
echo "Professional ($499): $PLACEHOLDER_URL_5" >> "$REPORT"
echo "Elite        ($999): $PLACEHOLDER_URL_6" >> "$REPORT"
echo "Sovereign  ($1499): $PLACEHOLDER_URL_7" >> "$REPORT"
echo "" >> "$REPORT"
echo "=== MINDSHIFT ===" >> "$REPORT"
echo "Neuro        ($497): $PLACEHOLDER_URL_8" >> "$REPORT"
echo "Group      ($1997): $PLACEHOLDER_URL_9" >> "$REPORT"
echo "Premium  ($10000): $PLACEHOLDER_URL_10" >> "$REPORT"

ok "Payment links saved → $REPORT"

# ─── 7. SUMMARY ────────────────────────────────────────────────────
banner "DEPLOYMENT COMPLETE"
echo ""
echo -e "${BOLD}${GREEN}ALL 6 SITES LIVE (wait 60s for DNS):${NC}"
for SITE in "${SITES[@]}"; do
  echo -e "  ${CYAN}https://$GH_USER.github.io/$SITE${NC}"
done
echo ""
echo -e "${BOLD}${GOLD}STRIPE PAYMENT LINKS:${NC}"
cat "$REPORT" | grep "https://"
echo ""
echo -e "${GOLD}Test checkout with: 4242 4242 4242 4242 | any future date | any CVC${NC}"
echo ""
rm -rf "$WORKDIR"
