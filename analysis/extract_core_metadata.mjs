#!/usr/bin/env node

/**
 * extract_core_metadata.mjs
 * 
 * Iterates through results-gruser/ files, extracts key fields (ID, publishedTime, title, tags, description),
 * and outputs to metadata_index.jsonl in the analysis directory.
 * Description is sourced from description-classified/markdown/ corresponding to the gruser file.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Check if we're in the correct directory
const rootDir = path.join(__dirname, '..');
const readmePath = path.join(rootDir, 'README.md');
const gruserDir = path.join(rootDir, 'results-gruser');
const markdownDir = path.join(rootDir, 'results-mark-id');

if (!fs.existsSync(readmePath) || !fs.existsSync(gruserDir) || !fs.existsSync(markdownDir)) {
    console.error('Error: This script must be run from the root directory of the da-dl project.');
    console.error(`Current directory: ${process.cwd()}`);
    console.error(`Expected to find: ${readmePath}, ${gruserDir}, and ${markdownDir}`);
    process.exit(1);
}

const OUTPUT_FILE = path.join(rootDir, 'analysis', 'metadata_index.jsonl');
const ERROR_LOG = path.join(rootDir, 'analysis', 'extract_core_metadata.errors.log');

/**
 * Extract ID from filename, handling both 'id.json' and 'gruser_id.json' formats
 */
function extractIdFromFilename(filename) {
    const base = path.basename(filename, '.json');
    return base.startsWith('gruser_') ? base.substring(7) : base;
}

/**
 * Read and parse a JSON file safely
 */
function readJsonFile(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(content);
    } catch (error) {
        return null;
    }
}

/**
 * Read a markdown file safely
 */
function readMarkdownFile(filePath) {
    try {
        return fs.readFileSync(filePath, 'utf8');
    } catch (error) {
        return '';
    }
}

/**
 * Extract tags from gruser JSON and format as comma-separated string
 */
function extractTags(gruserData) {
    try {
        const tags = gruserData?.deviation?.tags;
        if (!Array.isArray(tags)) {
            return '';
        }
        
        return tags
            .map(tag => tag?.name)
            .filter(name => name != null && name !== '')
            .join(',');
    } catch (error) {
        return '';
    }
}

/**
 * Process a single gruser file
 */
function processGruserFile(gruserFilePath, errors) {
    const filename = path.basename(gruserFilePath);
    const id = extractIdFromFilename(filename);
    
    // Read and parse gruser JSON
    const gruserData = readJsonFile(gruserFilePath);
    if (!gruserData) {
        errors.push(`Skipping invalid Gruser JSON: ${gruserFilePath}`);
        return null;
    }
    
    // Extract metadata from gruser JSON
    const publishedTimeRaw = gruserData?.deviation?.publishedTime || '';
    const title = gruserData?.deviation?.title || '';
    const tagsCommaSeparated = extractTags(gruserData);
    
    // Read corresponding markdown file
    const markdownFilePath = path.join(markdownDir, `${id}.md`);
    const descriptionMarkdown = readMarkdownFile(markdownFilePath);
    
    if (!fs.existsSync(markdownFilePath)) {
        errors.push(`Markdown file not found for id: ${id}. Expected at path: '${markdownFilePath}'`);
    }
    
    // Create the metadata object
    const metadata = {
        file_id: id,
        published_time_raw: publishedTimeRaw,
        title: title,
        tags_comma_separated: tagsCommaSeparated,
        description_markdown: descriptionMarkdown
    };
    
    return metadata;
}

/**
 * Main execution function
 */
async function main() {
    console.log(`Starting metadata extraction. Markdown files expected in: ${markdownDir}`);
    
    const errors = [];
    const results = [];
    
    try {
        // Find all JSON files in gruser directory
        const files = fs.readdirSync(gruserDir)
            .filter(file => file.endsWith('.json'))
            .map(file => path.join(gruserDir, file));
        
        console.log(`Found ${files.length} JSON files to process`);
        
        // Process each file
        for (const filePath of files) {
            const metadata = processGruserFile(filePath, errors);
            if (metadata) {
                results.push(metadata);
                const id = metadata.file_id;
                // console.log(`Processed: ${id}`);
            }
        }
        
        // Write results to output file
        console.log(`Writing ${results.length} entries to ${OUTPUT_FILE}`);
        const outputLines = results.map(obj => JSON.stringify(obj)).join('\n') + '\n';
        fs.writeFileSync(OUTPUT_FILE, outputLines, 'utf8');
        
        // Write errors to log file
        if (errors.length > 0) {
            fs.writeFileSync(ERROR_LOG, errors.join('\n') + '\n', 'utf8');
            console.log(`Errors (if any) logged in ${ERROR_LOG}`);
            console.log(`${errors.length} errors encountered`);
        } else {
            // Remove error log if no errors
            if (fs.existsSync(ERROR_LOG)) {
                fs.unlinkSync(ERROR_LOG);
            }
        }
        
        console.log(`Metadata extraction complete. Output in ${OUTPUT_FILE}`);
        console.log(`Successfully processed ${results.length} files`);
        
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
}

// Run the main function
main().catch(error => {
    console.error(`Unhandled error: ${error.message}`);
    process.exit(1);
});
