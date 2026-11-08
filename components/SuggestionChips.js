import { StyleSheet, Text, View } from 'react-native';

import { COLORS } from '../constants';
import { PressableScale } from './ui';

// 전에 쓴 태그 · 장소를 칩으로 보여 주고, 누르면 onSelect로 넘김(#336)
// prefix: 칩 앞에 붙일 글자(태그는 '#'), label: TalkBack이 읽을 이름 앞부분
export default function SuggestionChips({ values, onSelect, prefix = '', label }) {
  if (values.length === 0) {
    return null;
  }
  return (
    <View style={styles.chips}>
      {values.map((value) => (
        <PressableScale
          accessibilityLabel={`${label} ${value} 넣기`}
          accessibilityRole="button"
          key={value}
          onPress={() => onSelect(value)}
          style={styles.chip}
        >
          <Text style={styles.chipText}>
            {prefix}
            {value}
          </Text>
        </PressableScale>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    borderColor: COLORS.ACCENT_SOFT,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  chipText: {
    color: COLORS.ACCENT,
    fontSize: 14,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
});
