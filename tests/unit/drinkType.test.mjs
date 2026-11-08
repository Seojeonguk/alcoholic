import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  countDrinkTypes,
  formatRating,
  getDrinkLine,
  getDrinkTypeLabel,
  toRating,
} from '../../lib/drinkType.js';

test('getDrinkTypeLabel: 코드를 이름으로 바꾸고, 모르는 코드는 빈 문자열이에요', () => {
  assert.equal(getDrinkTypeLabel('beer'), '맥주');
  assert.equal(getDrinkTypeLabel('baijiu'), '고량주');
  assert.equal(getDrinkTypeLabel('vodka'), '');
  assert.equal(getDrinkTypeLabel(null), '');
});

test('toRating: 1~5 정수만 별점으로 봐요', () => {
  assert.equal(toRating(1), 1);
  assert.equal(toRating(5), 5);
  for (const value of [0, 6, 3.5, '3', null, undefined]) {
    assert.equal(toRating(value), null);
  }
});

test('formatRating: 별점을 별 모양으로 보여 주고, 없으면 빈 문자열이에요', () => {
  assert.equal(formatRating(4), '★★★★☆');
  assert.equal(formatRating(1), '★☆☆☆☆');
  assert.equal(formatRating(null), '');
});

test('getDrinkLine: 주종과 별점을 한 줄로 잇고, 있는 것만 넣어요', () => {
  assert.equal(getDrinkLine({ drinkType: 'beer', rating: 4 }), '맥주 · ★★★★☆');
  assert.equal(getDrinkLine({ drinkType: 'wine' }), '와인');
  assert.equal(getDrinkLine({ rating: 2 }), '★★☆☆☆');
  assert.equal(getDrinkLine({}), '');
  assert.equal(getDrinkLine(), '');
});

test('countDrinkTypes: 쓴 주종만 목록 순서로 글 수와 함께 모아요', () => {
  const posts = [
    { drinkType: 'wine' },
    { drinkType: 'soju' },
    { drinkType: 'wine' },
    { drinkType: null },
    {},
    { drinkType: 'unknown' },
  ];
  assert.deepEqual(countDrinkTypes(posts), [
    { code: 'soju', label: '소주', count: 1 },
    { code: 'wine', label: '와인', count: 2 },
  ]);
});
