#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Character Involvement Analyzer
 * Analyzes all scenes to generate character presence and plot involvement data
 */

class CharacterInvolvementAnalyzer {
    constructor(projectPath) {
        this.projectPath = projectPath;
        this.characters = [];
        this.plots = [];
        this.scenes = [];
        this.involvementMatrix = {};
    }

    // Load character names from character files
    loadCharacters() {
        const charactersPath = path.join(this.projectPath, 'characters');
        if (!fs.existsSync(charactersPath)) return;

        const characterFiles = fs.readdirSync(charactersPath).filter(f => f.endsWith('.md'));
        this.characters = characterFiles.map(f => path.basename(f, '.md'));
        console.log(`📋 Found ${this.characters.length} characters:`, this.characters);
    }

    // Load plot names from plot files
    loadPlots() {
        const plotsPath = path.join(this.projectPath, 'plots');
        if (!fs.existsSync(plotsPath)) return;

        const plotFiles = fs.readdirSync(plotsPath).filter(f => f.endsWith('.md'));
        this.plots = plotFiles.map(f => path.basename(f, '.md'));
        console.log(`📊 Found ${this.plots.length} plots:`, this.plots);
    }

    // Load and analyze scene files
    analyzeScenes() {
        const scenesPath = path.join(this.projectPath, 'scenes');
        if (!fs.existsSync(scenesPath)) return;

        const sceneFiles = fs.readdirSync(scenesPath).filter(f => f.endsWith('.md'));
        
        for (const sceneFile of sceneFiles) {
            const sceneContent = fs.readFileSync(path.join(scenesPath, sceneFile), 'utf8');
            const sceneData = this.parseSceneContent(sceneContent, sceneFile);
            this.scenes.push(sceneData);
        }

        console.log(`🎬 Analyzed ${this.scenes.length} scenes`);
    }

    // Parse scene content to extract character and plot involvement
    parseSceneContent(content, filename) {
        const lines = content.split('\n');
        let sceneData = {
            filename: filename,
            title: '',
            date: '',
            characters: [],
            plots: [],
            characterRoles: {},
            plotElements: {}
        };

        // Extract basic scene info
        for (const line of lines) {
            if (line.startsWith('# Scene')) {
                sceneData.title = line.replace('# ', '');
            } else if (line.includes('Scene Title/ID:')) {
                const nextLineIndex = lines.indexOf(line) + 1;
                if (nextLineIndex < lines.length) {
                    sceneData.date = this.extractDate(lines[nextLineIndex]);
                }
            } else if (line.startsWith('## Main Characters Present:')) {
                // Extract characters from the next few lines
                const startIndex = lines.indexOf(line) + 1;
                for (let i = startIndex; i < lines.length; i++) {
                    if (lines[i].startsWith('##')) break;
                    if (lines[i].trim() && lines[i].startsWith('- ')) {
                        const characterMatch = lines[i].replace('- ', '').split('(')[0].trim();
                        sceneData.characters.push(characterMatch);
                    }
                }
            } else if (line.startsWith('## References to plots')) {
                // Extract plot references
                const startIndex = lines.indexOf(line) + 1;
                for (let i = startIndex; i < lines.length; i++) {
                    if (lines[i].startsWith('##')) break;
                    if (lines[i].trim() && lines[i].startsWith('- ')) {
                        const plotText = lines[i].replace('- ', '');
                        const plotMatch = this.matchPlotName(plotText);
                        if (plotMatch) {
                            sceneData.plots.push(plotMatch);
                            sceneData.plotElements[plotMatch] = plotText.split(':')[1]?.trim() || '';
                        }
                    }
                }
            }
        }

        // Analyze character involvement depth
        this.analyzeCharacterRoles(content, sceneData);

        return sceneData;
    }

    // Extract date from scene title
    extractDate(text) {
        const dateMatch = text.match(/(\w+ \d+)/);
        return dateMatch ? dateMatch[1] : '';
    }

    // Match plot references to actual plot names
    matchPlotName(plotText) {
        for (const plot of this.plots) {
            if (plotText.toLowerCase().includes(plot.toLowerCase().replace(/\s+/g, ' ').split(' ')[0])) {
                return plot;
            }
        }
        return null;
    }

    // Analyze character roles in scene content
    analyzeCharacterRoles(content, sceneData) {
        const lowerContent = content.toLowerCase();
        
        for (const character of this.characters) {
            const firstName = character.split(' ')[0].toLowerCase();
            const fullName = character.toLowerCase();
            
            let involvement = 'absent';
            let roleDescription = '';
            
            if (lowerContent.includes(fullName) || lowerContent.includes(firstName)) {
                // Count mentions to gauge involvement level
                const mentions = (lowerContent.match(new RegExp(firstName, 'g')) || []).length;
                
                if (mentions >= 5) {
                    involvement = 'major';
                    roleDescription = 'Central to scene action';
                } else if (mentions >= 2) {
                    involvement = 'moderate';
                    roleDescription = 'Active participant';
                } else {
                    involvement = 'minor';
                    roleDescription = 'Present but limited role';
                }
                
                if (!sceneData.characters.includes(character)) {
                    sceneData.characters.push(character);
                }
            }
            
            sceneData.characterRoles[character] = {
                involvement: involvement,
                description: roleDescription
            };
        }
    }

    // Generate involvement matrix
    generateInvolvementMatrix() {
        this.involvementMatrix = {
            byCharacter: {},
            byPlot: {},
            byScene: {}
        };

        // Initialize character matrix
        for (const character of this.characters) {
            this.involvementMatrix.byCharacter[character] = {
                scenes: [],
                otherCharacters: {},
                plots: {}
            };
        }

        // Initialize plot matrix
        for (const plot of this.plots) {
            this.involvementMatrix.byPlot[plot] = {
                scenes: [],
                characters: {}
            };
        }

        // Populate matrices from scene data
        for (const scene of this.scenes) {
            this.involvementMatrix.byScene[scene.filename] = {
                characters: scene.characterRoles,
                plots: scene.plotElements,
                date: scene.date
            };

            // Update character matrices
            for (const character of scene.characters) {
                if (this.involvementMatrix.byCharacter[character]) {
                    this.involvementMatrix.byCharacter[character].scenes.push({
                        scene: scene.filename,
                        title: scene.title,
                        date: scene.date,
                        role: scene.characterRoles[character]
                    });

                    // Track character interactions
                    for (const otherChar of scene.characters) {
                        if (otherChar !== character) {
                            if (!this.involvementMatrix.byCharacter[character].otherCharacters[otherChar]) {
                                this.involvementMatrix.byCharacter[character].otherCharacters[otherChar] = 0;
                            }
                            this.involvementMatrix.byCharacter[character].otherCharacters[otherChar]++;
                        }
                    }

                    // Track plot involvement
                    for (const plot of scene.plots) {
                        if (!this.involvementMatrix.byCharacter[character].plots[plot]) {
                            this.involvementMatrix.byCharacter[character].plots[plot] = 0;
                        }
                        this.involvementMatrix.byCharacter[character].plots[plot]++;
                    }
                }
            }

            // Update plot matrices
            for (const plot of scene.plots) {
                if (this.involvementMatrix.byPlot[plot]) {
                    this.involvementMatrix.byPlot[plot].scenes.push({
                        scene: scene.filename,
                        title: scene.title,
                        date: scene.date,
                        element: scene.plotElements[plot]
                    });

                    // Track character involvement in plots
                    for (const character of scene.characters) {
                        if (!this.involvementMatrix.byPlot[plot].characters[character]) {
                            this.involvementMatrix.byPlot[plot].characters[character] = 0;
                        }
                        this.involvementMatrix.byPlot[plot].characters[character]++;
                    }
                }
            }
        }
    }

    // Generate comprehensive report
    generateReport() {
        const reportPath = path.join(this.projectPath, 'logs', 'character-involvement-analysis.md');
        const timestamp = new Date().toISOString().split('T')[0];

        let report = `# Character Involvement Analysis Report
Generated: ${timestamp}

## Executive Summary
- **Characters Analyzed**: ${this.characters.length}
- **Plots Tracked**: ${this.plots.length}
- **Scenes Analyzed**: ${this.scenes.length}

## Character Interaction Matrix

### Character-to-Character Interactions
`;

        // Character interaction table
        for (const character of this.characters) {
            const interactions = this.involvementMatrix.byCharacter[character]?.otherCharacters || {};
            report += `\n#### ${character}\n`;
            
            if (Object.keys(interactions).length > 0) {
                for (const [otherChar, count] of Object.entries(interactions)) {
                    report += `- **${otherChar}**: ${count} shared scenes\n`;
                }
            } else {
                report += `- No character interactions detected\n`;
            }
        }

        report += `\n## Plot Involvement Matrix

### Character-to-Plot Involvement
`;

        // Plot involvement table
        for (const character of this.characters) {
            const plotInvolvement = this.involvementMatrix.byCharacter[character]?.plots || {};
            report += `\n#### ${character}\n`;
            
            if (Object.keys(plotInvolvement).length > 0) {
                for (const [plot, count] of Object.entries(plotInvolvement)) {
                    report += `- **${plot}**: ${count} scenes\n`;
                }
            } else {
                report += `- No plot involvement detected\n`;
            }
        }

        report += `\n## Scene-by-Scene Breakdown

`;

        // Scene breakdown
        const sortedScenes = this.scenes.sort((a, b) => a.filename.localeCompare(b.filename));
        for (const scene of sortedScenes) {
            report += `### ${scene.title} (${scene.date})
**Characters Present**: ${scene.characters.join(', ') || 'None detected'}
**Plots Referenced**: ${scene.plots.join(', ') || 'None detected'}

`;
        }

        // Ensure logs directory exists
        const logsDir = path.join(this.projectPath, 'logs');
        if (!fs.existsSync(logsDir)) {
            fs.mkdirSync(logsDir, { recursive: true });
        }

        fs.writeFileSync(reportPath, report);
        console.log(`📊 Report generated: ${reportPath}`);
        return reportPath;
    }

    // Generate CSV data for spreadsheet integration
    generateCSV() {
        const csvPath = path.join(this.projectPath, 'logs', 'character-involvement-matrix.csv');
        
        // Create character involvement CSV
        let csvContent = 'Scene,Date,';
        
        // Add character columns
        for (const character of this.characters) {
            csvContent += `${character},`;
        }
        
        // Add plot columns
        for (const plot of this.plots) {
            csvContent += `${plot},`;
        }
        
        csvContent += '\n';
        
        // Add scene rows
        const sortedScenes = this.scenes.sort((a, b) => a.filename.localeCompare(b.filename));
        for (const scene of sortedScenes) {
            csvContent += `"${scene.title}","${scene.date}",`;
            
            // Character presence
            for (const character of this.characters) {
                const role = scene.characterRoles[character];
                if (role && role.involvement !== 'absent') {
                    csvContent += `${role.involvement},`;
                } else {
                    csvContent += ',';
                }
            }
            
            // Plot presence
            for (const plot of this.plots) {
                if (scene.plots.includes(plot)) {
                    csvContent += 'yes,';
                } else {
                    csvContent += ',';
                }
            }
            
            csvContent += '\n';
        }
        
        fs.writeFileSync(csvPath, csvContent);
        console.log(`📈 CSV generated: ${csvPath}`);
        return csvPath;
    }

    // Main analysis function
    async analyze() {
        console.log('🔍 Starting Character Involvement Analysis...');
        
        this.loadCharacters();
        this.loadPlots();
        this.analyzeScenes();
        this.generateInvolvementMatrix();
        
        const reportPath = this.generateReport();
        const csvPath = this.generateCSV();
        
        console.log('✅ Analysis complete!');
        console.log(`📄 Report: ${reportPath}`);
        console.log(`📊 CSV: ${csvPath}`);
        
        return {
            report: reportPath,
            csv: csvPath,
            data: this.involvementMatrix
        };
    }
}

// Main execution
async function main() {
    const args = process.argv.slice(2);
    const projectPath = args[0] || process.cwd();
    
    console.log(`🎯 Analyzing project: ${projectPath}`);
    
    const analyzer = new CharacterInvolvementAnalyzer(projectPath);
    await analyzer.analyze();
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(console.error);
}

export { CharacterInvolvementAnalyzer };
