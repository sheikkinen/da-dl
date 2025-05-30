#!/bin/zsh

# Script to process all markdown files in a directory

# Directory containing the markdown files
markdown_dir="description-classified/markdown"

# Check if the markdown directory exists
if [[ ! -d "$markdown_dir" ]]; then
  echo "Error: Directory not found: $markdown_dir"
  exit 1
fi

rm -f results-markdown/complete_files.txt

# Loop through all .md files in the markdown directory
for filepath in "$markdown_dir"/gruser_*.md; do
  if [[ -f "$filepath" ]]; then
    echo "Processing $filepath..."
    # Call the link-markdown.zsh script for each file
    ./link-markdown.zsh "$filepath"
  else
    echo "Warning: No matching files found for pattern $markdown_dir/gruser_*.md"
    # Exit if no files are found to avoid running with an empty set if that's unintended
    exit 1 
  fi
done

echo "All markdown files processed."
