#!/bin/zsh
# AI Friendly Summary: This script concatenates all Markdown (.md) files in the current directory into a single output file.

# Output file name
OUTPUT_FILE="combined_output.md"

# Check if output file already exists and remove it to avoid appending to old content
if [ -f "$OUTPUT_FILE" ]; then
  rm "$OUTPUT_FILE"
fi

# Find all .md files in the current directory and concatenate them
# Uses a loop to handle filenames with spaces correctly.
find . -maxdepth 1 -type f -name "*.md" -print0 | while IFS= read -r -d $'\0' file; do
  # Skip the output file itself if it happens to be a .md file
  if [ "$file" != "./$OUTPUT_FILE" ]; then
    echo "Processing file: $file"
    cat "$file" >> "$OUTPUT_FILE"
    echo "\n" >> "$OUTPUT_FILE" # Add a newline between concatenated files
  fi
done

echo "Concatenation complete. Output saved to $OUTPUT_FILE"
