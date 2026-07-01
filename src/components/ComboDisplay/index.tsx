import React, { useEffect, useState } from 'react';
import { View, Text } from '@tarojs/components';
import styles from './index.module.scss';

interface ComboDisplayProps {
  combo: number;
}

export default function ComboDisplay(props: ComboDisplayProps) {
  const { combo } = props;
  const [showCombo, setShowCombo] = useState(false);
  const [displayCombo, setDisplayCombo] = useState(0);

  useEffect(() => {
    if (combo > 1) {
      setDisplayCombo(combo);
      setShowCombo(true);
      const timer = setTimeout(() => setShowCombo(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [combo]);

  if (!showCombo) return null;

  const getComboColor = () => {
    if (displayCombo >= 5) return styles.colorGold;
    if (displayCombo >= 3) return styles.colorOrange;
    return styles.colorYellow;
  };

  return (
    <View className={styles.container}>
      <View className={`${styles.combo} ${getComboColor()}`}>
        <Text className={styles.comboNumber}>{displayCombo}</Text>
        <Text className={styles.comboText}>COMBO!</Text>
      </View>
    </View>
  );
}
