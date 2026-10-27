import { useRef } from 'react';
import { StyleSheet, TextInput } from 'react-native';

import { COLORS } from '../constants';
import { updateLocation } from '../redux';
import { ListRow } from './ui';

import { useDispatch, useSelector } from 'react-redux';

// 줄 어디를 눌러도 오른쪽 입력 칸에 바로 쓸 수 있음
export default function Location() {
  const dispatch = useDispatch();
  const location = useSelector((state) => state.gallery.location);
  const inputRef = useRef(null);

  const handleChangeLocation = (newLocation) => {
    dispatch(updateLocation(newLocation));
  };

  return (
    <ListRow onPress={() => inputRef.current?.focus()} showChevron={false} title="장소">
      <TextInput
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
