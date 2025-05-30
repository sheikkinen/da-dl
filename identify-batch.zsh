#!/bin/zsh

# Script to loop through all images in given directory
# and run identify -verbose on each image.
# This script processes images in batches and saves the output to a results-identify.
# Usage: ./identify-batch.zsh <source_directory>

if [[ $# -eq 0 ]]; then
  echo "Usage: $0 <source_directory>"
  echo "Example: $0 results-img"
  exit 1
fi
source_dir="$1"
dest_dir="results-identify"
# Create destination directory if it doesn't exist
mkdir -p "$dest_dir"
# Check if the source directory exists
if [[ ! -d "$source_dir" ]]; then
  echo "Error: Source directory '$source_dir' not found."
  exit 1
fi
# Find all image files in the source directory
find "$source_dir" -type f \( -iname \*.png \) | {
  while IFS= read -r img_file_path; do
    filename=$(basename -- "$img_file_path")
    name_no_ext="${filename%.*}"
    output_file="$dest_dir/$name_no_ext.txt"

    echo "Processing '$img_file_path' -> '$output_file'"

    # Run identify command and save output to the destination file
    identify -verbose "$img_file_path" > "$output_file" 2>> "$dest_dir/error.log" 
  done
}

echo "All images processed. Results saved in '$dest_dir'."
