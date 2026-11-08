// 별점 · 주종(#341)을 보여 주거나 거를 때 쓰는 함수
// React Native를 import하지 않아 node:test로 테스트함
import { DRINK_TYPES, MAX_RATING } from '../constants/drinkTypes.js';

// 코드 → 이름. 모르는 코드 · 빈 값이면 빈 문자열
const getDrinkTypeLabel = (code) => DRINK_TYPES.find((type) => type.code === code)?.label ?? '';

// 1~5 정수만 별점으로 봄. 아니면 null
const toRating = (value) =>
  Number.isInteger(value) && value >= 1 && value <= MAX_RATING ? value : null;

// 별점을 ★★★★☆ 모양으로. 별점이 없으면 빈 문자열
const formatRating = (value) => {
  const rating = toRating(value);
  return rating ? '★'.repeat(rating) + '☆'.repeat(MAX_RATING - rating) : '';
};

// 상세 화면 · 공유 글의 한 줄: '맥주 · ★★★★☆'. 둘 다 없으면 빈 문자열
const getDrinkLine = ({ drinkType, rating } = {}) =>
  [getDrinkTypeLabel(drinkType), formatRating(rating)].filter(Boolean).join(' · ');

// 내 글에 쓴 주종과 글 수를 목록 순서로. 쓴 적 없는 주종은 뺌(갤러리 필터 시트)
const countDrinkTypes = (posts) =>
  DRINK_TYPES.map(({ code, label }) => ({
    code,
    label,
    count: posts.filter((post) => post.drinkType === code).length,
  })).filter(({ count }) => count > 0);

export { countDrinkTypes, formatRating, getDrinkLine, getDrinkTypeLabel, toRating };
