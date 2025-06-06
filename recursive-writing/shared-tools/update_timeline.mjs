#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { CharacterInvolvementAnalyzer } from './analyze_character_involvement.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Timeline Updater
 * Updates timeline to match scene templates with character presence and plot notes
 */

class TimelineUpdater {
    constructor(projectPath) {
        this.projectPath = projectPath;
        this.analyzer = new CharacterInvolvementAnalyzer(projectPath);
        this.involvementData = null;
        this.scenes = [];
    }

    // Load and analyze scene data
    async loadSceneData() {
        const result = await this.analyzer.analyze();
        this.involvementData = result.data;
        this.scenes = this.analyzer.scenes;
        return result;
    }

    // Read current timeline template
    readTimelineTemplate() {
        const timelinePath = path.join(this.projectPath, 'timeline-template.md');
        if (!fs.existsSync(timelinePath)) {
            console.log('⚠️  Timeline template not found, creating new one');
            return null;
        }
        return fs.readFileSync(timelinePath, 'utf8');
    }

    // Parse date string to create sortable date
    parseSceneDate(dateString) {
        if (!dateString) return null;
        
        // Handle formats like "May 15", "July 8", etc.
        const months = {
            'January': '01', 'February': '02', 'March': '03', 'April': '04',
            'May': '05', 'June': '06', 'July': '07', 'August': '08',
            'September': '09', 'October': '10', 'November': '11', 'December': '12'
        };
        
        const match = dateString.match(/(\w+)\s+(\d+)/);
        if (match) {
            const [, month, day] = match;
            const monthNum = months[month] || '01';
            const dayNum = day.padStart(2, '0');
            return `2025-${monthNum}-${dayNum}`;
        }
        
        return null;
    }

    // Generate timeline entry for a scene
    generateTimelineEntry(scene) {
        const sceneData = this.involvementData.byScene[scene.filename];
        const sortableDate = this.parseSceneDate(scene.date);
        
        let entry = `## ${scene.date} - ${scene.title}\n\n`;
        
        // Characters present
        const characters = scene.characters || [];
        if (characters.length > 0) {
            entry += `**Characters Present:**\n`;
            for (const character of characters) {
                const role = sceneData?.characters[character];
                if (role) {
                    entry += `- **${character}**: ${role.involvement} (${role.description})\n`;
                } else {
                    entry += `- **${character}**: present\n`;
                }
            }
            entry += '\n';
        }
        
        // Plot elements
        const plots = scene.plots || [];
        if (plots.length > 0) {
            entry += `**Plot Elements:**\n`;
            for (const plot of plots) {
                const plotElement = scene.plotElements[plot] || 'Advances plot thread';
                entry += `- **${plot}**: ${plotElement}\n`;
            }
            entry += '\n';
        }
        
        // Scene purpose/conflict
        entry += `**Scene Purpose:** ${this.extractScenePurpose(scene)}\n\n`;
        
        // Key beats
        const keyBeats = this.extractKeyBeats(scene);
        if (keyBeats.length > 0) {
            entry += `**Key Beats:**\n`;
            for (const beat of keyBeats) {
                entry += `- ${beat}\n`;
            }
            entry += '\n';
        }
        
        entry += '---\n\n';
        
        return {
            date: sortableDate,
            content: entry,
            scene: scene
        };
    }

    // Extract scene purpose from scene content
    extractScenePurpose(scene) {
        // This would be enhanced by reading the actual scene file
        // For now, return a placeholder
        return `Scene development for ${scene.title}`;
    }

    // Extract key beats from scene content
    extractKeyBeats(scene) {
        // This would be enhanced by reading the actual scene file
        // For now, return placeholder beats
        return [
            'Character development',
            'Plot advancement',
            'Emotional beats'
        ];
    }

    // Read actual scene file to extract detailed content
    readSceneFile(sceneFilename) {
        const scenePath = path.join(this.projectPath, 'scenes', sceneFilename);
        if (!fs.existsSync(scenePath)) {
            return null;
        }
        return fs.readFileSync(scenePath, 'utf8');
    }

    // Extract scene purpose from actual scene content
    extractScenePurposeFromContent(content) {
        const lines = content.split('\n');
        for (const line of lines) {
            if (line.startsWith('## Purpose/Conflict:')) {
                const purposeIndex = lines.indexOf(line) + 1;
                if (purposeIndex < lines.length) {
                    return lines[purposeIndex].trim();
                }
            }
        }
        return 'Scene development';
    }

    // Extract key beats from actual scene content
    extractKeyBeatsFromContent(content) {
        const lines = content.split('\n');
        const beats = [];
        let inBeatsSection = false;
        
        for (const line of lines) {
            if (line.startsWith('## Key Actions/Beats:')) {
                inBeatsSection = true;
                continue;
            }
            
            if (inBeatsSection) {
                if (line.startsWith('##')) {
                    break;
                }
                if (line.trim() && line.startsWith('- ')) {
                    beats.push(line.replace('- ', '').trim());
                }
            }
        }
        
        return beats;
    }

    // Generate complete timeline
    generateCompleteTimeline() {
        console.log('📅 Generating complete timeline...');
        
        const timelineEntries = [];
        
        // Process each scene
        for (const scene of this.scenes) {
            // Read actual scene file for detailed content
            const sceneContent = this.readSceneFile(scene.filename);
            
            if (sceneContent) {
                // Extract detailed information from scene content
                const purpose = this.extractScenePurposeFromContent(sceneContent);
                const keyBeats = this.extractKeyBeatsFromContent(sceneContent);
                
                // Update scene data with extracted info
                scene.purpose = purpose;
                scene.keyBeats = keyBeats;
            }
            
            const entry = this.generateTimelineEntry(scene);
            timelineEntries.push(entry);
        }
        
        // Sort by date
        timelineEntries.sort((a, b) => {
            if (!a.date && !b.date) return 0;
            if (!a.date) return 1;
            if (!b.date) return -1;
            return a.date.localeCompare(b.date);
        });
        
        // Generate timeline content
        let timeline = `# Hearts at Two Seas - Complete Timeline
Generated: ${new Date().toISOString().split('T')[0]}

This timeline includes all scenes with character presence and plot element tracking.

`;
        
        for (const entry of timelineEntries) {
            timeline += entry.content;
        }
        
        // Add summary section
        timeline += this.generateTimelineSummary();
        
        return timeline;
    }

    // Generate timeline summary
    generateTimelineSummary() {
        const characterSceneCounts = {};
        const plotSceneCounts = {};
        
        // Count appearances
        for (const scene of this.scenes) {
            for (const character of scene.characters || []) {
                characterSceneCounts[character] = (characterSceneCounts[character] || 0) + 1;
            }
            for (const plot of scene.plots || []) {
                plotSceneCounts[plot] = (plotSceneCounts[plot] || 0) + 1;
            }
        }
        
        let summary = `## Timeline Summary

### Character Presence Across Timeline
`;
        
        for (const [character, count] of Object.entries(characterSceneCounts)) {
            const percentage = Math.round((count / this.scenes.length) * 100);
            summary += `- **${character}**: ${count}/${this.scenes.length} scenes (${percentage}%)\n`;
        }
        
        summary += `\n### Plot Thread Distribution
`;
        
        for (const [plot, count] of Object.entries(plotSceneCounts)) {
            const percentage = Math.round((count / this.scenes.length) * 100);
            summary += `- **${plot}**: ${count}/${this.scenes.length} scenes (${percentage}%)\n`;
        }
        
        summary += `\n### Story Arc Milestones

#### Act I (May - Early June)
- Character introduction and setup
- Initial conflicts and tensions
- World building and atmosphere

#### Act II (June - July)
- Relationship development
- Rising action and complications
- Character growth and challenges

#### Act III (August)
- Climax and resolution
- Character transformation
- Satisfying conclusion

`;
        
        return summary;
    }

    // Write updated timeline
    writeTimeline(content) {
        const timelinePath = path.join(this.projectPath, 'timeline-complete.md');
        fs.writeFileSync(timelinePath, content);
        console.log(`✅ Timeline written to: ${timelinePath}`);
        return timelinePath;
    }

    // Update timeline template as well
    updateTimelineTemplate(content) {
        const templatePath = path.join(this.projectPath, 'timeline-template.md');
        
        // Create a simplified version for the template
        const templateContent = content.replace(/\*\*Key Beats:\*\*[\s\S]*?(?=---)/g, '**Key Beats:** [To be detailed]\n\n');
        
        fs.writeFileSync(templatePath, templateContent);
        console.log(`✅ Timeline template updated: ${templatePath}`);
        return templatePath;
    }

    // Main update function
    async updateTimeline() {
        console.log('🔄 Updating timeline to match scene templates...');
        
        // Load scene data
        await this.loadSceneData();
        
        // Generate complete timeline
        const timelineContent = this.generateCompleteTimeline();
        
        // Write files
        const timelinePath = this.writeTimeline(timelineContent);
        const templatePath = this.updateTimelineTemplate(timelineContent);
        
        // Generate update log
        const logPath = this.generateUpdateLog();
        
        console.log('✅ Timeline update complete!');
        console.log(`📅 Complete timeline: ${timelinePath}`);
        console.log(`📋 Template: ${templatePath}`);
        console.log(`📝 Update log: ${logPath}`);
        
        return {
            timeline: timelinePath,
            template: templatePath,
            log: logPath
        };
    }

    // Generate update log
    generateUpdateLog() {
        const logPath = path.join(this.projectPath, 'logs', 'timeline-update-log.md');
        const timestamp = new Date().toISOString().split('T')[0];
        
        let log = `# Timeline Update Log
Generated: ${timestamp}

## Update Summary
- **Scenes Processed**: ${this.scenes.length}
- **Characters Tracked**: ${this.analyzer.characters.length}
- **Plot Threads**: ${this.analyzer.plots.length}

## Changes Made
1. Generated complete timeline with character presence tracking
2. Added plot element notes for each scene
3. Included character involvement levels (major/moderate/minor)
4. Added scene purpose and key beats
5. Created timeline summary with statistics

## Scene Coverage
`;
        
        // Add scene-by-scene coverage
        const sortedScenes = this.scenes.sort((a, b) => a.filename.localeCompare(b.filename));
        for (const scene of sortedScenes) {
            const charCount = scene.characters?.length || 0;
            const plotCount = scene.plots?.length || 0;
            log += `- **${scene.title}** (${scene.date}): ${charCount} characters, ${plotCount} plots\n`;
        }
        
        log += `\n## Next Steps
1. Review timeline for narrative flow
2. Verify character arc progression
3. Check plot thread consistency
4. Enhance scene purposes where needed
5. Add more specific emotional beats
`;
        
        // Ensure logs directory exists
        const logsDir = path.join(this.projectPath, 'logs');
        if (!fs.existsSync(logsDir)) {
            fs.mkdirSync(logsDir, { recursive: true });
        }
        
        fs.writeFileSync(logPath, log);
        return logPath;
    }
}

// Main execution
async function main() {
    const args = process.argv.slice(2);
    const projectPath = args[0] || process.cwd();
    
    console.log(`🎯 Updating timeline for: ${projectPath}`);
    
    const updater = new TimelineUpdater(projectPath);
    await updater.updateTimeline();
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(console.error);
}

export { TimelineUpdater };
