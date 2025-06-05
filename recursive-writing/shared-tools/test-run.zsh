#!/bin/zsh
# test-run.zsh: Automated test for recursive-writing agentic workflow

set -e

# Remove existing TestNovel story if present
rm -rf ../TestNovel

# Initialize new TestNovel story
../shared-tools/init-story.zsh TestNovel "A. I. Author" "Speculative Fiction" "A test story for agentic tooling."

# Run keyword search tool (should log to TestNovel log)
echo "\n--- Running keyword_search.mjs ---"
node ../shared-tools/keyword_search.mjs mermaid

# Run random inspiration picker (should log to TestNovel log)
echo "\n--- Running random_inspiration_picker.mjs ---"
node ../shared-tools/random_inspiration_picker.mjs

# Run theme/category explorer (should log to TestNovel log)
echo "\n--- Running theme_category_explorer.mjs ---"
node ../shared-tools/theme_category_explorer.mjs

# Test add_timeline_entry.mjs
TIMELINE_FILE="../TestNovel/timeline-template.md"
echo "\n--- Running add_timeline_entry.mjs ---"
node ../shared-tools/add_timeline_entry.mjs "$TIMELINE_FILE" "2025-06-05" "Test Event" "TestTheme" "Test event description" "test/ref"
echo "\n--- Timeline after adding entry ---"
grep -A 5 "Test Event" "$TIMELINE_FILE"

# Test copy_template.mjs
CHAR_DIR="../TestNovel/characters"
echo "\n--- Running copy_template.mjs (character, with date) ---"
node ../shared-tools/copy_template.mjs character "$CHAR_DIR" TestCharacter "2025-06-05"
echo "\n--- Characters directory after copy ---"
ls -l "$CHAR_DIR"
echo "\n--- Timeline after copying character template ---"
grep -A 5 "Created character: TestCharacter" "$TIMELINE_FILE"

# Tail the TestNovel log to show last 20 lines
LOGFILE="../TestNovel/logs/TestNovel.log"
echo "\n--- Last 20 lines of $LOGFILE ---"
tail -n 20 "$LOGFILE"
