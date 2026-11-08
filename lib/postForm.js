// 글 작성 폼에서 비교하는 값. 사진 · 태그는 순서도 화면에 보이므로 순서까지 비교함
const TEXT_FIELDS = ['title', 'day', 'content', 'location'];
const LIST_FIELDS = ['photos', 'tags'];
// 별점 · 주종(#341). 고르지 않으면 null이고, 예전 글에는 필드가 없어서 없음과 null을 같게 봄
const CHOICE_FIELDS = ['rating', 'drinkType'];

const isSameList = (a = [], b = []) => a.length === b.length && a.every((item, i) => item === b[i]);

// 수정 화면에 처음 들어올 때의 폼 값과 지금 값이 다른지 돌려줌(#302)
const isFormChanged = (original, current) =>
  TEXT_FIELDS.some((field) => (original?.[field] ?? '') !== (current?.[field] ?? '')) ||
  LIST_FIELDS.some((field) => !isSameList(original?.[field], current?.[field])) ||
  CHOICE_FIELDS.some((field) => (original?.[field] ?? null) !== (current?.[field] ?? null));

// 새 글 폼에 이어서 쓸 초안이 있는지 돌려줌. 날짜는 늘 채워져 있으므로 날짜만 다르면 초안으로 보지 않음(#324)
const hasDraft = (form) => isFormChanged({ day: form?.day }, form);

// Storage에 이미 올린 사진인지 돌려줌. 다운로드 주소는 https://로 시작하고,
// 기기 사진(file:// · content://)은 경로에 어떤 글자가 들어 있어도 올리지 않은 사진으로 봄(#303)
const isRemotePhoto = (uri) => typeof uri === 'string' && uri.startsWith('https://');

// 상세 화면의 "같은 술 다시 기록하기"(#343)로 시작할 새 글 초안
// 제목 · 태그 · 장소 · 주종만 옮기고, 그날의 사진 · 내용 · 별점은 비움. today: 'YYYY-MM-DD'
const toRepeatDraft = (post, today) => ({
  title: post?.title ?? '',
  day: today,
  photos: [],
  content: '',
  location: post?.location ?? '',
  tags: [...(post?.tags ?? [])],
  rating: null,
  drinkType: post?.drinkType ?? null,
});

export { hasDraft, isFormChanged, isRemotePhoto, toRepeatDraft };
