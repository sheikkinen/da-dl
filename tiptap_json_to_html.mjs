import fs from 'fs';
import { JSDOM } from 'jsdom';
import { generateHTML } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
// Import any other TipTap extensions you use that are not in StarterKit
// e.g., import Image from '@tiptap/extension-image';
// import TextAlign from '@tiptap/extension-text-align';
// import Indent from '@tiptap/extension-indent';

// --- JSDOM Setup ---
const dom = new JSDOM('');
global.window = dom.window;
global.document = dom.window.document;
// global.navigator = dom.window.navigator; // Removed this line
// Some Tiptap extensions might require other globals like CustomEvent, etc.
// If you encounter further errors, you might need to expose more from jsdom window here.
// For example:
// global.CustomEvent = dom.window.CustomEvent;
// global.DOMParser = dom.window.DOMParser;
// global.Node = dom.window.Node;
// global.Text = dom.window.Text;
// global.Element = dom.window.Element;
// global.DocumentFragment = dom.window.DocumentFragment;

const extensions = [
  StarterKit.configure({
    // configure StarterKit options if needed
    // e.g., heading: { levels: [1, 2, 3] },
  }),
  Link.configure({
    openOnClick: false,
  }),
  Underline,
  // Add other extensions here, for example:
  // Image,
  // TextAlign.configure({
  //   types: ['heading', 'paragraph'],
  // }),
  // Indent.configure({
  //   types: ['listItem', 'paragraph'],
  //   minLevel: 0,
  //   maxLevel: 4,
  // })
];

async function convertJsonToHtml(jsonFilePath) {
  try {
    const jsonContent = fs.readFileSync(jsonFilePath, 'utf8');
    const tiptapJson = JSON.parse(jsonContent);

    let documentToConvert;

    // Case 1: Input is the full structure like {"version":1, "document":{...}}
    // This is the case for your sample file.
    if (tiptapJson.document && tiptapJson.document.type === 'doc' && Array.isArray(tiptapJson.document.content)) {
      documentToConvert = tiptapJson.document;
    // Case 2: Input is already the document node itself like {"type":"doc", "content": [...]}
    } else if (tiptapJson.type === 'doc' && Array.isArray(tiptapJson.content)) {
      documentToConvert = tiptapJson;
    } else {
      console.error('Error: Input JSON is not in the expected TipTap document format.');
      console.error('Expected format: {"type":"doc","content":[...]} or {"version":1,"document":{"type":"doc","content":[...]}}');
      console.error('Received (first 200 chars):', JSON.stringify(tiptapJson, null, 2).substring(0, 200));
      process.exit(1);
    }

    const html = generateHTML(documentToConvert, extensions);
    process.stdout.write(html);

  } catch (error) {
    console.error(`Error processing file ${jsonFilePath}:`, error.message);
    // console.error(error); // Uncomment for full error stack
    process.exit(1);
  }
}

const filePath = process.argv[2];
if (!filePath) {
  console.error('Usage: node tiptap_json_to_html.mjs <path_to_json_file>');
  process.exit(1);
}

convertJsonToHtml(filePath);
