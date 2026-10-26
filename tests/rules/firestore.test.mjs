import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { after, before, beforeEach, describe, test } from 'node:test';

import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
} from '@firebase/rules-unit-testing';
import {
  addDoc,
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

const ME = { uid: 'me-uid', email: 'me@example.com' };
const OTHER = { uid: 'other-uid', email: 'other@example.com' };

let testEnv;

const verifiedDb = (user) =>
  testEnv.authenticatedContext(user.uid, { email: user.email, email_verified: true }).firestore();
const unverifiedDb = (user) =>
  testEnv.authenticatedContext(user.uid, { email: user.email, email_verified: false }).firestore();
const guestDb = () => testEnv.unauthenticatedContext().firestore();

const newPost = (writer, overrides = {}) => ({
  title: '제목',
  day: '2026-10-25',
  photos: [],
  content: '내용',
  location: '',
  tags: [],
  writer,
  createdAt: new Date(),
  ...overrides,
});

// 보안 규칙을 건너뛰고 테스트 데이터를 넣음
const seed = (path, data) =>
  testEnv.withSecurityRulesDisabled((ctx) => setDoc(doc(ctx.firestore(), path), data));

before(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: 'demo-alcoholic',
    firestore: { rules: readFileSync('firestore.rules', 'utf8') },
  });
});

beforeEach(async () => {
  await testEnv.clearFirestore();
});

after(async () => {
  await testEnv.cleanup();
});

describe('users/{email}', () => {
  test('회원가입 직후(이메일 인증 전)에 내 사용자 문서를 만들 수 있어요', async () => {
    await assertSucceeds(
      setDoc(doc(unverifiedDb(ME), 'users', ME.email), { userEmail: ME.email, posts: [] })
    );
  });

  test('다른 이메일로 사용자 문서를 만들 수 없어요', async () => {
    await assertFails(
      setDoc(doc(verifiedDb(ME), 'users', OTHER.email), { userEmail: OTHER.email, posts: [] })
    );
  });

  test('대소문자가 다른 이메일로는 만들 수 없어요', async () => {
    await assertFails(
      setDoc(doc(verifiedDb(ME), 'users', 'Me@Example.com'), {
        userEmail: 'Me@Example.com',
        posts: [],
      })
    );
  });

  test('정해진 필드 외의 값은 넣을 수 없어요', async () => {
    await assertFails(
      setDoc(doc(verifiedDb(ME), 'users', ME.email), {
        userEmail: ME.email,
        posts: [],
        isAdmin: true,
      })
    );
  });

  test('내 문서는 읽을 수 있고 다른 사람 문서는 읽을 수 없어요', async () => {
    await seed(`users/${ME.email}`, { userEmail: ME.email, posts: [] });
    await seed(`users/${OTHER.email}`, { userEmail: OTHER.email, posts: [] });

    await assertSucceeds(getDoc(doc(verifiedDb(ME), 'users', ME.email)));
    await assertFails(getDoc(doc(verifiedDb(ME), 'users', OTHER.email)));
    await assertFails(getDoc(doc(guestDb(), 'users', ME.email)));
  });

  test('인증한 사용자는 내 문서의 posts에 글 ID를 추가할 수 있어요', async () => {
    await seed(`users/${ME.email}`, { userEmail: ME.email, posts: [] });

    await assertSucceeds(
      updateDoc(doc(verifiedDb(ME), 'users', ME.email), { posts: arrayUnion('post-1') })
    );
  });

  test('글을 지울 때 내 문서의 posts에서 글 ID를 뺄 수 있어요', async () => {
    await seed(`users/${ME.email}`, { userEmail: ME.email, posts: ['post-1', 'post-2'] });

    await assertSucceeds(
      updateDoc(doc(verifiedDb(ME), 'users', ME.email), { posts: arrayRemove('post-1') })
    );
  });

  test('posts 외의 필드는 바꿀 수 없어요', async () => {
    await seed(`users/${ME.email}`, { userEmail: ME.email, posts: [] });

    await assertFails(
      updateDoc(doc(verifiedDb(ME), 'users', ME.email), { userEmail: OTHER.email })
    );
  });

  test('다른 사람 문서의 posts는 바꿀 수 없어요', async () => {
    await seed(`users/${OTHER.email}`, { userEmail: OTHER.email, posts: [] });

    await assertFails(
      updateDoc(doc(verifiedDb(ME), 'users', OTHER.email), { posts: arrayUnion('post-1') })
    );
  });

  test('탈퇴할 때 내 사용자 문서를 지울 수 있어요', async () => {
    await seed(`users/${ME.email}`, { userEmail: ME.email, posts: [] });

    await assertSucceeds(deleteDoc(doc(verifiedDb(ME), 'users', ME.email)));
  });

  test('이메일 인증 전이어도 내 사용자 문서는 지울 수 있어요', async () => {
    await seed(`users/${ME.email}`, { userEmail: ME.email, posts: [] });

    await assertSucceeds(deleteDoc(doc(unverifiedDb(ME), 'users', ME.email)));
  });

  test('다른 사람 사용자 문서는 지울 수 없어요', async () => {
    await seed(`users/${OTHER.email}`, { userEmail: OTHER.email, posts: [] });

    await assertFails(deleteDoc(doc(verifiedDb(ME), 'users', OTHER.email)));
    await assertFails(deleteDoc(doc(guestDb(), 'users', OTHER.email)));
  });
});

describe('posts/{postId}', () => {
  test('인증한 사용자는 내 글을 쓸 수 있어요', async () => {
    await assertSucceeds(addDoc(collection(verifiedDb(ME), 'posts'), newPost(ME.email)));
  });

  test('이메일 인증 전에는 글을 쓸 수 없어요', async () => {
    await assertFails(addDoc(collection(unverifiedDb(ME), 'posts'), newPost(ME.email)));
  });

  test('로그인하지 않으면 글을 쓸 수 없어요', async () => {
    await assertFails(addDoc(collection(guestDb(), 'posts'), newPost(ME.email)));
  });

  test('writer를 다른 사람으로 해서 쓸 수 없어요', async () => {
    await assertFails(addDoc(collection(verifiedDb(ME), 'posts'), newPost(OTHER.email)));
  });

  test('필드 타입이 틀리거나 정해지지 않은 필드가 있으면 쓸 수 없어요', async () => {
    const db = verifiedDb(ME);
    await assertFails(addDoc(collection(db, 'posts'), newPost(ME.email, { title: 123 })));
    await assertFails(addDoc(collection(db, 'posts'), newPost(ME.email, { createdAt: 'now' })));
    await assertFails(addDoc(collection(db, 'posts'), newPost(ME.email, { extra: true })));
  });

  test('내 글은 읽을 수 있고 다른 사람 글은 읽을 수 없어요', async () => {
    await seed('posts/mine', newPost(ME.email));
    await seed('posts/theirs', newPost(OTHER.email));

    await assertSucceeds(getDoc(doc(verifiedDb(ME), 'posts', 'mine')));
    await assertFails(getDoc(doc(verifiedDb(ME), 'posts', 'theirs')));
    await assertFails(getDoc(doc(unverifiedDb(ME), 'posts', 'mine')));
  });

  test('앱의 목록 쿼리(writer == 내 이메일)는 되고, 조건 없는 목록 조회는 안 돼요', async () => {
    await seed('posts/mine', newPost(ME.email));
    await seed('posts/theirs', newPost(OTHER.email));
    const db = verifiedDb(ME);

    await assertSucceeds(
      getDocs(
        query(
          collection(db, 'posts'),
          where('writer', '==', ME.email),
          orderBy('createdAt', 'desc')
        )
      )
    );
    await assertFails(getDocs(collection(db, 'posts')));
    await assertFails(getDocs(query(collection(db, 'posts'), where('writer', '==', OTHER.email))));
  });

  test('내 글은 수정할 수 있지만 writer를 바꿀 수는 없어요', async () => {
    await seed('posts/mine', newPost(ME.email));
    const db = verifiedDb(ME);

    await assertSucceeds(setDoc(doc(db, 'posts', 'mine'), newPost(ME.email, { title: '수정' })));
    await assertFails(setDoc(doc(db, 'posts', 'mine'), newPost(OTHER.email)));
  });

  test('탈퇴할 때 내 글을 모두 찾아 지울 수 있어요', async () => {
    await seed('posts/mine-1', newPost(ME.email));
    await seed('posts/mine-2', newPost(ME.email));
    const db = verifiedDb(ME);

    const myPosts = await assertSucceeds(
      getDocs(query(collection(db, 'posts'), where('writer', '==', ME.email)))
    );
    for (const post of myPosts.docs) {
      await assertSucceeds(deleteDoc(post.ref));
    }
  });

  test('createdAt을 빼고 수정하면 원래 값이 그대로 남아요', async () => {
    const createdAt = new Date('2026-01-01T00:00:00Z');
    await seed('posts/mine', newPost(ME.email, { createdAt }));
    const db = verifiedDb(ME);
    const { createdAt: _, ...withoutCreatedAt } = newPost(ME.email, { title: '수정' });

    await assertSucceeds(updateDoc(doc(db, 'posts', 'mine'), withoutCreatedAt));
    const updated = await getDoc(doc(db, 'posts', 'mine'));
    assert.equal(updated.data().title, '수정');
    assert.equal(updated.data().createdAt.toMillis(), createdAt.getTime());
  });

  test('내 글 하나를 지울 수 있어요', async () => {
    await seed('posts/mine', newPost(ME.email));

    await assertSucceeds(deleteDoc(doc(verifiedDb(ME), 'posts', 'mine')));
  });

  test('다른 사람 글은 수정 · 삭제할 수 없어요', async () => {
    await seed('posts/theirs', newPost(OTHER.email));
    const db = verifiedDb(ME);

    await assertFails(updateDoc(doc(db, 'posts', 'theirs'), { title: '수정' }));
    await assertFails(deleteDoc(doc(db, 'posts', 'theirs')));
  });
});
