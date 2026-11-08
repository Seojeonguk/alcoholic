// 갤러리 사진 칸을 TalkBack이 읽을 이름. 같은 날 기록끼리 구분되게 제목을 앞에 붙임(#330)
// { title: '맥주', day: '2026-11-02' } → '맥주, 11월 2일'
// 제목이 없으면 '11월 2일 기록', 날짜가 없거나 형식이 다르면 제목만(제목도 없으면 '기록')
const DAY_PATTERN = /^\d{4}-(\d{2})-(\d{2})$/;

const formatMonthDay = (day) => {
  const match = typeof day === 'string' && day.match(DAY_PATTERN);
  if (!match) {
    return null;
  }
  const [, month, date] = match;
  return `${Number(month)}월 ${Number(date)}일`;
};

const getPostLabel = ({ title, day } = {}) => {
  const name = typeof title === 'string' ? title.trim() : '';
  const monthDay = formatMonthDay(day);
  if (name && monthDay) {
    return `${name}, ${monthDay}`;
  }
  if (name) {
    return name;
  }
  return monthDay ? `${monthDay} 기록` : '기록';
};

// 상세 화면 사진 TalkBack 이름. 0부터 센 순서를 받아 '사진 2/5'
const getPhotoLabel = (index, total) => `사진 ${index + 1}/${total}`;

export { getPhotoLabel, getPostLabel };
