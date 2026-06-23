import AsyncStorage from '@react-native-async-storage/async-storage';

// Schema:
// 'articles'          → JSON array [{id, title, tag, sentences[], addedAt}]
// 'words_{articleId}' → JSON object {word: {baseForm, transcription, ...savedAt}}
// 'progress_{id}'     → string with current sentence index
// 'gamification'      → {xp, streak: {current, lastDate, max}, achievements: {}, stats: {}}

let bundledArticles = null;
function getBundled() {
  if (!bundledArticles) {
    try { bundledArticles = require('../../src/data/articles.json'); }
    catch { bundledArticles = []; }
  }
  return bundledArticles;
}

export async function getArticles() {
  const bundled = getBundled();
  try {
    const json = await AsyncStorage.getItem('articles');
    if (!json) return bundled;
    const stored = JSON.parse(json);
    // Bundled articles always win for existing IDs (updated by precompute + rebuild).
    // Custom articles added via UI (different IDs) are appended.
    const bundledIds = new Set(bundled.map((a) => a.id));
    const custom = stored.filter((a) => !bundledIds.has(a.id));
    return custom.length > 0 ? [...bundled, ...custom] : bundled;
  } catch {
    return bundled;
  }
}

export async function saveArticle(article) {
  const list = await getArticles();
  const idx = list.findIndex(a => a.id === article.id);
  if (idx >= 0) list[idx] = article;
  else list.unshift(article);
  await AsyncStorage.setItem('articles', JSON.stringify(list));
}

export async function deleteArticle(articleId) {
  const list = await getArticles();
  const filtered = list.filter(a => a.id !== articleId);
  await AsyncStorage.setItem('articles', JSON.stringify(filtered));
  await AsyncStorage.removeItem(`words_${articleId}`);
  await AsyncStorage.removeItem(`progress_${articleId}`);
}

export async function getSavedWords(articleId) {
  const json = await AsyncStorage.getItem(`words_${articleId}`);
  return json ? JSON.parse(json) : {};
}

export async function saveWord(articleId, word, wordData) {
  const words = await getSavedWords(articleId);
  words[word.toLowerCase()] = { ...wordData, savedAt: Date.now() };
  await AsyncStorage.setItem(`words_${articleId}`, JSON.stringify(words));
}

export async function removeWord(articleId, word) {
  const words = await getSavedWords(articleId);
  delete words[word.toLowerCase()];
  await AsyncStorage.setItem(`words_${articleId}`, JSON.stringify(words));
}

export async function getProgress(articleId) {
  const val = await AsyncStorage.getItem(`progress_${articleId}`);
  return val ? parseInt(val, 10) : 0;
}

export async function saveProgress(articleId, index) {
  await AsyncStorage.setItem(`progress_${articleId}`, String(index));
}

// ── Gamification ──────────────────────────────────────────────────────────────

const defaultGame = () => ({
  xp: 0,
  streak: { current: 0, lastDate: null, max: 0 },
  achievements: {},
  stats: { wordsTotal: 0, articlesTotal: 0, quizCorrect: 0 },
});

export async function getGameData() {
  const json = await AsyncStorage.getItem('gamification');
  return json ? { ...defaultGame(), ...JSON.parse(json) } : defaultGame();
}

export async function saveGameData(data) {
  await AsyncStorage.setItem('gamification', JSON.stringify(data));
}

export function updateStreak(gameData) {
  const today = new Date().toISOString().split('T')[0];
  const last = gameData.streak.lastDate;

  if (last === today) return gameData;

  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  if (last === yesterday) {
    gameData.streak.current += 1;
  } else {
    gameData.streak.current = 1;
  }

  if (gameData.streak.current > (gameData.streak.max || 0)) {
    gameData.streak.max = gameData.streak.current;
  }

  gameData.streak.lastDate = today;
  return gameData;
}
