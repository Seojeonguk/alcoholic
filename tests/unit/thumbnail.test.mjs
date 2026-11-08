import assert from 'node:assert/strict';
import { test } from 'node:test';

import { getGalleryPhoto, planThumbnail, withThumbnail } from '../../lib/thumbnail.js';

test('planThumbnail: 새 글에 사진이 있으면 만들어요', () => {
  assert.deepEqual(planThumbnail({ cover: 'https://new' }), { action: 'make', removed: null });
});

test('planThumbnail: 사진이 없으면 만들지 않고, 있던 썸네일은 지워요', () => {
  assert.deepEqual(planThumbnail({ cover: undefined }), { action: 'none', removed: null });
  assert.deepEqual(
    planThumbnail({ cover: null, originalCover: 'https://a', originalThumbnail: 'https://t' }),
    { action: 'none', removed: 'https://t' }
  );
});

test('planThumbnail: 대표 사진이 그대로고 썸네일이 있으면 그대로 둬요', () => {
  assert.deepEqual(
    planThumbnail({
      cover: 'https://a',
      originalCover: 'https://a',
      originalThumbnail: 'https://t',
    }),
    { action: 'keep', removed: null }
  );
});

test('planThumbnail: 대표 사진이 바뀌면 새로 만들고 예전 썸네일은 지워요', () => {
  assert.deepEqual(
    planThumbnail({
      cover: 'https://b',
      originalCover: 'https://a',
      originalThumbnail: 'https://t',
    }),
    { action: 'make', removed: 'https://t' }
  );
});

test('planThumbnail: 썸네일이 없던 예전 글은 고칠 때 만들어요', () => {
  assert.deepEqual(planThumbnail({ cover: 'https://a', originalCover: 'https://a' }), {
    action: 'make',
    removed: null,
  });
});

test('getGalleryPhoto: 썸네일이 있으면 썸네일, 없으면 대표 사진이에요', () => {
  assert.equal(
    getGalleryPhoto({ thumbnail: 'https://t', presentivePhoto: 'https://a' }),
    'https://t'
  );
  assert.equal(getGalleryPhoto({ thumbnail: null, presentivePhoto: 'https://a' }), 'https://a');
  assert.equal(getGalleryPhoto({ presentivePhoto: null }), null);
});

test('withThumbnail: 글을 지울 때 썸네일도 함께 지울 목록을 만들어요', () => {
  assert.deepEqual(withThumbnail(['https://a'], 'https://t'), ['https://a', 'https://t']);
  assert.deepEqual(withThumbnail(['https://a'], null), ['https://a']);
  assert.deepEqual(withThumbnail(undefined, undefined), []);
});
