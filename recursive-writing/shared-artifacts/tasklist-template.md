# Tasklist

## Initialization (Foundation Phases 1-5)

- [ ] **Phase 1**: Extract and brainstorm keywords for universe research
- [ ] Run node ../shared-tools/keyword_search.mjs <keyword> for inspiration
- [ ] Fill in ./world.md
- [ ] **Phase 2**: Use node copy_template.mjs <template-type> <target-dir> <name> [world-datetime] to initialize characters, plots, locations and artifacts
- [ ] Create story-name/planning folder and place all general planning documents there like world-description, progress-notes etc.
- [ ] **Phase 3**: Run keyword-search from time to time to get new insights
- [ ] **Phase 4**: Iterate the timeline and create subplots and plots documents
- [ ] **Phase 5**: Construct the initial ./summaries/story-skeleton.md from the created materials. 

## Scene Creation (Development Phases 6-8)
- [ ] **Phase 6**: After comfortable with subplots, characters, timeline, ensure character files and plot thread files are complete
- [ ] **Phase 7**: Create a detailed timeline with initial sketches for scenes
- [ ] Copy Scene template using copy_template.mjs for each scene
- [ ] **Phase 8**: Fill the template for each scene with detailed beats and specifications  

## Creating the Final Text (Narrative Phases 9-14)

- [ ] **Phase 9**: Complete quality review and universe integration validation. Check timeline, plots, characters, world.
- [ ] **Phase 10**: Create narrative subfolder with chapter structure and priority analysis
- [ ] **Phase 11**: For priority scenes, generate full narrative chapters
- [ ] **Phase 12**: For remaining scenes, generate the full narrative as separate files
- [ ] **Phase 13**: Iterate thru scenes and create profile files for any character or location added. Update timeline.
- [ ] **Phase 14**: Final quality validation and cross-reference synchronization
    - [ ] Check for duplicated text using `../shared-tools/checkSimilarity.mjs` using a custom script for cross chapter analysis

## 📚 POST-COMPLETION ENHANCEMENT TASKS
### Chapter Summary Creation Task 
- [ ] **Create Summaries Folder** - Establish `summaries/` directory for chapter summary files
- [ ] **Chapter Summary Generation** - Read each of the narrative chapters and create individual summary files
- [ ] **Keywords and Refence Images** - Extract keywords from the summary and rerun ../shared-tools/keyword_search.mjs. Select a reference image and provide an image generation prompt for the chapter.
- [ ] **Complete Story Summary** - Create comprehensive whole story summary file.
