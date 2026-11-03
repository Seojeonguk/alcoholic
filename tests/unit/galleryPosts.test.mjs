import assert from 'node:assert/strict';
import { test } from 'node:test';

import { memberEmail, toGalleryPost } from '../../lib/galleryPosts.js';

test('memberEmail: 인증을 마친 계정이면 이메일을 돌려줘요', () => {
  assert.equal(memberEmail({ emailVerified: true, email: 'a@b.c' }), 'a@b.c');
});

test('memberEmail: 인증 전 · 로그아웃 · 이메일 없는 계정은 null이에요', () => {
  assert.equal(memberEmail({ emailVerified: false, email: 'a@b.c' }), null);
  assert.equal(memberEmail(null), null);
  assert.equal(memberEmail(undefined), null);
  assert.equal(memberEmail({ emailVerified: true, email: null }), null);
});

test('toGalleryPost: 첫 사진 · 날짜 · 태그 · 작성 시각을 꺼내요', () => {
  const data = {
    photos: ['p1', 'p2'],
    day: '2026-10-01',
    tags: ['맥주'],
    createdAt: { toMillis: () => 1000 },
    title: '보이지 않는 값',
  };
  assert.deepEqual(toGalleryPost('id1', data), {
    docId: 'id1',
    presentivePhoto: 'p1',
    day: '2026-10-01',
    tags: ['맥주'],
    createdAt: 1000,
  });
});

test('toGalleryPost: createdAt이 Date여도 밀리초로 바꿔요', () => {
  assert.equal(toGalleryPost('id', { createdAt: new Date(2000) }).createdAt, 2000);
});

test('toGalleryPost: 사진 · 태그 · 작성 시각이 없으면 기본값을 써요', () => {
  assert.deepEqual(toGalleryPost('id2', {}), {
    docId: 'id2',
    presentivePhoto: null,
    day: undefined,
    tags: [],
    createdAt: 0,
  });
  assert.equal(toGalleryPost('id3', undefined).createdAt, 0);
});
