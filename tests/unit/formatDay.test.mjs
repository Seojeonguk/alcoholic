import assert from 'node:assert/strict';
import { test } from 'node:test';

import { formatDay } from '../../lib/formatDay.js';

test('formatDay: 점 형식으로', () => {
  assert.equal(formatDay('2026-10-26'), '2026. 10. 26');
});

test('formatDay: 형식이 아니면 그대로', () => {
  assert.equal(formatDay(''), '');
  assert.equal(formatDay('10/26'), '10/26');
});
