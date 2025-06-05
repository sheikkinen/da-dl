#!/usr/bin/env node
/**
 * keyword_search.mjs
 *
 * Command-line tool to search metadata_index.jsonl for a keyword in title, description, or keyword_categories.
 * Usage: node keyword_search.mjs <keyword> [--field=title|description|keyword_categories]
 */
import fs from 'fs';
import readline from 'readline';
import path from 'path';

const args = process.argv.slice(2);
if (args.length < 1) {
  console.error('Usage: node keyword_search.mjs <keyword> [--field=title|description|keyword_categories]');
  process.exit(1);
}

const keyword = args[0].toLowerCase();
const fieldArg = args.find(arg => arg.startsWith('--field='));
const field = fieldArg ? fieldArg.split('=')[1] : null;
const allowedFields = ['title', 'description_markdown', 'keyword_categories'];
const searchFields = field ? [field] : ['title', 'description_markdown', 'keyword_categories'];

for (const f of searchFields) {
  if (!allowedFields.includes(f)) {
    console.error(`Invalid field: ${f}. Allowed: ${allowedFields.join(', ')}`);
    process.exit(1);
  }
}

const filePath = path.join('analysis', 'metadata_index.jsonl');
const rl = readline.createInterface({
  input: fs.createReadStream(filePath),
  crlfDelay: Infinity
});

let matchCount = 0;
rl.on('line', (line) => {
  if (!line.trim().startsWith('{')) return;
  let entry;
  try {
    entry = JSON.parse(line);
  } catch (e) {
    return;
  }
  for (const f of searchFields) {
    let value = entry[f];
    if (Array.isArray(value)) value = value.join(' ').toLowerCase();
    if (typeof value === 'string' && value.toLowerCase().includes(keyword)) {
      matchCount++;
      console.log(`\n[${entry.file_id}] ${entry.title}`);
      if (entry.description_markdown) {
        const snippet = entry.description_markdown.replace(/\n+/g, ' ').slice(0, 200);
        console.log(`  Desc: ${snippet}${entry.description_markdown.length > 200 ? '...' : ''}`);
      }
      if (entry.keyword_categories) {
        console.log(`  Categories: ${entry.keyword_categories.join(', ')}`);
      }
      break;
    }
  }
});

rl.on('close', () => {
  console.log(`\nTotal matches: ${matchCount}`);
});
