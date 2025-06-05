#!/bin/bash
# File: verify-timeline-consistency.sh
# Purpose: Cross-check scene summaries against timeline files

PROJECT_ROOT="/Users/sami.j.p.heikkinen/Documents/src/summer-2025/da-dl/recursive-writing/wasteland-europa"
TIMELINE_FILE="${PROJECT_ROOT}/scenes-timeline.md"
TEMPLATE_FILE="${PROJECT_ROOT}/timeline-template.md"
SUMMARIES_FILE="${PROJECT_ROOT}/scene-summaries-extracted.md"

echo "=== TIMELINE CONSISTENCY VERIFICATION ==="
echo "Timestamp: $(date)"
echo ""

# Check if required files exist
if [[ ! -f "$TIMELINE_FILE" ]]; then
    echo "❌ Missing scenes-timeline.md"
    exit 1
fi

if [[ ! -f "$TEMPLATE_FILE" ]]; then
    echo "❌ Missing timeline-template.md"
    exit 1
fi

echo "1. TIMELINE FILE CONSISTENCY"
echo "============================="

# Extract scene references from both timeline files
SCENES_TIMELINE_REFS=$(grep -E "scene-[0-9]" "$TIMELINE_FILE" | wc -l | xargs)
TEMPLATE_TIMELINE_REFS=$(grep -E "scene-[0-9]" "$TEMPLATE_FILE" | wc -l | xargs)

echo "Scene references in scenes-timeline.md: $SCENES_TIMELINE_REFS"
echo "Scene references in timeline-template.md: $TEMPLATE_TIMELINE_REFS"

if [[ $SCENES_TIMELINE_REFS -eq $TEMPLATE_TIMELINE_REFS ]]; then
    echo "✅ Timeline files have consistent scene references"
else
    echo "⚠️ Timeline files have different scene reference counts"
fi

echo ""
echo "2. CHRONOLOGICAL ORDER VERIFICATION"
echo "==================================="

# Extract dates and scene numbers from timeline
grep -E "\| [0-9]|2154-" "$TIMELINE_FILE" | grep -E "scene-[0-9]" | head -10 | while read line; do
    SCENE_NUM=$(echo "$line" | grep -oE "scene-[0-9]+" | head -1)
    DATE=$(echo "$line" | grep -oE "2154-[0-9]{2}-[0-9]{2}")
    if [[ -n "$SCENE_NUM" && -n "$DATE" ]]; then
        echo "Scene: $SCENE_NUM | Date: $DATE"
    fi
done

echo ""
echo "3. COMPLETION STATUS VERIFICATION"
echo "================================="

# Check completion markers in scenes-timeline.md
COMPLETE_MARKERS=$(grep -c "✅.*COMPLETE\|✅ Detailed" "$TIMELINE_FILE")
TOTAL_SCENES=$(grep -c "scene-[0-9]" "$TIMELINE_FILE")

echo "Scenes marked complete: $COMPLETE_MARKERS"
echo "Total scenes in timeline: $TOTAL_SCENES"

if [[ $TOTAL_SCENES -gt 0 ]]; then
    COMPLETION_RATE=$(echo "scale=1; $COMPLETE_MARKERS * 100 / $TOTAL_SCENES" | bc -l 2>/dev/null || echo "0.0")
    echo "Completion rate: $COMPLETION_RATE%"
else
    echo "Completion rate: 0.0%"
fi

if [[ $COMPLETE_MARKERS -eq 30 ]]; then
    echo "✅ All 30 expected scenes marked complete"
elif [[ $COMPLETE_MARKERS -gt 25 ]]; then
    echo "⚠️ Near completion - $((30 - COMPLETE_MARKERS)) scenes remaining"
else
    echo "❌ Significant work remaining - $((30 - COMPLETE_MARKERS)) scenes incomplete"
fi

echo ""
echo "4. NARRATIVE GENERATION CHECKLIST VERIFICATION"
echo "=============================================="

# Check narrative-generation-checklist.md for current status
CHECKLIST_FILE="${PROJECT_ROOT}/narrative-generation-checklist.md"
if [[ -f "$CHECKLIST_FILE" ]]; then
    CHECKLIST_COMPLETE=$(grep -c "✅.*narrative complete" "$CHECKLIST_FILE")
    
    echo "Narratives marked complete in checklist: $CHECKLIST_COMPLETE"
    echo "Expected total narratives: 30"
    
    if [[ $CHECKLIST_COMPLETE -eq 30 ]]; then
        echo "✅ Narrative generation checklist shows 30/30 complete"
    else
        echo "⚠️ Narrative generation checklist shows $CHECKLIST_COMPLETE/30 complete"
    fi
else
    echo "❌ Narrative generation checklist not found"
fi
