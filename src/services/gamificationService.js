import { getGameData, saveGameData } from './storageService';
import { ACHIEVEMENTS } from '../data/achievements';

export async function addXP(amount, statUpdates = {}) {
  const game = await getGameData();

  game.xp += amount;

  for (const [key, delta] of Object.entries(statUpdates)) {
    if (typeof game.stats[key] === 'number') {
      game.stats[key] += delta;
    }
  }

  const { gameData: updated, newlyUnlocked } = checkNewAchievements(game);
  await saveGameData(updated);

  return { xp: updated.xp, newlyUnlocked };
}

export function checkNewAchievements(gameData) {
  const newlyUnlocked = [];

  for (const achievement of ACHIEVEMENTS) {
    if (gameData.achievements[achievement.id]) continue;

    const stats = { ...gameData.stats, streakMax: gameData.streak.max || 0 };

    if (achievement.check(stats)) {
      gameData.achievements[achievement.id] = true;
      gameData.xp += achievement.xpBonus;
      newlyUnlocked.push(achievement);
    }
  }

  return { gameData, newlyUnlocked };
}
