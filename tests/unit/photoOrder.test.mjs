import assert from 'node:assert/strict';
import { test } from 'node:test';

import { getPhotoMoves, movePhoto } from '../../lib/photoOrder.js';

const photos = ['a', 'b', 'c', 'd'];

test('movePhoto: 사진을 to 자리로 옮기고 나머지 순서는 그대로 둬요', () => {
  assert.deepEqual(movePhoto(photos, 2, 0), ['c', 'a', 'b', 'd']);
  assert.deepEqual(movePhoto(photos, 1, 0), ['b', 'a', 'c', 'd']);
  assert.deepEqual(movePhoto(photos, 1, 2), ['a', 'c', 'b', 'd']);
  assert.deepEqual(movePhoto(photos, 0, 3), ['b', 'c', 'd', 'a']);
});

test('movePhoto: 원래 배열은 바꾸지 않아요', () => {
  const list = [...photos];
  movePhoto(list, 3, 0);
  assert.deepEqual(list, photos);
});

test('movePhoto: 범위를 벗어나거나 같은 자리면 순서를 그대로 둬요', () => {
  assert.deepEqual(movePhoto(photos, 0, 0), photos);
  assert.deepEqual(movePhoto(photos, -1, 0), photos);
  assert.deepEqual(movePhoto(photos, 0, 4), photos);
  assert.deepEqual(movePhoto(photos, 1.5, 0), photos);
  assert.deepEqual(movePhoto(undefined, 0, 1), []);
});

test('getPhotoMoves: 첫 사진은 뒤로만 옮길 수 있어요', () => {
  assert.deepEqual(getPhotoMoves(0, 3), [{ key: 'back', label: '뒤로', to: 1 }]);
});

test('getPhotoMoves: 두 번째 사진은 앞으로가 대표 사진으로와 같아서 한 번만 보여요', () => {
  assert.deepEqual(getPhotoMoves(1, 3), [
    { key: 'cover', label: '대표 사진으로', to: 0 },
    { key: 'back', label: '뒤로', to: 2 },
  ]);
});

test('getPhotoMoves: 가운데 사진은 대표 사진으로 · 앞으로 · 뒤로', () => {
  assert.deepEqual(getPhotoMoves(2, 4), [
    { key: 'cover', label: '대표 사진으로', to: 0 },
    { key: 'forward', label: '앞으로', to: 1 },
    { key: 'back', label: '뒤로', to: 3 },
  ]);
});

test('getPhotoMoves: 마지막 사진은 뒤로가 없어요', () => {
  assert.deepEqual(getPhotoMoves(2, 3), [
    { key: 'cover', label: '대표 사진으로', to: 0 },
    { key: 'forward', label: '앞으로', to: 1 },
  ]);
});

test('getPhotoMoves: 사진이 한 장이거나 범위를 벗어나면 옮길 곳이 없어요', () => {
  assert.deepEqual(getPhotoMoves(0, 1), []);
  assert.deepEqual(getPhotoMoves(3, 3), []);
  assert.deepEqual(getPhotoMoves(-1, 3), []);
});
