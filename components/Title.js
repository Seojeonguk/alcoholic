import { StyleSheet, TextInput } from 'react-native';

import { COLORS } from '../constants';
import { updateTitle } from '../redux';

import { useDispatch, useSelector } from 'react-redux';

export default function Title() {
  const dispatch = useDispatch();
  const title = useSelector((state) => state.gallery.title);

  const handleChangeTitle = (newTitle) => {
    dispatch(updateTitle(newTitle));
  };

  return (
    <TextInput
      maxLength={40}
      multiline
      onChangeText={handleChangeTitle}
      placeholder="제목"
      placeholderTextColor={COLORS.TEXT_SUB}
      style={styles.input}
      value={title}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    color: COLORS.TEXT,
    fontSize: 22,
    fontWeight: '700',
    paddingVertical: 12,
  },
});
