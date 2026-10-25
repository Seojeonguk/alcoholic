import {
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  setDoc,
  startAt,
  updateDoc,
  where,
} from 'firebase/firestore';
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

const getPosts = async (lastSnapShot, email) => {
  if (!lastSnapShot) {
    const q = query(postsRef, where('writer', '==', email), orderBy('createdAt', 'desc'), limit(1));
    const snapShotList = await getDocs(q);
    lastSnapShot = snapShotList.docs[0];
  }

  if (!lastSnapShot) {
    lastSnapShot = null;
  }

  const q = query(
    postsRef,
    where('writer', '==', email),
    orderBy('createdAt', 'desc'),
    startAt(lastSnapShot)
  );

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

export { createNewPost, createUserInfo, getPost, getPosts, updateDocForId };
