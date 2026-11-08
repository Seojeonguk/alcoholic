import { useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text } from 'react-native';

import { COLORS } from '../constants';
import { searchTags } from '../lib';
import { BottomSheet, PressableScale, TextField } from './ui';

import { Ionicons } from '@expo/vector-icons';

// 갤러리 필터의 태그 고르기 시트(#331). 많이 쓴 순서로 개수와 함께 보여 주고 이름으로 찾음
// tagCounts: [{ tag, count }], selected: 지금 고른 태그(없으면 null), onSelect(tag): 고르면 부름
export default function TagSheet({ visible, tagCounts, selected, onSelect, onClose }) {
  const [query, setQuery] = useState('');
  const results = useMemo(() => searchTags(tagCounts, query), [tagCounts, query]);

  // 다시 열면 빈 검색어로 시작함
  const close = () => {
    setQuery('');
    onClose();
  };

  const select = (tag) => {
    setQuery('');
    onSelect(tag);
  };

  const renderTag = ({ item: { tag, count } }) => {
    const isSelected = tag === selected;
    return (
      <PressableScale
        accessibilityLabel={`${tag}, 기록 ${count}개`}
        accessibilityRole="button"
        accessibilityState={{ selected: isSelected }}
        onPress={() => select(tag)}
        style={styles.row}
      >
        <Text numberOfLines={1} style={[styles.tag, isSelected && styles.selectedTag]}>
          #{tag}
        </Text>
        <Text style={styles.count}>{count}</Text>
        {isSelected ? <Ionicons color={COLORS.ACCENT} name="checkmark" size={18} /> : null}
      </PressableScale>
    );
  };

  return (
    <BottomSheet onClose={close} title="태그로 찾기" visible={visible}>
      <TextField
        accessibilityLabel="태그 검색"
        autoCapitalize="none"
        autoCorrect={false}
        onChangeText={setQuery}
        placeholder="태그 이름으로 찾기"
        returnKeyType="search"
        value={query}
      />
      <FlatList
        data={results}
        keyboardShouldPersistTaps="handled"
        keyExtractor={(item) => item.tag}
        ListEmptyComponent={
          <Text style={styles.empty}>{`'${query.trim()}'이(가) 들어간 태그가 없어요.`}</Text>
        }
        renderItem={renderTag}
        style={styles.list}
      />
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  count: {
    color: COLORS.TEXT_SUB,
    fontSize: 14,
  },
  empty: {
    color: COLORS.TEXT_SUB,
    fontSize: 14,
    paddingVertical: 24,
    textAlign: 'center',
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
  selectedTag: {
    color: COLORS.ACCENT,
    fontWeight: '700',
  },
  tag: {
    color: COLORS.TEXT,
    flex: 1,
    fontSize: 15,
  },
});
