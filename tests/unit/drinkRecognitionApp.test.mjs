import assert from 'node:assert/strict';
import { test } from 'node:test';

import { POST_LIMITS } from '../../constants/postLimits.js';
import {
  getRecognitionErrorText,
  getRecognitionPatch,
  getRecognitionToast,
} from '../../lib/drinkRecognition.js';

const emptyForm = { title: '', drinkType: null, tags: [] };
const whisky = {
  isDrink: true,
  name: '발베니 12년 더블우드',
  drinkType: 'whisky',
  confidence: 'high',
  tags: ['싱글몰트', '스코틀랜드'],
};

test('getRecognitionPatch: 빈 폼이면 제목 · 주종 · 태그를 모두 채워요', () => {
  assert.deepEqual(getRecognitionPatch(emptyForm, whisky), {
    title: '발베니 12년 더블우드',
    drinkType: 'whisky',
    addTags: ['싱글몰트', '스코틀랜드'],
  });
});

test('getRecognitionPatch: 이미 쓴 제목 · 주종은 바꾸지 않고 없는 태그만 더해요', () => {
  const form = { title: '어제 마신 위스키', drinkType: 'spirits', tags: ['싱글몰트'] };
  assert.deepEqual(getRecognitionPatch(form, whisky), { addTags: ['스코틀랜드'] });
});

test('getRecognitionPatch: 공백뿐인 제목은 빈 제목으로 봐요', () => {
  assert.equal(getRecognitionPatch({ ...emptyForm, title: '  ' }, whisky).title, whisky.name);
});

test('getRecognitionPatch: 태그는 글 하나의 상한까지만 더해요', () => {
  const tags = Array.from({ length: POST_LIMITS.TAGS - 1 }, (_, i) => `t${i}`);
  const patch = getRecognitionPatch({ ...emptyForm, tags }, whisky);
  assert.deepEqual(patch.addTags, ['싱글몰트']);
});

test('getRecognitionPatch: 술이 아니면 null이에요', () => {
  assert.equal(getRecognitionPatch(emptyForm, { isDrink: false }), null);
  assert.equal(getRecognitionPatch(emptyForm, null), null);
});

test('getRecognitionToast: 채운 항목을 알려 줘요', () => {
  const patch = getRecognitionPatch(emptyForm, whisky);
  assert.deepEqual(getRecognitionToast(whisky, patch), {
    type: 'success',
    title: '제목 · 주종 · 태그를 채웠어요.',
    message: '맞는지 확인하고 저장해 주세요.',
  });
  assert.equal(getRecognitionToast(whisky, { title: 'x', addTags: [] }).title, '제목을 채웠어요.');
});

test('getRecognitionToast: 확신이 낮으면 꼭 확인하라고 해요', () => {
  const low = { ...whisky, confidence: 'low' };
  assert.equal(
    getRecognitionToast(low, getRecognitionPatch(emptyForm, low)).message,
    '확실하지 않으니 맞는지 꼭 확인해 주세요.'
  );
});

test('getRecognitionToast: 채운 것이 없으면 알아본 이름을 보여 줘요', () => {
  assert.deepEqual(getRecognitionToast(whisky, { addTags: [] }), {
    type: 'info',
    title: '발베니 12년 더블우드(으)로 보여요.',
    message: '이미 쓴 내용은 바꾸지 않았어요.',
  });
});

test('getRecognitionToast: 술이 아니면 다른 사진으로 해 보라고 해요', () => {
  assert.equal(getRecognitionToast({ isDrink: false }, null).title, '사진에서 술을 찾지 못했어요.');
});

test('getRecognitionErrorText: 하루 횟수 · 인증 · 그 밖의 오류 문구', () => {
  assert.deepEqual(getRecognitionErrorText('RESOURCE_EXHAUSTED'), [
    '오늘은 더 알아볼 수 없어요.',
    '내일 다시 시도해 주세요.',
  ]);
  assert.equal(getRecognitionErrorText('PERMISSION_DENIED')[1], '앱을 다시 켜고 시도해 주세요.');
  assert.equal(getRecognitionErrorText('NETWORK')[1], '인터넷 연결을 확인하고 다시 시도해 주세요.');
});
