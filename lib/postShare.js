// 상세 화면 메뉴의 "공유하기"로 보낼 글(#335). 상세 화면과 같은 순서로 이음
// 제목
// 날짜 · 장소
//
// 내용
//
// #태그 #태그
// 빈 항목은 빼고, 남길 것이 없으면 빈 문자열. React Native를 import하지 않아 node:test로 테스트함
import { formatDay } from './formatDay.js';

const clean = (value) => (typeof value === 'string' ? value.trim() : '');

const getShareText = ({ title, day, location, content, tags } = {}) => {
  const head = [clean(title), [formatDay(clean(day)), clean(location)].filter(Boolean).join(' · ')]
    .filter(Boolean)
    .join('\n');
  const tagLine = (Array.isArray(tags) ? tags : [])
    .map(clean)
    .filter(Boolean)
    .map((tag) => `#${tag}`)
    .join(' ');
  return [head, clean(content), tagLine].filter(Boolean).join('\n\n');
};

export { getShareText };
