#!/bin/bash
# ═══════════════════════════════════════════════════════
# FRANCISCO HOLDINGS — STRIPE PRODUCT SETUP SCRIPT
# Run from YOUR terminal (not Claude Code cloud environment)
# This creates all 10 products + prices + payment links
# ═══════════════════════════════════════════════════════

set -euo pipefail

# ── PASTE YOUR STRIPE SECRET KEY BELOW ──────────────────────
# Get it from: https://dashboard.stripe.com/apikeys
# Use sk_test_... for test mode, sk_live_... for production
SK="${STRIPE_SECRET_KEY:-}"
if [ -z "$SK" ]; then
  echo "Usage: STRIPE_SECRET_KEY=sk_test_xxx ./stripe-setup.sh"
  echo "   or: export STRIPE_SECRET_KEY=sk_test_xxx && ./stripe-setup.sh"
  exit 1
fi
STRIPE="https://api.stripe.com/v1"
OUT="stripe-payment-links.txt"

echo "═══════════════════════════════════════════════"
echo " Francisco Holdings — Stripe Setup"
echo " Mode: TEST"
echo " Currency: CAD"
echo "═══════════════════════════════════════════════"
echo ""

> "$OUT"  # Clear output file

stripe_post() {
  curl -s -X POST "$STRIPE/$1" \
    -H "Authorization: Bearer $SK" \
    "${@:2}"
}

create_payment_link() {
  local PRICE_ID="$1"
  local RESULT
  RESULT=$(stripe_post "payment_links" \
    -d "line_items[0][price]=$PRICE_ID" \
    -d "line_items[0][quantity]=1")
  echo "$RESULT" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('url','ERROR: '+str(d)))" 2>/dev/null || \
    echo "$RESULT" | grep -o '"url": *"[^"]*"' | cut -d'"' -f4
}

create_product_and_link() {
  local NAME="$1"
  local DESC="$2"
  local AMOUNT="$3"    # in cents CAD
  local RECURRING="$4" # true or false
  local PLACEHOLDER="$5"

  echo "▸ Creating: $NAME ($AMOUNT¢ CAD)..."

  # Create product
  PROD=$(stripe_post "products" \
    -d "name=$NAME" \
    -d "description=$DESC")
  PROD_ID=$(echo "$PROD" | python3 -c "import sys,json; print(json.load(sys.stdin).get('id',''))" 2>/dev/null)

  if [ -z "$PROD_ID" ]; then
    echo "  ✗ FAILED to create product: $PROD"
    return
  fi
  echo "  Product: $PROD_ID"

  # Create price
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
  PRICE_ID=$(echo "$PRICE" | python3 -c "import sys,json; print(json.load(sys.stdin).get('id',''))" 2>/dev/null)

  if [ -z "$PRICE_ID" ]; then
    echo "  ✗ FAILED to create price: $PRICE"
    return
  fi
  echo "  Price:   $PRICE_ID"

  # Create payment link
  LINK=$(create_payment_link "$PRICE_ID")
  echo "  Link:    $LINK"
  echo "$PLACEHOLDER=$LINK" >> "$OUT"
  echo ""
}

# ── CleanSwarm (recurring monthly) ──
echo "[ CLEANSWARM — Recurring Subscriptions ]"
create_product_and_link \
  "CleanSwarm Starter" \
  "AI-powered scheduling, billing & team management — up to 3 crew members" \
  19900 true "PLACEHOLDER_URL_1"

create_product_and_link \
  "CleanSwarm Growth" \
  "Scale your cleaning business — up to 15 crew members, multi-location, AI forecasting" \
  49900 true "PLACEHOLDER_URL_2"

create_product_and_link \
  "CleanSwarm Scale" \
  "Enterprise cleaning fleet management — unlimited crew, white-label, API access" \
  124900 true "PLACEHOLDER_URL_3"

# ── CCLDR (one-time) ──
echo "[ CCLDR — One-Time Education Products ]"
create_product_and_link \
  "CCLDR Warrior" \
  "Foundation defense education — Charter ss.7/8/9/10, disclosure templates, community access" \
  14900 false "PLACEHOLDER_URL_4"

create_product_and_link \
  "CCLDR Professional" \
  "Advanced constitutional defense education — BENO-X Framework, 12-Appearance method, motion library" \
  49900 false "PLACEHOLDER_URL_5"

create_product_and_link \
  "CCLDR Elite" \
  "Complete constitutional defense arsenal — 2x 1-on-1 strategy sessions, full CCLDR curriculum" \
  99900 false "PLACEHOLDER_URL_6"

create_product_and_link \
  "CCLDR Sovereign" \
  "Total sovereignty — 6x 1-on-1 sessions, full case war-room, all future courses included" \
  149900 false "PLACEHOLDER_URL_7"

# ── MindShift (one-time) ──
echo "[ MINDSHIFT — One-Time Coaching Products ]"
create_product_and_link \
  "MindShift Neuro" \
  "8-week neuroplasticity self-guided program — daily rewiring protocols, habit architecture" \
  49700 false "PLACEHOLDER_URL_8"

create_product_and_link \
  "MindShift Group Intensive" \
  "12-week cohort coaching — weekly live sessions, accountability partner, identity reconstruction" \
  199700 false "PLACEHOLDER_URL_9"

create_product_and_link \
  "MindShift Premium" \
  "6-month 1-on-1 executive neuro-coaching — custom protocol, bi-weekly sessions, results guarantee" \
  1000000 false "PLACEHOLDER_URL_10"

# ── Summary ──
echo "═══════════════════════════════════════════════"
echo " DONE. Payment link URLs saved to: $OUT"
echo "═══════════════════════════════════════════════"
echo ""
echo "--- GENERATED PAYMENT LINKS ---"
cat "$OUT"
echo ""
echo "--- NEXT STEP ---"
echo "1. Copy the URLs above"
echo "2. Run: ./apply-payment-links.sh"
echo "   (or manually find+replace PLACEHOLDER_URL_X in each index.html)"
