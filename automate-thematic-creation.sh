#!/bin/zsh

# Thematic Story Compendium Creation Script
THEME_NAME=$1
TARGET_STORY_COUNT=${2:-6}

if [[ -z "$THEME_NAME" ]]; then
    echo "Usage: $0 <theme_name> [story_count]"
    echo "Available themes: infernal-realms, death-undeath, gothic-romance,"
    echo "                 fallen-angels, mystical-arcane, horror-macabre"
    exit 1
fi

echo "🚀 Starting thematic compendium creation for: $THEME_NAME"
echo "📊 Target story count: $TARGET_STORY_COUNT"

# Phase 1: Set up workspace
echo "📁 Creating workspace structure..."
mkdir -p "thematic-universes/${THEME_NAME}"
mkdir -p "thematic-universes/${THEME_NAME}/source-material"
mkdir -p "thematic-universes/${THEME_NAME}/character-profiles" 
mkdir -p "thematic-universes/${THEME_NAME}/story-seeds"
mkdir -p "compendiums/${THEME_NAME}"
mkdir -p "compendiums/${THEME_NAME}/stories"
mkdir -p "compendiums/${THEME_NAME}/development"

# Phase 2: Dataset analysis
echo "🔍 Analyzing dataset for theme: $THEME_NAME"
grep -i "$THEME_NAME" analysis/metadata_index.jsonl > "thematic-universes/${THEME_NAME}/theme_entries.jsonl"
ENTRY_COUNT=$(wc -l < "thematic-universes/${THEME_NAME}/theme_entries.jsonl")
echo "📊 Found $ENTRY_COUNT relevant dataset entries"

# Phase 3: Workspace preparation
echo "📝 Setting up development documents..."
touch "thematic-universes/${THEME_NAME}/universe-bible.md"
touch "thematic-universes/${THEME_NAME}/character-database.md"
touch "compendiums/${THEME_NAME}/compendium-blueprint.md"

# Phase 4: Visual asset preparation
echo "🎨 Preparing visual asset integration..."
mkdir -p "enhanced-compendiums/${THEME_NAME}"
mkdir -p "enhanced-compendiums/${THEME_NAME}/visual-assets"

# Phase 5: Quality assurance setup
echo "✅ Setting up quality assurance framework..."
mkdir -p "quality-assurance/${THEME_NAME}"
mkdir -p "publication-ready/${THEME_NAME}"

echo "✅ Automation setup complete for theme: $THEME_NAME"
echo "📊 Dataset entries identified: $ENTRY_COUNT"
echo "📝 Next steps: Run LLM universe development prompts"
echo "📁 Workspace: thematic-universes/${THEME_NAME}/"
echo "📖 Output target: compendiums/${THEME_NAME}/"
