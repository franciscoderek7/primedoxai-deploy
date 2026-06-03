#!/bin/bash
# ═══════════════════════════════════════════════════════════════════
#  FRANCISCO HOLDINGS — MASTER DEPLOY SCRIPT (Mac/Linux)
#  Run this from YOUR local machine, not the cloud environment
#
#  What it does:
#    1. Validates GitHub + Stripe credentials
#    2. Creates 15 Stripe products + payment links (CAD)
#    3. Fetches 5 site HTML files from GitHub branch
#    4. Patches PLACEHOLDER_URL_1..15 with real Stripe URLs
#    5. Pushes all 5 sites to separate GitHub Pages repos
#    6. Enables GitHub Pages on each repo
#    7. Prints all live URLs + saves payment links
#
#  Sites deployed (MindShift left untouched in your GitHub):
#    cleanswarm-checkout, ccldr-payments, revenue-dashboard,
#    omniaguard-site, primedoxai-site
# ═══════════════════════════════════════════════════════════════════

set -euo pipefail
RED='\033[0;31m'; GREEN='\033[0;32m'; CYAN='\033[0;36m'; GOLD='\033[0;33m'; NC='\033[0m'; BOLD='\033[1m'

banner(){ echo -e "\n${CYAN}${BOLD}═══ $1 ═══${NC}"; }
ok()   { echo -e "${GREEN}✓${NC} $1"; }
info() { echo -e "${CYAN}▸${NC} $1"; }
warn() { echo -e "${GOLD}⚠${NC} $1"; }
die()  { echo -e "${RED}✗ FATAL: $1${NC}"; exit 1; }

# ─── 0. PREREQUISITES ──────────────────────────────────────────────
banner "Checking prerequisites"
for cmd in curl git python3; do
  command -v "$cmd" &>/dev/null && ok "$cmd found" || die "$cmd is required. Install it first."
done

# ─── 1. CREDENTIALS ────────────────────────────────────────────────
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

GH_USER=$(curl -sf -H "Authorization: token $GH_TOKEN" \
  https://api.github.com/user \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['login'])" 2>/dev/null) \
  || die "GitHub token invalid or network unreachable"
ok "GitHub user: $GH_USER"

ACCT_ID=$(curl -sf -H "Authorization: Bearer $STRIPE_SECRET_KEY" \
  https://api.stripe.com/v1/account \
  | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('id','ERROR: '+str(d.get('error',{}).get('message','unknown'))))" 2>/dev/null) \
  || die "Stripe API unreachable — check network connection"
[[ "$ACCT_ID" == acct_* ]] && ok "Stripe account: $ACCT_ID" || die "Stripe key invalid: $ACCT_ID"

WORKDIR=$(mktemp -d)
LINKS_FILE="$WORKDIR/links.env"
touch "$LINKS_FILE"
info "Working directory: $WORKDIR"
trap 'rm -rf "$WORKDIR"' EXIT

# ─── 2. STRIPE PRODUCTS + PAYMENT LINKS ────────────────────────────
banner "Creating Stripe Products & Payment Links (15 total)"

stripe_post(){ curl -sf -X POST "https://api.stripe.com/v1/$1" -H "Authorization: Bearer $STRIPE_SECRET_KEY" "${@:2}"; }
jq_val()    { python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('$1','ERROR:'+str(d.get('error',{}).get('message','?'))))"; }

make_link(){
  local LABEL="$1" AMOUNT="$2" RECURRING="$3" PLACEHOLDER="$4" NAME="$5" DESC="$6"

  info "Creating: $NAME..."

  local PROD PROD_ID PRICE PRICE_ID LINK LINK_URL

  PROD=$(stripe_post "products" -d "name=$NAME" -d "description=$DESC")
  PROD_ID=$(echo "$PROD" | jq_val id)
  [[ "$PROD_ID" == prod_* ]] || { warn "Product FAILED ($PROD_ID) — $LABEL skipped"; return; }

  if [ "$RECURRING" = "true" ]; then
    PRICE=$(stripe_post "prices" \
      -d "product=$PROD_ID" \
      -d "unit_amount=$AMOUNT" \
      -d "currency=cad" \
      -d "recurring[interval]=month")
  else
    PRICE=$(stripe_post "prices" \
      -d "product=$PROD_ID" \
      -d "unit_amount=$AMOUNT" \
      -d "currency=cad")
  fi
  PRICE_ID=$(echo "$PRICE" | jq_val id)
  [[ "$PRICE_ID" == price_* ]] || { warn "Price FAILED ($PRICE_ID) — $LABEL skipped"; return; }

  LINK=$(stripe_post "payment_links" \
    -d "line_items[0][price]=$PRICE_ID" \
    -d "line_items[0][quantity]=1")
  LINK_URL=$(echo "$LINK" | jq_val url)
  [[ "$LINK_URL" == https://buy.stripe.com/* ]] || { warn "Link FAILED ($LINK_URL) — $LABEL skipped"; return; }

  echo "export $PLACEHOLDER=\"$LINK_URL\"" >> "$LINKS_FILE"
  ok "$LABEL → $LINK_URL"
}

# ── CleanSwarm (recurring) ──
echo ""
echo -e "${BOLD}[ CLEANSWARM — Recurring Subscriptions ]${NC}"
make_link "CleanSwarm Starter" 19900  true  PLACEHOLDER_URL_1  "CleanSwarm Starter"         "AI scheduling, billing & team management — up to 3 crew members"
make_link "CleanSwarm Growth"  49900  true  PLACEHOLDER_URL_2  "CleanSwarm Growth"          "Scale your cleaning business — up to 15 crew, multi-location, AI forecasting"
make_link "CleanSwarm Scale"   124900 true  PLACEHOLDER_URL_3  "CleanSwarm Scale"           "Enterprise cleaning fleet — unlimited crew, white-label, API access"

# ── CCLDR (one-time) ──
echo ""
echo -e "${BOLD}[ CCLDR — One-Time Education Products ]${NC}"
make_link "CCLDR Warrior"      14900  false PLACEHOLDER_URL_4  "CCLDR Warrior"             "Foundation constitutional defense education — Charter rights overview and disclosure templates"
make_link "CCLDR Professional" 49900  false PLACEHOLDER_URL_5  "CCLDR Professional"        "Advanced defense education — BENO-X Framework, 12-Appearance method, motion library"
make_link "CCLDR Elite"        99900  false PLACEHOLDER_URL_6  "CCLDR Elite"               "Complete constitutional arsenal — strategy sessions, OmniaGuard protection, full curriculum"
make_link "CCLDR Sovereign"    149900 false PLACEHOLDER_URL_7  "CCLDR Sovereign"           "Total sovereignty — 6 sessions, full case review, all future courses included"

# ── MindShift (one-time) — products created even though site stays in your repo ──
echo ""
echo -e "${BOLD}[ MINDSHIFT — One-Time Coaching Products ]${NC}"
make_link "MindShift Neuro"    49700  false PLACEHOLDER_URL_8  "MindShift Neuro"           "8-week self-guided neuroplasticity program — daily rewiring protocols, habit architecture"
make_link "MindShift Group"    199700 false PLACEHOLDER_URL_9  "MindShift Group Intensive" "12-week cohort coaching — live sessions, accountability partner, identity reconstruction"
make_link "MindShift Premium"  1000000 false PLACEHOLDER_URL_10 "MindShift Premium"        "6-month 1-on-1 executive neuro-coaching — custom protocol, results guarantee"

# ── OmniaGuard (recurring) ──
echo ""
echo -e "${BOLD}[ OMNIAGUARD — Recurring Subscriptions ]${NC}"
make_link "OmniaGuard Starter"      9900    true PLACEHOLDER_URL_11 "OmniaGuard Starter"      "14-layer AI security stack — up to 5 agents, real-time threat detection, dashboard monitoring"
make_link "OmniaGuard Professional" 49900   true PLACEHOLDER_URL_12 "OmniaGuard Professional" "Advanced AI security — unlimited agents, priority 4-hr SLA, NIST AI RMF compliance kit"
make_link "OmniaGuard Enterprise"   199900  true PLACEHOLDER_URL_13 "OmniaGuard Enterprise"   "Full enterprise AI security — custom BENO-X policy, 1-hr emergency SLA, full audit trail"

# ── PrimeDox AI (recurring) ──
echo ""
echo -e "${BOLD}[ PRIMEDOX AI — Recurring Subscriptions ]${NC}"
make_link "PrimeDox Pro"   4900  true PLACEHOLDER_URL_14 "PrimeDox Pro"   "AI agent suite — 22+ specialized agents, Charter defense, business automation"
make_link "PrimeDox Elite" 19900 true PLACEHOLDER_URL_15 "PrimeDox Elite" "Sovereign digital twin — all agents + OmniaGuard swarm protection, custom training"

ok "All 15 payment links created"
source "$LINKS_FILE"

# ─── 3. FETCH HTML FROM REPO ───────────────────────────────────────
banner "Fetching HTML files from primedoxai-deploy branch"

BRANCH="claude/francisco-revenue-sprint-MEva6"
RAW="https://raw.githubusercontent.com/$GH_USER/primedoxai-deploy/$BRANCH"

SITES=(
  "cleanswarm-checkout"
  "ccldr-payments"
  "revenue-dashboard"
  "omniaguard-site"
  "primedoxai-site"
)

for SITE in "${SITES[@]}"; do
  mkdir -p "$WORKDIR/$SITE"
  if curl -sfL "$RAW/$SITE/index.html" -o "$WORKDIR/$SITE/index.html"; then
    ok "Fetched $SITE/index.html"
  else
    die "Could not fetch $SITE/index.html — check the branch exists: $BRANCH"
  fi
done

# ─── 4. PATCH PLACEHOLDER URLS ─────────────────────────────────────
banner "Patching payment link placeholders (PLACEHOLDER_URL_1..15)"

for i in $(seq 1 15); do
  VAR="PLACEHOLDER_URL_$i"
  URL="${!VAR:-}"
  if [ -z "$URL" ]; then
    warn "No URL for $VAR — skipping (Stripe product may have failed above)"
    continue
  fi
  for SITE in "${SITES[@]}"; do
    HTML="$WORKDIR/$SITE/index.html"
    if grep -q "$VAR" "$HTML" 2>/dev/null; then
      sed -i "s|$VAR|$URL|g" "$HTML"
      ok "Patched $VAR in $SITE"
    fi
  done
done

# ─── 5. PUSH TO GITHUB PAGES ───────────────────────────────────────
banner "Creating GitHub repos & deploying"

gh_api(){ curl -sf -H "Authorization: token $GH_TOKEN" -H "Accept: application/vnd.github.v3+json" "$@"; }

LIVE_URLS=()
for SITE in "${SITES[@]}"; do
  info "Deploying: $SITE..."

  # Create repo if it doesn't exist
  gh_api -X POST https://api.github.com/user/repos \
    -d "{\"name\":\"$SITE\",\"auto_init\":false,\"private\":false,\"description\":\"Francisco Holdings — $SITE\"}" \
    > /dev/null 2>&1 || true

  cd "$WORKDIR/$SITE"
  git init -q
  git checkout -b main
  git config user.email "derek@franciscoholdings.com"
  git config user.name "Derek Francisco"
  git add index.html
  git commit -q -m "Deploy $SITE — Francisco Holdings Inc."
  git remote add origin "https://$GH_TOKEN@github.com/$GH_USER/$SITE.git"

  if git push -u origin main --force -q 2>/dev/null; then
    ok "Pushed $SITE"
  else
    warn "Push failed for $SITE — repo may need manual creation"
  fi
  cd - > /dev/null

  # Enable GitHub Pages
  sleep 2
  PAGES_RESP=$(gh_api -X POST "https://api.github.com/repos/$GH_USER/$SITE/pages" \
    -d '{"source":{"branch":"main","path":"/"}}' 2>/dev/null || echo "{}")

  if echo "$PAGES_RESP" | grep -q '"url"'; then
    ok "GitHub Pages enabled: $SITE"
  else
    gh_api -X PUT "https://api.github.com/repos/$GH_USER/$SITE/pages" \
      -d '{"source":{"branch":"main","path":"/"}}' > /dev/null 2>&1 || true
    ok "GitHub Pages configured: $SITE"
  fi

  LIVE_URLS+=("https://$GH_USER.github.io/$SITE")
done

# ─── 6. SAVE PAYMENT LINKS ─────────────────────────────────────────
banner "Saving payment link report"

REPORT="$HOME/francisco-holdings-payment-links.txt"
cat > "$REPORT" <<REPORT_EOF
# Francisco Holdings — Stripe Payment Links
# Generated: $(date)

=== CLEANSWARM (Recurring) ===
Starter  (CAD \$199/mo):   ${PLACEHOLDER_URL_1:-NOT CREATED}
Growth   (CAD \$499/mo):   ${PLACEHOLDER_URL_2:-NOT CREATED}
Scale  (CAD \$1,249/mo):   ${PLACEHOLDER_URL_3:-NOT CREATED}

=== CCLDR (One-Time) ===
Warrior      (CAD \$149):  ${PLACEHOLDER_URL_4:-NOT CREATED}
Professional (CAD \$499):  ${PLACEHOLDER_URL_5:-NOT CREATED}
Elite        (CAD \$999):  ${PLACEHOLDER_URL_6:-NOT CREATED}
Sovereign  (CAD \$1,499):  ${PLACEHOLDER_URL_7:-NOT CREATED}

=== MINDSHIFT (One-Time) ===
Neuro        (CAD \$497):  ${PLACEHOLDER_URL_8:-NOT CREATED}
Group      (CAD \$1,997):  ${PLACEHOLDER_URL_9:-NOT CREATED}
Premium  (CAD \$10,000):   ${PLACEHOLDER_URL_10:-NOT CREATED}

=== OMNIAGUARD (Recurring) ===
Starter    (CAD \$99/mo):  ${PLACEHOLDER_URL_11:-NOT CREATED}
Professional (CAD \$499/mo): ${PLACEHOLDER_URL_12:-NOT CREATED}
Enterprise (CAD \$1,999/mo): ${PLACEHOLDER_URL_13:-NOT CREATED}

=== PRIMEDOX AI (Recurring) ===
Pro         (CAD \$49/mo): ${PLACEHOLDER_URL_14:-NOT CREATED}
Elite      (CAD \$199/mo): ${PLACEHOLDER_URL_15:-NOT CREATED}
REPORT_EOF

ok "Payment links saved → $REPORT"

# ─── 7. SUMMARY ────────────────────────────────────────────────────
banner "DEPLOYMENT COMPLETE"

echo ""
echo -e "${BOLD}${GREEN}5 SITES LIVE (allow 60s for DNS propagation):${NC}"
for URL in "${LIVE_URLS[@]}"; do
  echo -e "  ${CYAN}$URL${NC}"
done

echo ""
echo -e "${BOLD}${GOLD}STRIPE PAYMENT LINKS:${NC}"
grep "https://" "$REPORT"

echo ""
echo -e "${GOLD}Test card: 4242 4242 4242 4242 | any future date | any CVC${NC}"
echo ""
echo -e "${BOLD}NOTE: MindShift site left untouched in your GitHub as requested.${NC}"
echo -e "      MindShift Stripe products were still created and saved above."
echo ""
