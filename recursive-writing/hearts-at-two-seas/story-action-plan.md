# Story Action Plan: hearts-at-two-seas

- Author: Hearts at Two Seas
- Genre: Harlequin romance
- Description: Harlequin style romance with action and very sensual descriptions between multiple persons. Some sadness - crying over long lost love (e.g. roses and grave). Typical story of a Finnish woman finding the love of her life. Location: San Pedro del Pinatar, Spain.

# Story Action Plan

This file is for story-specific planning, coordination, and tracking within the recursive writing project.

## Usage
- Use this file to outline story arcs, assign tasks, and track progress for each story or major narrative thread.
- Reference templates and tools from `../shared-artifacts/` and `../shared-tools/` as needed. Read README files for details.
- Use the timeline template for chronological planning and update it programmatically as needed.
- Leverage agentic tools (keyword search, inspiration picker, timeline entry, etc.) to support ideation and structure.
- Log major planning actions and decisions for traceability.

## Initialization
- [x] Prompt author for story-name, genre, description - if not provided already
- [x] Run ../shared-tools/init-story.zsh and check contents of directory story-name. It should contain updated version of this file.
- [x] Extract and brainstorm keywords 
- [x] Run node ../shared-tools/keyword_search.mjs <keyword> for inspiration
- [x] Use node copy_template.mjs <template-type> <target-dir> <name> [datetime] to initialize characters, plots, locations and artifacts, 
- [x] Create story-name/planning folder and place all general planning documents there like world-description, progress-notes etc.
- [x] Run keyword-search from time to time to get new insights
- [x] Iterate the timeline and create subplots and plots documents

## Scene creation
- [x] After comfortable with subplots, characters, timeline, create a detailed scenes-timeline from the timeline
- [x] Copy Scene template using copy_template.mjs for each scene
- [ ] Fill the template for each scene (4 of 15+ scenes completed)

## Creating the final text
- [ ] Create narrative subfolder
- [ ] For each scene, generate the full narrative as separate file

## Following the Progress

Check contents of timeline-template.md and logs/*.log. Update timeline entries as seen fit, but keep the structure. Add entries to the log when not using the tools.

## Tasklist

Add your story-specific planning in the tasklist, tasklist-template.md :

- [ ] Story arc outlines
- [ ] Key character journeys
- [ ] Major plot points
- [ ] Scene planning
- [ ] Interconnections (characters, locations, artifacts)
- [ ] Timeline milestones (reference `timeline-template.md`)
- [ ] Open questions / blockers
- [ ] Tooling/automation needs for this story

# IMPORTANT

Keep tasklist up to date - don't start a task unless it's documented by you on the tasklist.
Don't start writing actual narrative before plots, timeline and scene synopses are complete.
Always plan potential for helper tools before solving a task