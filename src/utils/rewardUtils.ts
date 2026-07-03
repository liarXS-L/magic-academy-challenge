import { PlayerData, ItemType } from '@/types/reward';
import { achievements, gradeCrystalRewards } from '@/data/achievementData';
import { courses } from '@/data/gameData';

const STORAGE_KEY = 'playerData';

export const getPlayerData = (): PlayerData => {
  try {
    const saved = Taro.getStorageSync(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  }

  return {
    crystals: 100,
    inventory: [
      { type: 'energy_potion', count: 2 },
      { type: 'time_hourglass', count: 1 },
      { type: 'score_scroll', count: 1 }
    ],
    achievements: [...achievements],
    totalMatches: 0,
    totalSGrades: 0
  };
};

export const savePlayerData = (data: PlayerData): void => {
  try {
    Taro.setStorageSync(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }
};

export const addCrystals = (amount: number): PlayerData => {
  const data = getPlayerData();
  data.crystals += amount;
  savePlayerData(data);
  return data;
};

export const addItem = (itemType: ItemType, count: number = 1): PlayerData => {
  const data = getPlayerData();
  const existing = data.inventory.find(i => i.type === itemType);
  if (existing) {
    existing.count += count;
  } else {
    data.inventory.push({ type: itemType, count });
  }
  savePlayerData(data);
  return data;
};

export const useItem = (itemType: ItemType): { timeBonus: number; scoreBonus: number; scoreMultiplier: number } => {
  const data = getPlayerData();
  const item = data.inventory.find(i => i.type === itemType);
  if (item && item.count > 0) {
    item.count--;
    savePlayerData(data);
    
    switch (itemType) {
      case 'time_hourglass':
        return { timeBonus: 30, scoreBonus: 0, scoreMultiplier: 1 };
      case 'energy_potion':
        return { timeBonus: 0, scoreBonus: 500, scoreMultiplier: 1 };
      case 'score_scroll':
        return { timeBonus: 0, scoreBonus: 0, scoreMultiplier: 2 };
      default:
        return { timeBonus: 0, scoreBonus: 0, scoreMultiplier: 1 };
    }
  }
  return { timeBonus: 0, scoreBonus: 0, scoreMultiplier: 1 };
};

export const buyItem = (itemType: ItemType, price: number): boolean => {
  const data = getPlayerData();
  if (data.crystals >= price) {
    data.crystals -= price;
    addItem(itemType);
    return true;
  }
  return false;
};

export const updateAchievements = (
  gameResult: { score: number; maxCombo: number; grade: string; isWin: boolean }
): string[] => {
  const data = getPlayerData();

  if (gameResult.isWin) {
    data.totalMatches += gameResult.score;
    
    if (gameResult.grade === 'S') {
      data.totalSGrades++;
    }
  }

  let allCompleted = true;
  let completedCount = 0;
  try {
    const savedProgress = Taro.getStorageSync('gameProgress') || localStorage.getItem('gameProgress');
    if (savedProgress) {
      const progress = JSON.parse(savedProgress);
      Object.values(progress).forEach((courseProgress: any) => {
        Object.values(courseProgress).forEach((level: any) => {
          if (level?.isCompleted) completedCount++;
          else allCompleted = false;
        });
      });
    }
  } catch (e) {
    console.error('Failed to load progress for achievements:', e);
  }

  const completedNames: string[] = [];

  data.achievements.forEach(achievement => {
    if (achievement.isCompleted) return;

    switch (achievement.id) {
      case 'total_matches_1000':
        achievement.progress = Math.min(data.totalMatches, achievement.target);
        if (data.totalMatches >= achievement.target) {
          achievement.isCompleted = true;
          data.crystals += achievement.reward;
          completedNames.push(achievement.name);
        }
        break;
      case 's_grade_10':
        achievement.progress = Math.min(data.totalSGrades, achievement.target);
        if (data.totalSGrades >= achievement.target) {
          achievement.isCompleted = true;
          data.crystals += achievement.reward;
          completedNames.push(achievement.name);
        }
        break;
      case 'complete_all_courses':
        achievement.progress = completedCount;
        if (allCompleted) {
          achievement.isCompleted = true;
          data.crystals += achievement.reward;
          completedNames.push(achievement.name);
        }
        break;
      case 'first_win':
        if (gameResult.isWin) {
          achievement.isCompleted = true;
          data.crystals += achievement.reward;
          completedNames.push(achievement.name);
        }
        break;
      case 'combo_master':
        achievement.progress = Math.max(achievement.progress, gameResult.maxCombo);
        if (gameResult.maxCombo >= achievement.target) {
          achievement.isCompleted = true;
          data.crystals += achievement.reward;
          completedNames.push(achievement.name);
        }
        break;
    }
  });

  savePlayerData(data);
  return completedNames;
};

export const getDropProbability = (matchLength: number): number => {
  if (matchLength >= 5) return 0.15;
  if (matchLength >= 4) return 0.1;
  return 0.05;
};

export const getRandomItemType = (): ItemType => {
  const types: ItemType[] = ['energy_potion', 'time_hourglass', 'score_scroll'];
  return types[Math.floor(Math.random() * types.length)];
};

export const getCrystalReward = (grade: string): number => {
  return gradeCrystalRewards[grade] || 10;
};