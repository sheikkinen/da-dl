# Narrative Concatenation Tools

This directory contains tools for concatenating narrative files into single documents without metadata.

## Tools

### 1. `concatenate-narratives.mjs`
Specialized tool for the Wasteland Europa story format.

**Usage:**
```bash
node concatenate-narratives.mjs [story-path] [output-file] [options]
```

**Options:**
- `--include-toc` - Include table of contents
- `--include-stats` - Include scene statistics in TOC
- `--help` - Show help

**Examples:**
```bash
# Basic usage
node concatenate-narratives.mjs

# With table of contents
node concatenate-narratives.mjs recursive-writing/wasteland-europa wasteland-europa.md --include-toc --include-stats

# Using npm scripts
npm run concatenate
npm run concatenate:toc
npm run concatenate:simple
```

### 2. `universal-concatenate.mjs`
Generic tool that works with various narrative file structures and naming conventions.

**Usage:**
```bash
node universal-concatenate.mjs [directory] [output-file] [options]
```

**Options:**
- `--pattern=GLOB` - File pattern to match (e.g., `chapter-*.md`)
- `--include-toc` - Include table of contents
- `--include-stats` - Include scene statistics in TOC
- `--title=TITLE` - Custom document title
- `--subtitle=TEXT` - Custom subtitle
- `--help` - Show help

**Examples:**
```bash
# Process current directory
node universal-concatenate.mjs

# Process specific directory with custom title
node universal-concatenate.mjs stories/ complete-stories.md --title="My Stories"

# Process chapters with specific pattern
node universal-concatenate.mjs chapters/ book.md --pattern="chapter-*.md" --include-toc

# Process all text files
node universal-concatenate.mjs . all-files.md --pattern="*.txt" --title="All Text Files"
```

## Features

Both tools:
- ✅ **Smart Content Extraction** - Removes metadata, comments, and navigation elements
- ✅ **Chapter Title Generation** - Automatically generates readable chapter titles
- ✅ **Natural Sorting** - Properly sorts files with numbers (scene-1, scene-2, scene-10, etc.)
- ✅ **Word Count Statistics** - Tracks word counts for individual sections and totals
- ✅ **Table of Contents** - Optional TOC with clickable links and statistics
- ✅ **Clean Output** - Produces publication-ready markdown

### Content Filtering

The tools automatically remove:
- HTML comments and file path comments
- Metadata blocks (Date, Location, Duration, POV, etc.)
- Revision notes and technical annotations
- Navigation elements and status indicators
- Section headers that are replaced with clean chapter titles

### Supported File Patterns

**concatenate-narratives.mjs:**
- `*-narrative.md` (Wasteland Europa format)

**universal-concatenate.mjs:**
- `*-narrative.md` (default)
- `*.md` (default fallback)
- Custom patterns via `--pattern=` option

### Output Format

Generated documents include:
1. **Document Title** (auto-detected or custom)
2. **Subtitle** (optional)
3. **Table of Contents** (optional, with word counts)
4. **Chapter Sections** (clean narrative content with titles)
5. **Final Statistics** (scene count, total word count, generation date)

## Example Output Structure

```markdown
# Wasteland Europa

*Complete Narrative*

## Table of Contents

1. [Museum Discovery](#museum-discovery) *(~1,264 words)*
2. [The Herald's Warning](#the-heralds-warning) *(~1,584 words)*
...

---

## Museum Discovery

The morning light filtered through the shattered remains...

---

## The Herald's Warning

A week had passed since Maya discovered...

---

**Final Statistics**

- **Total Sections**: 30
- **Total Word Count**: ~50,879 words
- **Generated**: 2025-06-05
```

## Use Cases

- **Publishing Preparation** - Create clean manuscripts for editing or publication
- **Reading Copies** - Generate complete narratives for beta readers
- **Archive Creation** - Consolidate story projects into single documents
- **Format Conversion** - Prepare content for conversion to PDF, EPUB, etc.
- **Quality Review** - Review complete narrative flow without navigation distractions

## Installation

These tools require Node.js. No additional dependencies needed - they use only built-in Node.js modules.

```bash
# Make scripts executable
chmod +x concatenate-narratives.mjs universal-concatenate.mjs

# Or run with node directly
node concatenate-narratives.mjs --help
node universal-concatenate.mjs --help
```
