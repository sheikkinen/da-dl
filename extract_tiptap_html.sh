#!/bin/bash

# Create results-tiptap directory if it doesn't exist
mkdir -p results-tiptap

echo "Extracting HTML markup from JSON files in results-gruser..."

# Iterate over all JSON files in results-gruser
for file in results-gruser/gruser_*.json; do
    BASENAME=$(basename "$file" .json)
    # Extract the HTML markup using jq and save to new file, redirect errors
    jq -r '.deviation.extended.descriptionText.html.markup' "$file" > "results-tiptap/${BASENAME}.json" 2> "results-tiptap/${BASENAME}.error"
done
