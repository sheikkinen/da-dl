#!/bin/zsh
# init-story.zsh: Initialize a new book/story project structure

set -e

if [[ $# -lt 1 ]]; then
  echo "Usage: $0 <story-name> [author] [genre] [description]"
  exit 1
fi

STORY_NAME="$1"
AUTHOR="$2"
GENRE="$3"
DESCRIPTION="$4"

BASE_DIR="$(dirname $0)/.."
TEMPLATE_DIR="$BASE_DIR/../story-template"
SHARED_ARTIFACTS="$BASE_DIR/shared-artifacts"
STORY_DIR="$BASE_DIR/$STORY_NAME"
LOG_DIR="$STORY_DIR/logs"
ACTIVE_STORY_FILE="$BASE_DIR/active-story"

if [[ -d "$STORY_DIR" ]]; then
  echo "Error: Story directory '$STORY_DIR' already exists. Aborting."
  exit 1
fi

# Create main story directory and subdirectories
mkdir -p "$STORY_DIR"
for sub in characters locations plots scenes artifacts universe-bible-updates status-logs; do
  mkdir -p "$STORY_DIR/$sub"
done
mkdir -p "$LOG_DIR"

# Do NOT copy shared templates. Instead, add references to README.md
cat > "$STORY_DIR/README.md" <<EOF
# $STORY_NAME

**Author:** ${AUTHOR:-""}
**Genre:** ${GENRE:-""}
**Description:** ${DESCRIPTION:-""}

This is the project directory for the story "$STORY_NAME".

## Shared Templates
- [Character template](../shared-artifacts/character-template.md)
- [Scene template](../shared-artifacts/scene-template.md)
- [Plot template](../shared-artifacts/plot-template.md)
- [Artifact template](../shared-artifacts/artifact-template.md)
EOF

# Create story-action-plan.md by prepending metadata and then appending the template
{
  echo "# Story Action Plan: $STORY_NAME"
  echo ""
  echo "- Author: ${AUTHOR:-""}"
  echo "- Genre: ${GENRE:-""}"
  echo "- Description: ${DESCRIPTION:-""}"
  echo ""
  cat "$BASE_DIR/story-action-plan.md"
} > "$STORY_DIR/story-action-plan.md"

# Register in central index (optional, append to a central file)
echo "$STORY_NAME,${AUTHOR:-""},${GENRE:-""},$(date)" >> "$BASE_DIR/story-index.csv"

# Write first entry in log
echo "[$(date)] Story '$STORY_NAME' initialized by $USER" > "$LOG_DIR/$STORY_NAME.log"

# Set active-story file
echo "$STORY_NAME" > "$ACTIVE_STORY_FILE"

# Log active story set
echo "[$(date)] Set active story to '$STORY_NAME' by $USER" >> "$LOG_DIR/$STORY_NAME.log"

# Add timeline template and diagram to story directory
cp "$SHARED_ARTIFACTS/timeline-template.md" "$STORY_DIR/timeline-template.md"

# Optionally log the copying action
if [[ -d "$LOG_DIR" ]]; then
  echo "[$(date)] Copied timeline-template.md to story directory" >> "$LOG_DIR/$STORY_NAME.log"
fi

echo "Story '$STORY_NAME' initialized at $STORY_DIR. Active story set."
