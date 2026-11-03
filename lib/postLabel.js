// 갤러리 사진 칸을 TalkBack이 읽을 이름. '2026-11-02' → '11월 2일 기록', 날짜가 없거나 형식이 다르면 '기록'
const DAY_PATTERN = /^\d{4}-(\d{2})-(\d{2})$/;

const getPostLabel = (day) => {
  const match = typeof day === 'string' && day.match(DAY_PATTERN);
  if (!match) {
    return '기록';
  }
  const [, month, date] = match;
  return `${Number(month)}월 ${Number(date)}일 기록`;
};

export { getPostLabel };
