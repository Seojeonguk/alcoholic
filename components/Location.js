import { useRef } from 'react';
import { StyleSheet, TextInput } from 'react-native';

import { COLORS, POST_LIMITS } from '../constants';
import { updateLocation } from '../redux';
import { usePostForm } from './PostForm';
import { ListRow } from './ui';

// 줄 어디를 눌러도 오른쪽 입력 칸에 바로 쓸 수 있음
export default function Location() {
  const {
    form: { location },
    dispatch,
  } = usePostForm();
  const inputRef = useRef(null);

  const handleChangeLocation = (newLocation) => {
    dispatch(updateLocation(newLocation));
  };

  return (
    <ListRow onPress={() => inputRef.current?.focus()} showChevron={false} title="장소">
      <TextInput
        maxLength={POST_LIMITS.LOCATION}
        onChangeText={handleChangeLocation}
        placeholder="어디서 마셨나요?"
        placeholderTextColor={COLORS.TEXT_SUB}
        ref={inputRef}
        style={styles.input}
        value={location}
      />
    </ListRow>
  );
}

const styles = StyleSheet.create({
  input: {
    color: COLORS.TEXT,
    flex: 1,
    fontSize: 15,
    padding: 0,
    textAlign: 'right',
  },
});
