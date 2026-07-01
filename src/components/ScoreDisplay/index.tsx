import React, { useEffect, useState } from 'react';
import { View, Text } from '@tarojs/components';
import styles from './index.module.scss';
import ProgressBar from '../ProgressBar';

interface ScoreDisplayProps {
  score: number;
  targetScore: number;
}

export default function ScoreDisplay(props: ScoreDisplayProps) {
  const { score, targetScore } = props;
  const [displayScore, setDisplayScore] = useState(0);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    if (score > displayScore) {
      setShowPopup(true);
      const timer = setTimeout(() => setShowPopup(false), 800);
      
      const duration = 300;
      const startTime = Date.now();
      const startScore = displayScore;
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        setDisplayScore(Math.floor(startScore + (score - startScore) * progress));
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      
      requestAnimationFrame(animate);
      return () => clearTimeout(timer);
    }
  }, [score, displayScore]);

  const percentage = (score / targetScore) * 100;
  let color = 'normal';
  if (percentage >= 100) color = 'normal';
  else if (percentage >= 70) color = 'warning';
  else color = 'danger';

  return (
    <View className={styles.container}>
      <View className={styles.header}>
        <Text className={styles.title}>得分</Text>
        <Text className={styles.score}>{displayScore.toLocaleString()}</Text>
      </View>
      <ProgressBar
        current={score}
        total={targetScore}
        showLabel={false}
        color={color}
        height={16}
      />
      <Text className={styles.target}>目标: {targetScore.toLocaleString()}</Text>
      
      {showPopup && (
        <View className={styles.popup}>
          <Text className={styles.popupText}>+{score - displayScore}</Text>
        </View>
      )}
    </View>
  );
}
