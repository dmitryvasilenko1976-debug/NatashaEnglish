import { getGameData, saveGameData } from './storageService';
import { ACHIEVEMENTS } from '../data/achievements';

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

// 4-day rotation so quests feel varied but predictable
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

// ── XP + stats + daily quests ─────────────────────────────────────────────────

// statUpdates keys:
//   cumulative: wordsTotal, articlesTotal, quizCorrect
//   daily:      sentencesRead, wordsLookedUp, wordsSaved

export async function addXP(amount, statUpdates = {}) {
  const game = await getGameData();

  game.xp += amount;

  // Cumulative stats
  const cumulativeKeys = ['wordsTotal', 'articlesTotal', 'quizCorrect'];
  for (const key of cumulativeKeys) {
    if (statUpdates[key]) game.stats[key] = (game.stats[key] || 0) + statUpdates[key];
  }

  // Daily counters — defensive init
  if (!game.daily) game.daily = { date: '', sentencesRead: 0, wordsLookedUp: 0, wordsSaved: 0, bonusGranted: [] };
  if (!game.daily.bonusGranted) game.daily.bonusGranted = [];

  const dailyKeys = ['sentencesRead', 'wordsLookedUp', 'wordsSaved'];
  for (const key of dailyKeys) {
    if (statUpdates[key]) game.daily[key] = (game.daily[key] || 0) + statUpdates[key];
  }

  // Check daily quest completions and award bonus XP once each
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
      newlyCompletedQuests.push(key);
    }
  }

  const { gameData: updated, newlyUnlocked } = checkNewAchievements(game);
  await saveGameData(updated);

  return { xp: updated.xp, newlyUnlocked, newlyCompletedQuests };
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
