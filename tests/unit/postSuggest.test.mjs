import assert from 'node:assert/strict';
import { test } from 'node:test';

import { collectLocations, suggestValues } from '../../lib/postSuggest.js';

test('collectLocations: 많이 쓴 장소부터, 같으면 이름순으로 모아요', () => {
  const posts = [
    { location: '을지로' },
    { location: '집' },
    { location: '을지로' },
    { location: '강남' },
  ];
  assert.deepEqual(collectLocations(posts), ['을지로', '강남', '집']);
});

test('collectLocations: 앞뒤 공백은 떼고 같은 장소로 세요', () => {
  assert.deepEqual(
    collectLocations([{ location: ' 집 ' }, { location: '집' }, { location: '바' }]),
    ['집', '바']
  );
});

test('collectLocations: 장소가 없거나 비었거나 문자열이 아니면 빼요', () => {
  assert.deepEqual(
    collectLocations([
      {},
      { location: '' },
      { location: '   ' },
      { location: 3 },
      { location: null },
    ]),
    []
  );
});

test('suggestValues: 입력이 없으면 앞에서부터 limit개를 보여 줘요', () => {
  assert.deepEqual(suggestValues(['a', 'b', 'c'], '', { limit: 2 }), ['a', 'b']);
  assert.deepEqual(suggestValues(['a', 'b'], undefined), ['a', 'b']);
});

test('suggestValues: 입력한 글자가 들어 있는 것만 순서대로 남겨요', () => {
  assert.deepEqual(suggestValues(['맥주', '수제맥주', '와인'], '맥'), ['맥주', '수제맥주']);
});

test('suggestValues: 영문 대소문자와 앞의 #, 앞뒤 공백은 가리지 않아요', () => {
  assert.deepEqual(suggestValues(['IPA', 'Lager', 'wine'], '  #ip '), ['IPA']);
});

test('suggestValues: 이미 넣은 값과 입력과 똑같은 값은 빼요', () => {
  assert.deepEqual(suggestValues(['맥주', '와인', '소주'], '', { exclude: ['와인'] }), [
    '맥주',
    '소주',
  ]);
  assert.deepEqual(suggestValues(['집', '집앞'], '집'), ['집앞']);
});

test('suggestValues: 기본은 8개까지예요', () => {
  const values = Array.from({ length: 12 }, (_, i) => `태그${i}`);
  assert.equal(suggestValues(values, '').length, 8);
});
