import { useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

import { COLORS } from '../constants';

import { Ionicons } from '@expo/vector-icons';

// 비밀번호는 기본으로 가리고, 오른쪽 눈 아이콘을 눌러야 보였다 가려짐
export default function PasswordInput({ ref, ...props }) {
  const [isHidden, setIsHidden] = useState(true);

  return (
    <View style={styles.inputWrap}>
      <TextInput ref={ref} secureTextEntry={isHidden} style={styles.input} {...props} />
      <TouchableOpacity
        accessibilityLabel={isHidden ? '비밀번호 보기' : '비밀번호 숨기기'}
        hitSlop={8}
        onPress={() => setIsHidden(!isHidden)}
      >
        <Ionicons
          color={COLORS.LABEL_COLOR}
          name={isHidden ? 'eye-outline' : 'eye-off-outline'}
          size={20}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    color: 'black',
    flex: 1,
    fontSize: 15,
  },
  inputWrap: {
    alignItems: 'center',
    borderBottomColor: COLORS.BORDER_COLOR,
    borderBottomWidth: 1,
    flexDirection: 'row',
  },
});
