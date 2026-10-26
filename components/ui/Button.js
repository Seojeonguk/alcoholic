import { StyleSheet, Text } from 'react-native';

import { COLORS } from '../../constants';
import PressableScale from './PressableScale';

const VARIANTS = {
  primary: { backgroundColor: COLORS.ACCENT, color: '#FFFFFF' },
  soft: { backgroundColor: COLORS.ACCENT_SOFT, color: COLORS.ACCENT },
  danger: { backgroundColor: COLORS.DANGER, color: '#FFFFFF' },
  text: { backgroundColor: 'transparent', color: COLORS.TEXT_SUB },
};

// 기다리는 동안에는 화면을 덮는 스피너 대신 버튼 글씨로 진행 상황을 보여 주고 누를 수 없게 함
export default function Button({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  loadingTitle,
  disabled = false,
  style,
}) {
  const { backgroundColor, color } = VARIANTS[variant];
  const isDisabled = disabled || loading;

  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityState={{ busy: loading, disabled: isDisabled }}
      disabled={isDisabled}
      onPress={onPress}
      style={[
        styles.button,
        variant === 'text' && styles.textButton,
        { backgroundColor },
        isDisabled && styles.disabled,
        style,
      ]}
    >
      <Text style={[styles.title, variant === 'text' && styles.textTitle, { color }]}>
        {loading ? loadingTitle ?? title : title}
      </Text>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    borderRadius: 14,
    justifyContent: 'center',
    paddingVertical: 16,
  },
  disabled: {
    opacity: 0.6,
  },
  textButton: {
    paddingVertical: 12,
  },
  textTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
  },
});
