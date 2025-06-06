# Story Action Plan

This file is for story-specific planning, coordination, and tracking within the recursive writing project.

## Usage
- Use this file to outline story arcs, assign tasks, and track progress for each story or major narrative thread.
- Reference templates and tools from `../shared-artifacts/` and `../shared-tools/` as needed. Read README files for details.
- Use the timeline template for chronological planning and update it programmatically as needed.
- Leverage agentic tools (keyword search, inspiration picker, timeline entry, etc.) to support ideation and structure.
- Log major planning actions and decisions for traceability.

## Inilialization
- [ ] Prompt author for story-name, genre, description - if not provided already
- [ ] Run ../shared-tools/init-story.zsh and check contents of directory story-name. It should contain updated version of this file.
- [ ] Extract and brainstorm keywords 
- [ ] Run node ../shared-tools/keyword_search.mjs <keyword> for inspiration
- [ ] Use node copy_template.mjs <template-type> <target-dir> <name> [datetime] to initialize characters, plots, locations and artifacts, 
- [ ] Create story-name/planning folder and place all general planning documents there like world-description, progress-notes etc.
- [ ] Run keyword-search from time to time to get new insights
- [ ] Iterate the timeline and create subplots and plots documents

## Scene creation
- [ ] Aften comfortable with subplots, characters, timeline, create a detailed scenes-timeline from the timeline
- [ ] Copy Scene template using copy_template.mjs for each scene
- [ ] Fill the template for each scene  

## Creating the final text
- [ ] Create narrative subfolder
- [ ] For each scene, generate the full narrative  as separate file

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