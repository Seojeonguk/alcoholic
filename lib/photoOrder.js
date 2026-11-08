// 글 쓰기 · 수정 화면의 사진 순서 바꾸기(#332). 첫 사진이 갤러리 썸네일(대표 사진)이에요
// React Native를 import하지 않아 node:test로 테스트함

const isIndex = (index, length) => Number.isInteger(index) && index >= 0 && index < length;

// from 자리의 사진을 to 자리로 옮긴 새 배열을 돌려줌. 범위를 벗어나면 순서를 그대로 둠
const movePhoto = (photos = [], from, to) => {
  const next = [...photos];
  if (from === to || !isIndex(from, next.length) || !isIndex(to, next.length)) {
    return next;
  }
  const [photo] = next.splice(from, 1);
  next.splice(to, 0, photo);
  return next;
};

// index번째 사진(0부터)을 옮길 수 있는 곳. 두 번째 사진의 '앞으로'는 '대표 사진으로'와 같아서 넣지 않음
const getPhotoMoves = (index, total) => {
  if (!isIndex(index, total)) {
    return [];
  }
  const moves = [];
  if (index > 0) {
    moves.push({ key: 'cover', label: '대표 사진으로', to: 0 });
  }
  if (index > 1) {
    moves.push({ key: 'forward', label: '앞으로', to: index - 1 });
  }
  if (index < total - 1) {
    moves.push({ key: 'back', label: '뒤로', to: index + 1 });
  }
  return moves;
};

export { getPhotoMoves, movePhoto };
