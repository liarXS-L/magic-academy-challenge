import { useState, useEffect } from 'react';
import { View, Text, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
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

      <View className={styles.shopGrid}>
        {shopItems.map(item => (
          <View className={styles.shopCard} key={item.type}>
            <View className={styles.cardHeader}>
              <Text className={styles.cardEmoji}>{item.emoji}</Text>
            </View>
            <View className={styles.cardBody}>
              <Text className={styles.cardName}>{item.name}</Text>
              <Text className={styles.cardDesc}>{item.description}</Text>
            </View>
            <View className={styles.cardFooter}>
              <View className={styles.cardPrice}>
                <Text className={styles.priceIcon}>💎</Text>
                <Text className={styles.priceValue}>{item.price}</Text>
              </View>
              <Button
                className={`${styles.cardBtn} ${playerData.crystals < item.price ? styles.cardBtnDisabled : ''}`}
                disabled={playerData.crystals < item.price}
                onClick={() => handleBuy(item.type, item.price)}
              >
                购买
              </Button>
            </View>
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