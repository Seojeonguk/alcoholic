import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { COLORS } from '../constants';
import { addTag, deleteTag } from '../redux';
import { PressableScale } from './ui';

import { useDispatch, useSelector } from 'react-redux';

// 태그는 칩으로 보여 주고, 칩을 누르면 지움. "+ 추가"를 누르면 입력 칸이 열림
export default function Tags() {
  const dispatch = useDispatch();
  const [newTag, setNewTag] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const tags = useSelector((state) => state.gallery.tags);

  // 공백 · # 정리와 중복 확인은 addTag에서 함
  const handleSubmit = () => {
    if (newTag.trim() !== '') {
      dispatch(addTag(newTag));
    }
    setNewTag('');
  };

  const handleBlur = () => {
    handleSubmit();
    setIsEditing(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>태그</Text>
      <View style={styles.chips}>
        {tags.map((tag, idx) => (
          <PressableScale
            accessibilityLabel={`${tag} 태그 지우기`}
            key={`${tag}_${idx}`}
            onPress={() => dispatch(deleteTag(idx))}
            style={styles.chip}
          >
            <Text style={styles.chipText}>#{tag}</Text>
          </PressableScale>
        ))}

        {isEditing ? (
          <TextInput
            autoFocus
            onBlur={handleBlur}
            onChangeText={setNewTag}
            onSubmitEditing={handleSubmit}
            placeholder="태그 입력"
            placeholderTextColor={COLORS.TEXT_SUB}
            style={[styles.chip, styles.input]}
            // 엔터로 태그를 넣은 뒤에도 키보드를 닫지 않고 이어서 입력함
            submitBehavior="submit"
            value={newTag}
          />
        ) : (
          <PressableScale onPress={() => setIsEditing(true)} style={styles.addChip}>
            <Text style={styles.addText}>+ 추가</Text>
          </PressableScale>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  addChip: {
    borderColor: COLORS.LINE,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  addText: {
    color: COLORS.TEXT_SUB,
    fontSize: 14,
  },
  chip: {
    backgroundColor: COLORS.FILL,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  chipText: {
    color: COLORS.TEXT,
    fontSize: 14,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },
  container: {
    borderBottomColor: COLORS.LINE,
    borderBottomWidth: 1,
    paddingVertical: 14,
  },
  input: {
    color: COLORS.TEXT,
    fontSize: 14,
    minWidth: 96,
  },
  title: {
    color: COLORS.TEXT,
    fontSize: 15,
  },
});
