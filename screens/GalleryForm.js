import { useEffect, useReducer, useRef, useState } from 'react';
import { Alert, ScrollView, StyleSheet } from 'react-native';

import {
  BottomButtonArea,
  Button,
  Content,
  Day,
  Header,
  Location,
  Photo,
  PostFormProvider,
  Tags,
  Title,
} from '../components';
import { COLORS, NAVIGATOR } from '../constants';
import { askAnnouncementsOnce, countPhotosToUpload, isMember, savePost } from '../services';
import {
  getPostLimitError,
  getPostMissingError,
  hasDraft,
  isFormChanged,
  showToast,
  usePreventLeave,
} from '../lib';
import { init, postFormReducer, updateGallery } from '../redux';

import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';

export default function GalleryForm({ navigation, route }) {
  const [isLoading, setIsLoading] = useState(false);
  // 저장 버튼에 "사진 올리는 중 n/전체"를 보여 주기 위한 진행 상황. 새로 올릴 사진만 셈
  const [uploadProgress, setUploadProgress] = useState({ done: 0, total: 0 });
  // 저장 중에 다시 눌러 글이 두 번 만들어지지 않게 막음. state는 같은 프레임의 두 번째 탭에 반영되지 않아 ref를 씀
  const isSavingRef = useRef(false);
  const docId = route.params?.docId;
  // 새 글은 redux의 초안을 쓰고(닫았다가 이어 쓸 수 있음), 글 수정은 이 화면의 state를 씀
  // 그래서 다른 글을 고쳐도 새 글 초안이 덮어써지거나 지워지지 않음(#325)
  const reduxDispatch = useDispatch();
  const draft = useSelector((state) => state.gallery);
  const [editing, editDispatch] = useReducer(postFormReducer, route.params?.post, (post) =>
    postFormReducer(undefined, updateGallery(post ?? {}))
  );
  const gallery = docId ? editing : draft;
  const dispatch = docId ? editDispatch : reduxDispatch;
  // 고치기 전 폼 값. 상세 화면이 넘긴 원래 글로 시작하므로 처음 값이 원래 글임
  // 저장한 뒤 글에서 빠진 사진을 지울 때(#291)와 고친 내용이 있는지 볼 때(#302) 씀
  const [originalForm] = useState(() => (docId ? gallery : null));
  const originalPhotos = originalForm?.photos ?? [];
  // 저장에 성공해 갤러리로 갈 때는 고친 내용을 묻지 않음. 폼을 비운 뒤라 고친 것처럼 보이기 때문
  const isLeavingRef = useRef(false);
  // 저장 중에 나갔다가 다시 들어와 저장하면 글이 두 번 만들어지므로 저장이 끝날 때까지 못 나가게 함
  usePreventLeave(navigation, isSavingRef);
  // 리스너가 글자를 칠 때마다 다시 등록되지 않게 지금 폼 값은 ref로 읽음
  const galleryRef = useRef(gallery);
  useEffect(() => {
    galleryRef.current = gallery;
  }, [gallery]);

  // 글을 고치다 닫기 버튼이나 Android 뒤로 가기로 나가면 그만둘지 물어봄(#302)
  useEffect(
    () =>
      navigation.addListener('beforeRemove', (e) => {
        // 저장 중에는 usePreventLeave가 막으므로 묻지 않음
        if (!originalForm || isSavingRef.current || isLeavingRef.current) {
          return;
        }
        if (!isFormChanged(originalForm, galleryRef.current)) {
          return;
        }
        e.preventDefault();
        Alert.alert('수정을 그만둘까요?', '고친 내용은 저장되지 않아요.', [
          { text: '계속 고칠게요', style: 'cancel' },
          {
            text: '그만둘게요',
            style: 'destructive',
            onPress: () => {
              isLeavingRef.current = true;
              navigation.dispatch(e.data.action);
            },
          },
        ]);
      }),
    [navigation, originalForm]
  );

  // 새 글 초안을 비움. 글 수정은 화면을 나가면 state가 사라지므로 비울 것이 없음
  const initForm = () => {
    if (!docId) {
      reduxDispatch(init());
    }
  };

  useEffect(() => {
    if (docId) {
      return;
    }
    // 초안이 없으면 폼을 비워서 날짜를 오늘로 맞춤. 앱을 켜 둔 채 날짜가 바뀌어도 지난 날짜로 남지 않음(#324)
    // 초안을 이어서 쓰면 고른 날짜를 그대로 둠
    if (!hasDraft(gallery)) {
      initForm();
    } else {
      Alert.alert('작성하던 기록이 있어요.', '이어서 작성할까요?', [
        {
          text: '새로 작성',
          style: 'destructive',
          onPress: () => initForm(),
        },
        {
          text: '이어서 작성',
          style: 'cancel',
        },
      ]);
    }
    // 화면에 처음 들어올 때 한 번만 물어봄. 입력할 때마다 다시 묻지 않게 의존성을 비워 둠
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const save = async () => {
    if (isSavingRef.current) {
      return;
    }
    const missingError = getPostMissingError(gallery);
    if (missingError) {
      showToast('info', missingError);
      return;
    }
    // 규칙에서 거절되기 전에 무엇이 넘는지 알려 줌
    const limitError = getPostLimitError(gallery);
    if (limitError) {
      showToast('error', limitError, '줄인 뒤 다시 저장해 주세요.');
      return;
    }
    isSavingRef.current = true;
    setIsLoading(true);
    // 비회원은 기기에만 저장함(#201). 사진을 올리지 않으니 진행 상황 없이 "저장하는 중…"만 보여 줌
    const member = isMember();
    setUploadProgress({ done: 0, total: countPhotosToUpload(gallery.photos) });
    try {
      // 사진 처리 · 글 쓰기 · 실패했을 때 사진 정리는 services/posts.js가 함(#339)
      // queued: 연결이 없어 기기에 먼저 저장됨. 연결되면 올라감(#323)
      const { queued } = await savePost({
        docId,
        form: gallery,
        originalPhotos,
        onPhotoStored: () =>
          setUploadProgress((progress) => ({ ...progress, done: progress.done + 1 })),
      });

      isLeavingRef.current = true;
      initForm();

      if (queued) {
        showToast('info', '연결되면 기록이 올라가요.', '지금은 이 기기에만 저장돼 있어요.');
      } else {
        showToast('success', '기록을 저장했어요.');
      }
      isSavingRef.current = false;
      navigation.popTo(NAVIGATOR.BOTTOM_TAB_NAV, { screen: NAVIGATOR.GALLERY });
      // 새 기록을 저장한 뒤 공지 알림을 받을지 한 번만 물어봄(#304). 실패해도 저장은 끝난 것으로 봄
      if (!docId) {
        askAnnouncementsOnce().catch(() => {});
      }
    } catch {
      // 길이 · 개수는 getPostLimitError가 먼저 거르므로 회원 저장 실패는 대부분 연결 문제임
      showToast(
        'error',
        '기록을 저장하지 못했어요.',
        member ? '인터넷 연결을 확인하고 다시 시도해 주세요.' : '잠시 후 다시 시도해 주세요.'
      );
    } finally {
      isSavingRef.current = false;
      setIsLoading(false);
    }
  };

  const { done, total } = uploadProgress;
  const loadingTitle =
    total > 0 && done < total ? `사진 올리는 중 ${done}/${total}` : '저장하는 중…';

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <Header
        left="close"
        onPressLeft={() => navigation.goBack()}
        title={docId ? '기록 수정' : '새 기록'}
      />

      {/* 저장 중에 고친 내용은 저장되지 않으므로 입력을 막음 */}
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        style={isLoading && styles.locked}
      >
        <PostFormProvider dispatch={dispatch} form={gallery}>
          <Photo />
          <Title />
          <Day />
          <Location />
          <Tags />
          <Content />
        </PostFormProvider>
      </ScrollView>

      <BottomButtonArea>
        <Button loading={isLoading} loadingTitle={loadingTitle} onPress={save} title="저장하기" />
      </BottomButtonArea>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.BACKGROUND,
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
  },
  locked: {
    pointerEvents: 'none',
  },
});
