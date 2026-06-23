'use strict';

/**
 * export-words-for-chatgpt.js
 *
 * Finds all words in articles.json that are missing from wordCache.json,
 * then writes batches of ~200 words into chatgpt-input/:
 *
 *   chatgpt-input/words-part-01.json   — first batch for ChatGPT
 *   chatgpt-input/words-part-02.json   — second batch, etc.
 *   chatgpt-input/PROMPT.txt           — ready-to-paste prompt for ChatGPT
 *
 * Workflow:
 *   1. node scripts/export-words-for-chatgpt.js
 *   2. For each batch file (words-part-XX.json):
 *      - Open ChatGPT, paste PROMPT.txt, attach the batch file
 *      - Save ChatGPT's response as chatgpt-input/chatgpt-response-XX.json
 *   3. node scripts/import-chatgpt-words.js   (imports ALL response files at once)
 *
 * Run: node scripts/export-words-for-chatgpt.js
 */

const fs = require('fs');
const path = require('path');

const ARTICLES_PATH = path.join(__dirname, '..', 'src', 'data', 'articles.json');
const CACHE_PATH    = path.join(__dirname, '..', 'src', 'data', 'wordCache.json');
const OUT_DIR       = path.join(__dirname, '..', 'chatgpt-input');
const BATCH_SIZE    = 200;

const STOP_WORDS = new Set([
  'the','a','an','is','are','was','were','be','been','being','have','has','had',
  'do','does','did','will','would','could','should','may','might','shall','can',
  'in','on','at','to','for','of','with','by','from','as','into','through',
  'and','or','but','if','this','that','these','those','it','its','they','them',
  'their','we','our','you','your','he','she','his','her','i','me','my',
  'not','no','so','than','too','very','just','also','up','about','which',
  'who','what','when','where','how','all','any','while','then','after','before',
  'more','most','other','some','such','each','both','either','over','under',
  'between','during','without','within','along','following','across','behind',
  'beyond','plus','except','up','out','around','down','off','above','near',
]);

function cleanWord(w) {
  return w.replace(/[^a-zA-Z'-]/g, '').toLowerCase();
}

// ── Load data ─────────────────────────────────────────────────────────────────

if (!fs.existsSync(ARTICLES_PATH)) {
  console.error('articles.json not found. Run node scripts/expand-sentences.js first.');
  process.exit(1);
}

const articles = JSON.parse(fs.readFileSync(ARTICLES_PATH, 'utf8'));
const wordCache = fs.existsSync(CACHE_PATH)
  ? JSON.parse(fs.readFileSync(CACHE_PATH, 'utf8'))
  : {};

console.log(`Loaded ${articles.length} articles, ${Object.keys(wordCache).length} cached words`);

// ── Collect words not yet in cache ────────────────────────────────────────────

const newWords = new Map(); // word → { sentence, articleTitle }

for (const article of articles) {
  for (const sentence of article.sentences) {
    for (const raw of sentence.split(/\s+/)) {
      const word = cleanWord(raw);
      if (!word || word.length < 3) continue;
      if (STOP_WORDS.has(word)) continue;
      if (/^\d+$/.test(word)) continue;
      if (wordCache[word]) continue;
      if (!newWords.has(word)) {
        newWords.set(word, { sentence, articleTitle: article.title });
      }
    }
  }
}

console.log(`New words to explain: ${newWords.size}`);

if (newWords.size === 0) {
  console.log('Nothing to do — all words are already in the cache!');
  process.exit(0);
}

// ── Build batches ─────────────────────────────────────────────────────────────

const wordsArray = [...newWords.entries()].map(([word, { sentence, articleTitle }]) => ({
  word,
  sentence,
  articleTitle,
}));

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR);

const totalBatches = Math.ceil(wordsArray.length / BATCH_SIZE);
const batchFiles = [];

for (let i = 0; i < totalBatches; i++) {
  const batch = wordsArray.slice(i * BATCH_SIZE, (i + 1) * BATCH_SIZE);
  const num = String(i + 1).padStart(2, '0');
  const filePath = path.join(OUT_DIR, `words-part-${num}.json`);
  fs.writeFileSync(filePath, JSON.stringify(batch, null, 2), 'utf8');
  batchFiles.push({ num, filePath, count: batch.length });
  console.log(`  Batch ${num}: ${batch.length} words → ${path.basename(filePath)}`);
}

// ── Write prompt ──────────────────────────────────────────────────────────────

const prompt = `You are a medical English dictionary assistant. I will give you a JSON array of words, each with an example sentence from a medical article.

For each word, return a JSON object where the KEY is the word and the VALUE is an object with these fields:
- "baseForm": the base (dictionary) form of the word
- "transcription": IPA transcription in forward slashes, e.g. /ˌɡæstrəʊˌentəˈraɪtɪs/
- "grammaticalForm": brief grammatical description in Russian (e.g. "существительное", "прилагательное", "глагол")
- "translation": primary Russian translation
- "explanation": 1-2 sentence explanation in Russian in the medical context
- "contextBefore": 3-5 words that appear before the word in the sentence
- "contextAfter": 3-5 words that appear after the word in the sentence

Return ONLY a valid JSON object — no markdown, no code fences, no extra text.

Example of the expected output format:
{
  "gastroenteritis": {
    "baseForm": "gastroenteritis",
    "transcription": "/ˌɡæstrəʊˌentəˈraɪtɪs/",
    "grammaticalForm": "существительное",
    "translation": "гастроэнтерит",
    "explanation": "Воспаление желудка и кишечника, обычно вызванное вирусной или бактериальной инфекцией.",
    "contextBefore": "acute viral",
    "contextAfter": "in children under"
  }
}

I am sending you a batch file with words. Process ALL words in the file and return ONE JSON object containing all of them.`;

const promptFilePath = path.join(OUT_DIR, 'PROMPT.txt');
fs.writeFileSync(promptFilePath, prompt, 'utf8');

// ── Summary ───────────────────────────────────────────────────────────────────

console.log(`\n✓ ${totalBatches} batch files + PROMPT.txt → ${OUT_DIR}`);
console.log(`\nNext steps:`);
console.log(`  For each batch (${totalBatches} total):`);
console.log(`    1. Open ChatGPT (chatgpt.com)`);
console.log(`    2. Paste the contents of chatgpt-input/PROMPT.txt`);
console.log(`    3. Attach the batch file (e.g. words-part-01.json)`);
console.log(`    4. Save ChatGPT's JSON response as chatgpt-input/chatgpt-response-01.json`);
console.log(`       (use matching number: response-01 for part-01, etc.)`);
console.log(`  When all batches are done:`);
console.log(`    node scripts/import-chatgpt-words.js`);
