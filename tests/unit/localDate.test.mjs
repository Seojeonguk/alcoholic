import assert from 'node:assert/strict';
import { test } from 'node:test';

import { toLocalDateString } from '../../lib/localDate.js';

test('toLocalDateString: 기기 시간대의 날짜를 YYYY-MM-DD로 돌려줘요', () => {
  assert.equal(toLocalDateString(new Date(2026, 10, 8, 12)), '2026-11-08');
});

test('toLocalDateString: 자정 직후에도 그날 날짜예요(UTC로 바꾸지 않음)', () => {
  assert.equal(toLocalDateString(new Date(2026, 0, 1, 0, 30)), '2026-01-01');
});

test('toLocalDateString: 한 자리 월 · 일은 0을 붙여요', () => {
  assert.equal(toLocalDateString(new Date(2026, 2, 5)), '2026-03-05');
});

test('toLocalDateString: 인자가 없으면 오늘 날짜예요', () => {
  const now = new Date();
  assert.equal(toLocalDateString(), toLocalDateString(now));
});
