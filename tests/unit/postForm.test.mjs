import assert from 'node:assert/strict';
import { test } from 'node:test';

import { hasDraft, isFormChanged, isRemotePhoto } from '../../lib/postForm.js';

const original = {
  title: '맥주',
  day: '2026-10-01',
  photos: ['https://a', 'https://b'],
  content: '맛있어요',
  location: '집',
  tags: ['라거'],
};

test('isFormChanged: 고친 게 없으면 false예요', () => {
  assert.equal(isFormChanged(original, { ...original }), false);
  assert.equal(
    isFormChanged(original, { ...original, photos: [...original.photos], tags: ['라거'] }),
    false
  );
});

test('isFormChanged: 글자 값을 고치면 true예요', () => {
  assert.equal(isFormChanged(original, { ...original, title: '와인' }), true);
  assert.equal(isFormChanged(original, { ...original, day: '2026-10-02' }), true);
  assert.equal(isFormChanged(original, { ...original, content: '' }), true);
  assert.equal(isFormChanged(original, { ...original, location: '바' }), true);
});

test('isFormChanged: 사진 · 태그를 더하거나 빼거나 순서를 바꾸면 true예요', () => {
  assert.equal(isFormChanged(original, { ...original, photos: ['https://a'] }), true);
  assert.equal(isFormChanged(original, { ...original, photos: ['https://b', 'https://a'] }), true);
  assert.equal(isFormChanged(original, { ...original, tags: ['라거', '필스너'] }), true);
  assert.equal(isFormChanged(original, { ...original, tags: [] }), true);
});

test('isFormChanged: 필드가 없던 예전 글은 빈 값과 같게 봐요', () => {
  const old = { title: '맥주', day: '2026-10-01' };
  assert.equal(
    isFormChanged(old, { ...old, photos: [], content: '', location: '', tags: [] }),
    false
  );
});

test('isRemotePhoto: Storage 다운로드 주소만 올린 사진으로 봐요', () => {
  assert.equal(
    isRemotePhoto(
      'https://firebasestorage.googleapis.com/v0/b/app.appspot.com/o/posts%2Fuid%2Fid?alt=media'
    ),
    true
  );
});

test('isRemotePhoto: 경로에 firebase가 들어간 기기 사진은 올리지 않은 사진이에요', () => {
  assert.equal(isRemotePhoto('file:///data/user/0/app/cache/firebase/photo.jpg'), false);
  assert.equal(isRemotePhoto('file:///storage/emulated/0/Pictures/firebase.jpg'), false);
  assert.equal(isRemotePhoto('content://media/external/images/media/firebase/1'), false);
});

test('isRemotePhoto: 비회원 기기 사진 · 그 밖의 값은 false예요', () => {
  assert.equal(isRemotePhoto('file:///data/user/0/app/files/guest/photos/id.jpg'), false);
  assert.equal(isRemotePhoto('http://example.com/a.jpg'), false);
  assert.equal(isRemotePhoto(''), false);
  assert.equal(isRemotePhoto(undefined), false);
});

test('hasDraft: 빈 폼이면 날짜가 무엇이든 초안이 아니에요', () => {
  const empty = { title: '', day: '2026-11-07', content: '', location: '', photos: [], tags: [] };
  assert.equal(hasDraft(empty), false);
});

test('hasDraft: 제목 · 내용 · 장소 · 사진 · 태그 중 하나라도 있으면 초안이에요', () => {
  const empty = { title: '', day: '2026-11-07', content: '', location: '', photos: [], tags: [] };
  assert.equal(hasDraft({ ...empty, title: '맥주' }), true);
  assert.equal(hasDraft({ ...empty, content: '맛있음' }), true);
  assert.equal(hasDraft({ ...empty, location: '집' }), true);
  assert.equal(hasDraft({ ...empty, photos: ['file:///a.jpg'] }), true);
  assert.equal(hasDraft({ ...empty, tags: ['맥주'] }), true);
});

test('isFormChanged: 별점 · 주종을 바꾸면 true, 없음과 null은 같게 봐요', () => {
  assert.equal(isFormChanged(original, { ...original, rating: 4 }), true);
  assert.equal(isFormChanged(original, { ...original, drinkType: 'beer' }), true);
  assert.equal(isFormChanged(original, { ...original, rating: null, drinkType: null }), false);
  assert.equal(
    isFormChanged({ ...original, rating: 4 }, { ...original, rating: 4, drinkType: null }),
    false
  );
});
