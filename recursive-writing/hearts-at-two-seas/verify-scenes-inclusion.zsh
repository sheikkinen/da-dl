#!/usr/bin/env zsh

# Script: verify-scenes-inclusion.zsh
# Purpose: Verify that all scenes from the Hearts at Two Seas novel are included in the complete concatenated version
# Author: Generated for QA verification
# Date: 2025-01-06

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
NARRATIVE_DIR="${SCRIPT_DIR}/narrative"
COMPLETE_NOVEL="${SCRIPT_DIR}/hearts-at-two-seas-complete.md"
LINES_TO_SAMPLE=5  # Number of random lines to sample from each file
MIN_LINE_LENGTH=20  # Minimum line length to consider for sampling

# Statistics tracking
total_files=0
total_lines_checked=0
missing_lines=0
files_with_missing_content=0

echo -e "${CYAN}=== Hearts at Two Seas - Scene Inclusion Verification ===${NC}"
echo -e "${BLUE}Verifying that all scenes are included in the complete novel${NC}"
echo

# Check if complete novel exists
if [[ ! -f "$COMPLETE_NOVEL" ]]; then
    echo -e "${RED}ERROR: Complete novel file not found: $COMPLETE_NOVEL${NC}"
    exit 1
fi

# Check if narrative directory exists
if [[ ! -d "$NARRATIVE_DIR" ]]; then
    echo -e "${RED}ERROR: Narrative directory not found: $NARRATIVE_DIR${NC}"
    exit 1
fi

echo -e "${YELLOW}Configuration:${NC}"
echo "  Narrative Directory: $NARRATIVE_DIR"
echo "  Complete Novel: $COMPLETE_NOVEL"
echo "  Lines to sample per file: $LINES_TO_SAMPLE"
echo "  Minimum line length: $MIN_LINE_LENGTH"
echo

# Function to get random lines from a file (excluding metadata and empty lines)
get_random_lines() {
    local file="$1"
    local num_lines="$2"
    
    # Get content lines (skip metadata and empty lines)
    grep -v '^#' "$file" | \
    grep -v '^---' | \
    grep -v '^$' | \
    awk "length >= $MIN_LINE_LENGTH" | \
    if command -v gshuf >/dev/null 2>&1; then
        gshuf -n "$num_lines"
    elif command -v shuf >/dev/null 2>&1; then
        shuf -n "$num_lines"
    else
        # Fallback for systems without shuf/gshuf
        awk -v n="$num_lines" 'BEGIN{srand()} {lines[NR]=$0} END{
            for(i=1; i<=n && i<=NR; i++) {
                r = int(rand() * NR) + 1
                print lines[r]
                delete lines[r]
            }
        }'
    fi
}

# Function to check if a line exists in the complete novel
check_line_in_novel() {
    local line="$1"
    # Use fixed string search to avoid regex issues
    grep -F "$line" "$COMPLETE_NOVEL" >/dev/null 2>&1
}

# Function to process a single file
process_file() {
    local file="$1"
    local relative_path="${file#$NARRATIVE_DIR/}"
    
    echo -e "${PURPLE}Processing: $relative_path${NC}"
    
    # Get random lines from the file
    local lines=()
    while IFS= read -r line; do
        lines+=("$line")
    done < <(get_random_lines "$file" "$LINES_TO_SAMPLE")
    
    if [[ ${#lines[@]} -eq 0 ]]; then
        echo -e "  ${YELLOW}Warning: No suitable lines found to sample${NC}"
        return
    fi
    
    local file_missing=0
    
    # Check each sampled line
    for line in "${lines[@]}"; do
        if [[ -n "$line" ]]; then
            ((total_lines_checked++))
            if check_line_in_novel "$line"; then
                echo -e "  ${GREEN}✓${NC} Found: ${line:0:60}..."
            else
                echo -e "  ${RED}✗${NC} Missing: ${line:0:60}..."
                ((missing_lines++))
                ((file_missing++))
            fi
        fi
    done
    
    if [[ $file_missing -gt 0 ]]; then
        ((files_with_missing_content++))
    fi
    
    echo
}

# Main verification process
echo -e "${CYAN}Starting verification process...${NC}"
echo

# Find all markdown files in the narrative directory (excluding README and documentation files)
while IFS= read -r -d '' file; do
    if [[ -f "$file" && "$file" == *.md ]]; then
        # Skip README files and other documentation
        local basename=$(basename "$file")
        if [[ "$basename" != "README.md" && "$basename" != "readme.md" && "$basename" != "NOTES.md" && "$basename" != "notes.md" ]]; then
            ((total_files++))
            process_file "$file"
        fi
    fi
done < <(find "$NARRATIVE_DIR" -name "*.md" -type f -print0 | sort -z)

# Generate summary report
echo -e "${CYAN}=== VERIFICATION SUMMARY ===${NC}"
echo
echo -e "${BLUE}Statistics:${NC}"
echo "  Total files processed: $total_files"
echo "  Total lines checked: $total_lines_checked"
echo "  Missing lines: $missing_lines"
echo "  Files with missing content: $files_with_missing_content"
echo

# Calculate success rate
if [[ $total_lines_checked -gt 0 ]]; then
    success_rate=$(( (total_lines_checked - missing_lines) * 100 / total_lines_checked ))
    echo -e "${BLUE}Success Rate: ${success_rate}%${NC}"
else
    echo -e "${YELLOW}No lines were checked${NC}"
fi

echo

# Final result
if [[ $missing_lines -eq 0 ]]; then
    echo -e "${GREEN}✅ VERIFICATION PASSED${NC}"
    echo -e "${GREEN}All sampled content from scene files is present in the complete novel${NC}"
    exit_code=0
else
    echo -e "${RED}❌ VERIFICATION FAILED${NC}"
    echo -e "${RED}Some content appears to be missing from the complete novel${NC}"
    echo -e "${YELLOW}Recommendation: Re-run the concatenation script or investigate missing content${NC}"
    exit_code=1
fi

echo
echo -e "${CYAN}Verification completed at $(date)${NC}"

exit $exit_code
