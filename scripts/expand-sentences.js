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

function isJunk(s) {
  // ── Author bios ───────────────────────────────────────────────────────────────
  // "Hartman, MD, is an associate professor..." / "SMITH, DO, is program director..."
  if (/\b(MD|DO|PhD|MPH),?\s+is\s+\w/i.test(s)) return true;
  // Author name lists with 2+ credential markers: "Kuckel, MD, ...; Recidoro, DO..."
  if ((s.match(/,\s*(MD|DO|PhD|MPH|FAAFP|FRCPC|CAQSM|FACP|FACEP)\b/g) || []).length >= 2) return true;
  // Single-credential author line: "Kuckel, MD, Naval Hospital Jacksonville..."
  if (/^[A-Z][a-z]+,\s*(MD|DO|PhD|MPH|FAAFP|FRCPC|CAQSM)\b/.test(s)) return true;
  // "The Authors ELIE MULHEM, MD..." — bio block that wasn't cut pre-split
  if (/^The\s+Authors?\s+[A-Z]/.test(s)) return true;
  // Credential abbreviation line: "FAAFP, UNC Orthopedics, 3551..."
  if (/^(FAAFP|FRCPC|CAQSM|FACP|FACEP),\s+/.test(s)) return true;
  // Email address in sentence
  if (/\(email:/.test(s)) return true;
  // ── Bibliography / references ─────────────────────────────────────────────────
  // Journal volume/issue pattern (with or without space before page): "2016;150(6):1464" / "2006;22(6): 443-444"
  if (/\b\d{4};\d+\(\d+\)\s*:\s*\d+/.test(s)) return true;
  // Am Fam Physician citation
  if (/Am\s+Fam\s+Physician/i.test(s)) return true;
  // Bibliography entry starting with "LastName Initials," and containing et al.
  if (/^[A-Z][a-zA-Z-]+\s+[A-Z]{1,3}[,\s]/.test(s) && s.includes('et al.')) return true;
  // All-caps author name: "HOLLY ANN RUSSELL, MD, MS, is an assistant..."
  if (/^[A-Z]{2,}(\s+[A-Z]{2,})+,?\s+(MD|DO|PhD|MPH|MS)\b/.test(s)) return true;
  // Reference list: 3+ "Lastname Initials," patterns (pure author list row)
  if ((s.match(/\b[A-Z][a-z]+\s+[A-Z]{1,3}[,\.]/g) || []).length >= 3) return true;
  // Journal volume pattern allowing electronic page numbers: "2016;2(1):e48"
  if (/\b\d{4};\d+\(\d+\)\s*:\s*[e\d]\d*/.test(s)) return true;
  // Numbered reference list entry ending with ". 10." pattern
  if (/\.\s*\d{1,2}\.\s*$/.test(s)) return true;
  // "[published correction appears in" — editorial note in reference
  if (/\[published\s+correction\b/i.test(s)) return true;
  // ── Reprints / permissions ────────────────────────────────────────────────────
  if (/^Reprints?\b/i.test(s)) return true;
  if (/^Reprinted\s+with\b/i.test(s)) return true;
  if (/^Adapted\s+with\s+permission\b/i.test(s)) return true;
  if (s.includes('Adapted with permission')) return true;
  // ── Correspondence / disclosure ───────────────────────────────────────────────
  if (/^Address\s+correspondence\b/i.test(s)) return true;
  if (/\bconflicts?\s+of\s+interest\b/i.test(s)) return true;
  if (/\bdisclosure\b.{0,60}\bstatement/i.test(s)) return true;
  if (/\bCompleted\s+Conflict\b/i.test(s)) return true;
  if (/^Dr\.?\s+\w+\s+is\s+a\s+(consultant|speaker|advisor|stockholder)\b/i.test(s)) return true;
  if (/\bworkgroup\s+level\b.{0,60}\bconflict\b/i.test(s)) return true;
  // ── Metadata lines ────────────────────────────────────────────────────────────
  if (/^Search\s+dates?:/i.test(s)) return true;
  if (/^Data\s+sources?:/i.test(s)) return true;
  if (/^CME\s+This\b/i.test(s)) return true;
  if (/^This\s+article\s+updates\s+previous/i.test(s)) return true;
  // ── Legacy patterns ───────────────────────────────────────────────────────────
  if (/^author disclosure/i.test(s)) return true;
  if (/^patient information/i.test(s)) return true;
  if (/^illustration by/i.test(s)) return true;
  if (/^downloaded from/i.test(s)) return true;
  if (/^copyright/i.test(s)) return true;
  if (/^all other rights/i.test(s)) return true;
  if (/^for information about the sort/i.test(s)) return true;
  if (/^a = consistent/i.test(s)) return true;
  if (/^b = inconsistent/i.test(s)) return true;
  if (/^information from reference/i.test(s)) return true;
  if (/^evidence\s*(rating)?$/i.test(s)) return true;
  if (/^clinical recommendation$/i.test(s)) return true;
  return false;
}

function extractSentences(rawText) {
  let text = rawText
    // Fix typographic line-break hyphens: "mil-\nlion" → "million"
    .replace(/([a-zA-Z])-\n([a-zA-Z])/g, '$1$2')
    // Remove "-- N of M --" page separators
    .replace(/--\s*\d+\s*of\s*\d+\s*--/gi, ' ')
    // Remove full AAFP download/copyright block
    .replace(/Downloaded from[\s\S]{0,600}?permission requests\./i, '')
    // Remove "The Authors" section and all bio text that follows (to end of document)
    .replace(/\bThe\s+Authors?\b[\s\S]{0,4000}$/, '')
    // Remove "Data Sources" paragraph (usually near end)
    .replace(/\bData\s+Sources?\b[\s\S]{0,1200}?(?=\n\s*\n|\bSearch\b|\bThe\s+Authors?\b|$)/i, '')
    // Remove "Search dates" line
    .replace(/Search\s+dates?:[^\n]{0,200}\n?/gi, '')
    // Remove CME notice block
    .replace(/CME\s+This\s+clinical\s+content[\s\S]{0,400}?(?=\n\n|$)/gi, '')
    // Remove (Am Fam Physician. YYYY;Vol(Iss):pp.) journal citation blobs
    .replace(/\(Am\s+Fam\s+Physician\.[^)]{5,80}\)/gi, '')
    // Remove running page headers: lines with journal/volume info
    .replace(/^.{0,40}(?:American Family Physician|www\.aafp\.org\/afp|Volume \d+|◆).{0,120}$/gm, '')
    // Remove "Reprints:" line
    .replace(/^Reprints?:[^\n]{0,200}\n?/gim, '')
    // Remove "Address correspondence" line
    .replace(/^Address\s+correspondence[^\n]{0,200}\n?/gim, '')
    // Remove standalone page numbers
    .replace(/^\s*\d{1,3}\s*$/gm, '')
    // Remove URLs
    .replace(/https?:\/\/\S+/g, '')
    // Remove inline citation superscripts after punctuation: "visits,2hospitalizations" → "visits, hospitalizations"
    .replace(/([,.])\s*(\d{1,2})(?=[a-z])/g, '$1 ')
    // Remove trailing citation clusters: ".1,7-9" before next capital
    .replace(/\.(\d[\d,\-–]{0,15})(?=\s+[A-Z])/g, '.')
    // Collapse whitespace
    .replace(/\n+/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();

  // Protect common abbreviations from false sentence splits
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
    if (s.length < 40) continue;
    if (s.length > 520) continue;
    if (/^\d+$/.test(s)) continue;
    if (/^[A-Z\s]{8,}$/.test(s)) continue;                 // all-caps header
    if (/^(Table|Figure|Box|Appendix)\s+\d/i.test(s)) continue;
    if (/^[ABC]\s+[\d,\s]+$/.test(s)) continue;             // evidence rating row
    if (isJunk(s)) continue;
    sentences.push(s);
  }

  return sentences.slice(0, 250);
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
