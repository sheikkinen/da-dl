#!/bin/bash

# Script to classify all files in the results-tiptap directory

# Check if classifier.sh exists and is executable
CLASSIFIER_SCRIPT="./classifier.sh" # Assuming classifier.sh is in the same directory
if [ ! -f "$CLASSIFIER_SCRIPT" ]; then
    echo "Error: Classifier script '$CLASSIFIER_SCRIPT' not found."
    exit 1
fi
if [ ! -x "$CLASSIFIER_SCRIPT" ]; then
    echo "Error: Classifier script '$CLASSIFIER_SCRIPT' is not executable. Please run 'chmod +x $CLASSIFIER_SCRIPT'."
    exit 1
fi

INPUT_DIR="results-tiptap"
TARGET_DIR="description-classified"

if [ ! -d "$INPUT_DIR" ]; then
  echo "Error: Input directory '$INPUT_DIR' not found."
  exit 1
fi

echo "Classifying files in $INPUT_DIR:"
echo "------------------------------------"

# Find all files in the input directory (not subdirectories)
find "$INPUT_DIR" -maxdepth 1 -type f -print0 | while IFS= read -r -d $'\0' file; do
  # Run the classifier script and capture its output
  classification_output=$("$CLASSIFIER_SCRIPT" "$file")
  
  # If the classifier script produced any output (meaning it's an "unknown" classification),
  # then process the file.
  if [ -n "$classification_output" ]; then
    # Create the destination directory for the classification if it doesn't exist
    mkdir -p "$TARGET_DIR/$classification_output/"
    # Copy the file to the classification directory
    cp "$file" "$TARGET_DIR/$classification_output/"
    echo "Copied \\"$file\\" to \\"$TARGET_DIR/$classification_output/\\""
    
    classified_file_path="$TARGET_DIR/$classification_output/$(basename "$file")"
    markdown_output_dir="$TARGET_DIR/markdown"
    original_filename=$(basename "$file")
    filename_no_ext="${original_filename%.*}"
    markdown_output_file="$markdown_output_dir/$filename_no_ext.md"

    # If classification is html or page, convert to markdown
    if [ "$classification_output" = "html" ] || [ "$classification_output" = "page" ]; then
      mkdir -p "$markdown_output_dir"
      pandoc -f html -t markdown "$classified_file_path" -o "$markdown_output_file"
      if [ $? -eq 0 ]; then
        echo "Converted HTML \\"$classified_file_path\\" to Markdown: \\"$markdown_output_file\\""
      else
        echo "Error: Pandoc failed to convert HTML \\"$classified_file_path\\" to Markdown."
      fi

    elif [ "$classification_output" = "json" ]; then
      # This branch handles TipTap JSON to Markdown conversion
      tiptap_json_file_path="$classified_file_path" # Already copied to $TARGET_DIR/$classification_output/
      
      intermediate_html_dir="$TARGET_DIR/intermediate_html"
      mkdir -p "$intermediate_html_dir"
      intermediate_html_filename="${filename_no_ext}.html"
      intermediate_html_file_path="$intermediate_html_dir/$intermediate_html_filename"

      MJS_CONVERTER_SCRIPT="./tiptap_json_to_html.mjs"

      echo "Attempting TipTap JSON to Markdown conversion for: $tiptap_json_file_path"

      if [ ! -f "$MJS_CONVERTER_SCRIPT" ]; then
        echo "Error: TipTap JSON to HTML converter script not found: $MJS_CONVERTER_SCRIPT"
        echo "Skipping Markdown conversion for $tiptap_json_file_path"
      else
        echo "Converting TipTap JSON to HTML using $MJS_CONVERTER_SCRIPT..."
        # The MJS script takes input JSON path as arg1 and outputs HTML to stdout
        node "$MJS_CONVERTER_SCRIPT" "$tiptap_json_file_path" > "$intermediate_html_file_path"
        
        if [ $? -ne 0 ]; then
          echo "Error: MJS script failed to convert $tiptap_json_file_path to HTML."
          rm -f "$intermediate_html_file_path" # Clean up potentially empty/partial intermediate file
        elif [ ! -s "$intermediate_html_file_path" ]; then
          # Check if the intermediate HTML file was created and is not empty
          echo "Error: MJS script ($MJS_CONVERTER_SCRIPT) did not create a non-empty HTML file: $intermediate_html_file_path for input $tiptap_json_file_path"
          rm -f "$intermediate_html_file_path" # Clean up empty file
        else
          echo "Successfully converted TipTap JSON to HTML: $intermediate_html_file_path"
          
          mkdir -p "$markdown_output_dir"
          pandoc -f html -t markdown "$intermediate_html_file_path" -o "$markdown_output_file"
          
          if [ $? -eq 0 ]; then
            echo "Successfully converted intermediate HTML to Markdown: $markdown_output_file"
          else
            echo "Error: Pandoc failed to convert $intermediate_html_file_path to Markdown."
          fi
          
          rm -f "$intermediate_html_file_path"
          echo "Removed intermediate HTML file: $intermediate_html_file_path"
        fi
      fi
    fi
  fi
done

echo "Classification complete."
