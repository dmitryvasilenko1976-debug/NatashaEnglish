/**
 * Tests for src/services/gamificationService.js
 *
 * checkNewAchievements is a pure function — no mocks needed.
 * addXP requires mocking storageService.
 */

import { checkNewAchievements, addXP } from '../src/services/gamificationService';

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeGame(overrides = {}) {
  return {
    xp: 0,
    streak: { current: 0, lastDate: null, max: 0 },
    achievements: {},
    stats: { wordsTotal: 0, articlesTotal: 0, quizCorrect: 0 },
    ...overrides,
  };
}

// ── checkNewAchievements ──────────────────────────────────────────────────────

describe('checkNewAchievements', () => {
  test('returns unchanged game when no thresholds reached', () => {
    const game = makeGame();
    const { newlyUnlocked } = checkNewAchievements(game);
    expect(newlyUnlocked).toHaveLength(0);
  });

  test('unlocks "sam" at wordsTotal = 1', () => {
    const game = makeGame({ stats: { wordsTotal: 1, articlesTotal: 0, quizCorrect: 0 } });
    const { newlyUnlocked, gameData } = checkNewAchievements(game);
    expect(newlyUnlocked.some((a) => a.id === 'sam')).toBe(true);
    expect(gameData.achievements.sam).toBe(true);
  });

  test('awards XP bonus for sam achievement', () => {
    const game = makeGame({ stats: { wordsTotal: 1, articlesTotal: 0, quizCorrect: 0 } });
    const { gameData } = checkNewAchievements(game);
    expect(gameData.xp).toBeGreaterThan(0);
  });

  test('does not re-unlock already unlocked achievements', () => {
    const game = makeGame({
      achievements: { sam: true },
      stats: { wordsTotal: 5, articlesTotal: 0, quizCorrect: 0 },
    });
    const { newlyUnlocked } = checkNewAchievements(game);
    expect(newlyUnlocked.some((a) => a.id === 'sam')).toBe(false);
  });

  test('unlocks "frodo" at wordsTotal = 25', () => {
    const game = makeGame({ stats: { wordsTotal: 25, articlesTotal: 0, quizCorrect: 0 } });
    const { newlyUnlocked } = checkNewAchievements(game);
    expect(newlyUnlocked.some((a) => a.id === 'frodo')).toBe(true);
  });

  test('unlocks "bilbo" at articlesTotal = 1', () => {
    const game = makeGame({ stats: { wordsTotal: 0, articlesTotal: 1, quizCorrect: 0 } });
    const { newlyUnlocked } = checkNewAchievements(game);
    expect(newlyUnlocked.some((a) => a.id === 'bilbo')).toBe(true);
  });

  test('unlocks "nazgul_defeated" at streakMax = 7', () => {
    const game = makeGame({
      streak: { current: 7, lastDate: '2026-06-23', max: 7 },
      stats: { wordsTotal: 0, articlesTotal: 0, quizCorrect: 0 },
    });
    const { newlyUnlocked } = checkNewAchievements(game);
    expect(newlyUnlocked.some((a) => a.id === 'nazgul_defeated')).toBe(true);
  });

  test('unlocks multiple achievements at once', () => {
    const game = makeGame({
      stats: { wordsTotal: 25, articlesTotal: 1, quizCorrect: 0 },
    });
    const { newlyUnlocked } = checkNewAchievements(game);
    const ids = newlyUnlocked.map((a) => a.id);
    // sam(1), pippin(5), merry(10), frodo(25), bilbo(1 article) — all should fire
    expect(ids).toContain('sam');
    expect(ids).toContain('frodo');
    expect(ids).toContain('bilbo');
  });

  test('mutates the passed gameData object (adds achievements)', () => {
    const game = makeGame({ stats: { wordsTotal: 1, articlesTotal: 0, quizCorrect: 0 } });
    checkNewAchievements(game);
    expect(game.achievements.sam).toBe(true);
  });
});

// ── addXP (mocked storageService) ────────────────────────────────────────────

jest.mock('../src/services/storageService', () => {
  let stored = null;
  return {
    getGameData: jest.fn(async () =>
      stored ?? {
        xp: 0,
        streak: { current: 0, lastDate: null, max: 0 },
        achievements: {},
        stats: { wordsTotal: 0, articlesTotal: 0, quizCorrect: 0 },
      }
    ),
    saveGameData: jest.fn(async (data) => { stored = data; }),
    __setStored: (d) => { stored = d; },
  };
});

const { getGameData, saveGameData, __setStored } = require('../src/services/storageService');

beforeEach(() => {
  __setStored(null);
  jest.clearAllMocks();
});

describe('addXP', () => {
  test('increases xp by given amount', async () => {
    const result = await addXP(10);
    expect(result.xp).toBe(10);
  });

  test('calls saveGameData once', async () => {
    await addXP(5);
    expect(saveGameData).toHaveBeenCalledTimes(1);
  });

  test('applies statUpdates to stats', async () => {
    await addXP(5, { wordsTotal: 3 });
    const saved = saveGameData.mock.calls[0][0];
    expect(saved.stats.wordsTotal).toBe(3);
  });

  test('returns newlyUnlocked array', async () => {
    const { newlyUnlocked } = await addXP(1);
    expect(Array.isArray(newlyUnlocked)).toBe(true);
  });

  test('unlocks achievement and returns it in newlyUnlocked', async () => {
    await addXP(0, { wordsTotal: 1 });
    const { newlyUnlocked } = await addXP(1, { wordsTotal: 0 });
    // After first call wordsTotal=1, sam should fire on second call
    // (actually depends on stored state — let's just check both calls)
    const firstCall = await (async () => {
      __setStored(null);
      return addXP(5, { wordsTotal: 1 });
    })();
    expect(firstCall.newlyUnlocked.some((a) => a.id === 'sam')).toBe(true);
  });

  test('accumulates xp across multiple calls', async () => {
    await addXP(10);
    const result = await addXP(15);
    expect(result.xp).toBe(25);
  });
});
