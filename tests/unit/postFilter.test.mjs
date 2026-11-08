import assert from 'node:assert/strict';
import { test } from 'node:test';

import { collectTags, countTags, filterPosts, searchTags } from '../../lib/postFilter.js';

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

test('countTags: 태그별로 쓴 글 수를 많이 쓴 순서로 세요', () => {
  assert.deepEqual(countTags(posts), [
    { tag: '맥주', count: 3 },
    { tag: '수제', count: 1 },
    { tag: '와인', count: 1 },
  ]);
});

test('countTags: 한 글에 같은 태그가 두 번 있어도 한 번으로 세요', () => {
  assert.deepEqual(countTags([{ tags: ['맥주', '맥주'] }]), [{ tag: '맥주', count: 1 }]);
});

const tagCounts = [
  { tag: '맥주', count: 3 },
  { tag: '수제맥주', count: 2 },
  { tag: 'IPA', count: 1 },
];

test('searchTags: 이름에 검색어가 들어 있는 태그만 순서를 지켜 남겨요', () => {
  assert.deepEqual(
    searchTags(tagCounts, '맥주').map(({ tag }) => tag),
    ['맥주', '수제맥주']
  );
});

test('searchTags: 앞의 #와 공백은 빼고, 영문 대소문자는 가리지 않아요', () => {
  assert.deepEqual(
    searchTags(tagCounts, '  #ipa ').map(({ tag }) => tag),
    ['IPA']
  );
});

test('searchTags: 검색어가 비면 모두, 맞는 게 없으면 빈 목록이에요', () => {
  assert.equal(searchTags(tagCounts, '').length, 3);
  assert.equal(searchTags(tagCounts, '#').length, 3);
  assert.equal(searchTags(tagCounts, undefined).length, 3);
  assert.deepEqual(searchTags(tagCounts, '와인'), []);
});

const searchable = [
  { docId: 's1', title: '하이네켄', location: '홍대 펍', content: '', tags: ['맥주'] },
  { docId: 's2', title: '샤또', location: '집', content: 'Merlot 한 병', tags: ['와인'] },
  { docId: 's3', title: '', location: '', content: '', tags: ['수제맥주'], day: '2026-10-01' },
  { docId: 's4', title: '이름 없음' },
];

test('filterPosts: 검색어가 제목 · 장소 · 내용 · 태그 어디에든 있으면 남아요', () => {
  assert.deepEqual(ids(filterPosts(searchable, { query: '하이네' })), ['s1']);
  assert.deepEqual(ids(filterPosts(searchable, { query: '홍대' })), ['s1']);
  assert.deepEqual(ids(filterPosts(searchable, { query: '한 병' })), ['s2']);
  assert.deepEqual(ids(filterPosts(searchable, { query: '맥주' })), ['s1', 's3']);
});

test('filterPosts: 검색어는 영문 대소문자를 가리지 않고 앞뒤 공백을 빼요', () => {
  assert.deepEqual(ids(filterPosts(searchable, { query: '  merlot ' })), ['s2']);
});

test('filterPosts: 여러 단어는 모두 들어 있어야 하고, 칸이 달라도 돼요', () => {
  assert.deepEqual(ids(filterPosts(searchable, { query: '샤또   집' })), ['s2']);
  assert.deepEqual(ids(filterPosts(searchable, { query: '샤또 홍대' })), []);
});

test('filterPosts: 공백뿐인 검색어는 조건이 없는 것으로 봐요', () => {
  assert.equal(filterPosts(searchable, { query: '   ' }).length, 4);
});

test('filterPosts: 검색어는 태그 · 기간 조건과 함께 걸려요', () => {
  assert.deepEqual(ids(filterPosts(searchable, { query: '맥주', tag: '수제맥주' })), ['s3']);
  assert.deepEqual(
    ids(filterPosts(searchable, { query: '맥주', from: '2026-10-01', to: '2026-10-31' })),
    ['s3']
  );
});
