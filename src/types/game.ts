export type ElementType = 'fire' | 'ice' | 'nature' | 'star' | 'rune' | 'summon' | 'time' | 'space';

export interface GameElement {
  id: string;
  type: ElementType;
  row: number;
  col: number;
  isMatched: boolean;
  isNew: boolean;
  isSelected: boolean;
}

export interface Course {
  id: string;
  name: string;
  description: string;
  icon1: string;
  icon2: string;
  elementTypes: ElementType[];
  color: string;
  isLocked: boolean;
  progress: number;
  levels: Level[];
}

export interface Level {
  id: number;
  targetScore: number;
  timeLimit: number;
  isCompleted: boolean;
  bestGrade: Grade | null;
}

export type Grade = 'S' | 'A' | 'B' | 'C' | 'D';

export interface Character {
  id: string;
  name: string;
  emoji: string;
  specialty: ElementType;
  bonus: number;
  isLocked: boolean;
  color: string;
}

export interface GameState {
  board: GameElement[][];
  score: number;
  targetScore: number;
  timeLeft: number;
  combo: number;
  isPlaying: boolean;
  isPaused: boolean;
  selectedElement: { row: number; col: number } | null;
}

export interface MatchResult {
  matches: { row: number; col: number }[];
  score: number;
  combo: number;
}

export interface GameResult {
  score: number;
  targetScore: number;
  timeUsed: number;
  maxCombo: number;
  grade: Grade;
  isWin: boolean;
  courseId: string;
  characterId: string;
}
