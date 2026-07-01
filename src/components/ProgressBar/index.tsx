import React from 'react';
import { View, Text } from '@tarojs/components';
import styles from './index.module.scss';

interface ProgressBarProps {
  current: number;
  total: number;
  showLabel?: boolean;
  color?: 'normal' | 'warning' | 'danger';
  height?: number;
}

export default function ProgressBar(props: ProgressBarProps) {
  const { current, total, showLabel = true, color = 'normal', height = 24 } = props;
  const percentage = Math.min((current / total) * 100, 100);

  const colorClass = {
    normal: styles.normal,
    warning: styles.warning,
    danger: styles.danger
  }[color];

  return (
    <View className={styles.container}>
      <View className={styles.track} style={{ height: `${height}rpx` }}>
        <View
          className={`${styles.fill} ${colorClass}`}
          style={{
            width: `${percentage}%`,
            height: '100%'
          }}
        />
      </View>
      {showLabel && (
        <Text className={styles.label}>
          {Math.floor(current)} / {total}
        </Text>
      )}
    </View>
  );
}
