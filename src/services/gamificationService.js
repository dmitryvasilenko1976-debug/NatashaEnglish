import { getGameData, saveGameData, updateStreak } from './storageService';
import { ACHIEVEMENTS } from '../data/achievements';

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

// ── Weekly quest definitions ──────────────────────────────────────────────────

const WEEKLY_QUESTS = [
  { id: 'sentences100', label: 'Прочитай 100 предложений', icon: 'book-outline',       target: 100, key: 'sentencesRead', reward: 500 },
  { id: 'words50',      label: 'Открой 50 слов',           icon: 'search-outline',      target: 50,  key: 'wordsLookedUp', reward: 400 },
  { id: 'save20',       label: 'Сохрани 20 слов',          icon: 'bookmark-outline',    target: 20,  key: 'wordsSaved',    reward: 350 },
  { id: 'streak7',      label: 'Серия 7 дней подряд',      icon: 'flame-outline',       target: 7,   key: 'streak',        reward: 600 },
  { id: 'articles3',    label: 'Дочитай 3 статьи',         icon: 'library-outline',     target: 3,   key: 'articlesTotal', reward: 450 },
  { id: 'xp500',        label: 'Заработай 500 XP',         icon: 'flash-outline',       target: 500, key: 'xpWeek',        reward: 300 },
  { id: 'quiz30',       label: '30 верных ответов в квизе',icon: 'help-circle-outline', target: 30,  key: 'quizCorrect',   reward: 350 },
  { id: 'save10',       label: 'Сохрани 10 слов',          icon: 'star-outline',        target: 10,  key: 'wordsSaved',    reward: 300 },
];

export function getWeeklyQuest(game) {
  const weekId = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000));
  const def = WEEKLY_QUESTS[weekId % WEEKLY_QUESTS.length];
  const stored = game.weeklyQuest || {};
  if (stored.weekId !== weekId) {
    return { ...def, weekId, progress: 0, completed: false };
  }
  return { ...def, weekId, progress: stored.progress || 0, completed: stored.completed || false };
}

// ── League ────────────────────────────────────────────────────────────────────

const RIVAL_NAMES = [
  'Арагорн', 'Леголас', 'Гимли', 'Боромир', 'Сэм',
  'Мерри', 'Пиппин', 'Теоден', 'Фарамир', 'Эовин',
  'Галадриэль', 'Элронд', 'Глорфиндел', 'Берегонд', 'Халбарад',
];

const LEAGUE_TIERS = ['Лига Хоббитов', 'Лига Странников', 'Лига Рейнджеров', 'Лига Мудрецов'];

export function getLeagueTierName(tier) {
  return LEAGUE_TIERS[Math.min(tier || 0, LEAGUE_TIERS.length - 1)];
}

export function generateLeague(userXP) {
  const names = shuffle(RIVAL_NAMES).slice(0, 9);
  return names.map((name, i) => {
    let xp;
    if (i < 2)      xp = userXP + 50 + Math.floor(Math.random() * 100);         // 2 ahead
    else if (i < 5) xp = Math.max(0, userXP - 20 - Math.floor(Math.random() * 180)); // 3 behind
    else             xp = Math.floor(Math.random() * Math.max(userXP * 1.5 + 100, 600)); // 4 random
    return { name, xp };
  });
}

export function updateLeagueRivals(game) {
  const weekId = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000));
  if (!game.league || game.league.weekId !== weekId) {
    game.league = {
      weekId,
      tier: game.league?.tier || 0,
      rivals: generateLeague(game.xp),
    };
  } else {
    game.league.rivals = game.league.rivals.map(r => ({
      ...r,
      xp: r.xp + Math.floor(Math.random() * 4),
    }));
  }
  return game;
}

// ── Level system ──────────────────────────────────────────────────────────────

const LEVEL_TIERS = [
  { xp: 0,     level: 1, title: 'Хоббит',    subtitle: 'из Шира' },
  { xp: 100,   level: 2, title: 'Путник',     subtitle: 'на дороге' },
  { xp: 300,   level: 3, title: 'Следопыт',   subtitle: 'Дунэдан Севера' },
  { xp: 600,   level: 4, title: 'Рыцарь',     subtitle: 'Гондора' },
  { xp: 1100,  level: 5, title: 'Эльф',       subtitle: 'Ривенделла' },
  { xp: 2000,  level: 6, title: 'Майар',      subtitle: 'дух Средиземья' },
  { xp: 3500,  level: 7, title: 'Истари',     subtitle: 'в сером плаще' },
  { xp: 6000,  level: 8, title: 'Валар',      subtitle: 'правитель мира' },
  { xp: 10000, level: 9, title: 'Эру',        subtitle: 'Илуватар' },
];

export function getLevelInfo(xp) {
  let idx = 0;
  for (let i = 0; i < LEVEL_TIERS.length; i++) {
    if (xp >= LEVEL_TIERS[i].xp) idx = i;
  }
  const current = LEVEL_TIERS[idx];
  const next = LEVEL_TIERS[idx + 1] || null;
  return {
    level: current.level,
    title: current.title,
    subtitle: current.subtitle,
    prevXP: current.xp,
    nextXP: next ? next.xp : null,
    progress: next ? (xp - current.xp) / (next.xp - current.xp) : 1,
  };
}

// ── Daily quests ──────────────────────────────────────────────────────────────

const QUEST_SCHEDULES = [
  { sentencesRead: 5,  wordsLookedUp: 3, wordsSaved: 1, xp: { s: 20, w: 15, v: 30 } },
  { sentencesRead: 10, wordsLookedUp: 5, wordsSaved: 2, xp: { s: 30, w: 20, v: 40 } },
  { sentencesRead: 8,  wordsLookedUp: 5, wordsSaved: 2, xp: { s: 25, w: 20, v: 40 } },
  { sentencesRead: 15, wordsLookedUp: 8, wordsSaved: 3, xp: { s: 40, w: 30, v: 60 } },
];

function getDailySchedule() {
  const day = Math.floor(Date.now() / 86400000);
  return QUEST_SCHEDULES[day % QUEST_SCHEDULES.length];
}

export function getDailyQuests(game) {
  const s = getDailySchedule();
  const daily = game.daily || {};
  const granted = daily.bonusGranted || [];
  return [
    {
      id: 'sentencesRead',
      label: 'Читать свитки',
      target: s.sentencesRead,
      progress: Math.min(daily.sentencesRead || 0, s.sentencesRead),
      xpReward: s.xp.s,
      completed: granted.includes('sentencesRead'),
      icon: 'book-outline',
    },
    {
      id: 'wordsLookedUp',
      label: 'Открыть слова',
      target: s.wordsLookedUp,
      progress: Math.min(daily.wordsLookedUp || 0, s.wordsLookedUp),
      xpReward: s.xp.w,
      completed: granted.includes('wordsLookedUp'),
      icon: 'search-outline',
    },
    {
      id: 'wordsSaved',
      label: 'Сохранить слова',
      target: s.wordsSaved,
      progress: Math.min(daily.wordsSaved || 0, s.wordsSaved),
      xpReward: s.xp.v,
      completed: granted.includes('wordsSaved'),
      icon: 'bookmark-outline',
    },
  ];
}

// ── XP + stats + daily/weekly quests ─────────────────────────────────────────

export async function addXP(amount, statUpdates = {}) {
  const game = await getGameData();

  // ── Epoch I bonuses ───────────────────────────────────────────────────────
  let earnedXP = amount;
  let isCrit = false;
  let isFirstSentenceBonus = false;

  if (statUpdates.sentencesRead) {
    if (!game.daily.firstSentenceBonusUsed) {
      earnedXP = amount * 2;
      game.daily.firstSentenceBonusUsed = true;
      isFirstSentenceBonus = true;
    } else if (Math.random() < 0.125) {
      earnedXP = amount * 2;
      isCrit = true;
    }
  }

  game.xp += earnedXP;

  // Cumulative stats
  const cumulativeKeys = ['wordsTotal', 'articlesTotal', 'quizCorrect'];
  for (const key of cumulativeKeys) {
    if (statUpdates[key]) game.stats[key] = (game.stats[key] || 0) + statUpdates[key];
  }

  // Daily counters
  if (!game.daily) game.daily = { date: '', sentencesRead: 0, wordsLookedUp: 0, wordsSaved: 0, bonusGranted: [] };
  if (!game.daily.bonusGranted) game.daily.bonusGranted = [];

  const dailyKeys = ['sentencesRead', 'wordsLookedUp', 'wordsSaved'];
  for (const key of dailyKeys) {
    if (statUpdates[key]) game.daily[key] = (game.daily[key] || 0) + statUpdates[key];
  }

  // Heatmap
  if (statUpdates.sentencesRead) {
    const today = new Date().toISOString().split('T')[0];
    if (!game.stats.dailyActivity) game.stats.dailyActivity = {};
    game.stats.dailyActivity[today] =
      (game.stats.dailyActivity[today] || 0) + statUpdates.sentencesRead;
  }

  // Daily quest completions → gems
  const schedule = getDailySchedule();
  const questTargets = {
    sentencesRead: schedule.sentencesRead,
    wordsLookedUp: schedule.wordsLookedUp,
    wordsSaved:    schedule.wordsSaved,
  };
  const questXP = {
    sentencesRead: schedule.xp.s,
    wordsLookedUp: schedule.xp.w,
    wordsSaved:    schedule.xp.v,
  };
  const newlyCompletedQuests = [];
  for (const key of dailyKeys) {
    if (
      (game.daily[key] || 0) >= questTargets[key] &&
      !game.daily.bonusGranted.includes(key)
    ) {
      game.daily.bonusGranted.push(key);
      game.xp += questXP[key];
      game.gems = (game.gems || 0) + 50;
      newlyCompletedQuests.push(key);
    }
  }

  // Weekly quest progress
  const weekId = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000));
  if (!game.weeklyQuest || game.weeklyQuest.weekId !== weekId) {
    game.weeklyQuest = { weekId, progress: 0, completed: false };
  }
  const wqDef = WEEKLY_QUESTS[weekId % WEEKLY_QUESTS.length];
  const wq = game.weeklyQuest;
  let weeklyQuestJustCompleted = false;

  if (!wq.completed) {
    let delta = 0;
    if (wqDef.key === 'xpWeek') {
      delta = earnedXP;
    } else if (wqDef.key === 'streak') {
      const cur = game.streak?.current || 0;
      delta = Math.max(0, cur - (wq.progress || 0));
    } else if (statUpdates[wqDef.key]) {
      delta = statUpdates[wqDef.key];
    }
    if (delta > 0) {
      wq.progress = (wq.progress || 0) + delta;
      if (wq.progress >= wqDef.target) {
        wq.completed = true;
        weeklyQuestJustCompleted = true;
        game.gems = (game.gems || 0) + wqDef.reward;
      }
    }
    game.weeklyQuest = wq;
  }

  const { gameData: updated, newlyUnlocked } = checkNewAchievements(game);
  await saveGameData(updated);

  return {
    xp: updated.xp,
    newlyUnlocked,
    newlyCompletedQuests,
    earnedXP,
    isCrit,
    isFirstSentenceBonus,
    articlesTotal: updated.stats.articlesTotal || 0,
    weeklyQuestJustCompleted,
    weeklyQuestReward: weeklyQuestJustCompleted ? wqDef.reward : 0,
  };
}

// ── Gems ─────────────────────────────────────────────────────────────────────

export async function addGems(amount) {
  const game = await getGameData();
  game.gems = (game.gems || 0) + amount;
  await saveGameData(game);
  return game.gems;
}

export async function buyStreakShield() {
  const game = await getGameData();
  if ((game.gems || 0) < 100) return { success: false, gems: game.gems || 0 };
  game.gems -= 100;
  game.streakShield = true;
  await saveGameData(game);
  return { success: true, gems: game.gems };
}

// ── Login streak + daily bonus ────────────────────────────────────────────────

const LOGIN_GEMS = [10, 15, 20, 25, 35, 50, 70];

export function updateLoginStreak(game) {
  const today = new Date().toISOString().split('T')[0];
  if (!game.loginStreak) game.loginStreak = { current: 0, lastLogin: null };
  const ls = game.loginStreak;

  if (ls.lastLogin === today) return { game, gemsEarned: 0, bonusDay: 0 };

  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  ls.current = ls.lastLogin === yesterday ? ls.current + 1 : 1;
  ls.lastLogin = today;

  const bonusGems = LOGIN_GEMS[Math.min(ls.current - 1, LOGIN_GEMS.length - 1)];
  game.gems = (game.gems || 0) + bonusGems;

  return { game, gemsEarned: bonusGems, bonusDay: ls.current };
}

// ── Achievement checker ───────────────────────────────────────────────────────

export function checkNewAchievements(gameData) {
  const newlyUnlocked = [];
  for (const achievement of ACHIEVEMENTS) {
    if (gameData.achievements[achievement.id]) continue;
    const stats = { ...gameData.stats, streakMax: gameData.streak?.max || 0 };
    if (achievement.check(stats)) {
      gameData.achievements[achievement.id] = true;
      gameData.xp += achievement.xpBonus;
      newlyUnlocked.push(achievement);
    }
  }
  return { gameData, newlyUnlocked };
}
