# DeviantArt Data Processing and Analysis Scripts

This project consists of a collection of scripts designed to download, process, classify, and analyze data from DeviantArt. The scripts handle tasks such as fetching deviation information, downloading images, extracting and classifying descriptions, generating image descriptions using AI models, and linking related data.

## Core Functionality

The scripts are organized around a workflow that involves several stages:

1.  **Data Acquisition:**
    *   `dl_gruser.sh`: Downloads detailed information (Gruser JSON) for a specific DeviantArt deviation ID. **Requires valid DeviantArt session credentials** (username, CSRF token, and cookies) to be configured in the script.
    *   `download_by_deviationid.sh`: Reads a list of deviation IDs from `image_entries.jsonl`, then uses `dl_gruser.sh` to fetch their data and `build-image-url.mjs` to construct and download the associated images into the `results-img` directory. Includes rate limiting to respect DeviantArt's servers.

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
    *   `image-similarity-checker.mjs`: Compares two image files using perceptual hashing (image-hash library) and determines if they are similar based on Hamming distance. Used by `link-markdown.zsh` to find matching source images. **Features hash caching** to avoid recomputing hashes for the same files, storing cached results in `results-hash-cache/image-hashes.json`.

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
*   `results-hash-cache/`: Cache directory for image perceptual hashes computed by `image-similarity-checker.mjs`. Contains `image-hashes.json` with cached hash values to improve performance on repeated comparisons.
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

## Rerunning the Complete Pipeline

After recent fixes to the pipeline (specifically addressing TipTap extension issues and file naming inconsistencies), follow these steps to reprocess all data:

### Prerequisites
Ensure all dependencies are installed:
```bash
npm install
```

### Initial Data Download (If Starting Fresh)

If you need to download gruser data from DeviantArt, follow these steps:

#### 1. Prepare Your DeviantArt Credentials

**⚠️ Important Security Note:** The `dl_gruser.sh` script contains hardcoded DeviantArt credentials (username, CSRF token, and cookies). These credentials need to be updated with your own valid DeviantArt session data.

To obtain the required credentials:
1. Log into DeviantArt in your browser
2. Open browser developer tools (F12)
3. Navigate to a DeviantArt artwork page
4. Check the Network tab for API requests to `/_puppy/dadeviation/init`
5. Copy the following from the request headers:
   - `csrf_token` parameter from the URL
   - Cookie string from the `Cookie` header
   - Your DeviantArt username

Update these values in `dl_gruser.sh`:
```bash
USERNAME="your_username_here"
CSRF_TOKEN="your_csrf_token_here"
# Update the entire -b cookie string with your session cookies
```

#### 2. Prepare Input Data

Create or verify your `image_entries.jsonl` file. This file should contain one JSON object per line with DeviantArt deviation data. Each line must include at least a `deviationId` field:

```jsonl
{"deviationId":1046524267,"type":"image","url":"https://www.deviantart.com/username/art/title-1046524267","title":"Example Title"}
{"deviationId":1046514374,"type":"image","url":"https://www.deviantart.com/username/art/title-1046514374","title":"Another Example"}
```

If you have a list of deviation IDs, you can create a minimal file:
```bash
# Create minimal image_entries.jsonl from a list of IDs
echo '{"deviationId":1234567890}' > image_entries.jsonl
echo '{"deviationId":9876543210}' >> image_entries.jsonl
```

#### 3. Download Gruser Data and Images

**Manual Single Download:**
```bash
# Download gruser data for a specific deviation ID
./dl_gruser.sh <deviation_id> <current_id>
# Example:
./dl_gruser.sh 1046524267 1046524267
```

**Batch Download (Recommended):**
```bash
# Create necessary directories
mkdir -p results-gruser
mkdir -p results-img

# Download all entries from image_entries.jsonl
# This will download both gruser JSON files and images
./download_by_deviationid.sh
```

**What this downloads:**
- **Gruser JSON files** → `results-gruser/gruser_${deviation_id}.json` (detailed deviation metadata)
- **Image files** → `results-img/${deviation_id}.jpg` (actual artwork images)

#### 4. Rate Limiting and Considerations

The download script includes built-in rate limiting:
- Random delays between 1-20 seconds (using `zselect`)
- Respect DeviantArt's servers and terms of service
- Monitor for any error responses or blocks

If downloads fail:
- Check your credentials are still valid
- Verify your IP hasn't been rate-limited
- Ensure the deviation IDs in `image_entries.jsonl` are valid and accessible

#### 5. Verify Downloads

Check that downloads completed successfully:
```bash
# Count downloaded files
echo "Entries in image_entries.jsonl: $(wc -l < image_entries.jsonl)"
echo "Downloaded gruser files: $(ls results-gruser/gruser_*.json | wc -l)"
echo "Downloaded images: $(ls results-img/*.jpg | wc -l)"

# Check for any failed downloads
find results-gruser -name "gruser_*.json" -size 0
find results-img -name "*.jpg" -size 0
```

### Step-by-Step Rerun Process

1. **Clean Previous Results (Optional but Recommended)**
   ```bash
   # Backup existing results before cleaning
   mkdir -p backups/$(date +%Y-%m-%d)
   cp -r results-markdown backups/$(date +%Y-%m-%d)/
   cp -r description-classified/markdown backups/$(date +%Y-%m-%d)/
   
   # Clear previous results to ensure clean reprocessing
   rm -rf description-classified/markdown/gruser_*.md
   rm -rf results-markdown/*.md
   rm -f results-markdown/complete_files.txt
   ```

2. **Extract and Classify Descriptions**
   ```bash
   # Extract TipTap content from Gruser JSON files
   ./extract_tiptap_html.sh
   
   # Classify and convert descriptions to Markdown
   # This now properly handles TipTap JSON with Link and Underline extensions
   ./classify_all_tiptap.sh
   ```

3. **Generate AI Image Descriptions (if needed)**
   ```bash
   # Generate Llava descriptions for images (recommended)
   ./process_images_batch.sh llava
   
   # Optional: Generate Moondream descriptions
   ./process_images_batch.sh moondream
   ```

4. **Link Markdown Files with Images and Metadata**
   ```bash
   # This is the key fixed step - now properly handles file naming
   ./process_all_markdown.zsh
   ```

5. **Extract Image Metadata**
   ```bash
   # Process PNG images in the final Markdown files
   ./process_markdown_images.sh
   ```

### Key Fixes Applied

The following issues have been resolved in this version:

- **TipTap Extension Support**: Added Link and Underline extensions to `tiptap_json_to_html.mjs`
- **File Naming Consistency**: Fixed mismatch between `gruser_${id}` prefixed files and `${id}` output files
- **Process Flow**: Modified `process_all_markdown.zsh` to loop through source gruser files instead of processed markdown files
- **Graceful Handling**: Added support for missing classified descriptions and llava files

### Monitoring Progress

Track the pipeline progress with these commands:

```bash
# Check file counts at each stage
echo "Gruser files: $(ls results-gruser/gruser_*.json | wc -l)"
echo "TipTap extracts: $(ls results-tiptap/ | wc -l)"
echo "Classified markdown: $(ls description-classified/markdown/gruser_*.md | wc -l)"
echo "Final markdown: $(ls results-markdown/*.md | wc -l)"
echo "Llava descriptions: $(ls results-img-llava/*.txt | wc -l)"
```

### Troubleshooting

- **Missing TipTap Extensions**: If you see errors about unknown node types, ensure npm packages are installed
- **File Not Found Errors**: Check that the file naming convention matches between stages
- **Empty Descriptions**: Files with empty/minimal descriptions will be skipped automatically
- **Image Similarity**: The pipeline includes perceptual hashing to match similar source images

For detailed troubleshooting information, see `troubleshooting-missing-files.md`.

### Expected Results

After a complete rerun, you should have:
- Properly formatted Markdown files in `results-markdown/`
- Consistent file naming without prefix mismatches
- Better coverage of files with valid descriptions
- Image metadata extracted for PNG files

### Partial Reprocessing

To reprocess only specific deviation IDs:

```bash
# Reprocess a single ID (example: 1183353337)
./link-markdown.zsh results-gruser/gruser_1183353337.json
```
