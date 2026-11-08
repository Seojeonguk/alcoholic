// 갤러리 구독에서 쓰는 판단 · 변환(#300)
// React Native를 import하지 않아 node:test로 테스트함

// 구독할 계정. 인증을 마친 회원이면 이메일, 아니면(비회원 · 로그아웃) null
// 이 값이 바뀌면 갤러리가 구독을 끊고 새 계정으로 다시 구독함
const memberEmail = (user) => (user?.emailVerified === true && user.email ? user.email : null);

// Timestamp(toMillis) · Date(getTime) 모두 밀리초로 바꿈. 없으면 0
const toMillis = (value) => value?.toMillis?.() ?? value?.getTime?.() ?? 0;

// Firestore 글 문서를 갤러리 목록 항목으로 바꿈
const toGalleryPost = (docId, data) => ({
  docId,
  // 사진이 없는 글은 null. 화면에서 기본 이미지(DEFAULT_PHOTO)를 보여 줌
  presentivePhoto: data?.photos?.[0] ?? null,
  day: data?.day,
  // 화면 낭독기가 같은 날 기록을 구분하도록 칸 라벨에 넣음(#330)
  title: data?.title ?? '',
  // 갤러리 검색(#333)에서 제목 · 태그와 함께 찾음
  location: data?.location ?? '',
  content: data?.content ?? '',
  // 갤러리에서 태그로 거를 때 씀
  tags: data?.tags ?? [],
  createdAt: toMillis(data?.createdAt),
});

export { memberEmail, toGalleryPost, toMillis };
