#!/usr/bin/env node
// theme_category_explorer.mjs: List all unique themes/categories in metadata_index.jsonl and log to the active story log
import fs from 'fs';
import readline from 'readline';
import path from 'path';

const BASE_DIR = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../..');
const recursiveWritingDir = path.join(BASE_DIR, 'recursive-writing');
const activeStoryFile = path.join(recursiveWritingDir, 'active-story');

function getActiveStory() {
  if (fs.existsSync(activeStoryFile)) {
    return fs.readFileSync(activeStoryFile, 'utf-8').trim();
  }
  return null;
}

function getStoryLogPath(storyName) {
  if (!storyName) return null;
  return path.join(recursiveWritingDir, storyName, 'logs', `${storyName}.log`);
}

const indexPath = path.join(BASE_DIR, 'analysis', 'metadata_index.jsonl');
const activeStory = getActiveStory();
const logPath = getStoryLogPath(activeStory);

async function listThemesCategories() {
  const categories = new Set();
  const fileStream = fs.createReadStream(indexPath);
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });
  for await (const line of rl) {
    if (!line.trim().startsWith('{')) continue;
    let entry;
    try {
      entry = JSON.parse(line);
    } catch (e) {
      continue;
    }
    if (Array.isArray(entry.keyword_categories)) {
      for (const cat of entry.keyword_categories) {
        categories.add(cat.trim());
      }
    }
  }
  const sorted = Array.from(categories).sort();
  console.log('Unique themes/categories:');
  for (const cat of sorted) {
    console.log('- ' + cat);
  }
  if (logPath) {
    fs.appendFileSync(logPath, `[${new Date().toISOString()}] theme_category_explorer => ${sorted.length} unique categories listed\n`);
  }
}

listThemesCategories();
