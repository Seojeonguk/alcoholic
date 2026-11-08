// 기기의 비회원 기록을 인증된 계정으로 옮김(#201)
// 다시 시도해도 두 번 올라가지 않게 사진은 같은 경로, 글은 기기 글 ID를 문서 ID로 씀
// 다 올라간 글만 기기에서 지우므로 중간에 끊겨도 다음에 남은 것부터 이어서 옮김
import { db } from '../firebaseConfig';
import { getImageContentType, makeThumbnail, photoIdFromUri, toRemotePost } from '../lib';
import { claimLocalPosts, deleteLocalPost } from './localPosts';

import { doc, setDoc } from '@react-native-firebase/firestore';
import { getDownloadURL, getStorage, putFile, ref } from '@react-native-firebase/storage';
import { File } from 'expo-file-system';

// 이미 올라가 있으면(지난번에 올리다 끊김) 규칙상 덮어쓸 수 없으므로 URL만 받음
// name: Storage 파일 이름. 다시 시도해도 같은 이름이 되도록 기기 파일 이름으로 정함
const uploadOnce = async (uid, uri, name = photoIdFromUri(uri)) => {
  const photoRef = ref(getStorage(), `posts/${uid}/${name}`);
  try {
    return await getDownloadURL(photoRef);
  } catch (e) {
    if (e?.code !== 'storage/object-not-found') {
      throw e;
    }
  }
  await putFile(photoRef, uri, { contentType: getImageContentType(uri) });
  return getDownloadURL(photoRef);
};

// 대표 사진의 갤러리 썸네일을 만들어 올림(#338). 실패해도 글은 옮김(갤러리가 원본을 보여 줌)
const uploadThumbnailOnce = async (uid, uri) => {
  try {
    return await uploadOnce(uid, await makeThumbnail(uri), `${photoIdFromUri(uri)}-thumbnail`);
  } catch {
    return null;
  }
};

const migratePost = async (post, uid, email) => {
  // 기기에서 사라진 사진은 빼고 옮김. 그래야 옮기기가 끝없이 실패하지 않음
  const photos = post.photos.filter((uri) => new File(uri).exists);
  const urls = [];
  for (const uri of photos) {
    urls.push(await uploadOnce(uid, uri));
  }
  const thumbnail = photos[0] ? await uploadThumbnailOnce(uid, photos[0]) : null;
  await setDoc(doc(db, 'posts', post.id), toRemotePost(post, email, urls, thumbnail));
  await deleteLocalPost(post.id);
};

const run = async ({ uid, email, onProgress }) => {
  const posts = await claimLocalPosts(uid);
  if (posts.length === 0) {
    return { moved: 0, failed: 0 };
  }
  let moved = 0;
  let failed = 0;
  onProgress?.({ done: 0, total: posts.length });
  for (const post of posts) {
    try {
      await migratePost(post, uid, email);
      moved += 1;
    } catch {
      failed += 1;
    }
    onProgress?.({ done: moved + failed, total: posts.length });
  }
  return { moved, failed };
};

// 갤러리에 빨리 다시 들어와도 한 번만 돌게 진행 중인 작업을 함께 씀
// 진행 상황은 마지막으로 부른 화면에 알림(먼저 부른 화면은 이미 떠났을 수 있음)
let running = null;
let progressListener = null;

const migrateGuestPosts = ({ onProgress, ...options }) => {
  progressListener = onProgress;
  if (!running) {
    running = run({ ...options, onProgress: (next) => progressListener?.(next) }).finally(() => {
      running = null;
      progressListener = null;
    });
  }
  return running;
};

export { migrateGuestPosts };
