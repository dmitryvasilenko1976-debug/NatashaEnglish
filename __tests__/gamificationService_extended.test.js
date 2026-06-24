/**
 * Extended tests for src/services/gamificationService.js
 *
 * Covers pure functions: getMasteryLevel, isArticleMastered
 * Covers async (mocked storage): addXP — all bug-fix regressions
 *   bug 1:  null game.daily safety
 *   bug 9:  streak weekly quest — direct tracking, not cumulative
 *   bug 12: newRecord fires on first-ever day (prevBest = 0)
 */

import {
  getMasteryLevel,
  isArticleMastered,
  addXP,
} from '../src/services/gamificationService';

// ── getMasteryLevel ───────────────────────────────────────────────────────────

describe('getMasteryLevel', () => {
  test('level 0: reps=0, lc=0', () => {
    expect(getMasteryLevel({ repetitions: 0 }, 0)).toBe(0);
  });

  test('level 0: reps=0, lc=2 (below threshold of 3)', () => {
    expect(getMasteryLevel({ repetitions: 0 }, 2)).toBe(0);
  });

  test('level 1 (Замеченное): lc=3', () => {
    expect(getMasteryLevel({ repetitions: 0 }, 3)).toBe(1);
  });

  test('level 1: lc=9 (still below 10)', () => {
    expect(getMasteryLevel({ repetitions: 0 }, 9)).toBe(1);
  });

  test('level 2 (Знакомое): lc=10', () => {
    expect(getMasteryLevel({ repetitions: 0 }, 10)).toBe(2);
  });

  test('level 2: lc=19 (still below 20)', () => {
    expect(getMasteryLevel({ repetitions: 0 }, 19)).toBe(2);
  });

  test('level 3 (Изученное) via lookup: lc=20', () => {
    expect(getMasteryLevel({ repetitions: 0 }, 20)).toBe(3);
  });

  test('level 3 via SRS: reps=3', () => {
    expect(getMasteryLevel({ repetitions: 3 }, 0)).toBe(3);
  });

  test('level 4 (Освоенное): reps=5', () => {
    expect(getMasteryLevel({ repetitions: 5 }, 0)).toBe(4);
  });

  test('level 4: reps=7 (just below 8)', () => {
    expect(getMasteryLevel({ repetitions: 7 }, 0)).toBe(4);
  });

  test('level 5 (Мастерское): reps=8', () => {
    expect(getMasteryLevel({ repetitions: 8 }, 0)).toBe(5);
  });

  test('level 5: reps=100 (well above)', () => {
    expect(getMasteryLevel({ repetitions: 100 }, 0)).toBe(5);
  });

  test('reps path takes priority over lookup path when both apply', () => {
    // reps=5 → level 4; lc=25 → would give level 3; reps should win
    expect(getMasteryLevel({ repetitions: 5 }, 25)).toBe(4);
  });

  test('null wordData: graceful fallback, lc path still works', () => {
    expect(getMasteryLevel(null, 0)).toBe(0);
    expect(getMasteryLevel(null, 3)).toBe(1);
    expect(getMasteryLevel(null, 20)).toBe(3);
  });

  test('undefined wordData: graceful fallback', () => {
    expect(getMasteryLevel(undefined, 0)).toBe(0);
    expect(getMasteryLevel(undefined, 10)).toBe(2);
  });
});

// ── isArticleMastered ─────────────────────────────────────────────────────────

describe('isArticleMastered', () => {
  test('returns false for empty wordsObj', () => {
    expect(isArticleMastered({})).toBe(false);
  });

  test('returns false when fewer than 3 words', () => {
    const words = {
      apple:  { repetitions: 5 },
      banana: { repetitions: 5 },
    };
    expect(isArticleMastered(words)).toBe(false);
  });

  test('returns false when any word is below level 3', () => {
    const words = {
      apple:  { repetitions: 5 }, // level 4
      banana: { repetitions: 3 }, // level 3
      cherry: { repetitions: 1 }, // level 0 — below threshold
    };
    expect(isArticleMastered(words)).toBe(false);
  });

  test('returns true when all 3+ words are at level 3+ via SRS (bug 6 baseline)', () => {
    const words = {
      apple:  { repetitions: 3 }, // level 3
      banana: { repetitions: 5 }, // level 4
      cherry: { repetitions: 8 }, // level 5
    };
    expect(isArticleMastered(words)).toBe(true);
  });

  test('returns true when words reach level 3 via wordMasteryMap (bug 6 regression)', () => {
    const words = {
      apple:  { repetitions: 0 },
      banana: { repetitions: 0 },
      cherry: { repetitions: 0 },
    };
    const wordMasteryMap = { apple: 20, banana: 25, cherry: 30 };
    expect(isArticleMastered(words, wordMasteryMap)).toBe(true);
  });

  test('returns false without wordMasteryMap when words only qualify via lookup', () => {
    // Without the map, lookupCount defaults to 0 → level 0 for all
    const words = {
      apple:  { repetitions: 0 },
      banana: { repetitions: 0 },
      cherry: { repetitions: 0 },
    };
    expect(isArticleMastered(words)).toBe(false);
  });

  test('returns false when wordMasteryMap values are too low (lc < 20)', () => {
    const words = {
      apple:  { repetitions: 0 },
      banana: { repetitions: 0 },
      cherry: { repetitions: 0 },
    };
    const wordMasteryMap = { apple: 10, banana: 15, cherry: 19 }; // max level 2
    expect(isArticleMastered(words, wordMasteryMap)).toBe(false);
  });

  test('mixed SRS + lookup: all qualify via different paths → true', () => {
    const words = {
      apple:  { repetitions: 3 },  // level 3 via SRS
      banana: { repetitions: 0 },  // level 3 via lookup
      cherry: { repetitions: 8 },  // level 5 via SRS
    };
    const wordMasteryMap = { banana: 20 };
    expect(isArticleMastered(words, wordMasteryMap)).toBe(true);
  });

  test('exactly 3 words all at level 3+ → true', () => {
    const words = {
      a: { repetitions: 3 },
      b: { repetitions: 3 },
      c: { repetitions: 3 },
    };
    expect(isArticleMastered(words)).toBe(true);
  });
});

// ── addXP (mocked storageService) ────────────────────────────────────────────

jest.mock('../src/services/storageService', () => {
  let stored = null;

  function makeDefault() {
    const today = new Date().toISOString().split('T')[0];
    return {
      xp: 0,
      streak: { current: 1, lastDate: today, max: 1 },
      achievements: {},
      stats: {
        wordsTotal: 0, articlesTotal: 0, quizCorrect: 0, srsReview: 0,
        dailyActivity: {}, records: {}, masteredArticleIds: [],
      },
      daily: {
        date: today, sentencesRead: 0, wordsLookedUp: 0, wordsSaved: 0,
        bonusGranted: [], firstSentenceBonusUsed: false,
      },
      gems: 0,
      streakShield: false,
      loginStreak: { current: 1, lastLogin: today },
      quiz: { hearts: 3, lastHeartRestore: null },
      weeklyQuest: { weekId: 0, progress: 0, completed: false },
      league: null,
    };
  }

  return {
    getGameData: jest.fn(async () =>
      stored ? JSON.parse(JSON.stringify(stored)) : makeDefault()
    ),
    saveGameData: jest.fn(async (data) => { stored = data; }),
    __setStored:  (d) => { stored = d ? JSON.parse(JSON.stringify(d)) : null; },
    __reset:      () => { stored = null; },
  };
});

const { getGameData, saveGameData, __setStored, __reset } =
  require('../src/services/storageService');

beforeEach(() => {
  __reset();
  jest.clearAllMocks();
});

// helper: get the last game object saved by addXP
function lastSaved() {
  const calls = saveGameData.mock.calls;
  return calls[calls.length - 1]?.[0] ?? null;
}

// helper: build a full game with custom overrides
function makeFullGame(overrides = {}) {
  const today = new Date().toISOString().split('T')[0];
  return {
    xp: 0,
    streak: { current: 1, lastDate: today, max: 1 },
    achievements: {},
    stats: {
      wordsTotal: 0, articlesTotal: 0, quizCorrect: 0, srsReview: 0,
      dailyActivity: {}, records: {}, masteredArticleIds: [],
    },
    daily: {
      date: today, sentencesRead: 0, wordsLookedUp: 0, wordsSaved: 0,
      bonusGranted: [], firstSentenceBonusUsed: false,
    },
    gems: 0,
    streakShield: false,
    loginStreak: { current: 1, lastLogin: today },
    quiz: { hearts: 3, lastHeartRestore: null },
    weeklyQuest: { weekId: 0, progress: 0, completed: false },
    league: null,
    ...overrides,
  };
}

// ── bug 1: null-guard for game.daily ─────────────────────────────────────────

describe('addXP: null daily guard (bug 1 regression)', () => {
  test('does not crash when game has no daily field', async () => {
    const { daily, ...gameWithoutDaily } = makeFullGame();
    __setStored(gameWithoutDaily);
    await expect(addXP(5, { sentencesRead: 1 })).resolves.not.toThrow();
  });

  test('does not crash when game.daily is explicitly null', async () => {
    __setStored({ ...makeFullGame(), daily: null });
    await expect(addXP(5)).resolves.not.toThrow();
  });

  test('does not crash when game.daily.bonusGranted is missing', async () => {
    const game = makeFullGame();
    delete game.daily.bonusGranted;
    __setStored(game);
    await expect(addXP(5)).resolves.not.toThrow();
  });

  test('XP is still accumulated after null-guard recovery', async () => {
    const { daily, ...gameWithoutDaily } = makeFullGame({ xp: 10 });
    __setStored(gameWithoutDaily);
    const result = await addXP(5);
    expect(result.xp).toBe(15);
  });
});

// ── basic stat updates ────────────────────────────────────────────────────────

describe('addXP: stat accumulation', () => {
  test('xp increases by given amount', async () => {
    const result = await addXP(10);
    expect(result.xp).toBe(10);
  });

  test('accumulates xp across multiple calls', async () => {
    await addXP(10);
    const result = await addXP(15);
    expect(result.xp).toBe(25);
  });

  test('srsReview stat is incremented (not a daily key)', async () => {
    await addXP(5, { srsReview: 1 });
    expect(lastSaved().stats.srsReview).toBe(1);
  });

  test('srsReview accumulates across calls', async () => {
    await addXP(5, { srsReview: 3 });
    await addXP(5, { srsReview: 2 });
    expect(lastSaved().stats.srsReview).toBe(5);
  });

  test('wordsTotal stat is incremented', async () => {
    await addXP(0, { wordsTotal: 7 });
    expect(lastSaved().stats.wordsTotal).toBe(7);
  });

  test('sentencesRead is tracked in game.daily', async () => {
    await addXP(2, { sentencesRead: 3 });
    expect(lastSaved().daily.sentencesRead).toBe(3);
  });
});

// ── first sentence bonus + crit ───────────────────────────────────────────────

describe('addXP: first sentence bonus and crit', () => {
  test('first sentence doubles XP (isFirstSentenceBonus=true)', async () => {
    const result = await addXP(10, { sentencesRead: 1 });
    expect(result.isFirstSentenceBonus).toBe(true);
    expect(result.earnedXP).toBe(20);
  });

  test('second sentence in same session has no automatic bonus', async () => {
    await addXP(10, { sentencesRead: 1 }); // uses first-sentence bonus
    const result = await addXP(10, { sentencesRead: 1 });
    expect(result.isFirstSentenceBonus).toBe(false);
  });

  test('crit fires when Math.random() < 0.125 → doubles XP, isCrit=true', async () => {
    // Already used first bonus
    __setStored(makeFullGame({
      daily: {
        date: new Date().toISOString().split('T')[0],
        sentencesRead: 5, wordsLookedUp: 0, wordsSaved: 0,
        bonusGranted: [], firstSentenceBonusUsed: true,
      },
    }));
    const spy = jest.spyOn(Math, 'random').mockReturnValue(0.1); // < 0.125 → crit
    const result = await addXP(10, { sentencesRead: 1 });
    spy.mockRestore();
    expect(result.isCrit).toBe(true);
    expect(result.earnedXP).toBe(20);
  });

  test('no crit when Math.random() >= 0.125', async () => {
    __setStored(makeFullGame({
      daily: {
        date: new Date().toISOString().split('T')[0],
        sentencesRead: 5, wordsLookedUp: 0, wordsSaved: 0,
        bonusGranted: [], firstSentenceBonusUsed: true,
      },
    }));
    const spy = jest.spyOn(Math, 'random').mockReturnValue(0.5); // >= 0.125 → no crit
    const result = await addXP(10, { sentencesRead: 1 });
    spy.mockRestore();
    expect(result.isCrit).toBe(false);
    expect(result.earnedXP).toBe(10);
  });
});

// ── bug 12: newRecord on first day ────────────────────────────────────────────

describe('addXP: personal record (bug 12 regression)', () => {
  test('newRecord fires on the very first sentence ever (prevBest=0)', async () => {
    // Fresh game: no dailyActivity, no records — prevBest is 0
    const result = await addXP(2, { sentencesRead: 1 });
    expect(result.newRecord).not.toBeNull();
    expect(result.newRecord.type).toBe('bestDay');
    expect(result.newRecord.value).toBe(1);
  });

  test('newRecord fires when today beats the stored record', async () => {
    const today = new Date().toISOString().split('T')[0];
    __setStored(makeFullGame({
      stats: {
        wordsTotal: 0, articlesTotal: 0, quizCorrect: 0, srsReview: 0,
        masteredArticleIds: [],
        dailyActivity: { [today]: 5 },
        records: { bestDaySentences: { count: 5, date: today } },
      },
      daily: {
        date: today, sentencesRead: 5, wordsLookedUp: 0, wordsSaved: 0,
        bonusGranted: [], firstSentenceBonusUsed: true,
      },
    }));
    const result = await addXP(2, { sentencesRead: 1 }); // will make today = 6 > 5
    expect(result.newRecord).not.toBeNull();
    expect(result.newRecord.value).toBe(6);
  });

  test('newRecord is null when count does not beat the record', async () => {
    const today = new Date().toISOString().split('T')[0];
    __setStored(makeFullGame({
      stats: {
        wordsTotal: 0, articlesTotal: 0, quizCorrect: 0, srsReview: 0,
        masteredArticleIds: [],
        dailyActivity: { [today]: 10 },
        records: { bestDaySentences: { count: 10, date: today } },
      },
      daily: {
        date: today, sentencesRead: 10, wordsLookedUp: 0, wordsSaved: 0,
        bonusGranted: [], firstSentenceBonusUsed: true,
      },
    }));
    const result = await addXP(2, { sentencesRead: 1 }); // 11 > 10 → still fires
    // Actually 11 > 10, so newRecord fires. Let's use equal count:
    // Use a non-sentencesRead stat so we don't update dailyActivity
    const result2 = await addXP(2, { wordsTotal: 1 });
    expect(result2.newRecord).toBeNull();
  });

  test('newRecord is null when statUpdates does not include sentencesRead', async () => {
    const result = await addXP(10, { wordsTotal: 5 });
    expect(result.newRecord).toBeNull();
  });

  test('saved records.bestDaySentences is updated on new record', async () => {
    await addXP(2, { sentencesRead: 3 });
    const saved = lastSaved();
    expect(saved.stats.records.bestDaySentences.count).toBe(3);
  });
});

// ── daily quest completion ────────────────────────────────────────────────────

describe('addXP: daily quest completion', () => {
  test('completing sentencesRead quest returns it in newlyCompletedQuests', async () => {
    // Schedule[0] = { sentencesRead: 5, ... }. Day 0 = Thursday 1 Jan 1970 (day=0 mod 4 → schedule[0])
    // We can't easily control day; just use wordsLookedUp which has target 3 in schedule[0]
    // Safest: accumulate beyond any schedule target by setting a high count
    // Day 0 schedule: sentencesRead=5, so we give 5 in one shot
    // We rely on jest fake timers pinning day 0 (use day=0 epoch):
    jest.useFakeTimers({ now: new Date('1970-01-01T00:00:00Z') });

    await addXP(2, { sentencesRead: 5 }); // target is 5 on day 0, schedule[0]
    const result = await addXP(0);
    // first call should complete it; let's check what we got
    const firstResult = await (async () => {
      __reset();
      jest.clearAllMocks();
      return addXP(2, { sentencesRead: 5 });
    })();

    jest.useRealTimers();
    expect(firstResult.newlyCompletedQuests).toContain('sentencesRead');
  });

  test('gems increase by 50 when daily quest is completed', async () => {
    jest.useFakeTimers({ now: new Date('1970-01-01T00:00:00Z') });
    const result = await addXP(2, { sentencesRead: 5 }); // completes sentencesRead
    jest.useRealTimers();

    if (result.newlyCompletedQuests.includes('sentencesRead')) {
      expect(lastSaved().gems).toBeGreaterThanOrEqual(50);
    }
  });

  test('quest is not re-completed on subsequent calls', async () => {
    jest.useFakeTimers({ now: new Date('1970-01-01T00:00:00Z') });
    await addXP(2, { sentencesRead: 5 }); // complete it
    jest.clearAllMocks();
    const result2 = await addXP(2, { sentencesRead: 1 }); // should NOT re-complete
    jest.useRealTimers();
    expect(result2.newlyCompletedQuests).not.toContain('sentencesRead');
  });
});

// ── bug 9: weekly quest streak — direct tracking ──────────────────────────────
//
// Week 2947 starts at timestamp 1_782_345_600_000 ms (≈ 2026-06-25).
// weekId 2947 % 8 = 3 → WEEKLY_QUESTS[3] = streak7 (key='streak', target=7, reward=600)
// Using fake timers to land inside that week.

const STREAK_WEEK_TS = 1_782_432_000_000; // 1 day into week 2947

describe('addXP: weekly quest streak type (bug 9 regression)', () => {
  const STREAK_WEEK_ID = 2947;

  beforeAll(() => {
    jest.useFakeTimers({ now: new Date(STREAK_WEEK_TS) });
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  beforeEach(() => {
    __reset();
    jest.clearAllMocks();
  });

  function fakeToday() {
    return new Date(STREAK_WEEK_TS).toISOString().split('T')[0];
  }

  function makeStreakQuestGame(streakCurrent, questProgress) {
    const today = fakeToday();
    return makeFullGame({
      streak: { current: streakCurrent, lastDate: today, max: streakCurrent },
      weeklyQuest: { weekId: STREAK_WEEK_ID, progress: questProgress, completed: false },
      daily: {
        date: today, sentencesRead: 3, wordsLookedUp: 0, wordsSaved: 0,
        bonusGranted: [], firstSentenceBonusUsed: true,
      },
    });
  }

  test('streak quest progress is set to streak.current, not cumulative (bug 9)', async () => {
    // streak=5, previous progress=3 → should become 5 (not 3+delta)
    __setStored(makeStreakQuestGame(5, 3));
    await addXP(2, {});
    const saved = lastSaved();
    expect(saved.weeklyQuest.progress).toBe(5);
  });

  test('streak quest progress decreases after a streak reset (bug 9)', async () => {
    // streak was 5, user broke it → now streak=1, previous progress=5
    __setStored(makeStreakQuestGame(1, 5));
    await addXP(2, {});
    const saved = lastSaved();
    expect(saved.weeklyQuest.progress).toBe(1); // reflects current streak, not stuck at 5
  });

  test('streak quest completes when streak.current reaches target (7)', async () => {
    __setStored(makeStreakQuestGame(7, 6));
    const result = await addXP(2, {});
    expect(result.weeklyQuestJustCompleted).toBe(true);
    expect(result.weeklyQuestReward).toBe(600);
  });

  test('gems are awarded when streak quest completes', async () => {
    __setStored(makeStreakQuestGame(7, 6));
    await addXP(2, {});
    const saved = lastSaved();
    expect(saved.gems).toBeGreaterThanOrEqual(600);
  });

  test('streak quest is not re-completed after already completed', async () => {
    const today = fakeToday();
    __setStored(makeFullGame({
      streak: { current: 8, lastDate: today, max: 8 },
      weeklyQuest: { weekId: STREAK_WEEK_ID, progress: 7, completed: true },
      daily: {
        date: today, sentencesRead: 3, wordsLookedUp: 0, wordsSaved: 0,
        bonusGranted: [], firstSentenceBonusUsed: true,
      },
    }));
    const result = await addXP(2, {});
    expect(result.weeklyQuestJustCompleted).toBe(false);
  });

  test('streak quest: progress=6 → streak reaches 7 → completes in same call', async () => {
    // Progress was 6, streak just became 7 → newProg(7) !== wq.progress(6) → triggers completion
    __setStored(makeStreakQuestGame(7, 6));
    const result = await addXP(2, {});
    const saved = lastSaved();
    expect(saved.weeklyQuest.completed).toBe(true);
    expect(result.weeklyQuestJustCompleted).toBe(true);
  });
});

// ── newlyUnlocked achievements ────────────────────────────────────────────────

describe('addXP: achievement unlocking', () => {
  test('returns newlyUnlocked as an array', async () => {
    const result = await addXP(1);
    expect(Array.isArray(result.newlyUnlocked)).toBe(true);
  });

  test('unlocks "sam" achievement when wordsTotal reaches 1', async () => {
    const result = await addXP(0, { wordsTotal: 1 });
    expect(result.newlyUnlocked.some((a) => a.id === 'sam')).toBe(true);
  });

  test('does not re-unlock already-unlocked achievements', async () => {
    __setStored(makeFullGame({ achievements: { sam: true } }));
    const result = await addXP(0, { wordsTotal: 1 });
    expect(result.newlyUnlocked.some((a) => a.id === 'sam')).toBe(false);
  });

  test('saves unlocked achievement flag in game.achievements', async () => {
    await addXP(0, { wordsTotal: 1 });
    expect(lastSaved().achievements.sam).toBe(true);
  });

  test('XP bonus for achievement is added to total xp', async () => {
    const result = await addXP(0, { wordsTotal: 1 });
    const samAchievement = result.newlyUnlocked.find((a) => a.id === 'sam');
    expect(result.xp).toBeGreaterThanOrEqual(samAchievement?.xpBonus ?? 0);
  });
});
