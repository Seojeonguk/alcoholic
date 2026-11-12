import assert from 'node:assert/strict';
import { test } from 'node:test';

import { DRINK_TYPES } from '../../constants/drinkTypes.js';
import { POST_LIMITS } from '../../constants/postLimits.js';
import {
  DAILY_LIMIT,
  DRINK_TYPE_CODES,
  FLAVORS_LIMIT,
  MAX_IMAGE_BASE64_LENGTH,
  RESULT_SCHEMA,
  SIMILAR_LIMIT,
  TASTE_NOTE_LIMIT,
  UNKNOWN,
  nextUsage,
  normalizeResult,
  toKstDay,
  validateRequest,
} from '../../functions/drinkRecognition.js';

test('주종 코드가 앱의 DRINK_TYPES와 같아요', () => {
  assert.deepEqual(
    DRINK_TYPE_CODES,
    DRINK_TYPES.map(({ code }) => code)
  );
  assert.deepEqual(RESULT_SCHEMA.properties.drinkType.enum, DRINK_TYPE_CODES);
});

test('validateRequest: base64 JPEG · PNG · WebP를 받아요', () => {
  for (const mediaType of ['image/jpeg', 'image/png', 'image/webp']) {
    assert.deepEqual(validateRequest({ image: 'aGVsbG8=', mediaType }), {
      ok: true,
      image: 'aGVsbG8=',
      mediaType,
    });
  }
});

test('validateRequest: 없거나 · 크거나 · base64가 아니거나 · 형식이 다르면 거절해요', () => {
  assert.equal(validateRequest(undefined).ok, false);
  assert.equal(validateRequest({ mediaType: 'image/jpeg' }).ok, false);
  assert.equal(validateRequest({ image: '', mediaType: 'image/jpeg' }).ok, false);
  assert.equal(validateRequest({ image: 123, mediaType: 'image/jpeg' }).ok, false);
  assert.equal(
    validateRequest({ image: 'A'.repeat(MAX_IMAGE_BASE64_LENGTH + 4), mediaType: 'image/jpeg' }).ok,
    false
  );
  assert.equal(
    validateRequest({ image: 'data:image/jpeg;base64,aGk=', mediaType: 'image/jpeg' }).ok,
    false
  );
  assert.equal(validateRequest({ image: 'aGVsbG8=', mediaType: 'image/gif' }).ok, false);
});

test('toKstDay: 한국 시간 기준 날짜예요', () => {
  assert.equal(toKstDay(new Date('2026-11-10T14:59:59Z')), '2026-11-10');
  assert.equal(toKstDay(new Date('2026-11-10T15:00:00Z')), '2026-11-11');
});

test('nextUsage: 처음이거나 날짜가 바뀌면 1부터 세요', () => {
  assert.deepEqual(nextUsage(undefined, '2026-11-11'), {
    allowed: true,
    usage: { day: '2026-11-11', count: 1 },
  });
  assert.deepEqual(nextUsage({ day: '2026-11-10', count: DAILY_LIMIT }, '2026-11-11'), {
    allowed: true,
    usage: { day: '2026-11-11', count: 1 },
  });
});

test('nextUsage: 하루 한도까지 받고 넘으면 거절해요', () => {
  assert.deepEqual(nextUsage({ day: '2026-11-11', count: 2 }, '2026-11-11', 3), {
    allowed: true,
    usage: { day: '2026-11-11', count: 3 },
  });
  assert.deepEqual(nextUsage({ day: '2026-11-11', count: 3 }, '2026-11-11', 3), {
    allowed: false,
    usage: { day: '2026-11-11', count: 3 },
  });
});

test('normalizeResult: 술이면 이름 · 주종 · 확신도 · 태그를 돌려줘요', () => {
  const text = JSON.stringify({
    isDrink: true,
    name: ' 발베니 12년 더블우드 ',
    drinkType: 'whisky',
    confidence: 'high',
    tags: ['싱글몰트', '#스페이사이드', ' 싱글몰트 '],
  });
  assert.deepEqual(normalizeResult(text), {
    isDrink: true,
    name: '발베니 12년 더블우드',
    drinkType: 'whisky',
    confidence: 'high',
    tags: ['싱글몰트', '스페이사이드'],
    tasteNote: '',
    flavors: [],
    similar: [],
  });
});

test('normalizeResult: 저장할 때 보안 규칙에 걸리지 않게 길이 · 개수를 줄여요', () => {
  const result = normalizeResult(
    JSON.stringify({
      isDrink: true,
      name: '가'.repeat(100),
      drinkType: 'beer',
      confidence: 'medium',
      tags: ['나'.repeat(30), 'a', 'b', 'c', 'd', 'e', 'f', '', 7],
    })
  );
  assert.equal(result.name.length, POST_LIMITS.TITLE);
  assert.equal(result.tags[0].length, POST_LIMITS.TAG_LENGTH);
  assert.deepEqual(result.tags.slice(1), ['a', 'b', 'c', 'd']);
});

test('normalizeResult: 모르는 주종 · 확신도는 null · low로 바꿔요', () => {
  const result = normalizeResult(
    JSON.stringify({
      isDrink: true,
      name: '무언가',
      drinkType: 'water',
      confidence: 'sure',
      tags: null,
    })
  );
  assert.deepEqual(result, {
    isDrink: true,
    name: '무언가',
    drinkType: null,
    confidence: 'low',
    tags: [],
    tasteNote: '',
    flavors: [],
    similar: [],
  });
});

test('normalizeResult: 술이 아니거나 JSON이 아니면 모르겠음이에요', () => {
  assert.deepEqual(normalizeResult(JSON.stringify({ isDrink: false, name: '고양이' })), UNKNOWN);
  assert.deepEqual(normalizeResult('{잘린 답'), UNKNOWN);
  assert.deepEqual(normalizeResult(''), UNKNOWN);
});

test('normalizeResult: 이름에 이미 있는 말은 태그에서 빼요', () => {
  const result = normalizeResult(
    JSON.stringify({
      isDrink: true,
      name: '발베니 12년 더블우드',
      drinkType: 'whisky',
      confidence: 'high',
      tags: ['싱글몰트', '더블우드', '발베니', '스페이사이드'],
    })
  );
  assert.deepEqual(result.tags, ['싱글몰트', '스페이사이드']);
});

test('normalizeResult: 맛 표현 · 맛 키워드 · 비슷한 술을 정리해서 돌려줘요', () => {
  const result = normalizeResult(
    JSON.stringify({
      isDrink: true,
      name: '발베니 12년 더블우드',
      drinkType: 'whisky',
      confidence: 'high',
      tags: [],
      tasteNote: ' 꿀 · 바닐라 향이 나고 부드러워요. ',
      flavors: ['#꿀', '바닐라', '꿀', '', 3],
      similar: [
        { name: '글렌피딕 12년', reason: ' 같은 스페이사이드라 비슷해요. ' },
        { name: '발베니 12년 더블우드', reason: '같은 술' },
        { name: '글렌피딕 12년', reason: '겹침' },
        { name: '', reason: '이름 없음' },
        { reason: '이름 없음' },
        null,
        { name: '맥캘란 12년', reason: 7 },
      ],
    })
  );
  assert.equal(result.tasteNote, '꿀 · 바닐라 향이 나고 부드러워요.');
  assert.deepEqual(result.flavors, ['꿀', '바닐라']);
  assert.deepEqual(result.similar, [
    { name: '글렌피딕 12년', reason: '같은 스페이사이드라 비슷해요.' },
    { name: '맥캘란 12년', reason: '' },
  ]);
});

test('normalizeResult: 맛 표현 · 키워드 · 비슷한 술의 길이 · 개수를 줄여요', () => {
  const result = normalizeResult(
    JSON.stringify({
      isDrink: true,
      name: '소주',
      drinkType: 'soju',
      confidence: 'low',
      tags: [],
      tasteNote: '가'.repeat(500),
      flavors: ['나'.repeat(30), 'a', 'b', 'c', 'd', 'e', 'f'],
      similar: ['가', '나', '다', '라', '마'].map((name) => ({ name, reason: '이유' })),
    })
  );
  assert.equal(result.tasteNote.length, TASTE_NOTE_LIMIT);
  assert.equal(result.flavors.length, FLAVORS_LIMIT);
  assert.equal(result.flavors[0].length, 15);
  assert.equal(result.similar.length, SIMILAR_LIMIT);
});

test('normalizeResult: 맛 표현이 없거나 모양이 다르면 비워요', () => {
  const result = normalizeResult(
    JSON.stringify({
      isDrink: true,
      name: '맥주',
      drinkType: 'beer',
      confidence: 'medium',
      tags: [],
      tasteNote: 3,
      flavors: '쌉쌀함',
      similar: { name: '카스' },
    })
  );
  assert.equal(result.tasteNote, '');
  assert.deepEqual(result.flavors, []);
  assert.deepEqual(result.similar, []);
});
