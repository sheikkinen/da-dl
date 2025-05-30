// node describe-replicate.mjs <imageFilePath> [modelName]
// modelName can be 'moondream' (default) or 'llava'

import Replicate from 'replicate';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

// Get the image file path and model name from command-line arguments
const imageFilePath = process.argv[2];
const modelName = process.argv[3] || 'moondream'; // Default to moondream

if (!imageFilePath) {
  console.error('Error: No image file specified.');
  process.exit(1);
}

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
  userAgent: 'https://www.npmjs.com/package/create-replicate'
});

async function runModel(imagePath, selectedModel) {
  // Read the image file and convert to base64
  const imageFile = fs.readFileSync(imagePath);
  const base64Image = Buffer.from(imageFile).toString('base64');
  const mimeType = imagePath.endsWith('.png') ? 'image/png' : imagePath.endsWith('.jpg') || imagePath.endsWith('.jpeg') ? 'image/jpeg' : 'image/webp'; // Basic mime type detection
  const dataURI = `data:${mimeType};base64,${base64Image}`;

  let modelIdentifier;
  let inputPayload;

  if (selectedModel === 'llava') {
    modelIdentifier = "yorickvp/llava-13b:80537f9eead1a5bfa72d5ac6ea6414379be41d4d4f6679fd776e9535d1eb58bb";
    inputPayload = {
      image: dataURI,
      top_p: 1,
      prompt: "Describe image with couple of sentences. List booru tags. Propose an elaborate prompt for similar image",
      max_tokens: 2048,
      temperature: 0.2
    };
  } else { // Default to moondream
    modelIdentifier = "lucataco/moondream2:72ccb656353c348c1385df54b237eeb7bfa874bf11486cf0b9473e691b662d31";
    inputPayload = {
      image: dataURI,
      prompt: "Image description. Booru tags. Generation prompt suggestion" // Updated prompt for consistency
    };
  }

  console.warn(`Running ${selectedModel} model...`);
  const output = await replicate.run(modelIdentifier, { input: inputPayload });
  return output;
}

async function main() {
  console.warn(`Starting to process image file: ${imageFilePath} using ${modelName} model...`);

  try {
    const result = await runModel(imageFilePath, modelName);
    let cleanedResult = String(result); // Ensure it's a string

    // 0. Protect specific comma sequences (", ,") by temporarily changing them to semicolons
    cleanedResult = cleanedResult.replace(/, ,/g, ';');

    // 1. Replace all other commas with a single space
    cleanedResult = cleanedResult.replace(/,/g, ' ');

    // 2. Replace multiple horizontal whitespace characters (spaces, tabs) on each line
    // with a single space, preserving newlines
    cleanedResult = cleanedResult.replace(/[ \t]+/g, ' ');

    // 3. Restore the protected sequences: change semicolons back to a comma followed by a space
    cleanedResult = cleanedResult.replace(/;/g, ', ');

    // 4. Trim leading/trailing whitespace from the final string
    cleanedResult = cleanedResult.trim();

    console.log(cleanedResult); // Log the cleaned result
  } catch (err) {
    console.error(`Error processing image file ${imageFilePath}:`, err);
    process.exit(1); // Exit with error if processing fails
  }

  console.warn("Finished processing image file. Exiting...");
  process.exit(0); // Properly exit the Node.js process
}

main().catch((err) => {
  console.error("Error in main execution:", err);
  process.exit(1);
});
