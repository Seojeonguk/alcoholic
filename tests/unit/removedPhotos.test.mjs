import assert from 'node:assert/strict';
import { test } from 'node:test';

import { getRemovedPhotos } from '../../lib/removedPhotos.js';

test('고친 글에서 빠진 사진만 돌려줌', () => {
  assert.deepEqual(getRemovedPhotos(['a', 'b', 'c'], ['a', 'c', 'd']), ['b']);
});

test('사진을 그대로 두거나 순서만 바꾸면 지울 사진이 없음', () => {
  assert.deepEqual(getRemovedPhotos(['a', 'b'], ['b', 'a']), []);
});

test('사진을 모두 빼면 전부 돌려줌', () => {
  assert.deepEqual(getRemovedPhotos(['a', 'b'], []), ['a', 'b']);
});

test('사진 필드가 없던 예전 글도 에러 없이 처리함', () => {
  assert.deepEqual(getRemovedPhotos(undefined, ['a']), []);
  assert.deepEqual(getRemovedPhotos(['a'], undefined), ['a']);
});
