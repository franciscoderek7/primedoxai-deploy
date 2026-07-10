#!/bin/bash
# wire-formspree.sh — Replace YOUR_FORM_ID placeholders with real Formspree IDs
# Usage: bash scripts/wire-formspree.sh xCCLDRID xPRIMEDOXID xVIGILAXID xCLEANSWARMID xKIAROSID xTECHPETID
# Example: bash scripts/wire-formspree.sh xrgvpkqb xabcd1234 xefgh5678 xijkl9012 xmnop3456 xqrst7890

CCLDR_ID="${1:-YOUR_FORM_ID}"
PRIMEDOX_ID="${2:-YOUR_FORM_ID}"
VIGILAX_ID="${3:-YOUR_FORM_ID}"
CLEANSWARM_ID="${4:-YOUR_FORM_ID}"
KIAROS_ID="${5:-YOUR_FORM_ID}"
TECHPETCAGE_ID="${6:-YOUR_FORM_ID}"

if [ "$CCLDR_ID" = "YOUR_FORM_ID" ]; then
  echo "Usage: bash scripts/wire-formspree.sh <ccldr-id> <primedox-id> <vigilax-id> <cleanswarm-id> <kiaros-id> <techpetcage-id>"
  echo "Get IDs from: formspree.io → your forms → copy the ID from the form URL"
  exit 1
fi

echo "Wiring Formspree IDs..."

# CCLDR
find ccldr-site/ -name "*.html" -exec sed -i "s|YOUR_FORM_ID|${CCLDR_ID}|g" {} \;
echo "✅ CCLDR → ${CCLDR_ID}"

# PrimeDox AI
find primedoxai-site/ -name "*.html" -exec sed -i "s|YOUR_FORM_ID|${PRIMEDOX_ID}|g" {} \;
echo "✅ PrimeDox → ${PRIMEDOX_ID}"

# VIGILAX
find vigilax-site/ -name "*.html" -exec sed -i "s|YOUR_FORM_ID|${VIGILAX_ID}|g" {} \;
echo "✅ VIGILAX → ${VIGILAX_ID}"

# CleanSwarm
find cleanswarm-site/ -name "*.html" -exec sed -i "s|YOUR_FORM_ID|${CLEANSWARM_ID}|g" {} \;
echo "✅ CleanSwarm → ${CLEANSWARM_ID}"

# Kiaros
find kiaros-site/ -name "*.html" -exec sed -i "s|YOUR_FORM_ID|${KIAROS_ID}|g" {} \;
echo "✅ Kiaros → ${KIAROS_ID}"

# TechPetCage
find techpetcage-site/ -name "*.html" -exec sed -i "s|YOUR_FORM_ID|${TECHPETCAGE_ID}|g" {} \;
echo "✅ TechPetCage → ${TECHPETCAGE_ID}"

echo ""
echo "All Formspree IDs wired. Run: git add -A && git commit -m 'wire: Formspree form IDs on all 6 sites'"
