import { useEffect, useRef } from 'react';
import { Animated } from 'react-native';

import { COLORS } from '../../constants';

// 처음 불러오는 동안 내용이 놓일 자리를 회색 상자로 보여 줌
export default function Skeleton({ width, height, radius = 12, style }) {
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.5, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        { backgroundColor: COLORS.FILL, borderRadius: radius, height, opacity, width },
        style,
      ]}
    />
  );
}
