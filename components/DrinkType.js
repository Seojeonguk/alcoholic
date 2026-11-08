import { Text, View } from 'react-native';

import { DRINK_TYPES } from '../constants';
import { makeStyles } from '../lib';
import { updateDrinkType } from '../redux';
import { usePostForm } from './PostForm';
import { PressableScale } from './ui';

// 글 쓰기의 주종(#341). 하나만 고르고, 고른 칩을 다시 누르면 지움
export default function DrinkType() {
  const styles = useStyles();
  const {
    form: { drinkType },
    dispatch,
  } = usePostForm();

  const select = (code) => {
    dispatch(updateDrinkType(code === drinkType ? null : code));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>주종</Text>
      <View accessibilityLabel="주종" accessibilityRole="radiogroup" style={styles.chips}>
        {DRINK_TYPES.map(({ code, label }) => {
          const selected = code === drinkType;
          return (
            <PressableScale
              accessibilityHint={selected ? '다시 누르면 주종을 지워요' : undefined}
              accessibilityLabel={`주종 ${label}`}
              accessibilityRole="radio"
              accessibilityState={{ checked: selected }}
              key={code}
              onPress={() => select(code)}
              style={[styles.chip, selected && styles.selectedChip]}
            >
              <Text style={[styles.chipText, selected && styles.selectedText]}>{label}</Text>
            </PressableScale>
          );
        })}
      </View>
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  chip: {
    backgroundColor: colors.FILL,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  chipText: {
    color: colors.TEXT,
    fontSize: 14,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },
  container: {
    borderBottomColor: colors.LINE,
    borderBottomWidth: 1,
    paddingVertical: 14,
  },
  selectedChip: {
    backgroundColor: colors.ACCENT,
  },
  selectedText: {
    color: colors.ON_ACCENT,
  },
  title: {
    color: colors.TEXT,
    fontSize: 15,
  },
}));
