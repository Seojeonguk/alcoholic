import assert from 'node:assert/strict';
import { test } from 'node:test';

import { splitStoredPhotos, toPostData } from '../../lib/postSave.js';

const ok = (value) => ({ status: 'fulfilled', value });
const fail = (reason) => ({ status: 'rejected', reason });
const isStored = (uri) => uri.startsWith('https://');

test('toPostData: 폼에서 글 내용만 꺼내고 사진은 저장한 주소로 바꿔요', () => {
  const form = {
    title: '맥주',
    day: '2026-11-08',
    photos: ['file:///a.jpg'],
    content: '내용',
    location: '집',
    tags: ['맥주'],
    extra: '들어가지 않음',
  };
  assert.deepEqual(toPostData(form, ['https://x/a']), {
    title: '맥주',
    day: '2026-11-08',
    photos: ['https://x/a'],
    content: '내용',
    location: '집',
    tags: ['맥주'],
  });
});

test('splitStoredPhotos: 모두 성공하면 순서대로 주소를 돌려주고 새로 저장한 사진만 따로 모아요', () => {
  const uris = ['https://old/1', 'file:///new.jpg'];
  const result = splitStoredPhotos(uris, [ok('https://old/1'), ok('https://new/2')], isStored);
  assert.deepEqual(result.photos, ['https://old/1', 'https://new/2']);
  assert.deepEqual(result.newPhotos, ['https://new/2']);
  assert.equal(result.failed, false);
  assert.equal(result.error, undefined);
});

test('splitStoredPhotos: 하나가 실패하면 실패 이유와 함께 성공한 새 사진을 지울 수 있게 돌려줘요', () => {
  const error = new Error('timeout');
  const uris = ['file:///a.jpg', 'file:///b.jpg', 'https://old/1'];
  const result = splitStoredPhotos(
    uris,
    [ok('https://new/a'), fail(error), ok('https://old/1')],
    isStored
  );
  assert.equal(result.failed, true);
  assert.equal(result.error, error);
  assert.deepEqual(result.newPhotos, ['https://new/a']);
  assert.deepEqual(result.photos, ['https://new/a', null, 'https://old/1']);
});

test('splitStoredPhotos: 실패 이유가 없어도 실패로 봐요', () => {
  const result = splitStoredPhotos(['file:///a.jpg'], [fail(undefined)], isStored);
  assert.equal(result.failed, true);
});

test('splitStoredPhotos: 사진이 없으면 빈 목록이에요', () => {
  assert.deepEqual(splitStoredPhotos([], [], isStored), {
    photos: [],
    newPhotos: [],
    failed: false,
    error: undefined,
  });
});
