import assert from 'node:assert/strict';
import { test } from 'node:test';

import { getAverageRating, getMonthlyCounts, getPostStats } from '../../lib/postStats.js';

const NOW = new Date(2026, 10, 8); // 2026년 11월 8일(기기 시간대)

test('getMonthlyCounts: 이번 달까지 최근 12개월의 기록 수를 오래된 달부터 세요', () => {
  const months = getMonthlyCounts(
    [
      { day: '2026-11-01' },
      { day: '2026-11-30' },
      { day: '2026-10-15' },
      { day: '2025-12-31' },
      { day: '2025-11-30' }, // 12개월 밖
      { day: undefined },
      { day: '2026/11/01' },
    ],
    NOW
  );
  assert.equal(months.length, 12);
  assert.deepEqual(months[0], {
    key: '2025-12',
    label: '12월',
    a11yLabel: '2025년 12월',
    count: 1,
  });
  assert.deepEqual(months[10], {
    key: '2026-10',
    label: '10월',
    a11yLabel: '2026년 10월',
    count: 1,
  });
  assert.deepEqual(months[11], {
    key: '2026-11',
    label: '11월',
    a11yLabel: '2026년 11월',
    count: 2,
  });
  assert.equal(
    months.reduce((sum, month) => sum + month.count, 0),
    4
  );
});

test('getMonthlyCounts: 1월이면 지난해 2월부터 세요', () => {
  const months = getMonthlyCounts([], new Date(2026, 0, 3));
  assert.equal(months[0].key, '2025-02');
  assert.equal(months[11].key, '2026-01');
});

test('getAverageRating: 별점을 남긴 기록만으로 소수 첫째 자리까지 내고, 없으면 null이에요', () => {
  assert.deepEqual(getAverageRating([{ rating: 5 }, { rating: 4 }, { rating: 4 }, {}]), {
    average: 4.3,
    count: 3,
  });
  assert.deepEqual(getAverageRating([{ rating: null }, { rating: 3.5 }, {}]), {
    average: null,
    count: 0,
  });
  assert.deepEqual(getAverageRating([]), { average: null, count: 0 });
});

test('getPostStats: 이번 달 · 올해 · 전체 수와 많이 쓴 주종 · 태그 · 장소를 모아요', () => {
  const posts = [
    { day: '2026-11-02', tags: ['친구', '라거'], location: '을지로', drinkType: 'beer', rating: 4 },
    { day: '2026-11-05', tags: ['친구'], location: ' 을지로 ', drinkType: 'beer' },
    { day: '2026-03-01', tags: ['혼술'], location: '집', drinkType: 'wine', rating: 5 },
    { day: '2025-12-24', tags: [], location: '', drinkType: 'soju' },
    { day: undefined, tags: ['친구'] },
  ];
  const stats = getPostStats(posts, NOW);

  assert.equal(stats.total, 5);
  assert.equal(stats.thisMonth, 2);
  assert.equal(stats.thisYear, 3);
  assert.deepEqual(stats.rating, { average: 4.5, count: 2 });
  assert.deepEqual(stats.drinkTypes, [
    { key: 'beer', label: '맥주', count: 2 },
    { key: 'soju', label: '소주', count: 1 },
    { key: 'wine', label: '와인', count: 1 },
  ]);
  assert.deepEqual(stats.tags.slice(0, 2), [
    { key: '친구', label: '#친구', count: 3 },
    { key: '라거', label: '#라거', count: 1 },
  ]);
  assert.deepEqual(stats.locations, [
    { key: '을지로', label: '을지로', count: 2 },
    { key: '집', label: '집', count: 1 },
  ]);
  assert.equal(stats.monthly.length, 12);
});

test('getPostStats: 순위는 5개까지만 보여 줘요', () => {
  const posts = Array.from({ length: 7 }, (_, i) => ({ day: '2026-11-01', tags: [`태그${i}`] }));
  assert.equal(getPostStats(posts, NOW).tags.length, 5);
});
