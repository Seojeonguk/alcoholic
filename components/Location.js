import { useMemo, useRef, useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { COLORS, POST_LIMITS } from '../constants';
import { suggestValues } from '../lib';
import { updateLocation } from '../redux';
import { usePostForm } from './PostForm';
import SuggestionChips from './SuggestionChips';
import { ListRow } from './ui';

import { useSelector } from 'react-redux';

// 줄 어디를 눌러도 오른쪽 입력 칸에 바로 쓸 수 있음
export default function Location() {
  const {
    form: { location },
    dispatch,
  } = usePostForm();
  const inputRef = useRef(null);
  // 입력하는 동안 전에 쓴 장소를 추천함. 입력한 글자로 좁힘(#336)
  const [isFocused, setIsFocused] = useState(false);
  const usedLocations = useSelector((state) => state.suggestion.locations);
  const suggestions = useMemo(
    () => suggestValues(usedLocations, location),
    [usedLocations, location]
  );

  const handleChangeLocation = (newLocation) => {
    dispatch(updateLocation(newLocation));
  };

  // 추천 칩을 누르면 장소를 넣고 입력을 마침
  const handleSelect = (newLocation) => {
    dispatch(updateLocation(newLocation));
    inputRef.current?.blur();
  };

  return (
    <View>
      <ListRow onPress={() => inputRef.current?.focus()} showChevron={false} title="장소">
        <TextInput
          maxLength={POST_LIMITS.LOCATION}
          onBlur={() => setIsFocused(false)}
          onChangeText={handleChangeLocation}
          onFocus={() => setIsFocused(true)}
          placeholder="어디서 마셨나요?"
          placeholderTextColor={COLORS.TEXT_SUB}
          ref={inputRef}
          style={styles.input}
          value={location}
        />
      </ListRow>
      {isFocused ? (
        <View style={styles.suggestions}>
          <SuggestionChips label="장소" onSelect={handleSelect} values={suggestions} />
        </View>
      ) : null}
    </View>
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
  suggestions: {
    borderBottomColor: COLORS.LINE,
    borderBottomWidth: 1,
    paddingVertical: 12,
  },
});
