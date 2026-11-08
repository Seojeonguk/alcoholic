import { TextInput } from 'react-native';

import { POST_LIMITS } from '../constants';
import { makeStyles, useColors } from '../lib';
import { updateTitle } from '../redux';
import { usePostForm } from './PostForm';

export default function Title() {
  const colors = useColors();
  const styles = useStyles();
  const {
    form: { title },
    dispatch,
  } = usePostForm();

  const handleChangeTitle = (newTitle) => {
    dispatch(updateTitle(newTitle));
  };

  return (
    <TextInput
      maxLength={POST_LIMITS.TITLE}
      multiline
      onChangeText={handleChangeTitle}
      placeholder="제목"
      placeholderTextColor={colors.TEXT_SUB}
      style={styles.input}
      value={title}
    />
  );
}

const useStyles = makeStyles((colors) => ({
  input: {
    color: colors.TEXT,
    fontSize: 22,
    fontWeight: '700',
    paddingVertical: 12,
  },
}));
