import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  EXPORT_VERSION,
  getExportFileName,
  getPhotoExtension,
  planExport,
  toExportManifest,
} from '../../lib/postExport.js';

test('getExportFileName: 날짜를 붙인 zip 이름을 만들어요', () => {
  assert.equal(getExportFileName(new Date(2026, 10, 8, 23, 59)), 'alcoholic-posts-20261108.zip');
  assert.equal(getExportFileName(new Date(2026, 0, 5)), 'alcoholic-posts-20260105.zip');
});

test('getPhotoExtension: 기기 경로 · 다운로드 URL에서 확장자를 고르고, 모르면 jpg예요', () => {
  assert.equal(getPhotoExtension('file:///data/guest/photos/abc.jpg'), 'jpg');
  assert.equal(getPhotoExtension('file:///data/a.JPEG'), 'jpg');
  assert.equal(getPhotoExtension('file:///data/a.png'), 'png');
  assert.equal(getPhotoExtension('file:///data/a.webp'), 'webp');
  assert.equal(
    getPhotoExtension(
      'https://firebasestorage.googleapis.com/v0/b/app/o/posts%2Fuid%2Fuuid?alt=media&token=t'
    ),
    'jpg'
  );
  assert.equal(
    getPhotoExtension(
      'https://firebasestorage.googleapis.com/v0/b/app/o/posts%2Fold.png?alt=media'
    ),
    'png'
  );
  assert.equal(getPhotoExtension(undefined), 'jpg');
});

test('planExport: 글마다 사진 파일 경로를 정하고, 최근에 마신 기록부터 놓아요', () => {
  const plan = planExport([
    {
      id: 'a',
      title: '맥주',
      day: '2026-11-01',
      photos: ['file:///p/1.jpg', 'file:///p/2.png'],
      createdAt: 1,
    },
    { id: 'b', title: '와인', day: '2026-11-03', photos: [], createdAt: 2 },
  ]);
  assert.deepEqual(
    plan.posts.map((post) => post.id),
    ['b', 'a']
  );
  assert.deepEqual(plan.photos, [
    { postId: 'a', source: 'file:///p/1.jpg', path: 'photos/a-1.jpg' },
    { postId: 'a', source: 'file:///p/2.png', path: 'photos/a-2.png' },
  ]);
});

test('planExport: 파일 이름에 쓸 수 없는 글자는 _로 바꿔요', () => {
  const plan = planExport([{ id: 'x/y:z', photos: ['file:///p/1.jpg'] }]);
  assert.equal(plan.photos[0].path, 'photos/x_y_z-1.jpg');
});

test('toExportManifest: 담은 사진만 경로로 넣고, 빈 값은 기본값으로 채워요', () => {
  const plan = planExport([
    {
      id: 'a',
      title: '맥주',
      content: '시원했어요.',
      day: '2026-11-01',
      location: '을지로',
      tags: ['라거'],
      photos: ['file:///p/1.jpg', 'file:///p/2.jpg'],
      createdAt: Date.UTC(2026, 10, 1, 12),
    },
    { id: 'b', day: '2026-10-01' },
  ]);
  const included = new Set(['photos/a-2.jpg']);
  const manifest = toExportManifest(plan, included, new Date(Date.UTC(2026, 10, 8)));

  assert.deepEqual(manifest, {
    app: 'alcoholic',
    version: EXPORT_VERSION,
    exportedAt: '2026-11-08T00:00:00.000Z',
    posts: [
      {
        title: '맥주',
        content: '시원했어요.',
        day: '2026-11-01',
        location: '을지로',
        tags: ['라거'],
        createdAt: '2026-11-01T12:00:00.000Z',
        photos: ['photos/a-2.jpg'],
      },
      {
        title: '',
        content: '',
        day: '2026-10-01',
        location: '',
        tags: [],
        createdAt: null,
        photos: [],
      },
    ],
  });
});
