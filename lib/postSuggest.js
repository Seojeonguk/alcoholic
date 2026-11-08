// 글을 쓸 때 전에 쓴 태그 · 장소를 칩으로 추천함(#336)
// React Native를 import하지 않아 node:test로 테스트함
const DEFAULT_LIMIT = 8;

// 내 글에 쓴 장소와 그 장소를 쓴 글 수를 많이 쓴 순서로 모음. 같으면 이름순
// 앞뒤 공백은 떼고 같은 장소로 셈. 통계 탭(#342)에서도 씀
const countLocations = (posts) => {
  const counts = new Map();
  posts.forEach(({ location }) => {
    const name = typeof location === 'string' ? location.trim() : '';
    if (name) {
      counts.set(name, (counts.get(name) ?? 0) + 1);
    }
  });
  return [...counts.entries()]
    .sort(([aName, aCount], [bName, bCount]) => bCount - aCount || aName.localeCompare(bName))
    .map(([name, count]) => ({ name, count }));
};

// 장소 이름만 많이 쓴 순서로
const collectLocations = (posts) => countLocations(posts).map(({ name }) => name);

// 많이 쓴 순서의 values에서 입력한 글자가 들어 있는 것을 limit개까지 고름
// 앞의 #와 앞뒤 공백은 빼고, 영문은 대소문자를 가리지 않음
// exclude(이미 넣은 태그)와 입력과 똑같은 값(이미 다 쓴 장소)은 추천하지 않음
const suggestValues = (values, input, { exclude = [], limit = DEFAULT_LIMIT } = {}) => {
  const keyword = (input ?? '').trim().replace(/^#+/, '').trim().toLowerCase();
  return values
    .filter((value) => {
      const lower = value.toLowerCase();
      return !exclude.includes(value) && lower !== keyword && lower.includes(keyword);
    })
    .slice(0, limit);
};

export { collectLocations, countLocations, suggestValues };
