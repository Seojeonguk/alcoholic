import assert from 'node:assert/strict';
import { test } from 'node:test';

import { addUniqueTag } from '../../lib/tags.js';

test('addUniqueTag: 앞뒤 공백과 앞의 #을 떼고 넣어요', () => {
  assert.deepEqual(addUniqueTag([], '  #맥주 '), ['맥주']);
  assert.deepEqual(addUniqueTag(['소주'], '##와인'), ['소주', '와인']);
});

test('addUniqueTag: 이미 있는 태그는 다시 넣지 않아요', () => {
  assert.deepEqual(addUniqueTag(['맥주'], '맥주'), ['맥주']);
  assert.deepEqual(addUniqueTag(['맥주'], ' #맥주  '), ['맥주']);
});

test('addUniqueTag: 빈 태그는 넣지 않아요', () => {
  assert.deepEqual(addUniqueTag(['맥주'], '   '), ['맥주']);
  assert.deepEqual(addUniqueTag(['맥주'], '#'), ['맥주']);
});

test('addUniqueTag: 원래 배열은 바꾸지 않아요', () => {
  const tags = ['맥주'];
  addUniqueTag(tags, '소주');
  assert.deepEqual(tags, ['맥주']);
});
