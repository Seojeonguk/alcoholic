import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  backupMessage,
  claimPosts,
  getAppMode,
  parseLocalPosts,
  photoIdFromUri,
  postsToMigrate,
  readStoredPosts,
  toGalleryItems,
  toPhotoName,
  toRemotePost,
} from '../../lib/guestPosts.js';

const post = (overrides = {}) => ({
  id: 'id',
  title: '제목',
  day: '2026-11-01',
  photos: [],
  content: '내용',
  location: '',
  tags: [],
  createdAt: 0,
  owner: null,
  ...overrides,
});

test('getAppMode: 인증된 로그인이 있으면 비회원 표시가 있어도 회원이에요', () => {
  assert.equal(getAppMode({ hasVerifiedUser: true, guestFlag: true }), 'member');
  assert.equal(getAppMode({ hasVerifiedUser: true, guestFlag: false }), 'member');
});

test('getAppMode: 인증 전 계정만 있고 비회원 표시가 있으면 비회원이에요', () => {
  assert.equal(getAppMode({ hasVerifiedUser: false, guestFlag: true }), 'guest');
});

test('getAppMode: 둘 다 없으면 처음이에요', () => {
  assert.equal(getAppMode({ hasVerifiedUser: false, guestFlag: false }), 'start');
});

test('parseLocalPosts: 파일이 없으면 빈 목록이에요', () => {
  assert.deepEqual(parseLocalPosts(null), []);
});

test('parseLocalPosts: 파일은 있는데 비어 있으면 빈 목록으로 보지 않고 에러를 던져요', () => {
  assert.throws(() => parseLocalPosts(''));
});

test('readStoredPosts: 원래 파일이 있으면 그것을 읽어요', () => {
  const main = [post({ id: 'main' })];
  const tmp = [post({ id: 'tmp' })];
  assert.deepEqual(readStoredPosts({ main: JSON.stringify(main), tmp: JSON.stringify(tmp) }), main);
});

test('readStoredPosts: 바꾸는 중에 꺼져서 원래 파일이 없으면 임시 파일에서 되살려요', () => {
  const tmp = [post({ id: 'tmp' })];
  assert.deepEqual(readStoredPosts({ main: null, tmp: JSON.stringify(tmp) }), tmp);
});

test('readStoredPosts: 둘 다 없으면 빈 목록이에요', () => {
  assert.deepEqual(readStoredPosts({ main: null, tmp: null }), []);
});

test('toPhotoName: 기기 경로가 바뀌어도 쓸 수 있게 사진은 파일 이름으로 저장해요', () => {
  assert.equal(toPhotoName('file:///old-uuid/Documents/guest/photos/a.jpg'), 'a.jpg');
  assert.equal(toPhotoName('a.jpg'), 'a.jpg');
});

test('parseLocalPosts: 저장한 글 목록을 그대로 읽어요', () => {
  const posts = [post({ id: 'a' })];
  assert.deepEqual(parseLocalPosts(JSON.stringify(posts)), posts);
});

test('parseLocalPosts: 깨진 파일은 빈 목록으로 보지 않고 에러를 던져요', () => {
  assert.throws(() => parseLocalPosts('{"id":'));
  assert.throws(() => parseLocalPosts('{"id":"a"}'));
});

test('toGalleryItems: 주인 없는 글만 최근에 쓴 순서로 갤러리 모양으로 바꿔요', () => {
  const items = toGalleryItems(
    [
      post({ id: 'a', createdAt: 1, photos: ['1.jpg'], tags: ['맥주'] }),
      post({ id: 'b', createdAt: 2, photos: [] }),
      post({ id: 'c', createdAt: 3, owner: 'uid-a' }),
    ],
    (name) => `file:///p/${name}`
  );
  assert.deepEqual(
    items.map((item) => item.docId),
    ['b', 'a']
  );
  assert.equal(items[0].presentivePhoto, null);
  assert.deepEqual(items[1], {
    docId: 'a',
    presentivePhoto: 'file:///p/1.jpg',
    day: '2026-11-01',
    title: '제목',
    tags: ['맥주'],
    createdAt: 1,
  });
});

test('claimPosts · postsToMigrate: 처음 옮기기 시작한 계정의 글만 옮겨요', () => {
  const claimed = claimPosts([post({ id: 'a' }), post({ id: 'b', owner: 'uid-a' })], 'uid-b');
  assert.deepEqual(
    claimed.map((p) => p.owner),
    ['uid-b', 'uid-a']
  );
  assert.deepEqual(
    postsToMigrate(claimed, 'uid-b').map((p) => p.id),
    ['a']
  );
  assert.deepEqual(
    postsToMigrate(claimed, 'uid-a').map((p) => p.id),
    ['b']
  );
});

test('photoIdFromUri: 파일 이름을 사진 ID로 써요', () => {
  assert.equal(photoIdFromUri('file:///data/guest/photos/abc.jpg'), 'abc.jpg');
});

test('toRemotePost: writer와 Date createdAt을 넣고 id · owner는 빼요', () => {
  const remote = toRemotePost(post({ id: 'a', owner: 'u', createdAt: 1000 }), 'me@example.com', [
    'https://x',
  ]);
  assert.equal(remote.writer, 'me@example.com');
  assert.deepEqual(remote.photos, ['https://x']);
  assert.ok(remote.createdAt instanceof Date && remote.createdAt.getTime() === 1000);
  assert.equal('id' in remote || 'owner' in remote, false);
});

test('backupMessage: 기기에 기록이 있으면 개수와 함께 그대로 있다고 알려요', () => {
  assert.equal(
    backupMessage(12),
    '이 기기에 있는 기록 12개는 그대로 있어요. 가입하거나 로그인하면 계정으로 옮겨요.'
  );
});

test('backupMessage: 기록이 없으면 앞으로 남길 기록이 계정에 저장된다고 알려요', () => {
  assert.equal(backupMessage(0), '가입하거나 로그인하면 앞으로 남기는 기록이 계정에 저장돼요.');
});
