#!/bin/bash
# ═══════════════════════════════════════════════════════
# FRANCISCO HOLDINGS — Apply Stripe Payment Links
# Run AFTER stripe-setup.sh generates stripe-payment-links.txt
# Replaces all PLACEHOLDER_URL_X in HTML files with real URLs
# ═══════════════════════════════════════════════════════

if [ ! -f "stripe-payment-links.txt" ]; then
  echo "❌ stripe-payment-links.txt not found. Run stripe-setup.sh first."
  exit 1
fi

echo "Reading payment links..."
declare -A LINKS

while IFS='=' read -r KEY VAL; do
  LINKS[$KEY]=$VAL
  echo "  ✓ $KEY → $VAL"
done < stripe-payment-links.txt

echo ""
echo "Applying to HTML files..."

FILES=(
  "cleanswarm-checkout/index.html"
  "ccldr-payments/index.html"
  "mindshift-makayla/index.html"
  "omniaguard-site/index.html"
  "primedoxai-site/index.html"
  "revenue-dashboard/index.html"
)

for FILE in "${FILES[@]}"; do
  if [ ! -f "$FILE" ]; then
    echo "  ⚠ Skipping (not found): $FILE"
    continue
  fi
  for KEY in "${!LINKS[@]}"; do
    sed -i "s|$KEY|${LINKS[$KEY]}|g" "$FILE"
  done
  echo "  ✓ Updated: $FILE"
done

echo ""
echo "✅ Done! All payment links applied."
echo "Commit and push to GitHub Pages to go live."
echo ""
echo "  git add -A"
echo "  git commit -m 'Add real Stripe payment links'"
echo "  git push"
