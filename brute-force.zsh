#!/usr/bin/env zsh

# AI Friendly Summary: Brute-force narrative concatenation script that finds all markdown files in a directory tree and concatenates them in natural order, with minimal filtering and maximum compatibility.

# Brute-Force Narrative Concatenation Script
# 
# Simple, robust concatenation of all markdown files in a directory structure.
# No complex parsing - just finds files, sorts them, and concatenates.
# 
# Usage: ./brute-force.zsh [input-dir] [output-file] [options]
# 
# Options:
#   --no-headers     Don't add chapter headers
#   --no-separators  Don't add separators between files
#   --include-toc    Add table of contents
#   --title=TITLE    Custom document title
#   --help           Show this help
# 
# Examples:
#   ./brute-force.zsh recursive-writing/discourses-with-ai/narrative/chapters
#   ./brute-force.zsh chapters/ output.md --include-toc
#   ./brute-force.zsh . combined.md --title="My Story" --no-separators

# Set script options
set -e  # Exit on error
setopt NULL_GLOB  # Don't error on empty globs

# Default values
INPUT_DIR="."
OUTPUT_FILE="brute-force-narrative.md"
TITLE="Combined Narrative"
ADD_HEADERS=true
ADD_SEPARATORS=true
INCLUDE_TOC=false
SHOW_HELP=false

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to show help
show_help() {
    cat << EOF
🔨 Brute-Force Narrative Concatenation Script

Simple, robust concatenation of all markdown files in a directory structure.
No complex parsing - just finds files, sorts them, and concatenates.

Usage: ./brute-force.zsh [input-dir] [output-file] [options]

Arguments:
  input-dir     Directory to search for markdown files (default: .)
  output-file   Output filename (default: brute-force-narrative.md)

Options:
  --no-headers     Don't add chapter headers from filenames
  --no-separators  Don't add separators between files
  --include-toc    Add table of contents at the beginning
  --title=TITLE    Custom document title (default: Combined Narrative)
  --help           Show this help

Examples:
  ./brute-force.zsh
  ./brute-force.zsh recursive-writing/discourses-with-ai/narrative/chapters
  ./brute-force.zsh chapters/ output.md --include-toc
  ./brute-force.zsh . combined.md --title="My Story" --no-separators

Features:
  • Recursively finds all .md files
  • Natural sorting (handles numbers correctly)
  • Preserves original content
  • Minimal filtering (only removes obvious metadata)
  • Cross-platform compatibility
  • Fast processing

EOF
}

# Function to extract title from filename
extract_title() {
    local filename="$1"
    local basename="${filename:t:r}"  # Remove path and extension
    
    # Remove common prefixes and convert to title case
    basename="${basename#[0-9]*-}"  # Remove leading numbers and dash
    basename="${basename//-/ }"     # Replace dashes with spaces
    
    # Convert to title case
    echo "${(C)basename}"
}

# Function to clean content (minimal filtering)
clean_content() {
    local file="$1"
    
    # Remove HTML comments and obvious metadata, but keep everything else
    sed -E \
        -e '/^<!--.*-->$/d' \
        -e '/^<!-- filepath:/d' \
        "$file" 2>/dev/null || cat "$file"
}

# Function to count words in a file
count_words() {
    local file="$1"
    wc -w < "$file" 2>/dev/null || echo "0"
}

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --help)
            SHOW_HELP=true
            shift
            ;;
        --no-headers)
            ADD_HEADERS=false
            shift
            ;;
        --no-separators)
            ADD_SEPARATORS=false
            shift
            ;;
        --include-toc)
            INCLUDE_TOC=true
            shift
            ;;
        --title=*)
            TITLE="${1#*=}"
            shift
            ;;
        -*)
            echo -e "${RED}❌ Unknown option: $1${NC}" >&2
            echo "Use --help for usage information." >&2
            exit 1
            ;;
        *)
            if [[ -z "$INPUT_DIR" || "$INPUT_DIR" == "." ]]; then
                INPUT_DIR="$1"
            elif [[ "$OUTPUT_FILE" == "brute-force-narrative.md" ]]; then
                OUTPUT_FILE="$1"
            else
                echo -e "${RED}❌ Too many arguments: $1${NC}" >&2
                echo "Use --help for usage information." >&2
                exit 1
            fi
            shift
            ;;
    esac
done

# Show help if requested
if [[ "$SHOW_HELP" == "true" ]]; then
    show_help
    exit 0
fi

# Validate input directory
if [[ ! -d "$INPUT_DIR" ]]; then
    echo -e "${RED}❌ Error: Directory '$INPUT_DIR' does not exist${NC}" >&2
    exit 1
fi

echo -e "${BLUE}🔨 Brute-Force Narrative Concatenation${NC}"
echo -e "${BLUE}📁 Input directory: ${INPUT_DIR}${NC}"
echo -e "${BLUE}📝 Output file: ${OUTPUT_FILE}${NC}"
echo -e "${BLUE}📚 Title: ${TITLE}${NC}"
if [[ "$ADD_HEADERS" == "false" ]]; then
    echo -e "${YELLOW}⚠️  Headers disabled${NC}"
fi
if [[ "$ADD_SEPARATORS" == "false" ]]; then
    echo -e "${YELLOW}⚠️  Separators disabled${NC}"
fi
if [[ "$INCLUDE_TOC" == "true" ]]; then
    echo -e "${GREEN}📋 Including table of contents${NC}"
fi
echo

# Find all markdown files recursively
echo -e "${BLUE}🔍 Finding markdown files...${NC}"
typeset -a markdown_files
markdown_files=($(find "$INPUT_DIR" -name "*.md" -type f | sort -V))

if [[ ${#markdown_files[@]} -eq 0 ]]; then
    echo -e "${RED}❌ No markdown files found in '$INPUT_DIR'${NC}" >&2
    exit 1
fi

echo -e "${GREEN}📖 Found ${#markdown_files[@]} markdown files${NC}"

# Prepare file information for TOC if needed
typeset -a file_info
total_words=0

if [[ "$INCLUDE_TOC" == "true" || "$ADD_HEADERS" == "true" ]]; then
    echo -e "${BLUE}📊 Analyzing files...${NC}"
    
    for file in "${markdown_files[@]}"; do
        title=$(extract_title "$file")
        words=$(count_words "$file")
        total_words=$((total_words + words))
        
        file_info+=("$file|$title|$words")
        echo -e "${BLUE}📄 Processing: ${file:t} (${title}, ~${words} words)${NC}"
    done
fi

# Start building the output
echo -e "${BLUE}✍️  Generating combined narrative...${NC}"

# Initialize output file
{
    echo "# $TITLE"
    echo
    echo "*Generated by brute-force concatenation*"
    echo
    
    # Add table of contents if requested
    if [[ "$INCLUDE_TOC" == "true" ]]; then
        echo "## Table of Contents"
        echo
        
        local chapter_num=1
        for info in "${file_info[@]}"; do
            IFS='|' read -r filepath title words <<< "$info"
            echo "$chapter_num. $title *(~$words words)*"
            ((chapter_num++))
        done
        
        echo
        echo "**Total Word Count**: ~$total_words words"
        echo
        echo "---"
        echo
    fi
} > "$OUTPUT_FILE"

# Process each file
local file_count=0
for file in "${markdown_files[@]}"; do
    ((file_count++))
    echo -e "${BLUE}📝 Processing file $file_count/${#markdown_files[@]}: ${file:t}${NC}"
    
    # Add separator if not the first file
    if [[ $file_count -gt 1 && "$ADD_SEPARATORS" == "true" ]]; then
        echo >> "$OUTPUT_FILE"
        echo "---" >> "$OUTPUT_FILE"
        echo >> "$OUTPUT_FILE"
    fi
    
    # Add chapter header if enabled
    if [[ "$ADD_HEADERS" == "true" ]]; then
        title=$(extract_title "$file")
        echo "## $title" >> "$OUTPUT_FILE"
        echo >> "$OUTPUT_FILE"
    fi
    
    # Add the cleaned content
    clean_content "$file" >> "$OUTPUT_FILE"
    echo >> "$OUTPUT_FILE"
done

# Add final statistics
{
    echo
    echo "---"
    echo
    echo "**Final Statistics**"
    echo
    echo "- **Total Files**: ${#markdown_files[@]}"
    if [[ "$INCLUDE_TOC" == "true" || "$ADD_HEADERS" == "true" ]]; then
        echo "- **Total Word Count**: ~$total_words words"
    fi
    echo "- **Generated**: $(date '+%Y-%m-%d %H:%M:%S')"
    echo "- **Source Directory**: $INPUT_DIR"
    echo
} >> "$OUTPUT_FILE"

# Report completion
actual_words=$(count_words "$OUTPUT_FILE")
echo
echo -e "${GREEN}✅ Concatenation complete!${NC}"
echo -e "${GREEN}📄 Output saved to: $OUTPUT_FILE${NC}"
echo -e "${GREEN}📊 Files processed: ${#markdown_files[@]}${NC}"
echo -e "${GREEN}📝 Total words: ~$actual_words${NC}"
echo -e "${GREEN}📁 Source: $INPUT_DIR${NC}"

# Cross-references note
echo
echo -e "${BLUE}📋 Cross-References:${NC}"
echo -e "${BLUE}   - Source directory: $INPUT_DIR${NC}"
echo -e "${BLUE}   - Output file: $OUTPUT_FILE${NC}"
echo -e "${BLUE}   - Processing script: ${0:A}${NC}"
