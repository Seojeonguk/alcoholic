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
import { createNewPost, updateDocForId } from '../services';
import { getPostLimitError, resizeForUpload, showToast, usePreventLeave } from '../lib';
import { init } from '../redux';

import { getAuth } from 'firebase/auth';
import { getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import uuid from 'react-native-uuid';
import { useDispatch, useSelector } from 'react-redux';

// 이미 올라간 사진(수정할 때 남겨 둔 사진)은 다시 올리지 않음
const isUploaded = (uri) => uri.includes('firebase');

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
  }, []);

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
    setUploadProgress({ done: 0, total: gallery.photos.filter((uri) => !isUploaded(uri)).length });
    try {
      // 사진 줄이기는 메모리를 많이 써서 한 장씩 하고, 올리기는 동시에 함
      const photoUris = [];
      for (const photo of gallery.photos) {
        photoUris.push(isUploaded(photo) ? photo : await resizeForUpload(photo));
      }
      const downloadURLs = await Promise.all(photoUris.map(uploadPhoto));

      const auth = getAuth();
      const user = auth.currentUser;
      const email = user.email;

      const data = {
        title: gallery.title,
        day: gallery.day,
        photos: downloadURLs,
        content: gallery.content,
        location: gallery.location,
        tags: gallery.tags,
        writer: email,
      };

      if (docId) {
        // 수정할 때 createdAt을 바꾸면 목록 순서가 바뀌므로 그대로 둠
        await updateDocForId(docId, data);
      } else {
        await createNewPost({ ...data, createdAt: new Date() }, email);
      }

      initForm();

      showToast('success', '기록을 저장했어요.');
      isSavingRef.current = false;
      navigation.popTo(NAVIGATOR.BOTTOM_TAB_NAV, { screen: NAVIGATOR.GALLERY });
    } catch (e) {
      showToast('error', '기록을 저장하지 못했어요.', '입력한 내용을 확인하고 다시 시도해 주세요.');
    } finally {
      isSavingRef.current = false;
      setIsLoading(false);
    }
  };

  const uploadPhoto = async (uri) => {
    if (isUploaded(uri)) {
      return uri;
    }
    const blob = await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onload = function () {
        resolve(xhr.response);
      };
      xhr.onerror = function (e) {
        reject(new TypeError('Network request failed'));
      };
      xhr.responseType = 'blob';
      xhr.open('GET', uri, true);
      xhr.send(null);
    });

    // storage.rules: 본인 uid 폴더에 이미지 타입으로만 올릴 수 있음
    const uid = getAuth().currentUser.uid;
    const fileRef = ref(getStorage(), `posts/${uid}/${uuid.v4()}`);
    await uploadBytes(fileRef, blob, {
      contentType: blob.type?.startsWith('image/') ? blob.type : 'image/jpeg',
    });

    const downloadURL = await getDownloadURL(fileRef);

    blob.close();
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
