import { useState } from 'react';
import { StyleSheet, Text } from 'react-native';

import { COLORS } from '../constants';
import { BottomSheet, Button, TextField } from './ui';

// 갤러리 필터의 검색 시트(#333). 태그 시트(#331)와 같은 자리 · 흐름으로, 칩을 누르면 올라옴
// 입력하는 동안 맞는 기록 수를 보여 주고, 찾기를 누르면 검색어를 걸고 닫힘
// initialQuery: 지금 걸린 검색어, countResults(query): 그 검색어로 남는 기록 수, onSubmit(query)
export default function SearchSheet({ visible, initialQuery, countResults, onSubmit, onClose }) {
  const [query, setQuery] = useState(initialQuery ?? '');
  const keyword = query.trim();

  // 열 때마다 지금 걸린 검색어로 시작함(렌더링 중에 바꿔서 effect 없이 맞춤)
  const [wasVisible, setWasVisible] = useState(visible);
  if (visible !== wasVisible) {
    setWasVisible(visible);
    if (visible) {
      setQuery(initialQuery ?? '');
    }
  }

  const submit = () => {
    onSubmit(keyword);
  };

  return (
    <BottomSheet onClose={onClose} title="기록 찾기" visible={visible}>
      <TextField
        accessibilityLabel="검색어"
        autoCorrect={false}
        autoFocus
        onChangeText={setQuery}
        onSubmitEditing={submit}
        placeholder="제목 · 장소 · 내용 · 태그로 찾기"
        returnKeyType="search"
        value={query}
      />
      <Text accessibilityLiveRegion="polite" style={styles.hint}>
        {keyword ? `맞는 기록 ${countResults(keyword)}개` : '술 이름이나 장소를 넣어 보세요.'}
      </Text>
      <Button onPress={submit} style={styles.button} title={keyword ? '찾기' : '검색어 지우기'} />
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  button: {
    marginTop: 16,
  },
  hint: {
    color: COLORS.TEXT_SUB,
    fontSize: 13,
    marginTop: 8,
  },
});
