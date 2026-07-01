import React from 'react';
import { View, Text } from '@tarojs/components';
import styles from './index.module.scss';
import { GameElement as GameElementType } from '@/types/game';
import { elementEmojis, elementColors } from '@/data/gameData';

interface GameElementProps {
  element: GameElementType;
  onClick: () => void;
}

export default function GameElement(props: GameElementProps) {
  const { element, onClick } = props;

  const emoji = elementEmojis[element.type];
  const color = elementColors[element.type];

  return (
    <View
      className={`${styles.element} ${element.isSelected ? styles.selected : ''} ${element.isMatched ? styles.matched : ''} ${element.isNew ? styles.newElement : ''}`}
      onClick={onClick}
      style={{ '--element-color': color } as React.CSSProperties}
    >
      <Text className={styles.emoji}>{emoji}</Text>
    </View>
  );
}
