# Story Action Plan: the-crimson-veil

- Author: Collaborative Author
- Genre: Epic Fantasy
- Description: A tale of war, political intrigue, and ancient magic inspired by Game of Thrones, Lord of the Rings, D&D, and Forgotten Realms

# Story Action Plan

This file is for story-specific planning, coordination, and tracking within the recursive writing project.

## Usage - Working Document
- **This story-action-plan.md serves as our primary coordination hub** for "The Crimson Veil"
- Use this file to track progress, update task status, and coordinate next steps
- Reference templates and tools from `../shared-artifacts/` and `../shared-tools/` as needed
- All major planning documents are in the `planning/` folder for detailed work
- Use the timeline template for chronological planning and update it programmatically as needed
- Leverage agentic tools (keyword search, inspiration picker, timeline entry, etc.) to support ideation and structure
- **Update task checkboxes as we complete work together**
- Log major planning actions and decisions for traceability

## Initialization
- [x] Prompt author for story-name, genre, description - "The Crimson Veil" established
- [x] Run ../shared-tools/init-story.zsh and check contents of directory - project structure created
- [x] Extract and brainstorm keywords - core concepts documented in planning/core-concepts.md
- [x] Create planning folder and place general planning documents - world-overview.md, conflict templates created
- [x] Initialize initial templates - world, conflict, faction, and location templates copied
- [x] Establish central conflict - "The War of the Crimson Veil" defined
- [x] **Multi-century historical timeline completed** - 960 years of detailed history
- [x] **Location templates created for all major kingdoms** - 8 primary states established
- [x] Iterate the timeline and create subplots and plots documents - **NEXT MAJOR STEP**
- [ ] Run node ../shared-tools/keyword_search.mjs <keyword> for inspiration (when keyword database available)

## Scene creation
- [ ] Aften comfortable with subplots, characters, timeline, create a detailed scenes-timeline from the timeline
- [ ] Copy Scene template using copy_template.mjs for each scene
- [ ] Fill the template for each scene  

## Creating the final text
- [ ] Create narrative subfolder
- [ ] For each scene, generate the full narrative  as separate file

## Following the Progress

Check contents of timeline-template.md and logs/*.log. Update timeline entries as seen fit, but keep the structure. Add entries to the log when not using the tools.

## First Story Generation Plan 🎯

**Objective**: Create the first narrative story within the established "Crimson Veil" universe by selecting a focused time period, geographic location, and thematic focus, then re-running project initialization for targeted story development.

### Phase 1: Story Focus Selection
- [ ] **Select Historical Time Period** 
  - [ ] Review 960-year timeline to identify compelling story periods
  - [ ] **Option A**: Ancient Era (100-300 AV) - Kingdom formation, elder race conflicts
  - [ ] **Option B**: Warring States Period (400-600 AV) - Fragmentation, border conflicts, military culture rise
  - [ ] **Option C**: Imperial Consolidation (650-750 AV) - Mongol-inspired conquests, nomadic invasions
  - [ ] **Option D**: Religious Wars Era (750-850 AV) - Crusades-like conflicts, holy orders, theocratic power
  - [ ] **Option E**: Current Crisis (940-960 AV) - War of the Crimson Veil, character interactions
  - [ ] **DECISION POINT**: Choose 1-2 decade focused time window within selected era

### Phase 2: Geographic & Character Focus Selection  
- [ ] **Select Primary Location(s)**
  - [ ] **Option A**: Regnum Aethermoor (Central kingdom) - Political intrigue, Holy Roman Empire parallel
  - [ ] **Option B**: Llyn Gwaed (Crimson Lake) - Mystical focus, supernatural phenomenon epicenter
  - [ ] **Option C**: Border Conflicts - Hraběství Havranji vs neighboring kingdoms
  - [ ] **Option D**: Naval/Trade Focus - République de Portlune maritime operations
  - [ ] **Option E**: Multi-kingdom Scope - Alliance negotiations and diplomatic missions
  - [ ] **DECISION POINT**: Choose 1-2 primary kingdoms as story setting

- [ ] **Select Character Subset**
  - [ ] Review 15 completed characters for time period relevance
  - [ ] Choose 3-5 primary characters for story focus (protagonist candidates)
  - [ ] Identify 2-3 secondary characters for supporting roles
  - [ ] Select 1-2 antagonist characters for conflict generation
  - [ ] **DECISION POINT**: Finalize character roster for focused story

### Phase 3: Thematic Focus Definition
- [ ] **Identify Core Story Theme**
  - [ ] **Political Intrigue**: Succession disputes, alliance negotiations, betrayals
  - [ ] **Military Campaign**: Border conflicts, siege warfare, tactical battles  
  - [ ] **Mystical Investigation**: Crimson Veil phenomenon, magical artifacts, supernatural forces
  - [ ] **Character-Driven Drama**: Personal relationships, moral conflicts, character growth
  - [ ] **Historical Epic**: Multi-generational saga, dynastic struggles, cultural evolution
  - [ ] **DECISION POINT**: Choose 1 primary theme with 1-2 secondary themes

### Phase 4: New Story Project Initialization
- [ ] **Create Focused Story Directory**
  - [ ] Run `../shared-tools/init-story.zsh` with focused story name (e.g., "the-siege-of-aethermoor")
  - [ ] Establish new story project structure in `../[story-name]/`
  - [ ] Copy relevant universe templates to new story planning folder

- [ ] **Universe Cross-Reference Integration**
  - [ ] Create `universe-references/` folder in new story project
  - [ ] Copy relevant character files from `the-crimson-veil/characters/` 
  - [ ] Copy relevant location files from `the-crimson-veil/locations/`
  - [ ] Copy relevant artifact files from `the-crimson-veil/artifacts/`
  - [ ] Create timeline subset from consolidated `the-crimson-veil/timeline.md`

### Phase 5: Focused Story Action Plan Creation
- [ ] **Analyze New Story Structure**
  - [ ] Review generated project structure and templates
  - [ ] Identify story-specific planning requirements
  - [ ] Map focused story elements to universe context

- [ ] **Create Story-Specific Action Plan**
  - [ ] Copy `story-action-plan.md` template structure
  - [ ] Customize tasklist for focused story scope
  - [ ] Create story-specific timeline with detailed events for chosen time period
  - [ ] Establish character relationships within focused timeframe
  - [ ] Plan plot progression specific to chosen theme and location

- [ ] **Cross-Reference Documentation**
  - [ ] Link new story timeline to universe timeline.md
  - [ ] Reference character files in universe context
  - [ ] Create consistency checking between focused story and universe lore
  - [ ] Document how focused story fits within broader "Crimson Veil" narrative

### Phase 6: Story Development Pipeline
- [ ] **Plot & Scene Development**
  - [ ] Use established universe characters in focused story context  
  - [ ] Create story-specific plot threads using `../shared-artifacts/plot-template.md`
  - [ ] Develop scene-by-scene progression using `../shared-tools/copy_template.mjs`
  - [ ] Plan narrative arc with beginning, middle, end structure

- [ ] **Narrative Generation**
  - [ ] Create `narrative/` subfolder in focused story project
  - [ ] Generate full narrative text for each planned scene
  - [ ] Maintain consistency with universe lore and character backgrounds
  - [ ] Cross-reference events with consolidated timeline

**SUCCESS CRITERIA**: Completed focused story that:
- Uses established universe characters, locations, and lore
- Maintains consistency with "Crimson Veil" timeline and world-building  
- Demonstrates full story development pipeline from concept to narrative
- Serves as template for future stories within the universe

## Tasklist - The Crimson Veil Development

**Current Priority Tasks:**
- [x] Core world concept establishment
- [x] Central conflict definition (The War of the Crimson Veil)
- [x] Basic geography and political structure
- [x] **Define the nature of "The Crimson Veil" phenomenon** - Comprehensive definition created combining mystical and planar elements
- [x] **Consolidate timeline documents to timeline.md** ✅ COMPLETED - Timeline consolidation complete with 960-year chronology
- [x] **Assign characters to specific kingdoms/factions** ✅ COMPLETED - All 15 characters assigned with detailed political allegiances
- [x] **Execute First Story Generation Plan** 🎯 COMPLETED ✅ - Create focused story within universe
  - [x] **Selected**: 957-958 AV period, Regnum Aethermoor location, Political Intrigue theme
  - [x] **Protagonist Created**: Lady Lucretia Aurelia Corvina (court diplomat, political insider)
  - [x] **Story Framework**: Political maneuvering leading to War of Crimson Veil outbreak
  - [x] **Detailed Plot Points**: Complete political crisis timeline with specific diplomatic scenarios
  - [x] **Character Integration**: Connected protagonist with all existing universe characters
  - [x] **Story Delegation**: Created focused story project with proper cross-references
  - [x] **Project Structure**: Established `/stories/political-intrigue-957-958/` directory
  - [x] **Timeline Creation**: 18-month detailed timeline with character arc progression
  - [x] **Action Plan**: Story-specific development plan with phase breakdown
- [ ] **Develop Scene-by-Scene Narrative Structure** 🎯 NEXT PRIORITY - Create detailed scene breakdown
  - [ ] **Act I Scene Development**: Early 957 AV diplomatic introduction scenes
  - [ ] **Act II Scene Development**: Mid-late 957 AV political maneuvering scenes
  - [ ] **Act III Scene Development**: 958 AV crisis resolution and war preparation scenes
  - [ ] **Character Arc Scenes**: Personal development moments for Lucretia
  - [ ] **Supporting Character Integration**: Scenes featuring Gareth, Cassius, Caelestis
  - [ ] **Location**: Develop within `/stories/political-intrigue-957-958/scenes/`
- [ ] **Develop Scene-by-Scene Narrative Structure** 🎯 NEXT ACTIVE PRIORITY 🎯
  - [ ] Create detailed scene breakdown for each major plot point
  - [ ] Plan character interactions and dialogue for key diplomatic moments
  - [ ] Establish narrative pacing and tension escalation
  - [ ] Design specific political intrigue scenarios and their resolutions
- [x] **Rewrite planning documents to reflect proper timeframe** - Update core documents with multi-century historical context
  - [x] **Update `planning/the-great-war.md`** - Incorporate War of the Crimson Veil into historical timeline context
  - [x] **Update `planning/world-overview.md`** - Reflect 960-year historical development and current state
  - [ ] **Incorporate the Great War events into main timeline** - Position current conflict within broader historical narrative
- [ ] **Develop main character archetypes and key figures** - Depends on character-faction assignments
- [ ] **Create detailed faction motivations and resources** - Depends on character-faction assignments
- [ ] **Establish magic system rules and limitations**

**World-Building Tasks:**
- [x] Basic geographic regions (Vaelthorne continent)
- [x] Major political powers identified
- [x] **Multi-century historical timeline development:**
  - [x] **Ancient Era**: Formation of first kingdoms, elder races dominance
  - [x] **Warring States Period**: Fragmentation, constant border conflicts, rise of military culture
  - [x] **Imperial Consolidation**: Mongol-inspired conquests, nomadic invasions from the steppes
  - [x] **Religious Wars Era**: Crusades-like holy wars, rise of militant religious orders
  - [x] **Papal States Influence**: Theocratic power struggles, church vs crown conflicts
  - [x] **Medieval Feudalism**: Knight culture, vassalage systems, castle-based warfare
  - [x] **Current Crisis**: Events leading to the War of the Crimson Veil
- [x] **Location templates created for major kingdoms** (8 primary states established)
- [x] **Replace English compound names with fantasy names based on European old languages**
  - [x] Convert character names, titles, and dynasties using authentic old European linguistic roots
  - [x] Base on Old English, Old Norse, Celtic languages, Latin, Proto-Germanic roots
  - [x] Maintain phonetic consistency within each cultural region/kingdom
  - [x] Create naming conventions guide for each kingdom's linguistic style
  - [x] Rename character files and remove old overlapping files
  - [x] **Convert location names** - All 8 major locations converted to authentic old European names:
    - Kingdom of Aethermoor → **Regnum Aethermoor** (Latin)
    - Drakmoor Holds → **Drakheimr** (Old Norse)
    - Sylvan Courts → **Tír na Síthe** (Old Irish)
    - Khanate of Goldenvale → **Altyngöl Khanlig** (Turkic)
    - Republic of Westport → **République de Portlune** (Norman-French)
    - March of Stormwind → **Kermorvan** (Breton)
    - County of Ravenshollow → **Hraběství Havranji** (Old Czech)
    - Lake Crimson → **Llyn Gwaed** (Welsh)
  - [x] **Created detailed location files** with authentic cultural content and story connections
  - [x] **Removed old English compound location files** to avoid confusion
- [x] **Fill Regnum Aethermoor template** (Central kingdom - Holy Roman Empire parallel)
  - Capital, major cities, geography, culture, current political situation
- [x] **Fill Drakheimr template** (Northern dwarven territories - Swiss Cantons parallel)
  - Underground cities, mining operations, military traditions, isolation policies
- [x] **Fill Tír na Síthe template** (Eastern elven realm - Celtic Kingdoms parallel)
  - Mystical governance, seasonal courts, magical traditions, withdrawal from human affairs
- [x] **Fill Altyngöl Khanlig template** (Southern nomadic state - Golden Horde parallel)
  - Nomadic culture, horse breeding, military tactics, integration with settled peoples
- [x] **Fill République de Portlune template** (Western merchant republic - Maritime Republic parallel)
  - Democratic governance, naval power, trade networks, guild politics
- [x] **Fill Kermorvan template** (Northwestern coastal - Norman territories parallel)
  - Coastal fortifications, maritime culture, military traditions
- [x] **Fill Hraběství Havranji template** (Northeastern border - Polish duchies parallel)
  - Border conflicts, defensive strategies, cultural mixing
- [x] **Fill Llyn Gwaed template** (Epicenter of supernatural phenomenon)
  - Mysterious properties, historical significance, current supernatural effects
- [ ] Detailed kingdom/faction relationships
- [ ] Economic systems and trade routes
- [ ] Religious pantheons and belief systems
- [ ] Racial cultures and their roles in the conflict
- [ ] Historical events leading to current crisis
- [x] **Update planning documents with historical context** - Reflect multi-century development in core documents
- [x] **Create README-style file mapping section** - Replace current Document References with organized project structure documentation
  - [x] Organize files by function (Planning, Characters, Locations, Timeline, etc.)
  - [x] Add brief descriptions of each file's purpose and content
  - [x] Include status indicators (completed, in-progress, pending)
  - [x] Create logical groupings with clear navigation structure
  - [x] Add cross-references between related documents

**Story Structure Tasks:**
- [x] **Create comprehensive historical timeline spanning several centuries** 
  - [x] Base on Warring States period (fragmented kingdoms, constant warfare)
  - [x] Medieval European influences (feudalism, knightly orders, papal authority)
  - [x] Mongol Horde inspirations (nomadic invasions, empire building)
  - [x] Crusades elements (religious wars, holy orders, territorial conflicts)
  - [x] Papal States concepts (theocratic power, religious politics)
- [ ] **Consolidate timeline documents into main timeline.md** 🔥 HIGH PRIORITY 🔥
  - [ ] **Phase 1: Content Merger**
    - [ ] Read and analyze `planning/detailed-historical-timeline.md` (960 years of structured history)
    - [ ] Extract key events, dates, and character actions from detailed timeline
    - [ ] Integrate `planning/historical-timeline-framework.md` era structure (Ancient, Warring States, Imperial, Religious Wars, Feudal, Current Crisis)
    - [ ] Cross-reference character birth dates and major life events (720-900 AV span)
  - [ ] **Phase 2: Format Conversion**
    - [ ] Convert narrative timeline into structured tabular format for timeline.md
    - [ ] Create standardized entry format: Year | Era | Event | Characters Involved | Locations | Significance
    - [ ] Ensure chronological ordering and consistent date references
    - [ ] Update all location and character references to use new authentic names
  - [ ] **Phase 3: Current Events Integration**
    - [ ] Add recent events (Crimson Veil appearance, character actions leading to war)
    - [ ] **Incorporate War of the Crimson Veil into timeline** - Position current conflict as culmination of historical forces
    - [ ] Create clear progression from historical events to current crisis (940-960 AV)
    - [ ] Link character motivations to historical precedents and family legacies
  - [ ] **Phase 4: Cleanup & Validation**
    - [ ] Validate timeline consistency and eliminate contradictions
    - [ ] Remove redundant timeline files after successful consolidation
    - [ ] Update cross-references in planning documents to point to consolidated timeline.md
- [x] **Revise timeline to spread characters across wider timespan** ✅
  - [x] Redistribute character birth dates across multiple centuries (720-900 AV span instead of 900-940 AV concentration)
  - [x] Create multi-generational character relationships (mentors, students, descendants)
  - [x] Generate rich historical depth with characters influencing different eras
  - [x] Develop potential prophecies about characters yet to come (established philosophical lineages)
  - [x] Establish character lineages and family dynasties spanning generations
  - [x] Create historical character legends that influence current war participants
- [x] **Double-check artifacts against historical counterparts** ✅
  - [x] Verify each character has artifacts matching their historical inspiration's major works
  - [x] Cross-reference character artifacts with real historical writings and items
  - [x] Ensure completeness of artifact collection for all 15 characters (completed with 4 missing artifacts created)
  - [x] Add missing artifacts for any character lacking signature items (Art of War Manual, Code of Honor Scroll, Human Nature Treatise, Institutional Design Manual)
  - [x] Validate artifact authenticity against historical records and achievements
- [ ] **Timeline of major events** (reference `timeline-template.md`)
- [ ] **Integrate War of the Crimson Veil into historical narrative** - Position current conflict within broader timeline
- [ ] **Main plot arc outline**
- [ ] **Key character journey planning**
- [ ] **Major plot points and turning points**
- [ ] **Scene planning and story beats**

**Character Development:**
- [x] **Identify major historical figures for character inspiration:**
  - **Political/Strategic**: Machiavelli (The Prince), Sun Tzu (Art of War), Julius Caesar, Alexander the Great
  - **Religious/Crusades Era**: Pope Urban II, Saladin, Richard the Lionheart, Bernard of Clairvaux
  - **Medieval/Feudal**: William Marshal, Eleanor of Aquitaine, Thomas Becket, Frederick Barbarossa
  - **Mongol Era**: Genghis Khan, Subutai, Jebe, Ögedei Khan
  - **Warring States**: Qin Shi Huang, Zhuge Liang, Cao Cao, Liu Bei
- [x] **Create character templates for major historical inspirations** - 15 templates completed (7 Western + 8 Eastern)
- [x] **Establish naming conventions** - Authentic Old European linguistic roots (Germanic, Latin, Celtic/Welsh, Old Norse, Anglo-Saxon) ✅
- [x] **Fill Machiavelli-inspired character template** - Valdric Thorasson (Forest-ruler, son of Thora) completed
- [x] **Fill Julius Caesar-inspired character template** - Cassius Ferox (Empty/Vain + Fierce/Wild) completed  
- [x] **Fill Eleanor-inspired character template** - Lady Morwenna verch Bran (Sea-maiden, daughter of Bran/Raven) completed
- [x] **Fill Pope Urban-inspired character template** - Aldric Magnus (Old-ruler + Great) completed
- [x] **Fill Confucius-inspired character template** - Aldwin ap Gruffydd (Old-friend, son of Gruffydd) completed
- [x] **Fill Zhuge Liang-inspired character template** - Caelestis Stellarum (Heavenly + Of the Stars) completed
- [x] **Fill Lao Tzu-inspired character template** - Osric Nebelhart (God-ruler + Mist-hard) completed
- [x] **Fill Sun Tzu-inspired character template** - Godwin Ælfredson (God-friend, son of Ælfred) completed
- [x] **Fill Saladin-inspired character template** - Brennos mac Cuinn (King/Prince, son of Conn/Wisdom) completed
- [x] **Fill Genghis Khan-inspired character template** - Ragnar Bjornsson (Warrior/Judgment, Bear's son) completed
- [x] **Fill Qin Shi Huang-inspired character template** - Theodoricus Ferrum (People-ruler + Iron) completed
- [x] **Fill Cao Cao-inspired character template** - Edric Umbrarum (Prosperity-ruler + Of Shadows) completed
- [x] **Fill Liu Bei-inspired character template** - Gareth Aurelius (Gentle/Firm + Golden) completed
- [x] **Fill Mencius-inspired character template** - Cedric Benignus (War-ruler + Kind/Benevolent) completed
- [x] **Fill Xunzi-inspired character template** - Dunstan Prudentius (Hill-stone + Wise/Prudent) completed
- [x] **Add names to remaining character templates:**
  - Sun Tzu → Godwin Ælfredson (God-friend, son of Ælfred)
  - Saladin → Brennos mac Cuinn (King/Prince, son of Conn/Wisdom)
  - Qin Shi Huang → Theodoricus Ferrum (People-ruler + Iron)  
  - Cao Cao → Edric Umbrarum (Prosperity-ruler + Of Shadows)
  - Liu Bei → Gareth Aurelius (Gentle/Firm + Golden)
  - Mencius → Cedric Benignus (War-ruler + Kind/Benevolent)
  - Genghis Khan → Ragnar Bjornsson (Warrior/Judgment, Bear's son)
- [x] **Rename all characters with fantasy/old European compound names**
  - [x] Replaced all current character names with authentic old European linguistic roots
  - [x] Used Old English, Old Norse, Celtic/Welsh, Latin, Anglo-Saxon etymologies
  - [x] Ensured names do NOT hint at historical character origins
  - [x] Created phonetically consistent naming patterns for each cultural region/kingdom
  - [x] Renamed character template files to match new character names
  - [x] Updated cross-references in planning documents
  - [x] Removed old overlapping character files
- [x] **Complete remaining character template details:**
  - [x] Finished Aldric Magnus (relationships, backstory, role in war)
  - [x] Finished Osric Nebelhart (backstory, abilities, war role)
  - [x] Complete Godwin Ælfredson template
  - [x] Complete Brennos mac Cuinn template
  - [x] Complete Ragnar Bjornsson template
  - [x] Complete Theodoricus Ferrum template
  - [x] Complete Edric Umbrarum template
  - [x] Complete Caelestis Stellarum template
  - [x] Complete Gareth Aurelius template (Liu Bei-inspired)
  - [x] Complete Cedric Benignus template (Mencius-inspired)
  - [x] Complete Dunstan Prudentius template (Xunzi-inspired)
- [x] **Create character artifacts mimicking their historical inspirations** using artifact template system ✅
  - [x] **Strategic treatises** from military/political strategists (Art of War Manual, Mirror of Princes)
  - [x] **Religious texts and proclamations** from religious leaders (Sacred Seal of Eternal Flame)
  - [x] **Philosophical works** from wisdom figures (Human Nature Treatise, Philosopher's Staff of Wisdom)
  - [x] **Military manuals and tactical guides** from commanders (Eagle Standard, Stormfang Runesword)
  - [x] **Political manifestos and governmental reforms** from rulers (Crimson Crown, Institutional Design Manual)
  - [x] **Literary works** from cultural figures (Academy Codex, Code of Honor Scroll)
  - [x] Created 15 artifacts total using `../shared-artifacts/artifact-template.md` structure
  - [x] All artifacts have fantasy names adapted to "The Crimson Veil" world context
  - [x] Each artifact matches historical inspiration's major works and achievements
- [x] **All 15 character templates completed** with authentic Old European names and detailed backgrounds ✅
- [x] **Assign characters to specific kingdoms/factions** ✅ COMPLETED - All 15 characters assigned with detailed political allegiances
  - [x] **Phase 1: Kingdom Distribution Analysis** ✅ COMPLETED
    - [x] Reviewed 8 established kingdoms and their cultural/political characteristics
    - [x] Mapped character backgrounds to appropriate cultural territories 
    - [x] Ensured balanced representation across all major kingdoms
    - [x] Considered character historical inspirations when assigning cultural affiliations
  - [x] **Phase 2: Political Allegiance Assignment** ✅ COMPLETED
    - [x] Assigned characters to Loyalist Coalition (5), Usurper Alliance (4), Neutral Powers (3), Philosophical Influencers (3)
    - [x] Created political allegiance matrix showing faction loyalties
    - [x] Established neutral characters and flexible alliance makers
    - [x] Documented character reasoning for their chosen side in the War of the Crimson Veil
  - [x] **Phase 3: Relationship Network Creation** ✅ COMPLETED
    - [x] Mapped character relationships with brotherhood bonds, intellectual networks, military alliances
    - [x] Created multi-generational connections based on 720-900 AV character spread
    - [x] Established philosophical correspondence networks and political marriage negotiations
    - [x] Documented three major relationship networks: Brotherhood, Intellectual, Military
  - [x] **Phase 4: Faction Resource & Motivation Documentation** ✅ COMPLETED
    - [x] Documented each faction's military capabilities, economic resources, political influence
    - [x] Created faction-specific motivations and strategic objectives
    - [x] Assigned territorial control and resource bases to each faction
    - [x] Detailed faction interaction patterns and alliance structures
- [ ] **Develop character relationship networks** (alliances, conflicts, personal bonds)
- [ ] **Identify protagonist candidates** from completed character roster
- [ ] Protagonist(s) - rightful heir, war leader, mage, etc.
- [ ] Primary antagonist(s) - usurper, veil cultist leader, etc.
- [ ] Supporting cast - advisors, generals, spies, common folk
- [ ] Character relationships and conflicts
- [ ] Character arcs and growth trajectories
- [ ] Protagonist(s) - rightful heir, war leader, mage, etc.
- [ ] Primary antagonist(s) - usurper, veil cultist leader, etc.
- [ ] Supporting cast - advisors, generals, spies, common folk
- [ ] Character relationships and conflicts
- [ ] Character arcs and growth trajectories

**Interconnections:**
- [x] Basic character factions established
- [x] Key locations identified (Lake Crimson, major regions)
- [x] **Location templates created for all major kingdoms** (8 primary states)
- [ ] Artifacts of power and their significance
- [ ] How the Crimson Veil affects different characters/locations
- [ ] Political marriages, alliances, and betrayals

**Open Questions/Blockers:**
- [x] ~~**What exactly IS the Crimson Veil?**~~ - **RESOLVED** - Comprehensive definition created combining mystical and planar elements
- [ ] Point-of-view structure (single vs multiple POV characters)
- [ ] Tone balance (political realism vs epic fantasy)
- [ ] Magic system complexity level
- [ ] Story length and structure (single book vs series)

**Tooling/Automation Needs:**
- [ ] **Fantasy name generation system** - European old language name converter
  - Old English, Old Norse, Celtic, Latin, Proto-Germanic language bases
  - Phonetic consistency rules for each kingdom/cultural region
  - Name conversion mapping from current English compounds
- [ ] **Historical timeline management** - Multi-century chronology with major eras
- [ ] Timeline management for complex political events
- [ ] Character relationship tracking
- [ ] Consistency checking for world-building elements
- [ ] Scene planning tools for multiple POV characters
- [ ] Dynasty and succession tracking across centuries
- [ ] Religious order and faction evolution over time


# Project File Structure & Navigation

## 📋 Project Overview
- **`README.md`** ✅ - Project introduction and basic information  
- **`story-action-plan.md`** ✅ - Primary coordination hub and task tracking (this document)
- **`timeline.md`** ✅ - Master chronological timeline and events

## 📚 Core Planning Documents
**Status: Completed** | **Location: `planning/`**
- **`core-concepts.md`** ✅ - Primary inspirations, themes, and foundational concepts
- **`world-overview.md`** ✅ - Comprehensive world guide (geography, politics, culture, 960-year history)
- **`the-great-war.md`** ✅ - Central conflict documentation (War of the Crimson Veil)
- **`crimson-veil-phenomenon.md`** ✅ - Detailed explanation of the central magical phenomenon
- **`development-status.md`** ✅ - Current progress tracking and next steps

**Historical Context:**
- **`detailed-historical-timeline.md`** ✅ - Complete 960-year timeline with specific dates and events
- **`historical-timeline-framework.md`** ✅ - Multi-century historical development structure
- **`historical-character-inspirations.md`** ✅ - Real historical figures inspiring characters

**Brainstorming & Research:**
- **`crimson-veil-brainstorm.md`** ✅ - Multiple interpretations of the central phenomenon
- **`fantasy-naming-conventions.md`** ✅ - Linguistic guide for authentic old European names
- **`fantasy-name-replacement-plan.md`** ✅ - Character and location name conversion strategy

## 👥 Characters & Factions  
**Status: 15/15 Characters Completed** | **Location: `characters/`**

**Faction Coalitions:**
- **`loyalist-coalition.md`** ✅ - Faction supporting rightful succession
- **`usurper-alliance.md`** ✅ - Faction backing the coup attempt

**Individual Characters (Old European Authentic Names):**
- **`valdric-thorasson-strategist.md`** ✅ - Political strategist (Germanic tradition)
- **`cassius-ferox-commander.md`** ✅ - Military commander (Roman tradition)  
- **`morwenna-verch-bran-matriarch.md`** ✅ - Political matriarch (Welsh tradition)
- **`aldric-magnus-hierophant.md`** ✅ - Religious leader (Germanic-Latin tradition)
- **`brennos-mac-cuinn-commander.md`** ✅ - Noble commander (Gaulish tradition)
- **`ragnar-bjornsson-conqueror.md`** ✅ - Nomadic conqueror (Old Norse tradition)
- **`godwin-ælfredson-strategist.md`** ✅ - Military philosopher (Anglo-Saxon tradition)
- **`aldwin-ap-gruffydd-philosopher.md`** ✅ - Moral philosopher (Anglo-Saxon-Welsh tradition)
- **`caelestis-stellarum-advisor.md`** ✅ - Strategic advisor (Latin tradition)
- **`osric-nebelhart-sage.md`** ✅ - Natural philosopher (Anglo-Saxon-Germanic tradition)
- **`theodoricus-ferrum-emperor.md`** ✅ - Historical emperor (Gothic-Latin tradition)
- **`edric-umbrarum-warlord.md`** ✅ - Pragmatic warlord (Anglo-Saxon-Latin tradition)
- **`gareth-aurelius-prince.md`** ✅ - Righteous claimant (Welsh-Latin tradition)
- **`cedric-benignus-humanist.md`** ✅ - Moral reformer (Celtic-Latin tradition)
- **`dunstan-prudentius-pragmatist.md`** ✅ - Institutional reformer (Anglo-Saxon-Latin tradition)

## 🏰 World Locations
**Status: 8/8 Major Locations Completed** | **Location: `locations/`**

**Political Territories (Authentic Old European Names):**
- **`regnum-aethermoor.md`** ✅ - Central kingdom (Holy Roman Empire parallel)
- **`drakheimr.md`** ✅ - Northern dwarven holds (Swiss Cantons parallel)
- **`tir-na-sithe.md`** ✅ - Eastern elven realm (Celtic Kingdoms parallel)
- **`altyngol-khanlig.md`** ✅ - Southern nomadic khanate (Golden Horde parallel)
- **`republique-de-portlune.md`** ✅ - Western merchant republic (Maritime Republic parallel)
- **`kermorvan.md`** ✅ - Northwestern coastal march (Norman territories parallel)
- **`hrabestvi-havranji.md`** ✅ - Northeastern border county (Polish duchies parallel)

**Mystical Locations:**
- **`llyn-gwaed.md`** ✅ - Crimson Lake epicenter (Welsh: Lake of Blood)

## ⚔️ Artifacts & Magic Items
**Status: 15/15 Artifacts Completed** | **Location: `artifacts/`**

**Character-Specific Artifacts:**
- **`philosophers-staff-wisdom.md`** ✅ - Master Chen's Confucian teaching tool
- **`celestial-astrolabe-strategic-timing.md`** ✅ - Luo Mingzhi's tactical instrument
- **`eagle-standard-solarian-legion.md`** ✅ - Marcus Aurelius's military banner
- **`raven-seal-diplomacy.md`** ✅ - Lady Isadora's diplomatic seal
- **`mirror-of-princes.md`** ✅ - Niccolò's political manual
- **`sacred-seal-eternal-flame.md`** ✅ - Urban Magnus's religious authority
- **`academy-codex-five-virtues.md`** ✅ - Master Dao's philosophical text
- **`stormfang-runesword-north.md`** ✅ - Khan Temujin's ancestral blade
- **`art-of-war-manual.md`** ✅ - General Sun's tactical guide
- **`aurelius-diadem-righteous-rule.md`** ✅ - Emir Salah's crown of justice
- **`crimson-crown-unification.md`** ✅ - Emperor Qin's imperial crown
- **`shadow-cloak-umbrarum.md`** ✅ - Lord Cao's stealth artifact
- **`code-of-honor-scroll.md`** ✅ - Prince Liu's moral code
- **`human-nature-treatise.md`** ✅ - Master Meng's philosophical work
- **`institutional-design-manual.md`** ✅ - Master Xunzi's governance guide

## 📖 Story Structure
**Status: Planning Phase** | **Location: Multiple**

**Timeline Management:**
- **`timeline.md`** ✅ - Master timeline with key events and character actions

**Plot Development:**
- **`plots/`** 📝 - Individual plot threads and subplots (pending development)
- **`scenes/`** 📝 - Scene-by-scene planning templates (pending development)

**Narrative Planning:**
- **`character-renaming-plan.md`** ✅ - Historical name conversion documentation
- **`rename-characters.sh`** ✅ - Automated renaming script

## 🔧 Project Management
**Status: Operational** | **Location: Multiple**

**Development Tracking:**
- **`logs/the-crimson-veil.log`** ✅ - Automated tool logging and development history
- **`status-logs/`** ✅ - Development milestone tracking
- **`universe-bible-updates/`** ✅ - World consistency documentation

**Development Tools:**
- **`../shared-tools/`** ✅ - Automation scripts (timeline, keyword search, template copying)
- **`../shared-artifacts/`** ✅ - Template library (character, location, conflict templates)

## 📝 Documentation & Reference
**Analysis & Summaries:**
- **`../thinking/summary-*.md`** ✅ - Development session summaries and progress tracking

**Cross-References:**
- Character artifacts link to individual character files
- Locations reference historical timeline events
- Planning documents cross-reference character assignments
- Timeline integrates with all character and location files

---

## 🎯 Quick Navigation by Development Phase

**✅ COMPLETED SECTIONS:**
- Core world-building and planning documentation
- All 15 character profiles with authentic historical names
- All 8 major world locations with cultural depth
- Complete artifact collection with character connections
- 960-year historical timeline with major events

**📝 IN PROGRESS:**
- Timeline consolidation into main timeline.md (HIGH PRIORITY - blocks story development)
- Character assignment to kingdoms/factions (HIGH PRIORITY - required for plot development)
- Integration of Great War events into broader timeline
- First story generation plan execution (NEW PRIORITY - demonstrate story pipeline)

**⏳ PENDING DEVELOPMENT:**
- Plot thread development (depends on timeline consolidation and character assignments)
- Scene-by-scene planning (depends on focused story selection)
- Narrative writing phase (depends on completed story structure)

# IMPORTANT - Working Principles

- **This document is our active collaboration hub** - update it as we make decisions
- Keep tasklist up to date - don't start a task unless it's documented and agreed upon
- Don't start writing actual narrative before plots, timeline and scene synopses are complete
- Always plan potential for helper tools before solving a task
- **Make collaborative decisions on major story elements** (like the nature of the Crimson Veil)
- **Bold items in tasklist indicate priority decisions needed**
- *Add document references to this document*