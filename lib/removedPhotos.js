// 글을 고치기 전 사진 중 고친 뒤에 빠진 사진을 돌려줌. 순서만 바뀐 사진은 지우지 않음
const getRemovedPhotos = (before = [], after = []) =>
  before.filter((photo) => !after.includes(photo));

export { getRemovedPhotos };
