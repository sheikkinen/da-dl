#!/usr/bin/env node

/**
 * AI Friendly Summary: Tool to read DeviantArt description metadata by file ID from metadata_index.jsonl
 * Purpose: Extract specific artwork descriptions and metadata for Gothic romance research and story development
 * Dependencies: metadata_index.jsonl file in analysis directory
 * Usage: Read full descriptions, titles, and tags for specific DeviantArt artworks by ID
 */

/**
 * read_description_by_id.mjs
 * 
 * Reads DeviantArt description and metadata by file ID from metadata_index.jsonl
 * Supports reading full descriptions, specific fields, or formatted output for research purposes
 * 
 * Cross-references:
 * - keyword_search.mjs (searches for content)
 * - metadata_index.jsonl (data source)
 * - eternal-roses project (Gothic romance research)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Default metadata index path
const DEFAULT_METADATA_PATH = path.join(__dirname, '../../analysis/metadata_index.jsonl');

function displayUsage() {
    console.log(`
Usage: ./read_description_by_id.mjs <file_id> [options]

Options:
  --metadata-path <path>    Path to metadata_index.jsonl (default: ../../analysis/metadata_index.jsonl)
  --field <field_name>      Extract specific field only (title, description_markdown, tags_comma_separated, etc.)
  --format <format>         Output format: 'json', 'text', or 'detailed' (default: detailed)
  --max-length <number>     Limit description length (default: no limit)

Examples:
  ./read_description_by_id.mjs 1000046073
  ./read_description_by_id.mjs 1000046073 --field description_markdown
  ./read_description_by_id.mjs 1000046073 --format json
  ./read_description_by_id.mjs 1000046073 --max-length 500
    `);
}

function parseArgs() {
    const args = process.argv.slice(2);
    
    if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
        displayUsage();
        process.exit(0);
    }
    
    const config = {
        fileId: args[0],
        metadataPath: DEFAULT_METADATA_PATH,
        field: null,
        format: 'detailed',
        maxLength: null
    };
    
    for (let i = 1; i < args.length; i += 2) {
        const flag = args[i];
        const value = args[i + 1];
        
        switch (flag) {
            case '--metadata-path':
                config.metadataPath = value;
                break;
            case '--field':
                config.field = value;
                break;
            case '--format':
                config.format = value;
                break;
            case '--max-length':
                config.maxLength = parseInt(value, 10);
                break;
            default:
                console.error(`Unknown option: ${flag}`);
                process.exit(1);
        }
    }
    
    return config;
}

function readMetadataByFileId(filePath, fileId) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.trim().split('\n');
        
        for (const line of lines) {
            if (line.trim()) {
                try {
                    const entry = JSON.parse(line);
                    if (entry.file_id === fileId) {
                        return entry;
                    }
                } catch (parseError) {
                    // Skip malformed lines
                    continue;
                }
            }
        }
        
        return null;
    } catch (error) {
        throw new Error(`Failed to read metadata file: ${error.message}`);
    }
}

function formatOutput(entry, config) {
    if (!entry) {
        return `No entry found for file ID: ${config.fileId}`;
    }
    
    // If specific field requested
    if (config.field) {
        let value = entry[config.field];
        if (value === undefined) {
            return `Field '${config.field}' not found in entry for ID: ${config.fileId}`;
        }
        
        if (typeof value === 'string' && config.maxLength) {
            value = value.length > config.maxLength ? 
                value.substring(0, config.maxLength) + '...' : value;
        }
        
        return value;
    }
    
    // Format based on requested output format
    switch (config.format) {
        case 'json':
            return JSON.stringify(entry, null, 2);
            
        case 'text':
            let description = entry.description_markdown || 'No description available';
            if (config.maxLength && description.length > config.maxLength) {
                description = description.substring(0, config.maxLength) + '...';
            }
            return description;
            
        case 'detailed':
        default:
            let desc = entry.description_markdown || 'No description available';
            if (config.maxLength && desc.length > config.maxLength) {
                desc = desc.substring(0, config.maxLength) + '...';
            }
            
            return `# DeviantArt Entry: ${entry.file_id}

## Title
${entry.title || 'No title'}

## Published
${entry.published_time_raw || 'Unknown date'}

## Tags
${entry.tags_comma_separated || 'No tags'}

## Categories
${entry.keyword_categories ? entry.keyword_categories.join(', ') : 'No categories'}

## Description
${desc}

## Time Category
Year: ${entry.time_category_year || 'Unknown'}
Month: ${entry.time_category_month || 'Unknown'}
`;
    }
}

function main() {
    try {
        const config = parseArgs();
        
        // Validate metadata file exists
        if (!fs.existsSync(config.metadataPath)) {
            console.error(`Metadata file not found: ${config.metadataPath}`);
            console.error('Please ensure the analysis pipeline has been run to generate metadata_index.jsonl');
            process.exit(1);
        }
        
        // Read entry by file ID
        const entry = readMetadataByFileId(config.metadataPath, config.fileId);
        
        // Format and output result
        const output = formatOutput(entry, config);
        console.log(output);
        
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
}

// Run if called directly
if (import.meta.url === `file://${__filename}`) {
    main();
}

export { readMetadataByFileId, formatOutput };
