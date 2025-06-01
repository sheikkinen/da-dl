#!/usr/bin/env node

/**
 * update_keyword_config_with_models.mjs
 * 
 * Updates keyword_config.json with newly discovered models from the extracted_models.jsonl file.
 * Automatically categorizes models based on naming patterns.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ANALYSIS_DIR = path.join(__dirname, 'analysis');
const CONFIG_FILE = path.join(ANALYSIS_DIR, 'keyword_config.json');
const EXTRACTED_MODELS_FILE = path.join(ANALYSIS_DIR, 'extracted_models.jsonl');

/**
 * Categorize model based on name patterns
 */
function categorizeModel(modelName) {
    const name = modelName.toLowerCase();
    
    // Skip special cases
    if (modelName === "Model not found" || modelName === "Hybase Model") {
        return null;
    }
    
    // Anime models
    if (name.includes('anime') || name.includes('yiffy') || name.includes('furry')) {
        return 'Anime Model';
    }
    
    // SDXL models
    if (name.includes('sdxl') || name.includes('xl') || name.includes('stability')) {
        return 'SDXL Model';
    }
    
    // Flux models
    if (name.includes('flux')) {
        return 'Flux.1 Model';
    }
    
    // Default to SD Model for others
    return 'SD Model';
}

/**
 * Load extracted models and count frequencies
 */
function loadExtractedModels() {
    if (!fs.existsSync(EXTRACTED_MODELS_FILE)) {
        console.error(`Error: Extracted models file not found: ${EXTRACTED_MODELS_FILE}`);
        process.exit(1);
    }

    const content = fs.readFileSync(EXTRACTED_MODELS_FILE, 'utf8');
    const lines = content.trim().split('\n');
    const modelCounts = {};

    for (const line of lines) {
        if (!line.trim()) continue;
        
        try {
            const obj = JSON.parse(line);
            const modelName = obj.model_name;
            if (modelName) {
                modelCounts[modelName] = (modelCounts[modelName] || 0) + 1;
            }
        } catch (error) {
            console.warn(`Warning: Failed to parse line: ${line}`);
        }
    }

    return modelCounts;
}

/**
 * Load current keyword configuration
 */
function loadCurrentConfig() {
    if (!fs.existsSync(CONFIG_FILE)) {
        console.error(`Error: Keyword config file not found: ${CONFIG_FILE}`);
        process.exit(1);
    }

    const content = fs.readFileSync(CONFIG_FILE, 'utf8');
    return JSON.parse(content);
}

/**
 * Get all existing keywords from config
 */
function getExistingKeywords(config) {
    const existing = new Set();
    for (const category of config.categories) {
        for (const keyword of category.keywords) {
            existing.add(keyword);
        }
    }
    return existing;
}

/**
 * Update configuration with new models
 */
function updateConfig(config, modelCounts, minCount = 5) {
    const existingKeywords = getExistingKeywords(config);
    const newModels = {};
    
    // Group new models by category
    for (const [modelName, count] of Object.entries(modelCounts)) {
        // Only include models that appear frequently enough and aren't already in config
        if (count >= minCount && !existingKeywords.has(modelName)) {
            const category = categorizeModel(modelName);
            if (category) {
                if (!newModels[category]) {
                    newModels[category] = [];
                }
                newModels[category].push(modelName);
            }
        }
    }

    // Update config with new models
    let updatedCategories = 0;
    let addedKeywords = 0;

    for (const [categoryName, models] of Object.entries(newModels)) {
        // Find existing category or create new one
        let category = config.categories.find(c => c.name === categoryName);
        
        if (!category) {
            // Create new category
            category = {
                name: categoryName,
                keywords: []
            };
            config.categories.push(category);
            console.log(`Created new category: ${categoryName}`);
        }
        
        // Add new models to category
        const beforeCount = category.keywords.length;
        category.keywords = [...new Set([...category.keywords, ...models])];
        const afterCount = category.keywords.length;
        const added = afterCount - beforeCount;
        
        if (added > 0) {
            updatedCategories++;
            addedKeywords += added;
            console.log(`Added ${added} new models to "${categoryName}": ${models.join(', ')}`);
        }
    }

    return { updatedCategories, addedKeywords };
}

/**
 * Main execution function
 */
async function main() {
    console.log('Updating keyword configuration with discovered models...\n');

    // Load data
    console.log('Loading extracted models...');
    const modelCounts = loadExtractedModels();
    const totalModels = Object.keys(modelCounts).length;
    console.log(`Found ${totalModels} unique models`);

    console.log('Loading current keyword configuration...');
    const config = loadCurrentConfig();
    console.log(`Current config has ${config.categories.length} categories`);

    // Show model distribution
    console.log('\nTop 10 most frequent models:');
    const sortedModels = Object.entries(modelCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10);
    
    for (const [model, count] of sortedModels) {
        console.log(`  ${model}: ${count}`);
    }

    // Update configuration
    console.log('\nUpdating configuration...');
    const minCount = process.argv.includes('--min-count') 
        ? parseInt(process.argv[process.argv.indexOf('--min-count') + 1]) 
        : 5;
    
    console.log(`Using minimum count threshold: ${minCount}`);
    
    const { updatedCategories, addedKeywords } = updateConfig(config, modelCounts, minCount);

    if (addedKeywords > 0) {
        // Create backup
        const backupFile = CONFIG_FILE + '.bak';
        fs.copyFileSync(CONFIG_FILE, backupFile);
        console.log(`\nCreated backup: ${backupFile}`);

        // Write updated config
        fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
        console.log(`Updated ${CONFIG_FILE}`);
        
        console.log(`\nSummary:`);
        console.log(`  Categories updated: ${updatedCategories}`);
        console.log(`  Keywords added: ${addedKeywords}`);
    } else {
        console.log('\nNo new models to add (all frequent models already in configuration)');
    }
}

main().catch(error => {
    console.error(`Unhandled error: ${error.message}`);
    process.exit(1);
});
