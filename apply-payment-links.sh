#!/bin/bash
# ═══════════════════════════════════════════════════════
# FRANCISCO HOLDINGS — Apply Stripe Payment Links
# Run AFTER stripe-setup.sh generates stripe-payment-links.txt
# Replaces all PLACEHOLDER_URL_1..15 in HTML files with real URLs
# MindShift site is skipped (left in your GitHub as requested)
# ═══════════════════════════════════════════════════════

if [ ! -f "stripe-payment-links.txt" ]; then
  echo "❌ stripe-payment-links.txt not found. Run stripe-setup.sh first."
  exit 1
fi

echo "Reading payment links from stripe-payment-links.txt..."
declare -A LINKS

while IFS='=' read -r KEY VAL; do
  [[ -z "$KEY" || "$KEY" == \#* ]] && continue
  LINKS[$KEY]="$VAL"
  echo "  ✓ $KEY → $VAL"
done < stripe-payment-links.txt

echo ""
echo "Applying to HTML files (MindShift skipped)..."

FILES=(
  "cleanswarm-checkout/index.html"
  "ccldr-payments/index.html"
  "revenue-dashboard/index.html"
  "omniaguard-site/index.html"
  "primedoxai-site/index.html"
)

for FILE in "${FILES[@]}"; do
  if [ ! -f "$FILE" ]; then
    echo "  ⚠ Skipping (not found): $FILE"
    continue
  fi
  PATCHED=0
  for KEY in "${!LINKS[@]}"; do
    if grep -q "$KEY" "$FILE" 2>/dev/null; then
      sed -i "s|$KEY|${LINKS[$KEY]}|g" "$FILE"
      PATCHED=$((PATCHED + 1))
    fi
  done
  echo "  ✓ Updated ($PATCHED replacements): $FILE"
done

echo ""
echo "✅ Done! All payment links applied."
echo ""
echo "Verify no remaining placeholders:"
grep -rn "PLACEHOLDER_URL_" cleanswarm-checkout/ ccldr-payments/ revenue-dashboard/ omniaguard-site/ primedoxai-site/ 2>/dev/null || echo "  ✓ No placeholders remaining."
echo ""
echo "Commit and push to go live:"
echo "  git add cleanswarm-checkout/index.html ccldr-payments/index.html revenue-dashboard/index.html omniaguard-site/index.html primedoxai-site/index.html"
echo "  git commit -m 'Add real Stripe payment links — Francisco Holdings live'"
echo "  git push origin claude/francisco-revenue-sprint-MEva6"
