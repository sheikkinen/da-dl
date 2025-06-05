# Shared Artifacts

This directory contains templates and reusable resources for the recursive writing project.

## Character & Relationship Templates
- Character profile template (`character-template.md`) - Individual character development
- Character relationships template (`character-relationships-template.md`) - Mapping character connections and dynamics

## Story Structure Templates  
- Scene template (`scene-template.md`) - Basic scene planning
- Scene breakdown template (`scene-breakdown-template.md`) - Detailed scene analysis and development
- Plot outline template (`plot-template.md`) - Story arc planning
- Conflict template (`conflict-template.md`) - Developing tensions and oppositions

## World-Building Templates
- Location template (`location-template.md`) - Places, settings, and environments
- Faction template (`faction-template.md`) - Organizations, groups, and societies
- World-building template (`world-building-template.md`) - Comprehensive setting development
- Artifact description template (`artifact-template.md`) - Important objects and items

## Timeline & Progress
- Timeline template (`timeline-template.md`) - Chronological event tracking

## Usage with Tools
All templates can be used with the `copy_template.mjs` tool:

```bash
# Available template types:
node copy_template.mjs character <target-dir> <name> [datetime]
node copy_template.mjs scene <target-dir> <name> [datetime]
node copy_template.mjs plot <target-dir> <name> [datetime]
node copy_template.mjs artifact <target-dir> <name> [datetime]
node copy_template.mjs location <target-dir> <name> [datetime]
node copy_template.mjs faction <target-dir> <name> [datetime]
node copy_template.mjs relationships <target-dir> <name> [datetime]
node copy_template.mjs world <target-dir> <name> [datetime]
node copy_template.mjs breakdown <target-dir> <name> [datetime]
node copy_template.mjs conflict <target-dir> <name> [datetime]
```

Add new templates as needed and reference them from story-specific planning documents and tools. All templates are designed for programmatic and manual use in agentic workflows.
