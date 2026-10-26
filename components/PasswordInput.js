import { useState } from 'react';
import { Pressable } from 'react-native';

import { COLORS } from '../constants';
import { TextField } from './ui';

import { Ionicons } from '@expo/vector-icons';

// 비밀번호는 기본으로 가리고, 오른쪽 눈 아이콘을 눌러야 보였다 가려짐
export default function PasswordInput(props) {
  const [isHidden, setIsHidden] = useState(true);

  return (
    <TextField
      right={
        <Pressable
          accessibilityLabel={isHidden ? '비밀번호 보기' : '비밀번호 숨기기'}
          hitSlop={8}
          onPress={() => setIsHidden(!isHidden)}
        >
          <Ionicons
            color={COLORS.TEXT_SUB}
            name={isHidden ? 'eye-outline' : 'eye-off-outline'}
            size={20}
          />
        </Pressable>
      }
      secureTextEntry={isHidden}
      {...props}
    />
  );
}
