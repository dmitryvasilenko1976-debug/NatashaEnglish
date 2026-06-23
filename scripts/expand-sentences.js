/**
 * expand-sentences.js
 *
 * Re-parses every PDF in /pdfs and rewrites articles.json with FULL sentence
 * extraction (no LM Studio needed — no word-explanation calls here).
 *
 * Run: node scripts/expand-sentences.js
 *
 * What it does:
 *  - Matches each PDF file to an existing article by filename keyword
 *  - Extracts the complete text (no 6000-char truncation)
 *  - Cleans AAFP headers / page markers / trailing citations
 *  - Splits into proper sentences (up to 55 per article)
 *  - Preserves existing id / title / tag from articles.json
 *  - Adds Chronic Cough as a new article (was missing)
 *  - Does NOT touch wordCache.json
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');
const { PDFParse, VerbosityLevel } = require('pdf-parse');

const PDF_DIR = path.join(__dirname, '..', 'pdfs');
const ARTICLES_OUT = path.join(__dirname, '..', 'src', 'data', 'articles.json');

// ── Filename keyword → existing article id ────────────────────────────────────
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

// Titles for new articles not already in articles.json
const ID_TO_TITLE = {
  'article_chronic_cough_2017': 'Chronic Cough: Evaluation and Management',
};

function findArticleId(filename) {
  for (const [keyword, id] of Object.entries(PDF_TO_ID)) {
    if (filename.includes(keyword)) return id;
  }
  return null;
}

// ── PDF text extraction ───────────────────────────────────────────────────────
async function extractRawText(filePath) {
  const fileUrl = pathToFileURL(filePath).href;
  const parser = new PDFParse({ url: fileUrl, verbosity: VerbosityLevel.ERRORS });
  const result = await parser.getText();
  return result.text;
}

// ── Sentence cleaner / extractor ─────────────────────────────────────────────
const JUNK_PREFIXES = [
  /^author disclosure/i,
  /^patient information/i,
  /^cme this clinical/i,
  /^illustration by/i,
  /^downloaded from/i,
  /^copyright/i,
  /^all other rights/i,
  /^for information about the sort/i,
  /^a = consistent/i,
  /^b = inconsistent/i,
  /^information from reference/i,
  /^evidence\s*(rating)?$/i,
  /^clinical recommendation$/i,
];

function isJunk(s) {
  return JUNK_PREFIXES.some((re) => re.test(s));
}

function extractSentences(rawText) {
  let text = rawText
    // Fix typographic line-break hyphens: "mil-\nlion" → "million", "initi-\nated" → "initiated"
    .replace(/([a-zA-Z])-\n([a-zA-Z])/g, '$1$2')
    // Remove "-- N of M --" page separators
    .replace(/--\s*\d+\s*of\s*\d+\s*--/gi, ' ')
    // Remove full AAFP download/copyright block
    .replace(/Downloaded from[\s\S]{0,600}?permission requests\./i, '')
    // Remove running page headers: lines that contain journal/volume info
    .replace(/^.{0,40}(?:American Family Physician|www\.aafp\.org\/afp|Volume \d+|◆).{0,120}$/gm, '')
    // Remove standalone page numbers
    .replace(/^\s*\d{1,3}\s*$/gm, '')
    // Remove URLs
    .replace(/https?:\/\/\S+/g, '')
    // Remove TRAILING inline citation clusters at end of sentence
    // Pattern: sentence text followed by .1,7-9  or .14 before next capital
    .replace(/\.(\d[\d,\-–]{0,15})(?=\s+[A-Z])/g, '.')
    // Remove superscript citations that appear mid-sentence right after punctuation
    // e.g. "visits,2hospitalizations" → "visits, hospitalizations"
    // (single 1-2 digit number stuck between comma/period and lowercase)
    .replace(/([,.])\s*(\d{1,2})(?=[a-z])/g, '$1 ')
    // Collapse whitespace
    .replace(/\n+/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();

  // Protect common abbreviations from splitting
  const ABBREVS = ['Dr', 'Mr', 'Mrs', 'Ms', 'vs', 'Fig', 'No', 'Vol', 'et al', 'i.e', 'e.g', 'approx'];
  ABBREVS.forEach((ab) => {
    const safe = ab.replace('.', '\x01');
    text = text.replace(new RegExp(`\\b${ab.replace('.', '\\.')}\\. `, 'g'), safe + '\x01 ');
  });

  // Split on sentence boundaries: . ! ? followed by space + uppercase or quote
  const parts = text.split(/(?<=[.!?])\s+(?=[A-Z"(])/);

  const sentences = [];
  for (let s of parts) {
    s = s.replace(/\x01/g, '.').replace(/\s{2,}/g, ' ').trim();
    if (s.length < 35) continue;
    if (s.length > 520) continue;
    if (/^\d+$/.test(s)) continue;
    if (/^[A-Z\s]{8,}$/.test(s)) continue;           // all-caps header
    if (/^(Table|Figure|Box|Appendix)\s+\d/i.test(s)) continue;
    if (/^[ABC]\s+[\d,\s]+$/.test(s)) continue;       // evidence rating row
    if (isJunk(s)) continue;
    sentences.push(s);
  }

  return sentences.slice(0, 55);
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  const existingArticles = fs.existsSync(ARTICLES_OUT)
    ? JSON.parse(fs.readFileSync(ARTICLES_OUT, 'utf8'))
    : [];

  const byId = {};
  for (const a of existingArticles) byId[a.id] = a;

  const pdfFiles = fs.readdirSync(PDF_DIR)
    .filter((f) => f.toLowerCase().endsWith('.pdf'))
    .sort();

  console.log(`Found ${pdfFiles.length} PDFs\n`);

  const updatedArticles = [];

  for (const file of pdfFiles) {
    const filePath = path.join(PDF_DIR, file);
    const articleId = findArticleId(file);

    if (!articleId) {
      console.warn(`  SKIP (no id mapping): ${file}`);
      continue;
    }

    let rawText;
    try {
      rawText = await extractRawText(filePath);
    } catch (e) {
      console.error(`  ERROR parsing ${file}: ${e.message}`);
      continue;
    }

    const sentences = extractSentences(rawText);
    const existing = byId[articleId];

    const article = {
      id: articleId,
      title: ID_TO_TITLE[articleId] || (existing ? existing.title : file.replace(/\.pdf$/i, '')),
      tag: existing ? existing.tag : 'Медицина',
      sentences,
      addedAt: existing ? existing.addedAt : new Date().toISOString(),
      source: file,
    };

    updatedArticles.push(article);
    const change = existing
      ? `${existing.sentences.length} → ${sentences.length} sentences`
      : `NEW, ${sentences.length} sentences`;
    console.log(`✓ ${file}\n  (${change})\n  title: ${article.title}\n`);
  }

  // Sort to match original order: known articles first, new at end
  const ORDER = Object.values(PDF_TO_ID);
  updatedArticles.sort((a, b) => ORDER.indexOf(a.id) - ORDER.indexOf(b.id));

  fs.writeFileSync(ARTICLES_OUT, JSON.stringify(updatedArticles, null, 2), 'utf8');
  console.log(`\n✓ Written ${updatedArticles.length} articles → ${ARTICLES_OUT}`);
  console.log('\nNOTE: wordCache.json is unchanged. New words in expanded sentences');
  console.log('      will show "Слово не найдено" until you run: node precompute.js');
}

main().catch((err) => {
  console.error('Fatal:', err.message);
  process.exit(1);
});
