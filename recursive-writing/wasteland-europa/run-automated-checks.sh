#!/bin/bash
# Automated Quality Checks for Wasteland Europa
# Runs multiple verification tools and generates comprehensive report

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
NARRATIVE_DIR="${1:-$SCRIPT_DIR/narrative}"
OUTPUT_DIR="${2:-$SCRIPT_DIR/verification-results}"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m'

echo -e "${BOLD}=== Wasteland Europa Automated Quality Checks ===${NC}"
echo "Narrative directory: $NARRATIVE_DIR"
echo "Output directory: $OUTPUT_DIR"
echo ""

# Create output directory
mkdir -p "$OUTPUT_DIR"

# Track overall status
overall_status=0
checks_run=0
checks_passed=0

# Function to run a check and track results
run_check() {
    local check_name="$1"
    local check_command="$2"
    local expected_exit_code="${3:-0}"
    
    echo -e "${BLUE}Running: $check_name${NC}"
    ((checks_run++))
    
    if eval "$check_command"; then
        if [ $? -eq $expected_exit_code ]; then
            echo -e "${GREEN}✅ $check_name: PASSED${NC}"
            ((checks_passed++))
        else
            echo -e "${YELLOW}⚠️ $check_name: ISSUES FOUND${NC}"
            overall_status=1
        fi
    else
        echo -e "${RED}❌ $check_name: FAILED${NC}"
        overall_status=2
    fi
    echo ""
}

# Check 1: Tense and Person Consistency
run_check "Tense and Person Consistency" \
    "./check-tense-person-simple.sh '$NARRATIVE_DIR' '$OUTPUT_DIR/tense-person-report.md'" \
    1

# Check 2: File Structure Verification
run_check "File Structure Check" \
    "ls '$NARRATIVE_DIR'/*.md | wc -l | grep -q 30 && echo 'All 30 narrative files present'"

# Check 3: Word Count Analysis
run_check "Word Count Analysis" \
    "find '$NARRATIVE_DIR' -name '*.md' -exec wc -w {} + | tail -1 | awk '{if(\$1 > 70000) print \"Total words:\", \$1, \"- Target met\"; else print \"Total words:\", \$1, \"- Below target\"}'"

# Check 4: Basic Content Validation
run_check "Content Structure Check" \
    "for file in '$NARRATIVE_DIR'/*.md; do if ! grep -q '# Scene' \"\$file\"; then echo \"Missing scene header: \$file\"; exit 1; fi; done && echo 'All files have proper scene headers'"

# Check 5: Metadata Consistency
run_check "Metadata Validation" \
    "for file in '$NARRATIVE_DIR'/*.md; do if ! grep -q '\\*\\*Date\\*\\*' \"\$file\"; then echo \"Missing date metadata: \$file\"; exit 1; fi; done && echo 'All files have date metadata'"

# Generate summary report
cat > "$OUTPUT_DIR/automated-checks-summary.md" << EOF
# Automated Quality Checks Summary

**Generated:** $(date)
**Project:** Wasteland Europa
**Checks Run:** $checks_run
**Checks Passed:** $checks_passed

---

## Overall Status

EOF

if [ $overall_status -eq 0 ]; then
    echo "**Status:** ✅ ALL CHECKS PASSED" >> "$OUTPUT_DIR/automated-checks-summary.md"
elif [ $overall_status -eq 1 ]; then
    echo "**Status:** ⚠️ ISSUES FOUND - Manual review required" >> "$OUTPUT_DIR/automated-checks-summary.md"
else
    echo "**Status:** ❌ CRITICAL FAILURES - Immediate attention required" >> "$OUTPUT_DIR/automated-checks-summary.md"
fi

cat >> "$OUTPUT_DIR/automated-checks-summary.md" << EOF

## Checks Performed

1. **Tense and Person Consistency**: Analyzes POV and tense usage across all narratives
2. **File Structure**: Verifies all 30 narrative files are present
3. **Word Count Analysis**: Checks total project length meets targets
4. **Content Structure**: Validates proper scene headers and formatting
5. **Metadata Validation**: Ensures required metadata is present

## Reports Generated

- \`tense-person-report.md\`: Detailed tense and person analysis
- \`automated-checks-summary.md\`: This summary report

## Next Steps

EOF

if [ $overall_status -eq 0 ]; then
    echo "- ✅ Proceed with manual verification using plan-manual-verification.md" >> "$OUTPUT_DIR/automated-checks-summary.md"
    echo "- ✅ All automated checks passed - project appears ready for final review" >> "$OUTPUT_DIR/automated-checks-summary.md"
elif [ $overall_status -eq 1 ]; then
    echo "- ⚠️ Review flagged files in tense-person-report.md" >> "$OUTPUT_DIR/automated-checks-summary.md"
    echo "- ⚠️ Address consistency issues before proceeding with manual verification" >> "$OUTPUT_DIR/automated-checks-summary.md"
    echo "- ⚠️ Re-run automated checks after corrections" >> "$OUTPUT_DIR/automated-checks-summary.md"
else
    echo "- ❌ Address critical issues before proceeding" >> "$OUTPUT_DIR/automated-checks-summary.md"
    echo "- ❌ Check file structure and content validity" >> "$OUTPUT_DIR/automated-checks-summary.md"
    echo "- ❌ Re-run checks after fixes" >> "$OUTPUT_DIR/automated-checks-summary.md"
fi

cat >> "$OUTPUT_DIR/automated-checks-summary.md" << EOF

---

*Automated checks should be followed by manual verification using the comprehensive plan in plan-manual-verification.md*
EOF

# Final console output
echo -e "${BOLD}=== Automated Checks Complete ===${NC}"
echo -e "Checks run: ${BLUE}$checks_run${NC}"
echo -e "Checks passed: ${GREEN}$checks_passed${NC}"

if [ $overall_status -eq 0 ]; then
    echo -e "Status: ${GREEN}ALL CHECKS PASSED${NC}"
    echo -e "${GREEN}✅ Project ready for manual verification${NC}"
elif [ $overall_status -eq 1 ]; then
    echo -e "Status: ${YELLOW}ISSUES FOUND${NC}"
    echo -e "${YELLOW}⚠️ Review reports in $OUTPUT_DIR before manual verification${NC}"
else
    echo -e "Status: ${RED}CRITICAL FAILURES${NC}"
    echo -e "${RED}❌ Address critical issues before proceeding${NC}"
fi

echo ""
echo -e "Reports saved to: ${BLUE}$OUTPUT_DIR${NC}"
echo -e "Next: Review ${BLUE}plan-manual-verification.md${NC} for comprehensive quality assurance"

exit $overall_status
