#!/bin/bash

# Configuration
PROMPT_TEMPLATE_FILE="prompt_template_extract_description.txt"
INPUT_FILES_DIR="results-tiptap"
OUTPUT_DIR="results-description"
PROCESS_SCRIPT="./process_file.sh"

# Ensure the output directory exists
mkdir -p "$OUTPUT_DIR"

# --- Sanity Checks ---
# Check if the main processing script exists and is executable
if [ ! -f "$PROCESS_SCRIPT" ]; then
  echo "Error: Processing script '$PROCESS_SCRIPT' not found."
  exit 1
fi
if [ ! -x "$PROCESS_SCRIPT" ]; then
  echo "Error: Processing script '$PROCESS_SCRIPT' is not executable. Please run: chmod +x $PROCESS_SCRIPT"
  exit 1
fi

# Check if the prompt template file exists
if [ ! -f "$PROMPT_TEMPLATE_FILE" ]; then
  echo "Error: Prompt template file '$PROMPT_TEMPLATE_FILE' not found in the current directory."
  exit 1
fi

# Check if the input directory exists
if [ ! -d "$INPUT_FILES_DIR" ]; then
  echo "Error: Input directory '$INPUT_FILES_DIR' not found relative to the current directory."
  exit 1
fi

echo "Starting batch processing of files in '$INPUT_FILES_DIR'..."
echo "Using prompt template: '$PROMPT_TEMPLATE_FILE'"
echo "Outputting to directory: '$OUTPUT_DIR'"
echo "---"

# Loop through all files in the input directory
processed_count=0
failed_count=0
for tiptap_file in "$INPUT_FILES_DIR"/*; do
  # Check if it is a regular file
  if [ -f "$tiptap_file" ]; then
    echo "Processing '$tiptap_file'..."
    
    # Execute the process_file.sh script
    # Arguments: <prompt_template_file> <input_file> <output_directory>
    "$PROCESS_SCRIPT" "$PROMPT_TEMPLATE_FILE" "$tiptap_file" "$OUTPUT_DIR"
    
    # Check the exit status of the last command
    if [ $? -eq 0 ]; then
      echo "Successfully processed '$tiptap_file'."
      processed_count=$((processed_count + 1))
    else
      echo "Warning: Processing '$tiptap_file' failed with exit code $?."
      failed_count=$((failed_count + 1))
    fi
    echo "---"
  fi
done

echo "Finished processing."
echo "Successfully processed files: $processed_count"
echo "Failed to process files: $failed_count"

if [ "$failed_count" -gt 0 ]; then
  exit 1
else
  exit 0
fi