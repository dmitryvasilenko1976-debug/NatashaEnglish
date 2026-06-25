import AsyncStorage from '@react-native-async-storage/async-storage';

// Schema:
// 'articles'          → JSON array [{id, title, tag, sentences[], addedAt}]
// 'words_{articleId}' → JSON object {word: {baseForm, transcription, ...savedAt}}
// 'progress_{id}'     → string with current sentence index
// 'gamification'      → {xp, streak, achievements, stats, daily}
// 'word_mastery'      → {[word]: lookupCount}

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

// ── Word Mastery (global lookup counts across all articles) ───────────────────

export async function getWordMastery() {
  try {
    const json = await AsyncStorage.getItem('word_mastery');
    return json ? JSON.parse(json) : {};
  } catch {
    return {};
  }
}

export async function incrementWordMastery(word) {
  const key = word.toLowerCase().replace(/[^a-zA-Z'-]/g, '');
  if (!key) return 0;
  try {
    const mastery = await getWordMastery();
    const count = (mastery[key] || 0) + 1;
    mastery[key] = count;
    await AsyncStorage.setItem('word_mastery', JSON.stringify(mastery));
    return count;
  } catch {
    return 0;
  }
}

// ── Gamification ──────────────────────────────────────────────────────────────

function todayStr() {
  return new Date().toISOString().split('T')[0];
}

function defaultDaily() {
  return {
    date: todayStr(),
    sentencesRead: 0,
    wordsLookedUp: 0,
    wordsSaved: 0,
    bonusGranted: [],
    firstSentenceBonusUsed: false,
  };
}

const defaultGame = () => ({
  xp: 0,
  streak: { current: 0, lastDate: null, max: 0 },
  achievements: {},
  stats: { wordsTotal: 0, articlesTotal: 0, quizCorrect: 0, srsReview: 0, dailyActivity: {}, records: {}, masteredArticleIds: [] },
  daily: defaultDaily(),
  gems: 0,
  streakShield: false,
  loginStreak: { current: 0, lastLogin: null },
  quiz: { hearts: 3, lastHeartRestore: null },
  weeklyQuest: { weekId: 0, progress: 0, completed: false },
  league: null,
});

export async function getGameData() {
  try {
    const json = await AsyncStorage.getItem('gamification');
    const base = defaultGame();
    const stored = json ? JSON.parse(json) : {};
    const game = { ...base, ...stored };
    game.streak      = { ...base.streak,      ...(stored.streak      || {}) };
    game.stats       = { ...base.stats,       ...(stored.stats       || {}) };
    game.loginStreak = { ...base.loginStreak, ...(stored.loginStreak || {}) };
    game.quiz        = { ...base.quiz,        ...(stored.quiz        || {}) };
    game.weeklyQuest = stored.weeklyQuest || base.weeklyQuest;
    game.league      = stored.league !== undefined ? stored.league : base.league;
    if (!game.stats.dailyActivity) game.stats.dailyActivity = {};
    // Reset daily on a new day
    const today = todayStr();
    if (!game.daily || game.daily.date !== today) {
      game.daily = defaultDaily();
    } else {
      game.daily = { ...defaultDaily(), ...game.daily };
    }
    return game;
  } catch {
    return defaultGame();
  }
}

export async function saveGameData(data) {
  await AsyncStorage.setItem('gamification', JSON.stringify(data));
}

export async function getSettings() {
  try {
    const json = await AsyncStorage.getItem('settings');
    return json ? { quietMode: false, ...JSON.parse(json) } : { quietMode: false };
  } catch { return { quietMode: false }; }
}

export async function saveSettings(settings) {
  await AsyncStorage.setItem('settings', JSON.stringify(settings));
}

// ── SM-2 Spaced Repetition ────────────────────────────────────────────────────

// grade: 0=Again, 2=Hard, 4=Good, 5=Easy
export function sm2Update(srs, grade) {
  const ef = Math.max(1.3, srs.easeFactor || 2.5);
  const reps = srs.repetitions || 0;
  let newInterval, newEF, newReps;

  if (grade <= 1) {
    newInterval = 1;
    newEF = Math.max(1.3, ef - 0.15);
    newReps = 0;
  } else {
    newReps = reps + 1;
    if (reps === 0)      newInterval = 1;
    else if (reps === 1) newInterval = 6;
    else                 newInterval = Math.round((srs.interval || 1) * ef);
    newEF = ef;
    if (grade === 2) {
      newEF = Math.max(1.3, ef - 0.15);
      newInterval = Math.max(1, Math.round(newInterval * 0.7));
    } else if (grade === 5) {
      newEF = Math.min(2.7, ef + 0.1);
      newInterval = Math.round(newInterval * 1.3);
    }
  }

  const nextDate = new Date(Date.now() + newInterval * 86400000);
  return {
    interval: newInterval,
    easeFactor: Math.max(1.3, newEF),
    repetitions: newReps,
    nextReview: nextDate.toISOString().split('T')[0],
    lastGrade: grade,
  };
}

// All saved words across all articles where nextReview <= today (or never reviewed)
export async function getWordsForReview() {
  const today = new Date().toISOString().split('T')[0];
  const articles = await getArticles();
  const result = [];
  for (const article of articles) {
    const words = await getSavedWords(article.id);
    for (const [word, data] of Object.entries(words)) {
      if (!data.nextReview || data.nextReview <= today) {
        result.push({ word, data, articleId: article.id, articleTitle: article.title });
      }
    }
  }
  return result.sort(() => Math.random() - 0.5);
}

export async function updateWordSRS(articleId, word, grade) {
  const words = await getSavedWords(articleId);
  if (!words[word]) return null;
  const current = words[word];
  const srs = {
    interval:      current.interval      || 0,
    easeFactor:    current.easeFactor    || 2.5,
    repetitions:   current.repetitions   || 0,
    nextReview:    current.nextReview    || null,
  };
  const updated = sm2Update(srs, grade);
  words[word] = { ...current, ...updated };
  await AsyncStorage.setItem(`words_${articleId}`, JSON.stringify(words));
  return words[word];
}

// Returns { hearts, minutesUntilNext } — calculates auto-restored hearts
export function getRestoredHearts(game) {
  const quiz = game.quiz || { hearts: 3, lastHeartRestore: null };
  if (quiz.hearts >= 3) return { hearts: 3, minutesUntilNext: 0 };
  if (!quiz.lastHeartRestore) return { hearts: quiz.hearts, minutesUntilNext: 120 };
  const RESTORE_MS = 2 * 60 * 60 * 1000;
  const elapsed = Date.now() - quiz.lastHeartRestore;
  const restored = Math.floor(elapsed / RESTORE_MS);
  const newHearts = Math.min(3, quiz.hearts + restored);
  if (newHearts >= 3) return { hearts: 3, minutesUntilNext: 0 };
  const msUntilNext = RESTORE_MS - (elapsed % RESTORE_MS);
  return { hearts: newHearts, minutesUntilNext: Math.ceil(msUntilNext / 60000) };
}

export function updateStreak(gameData) {
  const today = new Date().toISOString().split('T')[0];
  const last = gameData.streak.lastDate;
  if (last === today) return gameData;
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  if (last !== null && last !== yesterday) {
    // Missed at least one day
    if (gameData.streakShield) {
      gameData.streakShield = false; // shield consumed, streak survives
    } else {
      gameData.streak.current = 1;
    }
  } else {
    gameData.streak.current = last === yesterday ? gameData.streak.current + 1 : 1;
  }

  if (gameData.streak.current > (gameData.streak.max || 0)) {
    gameData.streak.max = gameData.streak.current;
  }
  gameData.streak.lastDate = today;
  return gameData;
}

// Like updateStreak but also returns whether a meaningful streak was just broken.
// Used by HomeScreen to show the "Серия прервана" modal.
export function updateStreakWithInfo(gameData) {
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  const last = gameData.streak.lastDate;
  const previousStreak = gameData.streak.current;
  const gapExists = last !== null && last !== today && last !== yesterday;
  // Shield absorbs the break → don't show the "streak lost" modal
  const shieldWillAbsorb = gapExists && !!gameData.streakShield;
  const streakBroken = gapExists && previousStreak >= 3 && !shieldWillAbsorb;
  const game = updateStreak(gameData);
  return { game, streakBroken, previousStreak };
}

export async function resetAllProgress() {
  const keys = await AsyncStorage.getAllKeys();
  const gameKeys = keys.filter(k =>
    k === 'articles' ||
    k === 'gamification' ||
    k === 'word_mastery' ||
    k === 'story_letter_seen' ||
    k.startsWith('words_') ||
    k.startsWith('progress_')
  );
  if (gameKeys.length > 0) await AsyncStorage.multiRemove(gameKeys);
}
