# DeviantArt Data Analysis Scripts

This directory contains Node.js scripts for processing and analyzing DeviantArt metadata extracted from the da-dl project.

## Overview

The analysis pipeline consists of three main processing stages:

1. **Metadata Extraction** - Extract core metadata from gruser files and markdown descriptions
2. **Time Classification** - Categorize entries by publication date (year/month)
3. **Keyword Classification** - Categorize entries based on tags and keywords

All scripts process data in JSONL (JSON Lines) format, where each line contains a single JSON object.

## Scripts

### Core Processing Scripts (Node.js)

#### `extract_core_metadata.mjs`
**Purpose**: Extract core metadata from gruser JSON files and corresponding markdown descriptions.

**Input**: 
- `../results-gruser/*.json` - DeviantArt gruser API responses
- `../description-classified/markdown/*.md` - Processed descriptions

**Output**: `metadata_index.jsonl` - Core metadata in JSONL format

**Fields extracted**:
- `file_id` - Unique identifier
- `published_time_raw` - Original publication timestamp
- `title` - Artwork title
- `tags_comma_separated` - Tags as comma-separated string
- `description_markdown` - Processed description text

**Usage**:
```bash
./extract_core_metadata.mjs
```

#### `classify_by_time.mjs`
**Purpose**: Add time-based categorization to existing metadata.

**Input**: `metadata_index.jsonl`
**Output**: Updates `metadata_index.jsonl` with time categories

**Fields added**:
- `time_category_year` - Publication year (e.g., "2023")
- `time_category_month` - Month name (e.g., "January")

**Usage**:
```bash
./classify_by_time.mjs
```

#### `classify_by_keyword.mjs`
**Purpose**: Add keyword-based categorization using configurable rules.

**Input**: 
- `metadata_index.jsonl`
- `keyword_config.json` - Category definitions

**Output**: Updates `metadata_index.jsonl` with keyword categories

**Fields added**:
- `keyword_categories` - Array of matched category names

**Usage**:
```bash
./classify_by_keyword.mjs
```

## Configuration

### `keyword_config.json`
Defines keyword matching rules for categorization. Structure:
```json
{
  "categories": {
    "Category Name": {
      "keywords": ["keyword1", "keyword2"],
      "case_sensitive": false
    }
  }
}
```

Current categories:
- Art & Tutorial
- Fantasy
- Character & Portrait
- Anime & Manga
- Digital Art
- Photography
- Traditional Art

## Processing Pipeline

Recommended execution order:

1. **Extract metadata**:
   ```bash
   cd /path/to/da-dl/analysis
   ./extract_core_metadata.mjs
   ```

2. **Add time categories**:
   ```bash
   ./classify_by_time.mjs
   ```

3. **Add keyword categories**:
   ```bash
   ./classify_by_keyword.mjs
   ```

## Data Files

### Primary Data
- `metadata_index.jsonl` - Main processed dataset
- `metadata_index.jsonl.bak` - Automatic backup (created by processing scripts)

### Configuration
- `keyword_config.json` - Keyword categorization rules

### Logs
- `extract_core_metadata.errors.log` - Error log (created automatically if issues occur during extraction)

## Processing Statistics

Latest processing results:
- **Total entries**: 4,927
- **Entries with titles**: 4,909 (99.6%)
- **Entries with descriptions**: 2,802 (56.9%)
- **Entries with time categories**: 4,909 (99.6%)
- **Entries with keyword categories**: 3,247 (65.9%)

## Features

### Error Handling
- All scripts create automatic backups before processing
- Detailed error logging and reporting
- Graceful handling of malformed JSON and missing files

### JSON Processing
- Robust state-machine parsing for handling multi-line JSON objects
- Proper JSONL output formatting (single-line JSON objects)
- Automatic validation and error recovery

### Output Format
Each entry in `metadata_index.jsonl` contains:
```json
{
  "file_id": "1000026712",
  "published_time_raw": "2023-01-15T12:30:00+00:00",
  "title": "Artwork Title",
  "tags_comma_separated": "digital,art,fantasy",
  "description_markdown": "Description text...",
  "time_category_year": "2023",
  "time_category_month": "January",
  "keyword_categories": ["Digital Art", "Fantasy"]
}
```

## Troubleshooting

### Common Issues

1. **"Directory not found" errors**: Ensure you're running scripts from the `analysis/` directory
2. **JSON parsing errors**: The scripts now handle malformed JSON gracefully
3. **Missing markdown files**: Check that `../description-classified/markdown/` exists and contains files

### Validation
Check data integrity:
```bash
# Count total entries
wc -l metadata_index.jsonl

# Validate JSON format
head -5 metadata_index.jsonl | jq .

# Check for specific fields
jq 'select(.title != null)' metadata_index.jsonl | wc -l
```

## Legacy Files

The following shell script versions are kept for reference but are no longer used:
- `*.sh` files (replaced by `*.mjs` Node.js versions)

## Requirements

- Node.js (ES modules support)
- `jq` (for JSON validation and testing)
- Unix-like environment (macOS, Linux)

## Migration Notes

This analysis pipeline was migrated from shell scripts to Node.js for:
- Better error handling and logging
- Robust JSON parsing (handles malformed input)
- Automatic backup creation
- Detailed processing statistics
- Cross-platform compatibility
