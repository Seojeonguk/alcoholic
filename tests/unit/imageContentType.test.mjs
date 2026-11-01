import assert from 'node:assert/strict';
import { test } from 'node:test';

import { getImageContentType } from '../../lib/imageContentType.js';

test('getImageContentType: 확장자로 이미지 형식을 정해요', () => {
  assert.equal(getImageContentType('file:///cache/a.png'), 'image/png');
  assert.equal(getImageContentType('file:///cache/a.WEBP'), 'image/webp');
  assert.equal(getImageContentType('file:///cache/a.heic'), 'image/heic');
  assert.equal(getImageContentType('file:///cache/a.jpeg'), 'image/jpeg');
});

test('getImageContentType: 모르는 확장자나 쿼리가 붙어도 JPEG로 봐요', () => {
  assert.equal(getImageContentType('file:///cache/a'), 'image/jpeg');
  assert.equal(getImageContentType('content://media/external/images/123'), 'image/jpeg');
  assert.equal(getImageContentType('file:///cache/a.gif?x=1'), 'image/gif');
});
