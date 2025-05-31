#!/bin/zsh

# Script to link gruser files with images and create final markdown files
# This script processes a gruser JSON file, extracts relevant information,
# and creates a new markdown file with links to images and JSON files.
# Optionally includes classified description if available.
#
# Called by process_all_markdown.zsh
# Usage: ./link-markdown.zsh <gruser_filepath> [classified_markdown_filepath]

# Function to extract details from gruser JSON file
extract_json_details() {
  local json_filepath="$1"
  local id
  local title_val
  local url_val

  # Clean the JSON content and pipe it directly to jq
  # Remove most control characters, keeping tab (\\011), newline (\\012), and ASCII printables (\\040-\\176)
  id=$(cat "${json_filepath}" | tr -dc '\011\012\040-\176' | jq -r '.deviation.deviationId')
  title_val=$(cat "${json_filepath}" | tr -dc '\011\012\040-\176' | jq -r '.deviation.title')
  url_val=$(cat "${json_filepath}" | tr -dc '\011\012\040-\176' | jq -r '.deviation.url')

  echo "$id"
  echo "$title_val"
  echo "$url_val"
}

if [[ $# -eq 0 ]]; then
  echo "Usage: $0 <gruser_filepath> [classified_markdown_filepath]"
  echo "Example: $0 results-gruser/gruser_1100135297.json description-classified/markdown/gruser_1100135297.md"
  exit 1
fi

gruser_filepath="$1"
classified_markdown_filepath="$2"
dest_dir="results-markdown"
img_dir="results-img" # Directory containing the images

# Create destination directory if it doesn't exist
mkdir -p "$dest_dir"

# Extract the base name of the gruser file (e.g., gruser_1100135297.json)
base_filename="${gruser_filepath##*/}"

# Extract ID from gruser filename (e.g., 1100135297)
id="${base_filename#gruser_}"
id="${id%.json}"

# Check if extraction was successful
if [[ -z "$id" ]]; then
  echo "Error: Could not extract ID from gruser filename: $gruser_filepath"
  echo "Ensure the filename is in the format 'gruser_NUMBER.json'"
  exit 1
fi

SIMILARITY_SCRIPT="./image-similarity-checker.mjs"

# Output filename uses just the ID (fixing naming consistency)
new_filename="${id}.md"
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
relative_gruser_json_path="../results-gruser/${gruser_json_filename}"
markdown_gruser_json_link="\n\n[Gruser JSON for ${id}](${relative_gruser_json_path})"

# Construct the path to llava file
llava_filepath="results-img-llava/${id}.txt"

# Contents of the gruser JSON file
{ read deviation_id; read title; read url; } < <(extract_json_details "${gruser_filepath}")
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

# Add description content if classified markdown exists
if [[ -n "$classified_markdown_filepath" && -f "$classified_markdown_filepath" ]]; then
  echo -e "\n### Description\n" >> "${dest_filepath}"
  cat "$classified_markdown_filepath" >> "$dest_filepath"      # Concatenate the classified description
else
  echo -e "\n### Description\n" >> "${dest_filepath}"
  echo -e "*No description available or description was empty.*\n" >> "${dest_filepath}"
fi

# echo -e "${markdown_gruser_json_link}" >> "${dest_filepath}"  # Append the Markdown gruser JSON link to the destination file
echo -e "${markdown_image_link}" >> "${dest_filepath}"        # Append the Markdown image link to the destination file
# echo -e "${matching_source_files}" >> "${dest_filepath}"      # Append the source image links to the destination file  
echo -e "${filtered_source_links}" >> "$dest_filepath"

# Add llava description if available
if [[ -f "${llava_filepath}" ]]; then
  echo -e "\n### Image Description (llava-13b)\n" >> "${dest_filepath}"
  grep -v '^Prompt' "${llava_filepath}" >> "${dest_filepath}"   # Append the contents of the llava file
else
  echo -e "\n### Image Description (llava-13b)\n" >> "${dest_filepath}"
  echo -e "*Image description not available.*\n" >> "${dest_filepath}"
fi

echo "Processed: $id --> $dest_filepath"
