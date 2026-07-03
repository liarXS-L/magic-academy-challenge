import { Achievement } from '@/types/reward';

export const achievements: Achievement[] = [
  {
    id: 'total_matches_1000',
    name: '消除大师',
    description: '累计消除1000次',
    condition: '累计消除1000次',
    reward: 200,
    isCompleted: false,
    progress: 0,
    target: 1000
  },
  {
    id: 's_grade_10',
    name: 'S级专家',
    description: '累计获得10次S级评价',
    condition: '累计获得10次S级评价',
    reward: 300,
    isCompleted: false,
    progress: 0,
    target: 10
  },
  {
    id: 'complete_all_courses',
    name: '全能法师',
    description: '完成所有课程的所有关卡',
    condition: '完成所有课程的所有关卡',
    reward: 500,
    isCompleted: false,
    progress: 0,
    target: 16
  }
];

export const shopItems = [
  {
    type: 'energy_potion' as const,
    name: '能量药剂',
    description: '恢复100点能量',
    emoji: '🧪',
    price: 50
  },
  {
    type: 'time_hourglass' as const,
    name: '时间沙漏',
    description: '增加5秒时间',
    emoji: '⏳',
    price: 60
  },
  {
    type: 'score_scroll' as const,
    name: '分数卷轴',
    description: '下一次消除分数翻倍',
    emoji: '📜',
    price: 70
  }
];

export const itemEmojis: Record<string, string> = {
  energy_potion: '🧪',
  time_hourglass: '⏳',
  score_scroll: '📜'
};

export const gradeCrystalRewards: Record<string, number> = {
  S: 100,
  A: 70,
  B: 50,
  C: 30,
  D: 10
};