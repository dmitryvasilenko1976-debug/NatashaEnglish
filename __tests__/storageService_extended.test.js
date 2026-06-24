/**
 * Extended tests for src/services/storageService.js
 *
 * Covers pure functions: sm2Update, getRestoredHearts, updateStreakWithInfo
 * Covers async: getSettings, saveSettings (merge behavior — bug 10 regression)
 */

import {
  sm2Update,
  getRestoredHearts,
  updateStreakWithInfo,
  getSettings,
  saveSettings,
} from '../src/services/storageService';

// ── sm2Update ─────────────────────────────────────────────────────────────────

describe('sm2Update', () => {
  const fresh = { interval: 0, easeFactor: 2.5, repetitions: 0 };

  test('grade 0 (Again) resets repetitions to 0 and interval to 1', () => {
    const srs = { interval: 20, easeFactor: 2.5, repetitions: 6 };
    const result = sm2Update(srs, 0);
    expect(result.repetitions).toBe(0);
    expect(result.interval).toBe(1);
  });

  test('grade 1 is treated same as grade 0 (reset)', () => {
    const srs = { interval: 10, easeFactor: 2.5, repetitions: 4 };
    const result = sm2Update(srs, 1);
    expect(result.repetitions).toBe(0);
    expect(result.interval).toBe(1);
  });

  test('grade 0 decreases easeFactor by 0.15', () => {
    const srs = { interval: 5, easeFactor: 2.5, repetitions: 2 };
    const result = sm2Update(srs, 0);
    expect(result.easeFactor).toBeCloseTo(2.35, 5);
  });

  test('grade 4 (Good), first repetition (reps=0): interval=1, reps=1', () => {
    const result = sm2Update(fresh, 4);
    expect(result.interval).toBe(1);
    expect(result.repetitions).toBe(1);
    expect(result.easeFactor).toBe(2.5);
  });

  test('grade 4, second repetition (reps=1): interval=6, reps=2', () => {
    const srs = { interval: 1, easeFactor: 2.5, repetitions: 1 };
    const result = sm2Update(srs, 4);
    expect(result.interval).toBe(6);
    expect(result.repetitions).toBe(2);
  });

  test('grade 4, third repetition (reps=2): interval = round(prev * EF)', () => {
    const srs = { interval: 6, easeFactor: 2.5, repetitions: 2 };
    const result = sm2Update(srs, 4);
    expect(result.interval).toBe(15); // round(6 * 2.5)
    expect(result.repetitions).toBe(3);
    expect(result.easeFactor).toBe(2.5);
  });

  test('grade 2 (Hard) decreases EF and reduces interval by 30%', () => {
    const srs = { interval: 6, easeFactor: 2.5, repetitions: 2 };
    const result = sm2Update(srs, 2);
    expect(result.interval).toBe(Math.max(1, Math.round(15 * 0.7))); // round(15 * 0.7) = 11
    expect(result.easeFactor).toBeCloseTo(2.35, 5);
  });

  test('grade 5 (Easy) increases EF by 0.1 and stretches interval by 1.3x', () => {
    const srs = { interval: 6, easeFactor: 2.5, repetitions: 2 };
    const result = sm2Update(srs, 5);
    expect(result.easeFactor).toBeCloseTo(2.6, 5);
    expect(result.interval).toBe(Math.round(15 * 1.3)); // round(15 * 1.3) = 20
  });

  test('easeFactor never drops below 1.3 after many grade-0 calls', () => {
    let srs = { interval: 1, easeFactor: 1.4, repetitions: 0 };
    for (let i = 0; i < 20; i++) srs = sm2Update(srs, 0);
    expect(srs.easeFactor).toBeGreaterThanOrEqual(1.3);
  });

  test('easeFactor is capped at 2.7 when already at maximum on grade 5', () => {
    // min(2.7, 2.7 + 0.1) = 2.7 — the ceiling holds
    const srs = { interval: 6, easeFactor: 2.7, repetitions: 5 };
    const result = sm2Update(srs, 5);
    expect(result.easeFactor).toBe(2.7);
  });

  test('easeFactor approaches 2.7 over a few grade-5 calls without exceeding it', () => {
    let srs = { interval: 6, easeFactor: 2.3, repetitions: 2 };
    for (let i = 0; i < 5; i++) srs = sm2Update(srs, 5);
    expect(srs.easeFactor).toBeLessThanOrEqual(2.7);
  });

  test('nextReview is a date string on today or later', () => {
    const result = sm2Update(fresh, 4);
    const today = new Date().toISOString().split('T')[0];
    expect(typeof result.nextReview).toBe('string');
    expect(result.nextReview >= today).toBe(true);
  });

  test('higher interval produces a further nextReview date', () => {
    const r1 = sm2Update({ interval: 0, easeFactor: 2.5, repetitions: 0 }, 4); // interval=1
    const r2 = sm2Update({ interval: 1, easeFactor: 2.5, repetitions: 1 }, 4); // interval=6
    expect(r2.nextReview > r1.nextReview).toBe(true);
  });

  test('lastGrade is stored in the result', () => {
    expect(sm2Update(fresh, 4).lastGrade).toBe(4);
    expect(sm2Update(fresh, 0).lastGrade).toBe(0);
  });

  test('missing easeFactor defaults to 2.5', () => {
    const result = sm2Update({ interval: 0, repetitions: 0 }, 4);
    expect(result.easeFactor).toBe(2.5);
  });
});

// ── getRestoredHearts ─────────────────────────────────────────────────────────

describe('getRestoredHearts', () => {
  const RESTORE_MS = 2 * 60 * 60 * 1000;

  test('hearts=3 → { hearts: 3, minutesUntilNext: 0 }', () => {
    const result = getRestoredHearts({ quiz: { hearts: 3, lastHeartRestore: null } });
    expect(result.hearts).toBe(3);
    expect(result.minutesUntilNext).toBe(0);
  });

  test('no lastHeartRestore → same hearts, minutesUntilNext=120', () => {
    const result = getRestoredHearts({ quiz: { hearts: 1, lastHeartRestore: null } });
    expect(result.hearts).toBe(1);
    expect(result.minutesUntilNext).toBe(120);
  });

  test('1h elapsed → no restore yet, ~60 minutes remaining', () => {
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    const result = getRestoredHearts({ quiz: { hearts: 2, lastHeartRestore: oneHourAgo } });
    expect(result.hearts).toBe(2);
    expect(result.minutesUntilNext).toBeGreaterThan(55);
    expect(result.minutesUntilNext).toBeLessThanOrEqual(60);
  });

  test('just over 2h elapsed → restores 1 heart', () => {
    const twoHoursPlus = Date.now() - RESTORE_MS - 1000;
    const result = getRestoredHearts({ quiz: { hearts: 1, lastHeartRestore: twoHoursPlus } });
    expect(result.hearts).toBe(2);
  });

  test('just over 4h elapsed → restores 2 hearts from 0', () => {
    const fourHoursPlus = Date.now() - 2 * RESTORE_MS - 1000;
    const result = getRestoredHearts({ quiz: { hearts: 0, lastHeartRestore: fourHoursPlus } });
    expect(result.hearts).toBe(2);
  });

  test('6h elapsed from hearts=1 → capped at 3, minutesUntilNext=0', () => {
    const sixHoursPlus = Date.now() - 3 * RESTORE_MS - 1000;
    const result = getRestoredHearts({ quiz: { hearts: 1, lastHeartRestore: sixHoursPlus } });
    expect(result.hearts).toBe(3);
    expect(result.minutesUntilNext).toBe(0);
  });

  test('2h elapsed from hearts=2 → restored to 3, minutesUntilNext=0', () => {
    const twoHoursPlus = Date.now() - RESTORE_MS - 1000;
    const result = getRestoredHearts({ quiz: { hearts: 2, lastHeartRestore: twoHoursPlus } });
    expect(result.hearts).toBe(3);
    expect(result.minutesUntilNext).toBe(0);
  });

  test('missing quiz field entirely → defaults to max hearts', () => {
    const result = getRestoredHearts({});
    expect(result.hearts).toBe(3);
    expect(result.minutesUntilNext).toBe(0);
  });
});

// ── updateStreakWithInfo ───────────────────────────────────────────────────────

describe('updateStreakWithInfo', () => {
  const TODAY = '2026-06-23';
  const YESTERDAY = '2026-06-22';
  const TWO_DAYS_AGO = '2026-06-21';

  beforeAll(() => {
    jest.useFakeTimers({ now: new Date('2026-06-23T10:00:00Z') });
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  function makeGame(lastDate, current = 5, shield = false) {
    return {
      xp: 0,
      streak: { current, lastDate, max: current },
      achievements: {},
      stats: { wordsTotal: 0, articlesTotal: 0, quizCorrect: 0 },
      streakShield: shield,
    };
  }

  test('returns { game, streakBroken, previousStreak }', () => {
    const result = updateStreakWithInfo(makeGame(TODAY));
    expect(result).toHaveProperty('game');
    expect(result).toHaveProperty('streakBroken');
    expect(result).toHaveProperty('previousStreak');
  });

  test('streakBroken=false when played today (no gap)', () => {
    const { streakBroken } = updateStreakWithInfo(makeGame(TODAY, 5));
    expect(streakBroken).toBe(false);
  });

  test('streakBroken=false when played yesterday (consecutive days)', () => {
    const { streakBroken } = updateStreakWithInfo(makeGame(YESTERDAY, 5));
    expect(streakBroken).toBe(false);
  });

  test('streakBroken=true on gap, no shield, previousStreak >= 3', () => {
    const { streakBroken } = updateStreakWithInfo(makeGame(TWO_DAYS_AGO, 5, false));
    expect(streakBroken).toBe(true);
  });

  test('streakBroken=false when shield absorbs the gap (bug 5 regression)', () => {
    const { streakBroken } = updateStreakWithInfo(makeGame(TWO_DAYS_AGO, 5, true));
    expect(streakBroken).toBe(false);
  });

  test('shield is consumed (set to false) after absorbing a break', () => {
    const game = makeGame(TWO_DAYS_AGO, 5, true);
    const { game: updated } = updateStreakWithInfo(game);
    expect(updated.streakShield).toBe(false);
  });

  test('streak is preserved when shield absorbs the break', () => {
    const game = makeGame(TWO_DAYS_AGO, 5, true);
    const { game: updated } = updateStreakWithInfo(game);
    expect(updated.streak.current).toBe(5);
  });

  test('streak resets to 1 when gap exists and no shield', () => {
    const game = makeGame(TWO_DAYS_AGO, 5, false);
    const { game: updated } = updateStreakWithInfo(game);
    expect(updated.streak.current).toBe(1);
  });

  test('streakBroken=false when gap exists but previousStreak < 3 (no modal)', () => {
    const { streakBroken } = updateStreakWithInfo(makeGame(TWO_DAYS_AGO, 2, false));
    expect(streakBroken).toBe(false);
  });

  test('previousStreak reflects the streak value before calling', () => {
    const game = makeGame(YESTERDAY, 7);
    const { previousStreak } = updateStreakWithInfo(game);
    expect(previousStreak).toBe(7);
  });

  test('streak increments by 1 on consecutive days', () => {
    const game = makeGame(YESTERDAY, 4);
    const { game: updated } = updateStreakWithInfo(game);
    expect(updated.streak.current).toBe(5);
  });

  test('first-ever play (lastDate=null): streakBroken=false, streak=1', () => {
    const game = makeGame(null, 0);
    const { streakBroken, game: updated } = updateStreakWithInfo(game);
    expect(streakBroken).toBe(false);
    expect(updated.streak.current).toBe(1);
  });
});

// ── getSettings / saveSettings ────────────────────────────────────────────────

jest.mock('@react-native-async-storage/async-storage', () => {
  const store = new Map();
  return {
    getItem:    jest.fn(async (key)        => store.get(key) ?? null),
    setItem:    jest.fn(async (key, value) => { store.set(key, value); }),
    removeItem: jest.fn(async (key)        => { store.delete(key); }),
    __clear: () => store.clear(),
  };
});

jest.mock('../src/data/articles.json', () => [], { virtual: true });

const AsyncStorage = require('@react-native-async-storage/async-storage');

beforeEach(() => {
  AsyncStorage.__clear();
  jest.clearAllMocks();
});

describe('getSettings', () => {
  test('returns { quietMode: false } when nothing is stored', async () => {
    const s = await getSettings();
    expect(s).toEqual({ quietMode: false });
  });

  test('returns stored quietMode=true', async () => {
    await AsyncStorage.setItem('settings', JSON.stringify({ quietMode: true }));
    const s = await getSettings();
    expect(s.quietMode).toBe(true);
  });

  test('merges stored data over default: missing key gets default value', async () => {
    await AsyncStorage.setItem('settings', JSON.stringify({ someOtherPref: 42 }));
    const s = await getSettings();
    expect(s.quietMode).toBe(false); // default applied
    expect(s.someOtherPref).toBe(42); // stored value preserved
  });
});

describe('saveSettings + getSettings merge (bug 10 regression)', () => {
  test('toggleQuietMode pattern preserves other settings', async () => {
    // AchievementsScreen.toggleQuietMode: read current → merge → save
    await AsyncStorage.setItem('settings', JSON.stringify({ quietMode: false, theme: 'dark' }));

    const current = await getSettings();
    await saveSettings({ ...current, quietMode: true });

    const result = await getSettings();
    expect(result.quietMode).toBe(true);
    expect(result.theme).toBe('dark'); // must survive the merge-save
  });

  test('naive overwrite (without merge) loses unrelated settings — confirms anti-pattern', async () => {
    await AsyncStorage.setItem('settings', JSON.stringify({ quietMode: false, theme: 'dark' }));

    // Bad pattern: overwrite without merging first
    await saveSettings({ quietMode: true });

    const result = await getSettings();
    expect(result.quietMode).toBe(true);
    expect(result.theme).toBeUndefined(); // proves why merge is required
  });
});
