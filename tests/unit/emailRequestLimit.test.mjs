import assert from 'node:assert/strict';
import { test } from 'node:test';

import { canResendEmail, formatRetryTime } from '../../lib/emailRequestLimit.js';

test('canResendEmail: 제한 시각이 지나면 보낼 수 있음', () => {
  const limit = new Date(2026, 10, 3, 15, 0, 0);
  assert.equal(canResendEmail(limit, new Date(2026, 10, 3, 14, 59, 59)), false);
  assert.equal(canResendEmail(limit, new Date(2026, 10, 3, 15, 0, 0)), true);
  assert.equal(canResendEmail(limit, new Date(2026, 10, 3, 15, 30, 0)), true);
});

test('canResendEmail: 저장된 시각이 없거나 잘못되면 보낼 수 있음', () => {
  assert.equal(canResendEmail(null), true);
  assert.equal(canResendEmail(new Date('잘못된 값')), true);
});

test('formatRetryTime: 오전 · 오후와 12시', () => {
  assert.equal(formatRetryTime(new Date(2026, 10, 3, 9, 5, 0)), '오전 9시 5분');
  assert.equal(formatRetryTime(new Date(2026, 10, 3, 15, 5, 0)), '오후 3시 5분');
  assert.equal(formatRetryTime(new Date(2026, 10, 3, 0, 10, 0)), '오전 12시 10분');
  assert.equal(formatRetryTime(new Date(2026, 10, 3, 12, 0, 0)), '오후 12시');
});

test('formatRetryTime: 초가 있으면 분을 올림', () => {
  assert.equal(formatRetryTime(new Date(2026, 10, 3, 15, 5, 30)), '오후 3시 6분');
  assert.equal(formatRetryTime(new Date(2026, 10, 3, 15, 59, 1)), '오후 4시');
  assert.equal(formatRetryTime(new Date(2026, 10, 3, 23, 59, 30)), '오전 12시');
});

test('formatRetryTime: 받은 Date를 바꾸지 않음', () => {
  const limit = new Date(2026, 10, 3, 15, 5, 30);
  formatRetryTime(limit);
  assert.equal(limit.getSeconds(), 30);
});
