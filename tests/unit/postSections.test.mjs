import assert from 'node:assert/strict';
import { test } from 'node:test';

import { formatMonthTitle, groupPostsByMonth, sortPostsByDay } from '../../lib/postSections.js';

const NOW = new Date('2026-10-26T12:00:00');
const p = (docId, day, createdAt) => ({ docId, day, createdAt });

test('sortPostsByDay: 마신 날짜 내림차순, 같은 날은 최근 작성순', () => {
  const sorted = sortPostsByDay([
    p('a', '2026-09-30', 5),
    p('b', '2026-10-01', 1),
    p('c', '2026-10-01', 3),
  ]);
  assert.deepEqual(
    sorted.map((x) => x.docId),
    ['c', 'b', 'a']
  );
});

test('formatMonthTitle: 올해는 월만, 다른 해는 연도 포함', () => {
  assert.equal(formatMonthTitle('2026-10-03', NOW), '10월');
  assert.equal(formatMonthTitle('2025-12-31', NOW), '2025년 12월');
});

test('groupPostsByMonth: 월별로 묶고 최근 달이 먼저', () => {
  const sections = groupPostsByMonth(
    [p('a', '2026-09-30', 9), p('b', '2026-10-01', 1), p('c', '2026-10-20', 2)],
    NOW
  );
  assert.deepEqual(
    sections.map((s) => [s.title, s.data.map((x) => x.docId)]),
    [
      ['10월', ['c', 'b']],
      ['9월', ['a']],
    ]
  );
});

test('groupPostsByMonth: day가 없거나 잘못되면 날짜 없음 묶음', () => {
  const sections = groupPostsByMonth(
    [p('a', undefined, 1), p('b', '2026-10-01', 2), p('c', '10/01', 3)],
    NOW
  );
  assert.deepEqual(
    sections.map((s) => [s.title, s.data.map((x) => x.docId)]),
    [
      ['10월', ['b']],
      ['날짜 없음', ['c', 'a']],
    ]
  );
});
