#!/usr/bin/env node

/**
 * validate_extraction.mjs
 * 
 * Quick validation script to confirm extraction improvements
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Read the latest extracted models file
const extractedModelsFile = path.join(__dirname, 'analysis', 'extracted_models.jsonl');

if (!fs.existsSync(extractedModelsFile)) {
    console.error('Extracted models file not found!');
    process.exit(1);
}

const content = fs.readFileSync(extractedModelsFile, 'utf8');
const lines = content.trim().split('\n');

let found = 0;
let notFound = 0;
const modelCounts = {};

for (const line of lines) {
    const entry = JSON.parse(line);
    if (entry.model_name === "Model not found") {
        notFound++;
    } else {
        found++;
        modelCounts[entry.model_name] = (modelCounts[entry.model_name] || 0) + 1;
    }
}

const total = found + notFound;
const successRate = ((found / total) * 100).toFixed(1);

console.log('=== EXTRACTION VALIDATION ===');
console.log(`Total files: ${total}`);
console.log(`Models found: ${found} (${successRate}%)`);
console.log(`Models not found: ${notFound}`);
console.log(`Unique models: ${Object.keys(modelCounts).length}`);

console.log('\nTop 10 models:');
const sortedModels = Object.entries(modelCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10);

for (const [model, count] of sortedModels) {
    const percentage = ((count / total) * 100).toFixed(1);
    console.log(`  ${model}: ${count} (${percentage}%)`);
}
