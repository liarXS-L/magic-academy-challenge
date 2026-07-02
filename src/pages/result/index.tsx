import React, { useState, useEffect } from 'react';
import { View, Text, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { GameResult } from '@/types/game';

export default function ResultPage() {
  const [result, setResult] = useState<GameResult | null>(null);

  useEffect(() => {
    let parsedResult: GameResult | null = null;
    
    try {
      const instance = Taro.getCurrentInstance();
      if (instance?.router?.params?.params) {
        parsedResult = JSON.parse(decodeURIComponent(instance.router.params.params));
        console.log('Parsed from Taro instance:', parsedResult);
      }
    } catch (e) {
      console.error('Failed to parse from Taro instance', e);
    }
    
    if (!parsedResult) {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const paramsStr = urlParams.get('params');
        if (paramsStr) {
          parsedResult = JSON.parse(decodeURIComponent(paramsStr));
          console.log('Parsed from URL:', parsedResult);
        }
      } catch (e) {
        console.error('Failed to parse from URL', e);
      }
    }
    
    if (!parsedResult) {
      parsedResult = {
        score: 0,
        targetScore: 5000,
        grade: 'D',
        isWin: false,
        timeUsed: 0,
        maxCombo: 0,
        courseId: 'fire-ice',
        characterId: 'fire-wizard'
      };
    }
    
    setResult(parsedResult);
  }, []);

  const handleContinue = () => {
    if (!result) return;
    
    Taro.reLaunch({
      url: `/pages/levels/index?courseId=${result.courseId}&characterId=${result.characterId}`
    });
  };

  const handleBack = () => {
    if (!result) {
      Taro.reLaunch({
        url: '/pages/index/index'
      });
      return;
    }
    
    Taro.reLaunch({
      url: `/pages/levels/index?courseId=${result.courseId}&characterId=${result.characterId}`
    });
  };

  const getStars = (grade: string) => {
    const starMap: Record<string, number> = {
      S: 5,
      A: 4,
      B: 3,
      C: 2,
      D: 1
    };
    return starMap[grade] || 0;
  };

  const getGradeClass = (grade: string) => {
    return `grade${grade}`;
  };

  if (!result) {
    return (
      <View className={styles.page}>
        <Text>加载中...</Text>
      </View>
    );
  }

  const ratio = (result.score / result.targetScore) * 100;

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <Text className={styles.resultIcon}>{result.isWin ? '🎉' : '😢'}</Text>
        <Text className={styles.resultTitle}>
          {result.isWin ? '挑战成功！' : '挑战失败'}
        </Text>
      </View>

      <View className={styles.gradeDisplay}>
        <Text className={`${styles.grade} ${styles[getGradeClass(result.grade)]}`}>
          {result.grade}
        </Text>
        <View className={styles.stars}>
          {[1, 2, 3, 4, 5].map(i => (
            <Text key={i} className={`${styles.star} ${i <= getStars(result.grade) ? styles.active : ''}`}>
              ⭐
            </Text>
          ))}
        </View>
      </View>

      <View className={styles.scoreSection}>
        <Text className={styles.scoreLabel}>最终得分</Text>
        <Text className={styles.scoreValue}>{result.score.toLocaleString()}</Text>
        <Text className={styles.scoreTarget}>目标分数: {result.targetScore.toLocaleString()} ({ratio.toFixed(0)}%)</Text>
      </View>

      <View className={styles.statsSection}>
        <View className={styles.statCard}>
          <Text className={styles.statIcon}>⏱️</Text>
          <Text className={styles.statValue}>{result.timeUsed}s</Text>
          <Text className={styles.statLabel}>用时</Text>
        </View>
        <View className={styles.statCard}>
          <Text className={styles.statIcon}>🔥</Text>
          <Text className={styles.statValue}>{result.maxCombo}x</Text>
          <Text className={styles.statLabel}>最大连击</Text>
        </View>
        <View className={styles.statCard}>
          <Text className={styles.statIcon}>📊</Text>
          <Text className={styles.statValue}>{ratio.toFixed(0)}%</Text>
          <Text className={styles.statLabel}>完成度</Text>
        </View>
      </View>

      <View className={`${styles.rewardsSection} ${!result.isWin ? styles.hidden : ''}`}>
        <Text className={styles.rewardsTitle}>获得奖励</Text>
        <View className={styles.rewardsList}>
          <View className={styles.rewardItem}>
            <Text className={styles.rewardIcon}>💰</Text>
            <Text className={styles.rewardText}>100 学分</Text>
          </View>
          <View className={styles.rewardItem}>
            <Text className={styles.rewardIcon}>🪄</Text>
            <Text className={styles.rewardText}>魔法棒 x1</Text>
          </View>
        </View>
      </View>

      <View className={styles.footer}>
        {result.isWin && (
          <Button className={`${styles.button} ${styles.primary}`} onClick={handleContinue}>
            ▶ 继续挑战
          </Button>
        )}
        <Button className={`${styles.button} ${styles.secondary}`} onClick={handleBack}>
          返回关卡选择
        </Button>
      </View>
    </View>
  );
}
