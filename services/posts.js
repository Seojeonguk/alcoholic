// 화면이 글을 읽고 쓰는 한 곳(#339). 회원은 Firestore · Storage(docs.js), 비회원은 기기(localPosts.js)를 씀
// 화면은 회원인지 따지지 않고 여기 함수만 부르고, 어느 저장소를 쓸지는 getPostStore가 고름
import { auth } from '../firebaseConfig';
import {
  getImageContentType,
  getRemovedPhotos,
  isRemotePhoto,
  makeThumbnail,
  planThumbnail,
  resizeForUpload,
  splitStoredPhotos,
  toPostData,
  UPLOAD_TIMEOUT_MS,
  waitForWrite,
  withTimeout,
} from '../lib';
import {
  createNewPost,
  deletePhotos,
  deletePost,
  getPost,
  subscribePosts,
  updateDocForId,
} from './docs';
import {
  createLocalPost,
  deleteLocalPhotos,
  deleteLocalPost,
  getLocalPost,
  isLocalPhoto,
  saveLocalPhoto,
  subscribeLocalPosts,
  updateLocalPost,
} from './localPosts';
import { isMember } from './session';

import { getDownloadURL, getStorage, putFile, ref } from '@react-native-firebase/storage';
import { File, Paths } from 'expo-file-system';
import uuid from 'react-native-uuid';

// 이미 올라간 사진 · 기기에 저장해 둔 사진(수정할 때 남겨 둔 사진)은 다시 올리거나 복사하지 않음
const isStoredPhoto = (uri) => isRemotePhoto(uri) || isLocalPhoto(uri);

// storage.rules: 본인 uid 폴더에 이미지 타입으로만 올릴 수 있음
// 네이티브 SDK는 기기의 파일을 바로 올림(uploadBytes는 구현돼 있지 않음)
const uploadPhoto = async (uri) => {
  const uid = auth.currentUser.uid;
  const fileRef = ref(getStorage(), `posts/${uid}/${uuid.v4()}`);
  // 연결이 없으면 SDK가 오래 다시 시도하므로 시간 제한을 둠. 시간이 지나면 올리기를 취소해서
  // 저장 실패 뒤에 사진이 늦게 올라가 남지 않게 함(#323)
  const task = putFile(fileRef, uri, { contentType: getImageContentType(uri) });
  await withTimeout(task, UPLOAD_TIMEOUT_MS, () => {
    task.cancel()?.catch?.(() => {});
  });
  try {
    return await withTimeout(getDownloadURL(fileRef), UPLOAD_TIMEOUT_MS);
  } catch (e) {
    // 올라갔지만 주소를 받지 못한 사진은 글에 들어가지 않으므로 지움
    deletePhotos([fileRef.fullPath], uid);
    throw e;
  }
};

// 대표 사진의 썸네일을 만들어 올리고 URL을 돌려줌(#338). source: 기기 파일 또는 이미 올린 사진 URL
// 썸네일은 갤러리를 빠르게 하려는 것이라 실패해도 글 저장은 계속함(null을 돌려주면 갤러리가 원본을 보여 줌)
const uploadThumbnail = async (source) => {
  let downloaded = null;
  try {
    let local = source;
    if (isRemotePhoto(source)) {
      // 대표 사진을 이미 올린 사진으로 바꾼 경우. 받아서 줄인 뒤 받은 파일은 지움
      downloaded = await withTimeout(
        File.downloadFileAsync(source, new File(Paths.cache, `thumbnail-${uuid.v4()}.jpg`)),
        UPLOAD_TIMEOUT_MS
      );
      local = downloaded.uri;
    }
    return await uploadPhoto(await makeThumbnail(local));
  } catch {
    return null;
  } finally {
    try {
      downloaded?.delete();
    } catch {
      // 캐시 폴더라 못 지워도 시스템이 정리함
    }
  }
};

// 저장소마다 같은 모양의 함수를 둠. create · update · remove는 { queued }를 돌려줌
// queued: 연결이 없어 기기에 먼저 반영됨. 연결되면 서버에 올라감(#323). 비회원은 늘 false
const memberStore = {
  get: getPost,
  create: (data) =>
    waitForWrite(createNewPost({ ...data, writer: auth.currentUser.email, createdAt: new Date() })),
  // 수정할 때 createdAt을 바꾸면 목록 순서가 바뀌므로 그대로 둠
  // 고친 글이 서버에 반영된 뒤에 빠진 사진을 지움. 실패해도 저장은 끝난 것으로 봄
  update: (docId, data, removedPhotos) => {
    const { uid, email } = auth.currentUser;
    const write = updateDocForId(docId, { ...data, writer: email });
    write.then(() => deletePhotos(removedPhotos, uid)).catch(() => {});
    return waitForWrite(write);
  },
  remove: (docId, photos) => waitForWrite(deletePost(docId, auth.currentUser.uid, photos)),
  storePhoto: uploadPhoto,
  storeThumbnail: uploadThumbnail,
  discardPhotos: (uris) => deletePhotos(uris, auth.currentUser?.uid),
};

const SAVED = { queued: false };

const guestStore = {
  get: getLocalPost,
  create: async (data) => {
    await createLocalPost({ ...data, createdAt: new Date().getTime() });
    return SAVED;
  },
  // 기기 글에서 빠진 사진 파일은 updateLocalPost가 지움
  update: async (docId, data) => {
    await updateLocalPost(docId, data);
    return SAVED;
  },
  remove: async (docId) => {
    await deleteLocalPost(docId);
    return SAVED;
  },
  // 줄인 사진을 앱 문서 폴더로 복사해 둠(캐시 폴더는 시스템이 지울 수 있음)
  storePhoto: saveLocalPhoto,
  // 기기 사진은 받는 비용이 없어서 썸네일을 만들지 않음(#338)
  storeThumbnail: null,
  discardPhotos: deleteLocalPhotos,
};

const getPostStore = () => (isMember() ? memberStore : guestStore);

// 글 하나를 읽음. 없으면 null
const loadPost = (docId) => getPostStore().get(docId);

// 갤러리 목록을 구독함. account: 회원 이메일(비회원이면 null). 돌려준 함수를 부르면 구독을 끊음
// 회원은 Firestore 구독(#300), 비회원은 기기 기록을 읽고 기기에 저장 · 삭제할 때마다 다시 읽음
const subscribeGallery = (account, onNext, onError) =>
  account ? subscribePosts(account, onNext, onError) : subscribeLocalPosts(onNext, onError);

// 저장할 때 올릴 사진 수. 저장 버튼의 "사진 올리는 중 n/전체"에 씀. 비회원은 올리지 않으므로 0
const countPhotosToUpload = (photos) =>
  isMember() ? photos.filter((uri) => !isStoredPhoto(uri)).length : 0;

// 글을 저장함: 사진 줄이기 → 사진 올리기(비회원은 기기에 복사) → 글 쓰기
// 글이 저장되지 않으면 이번에 새로 저장한 사진을 지우고 에러를 던짐(#291 · #292)
// docId가 있으면 고치기. originalPhotos: 고치기 전 사진(글에서 빠진 사진을 지울 때 씀)
// originalThumbnail: 고치기 전 갤러리 썸네일(#338). 대표 사진이 바뀌면 새로 만들고 예전 것은 지움
// onPhotoStored: 사진 한 장을 저장할 때마다 부름. { queued }를 돌려줌
const savePost = async ({
  docId,
  form,
  originalPhotos = [],
  originalThumbnail = null,
  onPhotoStored,
}) => {
  const store = getPostStore();
  let newPhotos = [];
  try {
    // 사진 줄이기는 메모리를 많이 써서 한 장씩 하고, 올리기는 동시에 함
    const uris = [];
    for (const photo of form.photos) {
      uris.push(isStoredPhoto(photo) ? photo : await resizeForUpload(photo));
    }
    // 하나가 실패해도 나머지가 끝날 때까지 기다려야 올라간 사진을 빠짐없이 지울 수 있음
    const results = await Promise.allSettled(
      uris.map(async (uri) => {
        if (isStoredPhoto(uri)) {
          return uri;
        }
        const stored = await store.storePhoto(uri);
        onPhotoStored?.();
        return stored;
      })
    );
    const split = splitStoredPhotos(form.photos, results, isStoredPhoto);
    newPhotos = split.newPhotos;
    if (split.failed) {
      throw split.error ?? new Error('사진을 저장하지 못했어요.');
    }

    // 회원은 대표 사진의 썸네일을 둠(#338). 이번에 올린 대표 사진은 줄여 둔 기기 파일로 만듦
    const plan = store.storeThumbnail
      ? planThumbnail({
          cover: split.photos[0],
          originalCover: originalPhotos[0],
          originalThumbnail,
        })
      : { action: 'none', removed: null };
    let thumbnail = plan.action === 'keep' ? originalThumbnail : null;
    if (plan.action === 'make') {
      thumbnail = await store.storeThumbnail(
        isStoredPhoto(form.photos[0]) ? split.photos[0] : uris[0]
      );
      if (thumbnail) {
        newPhotos.push(thumbnail);
      }
    }

    // 글은 문서(비회원은 기기의 파일) 하나를 한 번에 씀. 실패하면 글이 저장되지 않은 것임
    const data = toPostData(form, split.photos, thumbnail);
    const removed = [...getRemovedPhotos(originalPhotos, split.photos), plan.removed].filter(
      Boolean
    );
    const result = docId ? await store.update(docId, data, removed) : await store.create(data);
    // queued여도 연결되면 올라가므로 올린 사진을 지우지 않음
    newPhotos = [];
    return result;
  } catch (e) {
    // 글이 저장되지 않았으니 이번에 저장한 사진은 어디에서도 쓰이지 않음
    store.discardPhotos(newPhotos);
    throw e;
  }
};

// 글과 그 사진을 지움. { queued }를 돌려줌
const removePost = (docId, photos) => getPostStore().remove(docId, photos);

export { countPhotosToUpload, loadPost, removePost, savePost, subscribeGallery };
