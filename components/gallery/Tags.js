import { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { addTag, deleteTag } from '../redux/slices/GallerySlice';

import { useDispatch, useSelector } from 'react-redux';

export default function Tags() {
  const dispatch = useDispatch();
  const [newTag, setNewTag] = useState('');
  const tags = useSelector((state) => state.gallery.tags);

  const handleChangedTag = (tag) => {
    setNewTag(tag);
  };

  const handleDeleteTag = (idx) => {
    dispatch(deleteTag(idx));
  };

  const handleSubmit = () => {
    dispatch(addTag(newTag));
    initNewTag();
  };

  const initNewTag = () => {
    setNewTag('');
  };

  return (
    <View style={styles.tagBox}>
      {tags.map((tag, idx) => (
        <TouchableOpacity key={idx} onPress={() => handleDeleteTag(idx)} style={styles.tags}>
          <Text>#{tag}</Text>
        </TouchableOpacity>
      ))}

      <TextInput
        blurOnSubmit={false}
        onChangeText={(tag) => handleChangedTag(tag)}
        onSubmitEditing={handleSubmit}
        placeholder="ํ๊ทธ ์๋ ฅ"
        style={styles.inputTag}
        value={newTag}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  inputTag: {
    margin: 5,
  },
  tagBox: {
    borderBottomWidth: 1,
    borderColor: 'grey',
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: 20,
    marginVertical: 5,
  },
  tags: {
    alignItems: 'center',
    backgroundColor: '#c9d1d9',
    borderRadius: 5,
    flexDirection: 'row',
    justifyContent: 'center',
    margin: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
});
