#!/bin/bash
# Alle Test-Suites nacheinander (dauert etwa 15–20 Minuten).
#   bash tests/run-all.sh            -> alle
#   bash tests/run-all.sh kb room_t  -> nur diese
# Jede Suite druckt ✓/✗-Zeilen; hier werden nur Fehler und das Ergebnis gezeigt. Am Ende: Zusammenfassung.
cd "$(dirname "$0")/.." || exit 1
(python3 -m http.server 8765 >/dev/null 2>&1 &) ; sleep 1
ALL="par dup reload timer newg drink cats two hm info bluff2 bq reflex feedback kb wb classics_t bs_t slfd_t slfc_t slf3_t stop_t typo_t letter_t draft_t reel_t reel_rm slfmem_t room_t zettelon_t scrollkeep_t hostaway_t hostaway2_t hostrestore_t charakter_t home_t pwa"
LIST=${@:-$ALL}
FAIL=0
for t in $LIST; do
  echo "--- $t"
  OUT=$(timeout 280 node tests/$t.js 2>&1); RC=$?
  echo "$OUT" | grep -E "✗|Fehler im Browser|Fehler:|alles ok|FEHLGESCHLAGEN|^Abbruch"
  if [ $RC -ne 0 ]; then FAIL=$((FAIL+1)); echo "   >>> $t: FEHLER (Exit-Code $RC)"; fi
done
echo "=== FERTIG: $FAIL Suite(s) mit Fehlern ==="
pkill -f "http.server 8765" 2>/dev/null
exit $FAIL
