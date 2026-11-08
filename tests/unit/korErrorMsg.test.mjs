import assert from 'node:assert/strict';
import { test } from 'node:test';

import { AUTH_ERRORS } from '../../constants/errorMsg.js';
import { getKorErrorMsg } from '../../lib/korErrorMsg.js';

test('getKorErrorMsg: 아는 에러 코드는 그 문구를 돌려줘요', () => {
  assert.equal(getKorErrorMsg('auth/invalid-credential'), AUTH_ERRORS['auth/invalid-credential']);
  assert.equal(getKorErrorMsg('missing/password'), '비밀번호를 입력해 주세요.');
});

test('getKorErrorMsg: 모르는 코드 · 코드가 없으면 일반 문구를 돌려줘요', () => {
  assert.equal(getKorErrorMsg('auth/unknown'), '오류가 발생했어요.');
  assert.equal(getKorErrorMsg(undefined), '오류가 발생했어요.');
});
