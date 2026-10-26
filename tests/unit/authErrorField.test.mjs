import assert from 'node:assert/strict';
import { test } from 'node:test';

import { getAuthErrorField } from '../../lib/authErrorField.js';

test('getAuthErrorField: 로그인 정보가 틀리면 비밀번호 칸', () => {
  assert.equal(getAuthErrorField('auth/invalid-credential'), 'password');
  assert.equal(getAuthErrorField('auth/wrong-password'), 'password');
});

test('getAuthErrorField: 이메일 형식 · 중복 · 없는 계정은 이메일 칸', () => {
  assert.equal(getAuthErrorField('auth/invalid-email'), 'email');
  assert.equal(getAuthErrorField('auth/email-already-in-use'), 'email');
  assert.equal(getAuthErrorField('auth/user-not-found'), 'email');
});

test('getAuthErrorField: 그 밖의 에러(약한 비밀번호, 네트워크, 시도 초과)는 비밀번호 칸', () => {
  assert.equal(getAuthErrorField('auth/weak-password'), 'password');
  assert.equal(getAuthErrorField('auth/network-request-failed'), 'password');
  assert.equal(getAuthErrorField(undefined), 'password');
});
