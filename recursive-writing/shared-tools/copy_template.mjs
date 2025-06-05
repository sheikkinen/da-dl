#!/usr/bin/env node
// copy_template.mjs
// Usage: node copy_template.mjs <template-type> <target-dir> <name> [datetime]
// Copies a template (character, scene, plot, artifact) to the target directory, names it, updates the story log and timeline.

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TEMPLATE_MAP = {
  character: 'character-template.md',
  scene: 'scene-template.md',
  plot: 'plot-template.md',
  artifact: 'artifact-template.md',
  location: 'location-template.md',
  faction: 'faction-template.md',
  relationships: 'character-relationships-template.md',
  world: 'world-building-template.md',
  breakdown: 'scene-breakdown-template.md',
  conflict: 'conflict-template.md'
};

if (process.argv.length < 5) {
  console.error('Usage: node copy_template.mjs <template-type> <target-dir> <name> [datetime]');
  process.exit(1);
}

const [,, templateType, targetDir, name, datetimeArg] = process.argv;
const baseDir = path.resolve(__dirname, '../shared-artifacts');
const templateFile = path.join(baseDir, TEMPLATE_MAP[templateType]);
const destFile = path.join(targetDir, `${name}.md`);

if (!fs.existsSync(templateFile)) {
  console.error(`Template not found: ${templateFile}`);
  process.exit(1);
}

if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

fs.copyFileSync(templateFile, destFile);

// Find active story and log file
const activeStoryPath = path.resolve(__dirname, '../active-story');
let storyName = '';
if (fs.existsSync(activeStoryPath)) {
  storyName = fs.readFileSync(activeStoryPath, 'utf8').trim();
}
const logFile = path.resolve(__dirname, `../${storyName}/logs/${storyName}.log`);
const timelineFile = path.resolve(__dirname, `../${storyName}/timeline-template.md`);
const now = new Date().toISOString().split('T')[0];
const timelineDate = datetimeArg || now;

// Log the copy action
if (fs.existsSync(logFile)) {
  fs.appendFileSync(logFile, `[${new Date().toISOString()}] copy_template: ${templateType} -> ${destFile}\n`);
}

// Add to timeline if possible
if (fs.existsSync(timelineFile)) {
  // Insert before <end of chronological list>
  const marker = '| <end of chronological list>';
  const newRow = `| ${timelineDate} | Created ${templateType}: ${name} | ${templateType.charAt(0).toUpperCase() + templateType.slice(1)} | Template copied | ${templateType}s/${name} |`;
  let content = fs.readFileSync(timelineFile, 'utf8');
  if (content.includes(marker)) {
    content = content.replace(marker, `${newRow}\n${marker}`);
    fs.writeFileSync(timelineFile, content, 'utf8');
  }
}

console.log(`Copied ${templateType} template to ${destFile} and updated log/timeline.`);
