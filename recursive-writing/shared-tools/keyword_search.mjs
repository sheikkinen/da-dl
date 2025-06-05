#!/usr/bin/env node
/**
 * keyword_search.mjs
 *
 * Command-line tool to search metadata_index.jsonl for a keyword in title, description, or keyword_categories.
 * Usage: node keyword_search.mjs <keyword>
 */
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

const args = process.argv.slice(2);
if (args.length < 1) {
  console.error('Usage: node keyword_search.mjs <keyword>');
  process.exit(1);
}

const keyword = args[0].toLowerCase();
const indexPath = path.join(BASE_DIR, 'analysis', 'metadata_index.jsonl');
const activeStory = getActiveStory();
const logPath = getStoryLogPath(activeStory);

async function searchKeyword() {
  const fileStream = fs.createReadStream(indexPath);
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });
  let matchCount = 0;
  for await (const line of rl) {
    if (!line.trim().startsWith('{')) continue;
    let entry;
    try {
      entry = JSON.parse(line);
    } catch (e) {
      continue;
    }
    const fields = ['title', 'description_markdown', 'keyword_categories'];
    for (const f of fields) {
      let value = entry[f];
      if (Array.isArray(value)) value = value.join(' ').toLowerCase();
      if (typeof value === 'string' && value.toLowerCase().includes(keyword)) {
        matchCount++;
        const output = `[${entry.file_id}] ${entry.title}\n  Desc: ${(entry.description_markdown||'').replace(/\n+/g, ' ').slice(0, 200)}${(entry.description_markdown||'').length > 200 ? '...' : ''}\n  Categories: ${(entry.keyword_categories||[]).join(', ')}`;
        console.log(`\n${output}`);
        if (logPath) {
          fs.appendFileSync(logPath, `[${new Date().toISOString()}] keyword_search: ${keyword} => ${output}\n`);
        }
        break;
      }
    }
  }
  console.log(`\nTotal matches: ${matchCount}`);
  if (logPath) {
    fs.appendFileSync(logPath, `[${new Date().toISOString()}] keyword_search: ${keyword} => Total matches: ${matchCount}\n`);
  }
}

searchKeyword();
