import { View } from 'react-native';

import { MAX_RATING } from '../constants';
import { makeStyles, useColors } from '../lib';
import { updateRating } from '../redux';
import { usePostForm } from './PostForm';
import { ListRow, PressableScale } from './ui';

import { Ionicons } from '@expo/vector-icons';

const STARS = Array.from({ length: MAX_RATING }, (_, i) => i + 1);

// 글 쓰기의 별점(#341). 별을 누르면 그 점수가 되고, 지금 점수의 별을 다시 누르면 지움
export default function Rating() {
  const colors = useColors();
  const styles = useStyles();
  const {
    form: { rating },
    dispatch,
  } = usePostForm();

  const select = (star) => {
    dispatch(updateRating(star === rating ? null : star));
  };

  return (
    <ListRow title="별점">
      <View accessibilityLabel="별점" accessibilityRole="radiogroup" style={styles.stars}>
        {STARS.map((star) => {
          const filled = rating != null && star <= rating;
          const selected = star === rating;
          return (
            <PressableScale
              accessibilityHint={selected ? '다시 누르면 별점을 지워요' : undefined}
              accessibilityLabel={`별점 ${star}점`}
              accessibilityRole="radio"
              accessibilityState={{ checked: selected }}
              hitSlop={4}
              key={star}
              onPress={() => select(star)}
            >
              <Ionicons
                color={filled ? colors.ACCENT : colors.TEXT_SUB}
                name={filled ? 'star' : 'star-outline'}
                size={26}
              />
            </PressableScale>
          );
        })}
      </View>
    </ListRow>
  );
}

const useStyles = makeStyles(() => ({
  stars: {
    flexDirection: 'row',
    gap: 6,
  },
}));
