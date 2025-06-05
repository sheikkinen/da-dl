#!/bin/bash
# File: analyze-word-counts-fixed.sh
# Purpose: Analyze word counts for all narrative files (compatible with bash 3.2)

PROJECT_ROOT="/Users/sami.j.p.heikkinen/Documents/src/summer-2025/da-dl/recursive-writing/wasteland-europa"
NARRATIVE_DIR="${PROJECT_ROOT}/narrative"
OUTPUT_FILE="${PROJECT_ROOT}/word-count-analysis.csv"

echo "=== WORD COUNT ANALYSIS ==="
echo "Timestamp: $(date)"
echo ""

# Create CSV header
echo "Scene,File,Target_Words,Actual_Words,Status,Percentage" > "$OUTPUT_FILE"

# Function to get target word count for a scene
get_target_words() {
    case "$1" in
        "scene-01-museum-discovery") echo 3100 ;;
        "scene-02-herald-warning") echo 2100 ;;
        "scene-03-winter-crucible") echo 2487 ;;
        "scene-03b-blood-and-steel") echo 1547 ;;
        "scene-04-the-masked-wanderer") echo 1247 ;;
        "scene-04b-savage-attraction") echo 2500 ;;
        "scene-05-brotherhood-of-survivors") echo 2947 ;;
        "scene-05b-night-raid") echo 2500 ;;
        "scene-06-into-the-tunnel") echo 1847 ;;
        "scene-07-tunnel-horrors") echo 2987 ;;
        "scene-07b-flesh-and-fire") echo 2000 ;;
        "scene-08-first-horde-contact") echo 2634 ;;
        "scene-08b-katja-hunt") echo 2500 ;;
        "scene-09-paris-underground") echo 3500 ;;
        "scene-10-reflections-of-apocalypse") echo 2487 ;;
        "scene-10b-scarred-passion") echo 2500 ;;
        "scene-11-the-archivist-s-burden") echo 1987 ;;
        "scene-11b-blade-dance") echo 3000 ;;
        "scene-12-leaving-paris") echo 2047 ;;
        "scene-13-rhine-valley-arrival") echo 2489 ;;
        "scene-13b-gathering-storm") echo 2500 ;;
        "scene-14-scarred-lord") echo 3500 ;;
        "scene-15-rhine-battle") echo 4000 ;;
        "scene-16-walking-apocalypse") echo 2500 ;;
        "scene-16b-bloodlust-desire") echo 3000 ;;
        "scene-17-escape-to-the-alps") echo 2000 ;;
        "scene-18-alpine-sanctuary-discovery") echo 3000 ;;
        "scene-19-the-keeper-s-test") echo 3000 ;;
        "scene-20-the-stargazer-s-choice") echo 2500 ;;
        "scene-21-return-journey") echo 2000 ;;
        *) echo 0 ;;
    esac
}

# Define all scenes
SCENES=(
    "scene-01-museum-discovery"
    "scene-02-herald-warning"
    "scene-03-winter-crucible"
    "scene-03b-blood-and-steel"
    "scene-04-the-masked-wanderer"
    "scene-04b-savage-attraction"
    "scene-05-brotherhood-of-survivors"
    "scene-05b-night-raid"
    "scene-06-into-the-tunnel"
    "scene-07-tunnel-horrors"
    "scene-07b-flesh-and-fire"
    "scene-08-first-horde-contact"
    "scene-08b-katja-hunt"
    "scene-09-paris-underground"
    "scene-10-reflections-of-apocalypse"
    "scene-10b-scarred-passion"
    "scene-11-the-archivist-s-burden"
    "scene-11b-blade-dance"
    "scene-12-leaving-paris"
    "scene-13-rhine-valley-arrival"
    "scene-13b-gathering-storm"
    "scene-14-scarred-lord"
    "scene-15-rhine-battle"
    "scene-16-walking-apocalypse"
    "scene-16b-bloodlust-desire"
    "scene-17-escape-to-the-alps"
    "scene-18-alpine-sanctuary-discovery"
    "scene-19-the-keeper-s-test"
    "scene-20-the-stargazer-s-choice"
    "scene-21-return-journey"
)

TOTAL_TARGET=0
TOTAL_ACTUAL=0
COMPLIANT_COUNT=0

echo "Scene Analysis:"
echo "==============="

for scene in "${SCENES[@]}"; do
    # Handle naming inconsistency for scene-15
    if [[ "$scene" == "scene-15-rhine-battle" ]]; then
        NARRATIVE_FILE="${NARRATIVE_DIR}/scene-15-rhine-valley-battle-narrative.md"
    else
        NARRATIVE_FILE="${NARRATIVE_DIR}/${scene}-narrative.md"
    fi
    
    TARGET=$(get_target_words "$scene")
    
    if [[ -f "$NARRATIVE_FILE" ]]; then
        # Count words (excluding markdown formatting)
        ACTUAL=$(cat "$NARRATIVE_FILE" | sed 's/[#*`-]//g' | wc -w | tr -d ' ')
        if [[ "$TARGET" -gt 0 ]]; then
            PERCENTAGE=$(echo "scale=1; $ACTUAL * 100 / $TARGET" | bc -l 2>/dev/null || echo "0.0")
        else
            PERCENTAGE="0.0"
        fi
        
        # Status determination
        if [[ $(echo "$PERCENTAGE >= 90.0" | bc -l 2>/dev/null || echo 0) -eq 1 ]]; then
            STATUS="✅ COMPLIANT"
            COMPLIANT_COUNT=$((COMPLIANT_COUNT + 1))
        elif [[ $(echo "$PERCENTAGE >= 75.0" | bc -l 2>/dev/null || echo 0) -eq 1 ]]; then
            STATUS="⚠️ ACCEPTABLE"
        else
            STATUS="❌ NEEDS WORK"
        fi
        
        echo "$scene: $ACTUAL words (target: $TARGET) - $PERCENTAGE% - $STATUS"
        echo "$scene,$NARRATIVE_FILE,$TARGET,$ACTUAL,$STATUS,$PERCENTAGE%" >> "$OUTPUT_FILE"
        
        TOTAL_TARGET=$((TOTAL_TARGET + TARGET))
        TOTAL_ACTUAL=$((TOTAL_ACTUAL + ACTUAL))
    else
        echo "$scene: MISSING NARRATIVE FILE"
        echo "$scene,MISSING,$TARGET,0,❌ MISSING,0.0%" >> "$OUTPUT_FILE"
    fi
done

echo ""
echo "SUMMARY STATISTICS:"
echo "==================="
echo "Total target words: $TOTAL_TARGET"
echo "Total actual words: $TOTAL_ACTUAL"
if [[ "$TOTAL_TARGET" -gt 0 ]]; then
    OVERALL_PERCENTAGE=$(echo "scale=1; $TOTAL_ACTUAL * 100 / $TOTAL_TARGET" | bc -l 2>/dev/null || echo "0.0")
    echo "Overall percentage: $OVERALL_PERCENTAGE%"
else
    echo "Overall percentage: 0.0%"
fi
echo "Compliant scenes: $COMPLIANT_COUNT/30"
echo ""
echo "Analysis saved to: $OUTPUT_FILE"
