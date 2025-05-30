#!/bin/bash

# Script to process images in results-img using describe-replicate.mjs
# and save the output to a model-specific directory.

# Check if model argument is provided
if [ -z "$1" ]; then
  echo "Usage: $0 <model_name>"
  echo "model_name can be 'moondream' or 'llava'"
  exit 1
fi

MODEL_NAME="$1"

# Validate model name
if [ "$MODEL_NAME" != "moondream" ] && [ "$MODEL_NAME" != "llava" ]; then
  echo "Error: Invalid model name. Choose 'moondream' or 'llava'."
  exit 1
fi

# Define source and target directories
SOURCE_DIR="results-img"
TARGET_DIR="results-img-${MODEL_NAME}" # Dynamic target directory
SCRIPT_TO_RUN="describe-replicate.mjs" # Assuming .mjs is in the same directory or in PATH
BATCH_SIZE=5 # Number of images to process in parallel

# Create the target directory if it doesn't exist
mkdir -p "$TARGET_DIR"

# Check if the source directory exists
if [ ! -d "$SOURCE_DIR" ]; then
  echo "Error: Source directory '$SOURCE_DIR' not found."
  exit 1
fi

# Check if the script to run exists
if [ ! -f "$SCRIPT_TO_RUN" ]; then
  echo "Error: Script '$SCRIPT_TO_RUN' not found."
  exit 1
fi

echo "Starting image processing in batches of $BATCH_SIZE using $MODEL_NAME model..."

# Find all image files (adjust pattern if needed for specific image types)
find "$SOURCE_DIR" -type f \( -iname \*.jpg -o -iname \*.jpeg -o -iname \*.png -o -iname \*.webp \) | {
  count=0
  while IFS= read -r img_file_path; do
    filename=$(basename -- "$img_file_path")
    name_no_ext="${filename%.*}"
    output_file="$TARGET_DIR/$name_no_ext.txt"

    echo "Processing '$img_file_path' -> '$output_file' using $MODEL_NAME model"

    # Run the node script in the background, passing the model name
    node "$SCRIPT_TO_RUN" "$img_file_path" "$MODEL_NAME" > "$output_file" 2>> "$TARGET_DIR/error.log" &
    
    ((count++))
    if [ $((count % BATCH_SIZE)) -eq 0 ]; then
      echo "Waiting for batch to complete..."
      wait
      echo "Batch complete. Starting next batch."
    fi
  done

  # Wait for any remaining background jobs from the last batch
  if [ $((count % BATCH_SIZE)) -ne 0 ]; then
    echo "Waiting for the final batch to complete..."
    wait
  fi
}

echo "Image processing finished."
echo "Output files are in '$TARGET_DIR'"
echo "Check '$TARGET_DIR/error.log' for any errors during processing."
