import assert from 'node:assert/strict';
import { test } from 'node:test';

import { collectTags, filterPosts } from '../../lib/postFilter.js';

const posts = [
  { docId: 'a', day: '2026-10-01', tags: ['맥주', '수제'] },
  { docId: 'b', day: '2026-10-15', tags: ['와인'] },
  { docId: 'c', day: '2026-11-01', tags: ['맥주'] },
  { docId: 'd', day: undefined, tags: ['맥주'] },
  { docId: 'e', day: '2026-09-30' },
];

const ids = (list) => list.map((post) => post.docId);

test('collectTags: 많이 쓴 태그부터, 같으면 이름순으로 모아요', () => {
  assert.deepEqual(collectTags(posts), ['맥주', '수제', '와인']);
});

test('collectTags: 태그가 없는 글만 있으면 빈 목록이에요', () => {
  assert.deepEqual(collectTags([{ docId: 'x' }, { docId: 'y', tags: [] }]), []);
});

test('filterPosts: 조건이 없으면 모든 글을 그대로 돌려줘요', () => {
  assert.deepEqual(ids(filterPosts(posts, {})), ['a', 'b', 'c', 'd', 'e']);
});

test('filterPosts: 태그를 고르면 그 태그가 있는 글만 남아요', () => {
  assert.deepEqual(ids(filterPosts(posts, { tag: '맥주' })), ['a', 'c', 'd']);
});

test('filterPosts: 기간은 시작일과 끝날을 포함하고, 날짜가 없는 글은 빠져요', () => {
  assert.deepEqual(ids(filterPosts(posts, { from: '2026-10-01', to: '2026-10-15' })), ['a', 'b']);
});

test('filterPosts: 태그와 기간을 함께 걸 수 있어요', () => {
  assert.deepEqual(ids(filterPosts(posts, { tag: '맥주', from: '2026-10-01', to: '2026-10-31' })), [
    'a',
  ]);
});
