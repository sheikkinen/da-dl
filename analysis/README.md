# DeviantArt Data Analysis Scripts

This directory contains Node.js scripts for processing and analyzing DeviantArt metadata extracted from the da-dl project.

## Overview

The analysis pipeline consists of four main processing stages:

1. **Metadata Extraction** - Extract core metadata from gruser files and markdown descriptions
2. **Model Extraction** - Extract AI model information from generation metadata (NEW ✨)
3. **Time Classification** - Categorize entries by publication date (year/month)
4. **Keyword Classification** - Categorize entries based on tags, keywords, and models

All scripts process data in JSONL (JSON Lines) format, where each line contains a single JSON object.

### 🆕 Enhanced Model Extraction Pipeline

The latest addition includes **regex-based model extraction** from generation info files with **95.8% success rate**:
- Extracts AI model names from ComfyUI JSON workflows
- Processes Automatic1111 parameter formats
- Handles special cases and edge patterns
- Automatically categorizes models (Flux, SDXL, SD, Anime)
- Integrates seamlessly with keyword classification

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

### 🆕 Model Extraction Scripts

#### `../extract_model_regex.mjs`
**Purpose**: Extract AI model names from generation info files using advanced regex patterns.

**Input**: `../results-identify/*.txt` - Generation info/metadata files

**Output**: Console output with extraction statistics

**Models detected**:
- ComfyUI JSON workflows (`ckpt_name` fields)
- Automatic1111 parameter formats (`Model:` fields)
- Flux model formats with hashes
- Generic safetensors and ckpt files
- Special cases (Hybase Model detection)

**Extraction patterns**:
1. Key-value format: `Model: model_name`
2. JSON format: `"ckpt_name": "path/model.safetensors"`
3. Parameters format: `parameters: ... Model: model_name`
4. Model hash format: `Model hash: abc123, Model: model_name`
5. Generic safetensors: `model_name.safetensors`

**Usage**:
```bash
cd /path/to/da-dl
./extract_model_regex.mjs
```

**Success Rate**: 95.8% (2630/2744 files)

#### `../batch_extract_models.mjs`
**Purpose**: Batch process all generation info files and export model data.

**Input**: `../results-identify/*.txt`

**Output**: 
- `extracted_models.csv` - CSV format for spreadsheet analysis
- `extracted_models.json` - JSON array format
- `extracted_models.jsonl` - JSONL format for pipeline integration

**Features**:
- Processes 2744+ files automatically
- Generates comprehensive statistics
- Creates multiple output formats
- Identifies 52+ unique models

**Usage**:
```bash
cd /path/to/da-dl
./batch_extract_models.mjs
```

#### `../update_keyword_config_with_models.mjs`
**Purpose**: Automatically categorize extracted models and update keyword configuration.

**Input**: 
- `extracted_models.jsonl` - Extracted model data
- `keyword_config.json` - Existing keyword configuration

**Output**: Updated `keyword_config.json` with new model categories

**Model Categories**:
- **Flux Models**: flux-*, flux1-dev-*
- **SDXL Models**: *SDXL*, *sdxl*, sd_xl_*
- **SD Models**: *SD*, revAnimated*, dreamshaper*
- **Anime Models**: anime*, waifu*, yiffy*

**Usage**:
```bash
cd /path/to/da-dl
./update_keyword_config_with_models.mjs
```

#### `../comprehensive_analysis.mjs`
**Purpose**: Complete end-to-end analysis pipeline combining all processing steps.

**Input**: 
- `../results-identify/*.txt` - Generation info files
- `metadata_index.jsonl` - Existing metadata
- `keyword_config.json` - Configuration

**Output**: 
- Updated `extracted_models.jsonl`
- Updated `keyword_config.json` 
- Updated `metadata_index.jsonl` with keyword categories
- `comprehensive_analysis_report.md` - Detailed analysis report

**Pipeline Steps**:
1. Extract models from generation info files
2. Update keyword configuration with new models
3. Run keyword classification on metadata
4. Generate comprehensive analysis report

**Usage**:
```bash
cd /path/to/da-dl
./comprehensive_analysis.mjs
```

#### `../validate_extraction.mjs`
**Purpose**: Validate and report on model extraction results.

**Input**: `extracted_models.jsonl`

**Output**: Console statistics and top model rankings

**Usage**:
```bash
cd /path/to/da-dl
./validate_extraction.mjs
```

### Time & Keyword Classification Scripts

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
**Purpose**: Add keyword-based categorization using configurable rules including AI model detection.

**Input**: 
- `metadata_index.jsonl`
- `keyword_config.json` - Category definitions (now includes model categories)

**Output**: Updates `metadata_index.jsonl` with keyword categories

**Fields added**:
- `keyword_categories` - Array of matched category names

**Enhanced Features** ✨:
- **Model-aware classification**: Detects AI models in tags and descriptions
- **Underscore handling**: Properly handles model names with underscores
- **Expanded categories**: 20+ categories including Flux.1, SDXL, SD models

**Usage**:
```bash
./classify_by_keyword.mjs
```

**Current Success Rate**: 90.9% categorization (4477/4927 entries)

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

**Enhanced Categories** (20+ total):
- **Content Categories**: Art & Tutorial, Fantasy, Character & Portrait, Nature & Animals
- **Style Categories**: Anime Model, Dark & Eerie, Sci-Fi, Abstract
- **AI Model Categories** 🆕: 
  - **Flux.1 Model**: flux-hyp16-Q5_0, flux1-dev-bnb-nf4-v2, etc.
  - **SDXL Model**: sdxlUnstableDiffusers_*, albedobaseXL_*, etc.
  - **SD Model**: revAnimated_*, dreamshaper*, etc.
  - **Anime Model**: yiffymix_*, animeArtDiffusionXL_*, etc.
- **Specialized Categories**: BDSM_Fetish, Furry_Monsters, Loli, etc.

## Enhanced Processing Pipeline

**Recommended execution order for complete analysis**:

### Option 1: Individual Steps
1. **Extract core metadata**:
   ```bash
   cd /path/to/da-dl/analysis
   ./extract_core_metadata.mjs
   ```

2. **Extract AI models**:
   ```bash
   cd /path/to/da-dl
   ./batch_extract_models.mjs
   ```

3. **Update keyword configuration with models**:
   ```bash
   ./update_keyword_config_with_models.mjs
   ```

4. **Add time categories**:
   ```bash
   cd analysis
   ./classify_by_time.mjs
   ```

5. **Add keyword categories** (including models):
   ```bash
   ./classify_by_keyword.mjs
   ```

### Option 2: Comprehensive Pipeline (Recommended) ✨
```bash
cd /path/to/da-dl
./comprehensive_analysis.mjs
```
*This runs the complete pipeline automatically and generates detailed reports.*

## Data Files

### Primary Data
- `metadata_index.jsonl` - Main processed dataset with enhanced categorization
- `metadata_index.jsonl.bak` - Automatic backup (created by processing scripts)

### Model Extraction Data 🆕
- `extracted_models.csv` - Model extraction results in CSV format
- `extracted_models.json` - Model extraction results in JSON format  
- `extracted_models.jsonl` - Model extraction results in JSONL format

### Configuration
- `keyword_config.json` - Enhanced keyword categorization rules (includes AI models)
- `keyword_config.json.bak` - Backup of previous configuration

### Analysis Reports 🆕
- `comprehensive_analysis_report.md` - Complete analysis report
- `enhanced_extraction_report.md` - Model extraction performance report

### Logs
- `extract_core_metadata.errors.log` - Error log (created automatically if issues occur during extraction)

## Enhanced Processing Statistics

**Latest processing results**:
- **Total entries**: 4,927
- **Entries with titles**: 4,909 (99.6%)
- **Entries with descriptions**: 2,802 (56.9%)
- **Entries with time categories**: 4,909 (99.6%)
- **Entries with keyword categories**: 4,477 (90.9%) ⬆️ *+25% improvement*

**Model extraction results** 🆕:
- **Total generation info files**: 2,744
- **Models successfully extracted**: 2,630 (95.8%)
- **Unique models identified**: 52
- **Top model**: Hybase Model (655 instances, 23.9%)

**Category distribution highlights**:
- **Nature & Animals**: 2,135 (43.3%)
- **Fantasy**: 2,119 (43.0%) 
- **SDXL Model**: 1,253 (25.4%) 🆕
- **Flux.1 Model**: 577 (11.7%) 🆕

## Features

### Error Handling
- All scripts create automatic backups before processing
- Detailed error logging and reporting
- Graceful handling of malformed JSON and missing files

### Enhanced JSON Processing
- Robust state-machine parsing for handling multi-line JSON objects
- Proper JSONL output formatting (single-line JSON objects)
- Automatic validation and error recovery

### 🆕 Advanced Model Extraction
- **95.8% extraction success rate** with 9 specialized regex patterns
- **Multi-format support**: ComfyUI JSON, Automatic1111 parameters, generic formats
- **Intelligent categorization**: Automatic classification into Flux, SDXL, SD, Anime models
- **Edge case handling**: Special detection for minimal metadata files

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
  "keyword_categories": ["Digital Art", "Fantasy", "SDXL Model"]
}
```

**🆕 Model extraction output format**:
```json
{
  "file_id": "1000046073",
  "model_name": "sdxlUnstableDiffusers_v6StabilityEater"
}
```

## Troubleshooting

### Common Issues

1. **"Directory not found" errors**: Ensure you're running scripts from the correct directory
   - Core metadata scripts: run from `analysis/` directory
   - Model extraction scripts: run from project root (`da-dl/`)

2. **JSON parsing errors**: The scripts now handle malformed JSON gracefully

3. **Missing markdown files**: Check that `../description-classified/markdown/` exists and contains files

4. **🆕 Model extraction issues**:
   - **Low extraction rate**: Check that `results-identify/` contains .txt files
   - **Missing models**: Some files may contain only descriptions without generation metadata
   - **Pattern mismatches**: New generation tools may require additional regex patterns

### Validation
Check data integrity:
```bash
# Count total entries
wc -l metadata_index.jsonl

# Validate JSON format
head -5 metadata_index.jsonl | jq .

# Check for specific fields
jq 'select(.title != null)' metadata_index.jsonl | wc -l

# 🆕 Validate model extraction
cd /path/to/da-dl
./validate_extraction.mjs

# 🆕 Check model categorization
jq 'select(.keyword_categories[] | contains("Model"))' analysis/metadata_index.jsonl | wc -l
```

### Performance Optimization
- **Large datasets**: The enhanced pipeline can process 4,927+ metadata entries and 2,744+ generation files
- **Memory usage**: Scripts process files individually to minimize memory footprint  
- **Processing time**: Complete pipeline typically runs in under 2 minutes

## Legacy Files

The following shell script versions are kept for reference but are no longer used:
- `*.sh` files (replaced by `*.mjs` Node.js versions)

## Requirements

- Node.js (ES modules support)
- `jq` (for JSON validation and testing)
- Unix-like environment (macOS, Linux)

## Migration Notes

This analysis pipeline has been significantly enhanced with:

### v1.0 → v2.0 Migration (2024-2025)
- **Shell scripts → Node.js**: Better error handling and cross-platform compatibility
- **Enhanced JSON parsing**: Robust handling of malformed input
- **Automatic backups**: All processing steps create safety backups

### v2.0 → v2.1 Migration (June 2025) 🆕
- **AI Model Extraction**: 95.8% success rate regex-based model detection
- **Enhanced Categorization**: 20+ categories including AI model types
- **Comprehensive Pipeline**: End-to-end automated analysis workflow
- **Advanced Statistics**: Detailed reporting and validation tools
- **Underscore Handling**: Improved keyword matching for model names

### Breaking Changes
- Model extraction requires `results-identify/` directory with generation info files
- Keyword configuration format extended to include model categories
- Processing pipeline now includes model extraction step
