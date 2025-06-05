#!/usr/bin/env node

/**
 * Check Complete Narrative Against Individual Files
 * 
 * This script compares the complete-narrative.md file against individual 
 * narrative files to detect discrepancies, missing content, and 
 * inconsistencies.
 * 
 * Usage:
 *   node check-narrative-consistency.mjs [options]
 * 
 * Options:
 *   --verbose, -v    Show detailed output during processing
 *   --diff, -d       Show content differences for mismatches
 *   --report, -r     Generate detailed report file
 *   --help, -h       Show this help message
 */

import { readFile, readdir, stat, writeFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const COMPLETE_NARRATIVE = join(__dirname, 'complete-narrative.md');
const NARRATIVE_DIR = join(__dirname, 'recursive-writing/wasteland-europa/narrative');

// Show help message
if (process.argv.includes('--help') || process.argv.includes('-h')) {
    console.log(`
🔍 Narrative Consistency Checker
================================

Compares complete-narrative.md against individual narrative files to detect
discrepancies, missing content, and inconsistencies.

Usage:
  node check-narrative-consistency.mjs [options]

Options:
  --verbose, -v    Show detailed output during processing
  --diff, -d       Show content differences for mismatches  
  --report, -r     Generate detailed HTML report file
  --help, -h       Show this help message

Examples:
  node check-narrative-consistency.mjs
  node check-narrative-consistency.mjs --verbose
  node check-narrative-consistency.mjs --diff --report
`);
    process.exit(0);
}

// Configuration
const CONFIG = {
    minContentLength: 100, // Minimum content length to consider valid
    maxDifference: 0.15,   // Maximum allowed difference ratio (15%)
    similarityThreshold: 0.8, // Minimum similarity for content matching
    sizeThreshold: 0.2,    // Size difference threshold (20%)
    verboseOutput: process.argv.includes('--verbose') || process.argv.includes('-v'),
    showDifferences: process.argv.includes('--diff') || process.argv.includes('-d'),
    generateReport: process.argv.includes('--report') || process.argv.includes('-r'),
};

class NarrativeChecker {
    constructor() {
        this.completeContent = '';
        this.completeSections = new Map();
        this.individualFiles = new Map();
        this.issues = [];
        this.stats = {
            totalSections: 0,
            matchedSections: 0,
            missingInComplete: 0,
            missingInIndividual: 0,
            contentMismatches: 0,
            sizeMismatches: 0,
        };
    }

    async run() {
        console.log('🔍 Narrative Consistency Checker');
        console.log('================================\n');

        try {
            await this.loadCompleteNarrative();
            await this.loadIndividualFiles();
            await this.compareContent();
            this.generateSummary();
            
            if (CONFIG.generateReport) {
                await this.generateDetailedReport();
                await this.generateHtmlReport();
            }
        } catch (error) {
            console.error('❌ Error during analysis:', error.message);
            process.exit(1);
        }
    }

    async loadCompleteNarrative() {
        console.log('📖 Loading complete narrative...');
        
        try {
            this.completeContent = await readFile(COMPLETE_NARRATIVE, 'utf-8');
            this.parseCompleteSections();
            console.log(`✅ Loaded ${this.completeSections.size} sections from complete narrative\n`);
        } catch (error) {
            throw new Error(`Failed to load complete narrative: ${error.message}`);
        }
    }

    parseCompleteSections() {
        // Split by ## headers (section headers)
        const sections = this.completeContent.split(/^## /m);
        
        // Skip the first part (title and content before first section)
        for (let i = 1; i < sections.length; i++) {
            const section = sections[i];
            const lines = section.split('\n');
            const title = lines[0].trim();
            const content = lines.slice(1).join('\n').trim();
            
            if (content.length > CONFIG.minContentLength) {
                this.completeSections.set(title, {
                    title,
                    content,
                    wordCount: this.countWords(content),
                    index: i
                });
            }
        }
    }

    async loadIndividualFiles() {
        console.log('📁 Loading individual narrative files...');
        
        try {
            const files = await readdir(NARRATIVE_DIR);
            const narrativeFiles = files.filter(f => f.endsWith('-narrative.md'));
            
            for (const file of narrativeFiles) {
                await this.loadIndividualFile(file);
            }
            
            console.log(`✅ Loaded ${this.individualFiles.size} individual narrative files\n`);
        } catch (error) {
            throw new Error(`Failed to load individual files: ${error.message}`);
        }
    }

    async loadIndividualFile(filename) {
        const filepath = join(NARRATIVE_DIR, filename);
        
        try {
            const content = await readFile(filepath, 'utf-8');
            const metadata = this.extractMetadata(content);
            const cleanContent = this.extractNarrativeContent(content);
            
            if (cleanContent.length > CONFIG.minContentLength) {
                this.individualFiles.set(filename, {
                    filename,
                    title: metadata.title,
                    content: cleanContent,
                    wordCount: this.countWords(cleanContent),
                    metadata
                });
            }
            
            if (CONFIG.verboseOutput) {
                console.log(`  📄 ${filename}: ${this.countWords(cleanContent)} words`);
            }
        } catch (error) {
            this.addIssue('error', `Failed to load ${filename}: ${error.message}`);
        }
    }

    extractMetadata(content) {
        const metadata = {};
        
        // Extract title from header
        const titleMatch = content.match(/^# (.+?)$/m);
        if (titleMatch) {
            let title = titleMatch[1]
                .replace(/Scene \d+[a-z]?:\s*/, '')  // Remove scene number
                .replace(/\s*-.*$/, '')              // Remove everything after dash
                .replace(/\s*\|\s*.*$/, '')          // Remove everything after pipe
                .trim();
            metadata.title = title;
        }
        
        // Extract word count
        const wordCountMatch = content.match(/\*\*Word Count\*\*:\s*[~]?(\d+)/i);
        if (wordCountMatch) {
            metadata.declaredWordCount = parseInt(wordCountMatch[1]);
        }
        
        // Extract POV
        const povMatch = content.match(/\*\*POV\*\*:\s*(.+?)$/m);
        if (povMatch) {
            metadata.pov = povMatch[1].trim();
        }
        
        return metadata;
    }

    extractNarrativeContent(content) {
        // First, let's find the actual narrative content by looking for the pattern:
        // The narrative content starts after the metadata section and content advisory
        // It typically starts with a paragraph of actual story text
        
        // Split into lines and find where narrative begins
        const lines = content.split('\n');
        let narrativeStart = -1;
        
        // Look for the first substantial paragraph after metadata/headers
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            
            // Skip empty lines, headers, metadata, and short lines
            if (line.length === 0 || 
                line.startsWith('#') || 
                line.startsWith('**') || 
                line.startsWith('---') || 
                line.startsWith('<!--') || 
                line.includes('Content Advisory') ||
                line.length < 50) {
                continue;
            }
            
            // This looks like narrative content
            narrativeStart = i;
            break;
        }
        
        if (narrativeStart === -1) {
            return '';
        }
        
        // Extract everything from the narrative start
        let cleaned = lines.slice(narrativeStart).join('\n');
        
        // Now clean up the extracted content
        cleaned = cleaned
            // Remove any remaining metadata blocks
            .replace(/\*\*Scene Status\*\*:.*$/gm, '')
            // Remove end of scene markers
            .replace(/\*\*End of Scene.*?\*\*/g, '')
            // Remove cross-reference sections
            .replace(/\*\*Cross-References.*?\*\*/g, '')
            // Remove navigation links at end of lines
            .replace(/\[.*?\]\(.*?\)\s*$/gm, '')
            // Clean up multiple newlines
            .replace(/\n{3,}/g, '\n\n')
            .trim();
        
        return cleaned;
    }

    async compareContent() {
        console.log('🔍 Comparing content...');
        
        this.stats.totalSections = Math.max(this.completeSections.size, this.individualFiles.size);
        
        // Check for sections in complete narrative but missing individual files
        for (const [sectionTitle, sectionData] of this.completeSections) {
            const matchingFile = this.findMatchingIndividualFile(sectionTitle);
            
            if (!matchingFile) {
                this.addIssue('missing_individual', `Section "${sectionTitle}" found in complete narrative but no matching individual file found`);
                this.stats.missingInIndividual++;
            } else {
                await this.compareSection(sectionData, matchingFile);
                this.stats.matchedSections++;
            }
        }
        
        // Check for individual files not in complete narrative
        for (const [filename, fileData] of this.individualFiles) {
            const matchingSection = this.findMatchingCompleteSection(fileData.title);
            
            if (!matchingSection) {
                this.addIssue('missing_complete', `Individual file "${filename}" (${fileData.title}) not found in complete narrative`);
                this.stats.missingInComplete++;
            }
        }
        
        console.log('✅ Content comparison complete\n');
    }

    findMatchingIndividualFile(sectionTitle) {
        // Try exact title match first
        for (const [filename, fileData] of this.individualFiles) {
            if (this.normalizeTitle(fileData.title) === this.normalizeTitle(sectionTitle)) {
                return fileData;
            }
        }
        
        // Try fuzzy matching
        for (const [filename, fileData] of this.individualFiles) {
            if (this.titleSimilarity(fileData.title, sectionTitle) > CONFIG.similarityThreshold) {
                return fileData;
            }
        }
        
        return null;
    }

    findMatchingCompleteSection(fileTitle) {
        // Try exact title match first
        for (const [sectionTitle, sectionData] of this.completeSections) {
            if (this.normalizeTitle(sectionTitle) === this.normalizeTitle(fileTitle)) {
                return sectionData;
            }
        }
        
        // Try fuzzy matching
        for (const [sectionTitle, sectionData] of this.completeSections) {
            if (this.titleSimilarity(sectionTitle, fileTitle) > CONFIG.similarityThreshold) {
                return sectionData;
            }
        }
        
        return null;
    }

    async compareSection(sectionData, fileData) {
        const sizeDiff = Math.abs(sectionData.wordCount - fileData.wordCount) / Math.max(sectionData.wordCount, fileData.wordCount);
        
        if (sizeDiff > CONFIG.maxDifference) {
            this.addIssue('size_mismatch', 
                `"${sectionData.title}": Significant word count difference - Complete: ${sectionData.wordCount}, Individual: ${fileData.wordCount} (${(sizeDiff * 100).toFixed(1)}% difference)`
            );
            this.stats.sizeMismatches++;
        }
        
        // Content similarity check (simplified)
        const contentSimilarity = this.calculateContentSimilarity(sectionData.content, fileData.content);
        
        if (contentSimilarity < CONFIG.similarityThreshold) {
            this.addIssue('content_mismatch',
                `"${sectionData.title}": Content appears significantly different (${(contentSimilarity * 100).toFixed(1)}% similarity)`
            );
            this.stats.contentMismatches++;
            
            if (CONFIG.showDifferences) {
                this.showContentDifferences(sectionData, fileData);
            }
        }
        
        if (CONFIG.verboseOutput) {
            console.log(`  ✅ ${sectionData.title}: ${sectionData.wordCount}w vs ${fileData.wordCount}w (${(contentSimilarity * 100).toFixed(1)}% similar)`);
        }
    }

    calculateContentSimilarity(content1, content2) {
        // Simple similarity based on shared words and phrases
        const words1 = new Set(content1.toLowerCase().match(/\b\w+\b/g) || []);
        const words2 = new Set(content2.toLowerCase().match(/\b\w+\b/g) || []);
        
        const intersection = new Set([...words1].filter(word => words2.has(word)));
        const union = new Set([...words1, ...words2]);
        
        return intersection.size / union.size;
    }

    showContentDifferences(sectionData, fileData) {
        console.log(`\n  📊 Content Differences for "${sectionData.title}":`);
        console.log(`     Complete narrative: ${sectionData.wordCount} words`);
        console.log(`     Individual file: ${fileData.wordCount} words`);
        
        // Show first few lines of each for manual inspection
        const lines1 = sectionData.content.split('\n').slice(0, 3);
        const lines2 = fileData.content.split('\n').slice(0, 3);
        
        console.log(`     Complete start: "${lines1.join(' ').substring(0, 100)}..."`);
        console.log(`     Individual start: "${lines2.join(' ').substring(0, 100)}..."`);
    }

    normalizeTitle(title) {
        return title
            .toLowerCase()
            // Remove common variations
            .replace(/\s*-\s*narrative$/i, '')
            .replace(/\s*-\s*full narrative$/i, '')
            .replace(/\s+narrative$/i, '')
            .replace(/^the\s+/, '')
            .replace(/[^a-z0-9\s]/g, '')
            .replace(/\s+/g, ' ')
            .trim();
    }

    titleSimilarity(title1, title2) {
        const norm1 = this.normalizeTitle(title1);
        const norm2 = this.normalizeTitle(title2);
        
        if (norm1 === norm2) return 1.0;
        
        // Calculate based on shared words
        const words1 = new Set(norm1.split(' '));
        const words2 = new Set(norm2.split(' '));
        
        const intersection = new Set([...words1].filter(word => words2.has(word)));
        const union = new Set([...words1, ...words2]);
        
        return intersection.size / union.size;
    }

    countWords(text) {
        return (text.match(/\b\w+\b/g) || []).length;
    }

    addIssue(type, message) {
        this.issues.push({ type, message });
    }

    generateSummary() {
        console.log('📊 Summary Report');
        console.log('================');
        console.log(`Total sections analyzed: ${this.stats.totalSections}`);
        console.log(`Successfully matched: ${this.stats.matchedSections}`);
        console.log(`Missing in complete narrative: ${this.stats.missingInComplete}`);
        console.log(`Missing individual files: ${this.stats.missingInIndividual}`);
        console.log(`Content mismatches: ${this.stats.contentMismatches}`);
        console.log(`Size mismatches: ${this.stats.sizeMismatches}`);
        console.log(`Total issues found: ${this.issues.length}\n`);
        
        if (this.issues.length > 0) {
            console.log('🚨 Issues Found:');
            console.log('================');
            
            const issueTypes = {
                'missing_individual': '📄 Missing Individual Files',
                'missing_complete': '📖 Missing in Complete Narrative',
                'content_mismatch': '📝 Content Mismatches',
                'size_mismatch': '📏 Size Mismatches',
                'error': '❌ Errors'
            };
            
            for (const [type, title] of Object.entries(issueTypes)) {
                const typeIssues = this.issues.filter(issue => issue.type === type);
                if (typeIssues.length > 0) {
                    console.log(`\n${title}:`);
                    typeIssues.forEach(issue => {
                        console.log(`  • ${issue.message}`);
                    });
                }
            }
        } else {
            console.log('✅ No issues found! Complete narrative and individual files are consistent.');
        }
    }

    async generateDetailedReport() {
        console.log('\n📋 Generating detailed report...');
        
        const report = `# Narrative Consistency Report
Generated: ${new Date().toISOString()}

## Summary Statistics
- Total sections: ${this.stats.totalSections}
- Matched sections: ${this.stats.matchedSections}
- Missing in complete: ${this.stats.missingInComplete}
- Missing individual files: ${this.stats.missingInIndividual}
- Content mismatches: ${this.stats.contentMismatches}
- Size mismatches: ${this.stats.sizeMismatches}
- Total issues: ${this.issues.length}

## Section Mapping
${Array.from(this.completeSections.entries()).map(([title, data]) => {
    const matchingFile = this.findMatchingIndividualFile(title);
    return `- **${title}** (${data.wordCount} words) → ${matchingFile ? `✅ ${matchingFile.filename}` : '❌ No matching file'}`;
}).join('\n')}

## Individual Files
${Array.from(this.individualFiles.entries()).map(([filename, data]) => {
    const matchingSection = this.findMatchingCompleteSection(data.title);
    return `- **${filename}** (${data.wordCount} words) → ${matchingSection ? `✅ "${matchingSection.title}"` : '❌ Not in complete narrative'}`;
}).join('\n')}

## Issues Detail
${this.issues.map(issue => `- **${issue.type.toUpperCase()}**: ${issue.message}`).join('\n')}
`;
        
        const reportPath = join(__dirname, 'narrative-consistency-report.md');
        await writeFile(reportPath, report);
        console.log(`✅ Detailed report saved to: ${reportPath}`);
    }

    async generateHtmlReport() {
        const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);
        const totalIssues = this.issues.length;
        const status = totalIssues === 0 ? 'PASS' : 'FAIL';
        const statusColor = totalIssues === 0 ? '#4CAF50' : '#f44336';
        
        const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Narrative Consistency Report</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; }
        .status { font-size: 24px; font-weight: bold; color: ${statusColor}; }
        .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin: 20px 0; }
        .stat-card { background: #f8f9fa; padding: 15px; border-radius: 5px; text-align: center; }
        .stat-number { font-size: 28px; font-weight: bold; color: #333; }
        .stat-label { color: #666; margin-top: 5px; }
        .section { margin: 30px 0; }
        .section h2 { color: #333; border-bottom: 2px solid #ddd; padding-bottom: 10px; }
        .issue { background: #fff3cd; border: 1px solid #ffeaa7; padding: 10px; margin: 10px 0; border-radius: 5px; }
        .issue.error { background: #f8d7da; border-color: #f5c6cb; }
        .mapping { display: grid; gap: 10px; }
        .map-item { display: flex; justify-content: space-between; padding: 8px; background: #f8f9fa; border-radius: 3px; }
        .map-item.missing { background: #f8d7da; }
        .timestamp { color: #666; font-size: 14px; text-align: center; margin-top: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔍 Narrative Consistency Report</h1>
            <div class="status">Status: ${status}</div>
        </div>
        
        <div class="stats">
            <div class="stat-card">
                <div class="stat-number">${this.stats.totalSections}</div>
                <div class="stat-label">Total Sections</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${this.stats.matchedSections}</div>
                <div class="stat-label">Matched</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${totalIssues}</div>
                <div class="stat-label">Issues Found</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${this.completeSections.size}</div>
                <div class="stat-label">Complete Sections</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${this.individualFiles.size}</div>
                <div class="stat-label">Individual Files</div>
            </div>
        </div>

        ${totalIssues > 0 ? `
        <div class="section">
            <h2>🚨 Issues Found</h2>
            ${this.issues.map(issue => `
                <div class="issue ${issue.type.includes('missing') ? 'error' : ''}">
                    <strong>${issue.type.toUpperCase()}:</strong> ${issue.message}
                </div>
            `).join('')}
        </div>
        ` : '<div class="section"><h2>✅ No Issues Found</h2><p>All sections are consistent between complete narrative and individual files.</p></div>'}

        <div class="section">
            <h2>📊 Section Mapping</h2>
            <div class="mapping">
                ${Array.from(this.completeSections.entries()).map(([title, data]) => {
                    const matchingFile = this.findMatchingIndividualFile(title);
                    return `
                        <div class="map-item ${!matchingFile ? 'missing' : ''}">
                            <span><strong>${title}</strong> (${data.wordCount} words)</span>
                            <span>${matchingFile ? `✅ ${matchingFile.filename}` : '❌ No matching file'}</span>
                        </div>
                    `;
                }).join('')}
            </div>
        </div>

        <div class="timestamp">
            Generated: ${timestamp}
        </div>
    </div>
</body>
</html>
        `;
        
        const reportPath = join(__dirname, 'narrative-consistency-report.html');
        await writeFile(reportPath, html);
        console.log(`✅ HTML report saved to: ${reportPath}`);
    }
}

// Main execution
const checker = new NarrativeChecker();
checker.run().catch(error => {
    console.error('❌ Fatal error:', error.message);
    process.exit(1);
});
