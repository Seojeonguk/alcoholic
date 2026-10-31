// 갤러리를 태그 · 기간으로 거름. 내 글은 이미 모두 불러와 있어서 Firestore에 다시 묻지 않음
// React Native를 import하지 않아 node:test로 테스트함
const DAY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

// 내 글에 쓴 태그를 많이 쓴 순서로 모음. 같으면 이름순
const collectTags = (posts) => {
  const counts = new Map();
  posts.forEach((post) => {
    (post.tags ?? []).forEach((tag) => counts.set(tag, (counts.get(tag) ?? 0) + 1));
  });
  return [...counts.entries()]
    .sort(([aTag, aCount], [bTag, bCount]) => bCount - aCount || aTag.localeCompare(bTag))
    .map(([tag]) => tag);
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

export { collectTags, filterPosts };
