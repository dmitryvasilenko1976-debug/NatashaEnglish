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

export async function explainWord(word) {
  const cache = getCache();
  const key = word.toLowerCase().replace(/[^a-zA-Z'-]/g, '');
  const result = cache[key];
  if (!result) throw new Error(`Слово "${word}" не найдено в словаре`);
  return result;
}

export async function parsePDFToSentences() {
  throw new Error('Добавление статей — только через precompute.js на компьютере');
}
