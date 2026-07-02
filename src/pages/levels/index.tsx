import React, { useState, useEffect } from 'react';
import { View, Text, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { courses, characters } from '@/data/gameData';
import { Course, Character, Level } from '@/types/game';
import { validateCourseId, validateCharacterId } from '@/utils/validation';

interface LevelParams {
  courseId: string;
  characterId: string;
}

export default function LevelsPage() {
  const [course, setCourse] = useState<Course | null>(null);
  const [character, setCharacter] = useState<Character | null>(null);

  useEffect(() => {
    let courseId = '';
    let characterId = '';
    
    const instance = Taro.getCurrentInstance();
    if (instance?.router?.params) {
      courseId = instance.router.params.courseId || '';
      characterId = instance.router.params.characterId || '';
    }
    
    if (!courseId || !characterId) {
      const urlParams = new URLSearchParams(window.location.search);
      courseId = urlParams.get('courseId') || '';
      characterId = urlParams.get('characterId') || '';
    }
    
    if (!validateCourseId(courseId) || !validateCharacterId(characterId)) {
      Taro.reLaunch({
        url: '/pages/index/index'
      });
      return;
    }
    
    const foundCourse = courses.find(c => c.id === courseId);
    const foundCharacter = characters.find(ch => ch.id === characterId);
    
    if (foundCourse && foundCharacter) {
      setCourse(foundCourse);
      setCharacter(foundCharacter);
    } else {
      Taro.reLaunch({
        url: '/pages/index/index'
      });
    }
  }, []);

  const handleBack = () => {
    Taro.reLaunch({
      url: '/pages/index/index'
    });
  };

  const handleLevelSelect = (level: Level) => {
    if (level.isCompleted) {
      Taro.showToast({
        title: '已完成，可重新挑战',
        icon: 'none'
      });
    }

    if (course && character) {
      Taro.reLaunch({
        url: `/pages/game/index?courseId=${course.id}&characterId=${character.id}&levelId=${level.id}`
      });
    }
  };

  const getLevelStatus = (level: Level, index: number): 'locked' | 'current' | 'completed' => {
    if (index === 0) {
      return level.isCompleted ? 'completed' : 'current';
    }
    
    const prevLevel = course?.levels[index - 1];
    if (prevLevel?.isCompleted) {
      return level.isCompleted ? 'completed' : 'current';
    }
    
    return 'locked';
  };

  const getGradeEmoji = (grade: string | null): string => {
    switch (grade) {
      case 'S': return '🌟';
      case 'A': return '⭐';
      case 'B': return '✨';
      case 'C': return '💫';
      case 'D': return '💧';
      default: return '';
    }
  };

  if (!course || !character) {
    return (
      <View className={styles.page}>
        <Text>加载中...</Text>
      </View>
    );
  }

  return (
    <View className={styles.page}>
      <View className={styles.customNavBar}>
        <View className={styles.backButton} onClick={handleBack}>
          <Text>←</Text>
        </View>
        <View className={styles.courseInfo}>
          <Text className={styles.courseName}>{course.icon1} {course.name}</Text>
          <Text className={styles.characterName}>{character.emoji} {character.name}</Text>
        </View>
        <View className={styles.progress}>
          <Text className={styles.progressText}>{course.progress}%</Text>
        </View>
      </View>

      <View className={styles.progressBar}>
        <View
          className={styles.progressFill}
          style={{ width: `${course.progress}%`, background: course.color }}
        />
      </View>

      <View className={styles.sectionTitle}>
        <Text>选择关卡</Text>
      </View>

      <View className={styles.levelGrid}>
        {course.levels.map((level, index) => {
          const status = getLevelStatus(level, index);
          
          return (
            <View
              key={level.id}
              className={`${styles.levelCard} ${styles[status]}`}
              onClick={() => status !== 'locked' && handleLevelSelect(level)}
            >
              <View className={styles.levelIcon}>
                <Text className={styles.levelNumber}>{level.id}</Text>
                {level.isCompleted && (
                  <Text className={styles.gradeEmoji}>{getGradeEmoji(level.bestGrade)}</Text>
                )}
                {status === 'locked' && (
                  <Text className={styles.lockIcon}>🔒</Text>
                )}
              </View>
              <Text className={styles.levelTarget}>目标: {level.targetScore.toLocaleString()}</Text>
              <Text className={styles.levelTime}>时间: {level.timeLimit}秒</Text>
            </View>
          );
        })}
      </View>

      <View className={styles.description}>
        <Text className={styles.descTitle}>课程介绍</Text>
        <Text className={styles.descText}>{course.description}</Text>
        <View className={styles.descElements}>
          <Text className={styles.elementLabel}>元素类型:</Text>
          {course.elementTypes.map((type, index) => (
            <Text key={index} className={styles.elementIcon}>
              {type === 'fire' && '🔥'}
              {type === 'ice' && '❄️'}
              {type === 'nature' && '🌿'}
              {type === 'star' && '✨'}
              {type === 'rune' && '🔮'}
              {type === 'summon' && '👻'}
              {type === 'time' && '⏳'}
              {type === 'space' && '🌀'}
            </Text>
          ))}
        </View>
      </View>
    </View>
  );
}
