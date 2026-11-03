import assert from 'node:assert/strict';
import { test } from 'node:test';

import { decideStartMode, startsAtGallery } from '../../lib/startMode.js';

const never = () => new Promise(() => {});

test('decideStartMode: 인증된 로그인이 있으면 회원이에요', async () => {
  const mode = await decideStartMode({
    getUser: async () => ({ emailVerified: true }),
    getGuestFlag: async () => true,
  });
  assert.equal(mode, 'member');
});

test('decideStartMode: 로그인이 없고 비회원 표시가 있으면 비회원이에요', async () => {
  const mode = await decideStartMode({
    getUser: async () => null,
    getGuestFlag: async () => true,
  });
  assert.equal(mode, 'guest');
});

test('decideStartMode: 로그인도 비회원 표시도 없으면 처음이에요', async () => {
  const mode = await decideStartMode({
    getUser: async () => null,
    getGuestFlag: async () => false,
  });
  assert.equal(mode, 'start');
});

test('decideStartMode: 인증하지 않은 계정은 비회원 표시를 따라요', async () => {
  const user = { emailVerified: false };
  assert.equal(
    await decideStartMode({ getUser: async () => user, getGuestFlag: async () => false }),
    'start'
  );
  assert.equal(
    await decideStartMode({ getUser: async () => user, getGuestFlag: async () => true }),
    'guest'
  );
});

test('decideStartMode: 로그인 확인이 끝나지 않으면 정한 시간 뒤에 null이에요', async () => {
  const mode = await decideStartMode({
    getUser: never,
    getGuestFlag: async () => false,
    timeoutMs: 10,
  });
  assert.equal(mode, null);
});

test('decideStartMode: 비회원 표시 확인이 끝나지 않아도 정한 시간 뒤에 null이에요', async () => {
  const mode = await decideStartMode({
    getUser: async () => ({ emailVerified: true }),
    getGuestFlag: never,
    timeoutMs: 10,
  });
  assert.equal(mode, null);
});

test('decideStartMode: 확인하다 실패하면 null이에요', async () => {
  const mode = await decideStartMode({
    getUser: async () => null,
    getGuestFlag: async () => {
      throw new Error('저장소를 읽지 못함');
    },
  });
  assert.equal(mode, null);
});

test('decideStartMode: 바로 에러를 던져도 null이에요', async () => {
  const mode = await decideStartMode({
    getUser: () => {
      throw new Error('Firebase를 불러오지 못함');
    },
    getGuestFlag: async () => false,
  });
  assert.equal(mode, null);
});

test('startsAtGallery: 회원 · 비회원만 갤러리부터 보여 줘요', () => {
  assert.equal(startsAtGallery('member'), true);
  assert.equal(startsAtGallery('guest'), true);
  assert.equal(startsAtGallery('start'), false);
  assert.equal(startsAtGallery(null), false);
});
