#!/bin/zsh

# Script to link markdown files with identify results
# Takes linked markdown files from results-markdown and identify results from results-identify
# and combines them into markdown files with identify info in preformatted code blocks
# Output goes to results-mark-id folder
#
# Usage: ./link-identify.zsh

# Directories
markdown_dir="results-markdown"
identify_dir="results-identify"
dest_dir="results-mark-id"

# Create destination directory if it doesn't exist
mkdir -p "$dest_dir"

# Check if source directories exist
if [[ ! -d "$markdown_dir" ]]; then
  echo "Error: Markdown directory '$markdown_dir' not found."
  exit 1
fi

if [[ ! -d "$identify_dir" ]]; then
  echo "Error: Identify directory '$identify_dir' not found."
  exit 1
fi

# Process counter
processed=0
total=0

# Count total files to process
total=$(find "$markdown_dir" -name "*.md" | wc -l | tr -d ' ')
echo "Found $total markdown files to process"

# Process each markdown file
find "$markdown_dir" -name "*.md" | while read -r markdown_file; do
  # Extract the base filename (e.g., 1000051035)
  base_filename=$(basename "$markdown_file" .md)
  
  # Construct paths
  identify_file="${identify_dir}/${base_filename}.txt"
  output_file="${dest_dir}/${base_filename}.md"
  
  # Start with the original markdown content
  cp "$markdown_file" "$output_file"
  
  # Add identify information if available and has sufficient content
  if [[ -f "$identify_file" && -s "$identify_file" ]]; then
    # Check if file has at least 5 characters
    file_size=$(wc -c < "$identify_file" | tr -d ' ')
    if [[ $file_size -ge 5 ]]; then
      echo -e "\n### Generation Information\n" >> "$output_file"
      echo '```' >> "$output_file"
      cat "$identify_file" >> "$output_file"
      echo '```' >> "$output_file"
      echo "✅ Added identify info for $base_filename"
    else
      echo "⚠️  Identify file too short (${file_size} chars) for $base_filename"
    fi
  elif [[ -f "$identify_file" ]]; then
    echo "⚠️  Empty identify file for $base_filename"
  else
    echo "⚠️  No identify file found for $base_filename"
  fi
  
  ((processed++))
  echo "Progress: $processed/$total files processed"
done

echo "✅ All files processed. Results saved in '$dest_dir'."
echo "📊 Summary: $processed files processed out of $total total files."
