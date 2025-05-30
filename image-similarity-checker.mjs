#!/usr/bin/env node

// image-similarity-checker.mjs
import { imageHash } from 'image-hash';

// Wrap callback in a Promise
function getHash(filePath) {
  return new Promise((resolve, reject) => {
    imageHash(filePath, 16, true, (error, data) => {
      if (error) reject(error);
      else resolve(data);
    });
  });
}

function hammingDistance(hash1, hash2) {
  let dist = 0;
  for (let i = 0; i < hash1.length; i++) {
    if (hash1[i] !== hash2[i]) dist++;
  }
  return dist;
}

const [file1, file2] = process.argv.slice(2);

if (!file1 || !file2) {
  console.error("🖼️  Usage: node image-similarity-checker.mjs <img1> <img2>");
  process.exit(1);
}

try {
  const [hash1, hash2] = await Promise.all([
    getHash(file1),
    getHash(file2),
  ]);

  const distance = hammingDistance(hash1, hash2);

  console.log(`\n🧬 Hash 1: ${hash1}`);
  console.log(`🧬 Hash 2: ${hash2}`);
  console.log(`🧠 Hamming Distance: ${distance}`);

  if (distance <= 7) { // Adjust threshold as needed
    console.log(`✅ Same source (suspiciously sexy match).`);
    process.exit(0);
  } else {
    console.log(`🚨 Different images (or very good plastic surgery).`);
    process.exit(-1);
  }

} catch (err) {
  console.error("💥 Error comparing images:", err);
  process.exit(-1);
}

