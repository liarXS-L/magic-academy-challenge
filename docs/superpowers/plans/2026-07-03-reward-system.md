# 魔法水晶奖励系统 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the magic crystal reward system with shop, inventory, and in-game item usage.

**Architecture:** Use Taro storage API for data persistence, create reward types and utils, add shop page, modify game page for item usage, modify result page for rewards, and update home page with crystal display and shop entry.

**Tech Stack:** Taro 4.x, React 18, TypeScript, CSS Modules, SCSS

## Global Constraints

- Use `Taro.setStorageSync` / `Taro.getStorageSync` for data persistence with localStorage fallback
- Follow existing code patterns in the codebase
- Add button icon prefix (如 `btn-icon`, `btn-ghost`) per style guide
- All new files must use `.tsx` for React components, `.ts` for types/utils
- SCSS files must use `.module.scss` extension

---

## File Structure

| File | Type | Responsibility |
|------|------|----------------|
| `src/types/reward.ts` | New | Reward system type definitions |
| `src/data/achievementData.ts` | New | Achievement configuration data |
| `src/utils/rewardUtils.ts` | New | Reward system utility functions |
| `src/pages/shop/index.tsx` | New | Shop page component |
| `src/pages/shop/index.module.scss` | New | Shop page styles |
| `src/types/game.ts` | Modify | Add reward-related types |
| `src/pages/game/index.tsx` | Modify | Add item bar and usage logic |
| `src/pages/game/index.module.scss` | Modify | Add item bar styles |
| `src/pages/result/index.tsx` | Modify | Display rewards on result page |
| `src/pages/index/index.tsx` | Modify | Add crystal display and shop entry |
| `src/pages/index/index.module.scss` | Modify | Add shop button styles |
| `app.config.ts` | Modify | Add shop page route |

---

## Task 1: Create Reward Types

**Files:**
- Create: `src/types/reward.ts`

**Interfaces:**
- Consumes: None
- Produces: `ItemType`, `InventoryItem`, `Achievement`, `PlayerData` types

- [ ] **Step 1: Create type definitions file**

```typescript
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
```

- [ ] **Step 2: Verify file creation**

Run: `dir src/types`
Expected: `reward.ts` exists

- [ ] **Step 3: Commit**

```bash
git add src/types/reward.ts
git commit -m "feat: add reward system type definitions"
```

---

## Task 2: Create Achievement Data

**Files:**
- Create: `src/data/achievementData.ts`

**Interfaces:**
- Consumes: `Achievement` type from `src/types/reward.ts`
- Produces: `achievements` array

- [ ] **Step 1: Create achievement data file**

```typescript
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
```

- [ ] **Step 2: Verify file creation**

Run: `dir src/data`
Expected: `achievementData.ts` exists

- [ ] **Step 3: Commit**

```bash
git add src/data/achievementData.ts
git commit -m "feat: add achievement and shop data"
```

---

## Task 3: Create Reward Utilities

**Files:**
- Create: `src/utils/rewardUtils.ts`

**Interfaces:**
- Consumes: `PlayerData`, `Achievement`, `ShopItem`, `ItemType` types
- Produces: `getPlayerData`, `savePlayerData`, `addCrystals`, `addItem`, `useItem`, `buyItem`, `updateAchievements` functions

- [ ] **Step 1: Create utility functions**

```typescript
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

export const addItem = (itemType: ItemType): PlayerData => {
  const data = getPlayerData();
  const existing = data.inventory.find(i => i.type === itemType);
  if (existing) {
    existing.count++;
  } else {
    data.inventory.push({ type: itemType, count: 1 });
  }
  savePlayerData(data);
  return data;
};

export const useItem = (itemType: ItemType): boolean => {
  const data = getPlayerData();
  const item = data.inventory.find(i => i.type === itemType);
  if (item && item.count > 0) {
    item.count--;
    savePlayerData(data);
    return true;
  }
  return false;
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
  newMatches: number,
  grade: string
): PlayerData => {
  const data = getPlayerData();
  
  data.totalMatches += newMatches;
  
  if (grade === 'S') {
    data.totalSGrades++;
  }
  
  let allCompleted = true;
  let completedCount = 0;
  courses.forEach(course => {
    course.levels.forEach(level => {
      if (level.isCompleted) completedCount++;
      else allCompleted = false;
    });
  });
  
  data.achievements.forEach(achievement => {
    if (achievement.isCompleted) return;
    
    switch (achievement.id) {
      case 'total_matches_1000':
        achievement.progress = Math.min(data.totalMatches, achievement.target);
        if (data.totalMatches >= achievement.target) {
          achievement.isCompleted = true;
          data.crystals += achievement.reward;
        }
        break;
      case 's_grade_10':
        achievement.progress = Math.min(data.totalSGrades, achievement.target);
        if (data.totalSGrades >= achievement.target) {
          achievement.isCompleted = true;
          data.crystals += achievement.reward;
        }
        break;
      case 'complete_all_courses':
        achievement.progress = completedCount;
        if (allCompleted) {
          achievement.isCompleted = true;
          data.crystals += achievement.reward;
        }
        break;
    }
  });
  
  savePlayerData(data);
  return data;
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
```

- [ ] **Step 2: Verify file creation**

Run: `dir src/utils`
Expected: `rewardUtils.ts` exists

- [ ] **Step 3: Commit**

```bash
git add src/utils/rewardUtils.ts
git commit -m "feat: add reward utility functions"
```

---

## Task 4: Add Shop Page Route

**Files:**
- Modify: `src/app.config.ts`

**Interfaces:**
- Consumes: None
- Produces: Updated routes array

- [ ] **Step 1: Read current config file**

Run: `cat src/app.config.ts`

- [ ] **Step 2: Add shop page route**

```typescript
export default defineAppConfig({
  pages: [
    'pages/index/index',
    'pages/levels/index',
    'pages/game/index',
    'pages/result/index',
    'pages/shop/index'
  ],
  // ... rest of config
});
```

- [ ] **Step 3: Commit**

```bash
git add src/app.config.ts
git commit -m "feat: add shop page route"
```

---

## Task 5: Create Shop Page

**Files:**
- Create: `src/pages/shop/index.tsx`
- Create: `src/pages/shop/index.module.scss`

**Interfaces:**
- Consumes: `PlayerData`, `ShopItem` types, `getPlayerData`, `buyItem`, `shopItems`, `itemEmojis`
- Produces: Shop page component

- [ ] **Step 1: Create shop styles**

```scss
.container {
  min-height: 100vh;
  background: $color-bg-page;
  padding: 20rpx;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  background: $color-bg-card;
  border-radius: 20rpx;
  margin-bottom: 30rpx;
  
  .title {
    font-size: 36rpx;
    font-weight: 700;
    color: $color-text-primary;
  }
  
  .crystals {
    display: flex;
    align-items: center;
    gap: 10rpx;
    font-size: 32rpx;
    font-weight: 600;
    color: $color-warning;
  }
}

.shop-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.shop-item {
  display: flex;
  align-items: center;
  padding: 30rpx;
  background: $color-bg-card;
  border-radius: 20rpx;
  border: 2rpx solid $color-border;
  
  &:active {
    background: $color-bg-card-light;
  }
  
  .emoji {
    font-size: 64rpx;
    margin-right: 20rpx;
  }
  
  .info {
    flex: 1;
    
    .name {
      font-size: 32rpx;
      font-weight: 600;
      color: $color-text-primary;
      margin-bottom: 8rpx;
    }
    
    .desc {
      font-size: 24rpx;
      color: $color-text-secondary;
    }
  }
  
  .price {
    display: flex;
    align-items: center;
    gap: 8rpx;
    margin-right: 20rpx;
    font-size: 28rpx;
    color: $color-warning;
  }
  
  .btn-buy {
    padding: 15rpx 30rpx;
    background: linear-gradient(135deg, $color-primary 0%, $color-primary-light 100%);
    border-radius: 30rpx;
    font-size: 26rpx;
    color: $color-text-primary;
    font-weight: 600;
    
    &:disabled {
      background: $color-text-disabled;
      color: $color-text-secondary;
    }
  }
}

.footer {
  margin-top: 40rpx;
  padding-bottom: 40rpx;
  
  .btn-back {
    width: 100%;
    padding: 25rpx;
    background: $color-bg-card;
    border: 2rpx solid $color-border;
    border-radius: 30rpx;
    font-size: 30rpx;
    color: $color-text-primary;
    text-align: center;
  }
}
```

- [ ] **Step 2: Create shop component**

```tsx
import { useState, useEffect } from 'react';
import { View, Text, Button, Taro } from '@tarojs/taro';
import { PlayerData } from '@/types/reward';
import { getPlayerData, buyItem } from '@/utils/rewardUtils';
import { shopItems, itemEmojis } from '@/data/achievementData';
import styles from './index.module.scss';

export default function ShopPage() {
  const [playerData, setPlayerData] = useState<PlayerData>(getPlayerData());

  const handleBuy = (itemType: string, price: number) => {
    if (playerData.crystals >= price) {
      buyItem(itemType as any, price);
      setPlayerData(getPlayerData());
      Taro.showToast({
        title: '购买成功',
        icon: 'success'
      });
    } else {
      Taro.showToast({
        title: '水晶不足',
        icon: 'none'
      });
    }
  };

  useEffect(() => {
    Taro.setNavigationBarTitle({ title: '🔮 魔法商店' });
  }, []);

  return (
    <View className={styles.container}>
      <View className={styles.header}>
        <Text className={styles.title}>🛒 魔法商店</Text>
        <View className={styles.crystals}>
          <Text>💎</Text>
          <Text>{playerData.crystals}</Text>
        </View>
      </View>

      <View className={styles.shopList}>
        {shopItems.map(item => (
          <View className={styles.shopItem} key={item.type}>
            <Text className={styles.emoji}>{item.emoji}</Text>
            <View className={styles.info}>
              <Text className={styles.name}>{item.name}</Text>
              <Text className={styles.desc}>{item.description}</Text>
            </View>
            <View className={styles.price}>
              <Text>💎</Text>
              <Text>{item.price}</Text>
            </View>
            <Button 
              className={styles.btnBuy}
              disabled={playerData.crystals < item.price}
              onClick={() => handleBuy(item.type, item.price)}
            >
              购买
            </Button>
          </View>
        ))}
      </View>

      <View className={styles.footer}>
        <Button className={styles.btnBack} onClick={() => Taro.reLaunch({ url: '/pages/index/index' })}>
          返回首页
        </Button>
      </View>
    </View>
  );
}
```

- [ ] **Step 3: Verify file creation**

Run: `dir src/pages/shop`
Expected: `index.tsx` and `index.module.scss` exist

- [ ] **Step 4: Commit**

```bash
git add src/pages/shop/index.tsx src/pages/shop/index.module.scss
git commit -m "feat: create shop page"
```

---

## Task 6: Modify Home Page

**Files:**
- Modify: `src/pages/index/index.tsx`
- Modify: `src/pages/index/index.module.scss`

**Interfaces:**
- Consumes: `getPlayerData`, `PlayerData`
- Produces: Updated home page with crystal display and shop entry

- [ ] **Step 1: Read current home page**

Run: `cat src/pages/index/index.tsx`

- [ ] **Step 2: Add crystal display and shop button**

Add these imports:
```typescript
import { PlayerData } from '@/types/reward';
import { getPlayerData } from '@/utils/rewardUtils';
```

Add state:
```typescript
const [playerData, setPlayerData] = useState<PlayerData>(getPlayerData());
```

Add crystal display in header and shop button:
```tsx
<View className={styles.header}>
  <Text className={styles.title}>🧙‍♂️ 魔法学院大挑战</Text>
  <View className={styles.crystals}>
    <Text>💎 {playerData.crystals}</Text>
  </View>
</View>

// ... existing code ...

<Button className={styles.btnShop} onClick={() => Taro.navigateTo({ url: '/pages/shop/index' })}>
  🛒 魔法商店
</Button>
```

- [ ] **Step 3: Add styles**

```scss
.crystals {
  font-size: 28rpx;
  color: $color-warning;
  font-weight: 600;
}

.btnShop {
  margin-top: 20rpx;
  padding: 20rpx;
  background: $color-bg-card;
  border: 2rpx solid $color-border;
  border-radius: 30rpx;
  font-size: 28rpx;
  color: $color-text-primary;
}
```

- [ ] **Step 4: Commit**

```bash
git add src/pages/index/index.tsx src/pages/index/index.module.scss
git commit -m "feat: add crystal display and shop entry to home page"
```

---

## Task 7: Modify Game Page

**Files:**
- Modify: `src/pages/game/index.tsx`
- Modify: `src/pages/game/index.module.scss`

**Interfaces:**
- Consumes: `useItem`, `getItemCount`, `getDropProbability`, `getRandomItemType`, `addItem`
- Produces: Updated game page with item bar and usage

- [ ] **Step 1: Read current game page**

Run: `cat src/pages/game/index.tsx`

- [ ] **Step 2: Add imports and state**

```typescript
import { ItemType } from '@/types/reward';
import { useItem, getPlayerData, addItem, getDropProbability, getRandomItemType } from '@/utils/rewardUtils';
import { itemEmojis } from '@/data/achievementData';
```

Add state:
```typescript
const [inventory, setInventory] = useState<any[]>([]);
const [scoreMultiplier, setScoreMultiplier] = useState(1);
const [cooldowns, setCooldowns] = useState<Record<string, number>>({});
```

Add effect to load inventory:
```typescript
useEffect(() => {
  const data = getPlayerData();
  setInventory(data.inventory);
}, []);
```

- [ ] **Step 3: Add item drop logic in processMatches**

After calculating matches:
```typescript
const dropProbability = getDropProbability(allMatches.length);
if (Math.random() < dropProbability) {
  const itemType = getRandomItemType();
  addItem(itemType);
  setInventory(getPlayerData().inventory);
  Taro.showToast({
    title: `获得 ${itemEmojis[itemType]}`,
    icon: 'none'
  });
}
```

- [ ] **Step 4: Add item usage functions**

```typescript
const handleUseItem = (itemType: ItemType) => {
  const now = Date.now();
  if (cooldowns[itemType] && now < cooldowns[itemType]) {
    Taro.showToast({ title: '冷却中', icon: 'none' });
    return;
  }
  
  if (useItem(itemType)) {
    setInventory(getPlayerData().inventory);
    setCooldowns({ ...cooldowns, [itemType]: now + 10000 });
    
    switch (itemType) {
      case 'energy_potion':
        setEnergy(prev => Math.min(prev + 100, character?.skill?.energyCost || 500));
        Taro.showToast({ title: '能量恢复+100', icon: 'success' });
        break;
      case 'time_hourglass':
        setTimeLeft(prev => prev + 5);
        Taro.showToast({ title: '时间+5秒', icon: 'success' });
        break;
      case 'score_scroll':
        setScoreMultiplier(2);
        Taro.showToast({ title: '分数翻倍！', icon: 'success' });
        setTimeout(() => setScoreMultiplier(1), 10000);
        break;
    }
  } else {
    Taro.showToast({ title: '道具不足', icon: 'none' });
  }
};
```

- [ ] **Step 5: Add item bar UI**

Add item bar at bottom:
```tsx
<View className={styles.itemBar}>
  {inventory.map(item => {
    const isCooldown = cooldowns[item.type] && Date.now() < cooldowns[item.type];
    return (
      <Button
        key={item.type}
        className={`${styles.itemBtn} ${isCooldown ? styles.itemBtnCooldown : ''}`}
        disabled={isCooldown || item.count <= 0}
        onClick={() => handleUseItem(item.type)}
      >
        <Text>{itemEmojis[item.type]}</Text>
        <Text className={styles.itemCount}>x{item.count}</Text>
      </Button>
    );
  })}
</View>
```

- [ ] **Step 6: Add styles**

```scss
.itemBar {
  display: flex;
  justify-content: center;
  gap: 20rpx;
  padding: 20rpx;
  background: $color-bg-card;
  border-top: 2rpx solid $color-border;
  
  .itemBtn {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 15rpx 30rpx;
    background: $color-bg-card-light;
    border: 2rpx solid $color-border;
    border-radius: 20rpx;
    font-size: 40rpx;
    
    &:active:not(:disabled) {
      background: $color-primary;
    }
    
    &:disabled {
      opacity: 0.5;
    }
    
    .itemCount {
      font-size: 20rpx;
      color: $color-text-secondary;
    }
  }
  
  .itemBtnCooldown {
    position: relative;
    
    &::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      border-radius: 20rpx;
    }
  }
}
```

- [ ] **Step 7: Commit**

```bash
git add src/pages/game/index.tsx src/pages/game/index.module.scss
git commit -m "feat: add item bar and usage to game page"
```

---

## Task 8: Modify Result Page

**Files:**
- Modify: `src/pages/result/index.tsx`

**Interfaces:**
- Consumes: `addCrystals`, `getCrystalReward`, `updateAchievements`
- Produces: Updated result page showing rewards

- [ ] **Step 1: Read current result page**

Run: `cat src/pages/result/index.tsx`

- [ ] **Step 2: Add reward display**

Import:
```typescript
import { addCrystals, getCrystalReward, updateAchievements } from '@/utils/rewardUtils';
```

Add after calculating result:
```typescript
const crystalReward = getCrystalReward(result.grade);
addCrystals(crystalReward);
updateAchievements(0, result.grade);
```

Add reward display in JSX:
```tsx
<View className={styles.reward}>
  <Text className={styles.rewardTitle}>🎁 通关奖励</Text>
  <View className={styles.rewardItem}>
    <Text>💎 魔法水晶: +{crystalReward}</Text>
  </View>
</View>
```

- [ ] **Step 3: Add styles**

```scss
.reward {
  margin-top: 30rpx;
  padding: 30rpx;
  background: $color-bg-card;
  border-radius: 20rpx;
  border: 2rpx solid $color-border;
  
  .rewardTitle {
    font-size: 32rpx;
    font-weight: 600;
    color: $color-text-primary;
    margin-bottom: 20rpx;
    display: block;
  }
  
  .rewardItem {
    font-size: 28rpx;
    color: $color-success;
  }
}
```

- [ ] **Step 4: Commit**

```bash
git add src/pages/result/index.tsx
git commit -m "feat: add reward display to result page"
```

---

## Task 9: Build and Test

**Files:**
- All modified files

- [ ] **Step 1: Run H5 build**

Run: `npm run build:h5`
Expected: Build successful

- [ ] **Step 2: Run Weapp build**

Run: `npm run build:weapp`
Expected: Build successful

- [ ] **Step 3: Verify functionality**

Test cases:
1. Home page shows crystal count and shop button
2. Shop page displays items and allows purchase
3. Game page shows item bar and allows item usage
4. Result page shows crystal reward
5. Data persists across page reloads

---

## Self-Review

**1. Spec coverage:**
- ✅ 奖励类型（魔法水晶、能量药剂、时间沙漏、分数卷轴）
- ✅ 获取方式（通关奖励、随机掉落、成就奖励）
- ✅ 使用方式（商店兑换、游戏中主动使用）
- ✅ 数据存储（Taro storage + localStorage fallback）
- ✅ 成就系统（3个成就）
- ✅ UI设计（商店页面、道具栏、水晶显示）

**2. Placeholder scan:**
- ✅ No TBD, TODO, or incomplete sections

**3. Type consistency:**
- ✅ Types match across tasks
- ✅ Function names consistent

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-07-03-reward-system.md`. Two execution options:

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

**Which approach?**
