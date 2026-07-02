import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import GameBoard from '@/components/GameBoard';
import ComboDisplay from '@/components/ComboDisplay';
import { courses, characters } from '@/data/gameData';
import {
  initializeBoard,
  isValidMove,
  swapElements,
  findMatches,
  markMatches,
  dropElements,
  fillEmptyCells,
  calculateScore,
  createGameResult,
  classifyMatches,
  createSpecialElements,
  triggerSpecialEffects
} from '@/utils/gameLogic';
import { GameElement as GameElementType, Course, Character, GameResult } from '@/types/game';

interface GameParams {
  courseId: string;
  characterId: string;
  levelId: number;
}

type GamePhase = 'waiting' | 'countdown' | 'playing' | 'paused' | 'ended';

export default function GamePage() {
  const [phase, setPhase] = useState<GamePhase>('waiting');
  const [board, setBoard] = useState<GameElementType[][]>([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [selectedElement, setSelectedElement] = useState<{ row: number; col: number } | null>(null);
  const [countdown, setCountdown] = useState(0);
  
  const [course, setCourse] = useState<Course | null>(null);
  const [character, setCharacter] = useState<Character | null>(null);
  const [targetScore, setTargetScore] = useState(5000);
  const [isTargetReached, setIsTargetReached] = useState(false);
  const [levelId, setLevelId] = useState(1);
  
  const timerRef = useRef<number | null>(null);
  const countdownRef = useRef<number | null>(null);
  const isProcessingRef = useRef(false);
  
  const gameStateRef = useRef({
    score: 0,
    targetScore: 5000,
    timeLeft: 60,
    maxCombo: 0,
    course: null as Course | null,
    character: null as Character | null,
    levelId: 1
  });

  useEffect(() => {
    let courseId = '';
    let characterId = '';
    let parsedLevelId = 1;
    
    try {
      const instance = Taro.getCurrentInstance();
      if (instance?.router?.params) {
        courseId = instance.router.params.courseId || '';
        characterId = instance.router.params.characterId || '';
        if (instance.router.params.levelId) {
          parsedLevelId = parseInt(instance.router.params.levelId, 10) || 1;
        }
      }
    } catch (e) {
      console.error('Failed to get params from instance', e);
    }
    
    if (!courseId || !characterId) {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        courseId = urlParams.get('courseId') || '';
        characterId = urlParams.get('characterId') || '';
        const levelIdStr = urlParams.get('levelId');
        if (levelIdStr) {
          parsedLevelId = parseInt(levelIdStr, 10) || 1;
        }
      } catch (e) {
        console.error('Failed to parse from URL', e);
      }
    }
    
    if (!courseId || !characterId) {
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
      setLevelId(parsedLevelId);
      
      const level = foundCourse.levels.find(l => l.id === parsedLevelId) || foundCourse.levels[0];
      setTargetScore(level.targetScore);
      setTimeLeft(level.timeLimit);
      
      setBoard(initializeBoard(foundCourse.elementTypes));
    } else {
      const defaultCourse = courses[0];
      const defaultCharacter = characters[0];
      setCourse(defaultCourse);
      setCharacter(defaultCharacter);
      setLevelId(1);
      setTargetScore(defaultCourse.levels[0].targetScore);
      setTimeLeft(defaultCourse.levels[0].timeLimit);
      setBoard(initializeBoard(defaultCourse.elementTypes));
    }
  }, []);

  useEffect(() => {
    gameStateRef.current = {
      score,
      targetScore,
      timeLeft,
      maxCombo,
      course,
      character,
      levelId
    };
  }, [score, targetScore, timeLeft, maxCombo, course, character, levelId]);

  const handleBack = () => {
    Taro.showModal({
      title: '确认退出',
      content: '退出后当前游戏进度将丢失',
      success: (res) => {
        if (res.confirm) {
          if (course && character) {
            const params = JSON.stringify({
              courseId: course.id,
              characterId: character.id
            });
            Taro.reLaunch({
              url: `/pages/levels/index?params=${encodeURIComponent(params)}`
            });
          } else {
            Taro.reLaunch({
              url: '/pages/index/index'
            });
          }
        }
      }
    });
  };

  const handlePause = () => {
    if (phase === 'playing') {
      setPhase('paused');
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    if (phase === 'countdown') {
      setPhase('paused');
      if (countdownRef.current) {
        clearTimeout(countdownRef.current);
        countdownRef.current = null;
      }
    }
  };

  const handleResume = () => {
    setPhase('playing');
  };

  const startGame = () => {
    console.log('startGame called, setting phase to countdown');
    setPhase('countdown');
    setCountdown(3);
  };

  useEffect(() => {
    if (phase === 'countdown') {
      if (countdown > 0) {
        countdownRef.current = setTimeout(() => setCountdown(countdown - 1), 1000) as unknown as number;
        return () => {
          if (countdownRef.current) {
            clearTimeout(countdownRef.current);
            countdownRef.current = null;
          }
        };
      } else {
        setPhase('playing');
      }
    }
  }, [phase, countdown]);

  useEffect(() => {
    if (phase === 'playing') {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            endGame();
            return 0;
          }
          return prev - 1;
        });
      }, 1000) as unknown as number;
      
      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      };
    }
  }, [phase]);

  useEffect(() => {
    if (score >= targetScore && phase === 'playing' && score > 0 && !isTargetReached) {
      setIsTargetReached(true);
      Taro.showToast({
        title: '目标达成！继续挑战更高分！',
        icon: 'success',
        duration: 2000
      });
    }
  }, [score, targetScore, phase, isTargetReached]);

  const endGame = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (countdownRef.current) {
      clearTimeout(countdownRef.current);
      countdownRef.current = null;
    }

    const state = gameStateRef.current;
    if (state.course && state.character) {
      const result: GameResult = createGameResult(
        state.score,
        state.targetScore,
        (state.course.levels.find(l => l.id === state.levelId)?.timeLimit || state.course.levels[0]?.timeLimit || 60) - state.timeLeft,
        state.maxCombo,
        state.course.id,
        state.character.id
      );

      Taro.reLaunch({
        url: `/pages/result/index?params=${encodeURIComponent(JSON.stringify(result))}`
      });
    }
  }, []);

  const processMatches = useCallback(async (currentBoard: GameElementType[][], currentCombo: number) => {
    const classification = classifyMatches(currentBoard);
    let allMatches = [...classification.normalMatches];

    const specialEffects = triggerSpecialEffects(currentBoard, classification.normalMatches);
    allMatches = [...new Set([...allMatches, ...specialEffects])];

    if (allMatches.length === 0) {
      setCombo(0);
      isProcessingRef.current = false;
      return;
    }

    const newCombo = currentCombo + 1;
    setCombo(newCombo);
    setMaxCombo(prev => Math.max(prev, newCombo));

    let markedBoard = markMatches(currentBoard, allMatches);
    markedBoard = createSpecialElements(markedBoard, classification);
    setBoard(markedBoard);

    await new Promise(resolve => setTimeout(resolve, 300));

    if (!course) {
      isProcessingRef.current = false;
      return;
    }

    let baseScore = allMatches.length * 10;
    
    let comboMultiplier = 1;
    if (newCombo >= 3) comboMultiplier = 1.5;
    if (newCombo >= 5) comboMultiplier = 2;
    
    let elementBonus = 1;
    if (character?.specialty) {
      const hasSpecialty = allMatches.some(({ row, col }) => markedBoard[row][col].type === character.specialty);
      if (hasSpecialty) {
        elementBonus = 1 + character.bonus;
      }
    }
    
    const totalScore = Math.floor(baseScore * comboMultiplier * elementBonus);

    setScore(prev => prev + totalScore);

    const droppedBoard = dropElements(markedBoard);
    setBoard(droppedBoard);

    await new Promise(resolve => setTimeout(resolve, 200));

    const filledBoard = fillEmptyCells(droppedBoard, course.elementTypes);
    setBoard(filledBoard);

    await new Promise(resolve => setTimeout(resolve, 300));

    const clearedBoard = filledBoard.map(row => row.map(el => ({ ...el, isNew: false })));
    setBoard(clearedBoard);
    
    setTimeout(() => {
      processMatches(clearedBoard, newCombo);
    }, 100);
  }, [character, course]);

  const handleElementClick = useCallback((row: number, col: number) => {
    if (phase !== 'playing' || isProcessingRef.current) return;

    if (!selectedElement) {
      const newBoard = board.map(r => r.map(el => ({ ...el, isSelected: false })));
      newBoard[row][col].isSelected = true;
      setBoard(newBoard);
      setSelectedElement({ row, col });
      return;
    }

    const { row: prevRow, col: prevCol } = selectedElement;

    const diffRow = Math.abs(row - prevRow);
    const diffCol = Math.abs(col - prevCol);

    if (!((diffRow === 1 && diffCol === 0) || (diffRow === 0 && diffCol === 1))) {
      const newBoard = board.map(r => r.map(el => ({ ...el, isSelected: false })));
      newBoard[row][col].isSelected = true;
      setBoard(newBoard);
      setSelectedElement({ row, col });
      return;
    }

    if (course) {
      if (!isValidMove(board, prevRow, prevCol, row, col)) {
        const newBoard = board.map(r => r.map(el => ({ ...el, isSelected: false })));
        newBoard[row][col].isSelected = true;
        setBoard(newBoard);
        setSelectedElement({ row, col });
        return;
      }

      isProcessingRef.current = true;

      const newBoard = swapElements(board, prevRow, prevCol, row, col);
      const clearedBoard = newBoard.map(r => r.map(el => ({ ...el, isSelected: false })));
      setBoard(clearedBoard);
      setSelectedElement(null);

      setTimeout(() => {
        processMatches(clearedBoard, 0);
      }, 200);
    }
  }, [phase, selectedElement, board, course, processMatches]);

  const getTimeBarClass = () => {
    const percentage = (timeLeft / (course?.levels[0]?.timeLimit || 60)) * 100;
    if (percentage <= 10) return styles.timeFillDanger;
    if (percentage <= 30) return styles.timeFillWarning;
    return styles.timeFillNormal;
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
          <Text className={styles.courseName}>{course.name}</Text>
          <Text className={styles.characterName}>{character.emoji} {character.name}</Text>
        </View>
        <View className={styles.pauseButton} onClick={handlePause}>
          <Text>⏸️</Text>
        </View>
      </View>

      <View className={styles.timeBar}>
        <View
          className={`${styles.timeFill} ${getTimeBarClass()}`}
          style={{ width: `${(timeLeft / (course?.levels[0]?.timeLimit || 60)) * 100}%` }}
        />
      </View>

      <View className={styles.gameBoard}>
        <GameBoard board={board} onElementClick={handleElementClick} />
      </View>

      <View className={styles.scorePanel}>
        <View className={styles.scoreHeader}>
          <Text className={styles.scoreLabel}>得分</Text>
          <Text className={styles.scoreValue}>{score.toLocaleString()}</Text>
        </View>
        <View className={styles.scoreProgress}>
          <View
            className={styles.scoreFill}
            style={{ width: `${Math.min((score / targetScore) * 100, 100)}%` }}
          />
        </View>
        <Text className={styles.scoreTarget}>目标: {targetScore.toLocaleString()}</Text>
      </View>

      <ComboDisplay combo={combo} />

      {phase === 'waiting' && (
        <View className={styles.overlay}>
          <View className={styles.overlayContent}>
            <Text className={styles.overlayTitle}>准备挑战</Text>
            <Text className={styles.overlayDesc}>
              课程: {course.name}
            </Text>
            <Text className={styles.overlayDesc}>
              目标得分: {targetScore}
            </Text>
            <Text className={styles.overlayDesc}>
              时间: {timeLeft}秒
            </Text>
            <View className={styles.overlayButtons}>
              <Button className={`${styles.overlayButton} ${styles.primary}`} onClick={startGame}>
                开始挑战
              </Button>
              <Button className={`${styles.overlayButton} ${styles.secondary}`} onClick={handleBack}>
                返回首页
              </Button>
            </View>
          </View>
        </View>
      )}

      {phase === 'countdown' && (
        <View className={styles.overlay}>
          <Text className={styles.countdown}>{countdown}</Text>
        </View>
      )}

      {phase === 'paused' && (
        <View className={styles.overlay}>
          <View className={styles.overlayContent}>
            <Text className={styles.overlayTitle}>游戏暂停</Text>
            <Text className={styles.overlayDesc}>剩余时间: {timeLeft}秒</Text>
            <View className={styles.overlayButtons}>
              <Button className={`${styles.overlayButton} ${styles.primary}`} onClick={handleResume}>
                继续游戏
              </Button>
              <Button className={`${styles.overlayButton} ${styles.secondary}`} onClick={handleBack}>
                返回首页
              </Button>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}
