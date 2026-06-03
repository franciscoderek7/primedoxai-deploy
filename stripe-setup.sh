#!/bin/bash
# ═══════════════════════════════════════════════════════
# FRANCISCO HOLDINGS — STRIPE PRODUCT SETUP SCRIPT
# Run from YOUR terminal (not Claude Code cloud environment)
# Creates all 15 products + prices + payment links (CAD)
# Usage:
#   STRIPE_SECRET_KEY=sk_test_xxx ./stripe-setup.sh
#   STRIPE_SECRET_KEY=sk_live_xxx ./stripe-setup.sh
# ═══════════════════════════════════════════════════════

set -euo pipefail

SK="${STRIPE_SECRET_KEY:-}"
if [ -z "$SK" ]; then
  echo "Usage: STRIPE_SECRET_KEY=sk_test_xxx ./stripe-setup.sh"
  echo "   or: export STRIPE_SECRET_KEY=sk_test_xxx && ./stripe-setup.sh"
  exit 1
fi
STRIPE="https://api.stripe.com/v1"
OUT="stripe-payment-links.txt"

echo "═══════════════════════════════════════════════"
echo " Francisco Holdings — Stripe Setup (15 products)"
echo " Currency: CAD"
echo "═══════════════════════════════════════════════"
echo ""

> "$OUT"

stripe_post() {
  curl -sf -X POST "$STRIPE/$1" -H "Authorization: Bearer $SK" "${@:2}"
}

create_payment_link() {
  local PRICE_ID="$1"
  stripe_post "payment_links" \
    -d "line_items[0][price]=$PRICE_ID" \
    -d "line_items[0][quantity]=1" \
    | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('url','ERROR: '+str(d.get('error',{}).get('message','?'))))"
}

create_product_and_link() {
  local NAME="$1" DESC="$2" AMOUNT="$3" RECURRING="$4" PLACEHOLDER="$5"

  echo "▸ Creating: $NAME..."

  PROD=$(stripe_post "products" -d "name=$NAME" -d "description=$DESC")
  PROD_ID=$(echo "$PROD" | python3 -c "import sys,json; print(json.load(sys.stdin).get('id',''))" 2>/dev/null)
  if [ -z "$PROD_ID" ]; then echo "  ✗ Product FAILED: $PROD"; return; fi
  echo "  Product: $PROD_ID"

  if [ "$RECURRING" = "true" ]; then
    PRICE=$(stripe_post "prices" \
      -d "product=$PROD_ID" -d "unit_amount=$AMOUNT" -d "currency=cad" -d "recurring[interval]=month")
  else
    PRICE=$(stripe_post "prices" \
      -d "product=$PROD_ID" -d "unit_amount=$AMOUNT" -d "currency=cad")
  fi
  PRICE_ID=$(echo "$PRICE" | python3 -c "import sys,json; print(json.load(sys.stdin).get('id',''))" 2>/dev/null)
  if [ -z "$PRICE_ID" ]; then echo "  ✗ Price FAILED: $PRICE"; return; fi
  echo "  Price:   $PRICE_ID"

  LINK=$(create_payment_link "$PRICE_ID")
  echo "  Link:    $LINK"
  echo "$PLACEHOLDER=$LINK" >> "$OUT"
  echo ""
}

# ── CleanSwarm (recurring monthly) ──────────────────────
echo "[ CLEANSWARM — Recurring Subscriptions ]"
create_product_and_link "CleanSwarm Starter"         "AI-powered scheduling, billing & team management — up to 3 crew members"               19900  true  "PLACEHOLDER_URL_1"
create_product_and_link "CleanSwarm Growth"          "Scale your cleaning business — up to 15 crew members, multi-location, AI forecasting"   49900  true  "PLACEHOLDER_URL_2"
create_product_and_link "CleanSwarm Scale"           "Enterprise cleaning fleet management — unlimited crew, white-label, API access"          124900 true  "PLACEHOLDER_URL_3"

# ── CCLDR (one-time) ────────────────────────────────────
echo "[ CCLDR — One-Time Education Products ]"
create_product_and_link "CCLDR Warrior"              "Foundation defense education — Charter ss.7/8/9/10, disclosure templates, community access"      14900  false "PLACEHOLDER_URL_4"
create_product_and_link "CCLDR Professional"         "Advanced constitutional defense education — BENO-X Framework, 12-Appearance method, motion library" 49900  false "PLACEHOLDER_URL_5"
create_product_and_link "CCLDR Elite"                "Complete constitutional defense arsenal — 2x 1-on-1 strategy sessions, full CCLDR curriculum"      99900  false "PLACEHOLDER_URL_6"
create_product_and_link "CCLDR Sovereign"            "Total sovereignty — 6x 1-on-1 sessions, full case war-room, all future courses included"           149900 false "PLACEHOLDER_URL_7"

# ── MindShift (one-time) ────────────────────────────────
echo "[ MINDSHIFT — One-Time Coaching Products ]"
create_product_and_link "MindShift Neuro"            "8-week neuroplasticity self-guided program — daily rewiring protocols, habit architecture"            49700   false "PLACEHOLDER_URL_8"
create_product_and_link "MindShift Group Intensive"  "12-week cohort coaching — weekly live sessions, accountability partner, identity reconstruction"       199700  false "PLACEHOLDER_URL_9"
create_product_and_link "MindShift Premium"          "6-month 1-on-1 executive neuro-coaching — custom protocol, bi-weekly sessions, results guarantee"     1000000 false "PLACEHOLDER_URL_10"

# ── OmniaGuard (recurring monthly) ──────────────────────
echo "[ OMNIAGUARD — Recurring Subscriptions ]"
create_product_and_link "OmniaGuard Starter"         "14-layer AI security stack — up to 5 agents, real-time threat detection, dashboard monitoring"       9900   true "PLACEHOLDER_URL_11"
create_product_and_link "OmniaGuard Professional"    "Advanced AI security — unlimited agents, priority 4-hr SLA, NIST AI RMF compliance kit"              49900  true "PLACEHOLDER_URL_12"
create_product_and_link "OmniaGuard Enterprise"      "Full enterprise AI security — custom BENO-X policy, 1-hr emergency SLA, full audit trail + forensics" 199900 true "PLACEHOLDER_URL_13"

# ── PrimeDox AI (recurring monthly) ─────────────────────
echo "[ PRIMEDOX AI — Recurring Subscriptions ]"
create_product_and_link "PrimeDox Pro"               "AI agent suite — 22+ specialized agents, Charter defense, business automation"                        4900  true "PLACEHOLDER_URL_14"
create_product_and_link "PrimeDox Elite"             "Sovereign digital twin — all agents + OmniaGuard swarm protection, custom agent training"              19900 true "PLACEHOLDER_URL_15"

echo "═══════════════════════════════════════════════"
echo " DONE. Payment links saved to: $OUT"
echo "═══════════════════════════════════════════════"
echo ""
echo "--- GENERATED PAYMENT LINKS ---"
cat "$OUT"
echo ""
echo "--- NEXT STEPS ---"
echo "1. Run: ./apply-payment-links.sh"
echo "   (applies all URLs to the 5 site HTML files)"
echo "2. Or run: ./DEPLOY-NOW.sh"
echo "   (end-to-end: Stripe + GitHub Pages in one shot)"
