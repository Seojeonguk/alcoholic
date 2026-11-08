import { Text, View } from 'react-native';

import { makeStyles, useColors } from '../lib';
import { BottomSheet, PressableScale } from './ui';

import { Ionicons } from '@expo/vector-icons';

// 갤러리 필터의 주종 고르기 시트(#341). 내가 쓴 주종만 목록 순서로 기록 수와 함께 보여 줌
// drinkTypeCounts: [{ code, label, count }](lib의 countDrinkTypes), selected: 지금 고른 코드(없으면 null)
export default function DrinkTypeSheet({ visible, drinkTypeCounts, selected, onSelect, onClose }) {
  const colors = useColors();
  const styles = useStyles();

  return (
    <BottomSheet onClose={onClose} title="주종으로 찾기" visible={visible}>
      <View style={styles.list}>
        {drinkTypeCounts.map(({ code, label, count }) => {
          const isSelected = code === selected;
          return (
            <PressableScale
              accessibilityLabel={`${label}, 기록 ${count}개`}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
              key={code}
              onPress={() => onSelect(code)}
              style={styles.row}
            >
              <Text style={[styles.label, isSelected && styles.selectedLabel]}>{label}</Text>
              <Text style={styles.count}>{count}</Text>
              {isSelected ? <Ionicons color={colors.ACCENT} name="checkmark" size={18} /> : null}
            </PressableScale>
          );
        })}
      </View>
    </BottomSheet>
  );
}

const useStyles = makeStyles((colors) => ({
  count: {
    color: colors.TEXT_SUB,
    fontSize: 14,
  },
  label: {
    color: colors.TEXT,
    flex: 1,
    fontSize: 15,
  },
  list: {
    marginTop: 8,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 14,
  },
  selectedLabel: {
    color: colors.ACCENT,
    fontWeight: '700',
  },
}));
