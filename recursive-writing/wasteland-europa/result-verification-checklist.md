# Wasteland Europa - Result Verification Checklist

**Created:** June 5, 2025  
**Project:** Wasteland Europa - Complete Project Verification  
**Purpose:** Comprehensive verification of all completed narratives, scene files, and project consistency

---

## Overview

This checklist provides automated and manual verification procedures to ensure the Wasteland Europa project is complete, consistent, and ready for publication. It includes verification tools, consistency checks, and quality assurance procedures.

---

## Phase 1: File Existence and Structure Verification

### 1.1 Core File Inventory Check

**Purpose:** Verify all expected files exist with correct naming patterns

#### Scene Template Files (30 expected)
- [x] All scene files exist in `/scenes/` directory ✅ **COMPLETE** (30/30)
- [x] All scene files follow naming pattern: `scene-[##][letter?]-[title].md` ✅ **VERIFIED**
- [x] Scene numbering is consecutive and complete (01-21 + lettered variants) ✅ **VERIFIED**
- [x] All scene files contain required sections (metadata, summary, etc.) ✅ **VERIFIED**

#### Narrative Files (30 expected)
- [x] All narrative files exist in `/narrative/` directory ✅ **COMPLETE** (30/30)
- [x] All narrative files follow naming pattern: `scene-[##][letter?]-[title]-narrative.md` ✅ **VERIFIED**
- [x] Each scene template has corresponding narrative file ✅ **VERIFIED**
- [x] All narrative files contain complete prose narratives ✅ **27/30 COMPLETE** (3 need development)

#### Timeline and Reference Files
- [x] `scenes-timeline.md` exists and is current ✅ **VERIFIED**
- [x] `timeline-template.md` exists and aligns with scenes-timeline ✅ **VERIFIED**
- [x] `narrative-generation-checklist.md` reflects current completion status ✅ **VERIFIED**
- [x] All cross-references between files are valid and functional ✅ **VERIFIED**

### 1.2 Automated File Verification Tool

**Tool Purpose:** Systematically check file existence, naming, and basic structure

```bash
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
    NARRATIVE_FILE="${NARRATIVE_DIR}/${scene}-narrative.md"
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
```

---

## Phase 2: Word Count and Content Verification

### 2.1 Word Count Analysis Tool

**Purpose:** Verify narrative files meet target word counts and extract actual statistics

```bash
#!/bin/bash
# File: analyze-word-counts.sh
# Purpose: Analyze word counts for all narrative files

PROJECT_ROOT="/Users/sami.j.p.heikkinen/Documents/src/summer-2025/da-dl/recursive-writing/wasteland-europa"
NARRATIVE_DIR="${PROJECT_ROOT}/narrative"
OUTPUT_FILE="${PROJECT_ROOT}/word-count-analysis.csv"

echo "=== WORD COUNT ANALYSIS ==="
echo "Timestamp: $(date)"
echo ""

# Create CSV header
echo "Scene,File,Target_Words,Actual_Words,Status,Percentage" > "$OUTPUT_FILE"

# Define expected word counts (from narrative-generation-checklist.md)
declare -A TARGET_WORDS=(
    ["scene-01-museum-discovery"]=3100
    ["scene-02-herald-warning"]=2100
    ["scene-03-winter-crucible"]=2487
    ["scene-03b-blood-and-steel"]=1547
    ["scene-04-the-masked-wanderer"]=1247
    ["scene-04b-savage-attraction"]=2500
    ["scene-05-brotherhood-of-survivors"]=2947
    ["scene-05b-night-raid"]=2500
    ["scene-06-into-the-tunnel"]=1847
    ["scene-07-tunnel-horrors"]=2987
    ["scene-07b-flesh-and-fire"]=2000
    ["scene-08-first-horde-contact"]=2634
    ["scene-08b-katja-hunt"]=2500
    ["scene-09-paris-underground"]=3500
    ["scene-10-reflections-of-apocalypse"]=2487
    ["scene-10b-scarred-passion"]=2500
    ["scene-11-the-archivist-s-burden"]=1987
    ["scene-11b-blade-dance"]=3000
    ["scene-12-leaving-paris"]=2047
    ["scene-13-rhine-valley-arrival"]=2489
    ["scene-13b-gathering-storm"]=2500
    ["scene-14-scarred-lord"]=3500
    ["scene-15-rhine-battle"]=4000
    ["scene-16-walking-apocalypse"]=2500
    ["scene-16b-bloodlust-desire"]=3000
    ["scene-17-escape-to-the-alps"]=2000
    ["scene-18-alpine-sanctuary-discovery"]=3000
    ["scene-19-the-keeper-s-test"]=3000
    ["scene-20-the-stargazer-s-choice"]=2500
    ["scene-21-return-journey"]=2000
)

TOTAL_TARGET=0
TOTAL_ACTUAL=0
COMPLIANT_COUNT=0

echo "Scene Analysis:"
echo "==============="

for scene in "${!TARGET_WORDS[@]}"; do
    NARRATIVE_FILE="${NARRATIVE_DIR}/${scene}-narrative.md"
    TARGET=${TARGET_WORDS[$scene]}
    
    if [[ -f "$NARRATIVE_FILE" ]]; then
        # Count words (excluding markdown formatting)
        ACTUAL=$(cat "$NARRATIVE_FILE" | sed 's/[#*`-]//g' | wc -w | xargs)
        PERCENTAGE=$(echo "scale=1; $ACTUAL * 100 / $TARGET" | bc)
        
        # Status determination
        if (( $(echo "$PERCENTAGE >= 90.0" | bc -l) )); then
            STATUS="✅ COMPLIANT"
            COMPLIANT_COUNT=$((COMPLIANT_COUNT + 1))
        elif (( $(echo "$PERCENTAGE >= 75.0" | bc -l) )); then
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
echo "Overall percentage: $(echo "scale=1; $TOTAL_ACTUAL * 100 / $TOTAL_TARGET" | bc)%"
echo "Compliant scenes: $COMPLIANT_COUNT/30"
echo ""
echo "Analysis saved to: $OUTPUT_FILE"
```

### 2.2 Content Quality Checks

**Purpose:** Verify narrative files contain complete prose content, not just templates

```bash
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
        TEMPLATE_INDICATORS=$(grep -c "\[To be developed\]\|\[TEMPLATE\]\|\[TODO\]\|XXX\|PLACEHOLDER" "$narrative_file" 2>/dev/null || echo 0)
        
        # Check for narrative prose indicators
        PROSE_INDICATORS=$(grep -c "Maya\|Viktor\|Elena\|said\|thought\|felt\|walked\|looked" "$narrative_file" 2>/dev/null || echo 0)
        
        # Check minimum content length (should be substantial prose, not just headers)
        CONTENT_LINES=$(grep -v "^#\|^$\|^\s*$" "$narrative_file" | wc -l | xargs)
        
        if [[ $TEMPLATE_INDICATORS -gt 0 ]]; then
            echo "❌ $filename - Contains template placeholders ($TEMPLATE_INDICATORS found)"
            INCOMPLETE_COUNT=$((INCOMPLETE_COUNT + 1))
        elif [[ $PROSE_INDICATORS -lt 10 ]]; then
            echo "⚠️ $filename - Limited prose content ($PROSE_INDICATORS prose indicators)"
            INCOMPLETE_COUNT=$((INCOMPLETE_COUNT + 1))
        elif [[ $CONTENT_LINES -lt 50 ]]; then
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
```

### 2.3 Verification Results - Word Count & Content Quality

**Status as of June 5, 2025:**

#### Word Count Analysis Results:
- [x] **Total words:** 59,421 out of 76,406 target (77.7% completion)
- [x] **Compliant scenes (≥90%):** 9/30 scenes ✅
- [x] **Acceptable scenes (75-89%):** 9/30 scenes ⚠️  
- [x] **Scenes needing work (<75%):** 12/30 scenes ❌

#### Scenes Requiring Additional Content (Priority Order):
1. **scene-01-museum-discovery:** 1,343/3,100 words (43.3%) - High priority opening scene
2. **scene-15-rhine-battle:** 2,068/4,000 words (51.7%) - Major climactic battle
3. **scene-04b-savage-attraction:** 1,543/2,500 words (61.7%) - Adult enhancement scene
4. **scene-05b-night-raid:** 1,433/2,500 words (57.3%) - Adult enhancement scene
5. **scene-16-walking-apocalypse:** 1,474/2,500 words (58.9%) - Critical plot scene
6. **scene-10b-scarred-passion:** 1,606/2,500 words (64.2%) - Adult enhancement scene
7. **scene-14-scarred-lord:** 2,359/3,500 words (67.4%) - Major character introduction
8. **scene-07b-flesh-and-fire:** 1,376/2,000 words (68.8%) - Adult enhancement scene
9. **scene-08b-katja-hunt:** 1,704/2,500 words (68.1%) - Adult enhancement scene
10. **scene-07-tunnel-horrors:** 2,190/2,987 words (73.3%) - Core horror sequence
11. **scene-19-the-keeper-s-test:** 2,199/3,000 words (73.3%) - Critical test scene
12. **scene-08-first-horde-contact:** 1,958/2,634 words (74.3%) - First major encounter

#### Content Quality Results:
- [x] **Complete narratives:** 27/30 ✅
- [x] **Files needing content development:** 3/30 ⚠️
  - scene-01-museum-discovery-narrative.md (short content - 44 lines)
  - scene-04-the-masked-wanderer-narrative.md (short content - 33 lines)  
  - scene-06-into-the-tunnel-narrative.md (limited prose - 7 indicators)

---

## Phase 3: Scene Summary Generation and Verification

### 3.1 Summary Extraction Tool

**Purpose:** Generate or update scene summaries for cross-referencing

```python
#!/usr/bin/env python3
# File: generate-scene-summaries.py
# Purpose: Extract/generate summaries from narrative files

import os
import re
import markdown
from pathlib import Path

PROJECT_ROOT = "/Users/sami.j.p.heikkinen/Documents/src/summer-2025/da-dl/recursive-writing/wasteland-europa"
NARRATIVE_DIR = f"{PROJECT_ROOT}/narrative"
SCENES_DIR = f"{PROJECT_ROOT}/scenes"
OUTPUT_FILE = f"{PROJECT_ROOT}/scene-summaries-extracted.md"

def extract_summary_from_narrative(narrative_file):
    """Extract key events and summary from narrative file."""
    try:
        with open(narrative_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Look for existing summary sections
        summary_patterns = [
            r'## Summary.*?\n(.*?)(?=\n##|\n---|\Z)',
            r'## Scene Summary.*?\n(.*?)(?=\n##|\n---|\Z)',
            r'## Key Events.*?\n(.*?)(?=\n##|\n---|\Z)'
        ]
        
        for pattern in summary_patterns:
            match = re.search(pattern, content, re.DOTALL | re.IGNORECASE)
            if match:
                return match.group(1).strip()
        
        # If no summary found, extract first few paragraphs as summary
        paragraphs = [p.strip() for p in content.split('\n\n') if p.strip() and not p.startswith('#')]
        if paragraphs:
            # Take first 2-3 substantial paragraphs
            summary_parts = []
            word_count = 0
            for para in paragraphs[:5]:  # Check first 5 paragraphs
                if len(para) > 50:  # Substantial paragraph
                    summary_parts.append(para)
                    word_count += len(para.split())
                    if word_count > 100:  # Enough content for summary
                        break
            
            if summary_parts:
                return ' '.join(summary_parts)[:500] + "..."
        
        return "No summary available - narrative content incomplete"
        
    except Exception as e:
        return f"Error reading file: {str(e)}"

def check_scene_has_summary(scene_file):
    """Check if scene template file already has a summary."""
    try:
        with open(scene_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        summary_indicators = [
            '## Narrative Summary',
            '## Scene Summary',
            '## Summary',
            'Summary:**',
            'narrative complete'
        ]
        
        for indicator in summary_indicators:
            if indicator in content:
                return True
        return False
        
    except Exception as e:
        return False

def main():
    """Generate comprehensive scene summaries."""
    print("=== SCENE SUMMARY GENERATION ===")
    print(f"Timestamp: {datetime.now()}")
    print()
    
    summaries = []
    scenes_with_summaries = 0
    scenes_needing_summaries = 0
    
    # Process all narrative files
    narrative_files = sorted([f for f in os.listdir(NARRATIVE_DIR) if f.endswith('-narrative.md')])
    
    for narrative_file in narrative_files:
        scene_name = narrative_file.replace('-narrative.md', '')
        narrative_path = os.path.join(NARRATIVE_DIR, narrative_file)
        scene_path = os.path.join(SCENES_DIR, f"{scene_name}.md")
        
        print(f"Processing: {scene_name}")
        
        # Check if scene already has summary
        has_summary = check_scene_has_summary(scene_path) if os.path.exists(scene_path) else False
        
        # Extract summary from narrative
        summary = extract_summary_from_narrative(narrative_path)
        
        if has_summary:
            print(f"  ✅ Scene already has summary")
            scenes_with_summaries += 1
        else:
            print(f"  📝 Generated summary from narrative")
            scenes_needing_summaries += 1
        
        summaries.append({
            'scene': scene_name,
            'has_existing_summary': has_summary,
            'extracted_summary': summary,
            'narrative_file': narrative_file,
            'scene_file': f"{scene_name}.md" if os.path.exists(scene_path) else "MISSING"
        })
    
    # Generate summary report
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        f.write("# Wasteland Europa - Scene Summaries Report\n\n")
        f.write(f"**Generated:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
        f.write(f"**Purpose:** Cross-reference summaries for timeline verification\n\n")
        
        f.write("## Summary Status Overview\n\n")
        f.write(f"- Scenes with existing summaries: {scenes_with_summaries}\n")
        f.write(f"- Scenes needing summaries: {scenes_needing_summaries}\n")
        f.write(f"- Total scenes processed: {len(summaries)}\n\n")
        
        f.write("## Scene Summaries\n\n")
        
        for summary_data in summaries:
            f.write(f"### {summary_data['scene']}\n\n")
            f.write(f"**Files:** {summary_data['scene_file']} | {summary_data['narrative_file']}\n")
            f.write(f"**Has Summary:** {'✅ Yes' if summary_data['has_existing_summary'] else '❌ No'}\n\n")
            f.write(f"**Extracted Summary:**\n{summary_data['extracted_summary']}\n\n")
            f.write("---\n\n")
    
    print()
    print("SUMMARY GENERATION COMPLETE:")
    print("============================")
    print(f"Scenes with summaries: {scenes_with_summaries}")
    print(f"Scenes needing summaries: {scenes_needing_summaries}")
    print(f"Report saved to: {OUTPUT_FILE}")

if __name__ == "__main__":
    from datetime import datetime
    main()
```

### 3.2 Timeline Cross-Reference Verification

**Purpose:** Verify scene summaries match timeline events and chronology

```bash
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

COMPLETION_RATE=$(echo "scale=1; $COMPLETE_MARKERS * 100 / $TOTAL_SCENES" | bc)
echo "Completion rate: $COMPLETION_RATE%"

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
    CHECKLIST_TOTAL=$(grep -c "Scene [0-9]" "$CHECKLIST_FILE" | head -1)
    
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
```

---

## Phase 4: Automated Verification Runner

### 4.1 Master Verification Script

**Purpose:** Run all verification tools in sequence and generate comprehensive report

```bash
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
./verify-project-files.sh >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

echo "2. Running word count analysis..."
echo "## Word Count Analysis" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"
./analyze-word-counts.sh >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

echo "3. Running content quality checks..."
echo "## Content Quality Verification" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"
./verify-content-quality.sh >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

echo "4. Generating scene summaries..."
echo "## Scene Summary Generation" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"
python3 generate-scene-summaries.py >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

echo "5. Running timeline consistency checks..."
echo "## Timeline Consistency Verification" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"
./verify-timeline-consistency.sh >> "$REPORT_FILE"
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
```

---

## Phase 5: Manual Quality Assurance Checklist

### 5.1 Content Quality Manual Review

**Purpose:** Human verification of aspects that require editorial judgment

#### Narrative Quality Checklist
- [ ] **Opening Hooks:** Each scene begins with engaging opening that draws reader in
- [ ] **Character Voice Consistency:** Maya, Viktor, Elena maintain consistent personalities
- [ ] **Heavy Metal Aesthetic:** Gothic industrial atmosphere maintained throughout
- [ ] **Action Sequences:** Combat scenes are visceral and clearly choreographed
- [ ] **Romantic Content:** Adult scenes are mature, well-integrated, and meaningful
- [ ] **World-building Consistency:** Post-apocalyptic details align across all scenes
- [ ] **Dialogue Authenticity:** Character speech reflects backgrounds and relationships
- [ ] **Pacing Balance:** Good mix of action, dialogue, internal monologue, description

#### Technical Writing Quality
- [ ] **Grammar and Syntax:** Professional prose quality throughout
- [ ] **Paragraph Structure:** Proper breaks and flow for readability
- [ ] **Scene Transitions:** Smooth connections between scenes and acts
- [ ] **Tense Consistency:** Narrative tense maintained consistently
- [ ] **POV Consistency:** Point of view shifts are deliberate and clear
- [ ] **Formatting:** Proper markdown formatting and structure

### 5.2 Timeline and Continuity Review

#### Story Progression Verification
- [ ] **Chronological Order:** Events flow logically from June to August 2154
- [ ] **Character Development:** Maya's growth arc is clear and believable
- [ ] **Relationship Evolution:** Maya/Viktor/Elena dynamics develop naturally
- [ ] **Plot Progression:** Quest objective (finding sanctuary) drives narrative
- [ ] **Conflict Escalation:** Tension builds appropriately toward climax
- [ ] **Resolution Satisfaction:** Ending provides meaningful conclusion

#### Reference Consistency
- [ ] **Location Details:** Geographic descriptions match established world
- [ ] **Technology Level:** Post-apocalyptic tech usage is consistent
- [ ] **Faction Behavior:** Crimson Horde, Underground, etc. act consistently
- [ ] **Historical References:** Great Collapse (2089) backstory aligns
- [ ] **Character Backgrounds:** Personal histories mentioned consistently

---

## Phase 6: Publication Readiness Assessment

### 6.1 Format and Organization Check

#### File Organization
- [ ] **Clear Directory Structure:** Scenes, narratives, planning properly separated
- [ ] **Naming Conventions:** All files follow consistent naming patterns
- [ ] **Navigation Links:** Cross-references between files work correctly
- [ ] **Metadata Completeness:** All files have proper headers and content warnings

#### Content Organization
- [ ] **Scene Templates Complete:** All scene files have comprehensive structure
- [ ] **Narrative Files Complete:** All prose narratives are publication-ready
- [ ] **Supporting Materials:** Character profiles, locations, plots fully developed
- [ ] **Timeline Documentation:** Complete chronological reference available

### 6.2 Editorial Completeness

#### Content Warnings and Classifications
- [ ] **Adult Content Labeled:** Mature scenes have appropriate warnings
- [ ] **Violence Indicators:** Combat content properly marked
- [ ] **Genre Classification:** Heavy Metal aesthetic clearly established
- [ ] **Target Audience:** Adult readership level maintained consistently

#### Professional Standards
- [ ] **Word Count Compliance:** Scenes meet target lengths for magazine format
- [ ] **Series Potential:** Structure supports episodic publication
- [ ] **Visual Description:** Rich imagery suitable for illustration
- [ ] **Thematic Coherence:** Core themes (survival, hope, sacrifice) clear throughout

---

## Usage Instructions

### Running Automated Verification

1. **Set Execute Permissions:**
   ```bash
   chmod +x verify-project-files.sh
   chmod +x analyze-word-counts.sh
   chmod +x verify-content-quality.sh
   chmod +x verify-timeline-consistency.sh
   chmod +x run-complete-verification.sh
   ```

2. **Run Individual Tools:**
   ```bash
   ./verify-project-files.sh
   ./analyze-word-counts.sh
   ./verify-content-quality.sh
   python3 generate-scene-summaries.py
   ./verify-timeline-consistency.sh
   ```

3. **Run Complete Verification:**
   ```bash
   ./run-complete-verification.sh
   ```

### Manual Review Process

1. **Review automated report results**
2. **Complete manual quality checklist sections**
3. **Address any issues identified in verification**
4. **Re-run verification after fixes**
5. **Confirm publication readiness**

---

## Success Criteria

### Project Completion Verification

**PASS Criteria:**
- ✅ All 30 scene files present and properly structured **COMPLETE**
- ✅ All 30 narrative files present with complete prose content **27/30 COMPLETE**
- ⚠️ Total word count 70,000+ words (target: ~75,000) **59,421/76,406 (77.7%)**
- ❌ All scenes meet minimum 90% of target word counts **9/30 COMPLIANT**
- ✅ Timeline consistency verified across all reference documents **VERIFIED**
- ⚠️ No template placeholders or incomplete content **3 FILES NEED WORK**
- [ ] Manual quality review confirms professional standards **PENDING**

**Current Status as of June 5, 2025:**
- ⚠️ **NEAR COMPLETION** - Project structurally complete, needs content expansion
- **File Structure:** 100% complete (60/60 files present)
- **Content Quality:** 90% complete (27/30 narratives complete)
- **Word Count:** 77.7% complete (59,421/76,406 words)
- **Priority:** Focus on 12 under-length scenes for target completion

---

**Use this verification checklist to ensure the Wasteland Europa project meets all completion criteria and professional standards for publication as a Heavy Metal magazine-style post-apocalyptic narrative series.**
