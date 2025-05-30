# DeviantArt Data Processing and Analysis Scripts

This project consists of a collection of scripts designed to download, process, classify, and analyze data from DeviantArt. The scripts handle tasks such as fetching deviation information, downloading images, extracting and classifying descriptions, generating image descriptions using AI models, and linking related data.

## Core Functionality

The scripts are organized around a workflow that involves several stages:

1.  **Data Acquisition:**
    *   `dl_gruser.sh`: Downloads detailed information (Gruser JSON) for a specific DeviantArt deviation ID.
    *   `download_by_deviationid.sh`: Reads a list of deviation IDs from `image_entries.jsonl`, then uses `dl_gruser.sh` to fetch their data and `build-image-url.mjs` to construct and download the associated images into the `results-img` directory.

2.  **Description Extraction and Preparation:**
    *   `extract_tiptap_html.sh`: Extracts HTML markup from the downloaded Gruser JSON files (specifically from the `deviation.extended.descriptionText.html.markup` field) and saves it into the `results-tiptap` directory.
    *   `tiptap_json_to_html.mjs`: Converts TipTap JSON content (which can be the output of `extract_tiptap_html.sh` if the original markup was JSON) into HTML format. This is used by `classify_all_tiptap.sh` for further processing.

3.  **Description Classification and Conversion:**
    *   `classifier.sh`: Classifies a given file based on its initial characters, determining if it's HTML, JSON, plain text, or a page structure.
    *   `classify_all_tiptap.sh`: Iterates through files in `results-tiptap`, uses `classifier.sh` to determine their type, and copies them into subdirectories (html, json, text, page) within `description-classified`.
        *   For HTML and page files, it uses `pandoc` to convert them to Markdown, saving the results in `description-classified/markdown`.
        *   For JSON files (assumed to be TipTap format), it uses `tiptap_json_to_html.mjs` to convert them to intermediate HTML, then `pandoc` to convert that HTML to Markdown, also saved in `description-classified/markdown`.

4.  **AI-Powered Description and Analysis:**
    *   `process_file.sh`: Takes a prompt template and an input file, sends them to an LM Studio instance (configurable URL and model) to generate a description or other text, and saves the result as a Markdown file in a specified output directory.
    *   `process_all_tiptap_descriptions.sh`: A batch script that uses `process_file.sh` to process all files in `results-tiptap` (likely after they've been converted or classified) using a prompt from `prompt_template_extract_description.txt` and outputs results to `results-description`.
    *   `describe-replicate.mjs`: Takes an image file path and an optional model name ('moondream' or 'llava'), sends the image to the Replicate API, and outputs a textual description (including Booru tags and a generation prompt suggestion). The output is cleaned before printing.
    *   `process_images_batch.sh`: Processes images from `results-img` in batches using `describe-replicate.mjs`. It supports 'moondream' and 'llava' models and saves the text outputs into model-specific directories (`results-img-moondream` or `results-img-llava`).

5.  **Image and Data Linking:**
    *   `build-image-url.mjs`: Constructs a full image URL for a deviation given its Gruser JSON file. It decodes a JWT token within the JSON to get the image path and combines it with other media details.
    *   `link-markdown.zsh`: Processes a Markdown file (typically from `description-classified/markdown`). It extracts the deviation ID, finds the corresponding Gruser JSON and image, and creates a new Markdown file in `results-markdown`. This new file includes:
        *   Title and URL from the Gruser JSON.
        *   The original Markdown content.
        *   A link to the Gruser JSON file.
        *   An image link (potentially replaced by perceptually similar source images).
        *   Image description from the corresponding Llava output file (`results-img-llava/${id}.txt`).
    *   `process_all_markdown.zsh`: Iterates through Markdown files in `description-classified/markdown` (specifically those named `gruser_*.md`) and runs `link-markdown.zsh` on each.
    *   `image-similarity-checker.mjs`: Compares two image files using perceptual hashing (image-hash library) and determines if they are similar based on Hamming distance. Used by `link-markdown.zsh` to find matching source images.

6.  **Image Metadata Extraction:**
    *   `identify-batch.zsh`: Loops through images in a specified source directory and runs ImageMagick's `identify -verbose` command on each, saving the output to `results-identify`.
    *   `run-id-batch.zsh`: A simple script that calls `identify-batch.zsh` for multiple `deviant-art-assets/deployed-*` directories.
    *   `process_markdown_images.sh`: Processes Markdown files listed in `results-markdown/complete_files.txt`. For each PNG image link found in a Markdown file, it resolves the image path, runs `identify -verbose` on it (filtering output using `identify-mask.txt`), attempts to parse a JSON prompt from the output, and saves the (potentially JSON) metadata to a corresponding file in `results-identify`.

## Directory Structure Overview

*   `all_entries.jsonl`: Likely a primary list of DeviantArt entries.
*   `image_entries.jsonl`: A subset of `all_entries.jsonl`, specifically for entries that are images, used by `download_by_deviationid.sh`.
*   `deviant-art-assets/`: Contains subdirectories with deployed assets, likely original image files.
*   `description-classified/`: Stores classified descriptions.
    *   `html/`, `json/`, `text/`, `page/`: Subdirectories for different raw description formats.
    *   `intermediate_html/`: Temporary HTML files during TipTap JSON to Markdown conversion.
    *   `markdown/`: Markdown versions of descriptions.
*   `results-description/`: Output from `process_all_tiptap_descriptions.sh`, containing AI-generated descriptions based on TipTap content.
*   `results-gruser/`: Stores downloaded Gruser JSON files for each deviation.
*   `results-identify/`: Output from `identify-batch.zsh` and `process_markdown_images.sh`, containing ImageMagick `identify` verbose output for images.
*   `results-img/`: Downloaded images corresponding to deviation IDs.
*   `results-img-llava/`: Textual image descriptions generated by the Llava model via `process_images_batch.sh`.
*   `results-img-moondream/`: Textual image descriptions generated by the Moondream model via `process_images_batch.sh`.
*   `results-markdown/`: Final linked Markdown files created by `link-markdown.zsh`.
    *   `complete_files.txt`: A list of Markdown files that have been processed by `link-markdown.zsh` and are ready for further steps like `process_markdown_images.sh`.
*   `results-tiptap/`: Extracted HTML/JSON content from Gruser JSON, intended for description processing.
*   `backups/`: Contains backups of important files and results.

## Key Files and Configuration

*   `package.json`: Defines Node.js project dependencies (e.g., `jwt-decode`, `@tiptap/core`, `replicate`, `image-hash`).
*   `prompt_template_extract_description.txt`: Used by `process_all_tiptap_descriptions.sh` and `process_file.sh` as a template for generating descriptions with an AI model.
*   `identify-mask.txt`: Used by `process_markdown_images.sh` to filter out unwanted lines from `identify -verbose` output.
*   `.env`: (Implied by `describe-replicate.mjs` which uses `dotenv`) Should contain `REPLICATE_API_TOKEN`.
*   LM Studio configuration (URL, model name) is hardcoded in `process_file.sh`.
*   DeviantArt credentials (username, CSRF token) and cookie data are hardcoded in `dl_gruser.sh`. **These should be handled securely and not committed to version control.**

## Workflow Example

1.  Populate `image_entries.jsonl` with deviation IDs.
2.  Run `download_by_deviationid.sh` to get Gruser JSON and images.
3.  Run `extract_tiptap_html.sh` to get raw descriptions.
4.  Run `classify_all_tiptap.sh` to classify and convert descriptions to Markdown.
5.  (Optional) Run `process_all_tiptap_descriptions.sh` to generate AI descriptions from TipTap content.
6.  Run `process_images_batch.sh llava` (and/or `moondream`) to generate AI descriptions for images.
7.  Run `process_all_markdown.zsh` to link Markdown descriptions with images, Gruser JSON, and Llava descriptions.
8.  Run `process_markdown_images.sh` to extract metadata from linked PNGs.
9.  (Optional) Run `run-id-batch.zsh` to gather metadata for asset images.

This overview should provide a good starting point for understanding the project.
