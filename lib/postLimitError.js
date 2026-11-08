import { POST_LIMITS } from '../constants/postLimits.js';

// 저장하기 전에 상한을 넘는 항목을 찾아 안내 문구를 돌려줌. 넘는 게 없으면 null
// 입력 칸에는 maxLength가 걸려 있어서, 상한이 생기기 전에 쓴 글을 고칠 때 주로 걸림
const getPostLimitError = ({ title, content, location, tags, photos }) => {
  if (title.length > POST_LIMITS.TITLE) {
    return `제목은 ${POST_LIMITS.TITLE}자까지 쓸 수 있어요.`;
  }
  if (content.length > POST_LIMITS.CONTENT) {
    return `내용은 ${POST_LIMITS.CONTENT}자까지 쓸 수 있어요.`;
  }
  if (location.length > POST_LIMITS.LOCATION) {
    return `장소는 ${POST_LIMITS.LOCATION}자까지 쓸 수 있어요.`;
  }
  if (tags.length > POST_LIMITS.TAGS) {
    return `태그는 ${POST_LIMITS.TAGS}개까지 넣을 수 있어요.`;
  }
  if (tags.some((tag) => tag.length > POST_LIMITS.TAG_LENGTH)) {
    return `태그는 하나에 ${POST_LIMITS.TAG_LENGTH}자까지 쓸 수 있어요.`;
  }
  if (photos.length > POST_LIMITS.PHOTOS) {
    return `사진은 ${POST_LIMITS.PHOTOS}장까지 넣을 수 있어요.`;
  }
  return null;
};

// 사진이나 제목 중 하나는 있어야 저장함. 실수로 저장을 눌러 기본 이미지에 제목도 없는 기록이 생기지 않게 함(#327)
// 공백만 넣은 제목은 없는 것으로 봄. 빠진 게 없으면 null
const getPostMissingError = ({ title, photos }) =>
  title.trim() === '' && photos.length === 0 ? '사진이나 제목 중 하나는 넣어 주세요.' : null;

export { getPostLimitError, getPostMissingError };
