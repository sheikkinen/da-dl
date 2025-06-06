# Refactoring Proposal for `recursive-writing` Folder

**Objective:** Streamline the folder structure, improve clarity, and remove redundancy to better support the recursive writing process.

**Current Structure Overview:**

*   `active-story`: A file indicating the current story being worked on (e.g., "wasteland-europa").
*   `narrative-generation-prompt.md`: A detailed prompt for generating narratives, specifically tailored for the "Wasteland Europa" project.
*   `shared-artifacts/`: Contains templates for various story elements (characters, scenes, plots, etc.).
*   `shared-tools/`: Contains scripts and tools for story initialization, keyword search, etc.
*   `status.md`: Tracks the overall status of the recursive writing project, including tooling and documentation.
*   `story-action-plan.md`: A general template for story-specific planning.
*   `story-index.csv`: A CSV file logging story generation events with timestamps.
*   `wasteland-europa/`: A story-specific folder containing all elements related to the "Wasteland Europa" project.

**Proposed Refactorings and Rationale:**

1.  **Consolidate Story-Specific Files into their Respective Story Folders:**
    *   **`narrative-generation-prompt.md`**: This file is highly specific to the "Wasteland Europa" project.
        *   **Action:** Move `recursive-writing/narrative-generation-prompt.md` to `recursive-writing/wasteland-europa/planning/narrative-generation-prompt.md`. This keeps all "Wasteland Europa" planning documents together.
    *   **`story-index.csv`**: While it logs entries for different stories, its current content is heavily skewed towards "TestNovel" and "wasteland-europa". It might be better to have story-specific logs or a more centralized logging mechanism if this is intended to be a global index.
        *   **Decision:** For now, let's assume it's a general log. No immediate move, but recommend reviewing its purpose.

2.  **Standardize Story Folder Structure:**
    *   The `wasteland-europa/` folder has a good structure (artifacts, characters, locations, narrative, planning, scenes, logs, etc.). This should be the standard.
    *   The `init-story.zsh` script in `shared-tools/` likely creates this structure. Ensure it's consistent.
    *   **`story-action-plan.md` (in `recursive-writing/`):** This is a template.
        *   **Action:** Rename it to `story-action-plan-template.md` and move it to `shared-artifacts/` as it serves as a template for new stories. The `init-story.zsh` script should copy this template into the `planning/` directory of a new story (e.g., `[story-name]/planning/story-action-plan.md`).

3.  **Review `active-story` File:**
    *   This file simply contains the name of the active story folder.
    *   **Action:** Keep as is. It's simple and effective.

4.  **Review `shared-tools/`:**
    *   `tools-brainstorm.md`: This is a planning document.
        *   **Action:** Move `recursive-writing/shared-tools/tools-brainstorm.md` to a new `recursive-writing/planning/tools-brainstorm.md`.

5.  **Review `status.md` (in `recursive-writing/`):**
    *   This file tracks the overall status of the "Recursive Writing Project".
    *   **Action:** Keep as is.

**Proposed New Structure (Key Changes):**

```
recursive-writing/
├── active-story
├── planning/                  # New folder for project-level planning
│   └── tools-brainstorm.md    # Moved
├── shared-artifacts/
│   ├── README.md
│   ├── ... (other templates)
│   └── story-action-plan-template.md # Renamed and moved
├── shared-tools/
│   ├── README.md
│   ├── init-story.zsh
│   ├── ... (other tools)
├── status.md
├── story-index.csv            # Kept, purpose to be reviewed
└── wasteland-europa/          # Example story
    ├── README.md
    ├── ... (other story-specific subfolders)
    ├── planning/
    │   ├── narrative-generation-prompt.md # Moved
    │   └── story-action-plan.md           # Instance for this story
    │   └── ... (other planning docs for this story)
    └── ...
```

**Summary of Recommended File Operations:**

1.  **Create directory:** `recursive-writing/planning/`
2.  **Move file:** `recursive-writing/narrative-generation-prompt.md` to `recursive-writing/wasteland-europa/planning/narrative-generation-prompt.md`
3.  **Move and Rename file:** `recursive-writing/story-action-plan.md` to `recursive-writing/shared-artifacts/story-action-plan-template.md`
4.  **Move file:** `recursive-writing/shared-tools/tools-brainstorm.md` to `recursive-writing/planning/tools-brainstorm.md`

**Further Considerations:**

*   **`story-index.csv`:** Clarify its role. If global, it's fine. If story-specific, consider moving instances to story `logs/` or `metadata/`.
*   **Scripts in `shared-tools/`:** Review `init-story.zsh` to align with the new template locations.
*   **Redundancy in `wasteland-europa/`:** Verify `wasteland-europa/timeline-template.md`. If it's an unmodified copy of the shared template, it might be redundant if `init-story.zsh` correctly places a working copy (e.g. as `timeline.md`) during setup.

This refactoring aims to make the `recursive-writing` system more organized and scalable.
