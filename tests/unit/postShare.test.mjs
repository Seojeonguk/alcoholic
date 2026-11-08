import assert from 'node:assert/strict';
import { test } from 'node:test';

import { getShareText } from '../../lib/postShare.js';

test('getShareText: 제목 · 날짜 · 장소 · 내용 · 태그를 상세 화면 순서로 이어요', () => {
  const text = getShareText({
    title: '맥주',
    day: '2026-11-02',
    location: '을지로',
    content: '시원했어요.\n또 가고 싶어요.',
    tags: ['라거', '친구'],
  });
  assert.equal(text, '맥주\n2026. 11. 02 · 을지로\n\n시원했어요.\n또 가고 싶어요.\n\n#라거 #친구');
});

test('getShareText: 빈 항목은 빼요', () => {
  assert.equal(getShareText({ title: '와인', day: '2026-01-30' }), '와인\n2026. 01. 30');
  assert.equal(getShareText({ title: '', location: '집', tags: ['혼술'] }), '집\n\n#혼술');
  assert.equal(getShareText({ content: '내용만' }), '내용만');
});

test('getShareText: 앞뒤 공백만 있는 항목과 빈 태그도 빼요', () => {
  const text = getShareText({
    title: '  하이볼 ',
    day: '',
    location: '   ',
    content: '\n  맛있어요  \n',
    tags: ['', '  ', '위스키'],
  });
  assert.equal(text, '하이볼\n\n맛있어요\n\n#위스키');
});

test('getShareText: 형식이 다른 날짜는 그대로 넣어요', () => {
  assert.equal(getShareText({ title: '소주', day: '어제' }), '소주\n어제');
});

test('getShareText: 남길 것이 없거나 글이 없으면 빈 문자열', () => {
  assert.equal(getShareText({ title: ' ', tags: [] }), '');
  assert.equal(getShareText(), '');
});

test('getShareText: 주종 · 별점은 제목 아래 줄에 넣어요', () => {
  assert.equal(
    getShareText({ title: '맥주', drinkType: 'beer', rating: 4, day: '2026-11-02' }),
    '맥주\n맥주 · ★★★★☆\n2026. 11. 02'
  );
  assert.equal(getShareText({ title: '와인', drinkType: 'wine' }), '와인\n와인');
});
