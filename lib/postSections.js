// 갤러리를 마신 날짜(day)순으로 정렬하고 월별로 묶음
// React Native를 import하지 않아 node:test로 테스트함
const DAY_PATTERN = /^(\d{4})-(\d{2})-\d{2}$/;
const NO_DAY_TITLE = '날짜 없음';

const isValidDay = (day) => typeof day === 'string' && DAY_PATTERN.test(day);

// day 내림차순, 같은 날은 최근에 쓴 글 먼저. day가 없거나 형식이 다르면 맨 뒤
const sortPostsByDay = (posts) =>
  [...posts].sort((a, b) => {
    const aValid = isValidDay(a.day);
    const bValid = isValidDay(b.day);
    if (aValid !== bValid) {
      return aValid ? -1 : 1;
    }
    if (aValid && a.day !== b.day) {
      return a.day < b.day ? 1 : -1;
    }
    return (b.createdAt ?? 0) - (a.createdAt ?? 0);
  });

// 올해면 '10월', 다른 해면 '2025년 12월'
const formatMonthTitle = (day, now) => {
  const [, year, month] = day.match(DAY_PATTERN);
  const monthTitle = `${Number(month)}월`;
  return Number(year) === now.getFullYear() ? monthTitle : `${year}년 ${monthTitle}`;
};

const groupPostsByMonth = (posts, now) => {
  const sections = [];
  sortPostsByDay(posts).forEach((post) => {
    const title = isValidDay(post.day) ? formatMonthTitle(post.day, now) : NO_DAY_TITLE;
    const last = sections[sections.length - 1];
    if (last?.title === title) {
      last.data.push(post);
    } else {
      sections.push({ title, data: [post] });
    }
  });
  return sections;
};

export { formatMonthTitle, groupPostsByMonth, sortPostsByDay };
