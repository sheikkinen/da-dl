#!/usr/bin/env node

/**
 * classify_by_time.mjs
 * 
 * Reads metadata_index.jsonl, parses 'published_time_raw',
 * and adds 'time_category_year' and 'time_category_month' to each entry.
 * Updates metadata_index.jsonl in place.
 * 
 * This Node.js version properly handles multi-line JSON objects and escape sequences.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Check if we're in the correct directory (should have README.md and analysis folder)
const rootDir = path.join(__dirname, '..');
const readmePath = path.join(rootDir, 'README.md');
const analysisDir = path.join(rootDir, 'analysis');

if (!fs.existsSync(readmePath) || !fs.existsSync(analysisDir)) {
    console.error('Error: This script must be run from the root directory of the da-dl project.');
    console.error(`Current directory: ${process.cwd()}`);
    console.error(`Expected to find: ${readmePath} and ${analysisDir}`);
    process.exit(1);
}

const INPUT_FILE = path.join(rootDir, 'analysis', 'metadata_index.jsonl');
const TEMP_FILE = path.join(rootDir, 'analysis', 'metadata_index.tmp.jsonl');
const BACKUP_FILE = path.join(rootDir, 'analysis', 'metadata_index.jsonl.bak');

/**
 * Parse a potentially malformed JSONL file where JSON objects may span multiple lines
 */
function parseMultilineJSONL(content) {
    const objects = [];
    let braceCount = 0;
    let inString = false;
    let escapeNext = false;
    let currentObject = '';
    
    for (let i = 0; i < content.length; i++) {
        const char = content[i];
        currentObject += char;
        
        if (escapeNext) {
            escapeNext = false;
            continue;
        }
        
        if (char === '\\') {
            escapeNext = true;
            continue;
        }
        
        if (char === '"' && !escapeNext) {
            inString = !inString;
            continue;
        }
        
        if (!inString) {
            if (char === '{') {
                braceCount++;
            } else if (char === '}') {
                braceCount--;
                
                // If we've closed all braces, we have a complete JSON object
                if (braceCount === 0 && currentObject.trim()) {
                    try {
                        const obj = JSON.parse(currentObject.trim());
                        objects.push(obj);
                    } catch (e) {
                        console.warn(`Warning: Failed to parse JSON object: ${e.message}`);
                        console.warn(`Object preview: ${currentObject.substring(0, 100)}...`);
                    }
                    currentObject = '';
                }
            }
        }
    }
    
    return objects;
}

/**
 * Parse ISO 8601 date string and extract year and year-month
 */
function parseDateTime(dateString) {
    if (!dateString || dateString === 'null') {
        return { year: null, yearMonth: null };
    }
    
    try {
        const date = new Date(dateString);
        
        // Check if the date is valid
        if (isNaN(date.getTime())) {
            return { year: null, yearMonth: null };
        }
        
        const year = date.getFullYear().toString();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const yearMonth = `${year}-${month}`;
        
        return { year, yearMonth };
    } catch (e) {
        console.warn(`Warning: Could not parse date "${dateString}": ${e.message}`);
        return { year: null, yearMonth: null };
    }
}

/**
 * Process a single JSON object to add time categorization
 */
function processObject(obj) {
    const fileId = obj.file_id || 'UNKNOWN_FILE_ID';
    const publishedTimeRaw = obj.published_time_raw;
    
    const { year, yearMonth } = parseDateTime(publishedTimeRaw);
    
    if (!year) {
        if (!publishedTimeRaw || publishedTimeRaw === 'null') {
            console.warn(`Warning: Missing or null published_time_raw for File ID: ${fileId}`);
        } else {
            console.warn(`Warning: Could not parse date for File ID: ${fileId} (published_time_raw: ${publishedTimeRaw})`);
        }
    }
    
    return {
        ...obj,
        time_category_year: year,
        time_category_month: yearMonth
    };
}

/**
 * Main execution function
 */
async function main() {
    console.log('Starting time-based classification...');
    
    // Check if input file exists
    if (!fs.existsSync(INPUT_FILE)) {
        console.error(`Error: Input file not found: ${INPUT_FILE}`);
        process.exit(1);
    }
    
    try {
        // Create backup of original file
        console.log('Creating backup...');
        fs.copyFileSync(INPUT_FILE, BACKUP_FILE);
        
        // Read and parse the input file
        console.log('Reading input file...');
        const content = fs.readFileSync(INPUT_FILE, 'utf8');
        
        // Parse potentially malformed JSONL
        console.log('Parsing JSON objects...');
        const objects = parseMultilineJSONL(content);
        
        if (objects.length === 0) {
            console.error('Error: No valid JSON objects found in input file.');
            process.exit(1);
        }
        
        console.log(`Found ${objects.length} JSON objects to process.`);
        
        // Process each object
        console.log('Processing objects...');
        const processedObjects = objects.map(processObject);
        
        // Write to temporary file first
        console.log('Writing to temporary file...');
        const tempContent = processedObjects
            .map(obj => JSON.stringify(obj))
            .join('\n') + '\n';
        
        fs.writeFileSync(TEMP_FILE, tempContent, 'utf8');
        
        // Replace original file with processed version
        console.log('Updating original file...');
        fs.renameSync(TEMP_FILE, INPUT_FILE);
        
        console.log('Time-based classification complete!');
        console.log(`${INPUT_FILE} updated.`);
        console.log(`${processedObjects.length} objects processed successfully.`);
        console.log(`Backup saved as: ${BACKUP_FILE}`);
        console.log('Output file now contains properly formatted JSONL (one JSON object per line).');
        
    } catch (error) {
        console.error(`Error: ${error.message}`);
        
        // Clean up temporary file if it exists
        if (fs.existsSync(TEMP_FILE)) {
            fs.unlinkSync(TEMP_FILE);
        }
        
        process.exit(1);
    }
}

// Run the main function
main().catch(error => {
    console.error(`Unhandled error: ${error.message}`);
    process.exit(1);
});
