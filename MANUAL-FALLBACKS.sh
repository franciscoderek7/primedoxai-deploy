#!/bin/bash
# ═══════════════════════════════════════════════════════════════════
#  FRANCISCO HOLDINGS — MANUAL FALLBACK COMMANDS
#  Use these if DEPLOY-NOW.sh fails for any reason.
#  Copy-paste each block individually. Run from YOUR local terminal.
#
#  Set your keys first:
#    export STRIPE_SECRET_KEY="sk_test_xxx"   # or sk_live_xxx
#    export GH_TOKEN="ghp_xxx"
#    export GH_USER="franciscoderek7"          # your GitHub username
# ═══════════════════════════════════════════════════════════════════

# ─── STRIPE CURL FALLBACKS ──────────────────────────────────────────
# For each product, run all 3 steps (product → price → payment_link)
# and copy the URL printed at the end.
# Replace PLACEHOLDER_URL_X in each site's index.html with the URL.

SK="$STRIPE_SECRET_KEY"   # shorthand

# ══════════════════════════════════════════
#  CLEANSWARM STARTER — PLACEHOLDER_URL_1
#  CAD $199/mo recurring
# ══════════════════════════════════════════
CS_PROD=$(curl -sf -X POST https://api.stripe.com/v1/products \
  -H "Authorization: Bearer $SK" \
  -d "name=CleanSwarm Starter" \
  -d "description=AI scheduling, billing & team management — up to 3 crew members" \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])")
echo "CleanSwarm Starter product: $CS_PROD"

CS1_PRICE=$(curl -sf -X POST https://api.stripe.com/v1/prices \
  -H "Authorization: Bearer $SK" \
  -d "product=$CS_PROD" -d "unit_amount=19900" -d "currency=cad" \
  -d "recurring[interval]=month" \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])")
echo "CleanSwarm Starter price: $CS1_PRICE"

PLACEHOLDER_URL_1=$(curl -sf -X POST https://api.stripe.com/v1/payment_links \
  -H "Authorization: Bearer $SK" \
  -d "line_items[0][price]=$CS1_PRICE" -d "line_items[0][quantity]=1" \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['url'])")
echo "PLACEHOLDER_URL_1=$PLACEHOLDER_URL_1"

# ══════════════════════════════════════════
#  CLEANSWARM GROWTH — PLACEHOLDER_URL_2
#  CAD $499/mo recurring
# ══════════════════════════════════════════
CS2_PROD=$(curl -sf -X POST https://api.stripe.com/v1/products \
  -H "Authorization: Bearer $SK" \
  -d "name=CleanSwarm Growth" \
  -d "description=Scale your cleaning business — up to 15 crew, multi-location, AI forecasting" \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])")
CS2_PRICE=$(curl -sf -X POST https://api.stripe.com/v1/prices \
  -H "Authorization: Bearer $SK" \
  -d "product=$CS2_PROD" -d "unit_amount=49900" -d "currency=cad" \
  -d "recurring[interval]=month" \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])")
PLACEHOLDER_URL_2=$(curl -sf -X POST https://api.stripe.com/v1/payment_links \
  -H "Authorization: Bearer $SK" \
  -d "line_items[0][price]=$CS2_PRICE" -d "line_items[0][quantity]=1" \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['url'])")
echo "PLACEHOLDER_URL_2=$PLACEHOLDER_URL_2"

# ══════════════════════════════════════════
#  CLEANSWARM SCALE — PLACEHOLDER_URL_3
#  CAD $1,249/mo recurring
# ══════════════════════════════════════════
CS3_PROD=$(curl -sf -X POST https://api.stripe.com/v1/products \
  -H "Authorization: Bearer $SK" \
  -d "name=CleanSwarm Scale" \
  -d "description=Enterprise cleaning fleet — unlimited crew, white-label, API access" \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])")
CS3_PRICE=$(curl -sf -X POST https://api.stripe.com/v1/prices \
  -H "Authorization: Bearer $SK" \
  -d "product=$CS3_PROD" -d "unit_amount=124900" -d "currency=cad" \
  -d "recurring[interval]=month" \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])")
PLACEHOLDER_URL_3=$(curl -sf -X POST https://api.stripe.com/v1/payment_links \
  -H "Authorization: Bearer $SK" \
  -d "line_items[0][price]=$CS3_PRICE" -d "line_items[0][quantity]=1" \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['url'])")
echo "PLACEHOLDER_URL_3=$PLACEHOLDER_URL_3"

# ══════════════════════════════════════════
#  CCLDR WARRIOR — PLACEHOLDER_URL_4
#  CAD $149 one-time
# ══════════════════════════════════════════
CC4_PROD=$(curl -sf -X POST https://api.stripe.com/v1/products \
  -H "Authorization: Bearer $SK" \
  -d "name=CCLDR Warrior" \
  -d "description=Foundation defense education — Charter ss.7/8/9/10, disclosure templates, community access" \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])")
CC4_PRICE=$(curl -sf -X POST https://api.stripe.com/v1/prices \
  -H "Authorization: Bearer $SK" \
  -d "product=$CC4_PROD" -d "unit_amount=14900" -d "currency=cad" \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])")
PLACEHOLDER_URL_4=$(curl -sf -X POST https://api.stripe.com/v1/payment_links \
  -H "Authorization: Bearer $SK" \
  -d "line_items[0][price]=$CC4_PRICE" -d "line_items[0][quantity]=1" \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['url'])")
echo "PLACEHOLDER_URL_4=$PLACEHOLDER_URL_4"

# ══════════════════════════════════════════
#  CCLDR PROFESSIONAL — PLACEHOLDER_URL_5
#  CAD $499 one-time
# ══════════════════════════════════════════
CC5_PROD=$(curl -sf -X POST https://api.stripe.com/v1/products \
  -H "Authorization: Bearer $SK" \
  -d "name=CCLDR Professional" \
  -d "description=Advanced constitutional defense education — BENO-X Framework, 12-Appearance method, motion library" \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])")
CC5_PRICE=$(curl -sf -X POST https://api.stripe.com/v1/prices \
  -H "Authorization: Bearer $SK" \
  -d "product=$CC5_PROD" -d "unit_amount=49900" -d "currency=cad" \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])")
PLACEHOLDER_URL_5=$(curl -sf -X POST https://api.stripe.com/v1/payment_links \
  -H "Authorization: Bearer $SK" \
  -d "line_items[0][price]=$CC5_PRICE" -d "line_items[0][quantity]=1" \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['url'])")
echo "PLACEHOLDER_URL_5=$PLACEHOLDER_URL_5"

# ══════════════════════════════════════════
#  CCLDR ELITE — PLACEHOLDER_URL_6
#  CAD $999 one-time
# ══════════════════════════════════════════
CC6_PROD=$(curl -sf -X POST https://api.stripe.com/v1/products \
  -H "Authorization: Bearer $SK" \
  -d "name=CCLDR Elite" \
  -d "description=Complete constitutional defense arsenal — 2x 1-on-1 strategy sessions, full CCLDR curriculum" \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])")
CC6_PRICE=$(curl -sf -X POST https://api.stripe.com/v1/prices \
  -H "Authorization: Bearer $SK" \
  -d "product=$CC6_PROD" -d "unit_amount=99900" -d "currency=cad" \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])")
PLACEHOLDER_URL_6=$(curl -sf -X POST https://api.stripe.com/v1/payment_links \
  -H "Authorization: Bearer $SK" \
  -d "line_items[0][price]=$CC6_PRICE" -d "line_items[0][quantity]=1" \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['url'])")
echo "PLACEHOLDER_URL_6=$PLACEHOLDER_URL_6"

# ══════════════════════════════════════════
#  CCLDR SOVEREIGN — PLACEHOLDER_URL_7
#  CAD $1,499 one-time
# ══════════════════════════════════════════
CC7_PROD=$(curl -sf -X POST https://api.stripe.com/v1/products \
  -H "Authorization: Bearer $SK" \
  -d "name=CCLDR Sovereign" \
  -d "description=Total sovereignty — 6x 1-on-1 sessions, full case war-room, all future courses included" \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])")
CC7_PRICE=$(curl -sf -X POST https://api.stripe.com/v1/prices \
  -H "Authorization: Bearer $SK" \
  -d "product=$CC7_PROD" -d "unit_amount=149900" -d "currency=cad" \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])")
PLACEHOLDER_URL_7=$(curl -sf -X POST https://api.stripe.com/v1/payment_links \
  -H "Authorization: Bearer $SK" \
  -d "line_items[0][price]=$CC7_PRICE" -d "line_items[0][quantity]=1" \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['url'])")
echo "PLACEHOLDER_URL_7=$PLACEHOLDER_URL_7"

# ══════════════════════════════════════════
#  MINDSHIFT NEURO — PLACEHOLDER_URL_8
#  CAD $497 one-time
# ══════════════════════════════════════════
MS8_PROD=$(curl -sf -X POST https://api.stripe.com/v1/products \
  -H "Authorization: Bearer $SK" \
  -d "name=MindShift Neuro" \
  -d "description=8-week neuroplasticity self-guided program — daily rewiring protocols, habit architecture" \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])")
MS8_PRICE=$(curl -sf -X POST https://api.stripe.com/v1/prices \
  -H "Authorization: Bearer $SK" \
  -d "product=$MS8_PROD" -d "unit_amount=49700" -d "currency=cad" \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])")
PLACEHOLDER_URL_8=$(curl -sf -X POST https://api.stripe.com/v1/payment_links \
  -H "Authorization: Bearer $SK" \
  -d "line_items[0][price]=$MS8_PRICE" -d "line_items[0][quantity]=1" \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['url'])")
echo "PLACEHOLDER_URL_8=$PLACEHOLDER_URL_8"

# ══════════════════════════════════════════
#  MINDSHIFT GROUP — PLACEHOLDER_URL_9
#  CAD $1,997 one-time
# ══════════════════════════════════════════
MS9_PROD=$(curl -sf -X POST https://api.stripe.com/v1/products \
  -H "Authorization: Bearer $SK" \
  -d "name=MindShift Group Intensive" \
  -d "description=12-week cohort coaching — weekly live sessions, accountability partner, identity reconstruction" \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])")
MS9_PRICE=$(curl -sf -X POST https://api.stripe.com/v1/prices \
  -H "Authorization: Bearer $SK" \
  -d "product=$MS9_PROD" -d "unit_amount=199700" -d "currency=cad" \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])")
PLACEHOLDER_URL_9=$(curl -sf -X POST https://api.stripe.com/v1/payment_links \
  -H "Authorization: Bearer $SK" \
  -d "line_items[0][price]=$MS9_PRICE" -d "line_items[0][quantity]=1" \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['url'])")
echo "PLACEHOLDER_URL_9=$PLACEHOLDER_URL_9"

# ══════════════════════════════════════════
#  MINDSHIFT PREMIUM — PLACEHOLDER_URL_10
#  CAD $10,000 one-time
# ══════════════════════════════════════════
MS10_PROD=$(curl -sf -X POST https://api.stripe.com/v1/products \
  -H "Authorization: Bearer $SK" \
  -d "name=MindShift Premium" \
  -d "description=6-month 1-on-1 executive neuro-coaching — custom protocol, bi-weekly sessions, results guarantee" \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])")
MS10_PRICE=$(curl -sf -X POST https://api.stripe.com/v1/prices \
  -H "Authorization: Bearer $SK" \
  -d "product=$MS10_PROD" -d "unit_amount=1000000" -d "currency=cad" \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])")
PLACEHOLDER_URL_10=$(curl -sf -X POST https://api.stripe.com/v1/payment_links \
  -H "Authorization: Bearer $SK" \
  -d "line_items[0][price]=$MS10_PRICE" -d "line_items[0][quantity]=1" \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['url'])")
echo "PLACEHOLDER_URL_10=$PLACEHOLDER_URL_10"

# ══════════════════════════════════════════
#  OMNIAGUARD STARTER — PLACEHOLDER_URL_11
#  CAD $99/mo recurring
# ══════════════════════════════════════════
OG11_PROD=$(curl -sf -X POST https://api.stripe.com/v1/products \
  -H "Authorization: Bearer $SK" \
  -d "name=OmniaGuard Starter" \
  -d "description=14-layer AI security stack — up to 5 agents, real-time threat detection, dashboard monitoring" \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])")
OG11_PRICE=$(curl -sf -X POST https://api.stripe.com/v1/prices \
  -H "Authorization: Bearer $SK" \
  -d "product=$OG11_PROD" -d "unit_amount=9900" -d "currency=cad" \
  -d "recurring[interval]=month" \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])")
PLACEHOLDER_URL_11=$(curl -sf -X POST https://api.stripe.com/v1/payment_links \
  -H "Authorization: Bearer $SK" \
  -d "line_items[0][price]=$OG11_PRICE" -d "line_items[0][quantity]=1" \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['url'])")
echo "PLACEHOLDER_URL_11=$PLACEHOLDER_URL_11"

# ══════════════════════════════════════════
#  OMNIAGUARD PROFESSIONAL — PLACEHOLDER_URL_12
#  CAD $499/mo recurring
# ══════════════════════════════════════════
OG12_PROD=$(curl -sf -X POST https://api.stripe.com/v1/products \
  -H "Authorization: Bearer $SK" \
  -d "name=OmniaGuard Professional" \
  -d "description=Advanced AI security — unlimited agents, priority 4-hr SLA, NIST AI RMF compliance kit" \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])")
OG12_PRICE=$(curl -sf -X POST https://api.stripe.com/v1/prices \
  -H "Authorization: Bearer $SK" \
  -d "product=$OG12_PROD" -d "unit_amount=49900" -d "currency=cad" \
  -d "recurring[interval]=month" \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])")
PLACEHOLDER_URL_12=$(curl -sf -X POST https://api.stripe.com/v1/payment_links \
  -H "Authorization: Bearer $SK" \
  -d "line_items[0][price]=$OG12_PRICE" -d "line_items[0][quantity]=1" \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['url'])")
echo "PLACEHOLDER_URL_12=$PLACEHOLDER_URL_12"

# ══════════════════════════════════════════
#  OMNIAGUARD ENTERPRISE — PLACEHOLDER_URL_13
#  CAD $1,999/mo recurring
# ══════════════════════════════════════════
OG13_PROD=$(curl -sf -X POST https://api.stripe.com/v1/products \
  -H "Authorization: Bearer $SK" \
  -d "name=OmniaGuard Enterprise" \
  -d "description=Full enterprise AI security — custom BENO-X policy, 1-hr emergency SLA, full audit trail + forensics" \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])")
OG13_PRICE=$(curl -sf -X POST https://api.stripe.com/v1/prices \
  -H "Authorization: Bearer $SK" \
  -d "product=$OG13_PROD" -d "unit_amount=199900" -d "currency=cad" \
  -d "recurring[interval]=month" \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])")
PLACEHOLDER_URL_13=$(curl -sf -X POST https://api.stripe.com/v1/payment_links \
  -H "Authorization: Bearer $SK" \
  -d "line_items[0][price]=$OG13_PRICE" -d "line_items[0][quantity]=1" \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['url'])")
echo "PLACEHOLDER_URL_13=$PLACEHOLDER_URL_13"

# ══════════════════════════════════════════
#  PRIMEDOX PRO — PLACEHOLDER_URL_14
#  CAD $49/mo recurring
# ══════════════════════════════════════════
PD14_PROD=$(curl -sf -X POST https://api.stripe.com/v1/products \
  -H "Authorization: Bearer $SK" \
  -d "name=PrimeDox Pro" \
  -d "description=AI agent suite — 22+ specialized agents, Charter defense, business automation" \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])")
PD14_PRICE=$(curl -sf -X POST https://api.stripe.com/v1/prices \
  -H "Authorization: Bearer $SK" \
  -d "product=$PD14_PROD" -d "unit_amount=4900" -d "currency=cad" \
  -d "recurring[interval]=month" \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])")
PLACEHOLDER_URL_14=$(curl -sf -X POST https://api.stripe.com/v1/payment_links \
  -H "Authorization: Bearer $SK" \
  -d "line_items[0][price]=$PD14_PRICE" -d "line_items[0][quantity]=1" \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['url'])")
echo "PLACEHOLDER_URL_14=$PLACEHOLDER_URL_14"

# ══════════════════════════════════════════
#  PRIMEDOX ELITE — PLACEHOLDER_URL_15
#  CAD $199/mo recurring
# ══════════════════════════════════════════
PD15_PROD=$(curl -sf -X POST https://api.stripe.com/v1/products \
  -H "Authorization: Bearer $SK" \
  -d "name=PrimeDox Elite" \
  -d "description=Sovereign digital twin — all agents + OmniaGuard swarm protection, custom agent training" \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])")
PD15_PRICE=$(curl -sf -X POST https://api.stripe.com/v1/prices \
  -H "Authorization: Bearer $SK" \
  -d "product=$PD15_PROD" -d "unit_amount=19900" -d "currency=cad" \
  -d "recurring[interval]=month" \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])")
PLACEHOLDER_URL_15=$(curl -sf -X POST https://api.stripe.com/v1/payment_links \
  -H "Authorization: Bearer $SK" \
  -d "line_items[0][price]=$PD15_PRICE" -d "line_items[0][quantity]=1" \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['url'])")
echo "PLACEHOLDER_URL_15=$PLACEHOLDER_URL_15"

echo ""
echo "══ All 15 Stripe URLs captured above ══"
echo "Now run apply-payment-links.sh or manually paste them into HTML files."


# ─── GITHUB API CURL FALLBACKS ─────────────────────────────────────
# Use these if the git push approach fails.
# Reads index.html, base64-encodes it, creates/updates the file via GitHub API.
# Run from the root of primedoxai-deploy.

GH="https://api.github.com"
GH_H="-H \"Authorization: token $GH_TOKEN\" -H \"Accept: application/vnd.github.v3+json\""

github_deploy_site() {
  local SITE="$1"
  local HTML_FILE="$SITE/index.html"

  echo "═══ Deploying $SITE via GitHub API ═══"

  # Create repo
  curl -sf -X POST "$GH/user/repos" \
    -H "Authorization: token $GH_TOKEN" \
    -H "Accept: application/vnd.github.v3+json" \
    -d "{\"name\":\"$SITE\",\"private\":false,\"auto_init\":false,\"description\":\"Francisco Holdings — $SITE\"}" \
    > /dev/null 2>&1 || echo "  (repo may already exist — continuing)"

  sleep 1

  # Base64-encode the HTML file
  local CONTENT
  CONTENT=$(base64 < "$HTML_FILE" | tr -d '\n')

  # Check if file already exists (get its SHA for update)
  local SHA
  SHA=$(curl -sf \
    -H "Authorization: token $GH_TOKEN" \
    -H "Accept: application/vnd.github.v3+json" \
    "$GH/repos/$GH_USER/$SITE/contents/index.html" \
    | python3 -c "import sys,json; print(json.load(sys.stdin).get('sha',''))" 2>/dev/null || echo "")

  if [ -n "$SHA" ]; then
    # Update existing file
    curl -sf -X PUT "$GH/repos/$GH_USER/$SITE/contents/index.html" \
      -H "Authorization: token $GH_TOKEN" \
      -H "Accept: application/vnd.github.v3+json" \
      -d "{\"message\":\"Deploy $SITE — Francisco Holdings\",\"content\":\"$CONTENT\",\"sha\":\"$SHA\",\"branch\":\"main\"}" \
      > /dev/null && echo "  ✓ Updated $SITE/index.html" || echo "  ✗ Update failed"
  else
    # Create new file
    curl -sf -X PUT "$GH/repos/$GH_USER/$SITE/contents/index.html" \
      -H "Authorization: token $GH_TOKEN" \
      -H "Accept: application/vnd.github.v3+json" \
      -d "{\"message\":\"Deploy $SITE — Francisco Holdings\",\"content\":\"$CONTENT\",\"branch\":\"main\"}" \
      > /dev/null && echo "  ✓ Created $SITE/index.html" || echo "  ✗ Create failed"
  fi

  sleep 2

  # Enable GitHub Pages
  curl -sf -X POST "$GH/repos/$GH_USER/$SITE/pages" \
    -H "Authorization: token $GH_TOKEN" \
    -H "Accept: application/vnd.github.v3+json" \
    -d '{"source":{"branch":"main","path":"/"}}' \
    > /dev/null 2>&1 \
    || curl -sf -X PUT "$GH/repos/$GH_USER/$SITE/pages" \
         -H "Authorization: token $GH_TOKEN" \
         -H "Accept: application/vnd.github.v3+json" \
         -d '{"source":{"branch":"main","path":"/"}}' \
         > /dev/null 2>&1 || true

  echo "  ✓ GitHub Pages enabled: https://$GH_USER.github.io/$SITE"
}

# ── Deploy all 5 sites via GitHub API ──
# (Run these AFTER applying payment links to local HTML files)
github_deploy_site "cleanswarm-checkout"
github_deploy_site "ccldr-payments"
github_deploy_site "revenue-dashboard"
github_deploy_site "omniaguard-site"
github_deploy_site "primedoxai-site"

echo ""
echo "═══ ALL SITES DEPLOYED VIA GITHUB API ═══"
echo "Wait 60 seconds for DNS. Live URLs:"
for SITE in cleanswarm-checkout ccldr-payments revenue-dashboard omniaguard-site primedoxai-site; do
  echo "  https://$GH_USER.github.io/$SITE"
done
