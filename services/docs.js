import {
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  updateDoc,
  where,
} from '@react-native-firebase/firestore';
import { deleteObject, getStorage, listAll, ref } from '@react-native-firebase/storage';
import { db } from '../firebaseConfig';
import { toGalleryPost } from '../lib';

const usersRef = collection(db, 'users');
const postsRef = collection(db, 'posts');

const createUserInfo = async (email) => {
  const newUserDoc = doc(usersRef, email);
  await setDoc(newUserDoc, {
    userEmail: email,
    posts: [],
  });
};

const createNewPost = async (data, email) => {
  const newPostDoc = doc(postsRef);
  await setDoc(newPostDoc, data);

  await updateDoc(doc(usersRef, email), {
    posts: arrayUnion(newPostDoc.id),
  });
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

const updateDocForId = async (id, data) => {
  const targetDocRef = doc(postsRef, id);

  await updateDoc(targetDocRef, data);
};

const getPost = async (docId) => {
  const docRef = doc(postsRef, docId);
  const post = await getDoc(docRef);

  return post.data();
};

// 글과 그 글의 사진을 지움. 사진은 글을 지운 뒤에 지우고, 실패해도 탈퇴할 때 폴더째 지워지므로 넘어감
const deletePost = async (docId, email, uid, photos) => {
  await deleteDoc(doc(postsRef, docId));
  await updateDoc(doc(usersRef, email), {
    posts: arrayRemove(docId),
  });

  const storage = getStorage();
  const myPhotos = photos.flatMap((url) => {
    try {
      const photoRef = ref(storage, url);
      // 예전 경로(posts/{파일})의 사진은 규칙상 지울 수 없음
      return photoRef.fullPath.startsWith(`posts/${uid}/`) ? [photoRef] : [];
    } catch {
      return [];
    }
  });
  await Promise.allSettled(myPhotos.map((photoRef) => deleteObject(photoRef)));
};

// 탈퇴할 때 내 사진 · 게시글 · 사용자 문서를 지움. 중간에 실패해도 다시 실행하면 남은 것만 지움
const deleteUserData = async (email, uid) => {
  const { items } = await listAll(ref(getStorage(), `posts/${uid}`));
  await Promise.all(items.map((item) => deleteObject(item)));

  const myPosts = await getDocs(query(postsRef, where('writer', '==', email)));
  await Promise.all(myPosts.docs.map((post) => deleteDoc(post.ref)));

  await deleteDoc(doc(usersRef, email));
};

export {
  createNewPost,
  createUserInfo,
  deletePost,
  deleteUserData,
  getPost,
  subscribePosts,
  updateDocForId,
};
