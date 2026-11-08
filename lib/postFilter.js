// 갤러리를 태그 · 기간으로 거름. 내 글은 이미 모두 불러와 있어서 Firestore에 다시 묻지 않음
// React Native를 import하지 않아 node:test로 테스트함
const DAY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

// 내 글에 쓴 태그와 그 태그를 쓴 글 수를 많이 쓴 순서로 모음. 같으면 이름순
// 태그 시트에 개수와 함께 보여 줌(#331). 한 글에 같은 태그가 두 번 있어도 한 번으로 셈
const countTags = (posts) => {
  const counts = new Map();
  posts.forEach((post) => {
    new Set(post.tags ?? []).forEach((tag) => counts.set(tag, (counts.get(tag) ?? 0) + 1));
  });
  return [...counts.entries()]
    .sort(([aTag, aCount], [bTag, bCount]) => bCount - aCount || aTag.localeCompare(bTag))
    .map(([tag, count]) => ({ tag, count }));
};

// 태그 이름만 많이 쓴 순서로
const collectTags = (posts) => countTags(posts).map(({ tag }) => tag);

// 태그 시트의 검색. 앞의 #와 앞뒤 공백은 빼고, 영문은 대소문자를 가리지 않고 이름에 들어 있으면 남김
// 검색어가 비면 그대로 돌려줌
const searchTags = (tagCounts, query) => {
  const keyword = (query ?? '').trim().replace(/^#+/, '').toLowerCase();
  if (!keyword) {
    return tagCounts;
  }
  return tagCounts.filter(({ tag }) => tag.toLowerCase().includes(keyword));
};

// from · to는 'YYYY-MM-DD'이고 그날도 포함함. 기간을 걸면 날짜가 없는 글은 빠짐
const filterPosts = (posts, { tag, from, to }) =>
  posts.filter((post) => {
    if (tag && !(post.tags ?? []).includes(tag)) {
      return false;
    }
    if (from && to) {
      const isValidDay = typeof post.day === 'string' && DAY_PATTERN.test(post.day);
      return isValidDay && post.day >= from && post.day <= to;
    }
    return true;
  });

export { collectTags, countTags, filterPosts, searchTags };
