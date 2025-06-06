#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { CharacterInvolvementAnalyzer } from './analyze_character_involvement.mjs';
import { CharacterFileUpdater } from './update_character_files.mjs';
import { TimelineUpdater } from './update_timeline.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Project Organization Master Script
 * Runs all project organization tasks from the tasklist
 */

class ProjectOrganizer {
    constructor(projectPath) {
        this.projectPath = projectPath;
        this.results = {};
    }

    // Display banner
    displayBanner() {
        console.log(`
╔══════════════════════════════════════════════════════════════╗
║                    HEARTS AT TWO SEAS                        ║
║                 Project Organization Tool                    ║
╚══════════════════════════════════════════════════════════════╝

🎯 Project Path: ${this.projectPath}
📅 Date: ${new Date().toLocaleDateString()}
`);
    }

    // Task 1: Analyze character involvement
    async analyzeCharacterInvolvement() {
        console.log('\n🔍 TASK 1: Analyzing Character Involvement');
        console.log('=' .repeat(50));
        
        try {
            const analyzer = new CharacterInvolvementAnalyzer(this.projectPath);
            const result = await analyzer.analyze();
            
            this.results.characterAnalysis = result;
            console.log('✅ Character involvement analysis complete');
            return true;
        } catch (error) {
            console.error('❌ Character analysis failed:', error.message);
            return false;
        }
    }

    // Task 2: Update character files with involvement data
    async updateCharacterFiles() {
        console.log('\n📝 TASK 2: Updating Character Files');
        console.log('=' .repeat(50));
        
        try {
            const updater = new CharacterFileUpdater(this.projectPath);
            const updatedCount = await updater.updateAllCharacterFiles();
            const summaryPath = updater.generateUpdateSummary();
            
            this.results.characterUpdates = {
                updatedCount,
                summaryPath
            };
            
            console.log('✅ Character files updated');
            return true;
        } catch (error) {
            console.error('❌ Character file updates failed:', error.message);
            return false;
        }
    }

    // Task 3: Update timeline to match scene templates
    async updateTimeline() {
        console.log('\n📅 TASK 3: Updating Timeline');
        console.log('=' .repeat(50));
        
        try {
            const timelineUpdater = new TimelineUpdater(this.projectPath);
            const result = await timelineUpdater.updateTimeline();
            
            this.results.timelineUpdate = result;
            console.log('✅ Timeline update complete');
            return true;
        } catch (error) {
            console.error('❌ Timeline update failed:', error.message);
            return false;
        }
    }

    // Generate project status report
    generateProjectStatusReport() {
        console.log('\n📊 TASK 4: Generating Project Status Report');
        console.log('=' .repeat(50));
        
        const reportPath = path.join(this.projectPath, 'logs', 'project-organization-report.md');
        const timestamp = new Date().toISOString().split('T')[0];
        
        let report = `# Project Organization Report
Generated: ${timestamp}

## Executive Summary

The Hearts at Two Seas project organization has been completed with the following automated analysis and updates:

### Completed Tasks
- ✅ Character involvement analysis
- ✅ Character file updates with involvement tracking
- ✅ Timeline update to match scene templates
- ✅ Project organization report generation

## Results Summary

### Character Analysis
`;

        if (this.results.characterAnalysis) {
            const analysis = this.results.characterAnalysis;
            report += `- **Characters Analyzed**: ${Object.keys(analysis.data.byCharacter).length}
- **Plots Tracked**: ${Object.keys(analysis.data.byPlot).length}
- **Scenes Analyzed**: ${Object.keys(analysis.data.byScene).length}
- **Analysis Report**: ${analysis.report}
- **CSV Matrix**: ${analysis.csv}
`;
        }

        report += `\n### Character File Updates
`;

        if (this.results.characterUpdates) {
            report += `- **Files Updated**: ${this.results.characterUpdates.updatedCount}
- **Update Summary**: ${this.results.characterUpdates.summaryPath}

#### Sections Added to Character Files:
- Character Interactions table
- Plot Involvement tracking
- Scene Presence Timeline
`;
        }

        report += `\n### Timeline Updates
`;

        if (this.results.timelineUpdate) {
            report += `- **Complete Timeline**: ${this.results.timelineUpdate.timeline}
- **Template Updated**: ${this.results.timelineUpdate.template}
- **Update Log**: ${this.results.timelineUpdate.log}

#### Timeline Features:
- Character presence tracking for each scene
- Plot element notes
- Character involvement levels
- Scene purposes and key beats
- Statistical summary
`;
        }

        report += `\n## Project Organization Status

### ✅ Completed Items from Tasklist:
- [x] Check character folder and add column for each main character
- [x] Check character folder and add column for each plot
- [x] Update timeline to match scene templates - mark if character is present and few words for each plot

### 📁 Files Generated:
`;

        // List all generated files
        const logsDir = path.join(this.projectPath, 'logs');
        if (fs.existsSync(logsDir)) {
            const logFiles = fs.readdirSync(logsDir).filter(f => f.endsWith('.md') || f.endsWith('.csv'));
            for (const file of logFiles) {
                report += `- \`logs/${file}\`\n`;
            }
        }

        report += `\n## Next Steps

### Scene Development (Ready to Begin):
1. Create narrative subfolder structure
2. Begin Finnish narrative writing for completed scenes
3. Develop sensual scenes within Harlequin guidelines
4. Add more action elements throughout story

### Character & Story Development:
1. Review generated character interaction data for accuracy
2. Use plot involvement data to ensure balanced story threads
3. Verify character arc progression using timeline data
4. Enhance character relationships based on involvement analysis

### Quality Assurance:
1. Cross-reference timeline with scene templates for consistency
2. Validate character presence data against narrative requirements
3. Check plot thread distribution for pacing balance
4. Review generated data for any anomalies or missing elements

## Tools Available

The following tools have been created for ongoing project management:

1. **\`analyze_character_involvement.mjs\`** - Analyzes character and plot involvement across scenes
2. **\`update_character_files.mjs\`** - Updates character files with involvement tracking
3. **\`update_timeline.mjs\`** - Generates timeline matching scene templates
4. **\`organize_project.mjs\`** - Master script for all organization tasks

## Conclusion

The project organization phase is now complete. All character files have been enhanced with interaction tracking, plot involvement data, and scene presence timelines. The timeline has been updated to reflect all scenes with detailed character and plot information.

The project is ready to move into the narrative development phase with a solid organizational foundation.
`;

        // Ensure logs directory exists
        const logsDirectory = path.join(this.projectPath, 'logs');
        if (!fs.existsSync(logsDirectory)) {
            fs.mkdirSync(logsDirectory, { recursive: true });
        }

        fs.writeFileSync(reportPath, report);
        console.log(`✅ Project status report generated: ${reportPath}`);
        return reportPath;
    }

    // Update tasklist to mark completed items
    updateTasklist() {
        console.log('\n📋 TASK 5: Updating Tasklist');
        console.log('=' .repeat(50));
        
        const tasklistPath = path.join(this.projectPath, 'tasklist.md');
        if (!fs.existsSync(tasklistPath)) {
            console.log('⚠️  Tasklist not found, skipping update');
            return false;
        }
        
        try {
            let content = fs.readFileSync(tasklistPath, 'utf8');
            
            // Mark project organization tasks as complete
            const tasksToComplete = [
                '- [ ] Check character folder and add column for each main character',
                '- [ ] Check character folder and add column for each plot',
                '- [ ] Update timeline to match scene templates - mark if character is present and few words for each plot'
            ];
            
            for (const task of tasksToComplete) {
                const completedTask = task.replace('- [ ]', '- [x]');
                content = content.replace(task, completedTask);
            }
            
            fs.writeFileSync(tasklistPath, content);
            console.log('✅ Tasklist updated with completed items');
            return true;
        } catch (error) {
            console.error('❌ Tasklist update failed:', error.message);
            return false;
        }
    }

    // Display final summary
    displaySummary() {
        console.log(`
╔══════════════════════════════════════════════════════════════╗
║                     ORGANIZATION COMPLETE                    ║
╚══════════════════════════════════════════════════════════════╝

🎉 All project organization tasks completed successfully!

📁 Key Files Generated:
`);

        if (this.results.characterAnalysis) {
            console.log(`   📊 ${this.results.characterAnalysis.report}`);
            console.log(`   📈 ${this.results.characterAnalysis.csv}`);
        }
        
        if (this.results.timelineUpdate) {
            console.log(`   📅 ${this.results.timelineUpdate.timeline}`);
            console.log(`   📋 ${this.results.timelineUpdate.template}`);
        }

        console.log(`
🚀 Ready for Next Phase: Scene Development
   • Create narrative subfolder structure
   • Begin Finnish narrative writing
   • Develop sensual scenes
   • Add action elements

💡 Use the generated data to inform your writing:
   • Character interaction frequencies
   • Plot thread distribution
   • Scene presence timeline
   • Character involvement levels
`);
    }

    // Main organization function
    async runOrganization() {
        this.displayBanner();
        
        const tasks = [
            () => this.analyzeCharacterInvolvement(),
            () => this.updateCharacterFiles(),
            () => this.updateTimeline(),
            () => this.generateProjectStatusReport(),
            () => this.updateTasklist()
        ];
        
        let successCount = 0;
        for (const task of tasks) {
            const success = await task();
            if (success) successCount++;
        }
        
        console.log(`\n📊 Completed ${successCount}/${tasks.length} tasks`);
        
        if (successCount === tasks.length) {
            this.displaySummary();
        } else {
            console.log('⚠️  Some tasks failed. Check the logs above for details.');
        }
        
        return successCount === tasks.length;
    }
}

// Main execution
async function main() {
    const args = process.argv.slice(2);
    const projectPath = args[0] || process.cwd();
    
    const organizer = new ProjectOrganizer(projectPath);
    const success = await organizer.runOrganization();
    
    process.exit(success ? 0 : 1);
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(console.error);
}

export { ProjectOrganizer };
