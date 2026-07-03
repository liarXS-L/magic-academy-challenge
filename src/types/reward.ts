export type ItemType = 'energy_potion' | 'time_hourglass' | 'score_scroll';

export interface InventoryItem {
  type: ItemType;
  count: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  condition: string;
  reward: number;
  isCompleted: boolean;
  progress: number;
  target: number;
}

export interface PlayerData {
  crystals: number;
  inventory: InventoryItem[];
  achievements: Achievement[];
  totalMatches: number;
  totalSGrades: number;
}

export interface ShopItem {
  type: ItemType;
  name: string;
  description: string;
  emoji: string;
  price: number;
}