// 올리기 전에 사진을 얼마나 줄일지 계산함
// React Native를 import하지 않아 node:test로 테스트함
const MAX_SIDE = 1600;

// 긴 변을 maxSide로 맞출 크기. 이미 작거나 크기를 모르면 null(줄이지 않음)
const getResizeTarget = (width, height, maxSide = MAX_SIDE) => {
  if (!width || !height || Math.max(width, height) <= maxSide) {
    return null;
  }
  return width >= height ? { width: maxSide } : { height: maxSide };
};

export { getResizeTarget };
