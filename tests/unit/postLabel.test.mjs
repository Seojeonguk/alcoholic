import assert from 'node:assert/strict';
import { test } from 'node:test';

import { getPhotoLabel, getPostLabel } from '../../lib/postLabel.js';

test('getPostLabel: 제목과 월 · 일을 앞의 0 없이 읽어요', () => {
  assert.equal(getPostLabel({ title: '맥주', day: '2026-11-02' }), '맥주, 11월 2일');
  assert.equal(getPostLabel({ title: '와인', day: '2026-01-30' }), '와인, 1월 30일');
});

test('getPostLabel: 같은 날 기록도 제목으로 구분돼요', () => {
  assert.notEqual(
    getPostLabel({ title: '맥주', day: '2026-11-02' }),
    getPostLabel({ title: '소주', day: '2026-11-02' })
  );
});

test('getPostLabel: 제목이 없거나 공백뿐이면 날짜 기록이에요', () => {
  assert.equal(getPostLabel({ title: '', day: '2026-11-02' }), '11월 2일 기록');
  assert.equal(getPostLabel({ title: '  ', day: '2026-11-02' }), '11월 2일 기록');
  assert.equal(getPostLabel({ day: '2026-11-02' }), '11월 2일 기록');
});

test('getPostLabel: 날짜가 없거나 형식이 다르면 제목만, 둘 다 없으면 기록이에요', () => {
  assert.equal(getPostLabel({ title: '맥주', day: '11/02' }), '맥주');
  assert.equal(getPostLabel({ title: '', day: undefined }), '기록');
  assert.equal(getPostLabel(), '기록');
});

test('getPhotoLabel: 몇 번째 사진인지 1부터 세어 읽어요', () => {
  assert.equal(getPhotoLabel(0, 5), '사진 1/5');
  assert.equal(getPhotoLabel(1, 5), '사진 2/5');
  assert.equal(getPhotoLabel(0, 1), '사진 1/1');
});
