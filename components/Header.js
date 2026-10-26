import { StyleSheet, Text, View } from 'react-native';

import { COLORS } from '../constants';
import { PressableScale } from './ui';

import { Ionicons } from '@expo/vector-icons';

const LEFT_ICONS = {
  back: 'chevron-back',
  close: 'close',
};
const ICON_SIZE = 26;

// left: 'back' | 'close' | null, right: Ionicons 이름 | null, light: 사진 위에 놓일 때 흰 아이콘
// visibleLeftIcon 등 예전 props는 아직 바꾸지 않은 화면을 위해 남겨 둠(디자인 개편이 끝나면 지움)
export default function Header({
  left,
  right,
  light = false,
  title,
  onPressLeft,
  onPressRight,
  visibleLeftIcon,
  visibleRightIcon,
  leftIconName,
  rightIconName,
}) {
  const leftIcon = left !== undefined ? LEFT_ICONS[left] : visibleLeftIcon ? leftIconName : null;
  const rightIcon = right !== undefined ? right : visibleRightIcon ? rightIconName : null;
  const color = light ? '#FFFFFF' : COLORS.TEXT;

  const renderIcon = (name, onPress) =>
    name ? (
      <PressableScale hitSlop={8} onPress={onPress} style={styles.btn}>
        <Ionicons color={color} name={name} size={ICON_SIZE} />
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
      {renderIcon(rightIcon, onPressRight)}
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
  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
});
