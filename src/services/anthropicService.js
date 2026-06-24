// Все объяснения предвычислены — нет обращений к API
// wordCache.json разбит на 3 части (~300 KB каждая) чтобы Metro web мог их включить в бандл
import chunk1 from '../data/wordCache1.json';
import chunk2 from '../data/wordCache2.json';
import chunk3 from '../data/wordCache3.json';

let _cache = null;

function getCache() {
  if (!_cache) _cache = { ...chunk1, ...chunk2, ...chunk3 };
  return _cache;
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

// Try morphological variants so "admission" finds "admissions", "indicated" finds "indicate", etc.
function lookupInCache(cache, key) {
  if (cache[key]) return cache[key];
  const k = key;
  const tries = [
    k + 's',                                           // admission → admissions
    k + 'es',                                          // bench → benches
    k.endsWith('s')   ? k.slice(0, -1)   : null,      // admissions → admission
    k.endsWith('es')  ? k.slice(0, -2)   : null,      // branches → branch
    k.endsWith('ed')  ? k.slice(0, -1)   : null,      // indicated → indicate
    k.endsWith('ed')  ? k.slice(0, -2)   : null,      // infected → infect
    k.endsWith('ing') ? k.slice(0, -3)   : null,      // treating → treat
    k.endsWith('ing') ? k.slice(0, -3) + 'e' : null,  // indicating → indicate
    k.endsWith('ly')  ? k.slice(0, -2)   : null,      // severely → severe
    k.endsWith('ly')  ? k.slice(0, -4)   : null,      // critically → critic? skip if bad
    k.endsWith('tion') ? k.slice(0, -3) + 'e' : null, // indication → indicate (approx)
  ].filter(Boolean);
  for (const t of tries) {
    if (cache[t]) return cache[t];
  }
  return null;
}

export async function explainWord(word, sentence) {
  const cache = getCache();
  const key = word.toLowerCase().replace(/[^a-zA-Z'-]/g, '');
  const result = lookupInCache(cache, key);
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
