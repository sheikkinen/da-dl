#!/bin/bash
# Simple Tense and Person Checker for Wasteland Europa
# Basic pattern matching approach without external dependencies

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
NARRATIVE_DIR="${1:-$SCRIPT_DIR/narrative}"
OUTPUT_FILE="${2:-$SCRIPT_DIR/tense-person-simple-report.md}"

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "=== Wasteland Europa Tense & Person Checker ==="
echo "Checking narrative files in: $NARRATIVE_DIR"
echo "Output report: $OUTPUT_FILE"
echo ""

# Check if directory exists
if [ ! -d "$NARRATIVE_DIR" ]; then
    echo -e "${RED}Error: Directory $NARRATIVE_DIR does not exist${NC}"
    exit 1
fi

# Initialize counters
total_files=0
files_with_issues=0
person_issues=0
tense_issues=0

# Create report file
cat > "$OUTPUT_FILE" << 'EOF'
# Simple Tense and Person Analysis Report

**Generated:** $(date)
**Purpose:** Basic consistency check for Wasteland Europa narratives

---

## Analysis Method

This report uses pattern matching to identify potential tense and person inconsistencies:

- **First Person Indicators:** I, me, my, we, us, our
- **Second Person Indicators:** you, your
- **Third Person Indicators:** he, she, it, they, them, his, her
- **Past Tense Indicators:** was, were, had, said, went, came, saw
- **Present Tense Indicators:** is, are, has, says, goes, comes, sees

## Files Analyzed

EOF

# Function to check a single file
check_file() {
    local file="$1"
    local filename=$(basename "$file")
    
    echo "Checking: $filename"
    
    # Extract narrative text (skip metadata and headers, but keep paragraphs)
    local narrative_text=$(sed -n '/^---$/,/^---$/!p' "$file" | \
                          grep -v '^#' | \
                          grep -v '^\*\*[^*]*\*\*$' | \
                          grep -v '^<!-- ' | \
                          sed 's/\*\*[^*]*\*\*//g' | \
                          sed 's/\*[^*]*\*//g' | \
                          grep -v '^$' | \
                          grep '.' | \
                          tr '\n' ' ')
    
    if [ -z "$narrative_text" ]; then
        echo "### ❌ $filename" >> "$OUTPUT_FILE"
        echo "**Error:** No narrative text found" >> "$OUTPUT_FILE"
        echo "" >> "$OUTPUT_FILE"
        return
    fi
    
    # Count person indicators (case insensitive)
    local first_person=$(echo "$narrative_text" | grep -io '\b\(I\|me\|my\|mine\|myself\|we\|us\|our\|ours\)\b' | wc -l)
    local second_person=$(echo "$narrative_text" | grep -io '\b\(you\|your\|yours\|yourself\)\b' | wc -l)
    local third_person=$(echo "$narrative_text" | grep -io '\b\(he\|she\|it\|him\|her\|his\|hers\|its\|they\|them\|their\|theirs\)\b' | wc -l)
    
    # Count tense indicators
    local past_tense=$(echo "$narrative_text" | grep -io '\b\(was\|were\|had\|did\|said\|went\|came\|saw\|felt\|thought\)\b' | wc -l)
    local present_tense=$(echo "$narrative_text" | grep -io '\b\(is\|are\|has\|does\|says\|goes\|comes\|sees\|feels\|thinks\)\b' | wc -l)
    
    # Calculate totals
    local total_person=$((first_person + second_person + third_person))
    local total_tense=$((past_tense + present_tense))
    
    # Determine issues
    local person_issue=false
    local tense_issue=false
    local status_icon="✅"
    
    # Check for person consistency (should be mostly third person)
    if [ $total_person -gt 0 ]; then
        local third_percentage=$((third_person * 100 / total_person))
        if [ $third_percentage -lt 70 ]; then
            person_issue=true
            ((person_issues++))
            status_icon="⚠️"
        fi
    fi
    
    # Check for tense consistency (should be mostly past tense)
    if [ $total_tense -gt 0 ]; then
        local past_percentage=$((past_tense * 100 / total_tense))
        if [ $past_percentage -lt 70 ]; then
            tense_issue=true
            ((tense_issues++))
            if [ "$status_icon" = "✅" ]; then
                status_icon="⚠️"
            fi
        fi
    fi
    
    if [ "$person_issue" = true ] || [ "$tense_issue" = true ]; then
        ((files_with_issues++))
    fi
    
    # Word count
    local word_count=$(echo "$narrative_text" | wc -w)
    
    # Write to report
    echo "### $status_icon $filename" >> "$OUTPUT_FILE"
    echo "- **Word Count:** $word_count" >> "$OUTPUT_FILE"
    echo "- **Person Distribution:** 1st: $first_person, 2nd: $second_person, 3rd: $third_person" >> "$OUTPUT_FILE"
    echo "- **Tense Distribution:** Past: $past_tense, Present: $present_tense" >> "$OUTPUT_FILE"
    
    if [ $total_person -gt 0 ]; then
        local third_pct=$((third_person * 100 / total_person))
        echo "- **Third Person %:** $third_pct%" >> "$OUTPUT_FILE"
        if [ $third_pct -lt 70 ]; then
            echo "- **⚠️ Person Issue:** Low third person usage ($third_pct%)" >> "$OUTPUT_FILE"
        fi
    fi
    
    if [ $total_tense -gt 0 ]; then
        local past_pct=$((past_tense * 100 / total_tense))
        echo "- **Past Tense %:** $past_pct%" >> "$OUTPUT_FILE"
        if [ $past_pct -lt 70 ]; then
            echo "- **⚠️ Tense Issue:** Low past tense usage ($past_pct%)" >> "$OUTPUT_FILE"
        fi
    fi
    
    echo "" >> "$OUTPUT_FILE"
    
    # Console output with colors
    if [ "$person_issue" = true ] || [ "$tense_issue" = true ]; then
        echo -e "  ${YELLOW}Issues found${NC}"
    else
        echo -e "  ${GREEN}OK${NC}"
    fi
}

# Process all narrative files
for file in "$NARRATIVE_DIR"/*.md; do
    if [ -f "$file" ]; then
        ((total_files++))
        check_file "$file"
    fi
done

# Add summary to report
cat >> "$OUTPUT_FILE" << EOF

---

## Summary

- **Total Files:** $total_files
- **Files with Issues:** $files_with_issues
- **Person Issues:** $person_issues files
- **Tense Issues:** $tense_issues files

## Recommendations

### For ⚠️ Files:
1. **Person Issues:** Ensure consistent third-person limited POV
   - Check for accidental "I", "you" usage in narrative
   - Dialogue can contain any person

2. **Tense Issues:** Maintain past tense for narrative prose
   - Present tense acceptable in dialogue
   - Present tense acceptable for immediate thoughts/actions

### Manual Review Priority:
1. Files with both person and tense issues
2. Files with person issues (POV consistency critical)
3. Files with only tense issues

---

*Generated by simple pattern matching - Manual verification recommended*
EOF

# Final console summary
echo ""
echo "=== Analysis Complete ==="
echo -e "Total files analyzed: ${BLUE}$total_files${NC}"
echo -e "Files with issues: ${YELLOW}$files_with_issues${NC}"
echo -e "Person consistency issues: ${YELLOW}$person_issues${NC}"
echo -e "Tense consistency issues: ${YELLOW}$tense_issues${NC}"
echo ""
echo -e "Report saved to: ${GREEN}$OUTPUT_FILE${NC}"

if [ $files_with_issues -gt 0 ]; then
    echo -e "${YELLOW}Recommendation: Review files marked with ⚠️ for consistency${NC}"
    exit 1
else
    echo -e "${GREEN}All files appear consistent!${NC}"
    exit 0
fi
