import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Text, View } from 'react-native';

import { NAVIGATOR } from '../constants';
import {
  appendTasteNote,
  getRecognitionErrorText,
  getRecognitionPatch,
  getRecognitionToast,
  getTasteCard,
  makeStyles,
  showToast,
  useColors,
} from '../lib';
import { addTag, updateContent, updateDrinkType, updateTitle } from '../redux';
import { isMember, recognizeDrink, RecognitionError } from '../services';
import { usePostForm } from './PostForm';
import { Button, ListRow } from './ui';

import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

// 첫 번째 사진으로 무슨 술인지 알아보고 제목 · 주종 · 태그를 채워 줌(#381)
// 버튼을 누를 때만 사진을 보냄. 이미 쓴 제목 · 주종은 바꾸지 않고, 태그는 더하기만 함
// 비회원은 사진을 보내지 않고 로그인을 안내함
// 맛 표현 · 비슷한 술은 카드로 보여 주고, 맛 표현은 누를 때만 본문에 넣음(#391)
export default function RecognizeDrink() {
  const colors = useColors();
  const styles = useStyles();
  const navigation = useNavigation();
  const { form, dispatch } = usePostForm();
  const [isLoading, setIsLoading] = useState(false);
  // { photo, ...getTasteCard 결과 }. 첫 번째 사진이 바뀌면 그 사진의 결과가 아니므로 보여 주지 않음
  const [taste, setTaste] = useState(null);
  const card = taste && taste.photo === form.photos[0] ? taste : null;
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
      const tasteCard = getTasteCard(result);
      setTaste(tasteCard && { ...tasteCard, photo: form.photos[0] });
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

  const insertTasteNote = () => {
    const next = appendTasteNote(formRef.current.content, card.tasteNote);
    if (next === null) {
      showToast('info', '본문에 넣지 못했어요.', '이미 들어 있거나 본문이 너무 길어요.');
      return;
    }
    dispatch(updateContent(next));
    showToast('success', '본문에 맛 표현을 넣었어요.', '내 느낌에 맞게 고쳐 써 보세요.');
  };

  const isNoteInContent = !!card?.tasteNote && (form.content ?? '').includes(card.tasteNote);

  return (
    <>
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
      {card ? (
        <View style={styles.card}>
          {card.tasteNote ? (
            <>
              <Text style={styles.heading}>{card.name ? `${card.name}의 맛` : '맛 표현'}</Text>
              <Text style={styles.body}>{card.tasteNote}</Text>
              {card.flavors.length > 0 ? (
                <View style={styles.chips}>
                  {card.flavors.map((flavor) => (
                    <Text key={flavor} style={styles.chip}>
                      {flavor}
                    </Text>
                  ))}
                </View>
              ) : null}
              <Button
                disabled={isNoteInContent}
                onPress={insertTasteNote}
                style={styles.button}
                title={isNoteInContent ? '본문에 넣었어요' : '본문에 넣기'}
                variant="soft"
              />
            </>
          ) : null}
          {card.similar.length > 0 ? (
            <>
              <Text style={[styles.heading, card.tasteNote ? styles.section : null]}>
                비슷한 술
              </Text>
              {card.similar.map(({ name, reason }) => (
                <View key={name} style={styles.similar}>
                  <Text style={styles.similarName}>{name}</Text>
                  {reason ? <Text style={styles.sub}>{reason}</Text> : null}
                </View>
              ))}
            </>
          ) : null}
          <Text style={[styles.sub, styles.notice]}>
            AI가 알려 준 일반적인 정보라서 실제와 다를 수 있어요.
          </Text>
        </View>
      ) : null}
    </>
  );
}

const useStyles = makeStyles((colors) => ({
  body: {
    color: colors.TEXT,
    fontSize: 15,
    lineHeight: 22,
  },
  button: {
    marginTop: 12,
  },
  card: {
    backgroundColor: colors.FILL,
    borderRadius: 12,
    marginBottom: 8,
    padding: 14,
  },
  chip: {
    backgroundColor: colors.ACCENT_SOFT,
    borderRadius: 12,
    color: colors.ACCENT,
    fontSize: 13,
    overflow: 'hidden',
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 10,
  },
  heading: {
    color: colors.TEXT,
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 6,
  },
  icon: {
    marginRight: 8,
  },
  notice: {
    marginTop: 12,
  },
  section: {
    marginTop: 16,
  },
  similar: {
    marginTop: 6,
  },
  similarName: {
    color: colors.TEXT,
    fontSize: 15,
  },
  sub: {
    color: colors.TEXT_SUB,
    fontSize: 13,
    lineHeight: 18,
  },
}));
