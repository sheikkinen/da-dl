#!/bin/zsh

# Hearts at Two Seas - Complete Novel Verification Script
# Verifies that all chapters are properly included in the complete novel
# by sampling random lines from each chapter and checking their presence

set -e  # Exit on any error

# Define paths
HEARTS_DIR="/Users/sami.j.p.heikkinen/Documents/src/summer-2025/da-dl/recursive-writing/hearts-at-two-seas"
NARRATIVE_DIR="$HEARTS_DIR/narrative"
COMPLETE_FILE="$HEARTS_DIR/hearts-at-two-seas-complete.md"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Configuration
LINES_TO_SAMPLE=3  # Number of random lines to sample from each chapter
MIN_LINE_LENGTH=20 # Minimum length for a line to be considered for sampling

echo -e "${BLUE}Hearts at Two Seas - Complete Novel Verification${NC}"
echo -e "${BLUE}=============================================${NC}"

# Check if complete file exists
if [[ ! -f "$COMPLETE_FILE" ]]; then
    echo -e "${RED}Error: Complete novel file not found at $COMPLETE_FILE${NC}"
    echo -e "${YELLOW}Please run ./concat-complete-novel.zsh first${NC}"
    exit 1
fi

# Check if narrative directory exists
if [[ ! -d "$NARRATIVE_DIR" ]]; then
    echo -e "${RED}Error: Narrative directory not found at $NARRATIVE_DIR${NC}"
    exit 1
fi

# Initialize counters
total_chapters=0
verified_chapters=0
total_lines_tested=0
lines_found=0
missing_lines=()

echo -e "${GREEN}Complete novel file found: $(du -h "$COMPLETE_FILE" | cut -f1)${NC}"
echo -e "${GREEN}Sampling $LINES_TO_SAMPLE random lines from each chapter...${NC}"
echo ""

# Function to get random lines from a file
get_random_lines() {
    local file="$1"
    local num_lines="$2"
    
    # Get meaningful content lines (excluding comments, empty lines, and headers)
    local temp_file="/tmp/content_lines_$$"
    grep -n "." "$file" | \
        grep -v "^[[:space:]]*<!--" | \
        grep -v "^[[:space:]]*$" | \
        grep -v "^[[:space:]]*#" | \
        awk -F: 'length($2) >= '$MIN_LINE_LENGTH' {print $0}' > "$temp_file"
    
    local total_lines=$(wc -l < "$temp_file")
    
    if [[ $total_lines -eq 0 ]]; then
        rm -f "$temp_file"
        return
    fi
    
    if [[ $total_lines -lt $num_lines ]]; then
        num_lines=$total_lines
    fi
    
    # Use jot (available on macOS) for random line selection
    for i in $(jot -r $num_lines 1 $total_lines | sort -u); do
        sed -n "${i}p" "$temp_file"
    done
    
    rm -f "$temp_file"
}

# Function to clean line for grep search (remove special characters that might interfere)
clean_line_for_grep() {
    local line="$1"
    # Remove line numbers, trim whitespace, escape special grep characters
    echo "$line" | sed 's/^[0-9]*://' | sed 's/^[[:space:]]*//' | sed 's/[[:space:]]*$//'
}

# Function to verify a chapter
verify_chapter() {
    local chapter_file="$1"
    local chapter_name=$(basename "$chapter_file" .md)
    
    echo -e "${BLUE}📖 Verifying: $chapter_name${NC}"
    
    total_chapters=$((total_chapters + 1))
    local chapter_verified=true
    local chapter_lines_found=0
    
    # Get random lines from this chapter
    local random_lines=($(get_random_lines "$chapter_file" $LINES_TO_SAMPLE))
    
    if [[ ${#random_lines[@]} -eq 0 ]]; then
        echo -e "${YELLOW}   ⚠️  No suitable lines found for sampling${NC}"
        return
    fi
    
    for random_line in "${random_lines[@]}"; do
        local clean_line=$(clean_line_for_grep "$random_line")
        
        # Skip very short lines or lines that are just punctuation
        if [[ ${#clean_line} -lt $MIN_LINE_LENGTH ]]; then
            continue
        fi
        
        total_lines_tested=$((total_lines_tested + 1))
        
        # Search for the line in the complete file
        if grep -q -F "$clean_line" "$COMPLETE_FILE"; then
            echo -e "${GREEN}   ✅ Found: ${clean_line:0:60}...${NC}"
            lines_found=$((lines_found + 1))
            chapter_lines_found=$((chapter_lines_found + 1))
        else
            echo -e "${RED}   ❌ Missing: ${clean_line:0:60}...${NC}"
            missing_lines+=("$chapter_name: $clean_line")
            chapter_verified=false
        fi
    done
    
    if [[ $chapter_verified == true && $chapter_lines_found -gt 0 ]]; then
        verified_chapters=$((verified_chapters + 1))
        echo -e "${GREEN}   ✅ Chapter verification: PASSED${NC}"
    else
        echo -e "${RED}   ❌ Chapter verification: FAILED${NC}"
    fi
    
    echo ""
}

# Verify all chapters in order
echo -e "${PURPLE}=== Verifying Act 1 ===${NC}"
for chapter in "$NARRATIVE_DIR/act1"/Luku_*.md; do
    if [[ -f "$chapter" ]]; then
        verify_chapter "$chapter"
    fi
done

echo -e "${PURPLE}=== Verifying Act 2A ===${NC}"
for chapter in "$NARRATIVE_DIR/act2a"/Luku_*.md; do
    if [[ -f "$chapter" ]]; then
        verify_chapter "$chapter"
    fi
done

echo -e "${PURPLE}=== Verifying Act 2B ===${NC}"
for chapter in "$NARRATIVE_DIR/act2b"/Luku_*.md; do
    if [[ -f "$chapter" ]]; then
        verify_chapter "$chapter"
    fi
done

echo -e "${PURPLE}=== Verifying Act 3 ===${NC}"
for chapter in "$NARRATIVE_DIR/act3"/Luku_*.md; do
    if [[ -f "$chapter" ]]; then
        verify_chapter "$chapter"
    fi
done

# Additional verification: Check for chapter titles in complete file
echo -e "${PURPLE}=== Verifying Chapter Titles ===${NC}"
chapter_titles_found=0
chapter_titles_total=0

for act_dir in "$NARRATIVE_DIR"/{act1,act2a,act2b,act3}; do
    if [[ -d "$act_dir" ]]; then
        for chapter in "$act_dir"/Luku_*.md; do
            if [[ -f "$chapter" ]]; then
                chapter_titles_total=$((chapter_titles_total + 1))
                # Extract chapter title (first # heading)
                local title=$(head -10 "$chapter" | grep "^# Luku" | head -1)
                if [[ -n "$title" ]]; then
                    if grep -q -F "$title" "$COMPLETE_FILE"; then
                        echo -e "${GREEN}   ✅ Title found: $title${NC}"
                        chapter_titles_found=$((chapter_titles_found + 1))
                    else
                        echo -e "${RED}   ❌ Title missing: $title${NC}"
                    fi
                fi
            fi
        done
    fi
done

# Generate summary report
echo -e "${BLUE}=============================================${NC}"
echo -e "${BLUE}📊 VERIFICATION SUMMARY${NC}"
echo -e "${BLUE}=============================================${NC}"
echo -e "${GREEN}Chapters processed: $total_chapters${NC}"
echo -e "${GREEN}Chapters verified: $verified_chapters${NC}"
echo -e "${GREEN}Total lines tested: $total_lines_tested${NC}"
echo -e "${GREEN}Lines found: $lines_found${NC}"
echo -e "${GREEN}Chapter titles found: $chapter_titles_found/$chapter_titles_total${NC}"

# Calculate success rates
if [[ $total_chapters -gt 0 ]]; then
    chapter_success_rate=$(( (verified_chapters * 100) / total_chapters ))
    echo -e "${GREEN}Chapter verification rate: $chapter_success_rate%${NC}"
fi

if [[ $total_lines_tested -gt 0 ]]; then
    line_success_rate=$(( (lines_found * 100) / total_lines_tested ))
    echo -e "${GREEN}Line verification rate: $line_success_rate%${NC}"
fi

# Report missing lines if any
if [[ ${#missing_lines[@]} -gt 0 ]]; then
    echo -e "${YELLOW}⚠️  Missing lines detected:${NC}"
    for missing_line in "${missing_lines[@]}"; do
        echo -e "${RED}   - $missing_line${NC}"
    done
fi

# Final verdict
echo ""
if [[ $verified_chapters -eq $total_chapters && $chapter_titles_found -eq $chapter_titles_total && ${#missing_lines[@]} -eq 0 ]]; then
    echo -e "${GREEN}🎉 VERIFICATION PASSED: Complete novel contains all chapters!${NC}"
    exit 0
elif [[ $line_success_rate -ge 90 && $chapter_success_rate -ge 90 ]]; then
    echo -e "${YELLOW}⚠️  VERIFICATION MOSTLY PASSED: Minor issues detected but novel appears complete${NC}"
    exit 0
else
    echo -e "${RED}❌ VERIFICATION FAILED: Significant content missing from complete novel${NC}"
    echo -e "${YELLOW}💡 Recommendation: Re-run ./concat-complete-novel.zsh to regenerate complete file${NC}"
    exit 1
fi
