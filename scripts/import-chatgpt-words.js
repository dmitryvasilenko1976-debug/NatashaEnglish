'use strict';

/**
 * import-chatgpt-words.js
 *
 * Merges all ChatGPT responses into wordCache.json.
 *
 * Reads all files matching: chatgpt-input/chatgpt-response-*.json
 * (also accepts chatgpt-input/chatgpt-response.json for a single file)
 *
 * Each file must be a JSON object where keys are words and values match:
 *   { baseForm, transcription, grammaticalForm, translation, explanation,
 *     contextBefore, contextAfter }
 *
 * Run: node scripts/import-chatgpt-words.js
 */

const fs = require('fs');
const path = require('path');

const CACHE_PATH = path.join(__dirname, '..', 'src', 'data', 'wordCache.json');
const IN_DIR     = path.join(__dirname, '..', 'chatgpt-input');

// ── Find response files ───────────────────────────────────────────────────────

if (!fs.existsSync(IN_DIR)) {
  console.error(`chatgpt-input/ folder not found. Run export-words-for-chatgpt.js first.`);
  process.exit(1);
}

const responseFiles = fs.readdirSync(IN_DIR)
  .filter((f) => f.match(/^chatgpt-response(-\d+)?\.json$/i))
  .sort()
  .map((f) => path.join(IN_DIR, f));

if (responseFiles.length === 0) {
  console.error('No response files found in chatgpt-input/');
  console.error('Expected file names: chatgpt-response-01.json, chatgpt-response-02.json, ...');
  process.exit(1);
}

console.log(`Found ${responseFiles.length} response file(s):`);
responseFiles.forEach((f) => console.log(`  ${path.basename(f)}`));

// ── Load existing cache ───────────────────────────────────────────────────────

const wordCache = fs.existsSync(CACHE_PATH)
  ? JSON.parse(fs.readFileSync(CACHE_PATH, 'utf8'))
  : {};

const before = Object.keys(wordCache).length;

// ── Process each response file ────────────────────────────────────────────────

const REQUIRED_FIELDS = ['baseForm', 'transcription', 'grammaticalForm', 'translation', 'explanation'];

let totalAdded = 0;
let totalSkipped = 0;
let totalInvalid = 0;

for (const filePath of responseFiles) {
  const fileName = path.basename(filePath);
  let response;

  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    // Strip markdown code fences if ChatGPT wrapped the JSON
    const cleaned = raw.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
    response = JSON.parse(cleaned);
  } catch (e) {
    console.error(`\n  ERROR parsing ${fileName}: ${e.message}`);
    console.error(`  Make sure the file contains valid JSON.`);
    continue;
  }

  let added = 0, skipped = 0, invalid = 0;

  for (const [word, data] of Object.entries(response)) {
    const key = word.toLowerCase().replace(/[^a-zA-Z'-]/g, '');
    if (!key) { invalid++; continue; }

    const missing = REQUIRED_FIELDS.filter((f) => !data[f]);
    if (missing.length > 0) {
      invalid++;
      continue;
    }

    if (wordCache[key]) {
      skipped++;
    } else {
      wordCache[key] = {
        baseForm: data.baseForm,
        transcription: data.transcription,
        grammaticalForm: data.grammaticalForm,
        translation: data.translation,
        explanation: data.explanation,
        contextBefore: data.contextBefore || '',
        contextAfter: data.contextAfter || '',
      };
      added++;
    }
  }

  console.log(`  ${fileName}: +${added} added, ${skipped} skipped, ${invalid} invalid`);
  totalAdded += added;
  totalSkipped += skipped;
  totalInvalid += invalid;
}

// ── Save ──────────────────────────────────────────────────────────────────────

fs.writeFileSync(CACHE_PATH, JSON.stringify(wordCache, null, 2), 'utf8');

const after = Object.keys(wordCache).length;

console.log(`\nTotal:`);
console.log(`  Added:   ${totalAdded} words`);
console.log(`  Skipped: ${totalSkipped} (already in cache)`);
console.log(`  Invalid: ${totalInvalid} (missing required fields)`);
console.log(`  Cache:   ${before} → ${after} words`);
console.log(`\n✓ Saved: ${CACHE_PATH}`);
