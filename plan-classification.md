# Plan for Classifying `results-mark-id` Files

## 1. Objective
To categorize the final processed markdown files located in the `results-mark-id` directory based on various criteria, including creation time, keywords, and content analysis, to facilitate better organization and analysis.

## 2. Data Sources for Classification
*   **Primary Content Files:** `results-mark-id/*.md` (Comprehensive markdown files). These files are derived from `results-markdown` and combined with technical image information from `results-identify`.
*   **Primary Metadata Source:** `results-gruser/gruser_*.json` (Original DeviantArt metadata, including timestamps, titles, tags, and original descriptions). Each `results-mark-id/<id>.md` file corresponds to an original `results-gruser/gruser_<id>.json` file.

## 3. Classification Strategies

### 3.1. Time-Based Classification
*   **Goal:** Group files by their original publication date on DeviantArt.
*   **Method:**
    1.  For each `results-mark-id/<id>.md` file, identify the corresponding `results-gruser/gruser_<id>.json` file.
    2.  Extract the publication timestamp. Based on typical DeviantArt API responses, this is often found in a field like `deviation.publishedTime` (e.g., as a Unix timestamp or ISO 8601 string). This needs to be verified by inspecting a sample Gruser file.
    3.  Convert the timestamp to a human-readable date format (e.g., YYYY, YYYY-MM).
    4.  Categorize files by year, year-month, or other relevant time periods (e.g., "Pre-2020", "2020-2022", "2023+").
*   **Tools:**
    *   Shell scripts (`bash`/`zsh`) for iterating through files.
    *   `jq` for parsing JSON from Gruser files.
    *   `date` command for timestamp conversion and formatting.

### 3.2. Keyword-Based Classification
*   **Goal:** Tag or group files based on specific keywords found in their metadata or content.
*   **Method:**
    1.  **Keyword Source Identification:**
        *   **From Gruser JSON (`results-gruser/gruser_<id>.json`):**
            *   `deviation.title`
            *   `deviation.tags` (often an array of tag objects, e.g., `[{tagName: "tag1"}, {tagName: "tag2"}]`)
            *   `deviation.extended.descriptionText.html.markup` (original description text, may require HTML-to-text conversion if not already plain text).
        *   **From `results-mark-id/*.md` content:** The processed markdown content itself.
    2.  **Keyword List Definition:** Create a predefined list of relevant keywords or keyword categories (e.g., "Sci-Fi", "Fantasy", "Character Art", "Landscape", "Tutorial", specific software names, artistic techniques).
    3.  **Extraction & Matching:**
        *   Use `jq` to extract text from relevant fields in Gruser JSON files.
        *   Use `grep`, `awk`, or `sed` to search for keywords in the extracted text and in the content of `results-mark-id/*.md` files.
        *   Consider options for matching: case-insensitivity, stemming, partial matching.
*   **Tools:**
    *   `jq`, `grep`, `awk`, `sed`.
    *   A script (shell or Python) to manage keyword lists and apply matching logic.

### 3.3. Content-Based Classification (Automated Classifier)
*   **Goal:** Automatically assign predefined categories to files based on their textual content using a machine learning model or a rule-based system.
*   **Method:**
    1.  **Define Categories:** Establish a clear set of target categories (e.g., "Abstract Art", "Portrait", "Fan Art", "Photography", "Literature", "Technical Guide").
    2.  **Classifier Choice:**
        *   **Rule-Based System:** Develop a set of rules (e.g., IF (title CONTAINS "tutorial" OR description CONTAINS "step-by-step") THEN category = "Tutorial"). Simpler to implement for well-defined cases but may lack broader accuracy and scalability.
        *   **Machine Learning (ML) Model:**
            *   **Option A (External LLM):** Utilize an existing script (like `process_file.sh` described in the project README, if suitable) to send the content of `results-mark-id` files (or relevant parts from Gruser JSON) to an LM Studio instance or another Large Language Model API. The prompt would be designed for classification.
                *   Example Prompt: "Classify the following artwork description into one of these categories: [CategoryA, CategoryB, CategoryC]. Text: {content}"
            *   **Option B (Local ML Model):** Train or use a pre-trained text classification model. This could involve Python libraries like `scikit-learn`, `spaCy`, or `Hugging Face Transformers`. This approach requires more setup, potentially labeled training data, and computational resources.
    3.  **Data Preparation for ML:**
        *   Decide on the input text: concatenated title + description from Gruser, or the full/cleaned content from `results-mark-id`.
        *   If training a new model, a manually labeled dataset (a subset of the files) would be required.
    4.  **Execution:** Batch process files through the chosen classifier.
*   **Tools:**
    *   `process_file.sh` or a similar script for interacting with an external LLM.
    *   Python environment with ML/NLP libraries (`scikit-learn`, `nltk`, `spaCy`, `transformers`) for local ML models.
    *   Shell scripts for batch processing and orchestrating classification.

## 4. Implementation Steps & Potential Scripts

1.  **Inspect Gruser JSON Structure (Crucial First Step):**
    *   Thoroughly examine a few `results-gruser/gruser_SOME_ID.json` files to confirm the exact field paths for `publishedTime`, `title`, `tags` (and their structure), and `descriptionText`.
    *   Command example: `cat results-gruser/gruser_$(ls results-gruser | head -n 1) | jq .` (to view the first Gruser file). Then refine with specific paths like `jq .deviation.publishedTime`.

2.  **Develop `extract_core_metadata.sh` (or a more robust script, e.g., Python):**
    *   Input: Deviation ID (or Gruser file path).
    *   Output: A structured format (e.g., JSON line or TSV) containing: `id`, `published_timestamp`, `title_text`, `tags_concatenated`, `original_description_plain_text`.
    *   This script would use `jq` extensively and potentially text cleaning utilities if descriptions are HTML.
    *   **Goal:** Create an intermediate metadata file (e.g., `metadata_index.jsonl`) by running this script over all Gruser files once, to speed up subsequent classification steps.

3.  **Develop `classify_by_time.sh`:**
    *   Input: The `metadata_index.jsonl` file.
    *   Reads `published_timestamp` for each entry.
    *   Applies logic to categorize by year/month.
    *   Updates the `metadata_index.jsonl` with a new field (e.g., `time_category`) or outputs to a new classification results file.

4.  **Develop `classify_by_keyword.sh`:**
    *   Input: The `metadata_index.jsonl` file and a keyword configuration file (defining keywords and target categories).
    *   Reads `title_text`, `tags_concatenated`, `original_description_plain_text`.
    *   Applies keyword matching logic.
    *   Updates the `metadata_index.jsonl` with keyword tags/categories.

5.  **Develop/Adapt `classify_by_content_rules.sh` or `run_content_classifier.py`:**
    *   **For Rule-Based:**
        *   Input: `metadata_index.jsonl`.
        *   Applies predefined rules to text fields.
    *   **For ML-Based (using external LLM via `process_file.sh` adaptation):**
        *   Script iterates through `results-mark-id/*.md` (or uses text from `metadata_index.jsonl`).
        *   Constructs appropriate prompts and calls the LLM.
        *   Parses classifier output.
    *   Updates the `metadata_index.jsonl` with content-based categories.

## 5. Storing Classification Results

*   **Primary Method: Enhanced Metadata File:**
    *   Maintain and enrich the `metadata_index.jsonl` (or a similar central file like `classification_results.jsonl`).
    *   Each JSON line would represent a file and store its ID, path, and all assigned classifications/tags.
    *   Example entry:
      ```json
      {
        "file_id": "1000026712",
        "gruser_path": "results-gruser/gruser_1000026712.json",
        "markdown_path": "results-mark-id/1000026712.md",
        "published_time_unix": 1609459200,
        "time_category_year": "2021",
        "time_category_month": "2021-01",
        "keyword_tags": ["fantasy", "dragon", "digital_art"],
        "content_category_llm": "Fantasy Illustration"
      }
      ```
*   **Secondary Method (Optional, for browsing): Directory Structure:**
    *   Create a new top-level directory (e.g., `results-classified-views`).
    *   Inside, create subdirectories based on specific classification facets (e.g., `by_year/2021/`, `by_keyword/fantasy/`, `by_content_category/fantasy_illustration/`).
    *   Use **symbolic links** (`ln -s`) pointing from these category directories to the actual files in `results-mark-id` to avoid data duplication. These views can be generated by scripts reading the `classification_results.jsonl`.

## 6. Tools and Dependencies Recap
*   **Shell:** `zsh` or `bash`.
*   **JSON Processing:** `jq` (essential).
*   **Text Processing:** `grep`, `awk`, `sed`, `pandoc` (for HTML to text if needed).
*   **Date Manipulation:** `date` command (GNU date for preference for advanced formatting/conversion).
*   **Optional (for ML classification):**
    *   Python 3.x.
    *   Relevant Python libraries: `requests` (for API calls), `scikit-learn`, `nltk`, `spaCy`, `transformers`.
    *   Access to an LLM (local via LM Studio, or cloud-based API).
*   **File System Tools:** `mkdir`, `ln -s`, `cp`, `find`, `cat`, `head`.

## 7. Workflow Outline

1.  **Preparation & Setup:**
    *   Verify/Install all necessary tools (`jq`, Python environment if needed).
    *   Create the main output directory for classified views (e.g., `mkdir -p results-classified-views`).
    *   Define initial keyword lists and potential content categories.
2.  **Initial Metadata Extraction:**
    *   Run the `extract_core_metadata.sh` (or equivalent Python script) to generate `metadata_index.jsonl` from all files in `results-gruser/`.
3.  **Time-Based Classification:**
    *   Run `classify_by_time.sh` to process `metadata_index.jsonl` and add time-based category fields.
4.  **Keyword-Based Classification:**
    *   Run `classify_by_keyword.sh` to process `metadata_index.jsonl` and add keyword-based tags/categories.
5.  **Content-Based Classification:**
    *   Choose method (rules, external LLM, local ML).
    *   Prepare necessary prompts, rules, or models.
    *   Run the corresponding script (e.g., `classify_by_content_rules.sh` or `run_content_classifier.py`) to process `metadata_index.jsonl` (or `results-mark-id` files directly) and add content-based category fields.
6.  **Generate Symlink Views (Optional):**
    *   Develop a script that reads `classification_results.jsonl` and creates the symlinked directory structure in `results-classified-views`.
7.  **Review and Refine:**
    *   Manually inspect a sample of classifications for accuracy.
    *   Iteratively refine keyword lists, classification rules, LLM prompts, or ML models based on review.
    *   Re-run classification steps as needed.

This plan provides a structured approach to classifying your processed DeviantArt data. Remember to start with thorough data inspection.

## 7.1. Management Summary of Results (New Section)

Upon successful completion of this classification plan, the project will yield several key benefits and organized outputs:

*   **Structured Data Asset:** The primary result will be a well-organized and enriched dataset of DeviantArt entries. The `classification_results.jsonl` file will serve as a central, queryable index, containing not only the original metadata but also new classifications based on time, keywords, and content.
*   **Enhanced Discoverability:** By categorizing files by publication date, relevant keywords (e.g., "Sci-Fi," "Tutorial"), and content themes (e.g., "Character Art," "Landscape"), users will be able to quickly locate specific types of artwork or information within the large dataset.
*   **Facilitated Analysis & Insights:** The classified data will enable more targeted analysis. For example, researchers could study trends in artwork themes over time, identify popular tags associated with specific styles, or analyze the characteristics of highly-rated deviations within certain categories.
*   **Improved Data Navigation:** The optional creation of a symlinked directory structure (`results-classified-views/`) will offer an intuitive, folder-based way to browse the collection by the newly defined categories, complementing the queryable JSONL index.
*   **Reusable Classification Scripts:** The set of new scripts developed in the `analysis/` directory will provide a reusable toolkit for processing and classifying similar datasets in the future, potentially adaptable for other content sources beyond DeviantArt.
*   **Foundation for Further Work:** This organized dataset can serve as a foundation for more advanced projects, such as training specialized machine learning models (e.g., for art style recognition, automated tagging improvements), generating reports, or building interactive data visualization tools.

In essence, this project transforms a raw collection of downloaded data into a structured, analyzable, and navigable information resource, significantly increasing its value and utility for various research and exploration purposes.

## 8. Tools and Analysis Scripts Summary

This section summarizes the tools and scripts required for the classification tasks. New custom scripts developed for this plan should be placed in a dedicated `analysis/` directory within the project.

### 8.1. Existing Project Scripts (May require adaptation)
*   `process_file.sh`: Can be adapted for content classification using an external LLM (as per section 3.3).
*   Other existing shell utilities (`*.sh`, `*.zsh`) can serve as templates or be called by new analysis scripts for specific sub-tasks if applicable.

### 8.2. Standard Command-Line Tools
*   **Shell:** `zsh` (primary, as per user environment) or `bash`.
*   **JSON Processing:** `jq` (essential for reading `results-gruser/*.json` and `metadata_index.jsonl`).
*   **Text Processing:** `grep`, `awk`, `sed` (for keyword searching, text manipulation).
*   **Date Manipulation:** `date` (GNU version preferred for advanced features, ensure compatibility or use alternatives if not available).
*   **File System:** `mkdir` (to create `analysis/` and `results-classified-views/`), `ln -s` (for creating symlink views), `cat`, `head`, `find`.
*   **Optional (HTML to Text):** `pandoc` (if original descriptions in Gruser files are HTML and need conversion to plain text for analysis).

### 8.3. New Analysis Scripts (to be created in `analysis/` directory)

1.  **`analysis/create_analysis_dirs.sh`** (or similar)
    *   **Purpose:** Simple utility to create the `analysis/` and `results-classified-views/` directories if they don't exist.
    *   **Covered in Plan Section:** 7.1.

2.  **`analysis/extract_core_metadata.sh`** (or a more robust Python script `analysis/extract_core_metadata.py`)
    *   **Purpose:** Iterate through `results-gruser/` files, extract key fields (ID, publishedTime, title, tags, description), and output to `metadata_index.jsonl`.
    *   **Covered in Plan Section:** 4.2, 7.2.
    *   **Key Tools Used:** `find`, `jq`, shell loops, `date` (for timestamp normalization if needed), potentially `pandoc` if HTML descriptions need cleaning.

3.  **`analysis/classify_by_time.sh`** (or `analysis/classify_by_time.py`)
    *   **Purpose:** Read `metadata_index.jsonl`, parse `published_timestamp`, and add time-based categories (e.g., `year`, `year_month`) to each entry.
    *   **Covered in Plan Section:** 4.3, 7.3.
    *   **Key Tools Used:** `jq` (or Python JSON library), `date` (or Python datetime library).

4.  **`analysis/classify_by_keyword.sh`** (or `analysis/classify_by_keyword.py`)
    *   **Purpose:** Read `metadata_index.jsonl` and a keyword configuration file. Match keywords against text fields and add keyword tags/categories.
    *   **Covered in Plan Section:** 4.4, 7.4.
    *   **Key Tools Used:** `jq` (or Python JSON library), `grep`/`awk`/`sed` (or Python string/regex matching), file I/O for keyword list.

5.  **`analysis/classify_by_content.sh`** (or `analysis/classify_by_content.py`)
    *   **Purpose:** Implement content-based classification. This could be a wrapper for `process_file.sh` (for LLM classification), a rule-based engine, or a script to run a local ML model.
    *   **Covered in Plan Section:** 4.5, 7.5.
    *   **Key Tools Used:** Depends on method: shell scripting, `jq`, potentially Python with `requests`, `scikit-learn`, `nltk`, `spaCy`, `transformers`.

6.  **`analysis/generate_symlink_views.sh`** (or `analysis/generate_symlink_views.py`)
    *   **Purpose:** Read the final `classification_results.jsonl` (enriched `metadata_index.jsonl`) and create a directory structure with symbolic links in `results-classified-views/` based on the assigned categories.
    *   **Covered in Plan Section:** 5 (Secondary Method), 7.6.
    *   **Key Tools Used:** `jq` (or Python JSON library), `mkdir`, `ln -s`, shell loops.

### 8.4. Python and Libraries (Optional, for more complex scripts)
*   **Python 3.x**
*   **Libraries:**
    *   `requests`: For interacting with external LLM APIs if `process_file.sh` is not used directly.
    *   `scikit-learn`, `nltk`, `spaCy`, `transformers`: For local ML-based text classification.
    *   Standard libraries: `json`, `datetime`, `os`, `re`, `subprocess`.

This list provides a clear overview of the scripting and tooling requirements for the classification project.
