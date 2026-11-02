#!/usr/bin/env bash
# privacy-gate.sh — fail-closed release gate. Scans the ARTIFACT, not the source.
# Usage: privacy-gate.sh <artifact-dir>
# Exit 0 = pass. Exit 1 = prohibited content. Exit 2 = cannot run (fail closed).
set -u
ART="${1:-}"

die_indeterminate() { echo "GATE: INDETERMINATE — $1"; echo "GATE: FAILING CLOSED"; exit 2; }

[ -n "$ART" ]  || die_indeterminate "no artifact directory given"
[ -d "$ART" ]  || die_indeterminate "artifact directory does not exist: $ART"
command -v grep >/dev/null 2>&1 || die_indeterminate "grep unavailable"

# Refuse to pass an empty artifact — an empty dir would otherwise scan clean.
FILES=$(find "$ART" -type f -not -path '*/.git/*' | wc -l)
[ "$FILES" -gt 0 ] || die_indeterminate "artifact contains 0 files"

# Scan EVERY published file type, not just *.html: JS, JSON, SVG, manifests,
# text and markdown can all carry the same strings.
SCAN=$(find "$ART" -type f -not -path '*/.git/*' \
        \( -name '*.html' -o -name '*.htm' -o -name '*.js' -o -name '*.json' \
           -o -name '*.svg' -o -name '*.xml' -o -name '*.txt' -o -name '*.md' \
           -o -name '*.css' -o -name '*.webmanifest' -o -name 'CNAME' \))
[ -n "$SCAN" ] || die_indeterminate "no scannable files found in artifact"

RULES="$(dirname "$0")/prohibited.txt"
[ -s "$RULES" ] || die_indeterminate "rule file missing or empty: $RULES"

# Sensitive literals are not committed. They arrive via FHI_PROHIBITED_EXTRA
# (one regex per line, e.g. from a CI secret). Unset means the rule set is
# incomplete, so fail closed rather than pass a partial scan.
if grep -q 'FHI_PROHIBITED_EXTRA' "$RULES"; then
  [ -n "${FHI_PROHIBITED_EXTRA:-}" ] || die_indeterminate \
    "FHI_PROHIBITED_EXTRA is unset; the personal-contact rules cannot be loaded"
  EXTRA=$(printf '%s' "$FHI_PROHIBITED_EXTRA" | paste -sd'|' -)
fi

HITS=0
while IFS='|' read -r CATEGORY PATTERN; do
  [ -z "${CATEGORY:-}" ] && continue
  case "$CATEGORY" in \#*) continue ;; esac
  if [ "$PATTERN" = '${FHI_PROHIBITED_EXTRA}' ]; then PATTERN="${EXTRA:-}"; fi
  [ -n "$PATTERN" ] || continue
  # -I skips binary. -o not used: we never print the matched value.
  while IFS= read -r m; do
    [ -z "$m" ] && continue
    FILE="${m%%:*}"; LINE="${m#*:}"; LINE="${LINE%%:*}"
    echo "FINDING [$CATEGORY] ${FILE#$ART/}:$LINE  value=[REDACTED]"
    HITS=$((HITS+1))
  done < <(printf '%s\n' "$SCAN" | xargs -r grep -I -n -E "$PATTERN" 2>/dev/null)
done < "$RULES"

if [ "$HITS" -gt 0 ]; then
  echo "GATE: FAIL — $HITS prohibited occurrence(s) in the publish artifact"
  echo "GATE: no values printed. Review each path above before publishing."
  exit 1
fi
echo "GATE: PASS — $FILES file(s) scanned, 0 prohibited occurrences"
exit 0
