#!/bin/zsh

# Hearts at Two Seas - Complete Novel Concatenation Script
# Combines all 18 chapters into a single document with timeline

set -e  # Exit on any error

# Define paths
HEARTS_DIR="/Users/sami.j.p.heikkinen/Documents/src/summer-2025/da-dl/recursive-writing/hearts-at-two-seas"
NARRATIVE_DIR="$HEARTS_DIR/narrative"
OUTPUT_FILE="$HEARTS_DIR/hearts-at-two-seas-complete.md"
TIMELINE_FILE="$HEARTS_DIR/timeline.md"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}Hearts at Two Seas - Novel Concatenation${NC}"
echo -e "${BLUE}======================================${NC}"

# Check if narrative directory exists
if [[ ! -d "$NARRATIVE_DIR" ]]; then
    echo -e "${RED}Error: Narrative directory not found at $NARRATIVE_DIR${NC}"
    exit 1
fi

# Remove existing output file if it exists
if [[ -f "$OUTPUT_FILE" ]]; then
    echo -e "${YELLOW}Removing existing complete novel file...${NC}"
    rm "$OUTPUT_FILE"
fi

# Create header for the complete novel
echo -e "${GREEN}Creating novel header...${NC}"
cat > "$OUTPUT_FILE" << 'EOF'
# Hearts at Two Seas
## Kahden meren sydämet

**A Finnish-Spanish Romance Novel**

*Laura Virta, a Finnish widow seeking healing from grief, finds unexpected love with Diego Moreno, a Spanish lighthouse keeper, in the coastal town of San Pedro del Pinatar, Spain.*

---

**Novel Statistics:**
- **Language**: Finnish (with Spanish cultural integration)
- **Genre**: Contemporary Romance
- **Setting**: San Pedro del Pinatar, Spain (May-August 2025)
- **Chapters**: 18
- **Word Count**: Approximately 45,000 words
- **Structure**: Three-act romance with healing and cultural bridge themes

---

EOF

echo -e "${GREEN}Adding Act 1 chapters...${NC}"
echo "## ACT 1: SAAPUMINEN JA PARANTUMINEN" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

# Act 1 chapters (1-5)
for act_dir in "$NARRATIVE_DIR/act1"; do
    if [[ -d "$act_dir" ]]; then
        for chapter in "$act_dir"/Luku_*.md; do
            if [[ -f "$chapter" ]]; then
                chapter_name=$(basename "$chapter" .md)
                echo -e "${BLUE}  Adding $chapter_name...${NC}"
                echo "" >> "$OUTPUT_FILE"
                echo "---" >> "$OUTPUT_FILE"
                echo "" >> "$OUTPUT_FILE"
                # Remove the filepath comment and add the content
                sed '1,2d' "$chapter" >> "$OUTPUT_FILE"
                echo "" >> "$OUTPUT_FILE"
            fi
        done
    fi
done

echo -e "${GREEN}Adding Act 2A chapters...${NC}"
echo "" >> "$OUTPUT_FILE"
echo "## ACT 2A: AVAUTUMINEN JA YHTEYS" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

# Act 2A chapters (6-10)
for act_dir in "$NARRATIVE_DIR/act2a"; do
    if [[ -d "$act_dir" ]]; then
        for chapter in "$act_dir"/Luku_*.md; do
            if [[ -f "$chapter" ]]; then
                chapter_name=$(basename "$chapter" .md)
                echo -e "${BLUE}  Adding $chapter_name...${NC}"
                echo "" >> "$OUTPUT_FILE"
                echo "---" >> "$OUTPUT_FILE"
                echo "" >> "$OUTPUT_FILE"
                sed '1,2d' "$chapter" >> "$OUTPUT_FILE"
                echo "" >> "$OUTPUT_FILE"
            fi
        done
    fi
done

echo -e "${GREEN}Adding Act 2B chapters...${NC}"
echo "" >> "$OUTPUT_FILE"
echo "## ACT 2B: KRIISI JA KONFLIKTI" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

# Act 2B chapters (11-14)
for act_dir in "$NARRATIVE_DIR/act2b"; do
    if [[ -d "$act_dir" ]]; then
        for chapter in "$act_dir"/Luku_*.md; do
            if [[ -f "$chapter" ]]; then
                chapter_name=$(basename "$chapter" .md)
                echo -e "${BLUE}  Adding $chapter_name...${NC}"
                echo "" >> "$OUTPUT_FILE"
                echo "---" >> "$OUTPUT_FILE"
                echo "" >> "$OUTPUT_FILE"
                sed '1,2d' "$chapter" >> "$OUTPUT_FILE"
                echo "" >> "$OUTPUT_FILE"
            fi
        done
    fi
done

echo -e "${GREEN}Adding Act 3 chapters...${NC}"
echo "" >> "$OUTPUT_FILE"
echo "## ACT 3: RATKAISU JA INTEGRAATIO" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

# Act 3 chapters (15-18)
for act_dir in "$NARRATIVE_DIR/act3"; do
    if [[ -d "$act_dir" ]]; then
        for chapter in "$act_dir"/Luku_*.md; do
            if [[ -f "$chapter" ]]; then
                chapter_name=$(basename "$chapter" .md)
                echo -e "${BLUE}  Adding $chapter_name...${NC}"
                echo "" >> "$OUTPUT_FILE"
                echo "---" >> "$OUTPUT_FILE"
                echo "" >> "$OUTPUT_FILE"
                sed '1,2d' "$chapter" >> "$OUTPUT_FILE"
                echo "" >> "$OUTPUT_FILE"
            fi
        done
    fi
done

# Add timeline if it exists
if [[ -f "$TIMELINE_FILE" ]]; then
    echo -e "${GREEN}Adding timeline...${NC}"
    echo "" >> "$OUTPUT_FILE"
    echo "---" >> "$OUTPUT_FILE"
    echo "" >> "$OUTPUT_FILE"
    echo "## NOVEL TIMELINE" >> "$OUTPUT_FILE"
    echo "" >> "$OUTPUT_FILE"
    # Remove the first line (filepath comment) if it exists
    if head -1 "$TIMELINE_FILE" | grep -q "filepath:"; then
        sed '1d' "$TIMELINE_FILE" >> "$OUTPUT_FILE"
    else
        cat "$TIMELINE_FILE" >> "$OUTPUT_FILE"
    fi
else
    echo -e "${YELLOW}Warning: Timeline file not found at $TIMELINE_FILE${NC}"
fi

# Add completion footer
echo "" >> "$OUTPUT_FILE"
echo "---" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"
echo "**Novel Complete**" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"
echo "*Generated on $(date '+%B %d, %Y at %H:%M')*" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"
echo "**Hearts at Two Seas** - The complete story of Laura Virta's journey from grief to love in the Spanish coastal town of San Pedro del Pinatar." >> "$OUTPUT_FILE"

# Calculate approximate word count
word_count=$(wc -w < "$OUTPUT_FILE")
echo "" >> "$OUTPUT_FILE"
echo "**Final Word Count**: Approximately $word_count words" >> "$OUTPUT_FILE"

echo -e "${GREEN}✅ Novel concatenation complete!${NC}"
echo -e "${BLUE}Output file: $OUTPUT_FILE${NC}"
echo -e "${BLUE}Word count: ~$word_count words${NC}"

# Verify file was created successfully
if [[ -f "$OUTPUT_FILE" ]] && [[ -s "$OUTPUT_FILE" ]]; then
    file_size=$(du -h "$OUTPUT_FILE" | cut -f1)
    echo -e "${GREEN}✅ Success: Complete novel generated ($file_size)${NC}"
    echo -e "${YELLOW}📖 Ready for reading or publication!${NC}"
else
    echo -e "${RED}❌ Error: Failed to create complete novel file${NC}"
    exit 1
fi
