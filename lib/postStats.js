// 통계 탭(#342)에서 보여 줄 값을 이미 받아 온 글 목록으로 계산함(Firestore를 따로 읽지 않음)
// React Native를 import하지 않아 node:test로 테스트함
import { countDrinkTypes, toRating } from './drinkType.js';
import { countTags } from './postFilter.js';
import { countLocations } from './postSuggest.js';

const DAY_PATTERN = /^(\d{4})-(\d{2})-\d{2}$/;
const MONTHS = 12;
const TOP_LIMIT = 5;

const pad = (value) => String(value).padStart(2, '0');

// 'YYYY-MM'. 형식이 다른 날짜면 null
const toMonthKey = (day) => {
  const match = typeof day === 'string' ? day.match(DAY_PATTERN) : null;
  return match ? `${match[1]}-${match[2]}` : null;
};

// 이번 달까지 최근 12개월의 기록 수. 오래된 달부터
const getMonthlyCounts = (posts, now) => {
  const counts = new Map();
  posts.forEach(({ day }) => {
    const key = toMonthKey(day);
    if (key) {
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
  });
  return Array.from({ length: MONTHS }, (_, i) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (MONTHS - 1 - i), 1);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const key = `${year}-${pad(month)}`;
    return {
      key,
      label: `${month}월`,
      // 막대 아래에는 월만 쓰고, 낭독기는 해까지 읽어 줌
      a11yLabel: `${year}년 ${month}월`,
      count: counts.get(key) ?? 0,
    };
  });
};

// 별점을 남긴 기록만으로 평균을 냄(소수 첫째 자리). 없으면 average는 null
const getAverageRating = (posts) => {
  const ratings = posts.map((post) => toRating(post.rating)).filter((rating) => rating != null);
  if (ratings.length === 0) {
    return { average: null, count: 0 };
  }
  const sum = ratings.reduce((total, rating) => total + rating, 0);
  return { average: Math.round((sum / ratings.length) * 10) / 10, count: ratings.length };
};

// 많이 쓴 순서로 TOP_LIMIT개. 같으면 원래 순서(주종은 목록 순서, 태그 · 장소는 이름순)
const top = (items) =>
  items
    .map((item, i) => ({ item, i }))
    .sort((a, b) => b.item.count - a.item.count || a.i - b.i)
    .slice(0, TOP_LIMIT)
    .map(({ item }) => item);

// 순위 막대가 같은 모양({ key, label, count })을 쓰게 맞춤
const getPostStats = (posts, now) => {
  const thisMonthKey = `${now.getFullYear()}-${pad(now.getMonth() + 1)}`;
  const thisYear = String(now.getFullYear());
  const monthKeys = posts.map((post) => toMonthKey(post.day));

  return {
    total: posts.length,
    thisMonth: monthKeys.filter((key) => key === thisMonthKey).length,
    thisYear: monthKeys.filter((key) => key?.startsWith(`${thisYear}-`)).length,
    rating: getAverageRating(posts),
    monthly: getMonthlyCounts(posts, now),
    drinkTypes: top(
      countDrinkTypes(posts).map(({ code, label, count }) => ({ key: code, label, count }))
    ),
    tags: top(countTags(posts).map(({ tag, count }) => ({ key: tag, label: `#${tag}`, count }))),
    locations: top(
      countLocations(posts).map(({ name, count }) => ({ key: name, label: name, count }))
    ),
  };
};

export { getAverageRating, getMonthlyCounts, getPostStats };
