#!/usr/bin/env node

/**
 * extract_model_regex.mjs
 * 
 * Simple regex-based model extraction tool for generation info files.
 * Based on the prompt-id-model.txt approach.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const RESULTS_DIR = path.join(__dirname, 'results-identify');

/**
 * Extract model name from generation info text using regex patterns
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

    // Pattern 4: Generic safetensors filename extraction
    const safetensorsMatch = text.match(/([a-zA-Z0-9_.-]+)\.safetensors/i);
    if (safetensorsMatch) {
        const filename = safetensorsMatch[1];
        // Clean up common path prefixes
        const cleanName = filename.replace(/^.*[\\\/]/, '').replace(/^\d+\s*-\s*\w+\s*[\\\/]?/, '');
        return cleanName;
    }

    // Pattern 5: Model hash and name format like "Model hash: 58725940e3, Model: flux-hyp16-Q5_0"
    const hashModelMatch = text.match(/Model\s+hash:\s*[^,]+,\s*Model:\s*([^,\n\r]+)/i);
    if (hashModelMatch) {
        return hashModelMatch[1].trim();
    }

    // Pattern 6: Parameters format with model info
    const parametersMatch = text.match(/parameters:.*Model:\s*([^,\n\r]+)/is);
    if (parametersMatch) {
        return parametersMatch[1].trim();
    }

    // Pattern 7: Model_name field in JSON
    const modelNameJsonMatch = text.match(/"model_name":\s*"([^"]+)"/i);
    if (modelNameJsonMatch) {
        return modelNameJsonMatch[1];
    }

    // Pattern 8: Handle special cases mentioned in prompt-id-model.txt
    // Check if it's Hybase Model case (minimal content)
    if (text.includes('    Description:')) {
        return "Hybase Model";
    }

    // Pattern 9: Fallback for any .ckpt files
    const ckptMatch = text.match(/([a-zA-Z0-9_.-]+)\.ckpt/i);
    if (ckptMatch) {
        const filename = ckptMatch[1];
        const cleanName = filename.replace(/^.*[\\\/]/, '');
        return cleanName;
    }

    return "Model not found";
}

/**
 * Process a single file and extract model name
 */
function processFile(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const modelName = extractModelName(content);
        const fileName = path.basename(filePath, '.txt');
        
        return {
            fileId: fileName,
            modelName: modelName,
            success: true
        };
    } catch (error) {
        const fileName = path.basename(filePath, '.txt');
        return {
            fileId: fileName,
            modelName: "Model not found",
            success: false,
            error: error.message
        };
    }
}

/**
 * Process all files in the results-identify directory
 */
function processAllFiles() {
    if (!fs.existsSync(RESULTS_DIR)) {
        console.error(`Error: Results directory not found: ${RESULTS_DIR}`);
        process.exit(1);
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
        errors: 0,
        modelDistribution: {}
    };

    for (const file of files) {
        const filePath = path.join(RESULTS_DIR, file);
        const result = processFile(filePath);
        results.push(result);

        if (!result.success) {
            stats.errors++;
        } else if (result.modelName === "Model not found") {
            stats.notFound++;
        } else {
            stats.found++;
            // Track model distribution
            stats.modelDistribution[result.modelName] = (stats.modelDistribution[result.modelName] || 0) + 1;
        }
    }

    return { results, stats };
}

/**
 * Test the extraction with specific examples from prompt-id-model.txt
 */
function runTests() {
    console.log('Running tests based on prompt-id-model.txt examples...\n');

    const testCases = [
        {
            name: "Sample Input 1",
            input: "Steps: 25, Sampler: Euler a, CFG scale: 7, Seed: 4158183252, Size: 512x768, Model hash: 3cd5ccf1ba, Model: sardonyxREDUX_v10",
            expected: "sardonyxREDUX_v10"
        },
        {
            name: "Sample Input 2", 
            input: "Steps: 20, Sampler: Euler, Schedule type: Simple, CFG scale: 1, Distilled CFG Scale: 3.5, Seed: 1083098466, Size: 1360x792, Model hash: 58725940e3, Model: flux-hyp16-Q5_0, Lora hashes: \"flux_lora_nina1: e3b0c44298fc\", Version: f2.0.1v1.10.1-previous-530-g8bd7e056, Diffusion in Low Bits: Automatic (fp16 LoRA), Module 1: ae, Module 2: clip_l, Module 3: t5xxl_fp8_e4m3fn",
            expected: "flux-hyp16-Q5_0"
        },
        {
            name: "Sample Input 3",
            input: '{\n  "4": {\n    "inputs": {\n      "ckpt_name": "9 - stability\\\\sdxlUnstableDiffusers_v6StabilityEater.safetensors"\n    },\n    "class_type": "CheckpointLoaderSimple"\n  },\n  ...\n}',
            expected: "sdxlUnstableDiffusers_v6StabilityEater"
        },
        {
            name: "Sample Input 4 - Hybase Model",
            input: "    Description: ",
            expected: "Hybase Model"
        },
        {
            name: "Sample Input 5 - Empty",
            input: "",
            expected: "Model not found"
        }
    ];

    let passed = 0;
    let failed = 0;

    for (const testCase of testCases) {
        const result = extractModelName(testCase.input);
        const success = result === testCase.expected;
        
        console.log(`${testCase.name}: ${success ? '✓ PASS' : '✗ FAIL'}`);
        console.log(`  Expected: "${testCase.expected}"`);
        console.log(`  Got:      "${result}"`);
        console.log();

        if (success) {
            passed++;
        } else {
            failed++;
        }
    }

    console.log(`Test Results: ${passed} passed, ${failed} failed\n`);
    return failed === 0;
}

/**
 * Main execution function
 */
async function main() {
    console.log('Model Extraction Tool (Regex-based)\n');

    // Check command line arguments
    const args = process.argv.slice(2);
    
    if (args.includes('--test') || args.includes('-t')) {
        const testsPassed = runTests();
        process.exit(testsPassed ? 0 : 1);
    }

    if (args.includes('--help') || args.includes('-h')) {
        console.log('Usage:');
        console.log('  node extract_model_regex.mjs              # Process all files');
        console.log('  node extract_model_regex.mjs --test       # Run tests');
        console.log('  node extract_model_regex.mjs --help       # Show this help');
        process.exit(0);
    }

    // Process all files
    const { results, stats } = processAllFiles();

    // Output results
    console.log('=== EXTRACTION RESULTS ===');
    console.log(`Total files processed: ${stats.total}`);
    console.log(`Models found: ${stats.found}`);
    console.log(`Models not found: ${stats.notFound}`);
    console.log(`Errors: ${stats.errors}`);
    console.log();

    if (stats.found > 0) {
        console.log('=== MODEL DISTRIBUTION ===');
        const sortedModels = Object.entries(stats.modelDistribution)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 20); // Top 20 models

        for (const [model, count] of sortedModels) {
            console.log(`${model}: ${count}`);
        }

        if (Object.keys(stats.modelDistribution).length > 20) {
            console.log(`... and ${Object.keys(stats.modelDistribution).length - 20} more models`);
        }
    }

    console.log();

    // Show some examples of not found cases for debugging
    if (stats.notFound > 0) {
        console.log('=== EXAMPLES OF "MODEL NOT FOUND" ===');
        const notFoundExamples = results
            .filter(r => r.modelName === "Model not found")
            .slice(0, 5);
        
        for (const example of notFoundExamples) {
            console.log(`File: ${example.fileId}.txt`);
            try {
                const content = fs.readFileSync(path.join(RESULTS_DIR, `${example.fileId}.txt`), 'utf8');
                const preview = content.substring(0, 200).replace(/\n/g, ' ');
                console.log(`Preview: ${preview}...`);
            } catch (error) {
                console.log(`Error reading file: ${error.message}`);
            }
            console.log();
        }
    }
}

// Run the main function
main().catch(error => {
    console.error(`Unhandled error: ${error.message}`);
    process.exit(1);
});
