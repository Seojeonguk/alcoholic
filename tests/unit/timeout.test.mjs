import assert from 'node:assert/strict';
import { test } from 'node:test';

import { isTimeoutError, waitForWrite, withTimeout } from '../../lib/timeout.js';

const never = () => new Promise(() => {});
const later = (value, ms) => new Promise((resolve) => setTimeout(() => resolve(value), ms));

test('withTimeout: 시간 안에 끝나면 결과를 그대로 돌려줘요', async () => {
  assert.equal(await withTimeout(later('ok', 5), 100), 'ok');
});

test('withTimeout: 시간 안에 실패하면 그 에러를 그대로 던져요', async () => {
  const error = Object.assign(new Error('x'), { code: 'storage/unauthorized' });
  await assert.rejects(withTimeout(Promise.reject(error), 100), error);
});

test('withTimeout: 시간이 지나면 시간 초과 에러로 실패하고 onTimeout을 불러요', async () => {
  let cancelled = false;
  await assert.rejects(
    withTimeout(never(), 10, () => {
      cancelled = true;
    }),
    (error) => isTimeoutError(error)
  );
  assert.equal(cancelled, true);
});

test('withTimeout: onTimeout이 에러를 던져도 시간 초과로 끝나요', async () => {
  await assert.rejects(
    withTimeout(never(), 10, () => {
      throw new Error('cancel failed');
    }),
    (error) => isTimeoutError(error)
  );
});

test('withTimeout: then만 있는 객체(Storage 작업)도 기다려요', async () => {
  const task = { then: (resolve) => resolve('url') };
  assert.equal(await withTimeout(task, 100), 'url');
});

test('isTimeoutError: 다른 에러 · 값이 없으면 false예요', () => {
  assert.equal(isTimeoutError(new Error('x')), false);
  assert.equal(isTimeoutError(undefined), false);
});

test('waitForWrite: 서버에 반영되면 queued가 false예요', async () => {
  assert.deepEqual(await waitForWrite(later(undefined, 5), 100), { queued: false });
});

test('waitForWrite: 시간이 지나면 실패가 아니라 queued가 true예요', async () => {
  assert.deepEqual(await waitForWrite(never(), 10), { queued: true });
});

test('waitForWrite: 시간 초과 뒤에 쓰기가 거절돼도 처리하지 않은 거절로 남지 않아요', async () => {
  let rejectWrite;
  const write = new Promise((resolve, reject) => {
    rejectWrite = reject;
  });
  assert.deepEqual(await waitForWrite(write, 10), { queued: true });
  rejectWrite(new Error('permission-denied'));
  await later(undefined, 5);
});

test('waitForWrite: 규칙 거절 같은 에러는 그대로 던져요', async () => {
  const error = Object.assign(new Error('x'), { code: 'firestore/permission-denied' });
  await assert.rejects(waitForWrite(Promise.reject(error), 100), error);
});
