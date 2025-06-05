#!/bin/bash
# File: verify-content-quality.sh
# Purpose: Check narrative files for complete prose content

PROJECT_ROOT="/Users/sami.j.p.heikkinen/Documents/src/summer-2025/da-dl/recursive-writing/wasteland-europa"
NARRATIVE_DIR="${PROJECT_ROOT}/narrative"

echo "=== CONTENT QUALITY VERIFICATION ==="
echo "Timestamp: $(date)"
echo ""

INCOMPLETE_COUNT=0
COMPLETE_COUNT=0

for narrative_file in "${NARRATIVE_DIR}"/*.md; do
    if [[ -f "$narrative_file" ]]; then
        filename=$(basename "$narrative_file")
        
        # Check for template indicators (incomplete content)
        TEMPLATE_INDICATORS=$(grep -c "\[To be developed\]\|\[TEMPLATE\]\|\[TODO\]\|XXX\|PLACEHOLDER" "$narrative_file" 2>/dev/null || echo "0")
        TEMPLATE_INDICATORS=$(echo "$TEMPLATE_INDICATORS" | head -1 | xargs)
        
        # Check for narrative prose indicators
        PROSE_INDICATORS=$(grep -c "Maya\|Viktor\|Elena\|said\|thought\|felt\|walked\|looked" "$narrative_file" 2>/dev/null || echo "0")
        PROSE_INDICATORS=$(echo "$PROSE_INDICATORS" | head -1 | xargs)
        
        # Check minimum content length (should be substantial prose, not just headers)
        CONTENT_LINES=$(grep -v "^#\|^$\|^\s*$" "$narrative_file" | wc -l | xargs)
        
        if [[ "$TEMPLATE_INDICATORS" -gt 0 ]]; then
            echo "❌ $filename - Contains template placeholders ($TEMPLATE_INDICATORS found)"
            INCOMPLETE_COUNT=$((INCOMPLETE_COUNT + 1))
        elif [[ "$PROSE_INDICATORS" -lt 10 ]]; then
            echo "⚠️ $filename - Limited prose content ($PROSE_INDICATORS prose indicators)"
            INCOMPLETE_COUNT=$((INCOMPLETE_COUNT + 1))
        elif [[ "$CONTENT_LINES" -lt 50 ]]; then
            echo "⚠️ $filename - Short content ($CONTENT_LINES content lines)"
            INCOMPLETE_COUNT=$((INCOMPLETE_COUNT + 1))
        else
            echo "✅ $filename - Complete narrative content"
            COMPLETE_COUNT=$((COMPLETE_COUNT + 1))
        fi
    fi
done

echo ""
echo "CONTENT QUALITY SUMMARY:"
echo "========================"
echo "Complete narratives: $COMPLETE_COUNT"
echo "Incomplete/template content: $INCOMPLETE_COUNT"
echo "Total files checked: $((COMPLETE_COUNT + INCOMPLETE_COUNT))"

if [[ $INCOMPLETE_COUNT -eq 0 ]]; then
    echo "🎉 ALL NARRATIVES COMPLETE - Content quality verification PASSED"
else
    echo "⚠️ INCOMPLETE CONTENT - $INCOMPLETE_COUNT files need development"
fi
