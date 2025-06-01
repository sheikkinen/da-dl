#!/usr/bin/env node

/**
 * classify_by_keyword.mjs
 * 
 * Reads metadata_index.jsonl and a keyword_config.json file.
 * Matches keywords against specified text fields and adds keyword_categories (a list of matched category names).
 * Updates metadata_index.jsonl in place.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Check if we're in the correct directory
const rootDir = path.join(__dirname, '..');
const readmePath = path.join(rootDir, 'README.md');
const analysisDir = path.join(rootDir, 'analysis');

if (!fs.existsSync(readmePath) || !fs.existsSync(analysisDir)) {
    console.error('Error: This script must be run from the root directory of the da-dl project.');
    console.error(`Current directory: ${process.cwd()}`);
    process.exit(1);
}

const INPUT_FILE = path.join(rootDir, 'analysis', 'metadata_index.jsonl');
const CONFIG_FILE = path.join(rootDir, 'analysis', 'keyword_config.json');
const TEMP_FILE = path.join(rootDir, 'analysis', 'metadata_index.tmp.jsonl');
const BACKUP_FILE = path.join(rootDir, 'analysis', 'metadata_index.jsonl.bak');

/**
 * Load and validate the keyword configuration
 */
function loadConfig() {
    try {
        const configContent = fs.readFileSync(CONFIG_FILE, 'utf8');
        const config = JSON.parse(configContent);
        
        if (!config.categories || !Array.isArray(config.categories)) {
            throw new Error('Config must have a "categories" array');
        }
        
        if (!config.fields_to_search || !Array.isArray(config.fields_to_search)) {
            throw new Error('Config must have a "fields_to_search" array');
        }
        
        // Validate categories structure
        for (const category of config.categories) {
            if (!category.name || typeof category.name !== 'string') {
                throw new Error('Each category must have a "name" string');
            }
            if (!category.keywords || !Array.isArray(category.keywords)) {
                throw new Error(`Category "${category.name}" must have a "keywords" array`);
            }
        }
        
        return config;
    } catch (error) {
        throw new Error(`Failed to load config file: ${error.message}`);
    }
}

/**
 * Parse JSONL file and return array of objects
 */
function parseJSONL(content) {
    const lines = content.trim().split('\n');
    const objects = [];
    const errors = [];
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        try {
            const obj = JSON.parse(line);
            objects.push(obj);
        } catch (error) {
            errors.push({
                lineNumber: i + 1,
                line: line,
                error: error.message
            });
        }
    }
    
    return { objects, errors };
}

/**
 * Check if a keyword matches in the given text (case-insensitive, word boundaries)
 */
function keywordMatches(text, keyword) {
    if (!text || typeof text !== 'string') {
        return false;
    }
    
    // Escape special regex characters in keyword
    const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    
    // Create regex with word boundaries and case-insensitive flag
    const regex = new RegExp(`\\b${escapedKeyword}\\b`, 'i');
    
    return regex.test(text);
}

/**
 * Find matching categories for a given object
 */
function findMatchingCategories(obj, config) {
    const matchedCategories = new Set();
    
    // Iterate through each category
    for (const category of config.categories) {
        let categoryMatched = false;
        
        // Check each field to search
        for (const fieldName of config.fields_to_search) {
            const fieldContent = obj[fieldName];
            
            if (!fieldContent || fieldContent === 'null') {
                continue;
            }
            
            // Check each keyword for this category
            for (const keyword of category.keywords) {
                if (keywordMatches(fieldContent, keyword)) {
                    matchedCategories.add(category.name);
                    categoryMatched = true;
                    break; // Found a match for this category, move to next category
                }
            }
            
            if (categoryMatched) {
                break; // Found a match for this category, move to next category
            }
        }
    }
    
    return Array.from(matchedCategories);
}

/**
 * Process a single object to add keyword categorization
 */
function processObject(obj, config) {
    const fileId = obj.file_id || 'UNKNOWN_FILE_ID';
    const matchedCategories = findMatchingCategories(obj, config);
    
    return {
        ...obj,
        keyword_categories: matchedCategories
    };
}

/**
 * Main execution function
 */
async function main() {
    console.log('Starting keyword-based classification...');
    
    // Check if input files exist
    if (!fs.existsSync(INPUT_FILE)) {
        console.error(`Error: Input file not found: ${INPUT_FILE}`);
        process.exit(1);
    }
    
    if (!fs.existsSync(CONFIG_FILE)) {
        console.error(`Error: Keyword config file not found: ${CONFIG_FILE}`);
        process.exit(1);
    }
    
    try {
        // Load configuration
        console.log('Loading keyword configuration...');
        const config = loadConfig();
        console.log(`Loaded ${config.categories.length} categories and ${config.fields_to_search.length} fields to search`);
        
        // Create backup
        console.log('Creating backup...');
        fs.copyFileSync(INPUT_FILE, BACKUP_FILE);
        
        // Read and parse input file
        console.log('Reading input file...');
        const content = fs.readFileSync(INPUT_FILE, 'utf8');
        const { objects, errors } = parseJSONL(content);
        
        if (errors.length > 0) {
            console.warn(`Warning: ${errors.length} malformed JSON lines found:`);
            errors.forEach(err => {
                console.warn(`  Line ${err.lineNumber}: ${err.error}`);
            });
        }
        
        if (objects.length === 0) {
            console.error('Error: No valid JSON objects found in input file.');
            process.exit(1);
        }
        
        console.log(`Found ${objects.length} valid JSON objects to process.`);
        
        // Process each object
        console.log('Processing objects...');
        const processedObjects = objects.map(obj => processObject(obj, config));
        
        // Calculate statistics
        const stats = {
            totalProcessed: processedObjects.length,
            categorizedObjects: 0,
            categoryDistribution: {}
        };
        
        processedObjects.forEach(obj => {
            if (obj.keyword_categories && obj.keyword_categories.length > 0) {
                stats.categorizedObjects++;
                obj.keyword_categories.forEach(category => {
                    stats.categoryDistribution[category] = (stats.categoryDistribution[category] || 0) + 1;
                });
            }
        });
        
        // Write to temporary file first
        console.log('Writing to temporary file...');
        const tempContent = processedObjects
            .map(obj => JSON.stringify(obj))
            .join('\n') + '\n';
        
        fs.writeFileSync(TEMP_FILE, tempContent, 'utf8');
        
        // Replace original file with processed version
        console.log('Updating original file...');
        fs.renameSync(TEMP_FILE, INPUT_FILE);
        
        console.log('Keyword-based classification complete!');
        console.log(`${INPUT_FILE} updated.`);
        console.log(`${stats.totalProcessed} objects processed successfully.`);
        console.log(`${stats.categorizedObjects} objects received keyword categories.`);
        console.log(`Backup saved as: ${BACKUP_FILE}`);
        
        // Show category distribution
        if (Object.keys(stats.categoryDistribution).length > 0) {
            console.log('\nCategory distribution:');
            Object.entries(stats.categoryDistribution)
                .sort(([,a], [,b]) => b - a)
                .forEach(([category, count]) => {
                    console.log(`  ${category}: ${count}`);
                });
        }
        
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
