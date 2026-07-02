import React, { useState } from 'react';
import { View, Text, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { courses, characters } from '@/data/gameData';
import { Course, Character } from '@/types/game';

export default function IndexPage() {
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);

  const handleCourseClick = (course: Course) => {
    if (course.isLocked) {
      Taro.showModal({
        title: '🔒 课程未解锁',
        content: `${course.name}\n\n${course.unlockCondition || '完成前置课程以解锁'}`,
        confirmText: '知道了',
        showCancel: false
      });
      return;
    }
    setSelectedCourse(course);
  };

  const handleCharacterClick = (character: Character) => {
    if (character.isLocked) {
      Taro.showModal({
        title: '🔒 角色未解锁',
        content: `${character.emoji} ${character.name}\n\n${character.unlockCondition || '完成特定条件以解锁'}`,
        confirmText: '知道了',
        showCancel: false
      });
      return;
    }
    setSelectedCharacter(character);
  };

  const handleStartGame = () => {
    if (!selectedCourse || !selectedCharacter) {
      Taro.showToast({
        title: '请选择课程和角色',
        icon: 'none'
      });
      return;
    }

    if (selectedCourse.isLocked || selectedCharacter.isLocked) {
      Taro.showToast({
        title: '所选课程或角色未解锁',
        icon: 'none'
      });
      return;
    }
    
    Taro.reLaunch({
      url: `/pages/levels/index?courseId=${selectedCourse.id}&characterId=${selectedCharacter.id}`
    });
  };

  const canStart = selectedCourse && selectedCharacter && !selectedCourse.isLocked && !selectedCharacter.isLocked;

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <Text className={styles.title}>魔法学院大挑战</Text>
        <Text className={styles.subtitle}>开启你的魔法之旅</Text>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>选择课程</Text>
        <View className={styles.courseGrid}>
          {courses.map(course => (
            <View
              key={course.id}
              className={`${styles.courseCard} ${selectedCourse?.id === course.id ? styles.selected : ''} ${course.isLocked ? styles.locked : ''}`}
              onClick={() => handleCourseClick(course)}
            >
              <View className={styles.courseIcon}>
                <Text>{course.icon1}</Text>
                <Text>{course.icon2}</Text>
              </View>
              <Text className={styles.courseName}>{course.name}</Text>
              <Text className={styles.courseDesc}>{course.description}</Text>
              <View className={styles.courseProgress}>
                <View
                  className={styles.progressFill}
                  style={{ width: `${course.progress}%`, background: course.color }}
                />
              </View>
              {course.isLocked && (
                <View className={styles.lockOverlay}>
                  <Text className={styles.lockIcon}>🔒</Text>
                </View>
              )}
            </View>
          ))}
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>选择角色</Text>
        <View className={styles.characterScroll}>
          {characters.map(character => (
            <View
              key={character.id}
              className={`${styles.characterCard} ${selectedCharacter?.id === character.id ? styles.selected : ''} ${character.isLocked ? styles.locked : ''}`}
              onClick={() => handleCharacterClick(character)}
            >
              <Text className={styles.characterEmoji}>{character.emoji}</Text>
              <Text className={styles.characterName}>{character.name}</Text>
              {selectedCharacter?.id === character.id && (
                <View className={styles.checkmark}>✓</View>
              )}
              {character.isLocked && (
                <View className={styles.lockOverlay}>
                  <Text className={styles.lockIcon}>🔒</Text>
                </View>
              )}
            </View>
          ))}
        </View>
      </View>

      <View className={styles.footer}>
        <Button
          className={`${styles.startButton} ${!canStart ? styles.disabled : ''}`}
          onClick={handleStartGame}
          disabled={!canStart}
        >
          ▶ 开始游戏
        </Button>
      </View>
    </View>
  );
}
