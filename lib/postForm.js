// 글 작성 폼에서 비교하는 값. 사진 · 태그는 순서도 화면에 보이므로 순서까지 비교함
const TEXT_FIELDS = ['title', 'day', 'content', 'location'];
const LIST_FIELDS = ['photos', 'tags'];

const isSameList = (a = [], b = []) => a.length === b.length && a.every((item, i) => item === b[i]);

// 수정 화면에 처음 들어올 때의 폼 값과 지금 값이 다른지 돌려줌(#302)
const isFormChanged = (original, current) =>
  TEXT_FIELDS.some((field) => (original?.[field] ?? '') !== (current?.[field] ?? '')) ||
  LIST_FIELDS.some((field) => !isSameList(original?.[field], current?.[field]));

// Storage에 이미 올린 사진인지 돌려줌. 다운로드 주소는 https://로 시작하고,
// 기기 사진(file:// · content://)은 경로에 어떤 글자가 들어 있어도 올리지 않은 사진으로 봄(#303)
const isRemotePhoto = (uri) => typeof uri === 'string' && uri.startsWith('https://');

export { isFormChanged, isRemotePhoto };
