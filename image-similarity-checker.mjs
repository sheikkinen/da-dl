#!/usr/bin/env node

// image-similarity-checker.mjs
import { imageHash } from 'image-hash';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

// Hash cache configuration
const HASH_CACHE_DIR = 'results-hash-cache';
const HASH_CACHE_FILE = path.join(HASH_CACHE_DIR, 'image-hashes.json');

// Ensure cache directory exists
if (!fs.existsSync(HASH_CACHE_DIR)) {
  fs.mkdirSync(HASH_CACHE_DIR, { recursive: true });
}

// Load existing hash cache
let hashCache = {};
try {
  if (fs.existsSync(HASH_CACHE_FILE)) {
    const cacheData = fs.readFileSync(HASH_CACHE_FILE, 'utf8');
    hashCache = JSON.parse(cacheData);
  }
} catch (err) {
  console.warn("⚠️  Could not load hash cache, starting fresh:", err.message);
  hashCache = {};
}

// Save hash cache to disk
function saveHashCache() {
  try {
    fs.writeFileSync(HASH_CACHE_FILE, JSON.stringify(hashCache, null, 2));
  } catch (err) {
    console.warn("⚠️  Could not save hash cache:", err.message);
  }
}

// Generate cache key for a file (based on path + file stats)
function getCacheKey(filePath) {
  try {
    const stats = fs.statSync(filePath);
    const fileInfo = `${filePath}-${stats.size}-${stats.mtime.getTime()}`;
    return crypto.createHash('md5').update(fileInfo).digest('hex');
  } catch (err) {
    // If we can't get file stats, use just the path
    return crypto.createHash('md5').update(filePath).digest('hex');
  }
}

// Wrap callback in a Promise with caching
function getHash(filePath) {
  return new Promise((resolve, reject) => {
    const cacheKey = getCacheKey(filePath);
    
    // Check if hash is already cached
    if (hashCache[cacheKey]) {
      console.log(`📋 Using cached hash for: ${path.basename(filePath)}`);
      resolve(hashCache[cacheKey]);
      return;
    }
    
    console.log(`🔍 Computing hash for: ${path.basename(filePath)}`);
    imageHash(filePath, 16, true, (error, data) => {
      if (error) {
        reject(error);
      } else {
        // Cache the computed hash
        hashCache[cacheKey] = data;
        resolve(data);
      }
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

// Handle cache clearing
if (file1 === '--clear-cache') {
  try {
    if (fs.existsSync(HASH_CACHE_FILE)) {
      fs.unlinkSync(HASH_CACHE_FILE);
      console.log("🧹 Hash cache cleared successfully!");
    } else {
      console.log("ℹ️  No cache file found to clear.");
    }
  } catch (err) {
    console.error("❌ Error clearing cache:", err.message);
  }
  process.exit(0);
}

if (!file1 || !file2) {
  console.error("🖼️  Usage: node image-similarity-checker.mjs <img1> <img2>");
  console.error("       node image-similarity-checker.mjs --clear-cache");
  console.error("📊 Cache statistics:");
  console.error(`   Cached hashes: ${Object.keys(hashCache).length}`);
  console.error(`   Cache file: ${HASH_CACHE_FILE}`);
  process.exit(1);
}

try {
  const [hash1, hash2] = await Promise.all([
    getHash(file1),
    getHash(file2),
  ]);

  // Save cache after computing hashes
  saveHashCache();

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

