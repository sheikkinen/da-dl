#!/bin/zsh

# Script to process all gruser files to generate final markdown files
# This allows handling entries with empty descriptions that were skipped in earlier stages

# Directory containing the original gruser JSON files
gruser_dir="results-gruser"

# Check if the gruser directory exists
if [[ ! -d "$gruser_dir" ]]; then
  echo "Error: Directory not found: $gruser_dir"
  exit 1
fi

rm -f results-markdown/complete_files.txt

# Loop through all gruser JSON files
for gruser_filepath in "$gruser_dir"/gruser_*.json; do
  if [[ -f "$gruser_filepath" ]]; then
    # Extract the ID from the gruser file name
    base_filename="${gruser_filepath##*/}"
    id="${base_filename#gruser_}"
    id="${id%.json}"
    
    echo "Processing gruser file for ID: $id"
    
    # Check if corresponding markdown file exists in classified results
    classified_markdown="description-classified/markdown/gruser_${id}.md"
    
    # Call the link-markdown.zsh script with the gruser file and optional markdown
    ./link-markdown.zsh "$gruser_filepath" "$classified_markdown"
  else
    echo "Warning: No matching files found for pattern $gruser_dir/gruser_*.json"
    exit 1 
  fi
done

echo "All gruser files processed."
