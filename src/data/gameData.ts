import { Course, Character, ElementType } from '@/types/game';

export const courses: Course[] = [
  {
    id: 'fire-ice',
    name: '火焰与冰霜',
    description: '掌控冰火双重力量',
    icon1: '🔥',
    icon2: '❄️',
    elementTypes: ['fire', 'ice', 'star', 'nature'],
    color: '#EF4444',
    isLocked: false,
    progress: 75,
    levels: [
      { id: 1, targetScore: 5000, timeLimit: 60, isCompleted: true, bestGrade: 'S' },
      { id: 2, targetScore: 7000, timeLimit: 55, isCompleted: true, bestGrade: 'A' },
      { id: 3, targetScore: 10000, timeLimit: 55, isCompleted: true, bestGrade: 'B' },
      { id: 4, targetScore: 12000, timeLimit: 50, isCompleted: false, bestGrade: null }
    ]
  },
  {
    id: 'nature-star',
    name: '自然与生命',
    description: '召唤自然的力量',
    icon1: '🌿',
    icon2: '✨',
    elementTypes: ['nature', 'star', 'fire', 'rune'],
    color: '#22C55E',
    isLocked: false,
    progress: 50,
    levels: [
      { id: 1, targetScore: 5000, timeLimit: 60, isCompleted: true, bestGrade: 'A' },
      { id: 2, targetScore: 7000, timeLimit: 55, isCompleted: true, bestGrade: 'B' },
      { id: 3, targetScore: 10000, timeLimit: 55, isCompleted: false, bestGrade: null },
      { id: 4, targetScore: 12000, timeLimit: 50, isCompleted: false, bestGrade: null }
    ]
  },
  {
    id: 'rune-summon',
    name: '符文与召唤',
    description: '解密古老的符文',
    icon1: '🔮',
    icon2: '👻',
    elementTypes: ['rune', 'summon', 'ice', 'space'],
    color: '#8B5CF6',
    isLocked: false,
    progress: 25,
    levels: [
      { id: 1, targetScore: 5000, timeLimit: 60, isCompleted: true, bestGrade: 'B' },
      { id: 2, targetScore: 7000, timeLimit: 55, isCompleted: false, bestGrade: null },
      { id: 3, targetScore: 10000, timeLimit: 55, isCompleted: false, bestGrade: null },
      { id: 4, targetScore: 12000, timeLimit: 50, isCompleted: false, bestGrade: null }
    ]
  },
  {
    id: 'time-space',
    name: '时间与空间',
    description: '操控时空的奥秘',
    icon1: '⏳',
    icon2: '🌀',
    elementTypes: ['time', 'space', 'summon', 'rune'],
    color: '#6366F1',
    isLocked: true,
    progress: 0,
    levels: [
      { id: 1, targetScore: 8000, timeLimit: 55, isCompleted: false, bestGrade: null },
      { id: 2, targetScore: 10000, timeLimit: 50, isCompleted: false, bestGrade: null },
      { id: 3, targetScore: 13000, timeLimit: 50, isCompleted: false, bestGrade: null },
      { id: 4, targetScore: 15000, timeLimit: 45, isCompleted: false, bestGrade: null }
    ]
  }
];

export const characters: Character[] = [
  {
    id: 'fire-wizard',
    name: '火焰巫师',
    emoji: '🧙‍♂️',
    specialty: 'fire',
    bonus: 0.2,
    isLocked: false,
    color: '#EF4444'
  },
  {
    id: 'ice-mage',
    name: '冰霜法师',
    emoji: '🧙‍♀️',
    specialty: 'ice',
    bonus: 0.2,
    isLocked: false,
    color: '#3B82F6'
  },
  {
    id: 'nature-druid',
    name: '自然德鲁伊',
    emoji: '🌲',
    specialty: 'nature',
    bonus: 0.2,
    isLocked: false,
    color: '#22C55E'
  },
  {
    id: 'rune-scholar',
    name: '符文学者',
    emoji: '📚',
    specialty: 'rune',
    bonus: 0.2,
    isLocked: true,
    color: '#8B5CF6'
  }
];

export const elementEmojis: Record<ElementType, string> = {
  fire: '🔥',
  ice: '❄️',
  nature: '🌿',
  star: '✨',
  rune: '🔮',
  summon: '👻',
  time: '⏳',
  space: '🌀'
};

export const elementColors: Record<ElementType, string> = {
  fire: '#EF4444',
  ice: '#3B82F6',
  nature: '#22C55E',
  star: '#FBBF24',
  rune: '#8B5CF6',
  summon: '#EC4899',
  time: '#6366F1',
  space: '#06B6D4'
};
