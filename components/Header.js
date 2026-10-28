import { StyleSheet, Text, View } from 'react-native';

import { COLORS } from '../constants';
import { PressableScale } from './ui';

import { Ionicons } from '@expo/vector-icons';

const LEFT_ICONS = {
  back: 'chevron-back',
  close: 'close',
};
const ICON_SIZE = 26;

// left: 'back' | 'close' | null, right: Ionicons 이름 | null
// light: 사진 위에 놓일 때 흰 아이콘. 밝은 사진에서도 보이게 반투명한 원을 깔아 줌
export default function Header({ left, right, light = false, title, onPressLeft, onPressRight }) {
  const leftIcon = LEFT_ICONS[left];
  const color = light ? '#FFFFFF' : COLORS.TEXT;

  const renderIcon = (name, onPress) =>
    name ? (
      <PressableScale hitSlop={8} onPress={onPress} style={styles.btn}>
        <View style={light && styles.lightIcon}>
          <Ionicons color={color} name={name} size={light ? 22 : ICON_SIZE} />
        </View>
      </PressableScale>
    ) : (
      <View style={styles.btn} />
    );

  return (
    <View style={styles.header}>
      {renderIcon(leftIcon, onPressLeft)}
      <Text numberOfLines={1} style={[styles.title, { color }]}>
        {title}
      </Text>
      {renderIcon(right, onPressRight)}
    </View>
  );
}

const styles = StyleSheet.create({
  btn: {
    alignItems: 'center',
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    height: 52,
    paddingHorizontal: 8,
  },
  lightIcon: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 18,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
});
