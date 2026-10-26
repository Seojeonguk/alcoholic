import {
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { deleteObject, getStorage, listAll, ref } from 'firebase/storage';
import { db } from '../firebaseConfig';

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

// 내 글 전체를 한 번에 불러옴. 정렬 · 월 묶음은 화면에서 마신 날짜(day) 기준으로 함(lib/postSections)
const getPosts = async (email) => {
  const q = query(postsRef, where('writer', '==', email), orderBy('createdAt', 'desc'));

  const docs = await getDocs(q);

  const ret = [];

  const DEFAULT_PHOTO_URI =
    'https://firebasestorage.googleapis.com/v0/b/alcoholic-a9f86.appspot.com/o/default.jfif?alt=media&token=18e253aa-6a28-4a68-9823-eaf0726b6830';

  docs.forEach((doc) => {
    const data = doc.data();
    ret.push({
      docId: doc.id,
      presentivePhoto: data?.photos?.[0] ?? DEFAULT_PHOTO_URI,
      day: data?.day,
      createdAt: data?.createdAt?.toMillis?.() ?? 0,
    });
  });

  return ret;
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
    } catch (e) {
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
  getPosts,
  updateDocForId,
};
