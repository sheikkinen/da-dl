#!/usr/bin/env node

/**
 * batch_extract_models.mjs
 * 
 * Batch process generation info files and create a CSV/JSON output
 * with file_id and extracted model name for further analysis.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const RESULTS_DIR = path.join(__dirname, 'results-identify');
const OUTPUT_DIR = path.join(__dirname, 'analysis');

// Import the extraction function (assuming it's in the same directory)
async function loadExtractor() {
    const module = await import('./extract_model_regex.mjs');
    return module;
}

/**
 * Extract model name using the same logic as extract_model_regex.mjs
 */
function extractModelName(text) {
    if (!text || typeof text !== 'string') {
        return "Model not found";
    }

    // Pattern 1: Key-value format like "Model: sardonyxREDUX_v10"
    const modelKeyValueMatch = text.match(/Model:\s*([^,\n\r]+)/i);
    if (modelKeyValueMatch) {
        return modelKeyValueMatch[1].trim();
    }

    // Pattern 2: JSON format like "ckpt_name": "9 - stability\\sdxlUnstableDiffusers_v6StabilityEater.safetensors"
    const ckptNameMatch = text.match(/"ckpt_name":\s*"[^"]*[\\\/]([^\\\/]+?)\.safetensors"/i);
    if (ckptNameMatch) {
        return ckptNameMatch[1];
    }

    // Pattern 3: Alternative JSON format without path separators
    const ckptNameSimpleMatch = text.match(/"ckpt_name":\s*"([^"]+?)\.safetensors"/i);
    if (ckptNameSimpleMatch) {
        const filename = ckptNameSimpleMatch[1];
        // Remove any leading path indicators
        const cleanName = filename.replace(/^.*[\\\/]/, '').replace(/^\d+\s*-\s*\w+\s*[\\\/]?/, '');
        return cleanName;
    }

    // Pattern 4: Handle special cases - Hybase Model case (minimal content)
    if (text.trim().length < 50 && !text.includes('Model') && !text.includes('ckpt_name')) {
        return "Hybase Model";
    }

    return "Model not found";
}

/**
 * Process all files and create output files
 */
async function main() {
    console.log('Batch Model Extraction Tool\n');

    if (!fs.existsSync(RESULTS_DIR)) {
        console.error(`Error: Results directory not found: ${RESULTS_DIR}`);
        process.exit(1);
    }

    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    const files = fs.readdirSync(RESULTS_DIR)
        .filter(file => file.endsWith('.txt'))
        .sort();

    if (files.length === 0) {
        console.error('No .txt files found in results-identify directory');
        process.exit(1);
    }

    console.log(`Processing ${files.length} files...`);

    const results = [];
    const stats = {
        total: files.length,
        found: 0,
        notFound: 0,
        errors: 0
    };

    for (const file of files) {
        const filePath = path.join(RESULTS_DIR, file);
        const fileId = path.basename(file, '.txt');
        
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            const modelName = extractModelName(content);
            
            results.push({
                file_id: fileId,
                model_name: modelName
            });

            if (modelName === "Model not found") {
                stats.notFound++;
            } else {
                stats.found++;
            }
        } catch (error) {
            stats.errors++;
            results.push({
                file_id: fileId,
                model_name: "Model not found",
                error: error.message
            });
        }
    }

    // Write JSON output
    const jsonOutputPath = path.join(OUTPUT_DIR, 'extracted_models.json');
    fs.writeFileSync(jsonOutputPath, JSON.stringify(results, null, 2));

    // Write CSV output
    const csvOutputPath = path.join(OUTPUT_DIR, 'extracted_models.csv');
    const csvHeader = 'file_id,model_name\n';
    const csvRows = results.map(r => `${r.file_id},"${r.model_name}"`).join('\n');
    fs.writeFileSync(csvOutputPath, csvHeader + csvRows);

    // Write JSONL output (compatible with metadata_index.jsonl)
    const jsonlOutputPath = path.join(OUTPUT_DIR, 'extracted_models.jsonl');
    const jsonlContent = results.map(r => JSON.stringify(r)).join('\n') + '\n';
    fs.writeFileSync(jsonlOutputPath, jsonlContent);

    console.log('=== EXTRACTION COMPLETE ===');
    console.log(`Total files processed: ${stats.total}`);
    console.log(`Models found: ${stats.found} (${((stats.found/stats.total)*100).toFixed(1)}%)`);
    console.log(`Models not found: ${stats.notFound}`);
    console.log(`Errors: ${stats.errors}`);
    console.log();
    console.log('Output files created:');
    console.log(`  JSON: ${jsonOutputPath}`);
    console.log(`  CSV:  ${csvOutputPath}`);
    console.log(`  JSONL: ${jsonlOutputPath}`);
}

main().catch(error => {
    console.error(`Unhandled error: ${error.message}`);
    process.exit(1);
});
