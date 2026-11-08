// 설정의 "기록 내보내기"(#344)에서 zip에 담을 내용을 정함
// zip 구조: posts.json(글 목록) + photos/<글ID>-<순서>.<확장자>
// React Native를 import하지 않아 node:test로 테스트함

// posts.json 모양이 바뀌면 올림(나중에 가져오기를 만들 때 구분함)
const EXPORT_VERSION = 1;

const pad = (value) => String(value).padStart(2, '0');

// 공유 앱마다 한글 파일 이름을 다르게 다룰 수 있어서 영어로 씀
const getExportFileName = (date) =>
  `alcoholic-posts-${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}.zip`;

// 다운로드 URL은 경로가 %2F로 묶여 있고 ?alt=media가 붙음. 확장자가 없으면(지금 올리는 사진) jpg
const getPhotoExtension = (uri) => {
  const path = decodeURIComponent(String(uri ?? '').split('?')[0]);
  const match = path.match(/\.(jpe?g|png|webp|heic)$/i);
  if (!match) {
    return 'jpg';
  }
  const ext = match[1].toLowerCase();
  return ext === 'jpeg' ? 'jpg' : ext;
};

const toSafeName = (id) => String(id).replace(/[^A-Za-z0-9_-]/g, '_');

// 마신 날짜(day)가 최근인 글부터, 같은 날이면 나중에 쓴 글부터(갤러리와 같은 순서)
const byRecent = (a, b) =>
  String(b.day ?? '').localeCompare(String(a.day ?? '')) || (b.createdAt ?? 0) - (a.createdAt ?? 0);

// posts: [{ id, title, content, day, location, tags, createdAt(밀리초), photos: [기기 경로 · URL] }]
// photos: zip에 담을 사진 목록. source에서 읽어 path에 넣음
const planExport = (posts) => {
  const sorted = [...posts].sort(byRecent);
  const photos = sorted.flatMap((post) =>
    (post.photos ?? []).map((source, i) => ({
      postId: post.id,
      source,
      path: `photos/${toSafeName(post.id)}-${i + 1}.${getPhotoExtension(source)}`,
    }))
  );
  return { posts: sorted, photos };
};

// included: zip에 실제로 담은 사진 경로(Set). 받지 못한 사진은 글에서 뺌
const toExportManifest = (plan, included, exportedAt) => ({
  app: 'alcoholic',
  version: EXPORT_VERSION,
  exportedAt: exportedAt.toISOString(),
  posts: plan.posts.map((post) => ({
    title: post.title ?? '',
    content: post.content ?? '',
    day: post.day ?? '',
    location: post.location ?? '',
    tags: post.tags ?? [],
    createdAt: post.createdAt ? new Date(post.createdAt).toISOString() : null,
    photos: plan.photos
      .filter((photo) => photo.postId === post.id && included.has(photo.path))
      .map((photo) => photo.path),
  })),
});

export { EXPORT_VERSION, getExportFileName, getPhotoExtension, planExport, toExportManifest };
