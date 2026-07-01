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
  createGameResult
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
  const [countdown, setCountdown] = useState(3);
  
  const [course, setCourse] = useState<Course | null>(null);
  const [character, setCharacter] = useState<Character | null>(null);
  const [targetScore, setTargetScore] = useState(5000);
  
  const timerRef = useRef<number | null>(null);
  const isProcessingRef = useRef(false);

  useEffect(() => {
    const pages = Taro.getCurrentPages();
    const currentPage = pages[pages.length - 1];
    const options = (currentPage as any).options || {};
    
    console.log('GamePage options:', options);
    
    let params: GameParams | null = null;
    
    if (options?.params) {
      try {
        params = JSON.parse(decodeURIComponent(options.params));
        console.log('Parsed params:', params);
      } catch (e) {
        console.error('Failed to parse game params', e);
      }
    }
    
    if (!params) {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const paramsStr = urlParams.get('params');
        if (paramsStr) {
          params = JSON.parse(decodeURIComponent(paramsStr));
          console.log('Parsed from URL:', params);
        }
      } catch (e) {
        console.error('Failed to parse from URL', e);
      }
    }
    
    if (!params) {
      params = {
        courseId: 'fire-ice',
        characterId: 'fire-wizard',
        levelId: 1
      };
    }
    
    const foundCourse = courses.find(c => c.id === params.courseId);
    const foundCharacter = characters.find(ch => ch.id === params.characterId);
    
    if (foundCourse && foundCharacter) {
      setCourse(foundCourse);
      setCharacter(foundCharacter);
      
      const level = foundCourse.levels.find(l => l.id === params.levelId) || foundCourse.levels[0];
      setTargetScore(level.targetScore);
      setTimeLeft(level.timeLimit);
      
      setBoard(initializeBoard(foundCourse.elementTypes));
    } else {
      const defaultCourse = courses[0];
      const defaultCharacter = characters[0];
      setCourse(defaultCourse);
      setCharacter(defaultCharacter);
      setTargetScore(defaultCourse.levels[0].targetScore);
      setTimeLeft(defaultCourse.levels[0].timeLimit);
      setBoard(initializeBoard(defaultCourse.elementTypes));
    }
  }, []);

  const handleBack = () => {
    Taro.showModal({
      title: '确认退出',
      content: '退出后当前游戏进度将丢失',
      success: (res) => {
        if (res.confirm) {
          Taro.reLaunch({
            url: '/pages/index/index'
          });
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
  };

  const handleResume = () => {
    setPhase('playing');
  };

  const startGame = () => {
    setPhase('countdown');
    setCountdown(3);
  };

  useEffect(() => {
    if (phase === 'countdown') {
      if (countdown > 0) {
        const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
        return () => clearTimeout(timer);
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
    if (score >= targetScore && phase === 'playing' && score > 0) {
      endGame();
    }
  }, [score, targetScore, phase]);

  const endGame = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (course && character) {
      const result: GameResult = createGameResult(
        score,
        targetScore,
        (course.levels[0]?.timeLimit || 60) - timeLeft,
        maxCombo,
        course.id,
        character.id
      );

      Taro.redirectTo({
        url: `/pages/result/index?params=${encodeURIComponent(JSON.stringify(result))}`
      });
    }
  }, [score, targetScore, timeLeft, maxCombo, course, character]);

  const processMatches = useCallback(async (currentBoard: GameElementType[][], currentCombo: number) => {
    const matches = findMatches(currentBoard);
    
    if (matches.length === 0) {
      setCombo(0);
      isProcessingRef.current = false;
      return;
    }

    const newCombo = currentCombo + 1;
    setCombo(newCombo);
    setMaxCombo(prev => Math.max(prev, newCombo));

    const markedBoard = markMatches(currentBoard, matches);
    setBoard(markedBoard);

    await new Promise(resolve => setTimeout(resolve, 300));

    if (!course) {
      isProcessingRef.current = false;
      return;
    }

    const matchedTypes = [...new Set(matches.map(({ row, col }) => markedBoard[row][col].type))];
    let totalScore = 0;
    
    matchedTypes.forEach(type => {
      const typeMatches = matches.filter(({ row, col }) => markedBoard[row][col].type === type);
      totalScore += calculateScore(
        typeMatches.length,
        newCombo,
        character?.specialty || null,
        type,
        character?.bonus || 0
      );
    });

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
      const allowedTypes = [course.elementType1, course.elementType2];
      
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
          style={{ width: `${(timeLeft / (course.levels[0]?.timeLimit || 60)) * 100}%` }}
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
              课程: {course.name}\n目标得分: {targetScore}\n时间: {course.levels[0]?.timeLimit || 60}秒
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
