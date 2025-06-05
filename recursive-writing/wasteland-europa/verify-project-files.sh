#!/bin/bash
# File: verify-project-files.sh
# Purpose: Automated verification of Wasteland Europa project files

PROJECT_ROOT="/Users/sami.j.p.heikkinen/Documents/src/summer-2025/da-dl/recursive-writing/wasteland-europa"
SCENES_DIR="${PROJECT_ROOT}/scenes"
NARRATIVE_DIR="${PROJECT_ROOT}/narrative"

echo "=== Wasteland Europa Project Verification ==="
echo "Timestamp: $(date)"
echo ""

# Define expected scenes (30 total)
declare -a EXPECTED_SCENES=(
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

# Check scene template files
echo "1. SCENE TEMPLATE FILES VERIFICATION"
echo "====================================="
SCENE_MISSING=0
for scene in "${EXPECTED_SCENES[@]}"; do
    SCENE_FILE="${SCENES_DIR}/${scene}.md"
    if [[ -f "$SCENE_FILE" ]]; then
        echo "✅ ${scene}.md - EXISTS"
    else
        echo "❌ ${scene}.md - MISSING"
        SCENE_MISSING=$((SCENE_MISSING + 1))
    fi
done
echo "Scene files missing: $SCENE_MISSING/30"
echo ""

# Check narrative files
echo "2. NARRATIVE FILES VERIFICATION"
echo "==============================="
NARRATIVE_MISSING=0
for scene in "${EXPECTED_SCENES[@]}"; do
    # Handle naming inconsistency for scene-15
    if [[ "$scene" == "scene-15-rhine-battle" ]]; then
        NARRATIVE_FILE="${NARRATIVE_DIR}/scene-15-rhine-valley-battle-narrative.md"
    else
        NARRATIVE_FILE="${NARRATIVE_DIR}/${scene}-narrative.md"
    fi
    
    if [[ -f "$NARRATIVE_FILE" ]]; then
        echo "✅ ${scene}-narrative.md - EXISTS"
    else
        echo "❌ ${scene}-narrative.md - MISSING"
        NARRATIVE_MISSING=$((NARRATIVE_MISSING + 1))
    fi
done
echo "Narrative files missing: $NARRATIVE_MISSING/30"
echo ""

# Check cross-reference files
echo "3. PROJECT STRUCTURE FILES"
echo "=========================="
declare -a PROJECT_FILES=(
    "scenes-timeline.md"
    "timeline-template.md"
    "narrative-generation-checklist.md"
    "story-action-plan.md"
)

for file in "${PROJECT_FILES[@]}"; do
    PROJECT_FILE="${PROJECT_ROOT}/${file}"
    if [[ -f "$PROJECT_FILE" ]]; then
        echo "✅ ${file} - EXISTS"
    else
        echo "❌ ${file} - MISSING"
    fi
done
echo ""

# Summary
echo "4. VERIFICATION SUMMARY"
echo "======================="
echo "Scene templates: $((30 - SCENE_MISSING))/30 present"
echo "Narrative files: $((30 - NARRATIVE_MISSING))/30 present"
TOTAL_MISSING=$((SCENE_MISSING + NARRATIVE_MISSING))
echo "Total missing files: $TOTAL_MISSING/60"

if [[ $TOTAL_MISSING -eq 0 ]]; then
    echo "🎉 ALL FILES PRESENT - Project structure verification PASSED"
else
    echo "⚠️  INCOMPLETE PROJECT - $TOTAL_MISSING files missing"
fi
