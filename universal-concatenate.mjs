#!/usr/bin/env node

/**
 * Universal Narrative Concatenation Tool
 * 
 * Generic tool that can work with various narrative file structures.
 * Automatically detects and processes different file naming conventions.
 * 
 * Usage: node universal-concatenate.mjs [directory] [output-file] [options]
 * 
 * Options:
 *   --pattern=GLOB    File pattern to match (default: *-narrative.md, *.md)
 *   --include-toc     Include table of contents
 *   --include-stats   Include scene statistics in TOC
 *   --title=TITLE     Custom document title
 *   --subtitle=TEXT   Custom subtitle
 *   --help            Show this help
 * 
 * Examples:
 *   node universal-concatenate.mjs recursive-writing/wasteland-europa/narrative
 *   node universal-concatenate.mjs stories/ complete-stories.md --title="My Stories"
 *   node universal-concatenate.mjs chapters/ book.md --pattern="chapter-*.md" --include-toc
 */

import { readdir, readFile, writeFile, stat } from 'fs/promises';
import { join, resolve, basename, extname } from 'path';

// Configuration
const DEFAULT_OUTPUT = 'complete-narrative.md';
const DEFAULT_PATTERNS = ['*-narrative.md', '*.md'];

async function main() {
    const args = process.argv.slice(2);
    
    // Parse options
    const options = {
        includeToc: false,
        includeStats: false,
        pattern: null,
        title: null,
        subtitle: null,
        help: false
    };
    
    const nonOptionArgs = [];
    
    for (const arg of args) {
        if (arg === '--help') {
            options.help = true;
        } else if (arg === '--include-toc') {
            options.includeToc = true;
        } else if (arg === '--include-stats') {
            options.includeStats = true;
        } else if (arg.startsWith('--pattern=')) {
            options.pattern = arg.split('=')[1];
        } else if (arg.startsWith('--title=')) {
            options.title = arg.split('=')[1];
        } else if (arg.startsWith('--subtitle=')) {
            options.subtitle = arg.split('=')[1];
        } else if (!arg.startsWith('--')) {
            nonOptionArgs.push(arg);
        }
    }
    
    if (options.help) {
        showHelp();
        return;
    }
    
    const inputPath = nonOptionArgs[0] || '.';
    const outputFile = nonOptionArgs[1] || DEFAULT_OUTPUT;
    
    console.log(`📚 Processing files from: ${resolve(inputPath)}`);
    console.log(`📝 Output file: ${outputFile}`);
    if (options.pattern) console.log(`🔍 Pattern: ${options.pattern}`);
    if (options.includeToc) console.log(`📋 Including table of contents`);
    if (options.includeStats) console.log(`📊 Including scene statistics`);
    
    try {
        // Detect the file structure
        const files = await findNarrativeFiles(inputPath, options.pattern);
        
        if (files.length === 0) {
            console.log('❌ No narrative files found. Try specifying a different pattern with --pattern=');
            return;
        }
        
        console.log(`📖 Found ${files.length} narrative files`);
        
        // Process files to extract content
        const stories = [];
        let totalWordCount = 0;
        
        for (const file of files) {
            console.log(`📄 Processing: ${basename(file)}`);
            
            const content = await readFile(file, 'utf-8');
            const { title, cleanContent, wordCount } = extractContent(content, file);
            
            stories.push({
                file: basename(file),
                title,
                content: cleanContent,
                wordCount
            });
            
            totalWordCount += wordCount;
        }
        
        // Auto-detect title if not provided
        if (!options.title) {
            options.title = autoDetectTitle(inputPath);
        }
        
        // Generate the complete document
        let concatenatedText = generateDocument(stories, totalWordCount, options);
        
        // Write output file
        await writeFile(outputFile, concatenatedText, 'utf-8');
        
        console.log(`✅ Complete narrative saved to: ${outputFile}`);
        console.log(`📊 Total word count: ~${totalWordCount.toLocaleString()} words`);
        console.log(`📚 Files processed: ${files.length}`);
        
    } catch (error) {
        console.error('❌ Error processing narratives:', error.message);
        process.exit(1);
    }
}

async function findNarrativeFiles(inputPath, customPattern) {
    const fullPath = resolve(inputPath);
    
    // Check if input is a file or directory
    const stats = await stat(fullPath);
    
    if (stats.isFile()) {
        return [fullPath];
    }
    
    // It's a directory, find files based on pattern
    const files = await readdir(fullPath);
    let matchingFiles = [];
    
    if (customPattern) {
        // Simple pattern matching (supports * wildcards)
        const regexPattern = customPattern
            .replace(/\*/g, '.*')
            .replace(/\?/g, '.');
        const regex = new RegExp(`^${regexPattern}$`);
        
        matchingFiles = files.filter(file => regex.test(file))
            .map(file => join(fullPath, file));
    } else {
        // Use default patterns
        for (const pattern of DEFAULT_PATTERNS) {
            const regexPattern = pattern
                .replace(/\*/g, '.*')
                .replace(/\?/g, '.');
            const regex = new RegExp(`^${regexPattern}$`);
            
            const matches = files.filter(file => regex.test(file))
                .map(file => join(fullPath, file));
            matchingFiles.push(...matches);
        }
    }
    
    // Remove duplicates and sort
    matchingFiles = [...new Set(matchingFiles)];
    matchingFiles.sort(naturalSort);
    
    return matchingFiles;
}

function naturalSort(a, b) {
    // Natural sorting for filenames with numbers
    return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
}

function extractContent(content, filepath) {
    const filename = basename(filepath, extname(filepath));
    const lines = content.split('\n');
    let cleanLines = [];
    let title = extractTitleFromPath(filepath);
    let inMetadataBlock = false;
    let inContentSection = false;
    let wordCount = 0;
    let skipNextLines = 0;
    
    for (let i = 0; i < lines.length; i++) {
        if (skipNextLines > 0) {
            skipNextLines--;
            continue;
        }
        
        const line = lines[i].trim();
        
        // Skip HTML comments and file path comments
        if (line.startsWith('<!--') || line.startsWith('//')) {
            if (line.includes('-->')) continue;
            // Multi-line comment, skip until we find the end
            while (i < lines.length && !lines[i].includes('-->')) {
                i++;
            }
            continue;
        }
        
        // Extract main title
        if (line.startsWith('# ') && !inContentSection) {
            const titleMatch = line.match(/^# (.+?)( - .+)?$/);
            if (titleMatch) {
                title = titleMatch[1];
            }
            continue;
        }
        
        // Skip metadata blocks
        if ((line.startsWith('**') && line.endsWith('**')) || 
            line.startsWith('**Date:**') || line.startsWith('**Location:**') ||
            line.startsWith('**Duration:**') || line.startsWith('**POV:**')) {
            continue;
        }
        
        // Skip standalone horizontal rules that are likely metadata separators
        if (line === '---' && !inContentSection) {
            continue;
        }
        
        // Detect start of actual content
        if ((line.startsWith('## ') && !line.includes('Notes') && !line.includes('Statistics')) ||
            (!inContentSection && line.length > 100 && /^[A-Z]/.test(line))) {
            inContentSection = true;
            if (line.startsWith('## ')) {
                // Skip the section header, we'll use our own
                continue;
            }
        }
        
        // Skip end matter (notes, statistics, etc.)
        if (line.startsWith('## Notes') || line.startsWith('## Statistics') || 
            line.startsWith('**Notes') || line.startsWith('**Word Count') ||
            line.startsWith('**Status:**')) {
            break;
        }
        
        // Include content if we're in the content section
        if (inContentSection) {
            cleanLines.push(lines[i]);
            
            // Count words
            if (line.length > 0) {
                wordCount += line.split(/\s+/).filter(word => word.length > 0).length;
            }
        }
    }
    
    return {
        title,
        cleanContent: cleanLines.join('\n').trim(),
        wordCount
    };
}

function extractTitleFromPath(filepath) {
    const filename = basename(filepath, extname(filepath));
    
    // Try various patterns
    let title = filename;
    
    // Scene-based pattern
    const sceneMatch = title.match(/scene-(\d+)([a-z]?)(?:-(.+))?/);
    if (sceneMatch) {
        const sceneNum = sceneMatch[1];
        const sceneLetter = sceneMatch[2] || '';
        const sceneTitle = sceneMatch[3] || '';
        
        if (sceneTitle) {
            const titleCase = sceneTitle
                .replace(/-narrative$/, '')
                .split('-')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');
            return `Scene ${sceneNum}${sceneLetter}: ${titleCase}`;
        } else {
            return `Scene ${sceneNum}${sceneLetter}`;
        }
    }
    
    // Chapter-based pattern
    const chapterMatch = title.match(/chapter-(\d+)(?:-(.+))?/);
    if (chapterMatch) {
        const chapterNum = chapterMatch[1];
        const chapterTitle = chapterMatch[2] || '';
        
        if (chapterTitle) {
            const titleCase = chapterTitle
                .split('-')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');
            return `Chapter ${chapterNum}: ${titleCase}`;
        } else {
            return `Chapter ${chapterNum}`;
        }
    }
    
    // Generic cleanup
    title = title
        .replace(/-narrative$/, '')
        .replace(/[-_]/g, ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    
    return title;
}

function autoDetectTitle(inputPath) {
    const pathParts = inputPath.split('/');
    const lastPart = pathParts[pathParts.length - 1];
    
    // Common story directory names
    if (lastPart === 'narrative' || lastPart === 'narratives') {
        // Use parent directory name
        const parentDir = pathParts[pathParts.length - 2];
        if (parentDir) {
            return parentDir
                .replace(/[-_]/g, ' ')
                .split(' ')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');
        }
    }
    
    return lastPart
        .replace(/[-_]/g, ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

function generateDocument(stories, totalWordCount, options) {
    let text = '';
    
    // Add header
    text += `# ${options.title}\n\n`;
    if (options.subtitle) {
        text += `*${options.subtitle}*\n\n`;
    } else {
        text += `*Complete Narrative*\n\n`;
    }
    
    if (options.includeToc) {
        text += generateTableOfContents(stories, options);
    }
    
    text += `---\n\n`;
    
    // Add stories
    for (const story of stories) {
        text += `\n\n---\n\n`;
        text += `## ${story.title}\n\n`;
        text += story.content;
    }
    
    // Add final statistics
    text += `\n\n---\n\n`;
    text += `**Final Statistics**\n\n`;
    text += `- **Total Sections**: ${stories.length}\n`;
    text += `- **Total Word Count**: ~${totalWordCount.toLocaleString()} words\n`;
    text += `- **Generated**: ${new Date().toISOString().split('T')[0]}\n\n`;
    
    return text;
}

function generateTableOfContents(stories, options) {
    let toc = `## Table of Contents\n\n`;
    
    for (let i = 0; i < stories.length; i++) {
        const story = stories[i];
        const chapterNumber = i + 1;
        
        toc += `${chapterNumber}. [${story.title}](#${generateAnchor(story.title)})`;
        
        if (options.includeStats) {
            toc += ` *(~${story.wordCount.toLocaleString()} words)*`;
        }
        
        toc += `\n`;
    }
    
    toc += `\n`;
    return toc;
}

function generateAnchor(title) {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/--+/g, '-')
        .replace(/^-|-$/g, '');
}

function showHelp() {
    console.log(`
📚 Universal Narrative Concatenation Tool

Generic tool that can work with various narrative file structures.
Automatically detects and processes different file naming conventions.

Usage: node universal-concatenate.mjs [directory] [output-file] [options]

Arguments:
  directory     Directory containing narrative files (default: current directory)
  output-file   Output filename (default: complete-narrative.md)

Options:
  --pattern=GLOB    File pattern to match (default: *-narrative.md, *.md)
  --include-toc     Include table of contents
  --include-stats   Include scene statistics in TOC
  --title=TITLE     Custom document title
  --subtitle=TEXT   Custom subtitle
  --help            Show this help

Examples:
  node universal-concatenate.mjs
  node universal-concatenate.mjs recursive-writing/wasteland-europa/narrative
  node universal-concatenate.mjs stories/ complete-stories.md --title="My Stories"
  node universal-concatenate.mjs chapters/ book.md --pattern="chapter-*.md" --include-toc
  node universal-concatenate.mjs . all-files.md --pattern="*.txt" --title="All Text Files"
`);
}

// Run the script
main().catch(console.error);
