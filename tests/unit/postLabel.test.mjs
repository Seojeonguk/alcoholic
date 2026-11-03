import assert from 'node:assert/strict';
import { test } from 'node:test';

import { getPostLabel } from '../../lib/postLabel.js';

test('getPostLabel: 월 · 일을 앞의 0 없이', () => {
  assert.equal(getPostLabel('2026-11-02'), '11월 2일 기록');
  assert.equal(getPostLabel('2026-01-30'), '1월 30일 기록');
});

test('getPostLabel: 날짜가 없거나 형식이 다르면 기록', () => {
  assert.equal(getPostLabel(undefined), '기록');
  assert.equal(getPostLabel(''), '기록');
  assert.equal(getPostLabel('11/02'), '기록');
});
