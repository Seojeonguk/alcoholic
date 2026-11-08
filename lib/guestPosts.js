// 비회원(가입 없이 쓰기, #201) 기록을 다루는 순수 함수
// React Native를 import하지 않아 node:test로 테스트함
// 기기 글 모양: { id, title, day, photos(사진 파일 이름), content, location, tags, createdAt(ms), owner(uid | null) }
// owner: 옮기기를 시작한 계정의 uid. 주인이 적힌 글은 그 계정으로만 옮기고 비회원 화면에는 보이지 않음

// 인증된 로그인이 있으면 항상 회원. 가입만 하고 인증하지 않은 계정은 비회원 표시를 따름
const getAppMode = ({ hasVerifiedUser, guestFlag }) => {
  if (hasVerifiedUser) {
    return 'member';
  }
  return guestFlag ? 'guest' : 'start';
};

// 파일이 없으면(null) 빈 목록. 깨지거나 빈 파일을 빈 목록으로 보고 덮어쓰면 기록이 모두 사라지므로 에러를 던짐
const parseLocalPosts = (text) => {
  if (text == null) {
    return [];
  }
  const posts = JSON.parse(text);
  if (!Array.isArray(posts)) {
    throw new Error('기기에 저장된 기록 파일의 형식이 올바르지 않아요.');
  }
  return posts;
};

// 저장할 때 임시 파일에 쓴 뒤 원래 파일로 바꿈. 바꾸는 중(원래 파일을 지운 뒤)에 꺼지면 임시 파일만 남으므로 그것을 읽음
const readStoredPosts = ({ main, tmp }) => parseLocalPosts(main ?? tmp);

// iOS는 앱을 업데이트하면 앱 폴더 경로가 바뀔 수 있어서 사진은 파일 이름만 저장하고 쓸 때 경로를 만듦
const toPhotoName = (uriOrName) => uriOrName.split('/').pop();

const visiblePosts = (posts) => posts.filter((post) => post.owner == null);

// 갤러리 목록 모양(lib/galleryPosts의 toGalleryPost와 같음). 최근에 쓴 글부터. toUri: 사진 파일 이름 → 기기 경로
const toGalleryItems = (posts, toUri) =>
  visiblePosts(posts)
    .map((post) => ({
      docId: post.id,
      presentivePhoto: post.photos?.[0] ? toUri(post.photos[0]) : null,
      day: post.day,
      title: post.title ?? '',
      location: post.location ?? '',
      content: post.content ?? '',
      tags: post.tags ?? [],
      drinkType: post.drinkType ?? null,
      rating: post.rating ?? null,
      createdAt: post.createdAt ?? 0,
    }))
    .sort((a, b) => b.createdAt - a.createdAt);

const claimPosts = (posts, uid) =>
  posts.map((post) => (post.owner == null ? { ...post, owner: uid } : post));

const postsToMigrate = (posts, uid) => posts.filter((post) => post.owner === uid);

// 다시 옮겨도 같은 Storage 경로가 되도록 기기 파일 이름을 사진 ID로 씀
const photoIdFromUri = toPhotoName;

// Firestore 글 모양(firestore.rules의 validPost)
const toRemotePost = (post, email, photoUrls) => ({
  title: post.title,
  day: post.day,
  photos: photoUrls,
  content: post.content,
  location: post.location,
  tags: post.tags ?? [],
  rating: post.rating ?? null,
  drinkType: post.drinkType ?? null,
  writer: email,
  createdAt: new Date(post.createdAt),
});

// 비회원이 설정에서 백업하러 첫 화면에 왔을 때 기록이 사라지지 않았다는 걸 알려 줌
const backupMessage = (count) =>
  count > 0
    ? `이 기기에 있는 기록 ${count}개는 그대로 있어요. 가입하거나 로그인하면 계정으로 옮겨요.`
    : '가입하거나 로그인하면 앞으로 남기는 기록이 계정에 저장돼요.';

export {
  backupMessage,
  claimPosts,
  getAppMode,
  parseLocalPosts,
  photoIdFromUri,
  postsToMigrate,
  readStoredPosts,
  toGalleryItems,
  toPhotoName,
  toRemotePost,
  visiblePosts,
};
