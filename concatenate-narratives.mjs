#!/usr/bin/env node

/**
 * Narrative Concatenation Tool
 * 
 * Loops through all narrative files in order and concatenates the texts
 * into a single document without meta info. Includes chapter titles.
 * 
 * Usage: node concatenate-narratives.mjs [story-path] [output-file] [options]
 * 
 * Options:
 *   --include-toc     Include table of contents
 *   --include-stats   Include scene statistics in TOC
 *   --format=epub     Format for epub (simpler formatting)
 *   --format=pdf      Format for PDF (more formatting)
 *   --help            Show this help
 * 
 * Examples:
 *   node concatenate-narratives.mjs recursive-writing/wasteland-europa complete-narrative.md
 *   node concatenate-narratives.mjs recursive-writing/wasteland-europa wasteland-europa.md --include-toc
 *   node concatenate-narratives.mjs recursive-writing/wasteland-europa book.md --include-toc --include-stats
 */

import { readdir, readFile, writeFile } from 'fs/promises';
import { join, resolve } from 'path';

// Configuration
const DEFAULT_STORY_PATH = 'recursive-writing/wasteland-europa';
const DEFAULT_OUTPUT = 'complete-narrative.md';

async function main() {
    const args = process.argv.slice(2);
    
    // Parse options
    const options = {
        includeToc: false,
        includeStats: false,
        format: 'markdown',
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
        } else if (arg.startsWith('--format=')) {
            options.format = arg.split('=')[1];
        } else if (!arg.startsWith('--')) {
            nonOptionArgs.push(arg);
        }
    }
    
    if (options.help) {
        showHelp();
        return;
    }
    
    const storyPath = nonOptionArgs[0] || DEFAULT_STORY_PATH;
    const outputFile = nonOptionArgs[1] || DEFAULT_OUTPUT;
    
    const narrativePath = join(storyPath, 'narrative');
    const fullNarrativePath = resolve(narrativePath);
    
    console.log(`📚 Processing narratives from: ${fullNarrativePath}`);
    console.log(`📝 Output file: ${outputFile}`);
    if (options.includeToc) console.log(`📋 Including table of contents`);
    if (options.includeStats) console.log(`📊 Including scene statistics`);
    console.log(`📄 Format: ${options.format}`);
    
    try {
        // Read all narrative files
        const files = await readdir(fullNarrativePath);
        
        // Filter and sort narrative files by scene number
        const narrativeFiles = files
            .filter(file => file.endsWith('-narrative.md'))
            .sort((a, b) => {
                // Extract scene numbers for proper sorting
                const getSceneNumber = (filename) => {
                    const match = filename.match(/scene-(\d+)([a-z]?)/);
                    if (!match) return 0;
                    
                    const num = parseInt(match[1]);
                    const letter = match[2] || '';
                    // Convert letter to decimal (a=0.1, b=0.2, etc.)
                    const letterValue = letter ? (letter.charCodeAt(0) - 'a'.charCodeAt(0) + 1) * 0.1 : 0;
                    return num + letterValue;
                };
                
                return getSceneNumber(a) - getSceneNumber(b);
            });
        
        console.log(`📖 Found ${narrativeFiles.length} narrative files`);
        
        // Process files to extract metadata for TOC
        const scenes = [];
        let totalWordCount = 0;
        
        for (const file of narrativeFiles) {
            const filePath = join(fullNarrativePath, file);
            const content = await readFile(filePath, 'utf-8');
            
            console.log(`📄 Processing: ${file}`);
            
            // Extract chapter title and clean content
            const { title, cleanContent, wordCount } = extractNarrativeContent(content, file);
            
            scenes.push({
                file,
                title,
                content: cleanContent,
                wordCount
            });
            
            totalWordCount += wordCount;
        }
        
        // Generate the complete document
        let concatenatedText = generateDocument(scenes, totalWordCount, options);
        
        // Write output file
        await writeFile(outputFile, concatenatedText, 'utf-8');
        
        console.log(`✅ Complete narrative saved to: ${outputFile}`);
        console.log(`📊 Total word count: ~${totalWordCount.toLocaleString()} words`);
        console.log(`📚 Scenes processed: ${narrativeFiles.length}`);
        
    } catch (error) {
        console.error('❌ Error processing narratives:', error.message);
        process.exit(1);
    }
}

function showHelp() {
    console.log(`
📚 Narrative Concatenation Tool

Loops through all narrative files in order and concatenates the texts
into a single document without meta info. Includes chapter titles.

Usage: node concatenate-narratives.mjs [story-path] [output-file] [options]

Arguments:
  story-path    Path to the story directory (default: recursive-writing/wasteland-europa)
  output-file   Output filename (default: complete-narrative.md)

Options:
  --include-toc     Include table of contents
  --include-stats   Include scene statistics in TOC
  --format=epub     Format for epub (simpler formatting)
  --format=pdf      Format for PDF (more formatting)
  --help            Show this help

Examples:
  node concatenate-narratives.mjs
  node concatenate-narratives.mjs recursive-writing/wasteland-europa complete-narrative.md
  node concatenate-narratives.mjs recursive-writing/wasteland-europa wasteland-europa.md --include-toc
  node concatenate-narratives.mjs recursive-writing/wasteland-europa book.md --include-toc --include-stats
`);
}

function generateDocument(scenes, totalWordCount, options) {
    let text = '';
    
    // Add header
    text += `# Wasteland Europa\n\n`;
    text += `*Complete Narrative*\n\n`;
    
    if (options.includeToc) {
        text += generateTableOfContents(scenes, options);
    }
    
    text += `---\n\n`;
    
    // Add scenes
    for (const scene of scenes) {
        // Add chapter break
        text += `\n\n---\n\n`;
        
        // Add chapter title
        text += `## ${scene.title}\n\n`;
        
        // Add the clean narrative content
        text += scene.content;
    }
    
    // Add final statistics
    text += `\n\n---\n\n`;
    text += `**Final Statistics**\n\n`;
    text += `- **Total Scenes**: ${scenes.length}\n`;
    text += `- **Total Word Count**: ~${totalWordCount.toLocaleString()} words\n`;
    text += `- **Generated**: ${new Date().toISOString().split('T')[0]}\n\n`;
    
    return text;
}

function generateTableOfContents(scenes, options) {
    let toc = `## Table of Contents\n\n`;
    
    for (let i = 0; i < scenes.length; i++) {
        const scene = scenes[i];
        const chapterNumber = i + 1;
        
        toc += `${chapterNumber}. [${scene.title}](#${generateAnchor(scene.title)})`;
        
        if (options.includeStats) {
            toc += ` *(~${scene.wordCount.toLocaleString()} words)*`;
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

/**
 * Extract clean narrative content from a markdown file
 * Removes metadata blocks, comments, and navigation elements
 */
function extractNarrativeContent(content, filename) {
    const lines = content.split('\n');
    let cleanLines = [];
    let title = extractTitleFromFilename(filename);
    let inMetadataBlock = false;
    let inNarrativeSection = false;
    let wordCount = 0;
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        // Skip comment lines
        if (line.startsWith('<!--') || line.startsWith('//') || line.endsWith('-->')) {
            continue;
        }
        
        // Detect main title (extract actual scene title)
        if (line.startsWith('# Scene') && line.includes(':')) {
            const titleMatch = line.match(/# Scene \d+[a-z]?: (.+?)( - Full Narrative)?$/);
            if (titleMatch) {
                title = titleMatch[1];
            }
            continue;
        }
        
        // Skip metadata blocks (lines starting with **)
        if (line.startsWith('**') && line.endsWith('**')) {
            inMetadataBlock = true;
            continue;
        }
        
        // Skip horizontal rules in metadata area
        if (line === '---' && !inNarrativeSection) {
            inMetadataBlock = false;
            continue;
        }
        
        // Skip metadata fields
        if (inMetadataBlock || line.startsWith('**Date**:') || line.startsWith('**Location**:') || 
            line.startsWith('**Duration**:') || line.startsWith('**POV**:') || 
            line.startsWith('**Word Count**:') || line.startsWith('**Status**:')) {
            continue;
        }
        
        // Detect start of actual narrative content
        if (line.startsWith('## ') && !line.includes('Notes') && !line.includes('Word Count') && !line.includes('Revision')) {
            inNarrativeSection = true;
            // Skip the section header itself, we'll use our own chapter title
            continue;
        }
        
        // Skip revision notes and metadata sections at the end
        if (line.startsWith('## Notes') || line.startsWith('## Word Count') || 
            line.startsWith('## Revision') || line.startsWith('**Word Count**') ||
            line.startsWith('**Notes for Revision**')) {
            break;
        }
        
        // If we're in the narrative section, include the content
        if (inNarrativeSection) {
            cleanLines.push(lines[i]); // Keep original formatting
            
            // Count words (rough estimate)
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

/**
 * Extract a readable title from filename
 */
function extractTitleFromFilename(filename) {
    // Remove file extension and "narrative" suffix
    let title = filename.replace(/-narrative\.md$/, '');
    
    // Extract scene number and title
    const match = title.match(/scene-(\d+)([a-z]?)(?:-(.+))?/);
    if (match) {
        const sceneNum = match[1];
        const sceneLetter = match[2] || '';
        const sceneTitle = match[3] || '';
        
        if (sceneTitle) {
            // Convert kebab-case to title case
            const titleCase = sceneTitle
                .split('-')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');
            return `Scene ${sceneNum}${sceneLetter}: ${titleCase}`;
        } else {
            return `Scene ${sceneNum}${sceneLetter}`;
        }
    }
    
    return title;
}

// Run the script
main().catch(console.error);
