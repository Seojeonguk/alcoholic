import { useState } from 'react';
import { Animated, Pressable } from 'react-native';

const PRESSED_SCALE = 0.97;

// 누르면 살짝 작아졌다 돌아와서 바로 반응하는 느낌을 줌
export default function PressableScale({ onPress, disabled, style, children, ...props }) {
  const [scale] = useState(() => new Animated.Value(1));

  const animateTo = (toValue) => {
    Animated.spring(scale, {
      toValue,
      speed: 50,
      bounciness: 0,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      onPressIn={() => animateTo(PRESSED_SCALE)}
      onPressOut={() => animateTo(1)}
      {...props}
    >
      <Animated.View style={[style, { transform: [{ scale }] }]}>{children}</Animated.View>
    </Pressable>
  );
}
