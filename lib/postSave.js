// 글 저장 흐름(services/posts.js의 savePost)에서 쓰는 판단 · 변환(#339)
// React Native를 import하지 않아 node:test로 테스트함

// 폼 값에서 저장할 글 내용만 꺼냄. photos는 올리거나 기기에 저장한 뒤의 주소
const toPostData = (form, photos) => ({
  title: form.title,
  day: form.day,
  photos,
  content: form.content,
  location: form.location,
  tags: form.tags,
});

// 사진마다 저장한 결과(Promise.allSettled)를 나눔
// uris: 폼의 사진 주소, isStored: 이미 올렸거나 기기에 저장해 둔 사진인지(다시 저장하지 않은 사진)
// photos: 글에 넣을 주소(실패한 칸은 null), newPhotos: 이번에 새로 저장한 사진(저장이 실패하면 지울 것)
// failed · error: 하나라도 실패했는지와 첫 번째 실패 이유
const splitStoredPhotos = (uris, results, isStored) => {
  const rejected = results.find((result) => result.status === 'rejected');
  return {
    photos: results.map((result) => (result.status === 'fulfilled' ? result.value : null)),
    newPhotos: results
      .filter((result, i) => result.status === 'fulfilled' && !isStored(uris[i]))
      .map((result) => result.value),
    failed: rejected !== undefined,
    error: rejected?.reason,
  };
};

export { splitStoredPhotos, toPostData };
