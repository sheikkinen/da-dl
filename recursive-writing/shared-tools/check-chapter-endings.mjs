#!/usr/bin/env node
/**
 * AI Friendly Summary: Analyzes chapter endings by counting paragraphs after the last quote to identify verbose endings.
 * 
 * Cross-References:
 * - /recursive-writing/discourses-with-ai/issues.md (Issue #2 - verbose endings)
 * - /recursive-writing/discourses-with-ai/narrative/chapters/ (target analysis directory)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ChapterEndingAnalyzer {
    constructor() {
        this.results = [];
        this.verboseThreshold = 4; // Paragraphs after last quote that indicate verbosity
    }

    /**
     * Find all markdown files in the chapters directory
     */
    findChapterFiles(chaptersDir) {
        const files = [];
        
        function scanDirectory(dir) {
            const items = fs.readdirSync(dir);
            for (const item of items) {
                const fullPath = path.join(dir, item);
                const stat = fs.statSync(fullPath);
                
                if (stat.isDirectory()) {
                    scanDirectory(fullPath);
                } else if (item.endsWith('.md')) {
                    files.push(fullPath);
                }
            }
        }
        
        scanDirectory(chaptersDir);
        return files.sort();
    }

    /**
     * Extract paragraphs from markdown content
     */
    extractParagraphs(content) {
        // Remove front matter if present
        content = content.replace(/^---[\s\S]*?---\n?/, '');
        
        // Split by double newlines to get paragraphs
        const paragraphs = content
            .split(/\n\s*\n/)
            .map(p => p.trim())
            .filter(p => p.length > 0)
            .filter(p => !p.startsWith('#')) // Remove headers
            .filter(p => !p.startsWith('<!--')) // Remove comments
            .filter(p => !p.startsWith('**Cross-References:**')) // Remove cross-ref sections
            .filter(p => p !== '---') // Remove separator lines
            .filter(p => !p.startsWith('**Next Chapter:**')) // Remove navigation links
            .filter(p => !p.startsWith('*Chapter ') && !p.includes('establishes') && !p.includes('transforms')) // Remove meta-commentary
            .filter(p => !p.startsWith('**Word Count**:')) // Remove word count info
            .filter(p => !p.startsWith('**Philosophy Integration**:')); // Remove philosophy integration notes
        
        return paragraphs;
    }

    /**
     * Find the last quote in the content
     */
    findLastQuote(paragraphs) {
        let lastQuoteIndex = -1;
        
        for (let i = paragraphs.length - 1; i >= 0; i--) {
            const paragraph = paragraphs[i];
            
            // Look for quotes - either dialogue or quoted text
            if (paragraph.includes('"') || 
                paragraph.includes('"') || 
                paragraph.includes('"') ||
                paragraph.includes("'") ||
                paragraph.includes("'") ||
                paragraph.includes("'")) {
                lastQuoteIndex = i;
                break;
            }
        }
        
        return lastQuoteIndex;
    }

    /**
     * Analyze a single chapter file
     */
    analyzeChapter(filePath) {
        try {
            const content = fs.readFileSync(filePath, 'utf-8');
            const paragraphs = this.extractParagraphs(content);
            
            if (paragraphs.length === 0) {
                return {
                    file: path.basename(filePath),
                    relativePath: path.relative(process.cwd(), filePath),
                    error: 'No paragraphs found'
                };
            }

            const lastQuoteIndex = this.findLastQuote(paragraphs);
            
            if (lastQuoteIndex === -1) {
                return {
                    file: path.basename(filePath),
                    relativePath: path.relative(process.cwd(), filePath),
                    totalParagraphs: paragraphs.length,
                    lastQuoteIndex: 'No quotes found',
                    paragraphsAfterQuote: 'N/A',
                    isVerbose: false,
                    lastParagraphs: paragraphs.slice(-3).map(p => p.substring(0, 100) + '...')
                };
            }

            const paragraphsAfterQuote = paragraphs.length - 1 - lastQuoteIndex;
            const isVerbose = paragraphsAfterQuote >= this.verboseThreshold;

            return {
                file: path.basename(filePath),
                relativePath: path.relative(process.cwd(), filePath),
                totalParagraphs: paragraphs.length,
                lastQuoteIndex,
                paragraphsAfterQuote,
                isVerbose,
                lastQuote: paragraphs[lastQuoteIndex].substring(0, 150) + '...',
                endingParagraphs: paragraphs.slice(lastQuoteIndex + 1).map(p => p.substring(0, 100) + '...')
            };

        } catch (error) {
            return {
                file: path.basename(filePath),
                relativePath: path.relative(process.cwd(), filePath),
                error: error.message
            };
        }
    }

    /**
     * Generate analysis report
     */
    generateReport() {
        const verboseChapters = this.results.filter(r => r.isVerbose);
        const totalChapters = this.results.filter(r => !r.error).length;
        
        let report = `# Chapter Ending Analysis Report\n\n`;
        report += `**Generated:** ${new Date().toISOString()}\n\n`;
        report += `## Summary\n\n`;
        report += `| Metric | Value |\n`;
        report += `|--------|-------|\n`;
        report += `| Total Chapters Analyzed | ${totalChapters} |\n`;
        report += `| Verbose Endings (≥${this.verboseThreshold} paragraphs after quote) | ${verboseChapters.length} |\n`;
        report += `| Percentage Verbose | ${((verboseChapters.length / totalChapters) * 100).toFixed(1)}% |\n\n`;

        if (verboseChapters.length > 0) {
            report += `## Verbose Chapters Requiring Attention\n\n`;
            
            verboseChapters.forEach(chapter => {
                report += `### ${chapter.file}\n`;
                report += `- **File:** \`${chapter.relativePath}\`\n`;
                report += `- **Paragraphs after last quote:** ${chapter.paragraphsAfterQuote}\n`;
                report += `- **Last quote:** ${chapter.lastQuote}\n`;
                report += `- **Ending paragraphs:**\n`;
                chapter.endingParagraphs.forEach((p, i) => {
                    report += `  ${i + 1}. ${p}\n`;
                });
                report += `\n`;
            });
        }

        report += `## All Chapters Analysis\n\n`;
        report += `| Chapter | Paragraphs After Quote | Status | File |\n`;
        report += `|---------|------------------------|--------|------|\n`;
        
        this.results
            .filter(r => !r.error)
            .forEach(chapter => {
                const status = chapter.isVerbose ? '⚠️ Verbose' : '✅ Concise';
                const paragraphs = chapter.paragraphsAfterQuote === 'N/A' ? 'No quotes' : chapter.paragraphsAfterQuote;
                report += `| ${chapter.file} | ${paragraphs} | ${status} | \`${chapter.relativePath}\` |\n`;
            });

        // Add errors if any
        const errors = this.results.filter(r => r.error);
        if (errors.length > 0) {
            report += `\n## Errors\n\n`;
            errors.forEach(error => {
                report += `- **${error.file}:** ${error.error}\n`;
            });
        }

        return report;
    }

    /**
     * Run the analysis
     */
    async analyze(chaptersDir) {
        console.log(`🔍 Analyzing chapter endings in: ${chaptersDir}`);
        
        const chapterFiles = this.findChapterFiles(chaptersDir);
        console.log(`📚 Found ${chapterFiles.length} chapter files`);

        for (const file of chapterFiles) {
            console.log(`📖 Analyzing: ${path.basename(file)}`);
            const result = this.analyzeChapter(file);
            this.results.push(result);
        }

        const report = this.generateReport();
        
        // Write report to file
        const reportPath = path.join(process.cwd(), 'chapter-ending-analysis.md');
        fs.writeFileSync(reportPath, report);
        
        console.log(`\n✅ Analysis complete!`);
        console.log(`📊 Report saved to: ${reportPath}`);
        
        // Print summary to console
        const verboseCount = this.results.filter(r => r.isVerbose).length;
        const totalCount = this.results.filter(r => !r.error).length;
        
        console.log(`\n📈 Summary:`);
        console.log(`   Total chapters: ${totalCount}`);
        console.log(`   Verbose endings: ${verboseCount}`);
        console.log(`   Percentage verbose: ${((verboseCount / totalCount) * 100).toFixed(1)}%`);
        
        if (verboseCount > 0) {
            console.log(`\n⚠️  Chapters with verbose endings (≥${this.verboseThreshold} paragraphs after last quote):`);
            this.results
                .filter(r => r.isVerbose)
                .forEach(r => {
                    console.log(`   - ${r.file}: ${r.paragraphsAfterQuote} paragraphs after quote`);
                });
        }

        return report;
    }
}

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
    const analyzer = new ChapterEndingAnalyzer();
    
    // Default to discourses-with-ai chapters directory
    const defaultPath = path.join(process.cwd(), 'recursive-writing', 'discourses-with-ai', 'narrative', 'chapters');
    const chaptersDir = process.argv[2] || defaultPath;
    
    if (!fs.existsSync(chaptersDir)) {
        console.error(`❌ Chapters directory not found: ${chaptersDir}`);
        console.log(`💡 Usage: node check-chapter-endings.mjs [chapters-directory]`);
        process.exit(1);
    }
    
    analyzer.analyze(chaptersDir).catch(console.error);
}

export default ChapterEndingAnalyzer;
