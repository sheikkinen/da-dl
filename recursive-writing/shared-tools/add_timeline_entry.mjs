#!/usr/bin/env node
// add_timeline_entry.mjs
// Usage: node add_timeline_entry.mjs <timeline-file> <date> <event> <theme> <description> <reference>
// Appends a new entry to the timeline markdown table before the <end of chronological list> marker.

import fs from 'fs';

if (process.argv.length < 8) {
  console.error('Usage: node add_timeline_entry.mjs <timeline-file> <date> <event> <theme> <description> <reference>');
  process.exit(1);
}

const [,, timelineFile, date, event, theme, description, reference] = process.argv;

const marker = '| <end of chronological list>';
const newRow = `| ${date} | ${event} | ${theme} | ${description} | ${reference} |`;

let content = fs.readFileSync(timelineFile, 'utf8');

if (!content.includes(marker)) {
  console.error('Could not find <end of chronological list> marker in timeline file.');
  process.exit(1);
}

// Insert the new row before the marker
content = content.replace(marker, `${newRow}\n${marker}`);

fs.writeFileSync(timelineFile, content, 'utf8');

console.log(`Added timeline entry: ${newRow}`);
