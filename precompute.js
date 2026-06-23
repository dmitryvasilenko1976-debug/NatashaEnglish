'use strict';

/**
 * precompute.js
 *
 * Processes PDFs → articles.json + wordCache.json.
 * Requires LM Studio running at http://localhost:1234 with medgemma-4b-it.
 *
 * Run: node precompute.js
 *
 * Sentence extraction is done in code (no LLM call). LM Studio is used only
 * to generate word explanations for words not already in the cache.
 */

const fs = require('fs');
const path = require('path');
const http = require('http');
const { pathToFileURL } = require('url');
const { PDFParse, VerbosityLevel } = require('pdf-parse');

const LM_STUDIO = { host: 'localhost', port: 1234 };
const MODEL = 'medgemma-4b-it';
const PDF_DIR = path.join(__dirname, 'pdfs');
const ARTICLES_OUT = path.join(__dirname, 'src', 'data', 'articles.json');
const CACHE_OUT = path.join(__dirname, 'src', 'data', 'wordCache.json');

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

// ── ID_TO_TITLE: hardcoded titles for PDF files (overrides extracted text) ───
const PDF_TO_ID = {
  'Community_Acquired_Pneumonia': 'article_1782042159_Communit',
  'Constipation':                 'article_1782042793_Constipa',
  'Croup':                        'article_1782043473_Croup Di',
  'rhinosinusitis':               'article_rhinosinusitis_clean',
  'Gastroenteritis':              'article_1782044644_Gastroen',
  'Hand-Foot':                    'article_1782045008_Hand-Foo',
  'Mononucleosis':                'article_1782045401_Infectio',
  'Otitis':                       'article_1782045883_Otitis M',
  'Common_Cold':                  'article_1782046090_Treatmen',
  'Chronic_Cough':                'article_chronic_cough_2017',
  'Chronic Cough':                'article_chronic_cough_2017',
};

const ID_TO_TITLE = {
  'article_chronic_cough_2017': 'Chronic Cough: Evaluation and Management',
};

function findArticleId(filename) {
  for (const [kw, id] of Object.entries(PDF_TO_ID)) {
    if (filename.includes(kw)) return id;
  }
  // Fallback: deterministic ID from filename
  return 'article_' + filename.replace(/[^a-zA-Z0-9]/g, '_').replace(/_+/g, '_').toLowerCase().replace(/\.pdf_?$/, '');
}

// ── LM Studio call ────────────────────────────────────────────────────────────
function callLMStudio(messages, maxTokens = 800) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({ model: MODEL, max_tokens: maxTokens, messages });
    const req = http.request({
      ...LM_STUDIO,
      path: '/v1/chat/completions',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) },
    }, (res) => {
      let data = '';
      res.on('data', (c) => { data += c; });
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json.choices[0].message.content.trim());
        } catch (e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

// ── PDF text extraction ───────────────────────────────────────────────────────
async function extractRawText(filePath) {
  const fileUrl = pathToFileURL(filePath).href;
  const parser = new PDFParse({ url: fileUrl, verbosity: VerbosityLevel.ERRORS });
  const result = await parser.getText();
  return result.text;
}

// ── Sentence extraction (no LLM) ─────────────────────────────────────────────
const JUNK_PREFIXES = [
  /^author disclosure/i, /^patient information/i, /^cme this clinical/i,
  /^illustration by/i,   /^downloaded from/i,     /^copyright/i,
  /^all other rights/i,  /^for information about the sort/i,
  /^a = consistent/i,    /^b = inconsistent/i,
  /^information from reference/i,
  /^evidence\s*(rating)?$/i, /^clinical recommendation$/i,
];

function extractSentences(rawText) {
  let text = rawText
    .replace(/([a-zA-Z])-\n([a-zA-Z])/g, '$1$2')      // remove typographic line-break hyphens
    .replace(/--\s*\d+\s*of\s*\d+\s*--/gi, ' ')
    .replace(/Downloaded from[\s\S]{0,600}?permission requests\./i, '')
    .replace(/^.{0,40}(?:American Family Physician|www\.aafp\.org\/afp|Volume \d+|◆).{0,120}$/gm, '')
    .replace(/^\s*\d{1,3}\s*$/gm, '')
    .replace(/https?:\/\/\S+/g, '')
    .replace(/\.(\d[\d,\-–]{0,15})(?=\s+[A-Z])/g, '.')
    .replace(/([,.])\s*(\d{1,2})(?=[a-z])/g, '$1 ')
    .replace(/\n+/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();

  const parts = text.split(/(?<=[.!?])\s+(?=[A-Z"(])/);
  const sentences = [];

  for (let s of parts) {
    s = s.replace(/\s{2,}/g, ' ').trim();
    if (s.length < 35 || s.length > 520) continue;
    if (/^\d+$/.test(s)) continue;
    if (/^[A-Z\s]{8,}$/.test(s)) continue;
    if (/^(Table|Figure|Box|Appendix)\s+\d/i.test(s)) continue;
    if (/^[ABC]\s+[\d,\s]+$/.test(s)) continue;
    if (JUNK_PREFIXES.some((re) => re.test(s))) continue;
    sentences.push(s);
  }

  return sentences.slice(0, 55);
}

// ── Word extraction from sentences ───────────────────────────────────────────
function cleanWord(w) {
  return w.replace(/[^a-zA-Z'-]/g, '').toLowerCase();
}

function extractWords(sentences) {
  const words = new Map();
  sentences.forEach((sentence, idx) => {
    sentence.split(/\s+/).forEach((raw) => {
      const clean = cleanWord(raw);
      if (clean.length < 3) return;
      if (STOP_WORDS.has(clean)) return;
      if (/^\d+$/.test(clean)) return;
      if (!words.has(clean)) words.set(clean, { sentence, idx });
    });
  });
  return words;
}

// ── LLM word explanation ──────────────────────────────────────────────────────
async function explainWord(word, sentence) {
  const prompt = `Слово: "${word}"
Предложение из медицинской статьи: "${sentence}"

Верни JSON:
{
  "baseForm": "исходная словарная форма",
  "transcription": "транскрипция IPA в косых скобках",
  "grammaticalForm": "краткое объяснение грамматической формы на русском",
  "translation": "перевод на русском, основное значение",
  "explanation": "объяснение в медицинском контексте на русском, 1-2 предложения",
  "contextBefore": "3-5 слов до искомого слова",
  "contextAfter": "3-5 слов после искомого слова"
}`;

  const response = await callLMStudio([
    { role: 'system', content: 'Отвечай ТОЛЬКО валидным JSON без markdown и без пояснений.' },
    { role: 'user', content: prompt },
  ], 600);

  const cleaned = response.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
  return JSON.parse(cleaned);
}

// ── Title / tag helpers ───────────────────────────────────────────────────────
async function fetchTitle(sentences, articleId) {
  if (ID_TO_TITLE[articleId]) return ID_TO_TITLE[articleId];
  // Ask LLM for title from first sentences
  const preview = sentences.slice(0, 6).join(' ');
  try {
    const resp = await callLMStudio([
      { role: 'system', content: 'You extract the article title. Reply with ONLY the title, no quotes, no punctuation at the end.' },
      { role: 'user', content: `What is the main title of this medical article?\n\n${preview}` },
    ], 80);
    return resp.trim();
  } catch {
    return 'Medical Article';
  }
}

async function fetchTag(sentences) {
  const text = sentences.slice(0, 5).join(' ').toLowerCase();
  if (/pediatr|children|child|infant|neonat/.test(text)) return 'Педиатрия';
  if (/cardio|heart|hypertension/.test(text)) return 'Кардиология';
  if (/pulmon|lung|respiratory|cough/.test(text)) return 'Пульмонология';
  if (/gastro|bowel|hepat|liver/.test(text)) return 'Гастроэнтерология';
  if (/nephro|renal|kidney/.test(text)) return 'Нефрология';
  return 'Медицина';
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  if (!fs.existsSync(PDF_DIR)) fs.mkdirSync(PDF_DIR);

  let wordCache = {};
  if (fs.existsSync(CACHE_OUT)) {
    wordCache = JSON.parse(fs.readFileSync(CACHE_OUT, 'utf8'));
    console.log(`Loaded cache: ${Object.keys(wordCache).length} words`);
  }

  const existingArticles = fs.existsSync(ARTICLES_OUT)
    ? JSON.parse(fs.readFileSync(ARTICLES_OUT, 'utf8'))
    : [];
  const byId = {};
  for (const a of existingArticles) byId[a.id] = a;

  const pdfFiles = fs.readdirSync(PDF_DIR)
    .filter((f) => f.toLowerCase().endsWith('.pdf'))
    .sort();

  if (pdfFiles.length === 0) {
    console.log(`No PDF files found in: ${PDF_DIR}`);
    return;
  }

  console.log(`Found ${pdfFiles.length} PDFs\n`);
  const articles = [];

  for (const file of pdfFiles) {
    const filePath = path.join(PDF_DIR, file);
    const articleId = findArticleId(file);

    console.log(`\nProcessing: ${file}`);

    let rawText;
    try {
      rawText = await extractRawText(filePath);
    } catch (e) {
      console.error(`  ERROR extracting text: ${e.message}`);
      continue;
    }

    const sentences = extractSentences(rawText);
    console.log(`  → ${sentences.length} sentences extracted`);

    const existing = byId[articleId];
    const title = existing ? (ID_TO_TITLE[articleId] || existing.title) : await fetchTitle(sentences, articleId);
    const tag = existing ? existing.tag : await fetchTag(sentences);

    const article = {
      id: articleId,
      title,
      tag,
      sentences,
      addedAt: existing ? existing.addedAt : new Date().toISOString(),
      source: file,
    };
    articles.push(article);

    // Extract words and fill cache
    const words = extractWords(sentences);
    const newWords = [...words.entries()].filter(([w]) => !wordCache[w]);
    console.log(`  Words: ${newWords.length} new / ${words.size} unique`);

    let done = 0;
    for (const [word, { sentence }] of newWords) {
      try {
        wordCache[word] = await explainWord(word, sentence);
        done++;
        if (done % 10 === 0) {
          process.stdout.write(`\r  Progress: ${done}/${newWords.length}`);
          fs.writeFileSync(CACHE_OUT, JSON.stringify(wordCache, null, 2), 'utf8');
        }
      } catch (e) {
        console.error(`\n  Error for "${word}": ${e.message}`);
      }
    }
    if (newWords.length > 0) console.log(`\n  Done: ${done} words explained`);
  }

  fs.writeFileSync(ARTICLES_OUT, JSON.stringify(articles, null, 2), 'utf8');
  fs.writeFileSync(CACHE_OUT, JSON.stringify(wordCache, null, 2), 'utf8');

  console.log(`\n✓ ${articles.length} articles → ${ARTICLES_OUT}`);
  console.log(`✓ ${Object.keys(wordCache).length} words → ${CACHE_OUT}`);
}

main().catch(console.error);
