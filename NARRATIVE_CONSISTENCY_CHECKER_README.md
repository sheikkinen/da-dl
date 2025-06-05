# Narrative Consistency Checker

A comprehensive Node.js script that validates consistency between a consolidated narrative file and individual scene files, ensuring content integrity across a multi-file storytelling project.

## Overview

This tool was created to solve the challenge of maintaining consistency between:
- A consolidated narrative file (`complete-narrative.md`) containing all story sections
- Individual narrative files in a directory structure (e.g., `recursive-writing/wasteland-europa/narrative/`)

## Features

### Core Functionality
- **Content Matching**: Matches sections between complete narrative and individual files using fuzzy title matching
- **Content Comparison**: Compares actual narrative content (excluding metadata) using similarity algorithms
- **Word Count Validation**: Identifies significant size discrepancies between matched sections
- **Comprehensive Reporting**: Detailed issue categorization and statistics

### Advanced Capabilities
- **Smart Content Extraction**: Automatically identifies and extracts narrative content while filtering out:
  - File metadata (dates, locations, POV, word counts)
  - HTML comments and file paths
  - Content advisory sections
  - Status indicators and navigation elements
  - Scene markers and cross-references

- **Fuzzy Title Matching**: Handles title variations including:
  - Scene number prefixes (e.g., "Scene 05:")
  - Narrative suffixes (e.g., "- Full Narrative")
  - Formatting variations (dashes, pipes)
  - Common word substitutions

- **Similarity Analysis**: Uses advanced text comparison to detect:
  - Content mismatches (< 80% similarity)
  - Size mismatches (> 20% word count difference)
  - Missing sections in either source

## Usage

### Basic Usage
```bash
node check-narrative-consistency.mjs
```

### Configuration
The script uses configuration constants that can be modified at the top of the file:

```javascript
const CONFIG = {
    minContentLength: 100,        // Minimum content length to consider valid
    similarityThreshold: 0.8,     // Similarity threshold for content matching
    sizeThreshold: 0.2            // Size difference threshold (20%)
};
```

### File Structure Requirements
- Complete narrative file: `complete-narrative.md` (in same directory as script)
- Individual files: `recursive-writing/wasteland-europa/narrative/*-narrative.md`

## Output Format

### Success Case
```
🔍 Narrative Consistency Checker
================================

📖 Loading complete narrative...
✅ Loaded 30 sections from complete narrative

📁 Loading individual narrative files...
✅ Loaded 30 individual narrative files

🔍 Comparing content...
✅ Content comparison complete

📊 Summary Report
================
Total sections analyzed: 30
Successfully matched: 30
Missing in complete narrative: 0
Missing individual files: 0
Content mismatches: 0
Size mismatches: 0
Total issues found: 0

✅ No issues found! Complete narrative and individual files are consistent.
```

### Issue Detection
When issues are found, the script provides detailed reporting:

```
🚨 Issues Found:
================

📝 Content Mismatches:
  • "Section Title": Content appears significantly different (45.2% similarity)

📏 Size Mismatches:
  • "Section Title": Significant word count difference - Complete: 2775, Individual: 1823 (34.3% difference)

❌ Missing Files:
  • "Section Title": Found in complete narrative but no matching individual file

❌ Missing Sections:
  • "filename.md": Individual file not found in complete narrative
```

## Technical Implementation

### Content Extraction Algorithm
The script uses a sophisticated content extraction algorithm that:

1. **Identifies Narrative Start**: Looks for the first substantial paragraph (>50 characters) after metadata
2. **Skips Metadata**: Automatically filters out headers, metadata blocks, and structural elements
3. **Preserves Content**: Maintains the actual story text while removing formatting artifacts

### Matching Algorithm
- **Title Normalization**: Converts titles to canonical form for comparison
- **Fuzzy Matching**: Uses edit distance and keyword matching for resilient title matching
- **Content Similarity**: Implements token-based similarity comparison for content validation

### Error Handling
- Graceful handling of missing files or directories
- Detailed error reporting for debugging
- Validation of file structure and content format

## Dependencies

- Node.js (ES modules support)
- Built-in modules only: `fs/promises`, `path`

## Development History

### Major Issues Resolved
1. **Content Extraction Bug**: Fixed algorithm that was over-aggressively removing content from files with `## Content Advisory` sections
2. **Title Matching**: Enhanced fuzzy matching to handle various title formatting patterns
3. **Performance**: Optimized for large narrative collections (30+ files)

### Algorithm Evolution
- **v1**: Basic regex-based content cleaning
- **v2**: Enhanced with section detection and metadata filtering  
- **v3**: Robust line-by-line analysis for accurate narrative content extraction

## Use Cases

### Quality Assurance
- Validate that consolidated narratives match their source files
- Detect content drift during editing processes
- Ensure no sections are accidentally omitted or duplicated

### Content Management
- Verify consistency after bulk editing operations
- Validate automated narrative concatenation processes
- Monitor content integrity during collaborative writing

### Development Workflow
- Pre-commit validation for narrative projects
- Automated consistency checking in CI/CD pipelines
- Content audit for publishing workflows

## Future Enhancements

### Potential Features
- **Character Consistency**: Track character names and attributes across sections
- **Timeline Validation**: Verify chronological consistency
- **Style Analysis**: Detect significant writing style variations
- **Export Options**: Generate reports in JSON, CSV, or HTML formats

### Configuration Improvements
- Command-line argument support
- Configuration file support (JSON/YAML)
- Multiple narrative project support
- Custom file pattern matching

## Troubleshooting

### Common Issues
1. **"No narrative content found"**: Check that files contain substantial story text (>50 characters per line)
2. **Title matching failures**: Verify title formatting consistency
3. **False size mismatches**: Adjust `sizeThreshold` configuration for your content

### Debug Mode
To enable detailed logging, modify the script to include debug output in the `extractNarrativeContent` method.

## License

This tool is part of a creative writing project management system. Use and modify as needed for your narrative consistency requirements.
