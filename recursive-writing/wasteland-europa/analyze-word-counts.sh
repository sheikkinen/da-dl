#!/bin/bash
# File: analyze-word-counts.sh
# Purpose: Analyze word counts for all narrative files
# Note: Requires bash for associative arrays

PROJECT_ROOT="/Users/sami.j.p.heikkinen/Documents/src/summer-2025/da-dl/recursive-writing/wasteland-europa"
NARRATIVE_DIR="${PROJECT_ROOT}/narrative"
OUTPUT_FILE="${PROJECT_ROOT}/word-count-analysis.csv"

echo "=== WORD COUNT ANALYSIS ==="
echo "Timestamp: $(date)"
echo ""

# Create CSV header
echo "Scene,File,Target_Words,Actual_Words,Status,Percentage" > "$OUTPUT_FILE"

# Define expected word counts (from narrative-generation-checklist.md)
declare -A TARGET_WORDS
TARGET_WORDS["scene-01-museum-discovery"]=3100
TARGET_WORDS["scene-02-herald-warning"]=2100
TARGET_WORDS["scene-03-winter-crucible"]=2487
TARGET_WORDS["scene-03b-blood-and-steel"]=1547
TARGET_WORDS["scene-04-the-masked-wanderer"]=1247
TARGET_WORDS["scene-04b-savage-attraction"]=2500
TARGET_WORDS["scene-05-brotherhood-of-survivors"]=2947
TARGET_WORDS["scene-05b-night-raid"]=2500
TARGET_WORDS["scene-06-into-the-tunnel"]=1847
TARGET_WORDS["scene-07-tunnel-horrors"]=2987
TARGET_WORDS["scene-07b-flesh-and-fire"]=2000
TARGET_WORDS["scene-08-first-horde-contact"]=2634
TARGET_WORDS["scene-08b-katja-hunt"]=2500
TARGET_WORDS["scene-09-paris-underground"]=3500
TARGET_WORDS["scene-10-reflections-of-apocalypse"]=2487
TARGET_WORDS["scene-10b-scarred-passion"]=2500
TARGET_WORDS["scene-11-the-archivist-s-burden"]=1987
TARGET_WORDS["scene-11b-blade-dance"]=3000
TARGET_WORDS["scene-12-leaving-paris"]=2047
TARGET_WORDS["scene-13-rhine-valley-arrival"]=2489
TARGET_WORDS["scene-13b-gathering-storm"]=2500
TARGET_WORDS["scene-14-scarred-lord"]=3500
TARGET_WORDS["scene-15-rhine-battle"]=4000
TARGET_WORDS["scene-16-walking-apocalypse"]=2500
TARGET_WORDS["scene-16b-bloodlust-desire"]=3000
TARGET_WORDS["scene-17-escape-to-the-alps"]=2000
TARGET_WORDS["scene-18-alpine-sanctuary-discovery"]=3000
TARGET_WORDS["scene-19-the-keeper-s-test"]=3000
TARGET_WORDS["scene-20-the-stargazer-s-choice"]=2500
TARGET_WORDS["scene-21-return-journey"]=2000

TOTAL_TARGET=0
TOTAL_ACTUAL=0
COMPLIANT_COUNT=0

echo "Scene Analysis:"
echo "==============="

for scene in "${!TARGET_WORDS[@]}"; do
    # Handle naming inconsistency for scene-15
    if [[ "$scene" == "scene-15-rhine-battle" ]]; then
        NARRATIVE_FILE="${NARRATIVE_DIR}/scene-15-rhine-valley-battle-narrative.md"
    else
        NARRATIVE_FILE="${NARRATIVE_DIR}/${scene}-narrative.md"
    fi
    TARGET=${TARGET_WORDS[$scene]}
    
    if [[ -f "$NARRATIVE_FILE" ]]; then
        # Count words (excluding markdown formatting)
        ACTUAL=$(cat "$NARRATIVE_FILE" | sed 's/[#*`-]//g' | wc -w | xargs)
        PERCENTAGE=$(echo "scale=1; $ACTUAL * 100 / $TARGET" | bc -l 2>/dev/null || echo "0.0")
        
        # Status determination
        if (( $(echo "$PERCENTAGE >= 90.0" | bc -l 2>/dev/null || echo 0) )); then
            STATUS="✅ COMPLIANT"
            COMPLIANT_COUNT=$((COMPLIANT_COUNT + 1))
        elif (( $(echo "$PERCENTAGE >= 75.0" | bc -l 2>/dev/null || echo 0) )); then
            STATUS="⚠️ ACCEPTABLE"
        else
            STATUS="❌ UNDER-TARGET"
        fi
        
        echo "$scene: $ACTUAL words (target: $TARGET) - $STATUS ($PERCENTAGE%)"
        echo "$scene,$NARRATIVE_FILE,$TARGET,$ACTUAL,$STATUS,$PERCENTAGE%" >> "$OUTPUT_FILE"
        
        TOTAL_TARGET=$((TOTAL_TARGET + TARGET))
        TOTAL_ACTUAL=$((TOTAL_ACTUAL + ACTUAL))
    else
        echo "$scene: MISSING NARRATIVE FILE"
        echo "$scene,MISSING,${TARGET},0,❌ MISSING,0%" >> "$OUTPUT_FILE"
    fi
done

echo ""
echo "SUMMARY STATISTICS:"
echo "==================="
echo "Total target words: $TOTAL_TARGET"
echo "Total actual words: $TOTAL_ACTUAL"
if [[ $TOTAL_TARGET -gt 0 ]]; then
    echo "Overall percentage: $(echo "scale=1; $TOTAL_ACTUAL * 100 / $TOTAL_TARGET" | bc -l 2>/dev/null || echo "0.0")%"
else
    echo "Overall percentage: 0.0%"
fi
echo "Compliant scenes: $COMPLIANT_COUNT/30"
echo ""
echo "Analysis saved to: $OUTPUT_FILE"
