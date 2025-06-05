#!/bin/bash
# File: run-complete-verification.sh
# Purpose: Execute all verification tools and generate master report

PROJECT_ROOT="/Users/sami.j.p.heikkinen/Documents/src/summer-2025/da-dl/recursive-writing/wasteland-europa"
VERIFICATION_DIR="${PROJECT_ROOT}/verification-results"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
REPORT_FILE="${VERIFICATION_DIR}/verification-report-${TIMESTAMP}.md"

# Create verification results directory
mkdir -p "$VERIFICATION_DIR"

echo "=== WASTELAND EUROPA COMPLETE VERIFICATION ==="
echo "Timestamp: $(date)"
echo "Project: Wasteland Europa"
echo "Verification ID: $TIMESTAMP"
echo ""

# Initialize report
cat > "$REPORT_FILE" << EOF
# Wasteland Europa - Complete Verification Report

**Verification ID:** $TIMESTAMP  
**Date:** $(date)  
**Project:** Wasteland Europa Post-Apocalyptic Narrative

---

## Executive Summary

This report provides comprehensive verification of the completed Wasteland Europa project, including file structure, content quality, word counts, and timeline consistency.

---

EOF

echo "1. Running file structure verification..."
echo "## File Structure Verification" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"
cd "$PROJECT_ROOT"
bash verify-project-files.sh >> "$REPORT_FILE" 2>&1
echo "" >> "$REPORT_FILE"

echo "2. Running word count analysis..."
echo "## Word Count Analysis" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"
bash analyze-word-counts-fixed.sh >> "$REPORT_FILE" 2>&1
echo "" >> "$REPORT_FILE"

echo "3. Running content quality checks..."
echo "## Content Quality Verification" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"
bash verify-content-quality.sh >> "$REPORT_FILE" 2>&1
echo "" >> "$REPORT_FILE"

echo "4. Generating scene summaries..."
echo "## Scene Summary Generation" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"
python3 generate-scene-summaries.py >> "$REPORT_FILE" 2>&1
echo "" >> "$REPORT_FILE"

echo "5. Running timeline consistency checks..."
echo "## Timeline Consistency Verification" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"
bash verify-timeline-consistency.sh >> "$REPORT_FILE" 2>&1
echo "" >> "$REPORT_FILE"

# Generate final assessment
echo "## Final Assessment" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"
echo "**Verification Date:** $(date)" >> "$REPORT_FILE"
echo "**Project Status:** Based on above analysis" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"
echo "### Key Metrics:" >> "$REPORT_FILE"
echo "- Total scenes expected: 30" >> "$REPORT_FILE"
echo "- Target word count: ~75,000 words" >> "$REPORT_FILE"
echo "- File structure completeness: [See analysis above]" >> "$REPORT_FILE"
echo "- Content quality: [See analysis above]" >> "$REPORT_FILE"
echo "- Timeline consistency: [See analysis above]" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"
echo "### Recommendations:" >> "$REPORT_FILE"
echo "Based on verification results, see individual sections for specific action items." >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

echo ""
echo "COMPLETE VERIFICATION FINISHED"
echo "=============================="
echo "Report saved to: $REPORT_FILE"
echo ""
echo "Quick access to verification files:"
echo "- Master report: $REPORT_FILE"
echo "- Word count CSV: ${PROJECT_ROOT}/word-count-analysis.csv"
echo "- Scene summaries: ${PROJECT_ROOT}/scene-summaries-extracted.md"
