#!/usr/bin/env node

/**
 * AI-Friendly Summary: Clean narrative concatenation tool for philosophical discourse chapters, removing AI summaries, metadata, and cross-references while preserving story content.
 * 
 * Discourses with AI - Clean Narrative Concatenation Tool
 * 
 * Concatenates narrative chapters while filtering out:
 * - AI Friendly Summaries
 * - Cross-References
 * - Metadata sections
 * - HTML comments
 * - Key Philosophical Questions (optional)
 * 
 * Usage: node clean-narrative-concatenate.mjs [input-dir] [output-file] [options]
 * 
 * Options:
 *   --include-questions   Keep the "Key Philosophical Question" sections
 *   --include-toc        Include table of contents
 *   --title=TITLE        Custom document title
 *   --help               Show this help
 * 
 * Examples:
 *   node clean-narrative-concatenate.mjs recursive-writing/discourses-with-ai/narrative/chapters
 *   node clean-narrative-concatenate.mjs recursive-writing/discourses-with-ai/narrative/chapters clean-narrative.md
 *   node clean-narrative-concatenate.mjs recursive-writing/discourses-with-ai/narrative/chapters clean.md --include-toc --title="Philosophical Dialogues"
 */

import { readdir, readFile, writeFile, stat } from 'fs/promises';
import { join, resolve, basename } from 'path';

// Configuration
const DEFAULT_OUTPUT = 'clean-narrative.md';
const DEFAULT_TITLE = 'Discourses with AI: A Philosophical Journey';

async function main() {
    const args = process.argv.slice(2);
    
    // Parse options
    const options = {
        includeQuestions: false,
        includeToc: false,
        title: DEFAULT_TITLE,
        help: false
    };
    
    const nonOptionArgs = [];
    
    for (const arg of args) {
        if (arg === '--help') {
            options.help = true;
        } else if (arg === '--include-questions') {
            options.includeQuestions = true;
        } else if (arg === '--include-toc') {
            options.includeToc = true;
        } else if (arg.startsWith('--title=')) {
            options.title = arg.split('=')[1];
        } else if (!arg.startsWith('--')) {
            nonOptionArgs.push(arg);
        }
    }
    
    if (options.help) {
        showHelp();
        return;
    }
    
    const inputPath = nonOptionArgs[0] || 'recursive-writing/discourses-with-ai/narrative/chapters';
    const outputFile = nonOptionArgs[1] || DEFAULT_OUTPUT;
    
    console.log(`📚 Processing chapters from: ${resolve(inputPath)}`);
    console.log(`📝 Output file: ${outputFile}`);
    if (options.includeQuestions) console.log(`❓ Including philosophical questions`);
    if (options.includeToc) console.log(`📋 Including table of contents`);
    
    try {
        // Find all narrative files in order
        const chapters = await findChapterFiles(inputPath);
        
        if (chapters.length === 0) {
            console.log('❌ No chapter files found.');
            return;
        }
        
        console.log(`📖 Found ${chapters.length} chapters`);
        
        // Process files to extract clean content
        const processedChapters = [];
        let totalWordCount = 0;
        
        for (const chapter of chapters) {
            console.log(`📄 Processing: ${basename(chapter.path)}`);
            
            const content = await readFile(chapter.path, 'utf-8');
            const { title, cleanContent, wordCount } = extractCleanContent(content, chapter.path, options);
            
            processedChapters.push({
                file: basename(chapter.path),
                title,
                content: cleanContent,
                wordCount,
                act: chapter.act,
                order: chapter.order
            });
            
            totalWordCount += wordCount;
        }
        
        // Generate the complete document
        const concatenatedText = generateDocument(processedChapters, totalWordCount, options);
        
        // Write output file
        await writeFile(outputFile, concatenatedText, 'utf-8');
        
        console.log(`✅ Clean narrative saved to: ${outputFile}`);
        console.log(`📊 Total word count: ~${totalWordCount.toLocaleString()} words`);
        console.log(`📚 Chapters processed: ${chapters.length}`);
        
    } catch (error) {
        console.error('❌ Error processing narratives:', error.message);
        process.exit(1);
    }
}

function showHelp() {
    console.log(`
📚 Discourses with AI - Clean Narrative Concatenation Tool

Concatenates narrative chapters while filtering out AI summaries, metadata, and cross-references.

Usage: node clean-narrative-concatenate.mjs [input-dir] [output-file] [options]

Arguments:
  input-dir     Path to the chapters directory (default: recursive-writing/discourses-with-ai/narrative/chapters)
  output-file   Output filename (default: clean-narrative.md)

Options:
  --include-questions   Keep the "Key Philosophical Question" sections
  --include-toc        Include table of contents
  --title=TITLE        Custom document title
  --help               Show this help

Examples:
  node clean-narrative-concatenate.mjs
  node clean-narrative-concatenate.mjs recursive-writing/discourses-with-ai/narrative/chapters clean-narrative.md
  node clean-narrative-concatenate.mjs chapters/ book.md --include-toc --title="Philosophical Dialogues"
`);
}

async function findChapterFiles(inputPath) {
    const chapters = [];
    
    // Define the expected structure
    const acts = [
        'act-1-ancient-foundations',
        'act-2-medieval-synthesis', 
        'act-3-modern-inquiry',
        'act-4-contemporary-convergence'
    ];
    
    // Process each act directory
    for (const act of acts) {
        const actPath = join(inputPath, act);
        try {
            const files = await readdir(actPath);
            const markdownFiles = files
                .filter(file => file.endsWith('.md'))
                .sort(); // Natural alphabetical sort should work for numbered files
            
            for (const file of markdownFiles) {
                const chapterMatch = file.match(/^(\d+)-(.+)\.md$/);
                if (chapterMatch) {
                    chapters.push({
                        path: join(actPath, file),
                        act: act,
                        order: parseInt(chapterMatch[1]),
                        name: chapterMatch[2]
                    });
                }
            }
        } catch (error) {
            console.log(`⚠️  Warning: Could not read act directory ${act}: ${error.message}`);
        }
    }
    
    // Check for any epilogue or additional files in the main directory
    try {
        const mainFiles = await readdir(inputPath);
        const epilogueFiles = mainFiles
            .filter(file => file.endsWith('.md') && (file.includes('epilogue') || file.match(/^\d+-.+\.md$/)))
            .sort();
        
        for (const file of epilogueFiles) {
            const chapterMatch = file.match(/^(\d+)-(.+)\.md$/);
            if (chapterMatch) {
                chapters.push({
                    path: join(inputPath, file),
                    act: 'epilogue',
                    order: parseInt(chapterMatch[1]),
                    name: chapterMatch[2]
                });
            }
        }
    } catch (error) {
        // Main directory might not have additional files, that's ok
    }
    
    // Sort by order number
    return chapters.sort((a, b) => a.order - b.order);
}

function extractCleanContent(content, filepath, options) {
    const lines = content.split('\n');
    let cleanLines = [];
    let title = extractTitleFromContent(content);
    let inCrossReferences = false;
    let inKeyQuestion = false;
    let inNarrativeContent = false;
    let wordCount = 0;
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmedLine = line.trim();
        
        // Skip HTML comments and file path comments
        if (trimmedLine.startsWith('<!--')) {
            if (trimmedLine.includes('-->')) continue;
            // Multi-line comment, skip until we find the end
            while (i < lines.length && !lines[i].includes('-->')) {
                i++;
            }
            continue;
        }
        
        // Skip AI Friendly Summary lines
        if (trimmedLine.startsWith('**AI Friendly Summary:**') || 
            trimmedLine.includes('AI Friendly Summary:')) {
            continue;
        }
        
        // Skip Cross-References section
        if (trimmedLine.startsWith('## Cross-References')) {
            inCrossReferences = true;
            continue;
        }
        
        // Skip Key Philosophical Question section (unless option is set)
        if (trimmedLine.startsWith('## Key Philosophical Question')) {
            inKeyQuestion = true;
            if (!options.includeQuestions) continue;
        }
        
        // End of Cross-References or Key Question section
        if ((inCrossReferences || inKeyQuestion) && trimmedLine.startsWith('##') && 
            !trimmedLine.startsWith('## Cross-References') && 
            !trimmedLine.startsWith('## Key Philosophical Question')) {
            inCrossReferences = false;
            inKeyQuestion = false;
            // Continue processing this line as it's a new section
        }
        
        // Skip content while in Cross-References section
        if (inCrossReferences) {
            continue;
        }
        
        // Skip content while in Key Question section (if not including questions)
        if (inKeyQuestion && !options.includeQuestions) {
            continue;
        }
        
        // Skip standalone horizontal rules that are likely metadata separators
        if (trimmedLine === '---' && !inNarrativeContent) {
            continue;
        }
        
        // Detect start of actual narrative content
        if (!inNarrativeContent && 
            (trimmedLine.length > 50 && /^[A-Z"]/.test(trimmedLine) && !trimmedLine.startsWith('#'))) {
            inNarrativeContent = true;
        }
        
        // If we're past the metadata section, include content
        if (inNarrativeContent || trimmedLine.startsWith('## ') || 
            (trimmedLine.length > 0 && !trimmedLine.startsWith('**') && !trimmedLine.startsWith('- **'))) {
            cleanLines.push(line);
            
            // Count words
            if (trimmedLine.length > 0 && !trimmedLine.startsWith('#')) {
                wordCount += trimmedLine.split(/\s+/).filter(word => word.length > 0).length;
            }
        }
    }
    
    return {
        title,
        cleanContent: cleanLines.join('\n').trim(),
        wordCount
    };
}

function extractTitleFromContent(content) {
    const lines = content.split('\n');
    
    for (const line of lines) {
        const trimmedLine = line.trim();
        
        // Look for main title (# Chapter X: Title)
        if (trimmedLine.startsWith('# Chapter ')) {
            const titleMatch = trimmedLine.match(/^# Chapter \d+: (.+?)( \*.*\*)?$/);
            if (titleMatch) {
                return titleMatch[1];
            }
        }
        
        // Fallback to any # title
        if (trimmedLine.startsWith('# ')) {
            return trimmedLine.substring(2).trim();
        }
    }
    
    return 'Untitled Chapter';
}

function generateDocument(chapters, totalWordCount, options) {
    let text = '';
    
    // Add header
    text += `# ${options.title}\n\n`;
    text += `*A Clean Narrative Edition*\n\n`;
    
    if (options.includeToc) {
        text += generateTableOfContents(chapters);
    }
    
    // Add chapters grouped by act
    let currentAct = '';
    
    for (const chapter of chapters) {
        // Add act header when we encounter a new act
        if (chapter.act !== currentAct) {
            currentAct = chapter.act;
            
            // Add act separator
            if (text.length > 100) { // Don't add separator before first act
                text += `\n\n---\n\n`;
            }
            
            // Add act title
            const actTitle = formatActTitle(chapter.act);
            text += `## ${actTitle}\n\n`;
        }
        
        // Add chapter
        text += `### ${chapter.title}\n\n`;
        text += chapter.content;
        text += `\n\n`;
    }
    
    // Add final statistics
    text += `\n\n---\n\n`;
    text += `**Final Statistics**\n\n`;
    text += `- **Total Chapters**: ${chapters.length}\n`;
    text += `- **Total Word Count**: ~${totalWordCount.toLocaleString()} words\n`;
    text += `- **Generated**: ${new Date().toISOString().split('T')[0]}\n\n`;
    
    return text;
}

function generateTableOfContents(chapters) {
    let toc = `## Table of Contents\n\n`;
    
    let currentAct = '';
    
    for (const chapter of chapters) {
        // Add act header in TOC
        if (chapter.act !== currentAct) {
            currentAct = chapter.act;
            const actTitle = formatActTitle(chapter.act);
            toc += `\n**${actTitle}**\n\n`;
        }
        
        // Add chapter entry
        toc += `- ${chapter.title}`;
        if (chapter.wordCount > 0) {
            toc += ` *(~${chapter.wordCount.toLocaleString()} words)*`;
        }
        toc += `\n`;
    }
    
    toc += `\n---\n\n`;
    return toc;
}

function formatActTitle(actName) {
    switch (actName) {
        case 'act-1-ancient-foundations':
            return 'Act I: Ancient Foundations';
        case 'act-2-medieval-synthesis':
            return 'Act II: Medieval Synthesis';
        case 'act-3-modern-inquiry':
            return 'Act III: Modern Inquiry';
        case 'act-4-contemporary-convergence':
            return 'Act IV: Contemporary Convergence';
        case 'epilogue':
            return 'Epilogue';
        default:
            return actName.split('-').map(word => 
                word.charAt(0).toUpperCase() + word.slice(1)
            ).join(' ');
    }
}

// Run the script
main().catch(console.error);
