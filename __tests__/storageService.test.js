/**
 * Tests for src/services/storageService.js
 *
 * updateStreak is a pure function (no AsyncStorage) — tested directly.
 * getArticles / saveArticle / deleteArticle require AsyncStorage mock.
 */

import { updateStreak } from '../src/services/storageService';

// ── updateStreak (pure) ───────────────────────────────────────────────────────

describe('updateStreak', () => {
  const TODAY = '2026-06-23';
  const YESTERDAY = '2026-06-22';
  const TWO_DAYS_AGO = '2026-06-21';

  function makeGame(lastDate, current = 0, max = 0) {
    return {
      xp: 0,
      streak: { current, lastDate, max },
      achievements: {},
      stats: { wordsTotal: 0, articlesTotal: 0, quizCorrect: 0 },
    };
  }

  beforeAll(() => {
    // Pin "today" for deterministic tests
    jest.useFakeTimers({ now: new Date('2026-06-23T10:00:00Z') });
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  test('starts streak at 1 when no prior date', () => {
    const game = makeGame(null, 0);
    const updated = updateStreak(game);
    expect(updated.streak.current).toBe(1);
    expect(updated.streak.lastDate).toBe(TODAY);
  });

  test('increments streak when last date was yesterday', () => {
    const game = makeGame(YESTERDAY, 3);
    const updated = updateStreak(game);
    expect(updated.streak.current).toBe(4);
  });

  test('resets streak to 1 when last date was two days ago', () => {
    const game = makeGame(TWO_DAYS_AGO, 5);
    const updated = updateStreak(game);
    expect(updated.streak.current).toBe(1);
  });

  test('does not change streak when called twice on the same day', () => {
    const game = makeGame(TODAY, 7);
    const updated = updateStreak(game);
    expect(updated.streak.current).toBe(7);
    expect(updated.streak.lastDate).toBe(TODAY);
  });

  test('updates max streak when current exceeds it', () => {
    const game = makeGame(YESTERDAY, 9, 9);
    const updated = updateStreak(game);
    expect(updated.streak.max).toBe(10);
  });

  test('does not decrease max streak', () => {
    const game = makeGame(YESTERDAY, 3, 20);
    const updated = updateStreak(game);
    expect(updated.streak.max).toBe(20);
  });

  test('mutates and returns same object', () => {
    const game = makeGame(YESTERDAY, 1);
    const result = updateStreak(game);
    expect(result).toBe(game);
  });
});

// ── AsyncStorage-dependent functions ─────────────────────────────────────────

jest.mock('@react-native-async-storage/async-storage', () => {
  const store = new Map();
  return {
    getItem: jest.fn(async (key) => store.get(key) ?? null),
    setItem: jest.fn(async (key, value) => { store.set(key, value); }),
    removeItem: jest.fn(async (key) => { store.delete(key); }),
    __store: store,
    __clear: () => store.clear(),
  };
});

// articles.json bundled data mock
jest.mock('../src/data/articles.json', () => [
  { id: 'bundled_1', title: 'Bundled Article One', tag: 'Педиатрия', sentences: ['S1', 'S2'], addedAt: '2026-01-01' },
  { id: 'bundled_2', title: 'Bundled Article Two', tag: 'Медицина', sentences: ['S3', 'S4'], addedAt: '2026-01-02' },
], { virtual: true });

const AsyncStorage = require('@react-native-async-storage/async-storage');

import {
  getArticles, saveArticle, deleteArticle,
  getSavedWords, saveWord, removeWord,
  getProgress, saveProgress,
} from '../src/services/storageService';

beforeEach(() => {
  AsyncStorage.__clear();
  jest.clearAllMocks();
});

describe('getArticles', () => {
  test('returns bundled articles when AsyncStorage is empty', async () => {
    const articles = await getArticles();
    expect(articles).toHaveLength(2);
    expect(articles[0].id).toBe('bundled_1');
  });

  test('returns bundled articles + custom article (different id) from storage', async () => {
    const custom = { id: 'custom_99', title: 'My Custom', tag: 'Медицина', sentences: [], addedAt: '2026-06-23' };
    await AsyncStorage.setItem('articles', JSON.stringify([...[], custom]));
    const articles = await getArticles();
    expect(articles.some((a) => a.id === 'custom_99')).toBe(true);
    expect(articles.some((a) => a.id === 'bundled_1')).toBe(true);
  });

  test('bundled articles always appear even when storage has data', async () => {
    await AsyncStorage.setItem('articles', JSON.stringify([{ id: 'other', title: 'X', sentences: [] }]));
    const articles = await getArticles();
    expect(articles.some((a) => a.id === 'bundled_1')).toBe(true);
    expect(articles.some((a) => a.id === 'bundled_2')).toBe(true);
  });

  test('does not duplicate bundled articles that appear in storage', async () => {
    // Storage has a bundled article with the same id — should not be duplicated
    const stored = [{ id: 'bundled_1', title: 'Old Title', sentences: [] }];
    await AsyncStorage.setItem('articles', JSON.stringify(stored));
    const articles = await getArticles();
    const bundled1Count = articles.filter((a) => a.id === 'bundled_1').length;
    expect(bundled1Count).toBe(1);
  });
});

describe('saveArticle + deleteArticle', () => {
  test('saveArticle writes to AsyncStorage', async () => {
    const article = { id: 'test_1', title: 'Test', tag: 'Медицина', sentences: ['Hello'], addedAt: '2026-06-23' };
    await saveArticle(article);
    expect(AsyncStorage.setItem).toHaveBeenCalledWith('articles', expect.any(String));
  });

  test('deleteArticle removes words and progress keys', async () => {
    await AsyncStorage.setItem('words_test_1', JSON.stringify({ hello: {} }));
    await AsyncStorage.setItem('progress_test_1', '5');
    await deleteArticle('test_1');
    expect(AsyncStorage.removeItem).toHaveBeenCalledWith('words_test_1');
    expect(AsyncStorage.removeItem).toHaveBeenCalledWith('progress_test_1');
  });
});

describe('word storage', () => {
  test('getSavedWords returns empty object when no words saved', async () => {
    const words = await getSavedWords('art_1');
    expect(words).toEqual({});
  });

  test('saveWord stores word data and lowercases key', async () => {
    const data = { translation: 'тест', baseForm: 'test' };
    await saveWord('art_1', 'TEST', data);
    const words = await getSavedWords('art_1');
    expect(words['test']).toBeDefined();
    expect(words['test'].translation).toBe('тест');
  });

  test('saveWord adds savedAt timestamp', async () => {
    await saveWord('art_1', 'hello', { translation: 'привет' });
    const words = await getSavedWords('art_1');
    expect(typeof words['hello'].savedAt).toBe('number');
  });

  test('removeWord deletes the word', async () => {
    await saveWord('art_1', 'hello', { translation: 'привет' });
    await removeWord('art_1', 'hello');
    const words = await getSavedWords('art_1');
    expect(words['hello']).toBeUndefined();
  });
});

describe('progress', () => {
  test('getProgress returns 0 when not set', async () => {
    const p = await getProgress('art_1');
    expect(p).toBe(0);
  });

  test('saveProgress and getProgress round-trip', async () => {
    await saveProgress('art_1', 17);
    const p = await getProgress('art_1');
    expect(p).toBe(17);
  });
});
