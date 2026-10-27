import assert from 'node:assert/strict';
import { test } from 'node:test';

import { getResizeTarget } from '../../lib/photoResize.js';

test('getResizeTarget: 가로 사진은 너비를 1600으로', () => {
  assert.deepEqual(getResizeTarget(4032, 3024), { width: 1600 });
});

test('getResizeTarget: 세로 사진은 높이를 1600으로', () => {
  assert.deepEqual(getResizeTarget(3024, 4032), { height: 1600 });
});

test('getResizeTarget: 1600 이하는 그대로', () => {
  assert.equal(getResizeTarget(1600, 1200), null);
  assert.equal(getResizeTarget(800, 600), null);
});

test('getResizeTarget: 크기를 모르면 그대로', () => {
  assert.equal(getResizeTarget(undefined, 0), null);
});
