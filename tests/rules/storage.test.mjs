import { readFileSync } from 'node:fs';
import { after, before, beforeEach, describe, test } from 'node:test';

import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
} from '@firebase/rules-unit-testing';
import { deleteObject, getBytes, listAll, ref, uploadBytes } from 'firebase/storage';

const ME = { uid: 'me-uid', email: 'me@example.com' };
const OTHER = { uid: 'other-uid', email: 'other@example.com' };
const IMAGE = new Uint8Array([0xff, 0xd8, 0xff, 0xe0]);
const JPEG = { contentType: 'image/jpeg' };

let testEnv;

const verifiedStorage = (user) =>
  testEnv.authenticatedContext(user.uid, { email: user.email, email_verified: true }).storage();
const unverifiedStorage = (user) =>
  testEnv.authenticatedContext(user.uid, { email: user.email, email_verified: false }).storage();
const guestStorage = () => testEnv.unauthenticatedContext().storage();

// 보안 규칙을 건너뛰고 테스트 파일을 넣음
const seed = (path) =>
  testEnv.withSecurityRulesDisabled((ctx) => uploadBytes(ref(ctx.storage(), path), IMAGE, JPEG));

before(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: 'demo-alcoholic',
    storage: { rules: readFileSync('storage.rules', 'utf8') },
  });
});

beforeEach(async () => {
  await testEnv.clearStorage();
});

after(async () => {
  await testEnv.cleanup();
});

describe('posts/{uid}/{fileId}', () => {
  test('인증한 사용자는 내 폴더에 이미지를 올릴 수 있어요', async () => {
    await assertSucceeds(
      uploadBytes(ref(verifiedStorage(ME), `posts/${ME.uid}/a.jpg`), IMAGE, JPEG)
    );
  });

  test('다른 사람 폴더에는 올릴 수 없어요', async () => {
    await assertFails(
      uploadBytes(ref(verifiedStorage(ME), `posts/${OTHER.uid}/a.jpg`), IMAGE, JPEG)
    );
  });

  test('이메일 인증 전이거나 로그인하지 않으면 올릴 수 없어요', async () => {
    await assertFails(
      uploadBytes(ref(unverifiedStorage(ME), `posts/${ME.uid}/a.jpg`), IMAGE, JPEG)
    );
    await assertFails(uploadBytes(ref(guestStorage(), `posts/${ME.uid}/a.jpg`), IMAGE, JPEG));
  });

  test('이미지가 아닌 파일은 올릴 수 없어요', async () => {
    await assertFails(
      uploadBytes(ref(verifiedStorage(ME), `posts/${ME.uid}/a.txt`), IMAGE, {
        contentType: 'text/plain',
      })
    );
  });

  test('10MB 이상은 올릴 수 없어요', async () => {
    const big = new Uint8Array(10 * 1024 * 1024);
    await assertFails(uploadBytes(ref(verifiedStorage(ME), `posts/${ME.uid}/big.jpg`), big, JPEG));
  });

  test('올린 사진을 덮어쓸 수 없어요', async () => {
    await seed(`posts/${ME.uid}/a.jpg`);
    await assertFails(uploadBytes(ref(verifiedStorage(ME), `posts/${ME.uid}/a.jpg`), IMAGE, JPEG));
  });

  test('로그인한 사용자는 읽을 수 있고, 로그인하지 않으면 읽을 수 없어요', async () => {
    await seed(`posts/${ME.uid}/a.jpg`);
    await assertSucceeds(getBytes(ref(verifiedStorage(ME), `posts/${ME.uid}/a.jpg`)));
    await assertFails(getBytes(ref(guestStorage(), `posts/${ME.uid}/a.jpg`)));
  });

  test('탈퇴할 때 내 폴더의 사진을 모두 찾아 지울 수 있어요', async () => {
    await seed(`posts/${ME.uid}/a.jpg`);
    await seed(`posts/${ME.uid}/b.jpg`);
    const storage = verifiedStorage(ME);

    const { items } = await assertSucceeds(listAll(ref(storage, `posts/${ME.uid}`)));
    for (const item of items) {
      await assertSucceeds(deleteObject(item));
    }
  });

  test('다른 사람 폴더의 사진은 지울 수 없어요', async () => {
    await seed(`posts/${OTHER.uid}/a.jpg`);
    await assertFails(deleteObject(ref(verifiedStorage(ME), `posts/${OTHER.uid}/a.jpg`)));
    await assertFails(deleteObject(ref(guestStorage(), `posts/${OTHER.uid}/a.jpg`)));
  });
});

describe('예전 경로와 기본 이미지', () => {
  test('예전 사진(posts/{파일})은 읽을 수만 있어요', async () => {
    await seed('posts/old.jpg');
    await assertSucceeds(getBytes(ref(verifiedStorage(ME), 'posts/old.jpg')));
    await assertFails(uploadBytes(ref(verifiedStorage(ME), 'posts/new.jpg'), IMAGE, JPEG));
    await assertFails(deleteObject(ref(verifiedStorage(ME), 'posts/old.jpg')));
  });

  test('기본 이미지는 읽을 수만 있어요', async () => {
    await seed('default.jfif');
    await assertSucceeds(getBytes(ref(verifiedStorage(ME), 'default.jfif')));
    await assertFails(uploadBytes(ref(verifiedStorage(ME), 'default.jfif'), IMAGE, JPEG));
  });

  test('그 밖의 경로에는 올릴 수 없어요', async () => {
    await assertFails(uploadBytes(ref(verifiedStorage(ME), 'anything.jpg'), IMAGE, JPEG));
  });
});
