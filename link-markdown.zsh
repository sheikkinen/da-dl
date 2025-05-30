#!/bin/zsh

# Script to link markdown files with images and gruser JSON files
# This script processes a given markdown file, extracts relevant information,
# and creates a new markdown file with links to images and JSON files.
#
# Called by process_all_markdown.zsh
# Usage: ./link-markdown.zsh <filename>

# Function to extract details from gruser JSON file
extract_json_details() {
  local json_filepath="$1"
  local id
  local title_val
  local url_val

  # Clean the JSON content and pipe it directly to jq
  # Remove most control characters, keeping tab (\\011), newline (\\012), and ASCII printables (\\040-\\176)
  id=$(cat "${gruser_json_filepath}" | tr -dc '\011\012\040-\176' | jq -r '.deviation.deviationId')
  title_val=$(cat "${gruser_json_filepath}" | tr -dc '\011\012\040-\176' | jq -r '.deviation.title')
  url_val=$(cat "${gruser_json_filepath}" | tr -dc '\011\012\040-\176' | jq -r '.deviation.url')

  echo "$id"
  echo "$title_val"
  echo "$url_val"
}

if [[ $# -eq 0 ]]; then
  echo "Usage: $0 <filename>"
  echo "Example: $0 description-classified/markdown/gruser_1100135297.md"
  exit 1
fi

filepath="$1"
dest_dir="results-markdown"
img_dir="results-img" # Directory containing the images
gruser_json_dir="results-gruser" # Directory containing the gruser JSON files

# Create destination directory if it doesn't exist
mkdir -p "$dest_dir"

# Extract the base name of the file (e.g., gruser_1100135297.md)
base_filename="${filepath##*/}"

# Remove the prefix "gruser_" to get the new filename (e.g., 1100135297.md)
new_filename="${base_filename#gruser_}"

# Remove the suffix ".md" from the new filename to get the id (e.g., 1100135297)
id="${new_filename%.md}"

# Check if extraction was successful (basic check if id is not empty and new_filename is different from base_filename)
if [[ -z "$id" || "$new_filename" == "$base_filename" ]]; then
  echo "Error: Could not extract ID or remove prefix from filename: $filepath"
  echo "Ensure the filename is in the format 'gruser_NUMBER.md' or 'path/to/gruser_NUMBER.md'"
  exit 1
fi

SIMILARITY_SCRIPT="./image-similarity-checker.mjs"

dest_filepath="${dest_dir}/${new_filename}"
complete_files="${dest_dir}/complete_files.txt" # File to keep track of processed files

rm -f "$dest_filepath" # Remove the destination file if it exists

# Collect information for the Markdown file
# Construct the Markdown image link
image_filename="${id}.jpg"
# Relative path from the markdown file in dest_dir to the image in img_dir
relative_image_path="../${img_dir}/${image_filename}"
markdown_image_link="\n\n![Image for ${id}](${relative_image_path})" # Using double backslash for to ensure literal in the variable, then echo -e handles it.

# Construct the Markdown link for the gruser JSON file
gruser_json_filename="gruser_${id}.json"
gruser_json_filepath="${gruser_json_dir}/${gruser_json_filename}" # Full path to the gruser JSON file
relative_gruser_json_path="../${gruser_json_dir}/${gruser_json_filename}"
markdown_gruser_json_link="\n\n[Gruser JSON for ${id}](${relative_gruser_json_path})"

# Construct the path to llava file
llava_filepath="results-img-llava/${id}.txt"

# Contents of the gruser JSON file
{ read deviation_id; read title; read url; } < <(extract_json_details "${gruser_json_filepath}")
details_markdown="## ${title}\n\n[${url}](${url})\n\n"

# Check matching image files from /Volumes/Backup-2021/deviant-working/deployed-*
# Use ${title} to find the image files (png, jpg, webp). Query may return multiple files.
# matching_source_files=($(find ./deviant-art-assets/deployed-* -type f \( -name "${title}.png" -o -name "${title}.jpg" \) | awk '{gsub(" ", "%20"); printf("\n![Source Image](../%s)\n", $0);}' ))

# Filter for perceptually similar images
filtered_source_links=()

find ./deviant-art-assets/deployed-* -type f \( -name "${title}.png" -o -name "${title}.jpg" \) -print0 |
while IFS= read -r -d '' candidate_path; do
  echo "🔎 Checking: $img_dir/$image_filename - $candidate_path"
  if node "$SIMILARITY_SCRIPT" "$img_dir/$image_filename" "$candidate_path" > /dev/null; then
    encoded_path=$(echo "$candidate_path" | sed 's/ /%20/g')
    filtered_source_links+=("\n![${title}](../${encoded_path})")
    echo "✅ Match found: $candidate_path"

    # Clear the original image link variable
    markdown_image_link="" # Not needed, we are appending to filtered_source_links  

    echo "${dest_filepath}" >> "${complete_files}" 
    echo "Adding to complete files: $dest_filepath --> $complete_files"
  else
    echo "❌ Not a match: $candidate_path"
  fi
done

# Construct the Output file
echo -e "${details_markdown}" >> "${dest_filepath}"           # Append the details from JSON to the destination file
cat "$filepath" >> "$dest_filepath"                           # Concatenate the source file to the new destination
# echo -e "${markdown_gruser_json_link}" >> "${dest_filepath}"  # Append the Markdown gruser JSON link to the destination file
echo -e "${markdown_image_link}" >> "${dest_filepath}"        # Append the Markdown image link to the destination file
# echo -e "${matching_source_files}" >> "${dest_filepath}"      # Append the source image links to the destination file  
echo -e "${filtered_source_links}" >> "$dest_filepath"

echo -e "\n### Image Description (llava-13b)\n" >> "${dest_filepath}"                 # Add a newline at the end of the file
grep -v '^Prompt' "${llava_filepath}" >> "${dest_filepath}"   # Append the contents of the llava file to the destination file

echo "Processed: $id --> $dest_filepath"
