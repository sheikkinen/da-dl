#!/usr/bin/env node
// random_inspiration_picker.mjs: Pick a random entry from metadata_index.jsonl and log to the active story log
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

async function pickRandomInspiration() {
  // First, count lines
  let total = 0;
  const lines = [];
  const fileStream = fs.createReadStream(indexPath);
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });
  for await (const line of rl) {
    if (line.trim().startsWith('{')) {
      lines.push(line);
      total++;
    }
  }
  if (total === 0) {
    console.log('No entries found.');
    return;
  }
  const idx = Math.floor(Math.random() * total);
  const entry = JSON.parse(lines[idx]);
  const output = `[${entry.file_id}] ${entry.title}\n  Desc: ${(entry.description_markdown||'').replace(/\n+/g, ' ').slice(0, 200)}${(entry.description_markdown||'').length > 200 ? '...' : ''}\n  Categories: ${(entry.keyword_categories||[]).join(', ')}`;
  console.log(`Random inspiration:\n${output}`);
  if (logPath) {
    fs.appendFileSync(logPath, `[${new Date().toISOString()}] random_inspiration_picker => ${output}\n`);
  }
}

pickRandomInspiration();
