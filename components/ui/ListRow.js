import { StyleSheet, Text, View } from 'react-native';

import { COLORS } from '../../constants';
import PressableScale from './PressableScale';

// 왼쪽 제목, 오른쪽 값. 누를 수 있으면 오른쪽에 ›
export default function ListRow({ title, value, onPress, showChevron = !!onPress, children }) {
  const content = (
    <View style={styles.row}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.right}>
        {children}
        {value ? (
          <Text numberOfLines={1} style={styles.value}>
            {value}
          </Text>
        ) : null}
        {showChevron ? <Text style={styles.chevron}>›</Text> : null}
      </View>
    </View>
  );

  if (!onPress) {
    return content;
  }
  return <PressableScale onPress={onPress}>{content}</PressableScale>;
}

const styles = StyleSheet.create({
  chevron: {
    color: COLORS.TEXT_SUB,
    fontSize: 20,
    marginLeft: 6,
  },
  // 남은 너비를 다 써서 장소 입력 칸처럼 넓은 내용도 들어가게 함
  right: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginLeft: 16,
  },
  row: {
    alignItems: 'center',
    borderBottomColor: COLORS.LINE,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 52,
    paddingVertical: 12,
  },
  title: {
    color: COLORS.TEXT,
    fontSize: 15,
  },
  value: {
    color: COLORS.TEXT_SUB,
    flexShrink: 1,
    fontSize: 15,
  },
});
