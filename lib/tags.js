// 앞뒤 공백과 앞의 #을 떼고 태그를 더함. 화면에서 #을 붙여 보여 주므로 직접 쓴 #은 뺌
// 빈 태그나 이미 있는 태그는 넣지 않고 원래 목록을 그대로 돌려줌
const addUniqueTag = (tags, input) => {
  const tag = input.trim().replace(/^#+/, '').trim();
  if (tag === '' || tags.includes(tag)) {
    return tags;
  }
  return [...tags, tag];
};

export { addUniqueTag };
