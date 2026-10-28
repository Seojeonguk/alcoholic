import { StyleSheet, TextInput } from 'react-native';

import { COLORS } from '../constants';
import { updateContent } from '../redux';

import { useDispatch, useSelector } from 'react-redux';

export default function Content() {
  const content = useSelector((state) => state.gallery.content);
  const dispatch = useDispatch();

  const handleChangeContent = (newContent) => {
    dispatch(updateContent(newContent));
  };

  return (
    <TextInput
      multiline
      onChangeText={handleChangeContent}
      placeholder={'오늘 마신 술은 어땠나요?\n맛, 함께한 사람, 느낀 점을 남겨 보세요.'}
      placeholderTextColor={COLORS.TEXT_SUB}
      style={styles.input}
      value={content}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    backgroundColor: COLORS.FILL,
    borderRadius: 12,
    color: COLORS.TEXT,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 24,
    marginTop: 16,
    minHeight: 160,
    padding: 14,
    textAlignVertical: 'top',
  },
});
