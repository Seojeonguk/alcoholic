import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert } from 'react-native';

import { NAVIGATOR } from '../constants';
import {
  getRecognitionErrorText,
  getRecognitionPatch,
  getRecognitionToast,
  makeStyles,
  showToast,
  useColors,
} from '../lib';
import { addTag, updateDrinkType, updateTitle } from '../redux';
import { isMember, recognizeDrink, RecognitionError } from '../services';
import { usePostForm } from './PostForm';
import { ListRow } from './ui';

import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

// 첫 번째 사진으로 무슨 술인지 알아보고 제목 · 주종 · 태그를 채워 줌(#381)
// 버튼을 누를 때만 사진을 보냄. 이미 쓴 제목 · 주종은 바꾸지 않고, 태그는 더하기만 함
// 비회원은 사진을 보내지 않고 로그인을 안내함
export default function RecognizeDrink() {
  const colors = useColors();
  const styles = useStyles();
  const navigation = useNavigation();
  const { form, dispatch } = usePostForm();
  const [isLoading, setIsLoading] = useState(false);
  // 알아보는 동안 화면을 떠나면 폼을 고치지 않음
  // 개발 모드(StrictMode)에서는 effect가 두 번 돌아서 다시 붙을 때 true로 되돌림
  const isMountedRef = useRef(true);
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);
  // 기다리는 동안 사용자가 쓴 제목 · 주종도 지키도록 답이 왔을 때의 폼 값을 ref로 읽음
  const formRef = useRef(form);
  useEffect(() => {
    formRef.current = form;
  }, [form]);

  if (form.photos.length === 0) {
    return null;
  }

  const askLogin = () => {
    Alert.alert('로그인이 필요해요', '로그인하면 사진으로 무슨 술인지 알아볼 수 있어요.', [
      { text: '취소', style: 'cancel' },
      {
        text: '로그인하기',
        // 새 글은 초안으로 남아서 돌아오면 이어서 쓸 수 있음
        onPress: () => navigation.navigate(NAVIGATOR.MAIN_PAGE, { fromGuest: true }),
      },
    ]);
  };

  const recognize = async () => {
    if (isLoading) {
      return;
    }
    if (!isMember()) {
      askLogin();
      return;
    }
    setIsLoading(true);
    try {
      const result = await recognizeDrink(form.photos[0]);
      if (!isMountedRef.current) {
        return;
      }
      const patch = getRecognitionPatch(formRef.current, result);
      if (patch?.title !== undefined) {
        dispatch(updateTitle(patch.title));
      }
      if (patch?.drinkType !== undefined) {
        dispatch(updateDrinkType(patch.drinkType));
      }
      patch?.addTags.forEach((tag) => dispatch(addTag(tag)));
      const toast = getRecognitionToast(result, patch);
      showToast(toast.type, toast.title, toast.message);
    } catch (error) {
      if (!isMountedRef.current) {
        return;
      }
      const status = error instanceof RecognitionError ? error.status : 'INTERNAL';
      const [title, message] = getRecognitionErrorText(status);
      showToast('error', title, message);
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  };

  return (
    <ListRow
      onPress={recognize}
      showChevron={false}
      title="사진으로 술 알아보기"
      value={isLoading ? '알아보는 중…' : '첫 번째 사진'}
    >
      {isLoading ? (
        <ActivityIndicator color={colors.ACCENT} style={styles.icon} />
      ) : (
        <Ionicons color={colors.ACCENT} name="sparkles-outline" size={18} style={styles.icon} />
      )}
    </ListRow>
  );
}

const useStyles = makeStyles(() => ({
  icon: {
    marginRight: 8,
  },
}));
