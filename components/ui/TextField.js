import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { COLORS } from '../../constants';

// 옅은 회색 면의 입력 칸. 입력 중이면 강조색 테두리, 에러는 칸 아래에 빨간 글씨
export default function TextField({ label, error, ref, right, onFocus, onBlur, style, ...props }) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={styles.container}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={[styles.field, isFocused && styles.focused]}>
        <TextInput
          onBlur={(e) => {
            setIsFocused(false);
            onBlur?.(e);
          }}
          onFocus={(e) => {
            setIsFocused(true);
            onFocus?.(e);
          }}
          placeholderTextColor={COLORS.TEXT_SUB}
          ref={ref}
          style={[styles.input, style]}
          {...props}
        />
        {right}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 12,
  },
  error: {
    color: COLORS.DANGER,
    fontSize: 13,
    marginTop: 6,
  },
  field: {
    alignItems: 'center',
    backgroundColor: COLORS.FILL,
    borderColor: COLORS.FILL,
    borderRadius: 12,
    borderWidth: 2,
    flexDirection: 'row',
    paddingHorizontal: 14,
  },
  focused: {
    backgroundColor: COLORS.BACKGROUND,
    borderColor: COLORS.ACCENT,
  },
  input: {
    color: COLORS.TEXT,
    flex: 1,
    fontSize: 15,
    paddingVertical: 13,
  },
  label: {
    color: COLORS.TEXT_SUB,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
});
