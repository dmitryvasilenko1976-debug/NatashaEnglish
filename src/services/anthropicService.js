// Все объяснения предвычислены — нет обращений к API
let wordCache = null;

function getCache() {
  if (!wordCache) {
    try {
      wordCache = require('../../src/data/wordCache.json');
    } catch {
      wordCache = {};
    }
  }
  return wordCache;
}

// Extract surrounding words from the actual current sentence
function extractContext(word, sentence) {
  const words = sentence.split(/\s+/);
  const idx = words.findIndex(
    (w) => w.replace(/[^a-zA-Z'-]/g, '').toLowerCase() === word
  );
  if (idx === -1) return { contextBefore: '', contextAfter: '' };
  const before = words.slice(Math.max(0, idx - 4), idx).join(' ');
  const after = words.slice(idx + 1, Math.min(words.length, idx + 5)).join(' ');
  return { contextBefore: before, contextAfter: after };
}

export { extractContext };

export async function explainWord(word, sentence) {
  const cache = getCache();
  const key = word.toLowerCase().replace(/[^a-zA-Z'-]/g, '');
  const result = cache[key];
  if (!result) throw new Error(`Слово "${word}" не найдено в словаре`);
  // Always override context with the actual sentence being read
  const { contextBefore, contextAfter } = sentence
    ? extractContext(key, sentence)
    : { contextBefore: result.contextBefore, contextAfter: result.contextAfter };
  return { ...result, contextBefore, contextAfter };
}

export async function parsePDFToSentences() {
  throw new Error('Добавление статей — только через precompute.js на компьютере');
}
