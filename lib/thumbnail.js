// 갤러리 썸네일(#338). 회원 글은 대표 사진(photos[0])을 작게 줄인 사진을 따로 올리고 글의 thumbnail에 URL을 둠
// 갤러리는 썸네일을, 상세 화면은 원본을 받음. 썸네일이 없는 글(예전 글 · 비회원)은 대표 사진을 그대로 보여 줌
// React Native를 import하지 않아 node:test로 테스트함

// 글을 저장할 때 썸네일을 어떻게 할지 정함
// cover: 저장할 대표 사진 URL, originalCover · originalThumbnail: 고치기 전 값(새 글이면 없음)
// action: 'keep' 그대로 둠, 'make' 새로 만듦, 'none' 썸네일 없음
// removed: 저장한 뒤 지울 예전 썸네일(없으면 null)
const planThumbnail = ({ cover, originalCover, originalThumbnail }) => {
  const previous = originalThumbnail ?? null;
  if (!cover) {
    return { action: 'none', removed: previous };
  }
  if (cover === originalCover && previous) {
    return { action: 'keep', removed: null };
  }
  return { action: 'make', removed: previous };
};

// 갤러리 칸에 보여 줄 사진
const getGalleryPhoto = (item) => item.thumbnail ?? item.presentivePhoto ?? null;

// 글을 지울 때 함께 지울 사진(원본 + 썸네일)
const withThumbnail = (photos, thumbnail) => [...(photos ?? []), ...(thumbnail ? [thumbnail] : [])];

export { getGalleryPhoto, planThumbnail, withThumbnail };
