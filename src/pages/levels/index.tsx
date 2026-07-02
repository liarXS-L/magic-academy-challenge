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
      let savedProgress = '';
      try {
        savedProgress = Taro.getStorageSync('gameProgress');
      } catch (e) {
        savedProgress = localStorage.getItem('gameProgress') || '';
      }
      
      const progress = savedProgress ? JSON.parse(savedProgress) : {};
      
      if (progress[courseId]) {
        const updatedLevels = foundCourse.levels.map(level => {
          const savedLevel = progress[courseId][level.id];
          if (savedLevel) {
            return {
              ...level,
              isCompleted: savedLevel.isCompleted,
              bestGrade: savedLevel.bestGrade || level.bestGrade
            };
          }
          return level;
        });
        
        setCourse({
          ...foundCourse,
          levels: updatedLevels,
          progress: Math.round((updatedLevels.filter(l => l.isCompleted).length / updatedLevels.length) * 100)
        });
      } else {
        setCourse(foundCourse);
      }
      
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

  const handleLockedLevelClick = (level: Level, index: number) => {
    const prevLevel = course?.levels[index - 1];
    Taro.showModal({
      title: '🔒 关卡未解锁',
      content: `关卡 ${level.id}\n\n解锁条件：完成关卡 ${index}`,
      confirmText: '知道了',
      showCancel: false
    });
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
              onClick={() => {
                if (status === 'locked') {
                  handleLockedLevelClick(level, index);
                } else {
                  handleLevelSelect(level);
                }
              }}
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
