# Tools Brainstorm

## Implementation Checklist
- [ ] Design and implement tool for initializing a new book / story
- [ ] Design and implement scene creation tool
- [ ] Design and implement cross-referencing tool
- [ ] Design and implement logging utility
- [ ] Design and implement keyword search tool for metadata_index.jsonl
- [ ] Design and implement random inspiration picker
- [ ] Design and implement theme/category explorer
- [ ] Design and implement timeline/chronology tool
- [ ] Design and implement story seed extractor
- [ ] Design and implement image/description pair exporter

---

## 0. New Book/Story Initialization Tool
- Purpose: Automate the setup of a new book or story project structure.
- Features:
  - Prompt for book/story title and optional metadata (author, genre, description)
  - Create a new directory under a specified parent (e.g., `recursive-writing/` or `story-template/`)
  - Scaffold standard subdirectories: `characters/`, `locations/`, `plots/`, `scenes/`, `artifacts/`, `universe-bible-updates/`, `status-logs/`
  - Copy or link shared templates (character, scene, plot, artifact) into the new story directory
  - Optionally create an initial `story-action-plan.md` and `README.md` with the provided metadata
  - (Optional) Register the new story in a central index for tracking all projects
  - Creates a log folder
- Requirements:
  - Should be runnable from the command line (shell script, Node.js, or Python recommended)
  - Should not overwrite existing stories with the same name
  - Should be easy to extend with new subdirectories or templates in the future
  - Writes first entry in the log/<storyname>.log

## 1. Scene Creation Tool
- Purpose: Streamline the creation of new scenes using the scene template.
- Features:
  - Prompt user for required fields (title, meta-synopsis, characters, etc.)
  - Auto-generate a new scene file in the correct directory
  - Optionally link to related character, plot, and artifact files

## 2. Cross-Referencing Tool
- Purpose: Maintain and visualize connections between scenes, characters, plots, locations, and artifacts.
- Features:
  - Scan markdown files for references (e.g., character names, artifact mentions)
  - Generate a simple map or report of interconnections
  - Optionally output Mermaid diagrams for narrative web

## 3. Logging Utility
- Purpose: Track changes, additions, and updates to story files for transparency and review.
- Features:
  - Log file creation, edits, and deletions with timestamps
  - Optionally summarize changes in a status log
  - Integrate with version control if possible

## 4. Keyword Search Tool for metadata_index.jsonl
- Purpose: Find entries by keyword in title, description, or keyword_categories.
- Features:
  - Command-line or web-based interface
  - Supports AND/OR/NOT logic for complex queries
  - Outputs a list of matching entries with links and summaries

## 5. Random Inspiration Picker
- Purpose: Randomly select an entry (optionally filtered by keyword or category) to spark new story ideas.
- Features:
  - Option to filter by year, category, or tag
  - Outputs the title, description, and image link

## 6. Theme/Category Explorer
- Purpose: List and explore all unique keyword_categories in the dataset.
- Features:
  - For each category, show a count and allow browsing all entries in that category
  - Useful for thematic planning and identifying underused themes

## 7. Timeline/Chronology Tool
- Purpose: Visualize or list entries by published_time_raw or time_category_year/month.
- Features:
  - Generate a timeline of creative output
  - Filter by keyword or category to see trends over time
  - Provide a timeline template for manual or automated entry (e.g., Markdown table or JSON structure)
  - Output a Mermaid diagram for visualizing the timeline/chronology
  - Support both raw data output (for further processing) and diagram output (for direct visualization)

## 8. Story Seed Extractor
- Purpose: Extract and summarize the most story-rich descriptions for use as writing prompts.
- Features:
  - Use heuristics (e.g., length, presence of narrative elements) to rank entries
  - Output a list of top story seeds with direct links

## 9. Image/Description Pair Exporter
- Purpose: Export a set of images and their descriptions for mood boards or inspiration documents.
- Features:
  - Select by keyword, category, or random
  - Output as a markdown or HTML file with images and text

---

## Implementation Notes for Inspiration Tools
- The logic for keyword/category matching in `analysis/classify_by_keyword.mjs` can be reused for:
  - Keyword Search Tool
  - Theme/Category Explorer
- The JSONL parsing and time categorization in `analysis/classify_by_time.mjs` is useful for:
  - Timeline/Chronology Tool
- Consider importing or adapting these modules for efficient, consistent handling of `metadata_index.jsonl`.
- All tools should support reading large JSONL files efficiently (streaming or line-by-line processing).

---
Add further tool ideas or requirements below as the project evolves.
