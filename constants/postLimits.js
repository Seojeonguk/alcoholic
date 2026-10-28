// 글 한 개의 길이 · 개수 상한. firestore.rules의 validPost와 같은 숫자를 써야 함
const POST_LIMITS = {
  TITLE: 40,
  CONTENT: 2000,
  LOCATION: 50,
  TAGS: 20,
  TAG_LENGTH: 20,
  PHOTOS: 10,
};

export { POST_LIMITS };
