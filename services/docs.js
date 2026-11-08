import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  getDocsFromServer,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  updateDoc,
  where,
} from '@react-native-firebase/firestore';
import { deleteObject, getStorage, listAll, ref } from '@react-native-firebase/storage';
import { db } from '../firebaseConfig';
import { toGalleryPost, toMillis } from '../lib';

const usersRef = collection(db, 'users');
const postsRef = collection(db, 'posts');

// posts(글 ID 목록)는 더 쓰지 않음(#292). 지금 배포된 규칙이 posts를 요구해서 빈 배열은 계속 넣음
const createUserInfo = async (email) => {
  const newUserDoc = doc(usersRef, email);
  await setDoc(newUserDoc, {
    userEmail: email,
    posts: [],
  });
};

// 글 문서 하나만 씀. 실패하면 글이 저장되지 않은 것이라 다시 눌러도 글이 두 번 생기지 않음(#292)
const createNewPost = async (data) => {
  await setDoc(doc(postsRef), data);
};

// 내 글 목록을 구독함. 처음에 한 번 전체를 받고, 그 뒤로는 바뀐 글만 받아 목록 전체를 다시 넘겨 줌(#300)
// 기기 캐시를 먼저 보여 주고, 이 기기에서 쓰거나 고치거나 지운 글은 서버 응답 전에 바로 반영됨
// 정렬 · 월 묶음은 화면에서 마신 날짜(day) 기준으로 함(lib/postSections). 돌려준 함수를 부르면 구독을 끊음
const subscribePosts = (email, onNext, onError) => {
  const q = query(postsRef, where('writer', '==', email), orderBy('createdAt', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => onNext(snapshot.docs.map((post) => toGalleryPost(post.id, post.data()))),
    onError
  );
};

// 기록 내보내기(#344)에서 내 글 전체를 한 번 읽음. 서버에서 받지 못하면 에러를 던짐(기기 캐시만으로 내보내지 않음)
const getAllPosts = async (email) => {
  const snapshot = await getDocsFromServer(query(postsRef, where('writer', '==', email)));
  return snapshot.docs.map((post) => {
    const data = post.data();
    return { ...data, id: post.id, createdAt: toMillis(data.createdAt) };
  });
};

const updateDocForId = async (id, data) => {
  const targetDocRef = doc(postsRef, id);

  await updateDoc(targetDocRef, data);
};

const getPost = async (docId) => {
  const docRef = doc(postsRef, docId);
  const post = await getDoc(docRef);

  return post.data();
};

// 내 폴더(posts/{uid}/)의 사진만 지움. 실패해도 에러를 던지지 않음(탈퇴할 때 폴더째 지워짐)
const deletePhotos = async (urls, uid) => {
  const storage = getStorage();
  const myPhotos = urls.flatMap((url) => {
    try {
      const photoRef = ref(storage, url);
      // 예전 경로(posts/{파일})의 사진은 규칙상 지울 수 없음(정리 방법은 docs/firebase-setup.md)
      return photoRef.fullPath.startsWith(`posts/${uid}/`) ? [photoRef] : [];
    } catch {
      return [];
    }
  });
  await Promise.allSettled(myPhotos.map((photoRef) => deleteObject(photoRef)));
};

// 글을 지우고, 글 삭제가 서버에 반영되면 사진을 지움. 돌려준 Promise는 글 삭제가 반영될 때 끝남
// 오프라인이면 기기에서는 바로 지워지고(구독 목록에서도 빠짐) 연결되면 서버에 반영된 뒤 사진도 지움(#323)
const deletePost = (docId, uid, photos) => {
  const removed = deleteDoc(doc(postsRef, docId));
  removed.then(() => deletePhotos(photos, uid)).catch(() => {});
  return removed;
};

// 탈퇴할 때 내 사진 · 게시글 · 사용자 문서를 지움. 중간에 실패해도 다시 실행하면 남은 것만 지움
// verified: 이메일 인증을 했는지. 인증 전 계정은 글을 쓸 수 없고 규칙상 posts를 조회할 수도 없어서 건너뜀(#322)
const deleteUserData = async (email, uid, { verified = true } = {}) => {
  const { items } = await listAll(ref(getStorage(), `posts/${uid}`));
  await Promise.all(items.map((item) => deleteObject(item)));

  if (verified) {
    const myPosts = await getDocs(query(postsRef, where('writer', '==', email)));
    await Promise.all(myPosts.docs.map((post) => deleteDoc(post.ref)));
  }

  await deleteDoc(doc(usersRef, email));
};

export {
  createNewPost,
  createUserInfo,
  deletePhotos,
  deletePost,
  deleteUserData,
  getAllPosts,
  getPost,
  subscribePosts,
  updateDocForId,
};
