#!/usr/bin/env node

import { promises as fs } from 'fs';
import natural from 'natural'; // Corrected import
const { DiceCoefficient } = natural; // Corrected import

// --- CONFIGURATION ---
// The similarity score required to be considered a "match".
// 0.85 means the paragraphs must be at least 85% similar.
const SIMILARITY_THRESHOLD = 0.85;


/**
 * Normalizes text by converting to lowercase and removing common punctuation.
 * @param {string} text - The input string.
 * @returns {string} The normalized string.
 */
function normalizeText(text) {
  return text.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"").replace(/\s{2,}/g," ");
}

/**
 * Splits a block of text into paragraphs.
 * It splits by one or more empty lines.
 * @param {string} text - The full text content from a file.
 * @returns {string[]} An array of paragraphs.
 */
function splitIntoParagraphs(text) {
    if (!text) return [];
    // Split by one or more newlines, potentially with whitespace between them
    return text.split(/\n\s*\n+/).filter(p => p.trim() !== '');
}


/**
 * Main function to find and report on similar paragraphs.
 */
async function main() {
  const files = process.argv.slice(2);
  if (files.length !== 2) {
    console.error('Usage: node checkSimilarity.mjs <file1.txt> <file2.txt>');
    process.exit(1);
  }

  const [file1Path, file2Path] = files;
  console.log(`Comparing paragraphs between "${file1Path}" and "${file2Path}"...`);
  console.log(`Using a similarity threshold of ${Math.round(SIMILARITY_THRESHOLD * 100)}%\n`);

  try {
    const content1 = await fs.readFile(file1Path, 'utf8');
    const content2 = await fs.readFile(file2Path, 'utf8');

    const paragraphs1 = splitIntoParagraphs(content1);
    const paragraphs2 = splitIntoParagraphs(content2);

    if (paragraphs1.length === 0 || paragraphs2.length === 0) {
        console.warn('One or both files appear to be empty or contain no paragraphs.');
        return;
    }

    const matches = [];

    // Loop through each paragraph combination to find similarities
    paragraphs1.forEach((p1, index1) => {
        paragraphs2.forEach((p2, index2) => {
            // Normalize for a more accurate comparison of content
            const normalizedP1 = normalizeText(p1);
            const normalizedP2 = normalizeText(p2);
            
            const score = DiceCoefficient(normalizedP1, normalizedP2);
            
            if (score >= SIMILARITY_THRESHOLD) {
                matches.push({
                    score,
                    file1: { path: file1Path, index: index1 + 1, text: p1.trim() },
                    file2: { path: file2Path, index: index2 + 1, text: p2.trim() }
                });
            }
        });
    });

    // --- Report the findings ---
    if (matches.length === 0) {
        console.log('✅ No paragraphs with high similarity found.');
        return;
    }

    console.log(`Found ${matches.length} highly similar paragraph(s):\n`);

    // Sort matches by the highest score first
    matches.sort((a, b) => b.score - a.score);

    matches.forEach(match => {
        const scorePercent = (match.score * 100).toFixed(2);
        console.log('--------------------------------------------------');
        console.log(`MATCH FOUND (Similarity: ${scorePercent}%)`);
        console.log('--------------------------------------------------');
        
        console.log(`\n[ In ${match.file1.path} | Paragraph #${match.file1.index} ]`);
        console.log(`> ${match.file1.text.replace(/\n/g, '\n> ')}`); // Indent multiline paragraphs
        
        console.log(`\n[ In ${match.file2.path} | Paragraph #${match.file2.index} ]`);
        console.log(`> ${match.file2.text.replace(/\n/g, '\n> ')}`);
        
        console.log('\n');
    });

  } catch (error) {
    console.error('Error reading or processing files:', error.message);
  }
}

main();