import assert from 'node:assert/strict';
import { test } from 'node:test';

import { POST_LIMITS } from '../../constants/postLimits.js';
import { getPostLimitError } from '../../lib/postLimitError.js';

const post = (overrides = {}) => ({
  title: '제목',
  content: '내용',
  location: '',
  tags: [],
  photos: [],
  ...overrides,
});
const text = (length) => '가'.repeat(length);
const list = (count) => Array.from({ length: count }, (_, i) => `항목${i}`);

test('getPostLimitError: 상한 안이면 null', () => {
  assert.equal(getPostLimitError(post()), null);
  assert.equal(
    getPostLimitError(
      post({
        title: text(POST_LIMITS.TITLE),
        content: text(POST_LIMITS.CONTENT),
        location: text(POST_LIMITS.LOCATION),
        tags: [text(POST_LIMITS.TAG_LENGTH), ...list(POST_LIMITS.TAGS - 1)],
        photos: list(POST_LIMITS.PHOTOS),
      })
    ),
    null
  );
});

test('getPostLimitError: 넘는 항목을 알려 줘요', () => {
  assert.equal(
    getPostLimitError(post({ title: text(POST_LIMITS.TITLE + 1) })),
    '제목은 40자까지 쓸 수 있어요.'
  );
  assert.equal(
    getPostLimitError(post({ content: text(POST_LIMITS.CONTENT + 1) })),
    '내용은 2000자까지 쓸 수 있어요.'
  );
  assert.equal(
    getPostLimitError(post({ location: text(POST_LIMITS.LOCATION + 1) })),
    '장소는 50자까지 쓸 수 있어요.'
  );
  assert.equal(
    getPostLimitError(post({ tags: list(POST_LIMITS.TAGS + 1) })),
    '태그는 20개까지 넣을 수 있어요.'
  );
  assert.equal(
    getPostLimitError(post({ tags: ['맥주', text(POST_LIMITS.TAG_LENGTH + 1)] })),
    '태그는 하나에 20자까지 쓸 수 있어요.'
  );
  assert.equal(
    getPostLimitError(post({ photos: list(POST_LIMITS.PHOTOS + 1) })),
    '사진은 10장까지 넣을 수 있어요.'
  );
});
