import { StyleSheet, View } from 'react-native';

import { COLORS } from '../constants';

// 사진 위에 놓이는 흰 점. 지금 보는 사진은 길쭉한 점으로 보여 줌
export default function Indicator({ length, index }) {
  return (
    <View style={styles.wrapper}>
      {Array.from({ length }, (_, i) => (
        <View key={i} style={[styles.dot, i === index && styles.active]} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  active: {
    backgroundColor: COLORS.ON_PHOTO,
    width: 16,
  },
  dot: {
    backgroundColor: COLORS.ON_PHOTO_DIM,
    borderRadius: 3,
    height: 6,
    width: 6,
  },
  wrapper: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
  },
});
