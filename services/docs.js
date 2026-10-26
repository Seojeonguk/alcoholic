import {
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

// 내 글 전체를 최신순으로 한 번에 불러옴
const getPosts = async (email) => {
  const q = query(postsRef, where('writer', '==', email), orderBy('createdAt', 'desc'));

  const docs = await getDocs(q);

  const ret = [];

  const DEFAULT_PHOTO_URI =
    'https://firebasestorage.googleapis.com/v0/b/alcoholic-a9f86.appspot.com/o/default.jfif?alt=media&token=18e253aa-6a28-4a68-9823-eaf0726b6830';

  docs.forEach((doc) => {
    const presentivePhoto = doc.data()?.photos?.[0] ?? DEFAULT_PHOTO_URI;
    const docId = doc.id;
    ret.push({ presentivePhoto: presentivePhoto, docId: docId });
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

// 탈퇴할 때 내 사진 · 게시글 · 사용자 문서를 지움. 중간에 실패해도 다시 실행하면 남은 것만 지움
const deleteUserData = async (email, uid) => {
  const { items } = await listAll(ref(getStorage(), `posts/${uid}`));
  await Promise.all(items.map((item) => deleteObject(item)));

  const myPosts = await getDocs(query(postsRef, where('writer', '==', email)));
  await Promise.all(myPosts.docs.map((post) => deleteDoc(post.ref)));

  await deleteDoc(doc(usersRef, email));
};

export { createNewPost, createUserInfo, deleteUserData, getPost, getPosts, updateDocForId };
