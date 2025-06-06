#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { CharacterInvolvementAnalyzer } from './analyze_character_involvement.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Character File Updater
 * Updates character files with involvement matrices and tracking columns
 */

class CharacterFileUpdater {
    constructor(projectPath) {
        this.projectPath = projectPath;
        this.analyzer = new CharacterInvolvementAnalyzer(projectPath);
        this.involvementData = null;
    }

    // Run analysis to get involvement data
    async analyzeInvolvement() {
        const result = await this.analyzer.analyze();
        this.involvementData = result.data;
        return result;
    }

    // Update a single character file with involvement data
    updateCharacterFile(characterName) {
        const characterPath = path.join(this.projectPath, 'characters', `${characterName}.md`);
        
        if (!fs.existsSync(characterPath)) {
            console.log(`⚠️  Character file not found: ${characterPath}`);
            return false;
        }

        let content = fs.readFileSync(characterPath, 'utf8');
        const characterData = this.involvementData.byCharacter[characterName];
        
        if (!characterData) {
            console.log(`⚠️  No involvement data found for: ${characterName}`);
            return false;
        }

        // Check if involvement sections already exist
        if (content.includes('## Character Interactions')) {
            // Remove existing sections to replace them
            content = this.removeExistingSections(content);
        }

        // Add involvement tracking sections
        const involvementSection = this.generateInvolvementSection(characterName, characterData);
        
        // Insert before the last section or at the end
        const insertPosition = this.findInsertPosition(content);
        content = content.slice(0, insertPosition) + involvementSection + content.slice(insertPosition);

        // Write updated content
        fs.writeFileSync(characterPath, content);
        console.log(`✅ Updated character file: ${characterName}`);
        return true;
    }

    // Remove existing involvement sections
    removeExistingSections(content) {
        const sectionsToRemove = [
            '## Character Interactions',
            '## Plot Involvement', 
            '## Scene Presence',
            '## Involvement Tracking'
        ];

        for (const section of sectionsToRemove) {
            const sectionIndex = content.indexOf(section);
            if (sectionIndex !== -1) {
                // Find the next ## section or end of file
                let endIndex = content.indexOf('\n## ', sectionIndex + 1);
                if (endIndex === -1) {
                    endIndex = content.length;
                }
                content = content.slice(0, sectionIndex) + content.slice(endIndex);
            }
        }

        return content;
    }

    // Find the best position to insert involvement sections
    findInsertPosition(content) {
        // Look for common ending sections
        const endSections = [
            '## Character Arc:',
            '## Development Notes:',
            '## Future Development:',
            '## Notes:'
        ];

        for (const section of endSections) {
            const index = content.indexOf(section);
            if (index !== -1) {
                return index;
            }
        }

        // If no specific section found, add at the end
        return content.length;
    }

    // Generate involvement tracking sections
    generateInvolvementSection(characterName, characterData) {
        let section = `\n## Involvement Tracking

### Character Interactions
`;

        // Character interactions
        const interactions = characterData.otherCharacters || {};
        if (Object.keys(interactions).length > 0) {
            section += '| Character | Shared Scenes | Relationship Type |\n';
            section += '|-----------|---------------|-------------------|\n';
            
            for (const [otherChar, count] of Object.entries(interactions)) {
                const relationshipType = this.determineRelationshipType(characterName, otherChar, count);
                section += `| ${otherChar} | ${count} | ${relationshipType} |\n`;
            }
        } else {
            section += 'No significant character interactions detected.\n';
        }

        // Plot involvement
        section += `\n### Plot Involvement
`;
        const plotInvolvement = characterData.plots || {};
        if (Object.keys(plotInvolvement).length > 0) {
            section += '| Plot Thread | Scene Count | Involvement Level |\n';
            section += '|-------------|-------------|-------------------|\n';
            
            for (const [plot, count] of Object.entries(plotInvolvement)) {
                const involvementLevel = this.determineInvolvementLevel(count);
                section += `| ${plot} | ${count} | ${involvementLevel} |\n`;
            }
        } else {
            section += 'No plot involvement detected.\n';
        }

        // Scene presence timeline
        section += `\n### Scene Presence Timeline
`;
        const scenes = characterData.scenes || [];
        if (scenes.length > 0) {
            section += '| Scene | Date | Role | Description |\n';
            section += '|-------|------|------|-------------|\n';
            
            // Sort scenes by filename/number
            const sortedScenes = scenes.sort((a, b) => a.scene.localeCompare(b.scene));
            
            for (const scene of sortedScenes) {
                const role = scene.role?.involvement || 'present';
                const description = scene.role?.description || 'Participates in scene';
                section += `| ${scene.title || scene.scene} | ${scene.date} | ${role} | ${description} |\n`;
            }
        } else {
            section += 'No scene presence detected.\n';
        }

        section += '\n';
        return section;
    }

    // Determine relationship type based on interaction frequency
    determineRelationshipType(character1, character2, sharedScenes) {
        // This could be enhanced with more sophisticated analysis
        if (sharedScenes >= 8) {
            return 'Primary Relationship';
        } else if (sharedScenes >= 4) {
            return 'Significant Interaction';
        } else if (sharedScenes >= 2) {
            return 'Regular Contact';
        } else {
            return 'Limited Interaction';
        }
    }

    // Determine involvement level based on scene count
    determineInvolvementLevel(sceneCount) {
        if (sceneCount >= 10) {
            return 'Central';
        } else if (sceneCount >= 5) {
            return 'Major';
        } else if (sceneCount >= 2) {
            return 'Moderate';
        } else {
            return 'Minor';
        }
    }

    // Update all character files
    async updateAllCharacterFiles() {
        console.log('🔄 Updating all character files with involvement data...');
        
        // First run the analysis
        await this.analyzeInvolvement();
        
        const charactersPath = path.join(this.projectPath, 'characters');
        const characterFiles = fs.readdirSync(charactersPath).filter(f => f.endsWith('.md'));
        
        let updatedCount = 0;
        for (const file of characterFiles) {
            const characterName = path.basename(file, '.md');
            if (this.updateCharacterFile(characterName)) {
                updatedCount++;
            }
        }

        console.log(`✅ Updated ${updatedCount} character files`);
        return updatedCount;
    }

    // Generate a summary report of updates
    generateUpdateSummary() {
        const summaryPath = path.join(this.projectPath, 'logs', 'character-updates-summary.md');
        const timestamp = new Date().toISOString().split('T')[0];

        let summary = `# Character File Updates Summary
Generated: ${timestamp}

## Updates Applied

The following involvement tracking sections have been added to character files:

### Section Types Added:
1. **Character Interactions** - Table showing shared scenes with other characters
2. **Plot Involvement** - Table showing involvement in each plot thread  
3. **Scene Presence Timeline** - Chronological list of scene appearances with roles

### Character Files Updated:
`;

        if (this.involvementData) {
            for (const character of Object.keys(this.involvementData.byCharacter)) {
                const data = this.involvementData.byCharacter[character];
                const sceneCount = data.scenes?.length || 0;
                const interactionCount = Object.keys(data.otherCharacters || {}).length;
                const plotCount = Object.keys(data.plots || {}).length;
                
                summary += `- **${character}**: ${sceneCount} scenes, ${interactionCount} character interactions, ${plotCount} plot involvements\n`;
            }
        }

        summary += `\n## Next Steps

1. Review the added involvement tracking data for accuracy
2. Manually enhance relationship descriptions where needed
3. Verify plot involvement levels match narrative intent
4. Use this data to inform character development and scene planning

## Files Generated:
- Character involvement analysis report
- Character involvement matrix CSV
- Individual character file updates
`;

        // Ensure logs directory exists
        const logsDir = path.join(this.projectPath, 'logs');
        if (!fs.existsSync(logsDir)) {
            fs.mkdirSync(logsDir, { recursive: true });
        }

        fs.writeFileSync(summaryPath, summary);
        console.log(`📋 Update summary generated: ${summaryPath}`);
        return summaryPath;
    }
}

// Main execution
async function main() {
    const args = process.argv.slice(2);
    const projectPath = args[0] || process.cwd();
    const command = args[1] || 'all';
    
    console.log(`🎯 Updating character files in: ${projectPath}`);
    
    const updater = new CharacterFileUpdater(projectPath);
    
    if (command === 'all') {
        await updater.updateAllCharacterFiles();
        updater.generateUpdateSummary();
    } else {
        // Update specific character
        await updater.analyzeInvolvement();
        updater.updateCharacterFile(command);
    }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(console.error);
}

export { CharacterFileUpdater };
