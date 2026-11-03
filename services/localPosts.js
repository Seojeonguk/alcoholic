// 비회원(가입 없이 쓰기, #201) 기록을 기기에만 저장함. 서버로 보내지 않음
// 글은 문서 폴더의 guest/posts.json 하나에, 사진은 guest/photos/에 복사해 둠(캐시 폴더는 시스템이 지울 수 있음)
// 사진은 파일 이름만 저장하고, 화면 · 옮기기에 넘길 때 지금의 기기 경로로 바꿈(iOS는 업데이트하면 앱 폴더 경로가 바뀔 수 있음)
import {
  claimPosts,
  postsToMigrate,
  readStoredPosts,
  toGalleryItems,
  toPhotoName,
  visiblePosts,
} from '../lib';

import { Directory, File, Paths } from 'expo-file-system';
import uuid from 'react-native-uuid';

const guestDir = new Directory(Paths.document, 'guest');
const photoDir = new Directory(guestDir, 'photos');
const postsFile = new File(guestDir, 'posts.json');
const tmpFile = new File(guestDir, 'posts.json.tmp');

const GUEST_PHOTO_DIR_URI = photoDir.uri;

const isLocalPhoto = (uri) => uri.startsWith(GUEST_PHOTO_DIR_URI);

const toPhotoUri = (name) => new File(photoDir, name).uri;

const withPhotoUris = (post) => ({ ...post, photos: post.photos.map(toPhotoUri) });

const ensureDirs = () => {
  guestDir.create({ idempotent: true, intermediates: true });
  photoDir.create({ idempotent: true, intermediates: true });
};

const readText = async (file) => (file.exists ? file.text() : null);

const hasStoredPosts = () => postsFile.exists || tmpFile.exists;

const readPosts = async () =>
  readStoredPosts({ main: await readText(postsFile), tmp: await readText(tmpFile) });

// 임시 파일에 다 쓴 뒤 바꿔서, 쓰다가 앱이 꺼져도 원래 파일이 남게 함
// 바꾸는 중(원래 파일을 지운 뒤 이름을 바꾸기 전)에 꺼지면 readPosts가 임시 파일에서 되살림
const writePosts = async (posts) => {
  ensureDirs();
  // move는 File 객체의 경로를 옮긴 곳으로 바꾸므로 tmpFile을 쓰지 않고 새로 만듦
  const tmp = new File(guestDir, 'posts.json.tmp');
  await tmp.write(JSON.stringify(posts));
  await tmp.move(new File(guestDir, 'posts.json'), { overwrite: true });
};

// 읽고 고쳐 쓰는 작업을 하나씩 차례로 해서 동시에 저장해도 서로의 변경을 덮어쓰지 않게 함
let queue = Promise.resolve();
const runInQueue = (task) => {
  const result = queue.then(task);
  queue = result.catch(() => {});
  return result;
};

const updatePosts = (change) =>
  runInQueue(async () => {
    const posts = await readPosts();
    const { next, result } = change(posts);
    await writePosts(next);
    return result;
  });

const deletePhotoFiles = (names) => {
  names.forEach((name) => {
    try {
      const file = new File(photoDir, name);
      if (file.exists) {
        file.delete();
      }
    } catch {
      // 사진 파일을 못 지워도 글 저장 · 삭제는 계속함
    }
  });
};

const saveLocalPhoto = async (uri) => {
  ensureDirs();
  const target = new File(photoDir, `${uuid.v4()}.jpg`);
  await new File(uri).copy(target);
  return target.uri;
};

// 저장에 실패한 글을 위해 복사해 둔 사진을 지움(기기 경로를 받음)
const deleteLocalPhotos = (uris) => deletePhotoFiles(uris.filter(isLocalPhoto).map(toPhotoName));

// 화면에서 받은 기기 경로를 파일 이름으로 바꿔 저장함
const toStoredData = (data) => ({ ...data, photos: data.photos.map(toPhotoName) });

const getLocalPosts = () => runInQueue(async () => toGalleryItems(await readPosts(), toPhotoUri));

const getLocalPost = (id) =>
  runInQueue(async () => {
    const post = visiblePosts(await readPosts()).find((item) => item.id === id);
    return post ? withPhotoUris(post) : null;
  });

const createLocalPost = (data) =>
  updatePosts((posts) => ({
    next: [...posts, { ...toStoredData(data), id: uuid.v4(), owner: null }],
  }));

// createdAt · owner는 그대로 두고, 글에서 빠진 사진 파일은 지움
const updateLocalPost = async (id, data) => {
  const stored = toStoredData(data);
  const removedPhotos = await updatePosts((posts) => {
    const before = posts.find((post) => post.id === id);
    if (!before) {
      throw new Error('기기에서 기록을 찾지 못했어요.');
    }
    return {
      next: posts.map((post) =>
        post.id === id ? { ...stored, id, createdAt: before.createdAt, owner: before.owner } : post
      ),
      result: before.photos.filter((name) => !stored.photos.includes(name)),
    };
  });
  deletePhotoFiles(removedPhotos);
};

// 옮기기가 끝난 글을 지울 때도 씀(주인 상관없음)
const deleteLocalPost = async (id) => {
  const photos = await updatePosts((posts) => ({
    next: posts.filter((post) => post.id !== id),
    result: posts.find((post) => post.id === id)?.photos ?? [],
  }));
  deletePhotoFiles(photos);
};

// 비회원 화면에 보이는(주인 없는) 기록만 지움. 다른 계정으로 옮기다 남은 기록은 그대로 둠
const deleteVisibleLocalPosts = async () => {
  const photos = await updatePosts((posts) => ({
    next: posts.filter((post) => post.owner != null),
    result: visiblePosts(posts).flatMap((post) => post.photos),
  }));
  deletePhotoFiles(photos);
};

// 주인 없는 글을 이 계정의 것으로 적어 두고, 이 계정으로 옮길 글을 돌려줌(사진은 기기 경로로)
const claimLocalPosts = (uid) => {
  // 비회원으로 쓴 적이 없으면 파일을 만들지 않음(회원이 갤러리에 들어올 때마다 불림)
  if (!hasStoredPosts()) {
    return Promise.resolve([]);
  }
  return updatePosts((posts) => {
    const next = claimPosts(posts, uid);
    return { next, result: postsToMigrate(next, uid).map(withPhotoUris) };
  });
};

export {
  GUEST_PHOTO_DIR_URI,
  claimLocalPosts,
  createLocalPost,
  deleteLocalPost,
  deleteVisibleLocalPosts,
  getLocalPost,
  getLocalPosts,
  isLocalPhoto,
  saveLocalPhoto,
  deleteLocalPhotos,
  updateLocalPost,
};
