// 사진을 올릴 때 넣을 content type을 파일 확장자로 정함. storage.rules는 image/*만 받음
// 줄인 사진은 모두 .jpg이고, 줄이지 못해 원본을 올릴 때만 다른 형식이 나옴
// React Native를 import하지 않아 node:test로 테스트함
const CONTENT_TYPES = {
  gif: 'image/gif',
  heic: 'image/heic',
  heif: 'image/heif',
  png: 'image/png',
  webp: 'image/webp',
};

const getImageContentType = (uri) => {
  const extension = uri
    .split(/[?#]/)[0]
    .match(/\.([a-z0-9]+)$/i)?.[1]
    .toLowerCase();
  return CONTENT_TYPES[extension] ?? 'image/jpeg';
};

export { getImageContentType };
