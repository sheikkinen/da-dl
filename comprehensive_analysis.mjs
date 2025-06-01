#!/usr/bin/env node

/**
 * comprehensive_analysis.mjs
 * 
 * Complete analysis pipeline that:
 * 1. Extracts models from generation info files
 * 2. Updates keyword configuration with new models
 * 3. Runs keyword classification on metadata
 * 4. Generates comprehensive analysis reports
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const RESULTS_DIR = path.join(__dirname, 'results-identify');
const ANALYSIS_DIR = path.join(__dirname, 'analysis');
const CONFIG_FILE = path.join(ANALYSIS_DIR, 'keyword_config.json');
const METADATA_FILE = path.join(ANALYSIS_DIR, 'metadata_index.jsonl');

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

    // Pattern 8: Handle special cases - Hybase Model case
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
 * Step 1: Extract models from all generation info files
 */
async function extractModels() {
    console.log('=== STEP 1: EXTRACTING MODELS ===');
    
    if (!fs.existsSync(RESULTS_DIR)) {
        throw new Error(`Results directory not found: ${RESULTS_DIR}`);
    }

    const files = fs.readdirSync(RESULTS_DIR)
        .filter(file => file.endsWith('.txt'))
        .sort();

    console.log(`Processing ${files.length} generation info files...`);

    const results = [];
    const stats = {
        total: files.length,
        found: 0,
        notFound: 0,
        errors: 0,
        modelCounts: {}
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
                stats.modelCounts[modelName] = (stats.modelCounts[modelName] || 0) + 1;
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

    // Ensure analysis directory exists
    if (!fs.existsSync(ANALYSIS_DIR)) {
        fs.mkdirSync(ANALYSIS_DIR, { recursive: true });
    }

    // Write extracted models
    const extractedModelsFile = path.join(ANALYSIS_DIR, 'extracted_models.jsonl');
    const jsonlContent = results.map(r => JSON.stringify(r)).join('\n') + '\n';
    fs.writeFileSync(extractedModelsFile, jsonlContent);

    console.log(`Models extracted: ${stats.found}/${stats.total} (${((stats.found/stats.total)*100).toFixed(1)}%)`);
    console.log(`Unique models found: ${Object.keys(stats.modelCounts).length}`);
    console.log(`Results saved to: ${extractedModelsFile}`);

    return { results, stats };
}

/**
 * Step 2: Update keyword configuration with new models
 */
async function updateKeywordConfig(modelCounts, minCount = 5) {
    console.log('\n=== STEP 2: UPDATING KEYWORD CONFIGURATION ===');

    if (!fs.existsSync(CONFIG_FILE)) {
        console.log('Keyword config not found, creating basic configuration...');
        const basicConfig = {
            categories: [
                { name: "Anime Model", keywords: [] },
                { name: "SDXL Model", keywords: [] },
                { name: "SD Model", keywords: [] },
                { name: "Flux.1 Model", keywords: [] }
            ],
            fields_to_search: ["title", "tags_comma_separated", "description_markdown"]
        };
        fs.writeFileSync(CONFIG_FILE, JSON.stringify(basicConfig, null, 2));
    }

    const config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
    
    // Get existing keywords
    const existingKeywords = new Set();
    for (const category of config.categories) {
        for (const keyword of category.keywords) {
            existingKeywords.add(keyword);
        }
    }

    // Categorize models
    function categorizeModel(modelName) {
        const name = modelName.toLowerCase();
        
        if (modelName === "Model not found" || modelName === "Hybase Model") {
            return null;
        }
        
        if (name.includes('anime') || name.includes('yiffy') || name.includes('furry')) {
            return 'Anime Model';
        }
        
        if (name.includes('sdxl') || name.includes('xl') || name.includes('stability')) {
            return 'SDXL Model';
        }
        
        if (name.includes('flux')) {
            return 'Flux.1 Model';
        }
        
        return 'SD Model';
    }

    // Find new models to add
    const newModels = {};
    let addedCount = 0;

    for (const [modelName, count] of Object.entries(modelCounts)) {
        if (count >= minCount && !existingKeywords.has(modelName)) {
            const category = categorizeModel(modelName);
            if (category) {
                if (!newModels[category]) {
                    newModels[category] = [];
                }
                newModels[category].push(modelName);
                addedCount++;
            }
        }
    }

    if (addedCount > 0) {
        // Update config
        for (const [categoryName, models] of Object.entries(newModels)) {
            let category = config.categories.find(c => c.name === categoryName);
            if (!category) {
                category = { name: categoryName, keywords: [] };
                config.categories.push(category);
            }
            category.keywords = [...new Set([...category.keywords, ...models])];
        }

        // Create backup and save
        const backupFile = CONFIG_FILE + '.bak';
        if (fs.existsSync(CONFIG_FILE)) {
            fs.copyFileSync(CONFIG_FILE, backupFile);
        }
        
        fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
        console.log(`Added ${addedCount} new model keywords to configuration`);
        console.log(`Backup saved to: ${backupFile}`);
    } else {
        console.log('No new models to add to configuration');
    }

    return addedCount;
}

/**
 * Step 3: Run keyword classification
 */
async function runKeywordClassification() {
    console.log('\n=== STEP 3: RUNNING KEYWORD CLASSIFICATION ===');

    if (!fs.existsSync(METADATA_FILE)) {
        console.log('Warning: metadata_index.jsonl not found, skipping classification');
        return false;
    }

    const classifyScript = path.join(ANALYSIS_DIR, 'classify_by_keyword.mjs');
    if (!fs.existsSync(classifyScript)) {
        console.log('Warning: classify_by_keyword.mjs not found, skipping classification');
        return false;
    }

    try {
        console.log('Running keyword classification...');
        const output = execSync(`node ${classifyScript}`, { 
            cwd: __dirname,
            encoding: 'utf8'
        });
        console.log(output);
        return true;
    } catch (error) {
        console.log(`Classification failed: ${error.message}`);
        return false;
    }
}

/**
 * Step 4: Generate comprehensive analysis report
 */
async function generateAnalysisReport(extractionStats) {
    console.log('\n=== STEP 4: GENERATING ANALYSIS REPORT ===');

    const reportFile = path.join(ANALYSIS_DIR, 'comprehensive_analysis_report.md');
    const timestamp = new Date().toISOString();

    let report = `# Comprehensive Analysis Report\n\n`;
    report += `Generated: ${timestamp}\n\n`;

    // Model extraction summary
    report += `## Model Extraction Summary\n\n`;
    report += `- **Total files processed**: ${extractionStats.total}\n`;
    report += `- **Models found**: ${extractionStats.found} (${((extractionStats.found/extractionStats.total)*100).toFixed(1)}%)\n`;
    report += `- **Models not found**: ${extractionStats.notFound}\n`;
    report += `- **Errors**: ${extractionStats.errors}\n`;
    report += `- **Unique models**: ${Object.keys(extractionStats.modelCounts).length}\n\n`;

    // Top models
    report += `## Top Models by Frequency\n\n`;
    const sortedModels = Object.entries(extractionStats.modelCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 20);

    report += `| Model | Count | Percentage |\n`;
    report += `|-------|-------|------------|\n`;
    for (const [model, count] of sortedModels) {
        const percentage = ((count / extractionStats.total) * 100).toFixed(1);
        report += `| ${model} | ${count} | ${percentage}% |\n`;
    }
    report += `\n`;

    // Model categories
    report += `## Model Categories\n\n`;
    const categories = {
        'Flux Models': 0,
        'SDXL Models': 0,
        'SD Models': 0,
        'Anime Models': 0,
        'Special Cases': 0,
        'Unknown': 0
    };

    for (const [model, count] of Object.entries(extractionStats.modelCounts)) {
        const name = model.toLowerCase();
        if (model === "Hybase Model" || model === "Model not found") {
            categories['Special Cases'] += count;
        } else if (name.includes('flux')) {
            categories['Flux Models'] += count;
        } else if (name.includes('sdxl') || name.includes('xl') || name.includes('stability')) {
            categories['SDXL Models'] += count;
        } else if (name.includes('anime') || name.includes('yiffy') || name.includes('furry')) {
            categories['Anime Models'] += count;
        } else if (name.includes('sd') || name.includes('stable')) {
            categories['SD Models'] += count;
        } else {
            categories['Unknown'] += count;
        }
    }

    for (const [category, count] of Object.entries(categories)) {
        if (count > 0) {
            const percentage = ((count / extractionStats.total) * 100).toFixed(1);
            report += `- **${category}**: ${count} (${percentage}%)\n`;
        }
    }

    // Keyword classification summary (if available)
    if (fs.existsSync(METADATA_FILE)) {
        report += `\n## Keyword Classification Summary\n\n`;
        try {
            const content = fs.readFileSync(METADATA_FILE, 'utf8');
            const lines = content.trim().split('\n');
            let categorizedCount = 0;
            const categoryStats = {};

            for (const line of lines) {
                if (!line.trim()) continue;
                try {
                    const obj = JSON.parse(line);
                    if (obj.keyword_categories && obj.keyword_categories.length > 0) {
                        categorizedCount++;
                        for (const category of obj.keyword_categories) {
                            categoryStats[category] = (categoryStats[category] || 0) + 1;
                        }
                    }
                } catch (e) {
                    // Skip malformed lines
                }
            }

            report += `- **Total metadata entries**: ${lines.length}\n`;
            report += `- **Entries with categories**: ${categorizedCount}\n`;
            report += `- **Categorization rate**: ${((categorizedCount/lines.length)*100).toFixed(1)}%\n\n`;

            if (Object.keys(categoryStats).length > 0) {
                report += `### Category Distribution\n\n`;
                const sortedCategories = Object.entries(categoryStats)
                    .sort(([,a], [,b]) => b - a);

                for (const [category, count] of sortedCategories) {
                    const percentage = ((count / lines.length) * 100).toFixed(1);
                    report += `- **${category}**: ${count} (${percentage}%)\n`;
                }
            }
        } catch (error) {
            report += `Error reading metadata: ${error.message}\n`;
        }
    }

    // Recommendations
    report += `\n## Recommendations\n\n`;
    if (extractionStats.notFound > extractionStats.total * 0.1) {
        report += `- Consider improving model extraction patterns (${extractionStats.notFound} files without models)\n`;
    }
    if (Object.keys(extractionStats.modelCounts).length > 50) {
        report += `- Large number of unique models detected - consider consolidating similar models\n`;
    }

    report += `\n---\n*Report generated by comprehensive_analysis.mjs*\n`;

    fs.writeFileSync(reportFile, report);
    console.log(`Analysis report saved to: ${reportFile}`);
}

/**
 * Main execution function
 */
async function main() {
    console.log('🚀 Comprehensive Analysis Pipeline\n');

    try {
        // Step 1: Extract models
        const { results, stats } = await extractModels();

        // Step 2: Update keyword configuration
        const addedKeywords = await updateKeywordConfig(stats.modelCounts);

        // Step 3: Run keyword classification
        const classificationSuccess = await runKeywordClassification();

        // Step 4: Generate report
        await generateAnalysisReport(stats);

        console.log('\n✅ ANALYSIS COMPLETE');
        console.log(`📊 Processed ${stats.total} files`);
        console.log(`🔍 Found ${stats.found} models`);
        if (addedKeywords > 0) {
            console.log(`📝 Added ${addedKeywords} new keywords`);
        }
        if (classificationSuccess) {
            console.log(`🏷️  Keyword classification completed`);
        }
        console.log(`📋 Analysis report generated`);

    } catch (error) {
        console.error(`❌ Analysis failed: ${error.message}`);
        process.exit(1);
    }
}

main().catch(error => {
    console.error(`Unhandled error: ${error.message}`);
    process.exit(1);
});
