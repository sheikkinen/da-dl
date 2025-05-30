#!/bin/bash

# Configuration
LM_STUDIO_URL="http://HUUTOKAUPPAKONE:1234"
# MODEL="llama-3-8b-lexi-uncensored"
MODEL="granite-3.2-8b-instruct"
TEMPERATURE=0.7

# Check command line arguments
if [ "$#" -ne 3 ]; then
    echo "Usage: $0 <prompt_template_file> <input_file> <output_directory>"
    exit 1
fi

PROMPT_TEMPLATE_FILE=$1
INPUT_FILE=$2
OUTPUT_DIR=$3
FILENAME=$(basename "$INPUT_FILE")

# Check if files exist
if [ ! -f "$PROMPT_TEMPLATE_FILE" ]; then
    echo "Error: Prompt template file not found: $PROMPT_TEMPLATE_FILE"
    exit 1
fi

if [ ! -f "$INPUT_FILE" ]; then
    echo "Error: Input file not found: $INPUT_FILE"
    exit 1
fi

# Check if jq is installed
if ! command -v jq &> /dev/null; then
    echo "Error: jq is not installed. Please install it first:"
    echo "For macOS: brew install jq"
    echo "For Ubuntu: sudo apt-get install jq"
    exit 1
fi

# Create output directory if it doesn't exist
mkdir -p "$OUTPUT_DIR"

# Create a working directory for intermediate files
WORK_DIR="$OUTPUT_DIR/work_files"
mkdir -p "$WORK_DIR"

# Read the prompt template and input file
PROMPT_TEMPLATE=$(cat "$PROMPT_TEMPLATE_FILE")
INPUT_CONTENT=$(cat "$INPUT_FILE")

# Concatenate prompt template and input content
COMBINED_CONTENT="$PROMPT_TEMPLATE\n\n$INPUT_CONTENT"

# Properly escape for JSON using jq
ESCAPED_CONTENT=$(echo "$COMBINED_CONTENT" | jq -Rs .)

# Remove surrounding quotes for embedding in JSON (jq -Rs . outputs a quoted string)
# ESCAPED_CONTENT_NO_QUOTES=${ESCAPED_CONTENT:1:-1}
# More robust way to remove first and last characters
_temp_escaped_content="${ESCAPED_CONTENT#?}"
ESCAPED_CONTENT_NO_QUOTES="${_temp_escaped_content%?}"

echo "Escaped content ready for JSON:"
echo "$ESCAPED_CONTENT_NO_QUOTES"

echo "Processing file: $INPUT_FILE"

# Create JSON payload
JSON_PAYLOAD=$(cat << EOF_JSON
{
  "model": "$MODEL",
  "messages": [
    { "role": "system", "content": "You are a helpful assistant." },
    { "role": "user", "content": "$ESCAPED_CONTENT_NO_QUOTES" }
  ],
  "temperature": $TEMPERATURE
}
EOF_JSON
)

# Save the JSON payload for reference
PAYLOAD_FILE="$WORK_DIR/${FILENAME}.payload.json"
echo "$JSON_PAYLOAD" > "$PAYLOAD_FILE"
echo "JSON payload saved to $PAYLOAD_FILE"

# Call API and save response
RAW_RESPONSE_JSON_FILE="$WORK_DIR/${FILENAME}.result.json"
FINAL_OUTPUT_FILE="$OUTPUT_DIR/${FILENAME%.*}.md" # Renamed for clarity, path is the same as old RESPONSE_FILE

curl -s -S --no-progress-meter "$LM_STUDIO_URL/v1/chat/completions" \
    -H "Content-Type: application/json" \
    -d "$JSON_PAYLOAD" > "$RAW_RESPONSE_JSON_FILE"

# Extract just the content from the response
if jq -e . "$RAW_RESPONSE_JSON_FILE" >/dev/null 2>&1; then
    jq -r '.choices[0].message.content' "$RAW_RESPONSE_JSON_FILE" > "$FINAL_OUTPUT_FILE"
    echo "Response saved to $FINAL_OUTPUT_FILE"
else
    echo "Error: Invalid JSON response in $RAW_RESPONSE_JSON_FILE"
fi

echo "Processing complete."
