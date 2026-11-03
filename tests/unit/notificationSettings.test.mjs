import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  isAnnouncementsEnabled,
  shouldAskAnnouncements,
  toStoredValue,
} from '../../lib/notificationSettings.js';

test('isAnnouncementsEnabled: 저장된 값이 없으면 꺼져 있어요', () => {
  assert.equal(isAnnouncementsEnabled(null), false);
  assert.equal(isAnnouncementsEnabled(undefined), false);
});

test('isAnnouncementsEnabled: 켠 값만 켜진 것으로 봐요', () => {
  assert.equal(isAnnouncementsEnabled('1'), true);
  assert.equal(isAnnouncementsEnabled('0'), false);
  assert.equal(isAnnouncementsEnabled('true'), false);
});

test('toStoredValue: 다시 읽으면 같은 상태가 돼요', () => {
  assert.equal(isAnnouncementsEnabled(toStoredValue(true)), true);
  assert.equal(isAnnouncementsEnabled(toStoredValue(false)), false);
});

test('shouldAskAnnouncements: 묻지 않았고 고른 적도 없을 때만 물어요', () => {
  assert.equal(shouldAskAnnouncements({ asked: null, stored: null }), true);
  assert.equal(shouldAskAnnouncements({ asked: '1', stored: null }), false);
  assert.equal(shouldAskAnnouncements({ asked: null, stored: '1' }), false);
  assert.equal(shouldAskAnnouncements({ asked: null, stored: '0' }), false);
});
