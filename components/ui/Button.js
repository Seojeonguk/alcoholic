import { StyleSheet, Text } from 'react-native';

import { useColors } from '../../lib';
import PressableScale from './PressableScale';

const VARIANTS = {
  primary: (colors) => ({ backgroundColor: colors.ACCENT, color: colors.ON_ACCENT }),
  soft: (colors) => ({ backgroundColor: colors.ACCENT_SOFT, color: colors.ACCENT }),
  danger: (colors) => ({ backgroundColor: colors.DANGER, color: colors.ON_ACCENT }),
  text: (colors) => ({ backgroundColor: 'transparent', color: colors.TEXT_SUB }),
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
  accessibilityLabel,
}) {
  const { backgroundColor, color } = VARIANTS[variant](useColors());
  const isDisabled = disabled || loading;

  return (
    <PressableScale
      accessibilityLabel={accessibilityLabel}
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
        {loading ? (loadingTitle ?? title) : title}
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
