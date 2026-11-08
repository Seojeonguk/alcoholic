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
  setLogLevel,
  updateDoc,
  where,
} from 'firebase/firestore';

import { DRINK_TYPES, MAX_RATING } from '../../constants/drinkTypes.js';
import { POST_LIMITS } from '../../constants/postLimits.js';
import { toRemotePost } from '../../lib/guestPosts.js';

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
  // assertFails로 일부러 거절당하는 요청마다 SDK가 PERMISSION_DENIED 경고를 찍어 출력을 가림. 결과는 node:test가 알려 줌
  setLogLevel('error');
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
    await assertSucceeds(setDoc(doc(unverifiedDb(ME), 'users', ME.email), { userEmail: ME.email }));
  });

  test('앱처럼 빈 posts를 함께 넣어 만들 수도 있어요', async () => {
    await assertSucceeds(
      setDoc(doc(unverifiedDb(ME), 'users', ME.email), { userEmail: ME.email, posts: [] })
    );
  });

  test('글 ID가 든 posts로는 만들 수 없어요', async () => {
    await assertFails(
      setDoc(doc(unverifiedDb(ME), 'users', ME.email), { userEmail: ME.email, posts: ['post-1'] })
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

  // 글 ID 목록(posts)은 더는 쓰지 않으므로 사용자 문서는 고칠 수 없음(#292)
  test('내 문서의 posts에 글 ID를 추가할 수 없어요', async () => {
    await seed(`users/${ME.email}`, { userEmail: ME.email, posts: [] });

    await assertFails(
      updateDoc(doc(verifiedDb(ME), 'users', ME.email), { posts: arrayUnion('post-1') })
    );
  });

  test('이미 있는 posts에서 글 ID를 뺄 수도 없어요', async () => {
    await seed(`users/${ME.email}`, { userEmail: ME.email, posts: ['post-1', 'post-2'] });

    await assertFails(
      updateDoc(doc(verifiedDb(ME), 'users', ME.email), { posts: arrayRemove('post-1') })
    );
  });

  test('내 문서의 다른 필드도 바꿀 수 없어요', async () => {
    await seed(`users/${ME.email}`, { userEmail: ME.email });

    await assertFails(
      updateDoc(doc(verifiedDb(ME), 'users', ME.email), { userEmail: OTHER.email })
    );
  });

  test('posts가 남아 있는 예전 문서도 읽고 지울 수 있어요', async () => {
    await seed(`users/${ME.email}`, { userEmail: ME.email, posts: ['post-1'] });

    await assertSucceeds(getDoc(doc(verifiedDb(ME), 'users', ME.email)));
    await assertSucceeds(deleteDoc(doc(verifiedDb(ME), 'users', ME.email)));
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
  // 비회원 기록 옮기기(#201): 기기 글 ID를 문서 ID로 써서 다시 시도해도 같은 문서에 씀
  test('옮길 때 정한 문서 ID로 내 글을 만들고, 다시 시도하면 같은 문서에 덮어쓸 수 있어요', async () => {
    const ref = doc(verifiedDb(ME), 'posts/guest-uuid-1');
    await assertSucceeds(setDoc(ref, newPost(ME.email)));
    await assertSucceeds(setDoc(ref, newPost(ME.email)));
  });

  test('다른 사람이 정한 문서 ID로 옮긴 글에 다시 쓸 수 없어요', async () => {
    await seed('posts/guest-uuid-2', newPost(OTHER.email));
    await assertFails(setDoc(doc(verifiedDb(ME), 'posts/guest-uuid-2'), newPost(ME.email)));
  });

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

  describe('글 길이 제한', () => {
    const write = (overrides) =>
      addDoc(collection(verifiedDb(ME), 'posts'), newPost(ME.email, overrides));
    const text = (length) => '가'.repeat(length);
    const list = (count, item) => Array.from({ length: count }, (_, i) => `${item}${i}`);

    test('상한까지는 쓸 수 있어요', async () => {
      await assertSucceeds(
        write({
          title: text(POST_LIMITS.TITLE),
          content: text(POST_LIMITS.CONTENT),
          location: text(POST_LIMITS.LOCATION),
          tags: list(POST_LIMITS.TAGS, '태'),
          photos: list(POST_LIMITS.PHOTOS, 'https://example.com/'),
        })
      );
      await assertSucceeds(write({ tags: [text(POST_LIMITS.TAG_LENGTH), '맥주'] }));
    });

    test('제목 · 내용 · 장소가 상한보다 길면 쓸 수 없어요', async () => {
      await assertFails(write({ title: text(POST_LIMITS.TITLE + 1) }));
      await assertFails(write({ content: text(POST_LIMITS.CONTENT + 1) }));
      await assertFails(write({ location: text(POST_LIMITS.LOCATION + 1) }));
    });

    test('태그 · 사진이 상한보다 많으면 쓸 수 없어요', async () => {
      await assertFails(write({ tags: list(POST_LIMITS.TAGS + 1, '태') }));
      await assertFails(write({ photos: list(POST_LIMITS.PHOTOS + 1, 'https://example.com/') }));
    });

    test('태그 하나가 상한보다 길거나 비어 있으면 쓸 수 없어요', async () => {
      await assertFails(write({ tags: ['맥주', text(POST_LIMITS.TAG_LENGTH + 1)] }));
      await assertFails(write({ tags: [text(POST_LIMITS.TAG_LENGTH + 1)] }));
      await assertFails(write({ tags: ['맥주', ''] }));
    });

    test('날짜는 YYYY-MM-DD 형식만 쓸 수 있어요', async () => {
      await assertSucceeds(write({ day: '2026-01-01' }));
      await assertSucceeds(write({ day: '1999-12-31' }));
      for (const day of [
        '',
        '2026-1-1',
        '2026/01/01',
        '2026-13-01',
        '2026-00-10',
        '2026-01-32',
        '2026-01-01 ',
        '2026-01-01' + '0'.repeat(1000),
        20260101,
      ]) {
        await assertFails(write({ day }));
      }
    });

    test('사진은 비어 있지 않은 1000자 이하 문자열만 쓸 수 있어요', async () => {
      await assertSucceeds(write({ photos: [`https://example.com/${'a'.repeat(980)}`] }));
      await assertFails(write({ photos: [`https://example.com/${'a'.repeat(981)}`] }));
      await assertFails(write({ photos: [''] }));
      await assertFails(write({ photos: [123] }));
      await assertFails(write({ photos: [{ url: 'https://example.com/a' }] }));
      await assertFails(write({ photos: ['https://example.com/a', null] }));
      // 마지막 칸까지 검사하는지
      await assertFails(write({ photos: [...list(POST_LIMITS.PHOTOS - 1, 'https://a/'), 1] }));
    });

    test('비회원 기록을 옮길 때 만드는 글은 규칙을 통과해요', async () => {
      const guestPost = {
        id: 'local-1',
        title: '맥주',
        day: '2026-10-25',
        photos: ['local-1-0.jpg'],
        content: '',
        location: '',
        tags: ['맥주'],
        createdAt: Date.now(),
        owner: ME.uid,
      };
      const url =
        'https://firebasestorage.googleapis.com/v0/b/alcoholic-12345.firebasestorage.app/o/' +
        `posts%2F${ME.uid}%2Flocal-1-0.jpg?alt=media&token=00000000-0000-0000-0000-000000000000`;
      await assertSucceeds(
        setDoc(doc(verifiedDb(ME), 'posts', guestPost.id), toRemotePost(guestPost, ME.email, [url]))
      );
    });

    test('비회원 기록에 별점 · 주종이 있으면 옮길 때도 함께 들어가요', async () => {
      const guestPost = {
        id: 'local-2',
        title: '와인',
        day: '2026-10-25',
        photos: [],
        content: '',
        location: '',
        tags: [],
        rating: 4,
        drinkType: 'wine',
        createdAt: Date.now(),
        owner: ME.uid,
      };
      const db = verifiedDb(ME);
      await assertSucceeds(
        setDoc(doc(db, 'posts', guestPost.id), toRemotePost(guestPost, ME.email, []))
      );
      const saved = (await getDoc(doc(db, 'posts', guestPost.id))).data();
      assert.equal(saved.rating, 4);
      assert.equal(saved.drinkType, 'wine');
    });

    test('상한을 넘는 예전 글은 줄이지 않으면 수정할 수 없지만 지울 수는 있어요', async () => {
      await seed('posts/long', newPost(ME.email, { content: text(POST_LIMITS.CONTENT + 1) }));
      const db = verifiedDb(ME);

      await assertFails(updateDoc(doc(db, 'posts', 'long'), { title: '수정' }));
      await assertSucceeds(updateDoc(doc(db, 'posts', 'long'), { content: '줄임' }));
      await assertSucceeds(deleteDoc(doc(db, 'posts', 'long')));
    });
  });
});

describe('별점 · 주종(#341)', () => {
  const write = (overrides) =>
    addDoc(collection(verifiedDb(ME), 'posts'), newPost(ME.email, overrides));

  test('별점 · 주종 없이도 쓸 수 있어요(예전 글 · 고르지 않은 글)', async () => {
    await assertSucceeds(write({}));
    await assertSucceeds(write({ rating: null, drinkType: null }));
  });

  test('별점은 1~MAX_RATING 정수만 쓸 수 있어요', async () => {
    for (let rating = 1; rating <= MAX_RATING; rating += 1) {
      await assertSucceeds(write({ rating }));
    }
    for (const rating of [0, MAX_RATING + 1, -1, 3.5, '3', true, [3]]) {
      await assertFails(write({ rating }));
    }
  });

  test('주종은 정해 둔 코드만 쓸 수 있어요', async () => {
    for (const { code } of DRINK_TYPES) {
      await assertSucceeds(write({ drinkType: code }));
    }
    for (const drinkType of ['', '맥주', 'BEER', 'vodka', 1, ['beer']]) {
      await assertFails(write({ drinkType }));
    }
  });

  test('수정할 때 별점 · 주종을 넣거나 지울 수 있어요', async () => {
    await seed('posts/old', newPost(ME.email));
    const ref = doc(verifiedDb(ME), 'posts', 'old');
    await assertSucceeds(updateDoc(ref, { rating: 5, drinkType: 'soju' }));
    await assertSucceeds(updateDoc(ref, { rating: null, drinkType: null }));
    await assertFails(updateDoc(ref, { rating: 6 }));
  });
});

describe('갤러리 썸네일(#338)', () => {
  const write = (overrides) =>
    addDoc(collection(verifiedDb(ME), 'posts'), newPost(ME.email, overrides));

  test('썸네일 없이도 쓸 수 있어요(예전 글 · 사진 없는 글)', async () => {
    await assertSucceeds(write({}));
    await assertSucceeds(write({ thumbnail: null }));
  });

  test('썸네일은 비어 있지 않은 1000자 이하 문자열만 쓸 수 있어요', async () => {
    await assertSucceeds(write({ thumbnail: 'https://example.com/t' }));
    await assertSucceeds(write({ thumbnail: `https://example.com/${'a'.repeat(980)}` }));
    for (const thumbnail of ['', `https://example.com/${'a'.repeat(981)}`, 1, ['https://a']]) {
      await assertFails(write({ thumbnail }));
    }
  });

  test('수정할 때 썸네일을 바꾸거나 지울 수 있어요', async () => {
    await seed('posts/old', newPost(ME.email));
    const ref = doc(verifiedDb(ME), 'posts', 'old');
    await assertSucceeds(updateDoc(ref, { thumbnail: 'https://example.com/t' }));
    await assertSucceeds(updateDoc(ref, { thumbnail: null }));
  });

  test('비회원 기록을 옮길 때 썸네일도 함께 넣어요', async () => {
    const guestPost = {
      id: 'local-3',
      title: '맥주',
      day: '2026-10-25',
      photos: ['local-3-0.jpg'],
      content: '',
      location: '',
      tags: [],
      createdAt: Date.now(),
      owner: ME.uid,
    };
    const db = verifiedDb(ME);
    await assertSucceeds(
      setDoc(
        doc(db, 'posts', guestPost.id),
        toRemotePost(guestPost, ME.email, ['https://example.com/p'], 'https://example.com/t')
      )
    );
    assert.equal(
      (await getDoc(doc(db, 'posts', guestPost.id))).data().thumbnail,
      'https://example.com/t'
    );
  });
});
