import React from 'react';
import { View } from '@tarojs/components';
import styles from './index.module.scss';
import GameElement from '../GameElement';
import { GameElement as GameElementType } from '@/types/game';

interface GameBoardProps {
  board: GameElementType[][];
  onElementClick: (row: number, col: number) => void;
}

export default function GameBoard(props: GameBoardProps) {
  const { board, onElementClick } = props;

  return (
    <View className={styles.board}>
      {board.map((row, rowIndex) => (
        <View key={rowIndex} className={styles.row}>
          {row.map((element, colIndex) => (
            <GameElement
              key={element.id}
              element={element}
              onClick={() => onElementClick(rowIndex, colIndex)}
            />
          ))}
        </View>
      ))}
    </View>
  );
}
