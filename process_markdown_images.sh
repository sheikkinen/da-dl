#!/bin/bash

# Ensure the output directory exists
mkdir -p results-identify

# Check if the input file list exists
if [ ! -f "results-markdown/complete_files.txt" ]; then
    echo "Error: results-markdown/complete_files.txt not found."
    echo "Please create results-markdown/complete_files.txt with a list of markdown files to process, one path per line."
    exit 1
fi

# Process each markdown file listed in complete_files.txt
while IFS= read -r markdown_file_path || [[ -n "$markdown_file_path" ]]; do
    if [ -z "$markdown_file_path" ]; then
        continue # Skip empty lines
    fi

    echo "Processing Markdown file: $markdown_file_path"

    # Determine the directory of the current markdown file to resolve relative image paths
    markdown_dir=$(dirname "$markdown_file_path")
    if [ "$markdown_dir" == "." ]; then # If dirname is '.', use current directory explicitly for python script
        markdown_dir=$(pwd)
    elif [[ ! "$markdown_dir" = /* ]]; then # If dirname is relative, make it absolute for python script
        markdown_dir="$(pwd)/$markdown_dir"
    fi


    # Determine the base name for the output file
    base_filename=$(basename "$markdown_file_path" .md)
    output_file="results-identify/${base_filename}.txt"

    # Clear/create the output file for the current markdown file
    # All identify results for this markdown file will be collected here
    > "$output_file"

    # Find all PNG image links in the markdown file
    # The grep pattern extracts the relative path from ![alt text](path/to/image.png)
    grep -Eo '!\[[^]]*]\(([^)]+\.png)\)' "$markdown_file_path" | while IFS= read -r markdown_image_tag; do
        # Extract the relative image path from the markdown tag
        relative_image_path=$(echo "$markdown_image_tag" | sed -E 's/!\[[^]]*]\(([^)]+\.png)\)/\1/')

        # Resolve the potentially relative image path to an actual file path
        # Uses python for robust path normalization (handles ../, ./ etc.)
        resolved_image_path=$(python3 -c "import os, sys; print(os.path.normpath(os.path.join(sys.argv[1], sys.argv[2])))" "$markdown_dir" "$relative_image_path")

        # URL decode the path (e.g., %20 to space)
        # Uses python for robust URL decoding
        decoded_image_path=$(python3 -c "import urllib.parse, sys; print(urllib.parse.unquote(sys.argv[1]))" "$resolved_image_path")

        echo "  Found PNG link: $relative_image_path"
        echo "  Resolved and decoded path: $decoded_image_path"

        if [ -f "$decoded_image_path" ]; then
            echo "    Running identify -verbose on \"$decoded_image_path\"..."
            # Old line: identify -verbose "$decoded_image_path" | grep -v -f "identify-mask.txt" >> "$output_file"
            
            # Capture the filtered output
            filtered_identify_output=$(identify -verbose "$decoded_image_path" | grep -v -f "identify-mask.txt")

            # Define the prefix to match and the part to remove for JSON extraction
            prefix_to_match="    prompt: {"
            string_to_remove_for_json="    prompt: " # Part of prefix_to_match, up to the opening brace

            # Check if the output starts with the specific prefix
            if [[ "$filtered_identify_output" == "${prefix_to_match}"* ]]; then
                # Extract the potential JSON payload by removing "    prompt: "
                json_payload="${filtered_identify_output#${string_to_remove_for_json}}"

                # Try to process with jq
                if processed_payload=$(echo "$json_payload" | jq '.' 2>/dev/null); then
                    # If jq succeeds, use its formatted JSON output
                    echo "$processed_payload" >> "$output_file"
                else
                    # If jq fails (e.g., not valid JSON), save the original filtered output
                    echo "$filtered_identify_output" >> "$output_file"
                fi
            else
                # If it doesn't start with the prefix, save the original filtered output
                echo "$filtered_identify_output" >> "$output_file"
            fi
            echo "    Done."
        else
            echo "    Error: Image file not found at \"$decoded_image_path\""
            echo "Error: Image file not found at \"$decoded_image_path\" (source: $markdown_file_path, relative link: $relative_image_path)" >> "$output_file"
        fi
    done

    echo "Results for $markdown_file_path saved to $output_file"
    echo "" # Add a blank line for better readability of script output
done < <(shuf results-markdown/complete_files.txt)

echo "Image processing script finished."
echo "Output is in the 'results-identify' directory."
