import { useEffect, useRef, useState } from 'react';
import { Alert, ScrollView, StyleSheet } from 'react-native';

import {
  BottomButtonArea,
  Button,
  Content,
  Day,
  Header,
  Location,
  Photo,
  Tags,
  Title,
} from '../components';
import { COLORS, NAVIGATOR } from '../constants';
import {
  createLocalPost,
  createNewPost,
  isLocalPhoto,
  isMember,
  saveLocalPhoto,
  updateDocForId,
  updateLocalPost,
} from '../services';
import {
  getImageContentType,
  getPostLimitError,
  resizeForUpload,
  showToast,
  usePreventLeave,
} from '../lib';
import { init } from '../redux';

import { getAuth } from '@react-native-firebase/auth';
import { getDownloadURL, getStorage, putFile, ref } from '@react-native-firebase/storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import uuid from 'react-native-uuid';
import { useDispatch, useSelector } from 'react-redux';

// 이미 올라간 사진 · 기기에 저장해 둔 사진(수정할 때 남겨 둔 사진)은 다시 올리거나 복사하지 않음
const isUploaded = (uri) => uri.includes('firebase') || isLocalPhoto(uri);

export default function GalleryForm({ navigation, route }) {
  const [isLoading, setIsLoading] = useState(false);
  // 저장 버튼에 "사진 올리는 중 n/전체"를 보여 주기 위한 진행 상황. 새로 올릴 사진만 셈
  const [uploadProgress, setUploadProgress] = useState({ done: 0, total: 0 });
  // 저장 중에 다시 눌러 글이 두 번 만들어지지 않게 막음. state는 같은 프레임의 두 번째 탭에 반영되지 않아 ref를 씀
  const isSavingRef = useRef(false);
  const dispatch = useDispatch();
  const gallery = useSelector((state) => state.gallery);
  const docId = route.params?.docId;
  // 저장 중에 나갔다가 다시 들어와 저장하면 글이 두 번 만들어지므로 저장이 끝날 때까지 못 나가게 함
  usePreventLeave(navigation, isSavingRef);

  const existInput = () => {
    if (gallery.title !== '') {
      return true;
    }
    if (gallery.content !== '') {
      return true;
    }
    if (gallery.location !== '') {
      return true;
    }
    if (gallery.photos.length !== 0) {
      return true;
    }
    if (gallery.tags.length !== 0) {
      return true;
    }
    return false;
  };

  const initForm = () => {
    dispatch(init());
  };

  useEffect(() => {
    if (docId) {
      // 수정하다 나가면 그 내용이 새 글 작성 폼에 남지 않게 비움
      return () => dispatch(init());
    }
    if (existInput()) {
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
    setUploadProgress({
      done: 0,
      total: member ? gallery.photos.filter((uri) => !isUploaded(uri)).length : 0,
    });
    try {
      // 사진 줄이기는 메모리를 많이 써서 한 장씩 하고, 올리기는 동시에 함
      const photoUris = [];
      for (const photo of gallery.photos) {
        photoUris.push(isUploaded(photo) ? photo : await resizeForUpload(photo));
      }
      const savedPhotos = await Promise.all(photoUris.map(member ? uploadPhoto : keepOnDevice));

      const data = {
        title: gallery.title,
        day: gallery.day,
        photos: savedPhotos,
        content: gallery.content,
        location: gallery.location,
        tags: gallery.tags,
      };

      if (!member) {
        if (docId) {
          await updateLocalPost(docId, data);
        } else {
          await createLocalPost({ ...data, createdAt: new Date().getTime() });
        }
      } else if (docId) {
        // 수정할 때 createdAt을 바꾸면 목록 순서가 바뀌므로 그대로 둠
        await updateDocForId(docId, { ...data, writer: getAuth().currentUser.email });
      } else {
        const email = getAuth().currentUser.email;
        await createNewPost({ ...data, writer: email, createdAt: new Date() }, email);
      }

      initForm();

      showToast('success', '기록을 저장했어요.');
      isSavingRef.current = false;
      navigation.popTo(NAVIGATOR.BOTTOM_TAB_NAV, { screen: NAVIGATOR.GALLERY });
    } catch {
      showToast('error', '기록을 저장하지 못했어요.', '입력한 내용을 확인하고 다시 시도해 주세요.');
    } finally {
      isSavingRef.current = false;
      setIsLoading(false);
    }
  };

  // 비회원: 줄인 사진을 앱 문서 폴더로 복사해 둠(캐시 폴더는 시스템이 지울 수 있음)
  const keepOnDevice = (uri) => (isUploaded(uri) ? uri : saveLocalPhoto(uri));

  const uploadPhoto = async (uri) => {
    if (isUploaded(uri)) {
      return uri;
    }
    // storage.rules: 본인 uid 폴더에 이미지 타입으로만 올릴 수 있음
    // 네이티브 SDK는 기기의 파일을 바로 올림(uploadBytes는 구현돼 있지 않음)
    const uid = getAuth().currentUser.uid;
    const fileRef = ref(getStorage(), `posts/${uid}/${uuid.v4()}`);
    await putFile(fileRef, uri, { contentType: getImageContentType(uri) });

    const downloadURL = await getDownloadURL(fileRef);
    setUploadProgress((progress) => ({ ...progress, done: progress.done + 1 }));

    return downloadURL;
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
        <Photo />
        <Title />
        <Day />
        <Location />
        <Tags />
        <Content />
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
