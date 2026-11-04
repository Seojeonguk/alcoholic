# 회원가입 없이 쓰기 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 가입 없이 기기에만 기록을 남기고, 인증된 계정으로 로그인하면 그 기록을 계정으로 옮기는 비회원 모드를 만들어요(#201).

**Architecture:** 화면은 `isMember()`(인증된 로그인이 있는지)로 회원 · 비회원을 가르고, 비회원이면 기기 저장소(`services/localPosts.js`, `expo-file-system`)를, 회원이면 지금의 Firestore 함수(`services/docs.js`)를 불러요. 판단 · 변환 · 고르기는 `lib/guestPosts.js`의 순수 함수로 두고 단위 테스트해요. 옮기기(`services/migrateGuestPosts.js`)는 회원이 갤러리에 들어올 때 hook으로 돌려요.

**Tech Stack:** Expo SDK 58, `expo-file-system` 58(`File` · `Directory` · `Paths` API), `@react-native-async-storage/async-storage`, `@react-native-firebase` 27, `node --test`, `@firebase/rules-unit-testing`

**Spec:** `docs/superpowers/specs/2026-11-02-guest-mode-design.md`

## Global Constraints

- 저장소 규칙은 CLAUDE.md를 따라요: 한국어 해요체 문구 · 주석, import 순서(React · RN → 프로젝트 → 외부), `NAVIGATOR` · `COLORS` 상수, `showToast`, 패키지는 `npx expo install`.
- 비회원 기록 · 사진은 **가입 전에 서버로 보내지 않아요.**
- 보안 규칙(`firestore.rules` · `storage.rules`)과 Firestore 데이터 모양은 바꾸지 않아요.
- 비회원 글에도 `constants/postLimits.js` 상한(`getPostLimitError`)을 그대로 적용해요.
- 사진 · 오디오 권한을 추가하지 않아요.
- 문구(스펙 그대로):
  - 첫 화면 버튼: `가입 없이 시작하기`
  - 설정 계정 줄: `가입하고 기록 백업하기`
  - 설정 안내: `기록은 이 기기에만 있어요. 앱을 지우면 기록도 사라져요.`
  - 설정 맨 아래: `기기의 기록 모두 지우기`, 확인 창 본문 `기기에 저장된 기록과 사진이 모두 삭제되며 되돌릴 수 없어요.`
  - 옮기는 중: `기기의 기록 옮기는 중 {done}/{total}`
  - 끝: `기기에 있던 기록 {n}개를 계정으로 옮겼어요.` / 일부 실패: `기록 {n}개를 옮기지 못했어요. 다음에 다시 시도할게요.`
- 커밋은 작업마다 `timeout 60 git commit -s`로 하고, PR 전에 하나로 합쳐요(PR 하나 = 커밋 하나). Claude attribution을 넣지 않아요.

## Review Focus

1. **`posts.json`이 깨졌을 때** 빈 목록으로 보고 덮어쓰면 기록이 모두 사라져요. 읽기는 에러를 던지고 쓰기를 멈춰야 해요 → Task 1 `parseLocalPosts` 테스트.
2. **기기 사진 파일이 사라진 글**(사용자가 파일을 지움 등)은 옮기기가 영원히 실패하면 안 돼요. 없는 사진은 빼고 글은 옮겨요 → Task 6 Step 3, Task 1 `toRemotePost` 테스트.
3. **인증하지 않은 계정이 로그인돼 있는 비회원**(가입만 하고 메일 확인 전)은 비회원으로 보여야 해요 → Task 1 `getAppMode` 테스트.
4. **비회원이 설정에서 첫 화면으로 갔을 때** 비회원 표시 때문에 바로 갤러리로 튕기면 안 돼요 → Task 3 `fromGuest` 파라미터.
5. **옮기기가 두 번 동시에 돌 때**(갤러리에 빨리 다시 들어옴) 같은 글을 두 번 처리하면 안 돼요 → Task 6 모듈 단위 실행 중 표시.

---

### Task 1: 비회원 데이터 순수 함수

**Files:**
- Create: `lib/guestPosts.js`
- Modify: `lib/index.js`(다시 내보내기)
- Test: `tests/unit/guestPosts.test.mjs`

**Interfaces:**
- Produces:
  - 기기 글 모양 `LocalPost = { id: string, title, day, photos: string[] /* file:// URI */, content, location, tags: string[], createdAt: number /* ms */, owner: string | null /* uid */ }`
  - `getAppMode({ hasVerifiedUser: boolean, guestFlag: boolean }) -> 'member' | 'guest' | 'start'`
  - `parseLocalPosts(text: string | null) -> LocalPost[]` — `null`/빈 문자열이면 `[]`, JSON이 아니거나 배열이 아니면 `Error` 던짐
  - `visiblePosts(posts) -> LocalPost[]` — `owner == null`인 것만
  - `toGalleryItems(posts) -> { docId, presentivePhoto, day, tags, createdAt }[]` — `visiblePosts` 기준, `createdAt` 내림차순, 사진 없으면 `presentivePhoto: null`
  - `claimPosts(posts, uid) -> LocalPost[]` — 주인 없는 글에 `owner: uid`
  - `postsToMigrate(posts, uid) -> LocalPost[]` — `owner == uid`인 글만(`claimPosts` 다음에 부름)
  - `photoIdFromUri(uri) -> string` — 경로 마지막 조각(파일 이름)
  - `toRemotePost(post, email, photoUrls) -> { title, day, photos, content, location, tags, writer, createdAt: Date }` — `id` · `owner`는 빼요

- [ ] **Step 1: 실패하는 테스트 쓰기** (`tests/unit/guestPosts.test.mjs`, 기존 테스트처럼 `node:test` + `assert/strict`)

```js
test('getAppMode: 인증된 로그인이 있으면 비회원 표시가 있어도 회원이에요', () => {
  assert.equal(getAppMode({ hasVerifiedUser: true, guestFlag: true }), 'member');
});
test('getAppMode: 인증 전 계정만 있고 비회원 표시가 있으면 비회원이에요', () => {
  assert.equal(getAppMode({ hasVerifiedUser: false, guestFlag: true }), 'guest');
});
test('getAppMode: 둘 다 없으면 처음이에요', () => {
  assert.equal(getAppMode({ hasVerifiedUser: false, guestFlag: false }), 'start');
});
test('parseLocalPosts: 파일이 없으면 빈 목록이에요', () => {
  assert.deepEqual(parseLocalPosts(null), []);
  assert.deepEqual(parseLocalPosts(''), []);
});
test('parseLocalPosts: 깨진 파일은 빈 목록으로 보지 않고 에러를 던져요', () => {
  assert.throws(() => parseLocalPosts('{"id":'));
  assert.throws(() => parseLocalPosts('{"id":"a"}'));
});
test('toGalleryItems: 주인 없는 글만 최근에 쓴 순서로 갤러리 모양으로 바꿔요', () => {
  const items = toGalleryItems([
    post({ id: 'a', createdAt: 1, photos: ['file:///p/1.jpg'] }),
    post({ id: 'b', createdAt: 2, photos: [] }),
    post({ id: 'c', createdAt: 3, owner: 'uid-a' }),
  ]);
  assert.deepEqual(items.map((i) => i.docId), ['b', 'a']);
  assert.equal(items[0].presentivePhoto, null);
  assert.equal(items[1].presentivePhoto, 'file:///p/1.jpg');
});
test('claimPosts · postsToMigrate: 처음 옮기기 시작한 계정의 글만 옮겨요', () => {
  const claimed = claimPosts([post({ id: 'a' }), post({ id: 'b', owner: 'uid-a' })], 'uid-b');
  assert.deepEqual(claimed.map((p) => p.owner), ['uid-b', 'uid-a']);
  assert.deepEqual(postsToMigrate(claimed, 'uid-b').map((p) => p.id), ['a']);
  assert.deepEqual(postsToMigrate(claimed, 'uid-a').map((p) => p.id), ['b']);
});
test('photoIdFromUri: 파일 이름을 사진 ID로 써요', () => {
  assert.equal(photoIdFromUri('file:///data/guest/photos/abc.jpg'), 'abc.jpg');
});
test('toRemotePost: writer와 Date createdAt을 넣고 id · owner는 빼요', () => {
  const remote = toRemotePost(post({ id: 'a', owner: 'u', createdAt: 1000 }), 'me@example.com', ['https://x']);
  assert.equal(remote.writer, 'me@example.com');
  assert.deepEqual(remote.photos, ['https://x']);
  assert.ok(remote.createdAt instanceof Date && remote.createdAt.getTime() === 1000);
  assert.equal('id' in remote || 'owner' in remote, false);
});
```

`post(overrides)`는 테스트 파일 안의 기본 `LocalPost`(`owner: null`) 만들기 도우미예요.

- [ ] **Step 2: 실패 확인** — `npm run test:unit` → `guestPosts` 테스트가 모듈을 찾지 못해 FAIL
- [ ] **Step 3: `lib/guestPosts.js` 구현**, `lib/index.js`에서 다시 내보내기
- [ ] **Step 4: 통과 확인** — `npm run test:unit` → `ℹ fail 0`
- [ ] **Step 5: 커밋**

### Task 2: 기기 저장소

**Files:**
- Create: `services/localPosts.js`
- Modify: `services/index.js`, `package.json` · `package-lock.json`(`npx expo install expo-file-system`)

**Interfaces:**
- Consumes: Task 1 `parseLocalPosts`, `visiblePosts`, `toGalleryItems`, `claimPosts`, `postsToMigrate`
- Produces:
  - `GUEST_PHOTO_DIR_URI: string` — `Paths.document`/`guest/photos/`의 URI
  - `isLocalPhoto(uri) -> boolean` — `GUEST_PHOTO_DIR_URI`로 시작하는지
  - `saveLocalPhoto(uri) -> Promise<string>` — `guest/photos/{uuid}.jpg`로 복사하고 새 URI 반환
  - `getLocalPosts() -> Promise<GalleryItem[]>` — 화면용(주인 없는 글)
  - `getLocalPost(id) -> Promise<LocalPost | null>` — 주인 없는 글만
  - `createLocalPost(data) -> Promise<void>` — `data`는 폼 필드 + `photos`(기기 URI) + `createdAt`(ms). `id`는 `uuid.v4()`, `owner: null`
  - `updateLocalPost(id, data) -> Promise<void>` — `createdAt` · `owner`는 그대로, 빠진 사진 파일은 지움
  - `deleteLocalPost(id) -> Promise<void>` — 글과 그 글의 사진 파일을 지움(옮기기 후 지울 때도 씀, 주인 상관없음)
  - `deleteVisibleLocalPosts() -> Promise<void>` — 주인 없는 글 · 사진만 지움
  - `claimLocalPosts(uid) -> Promise<LocalPost[]>` — `claimPosts` 저장 후 `postsToMigrate(…, uid)` 반환

- [ ] **Step 1: `npx expo install expo-file-system`** — `package.json`에 `expo-file-system` `~58.0.x`가 생겨요.
- [ ] **Step 2: `services/localPosts.js` 구현**
  - 글은 `Paths.document`/`guest/posts.json` 파일 하나에 저장해요. 쓸 때는 `posts.json.tmp`에 쓴 뒤 `move`로 바꿔서, 쓰다가 앱이 꺼져도 원래 파일이 남아 있게 해요.
  - 읽기 · 쓰기는 모듈 안의 Promise 사슬 하나로 차례로 해요. 그래야 동시에 저장할 때 서로의 변경을 덮어쓰지 않아요.
  - `parseLocalPosts`가 에러를 던지면 그대로 던져요. 절대 빈 목록으로 덮어쓰지 않아요(Review Focus 1).
- [ ] **Step 3: 확인** — `npm run lint` → 0, `npx expo-doctor` → 모두 통과, `npx expo export --platform android --output-dir <scratchpad>/export` → `Exported`
- [ ] **Step 4: 커밋**

### Task 3: 비회원 상태 · 첫 화면

**Files:**
- Create: `services/session.js`
- Modify: `services/index.js`, `screens/MainPage.js`, `screens/Login.js`

**Interfaces:**
- Consumes: Task 1 `getAppMode`
- Produces:
  - `isMember() -> boolean` — `getAuth().currentUser?.emailVerified === true`
  - `enterGuestMode() -> Promise<void>`, `leaveGuestMode() -> Promise<void>`, `hasGuestFlag() -> Promise<boolean>` — AsyncStorage 키 `guestMode`(`'1'`)
  - `MainPage` 파라미터 `{ fromGuest: true }` — 비회원이 설정에서 들어왔다는 뜻

- [ ] **Step 1: `services/session.js` 구현**
- [ ] **Step 2: `MainPage` 바꾸기**
  - `onAuthStateChanged`에서 `getAppMode({ hasVerifiedUser, guestFlag })`로 판단해요. `member`면 `leaveGuestMode()` 후 탭으로 `reset`. `guest`면 `route.params?.fromGuest`가 아닐 때만 탭으로 `reset`. `start`면 버튼을 보여 줘요.
  - "처음이에요 · 회원가입" 아래에 글자 버튼(`variant="text"`) `가입 없이 시작하기`를 둬요. `fromGuest`면 숨겨요. 누르면 `enterGuestMode()` 후 탭(`NAVIGATOR.BOTTOM_TAB_NAV`, `{ screen: NAVIGATOR.GALLERY }`)으로 `reset`.
- [ ] **Step 3: `Login` 바꾸기** — 인증된 로그인이면 `leaveGuestMode()` 후 `navigation.replace` 대신 `navigation.reset({ index: 0, routes: [{ name: NAVIGATOR.BOTTOM_TAB_NAV }] })`. 비회원이 설정 → 첫 화면 → 로그인으로 왔을 때 아래에 남은 비회원 탭을 치워요.
- [ ] **Step 4: 확인** — `npm run lint`, `npm run test:unit`
- [ ] **Step 5: 커밋**

### Task 4: 갤러리 · 작성 · 상세를 비회원도 쓰게

**Files:**
- Modify: `screens/Gallery.js`, `screens/GalleryForm.js`, `screens/Details.js`

**Interfaces:**
- Consumes: Task 2 `getLocalPosts`, `getLocalPost`, `createLocalPost`, `updateLocalPost`, `deleteLocalPost`, `saveLocalPhoto`, `isLocalPhoto`; Task 3 `isMember`

- [ ] **Step 1: `Gallery`** — `loadPosts`에서 `isMember()`면 `getPosts(email)`, 아니면 `getLocalPosts()`.
- [ ] **Step 2: `GalleryForm`**
  - 비회원이면 `uploadPhoto` 대신 줄인 사진을 `saveLocalPhoto`로 복사해요. 이미 저장된 사진 판단은 `isUploaded(uri) || isLocalPhoto(uri)`.
  - 저장은 `createLocalPost({ ...data, createdAt: Date.now() })` / `updateLocalPost(docId, data)`. `writer`는 넣지 않아요.
  - 진행 표시(`사진 올리는 중 n/전체`)는 비회원이면 `저장하는 중…`만 보여요.
- [ ] **Step 3: `Details`** — 비회원이면 `getLocalPost(docId)` · `deleteLocalPost(docId)`. 기기 사진 URI는 `Carousel`(expo-image)이 그대로 보여 줘요.
- [ ] **Step 4: 확인** — `npm run lint`, `npm run test:unit`, `npx expo export --platform android`
- [ ] **Step 5: 커밋**

### Task 5: 비회원 설정 화면

**Files:**
- Modify: `screens/Settings.js`

**Interfaces:**
- Consumes: Task 2 `deleteVisibleLocalPosts`; Task 3 `isMember`

- [ ] **Step 1:** 비회원이면 "계정" 칸에 `ListRow` `가입하고 기록 백업하기`(누르면 `navigation.navigate(NAVIGATOR.MAIN_PAGE, { fromGuest: true })`)와 안내 문구(`TEXT_SUB`, 13px)를 보여 줘요. 회원 화면은 그대로이고, 로그아웃만 스펙대로 `signOut` 후 첫 화면으로 `navigation.reset({ index: 0, routes: [{ name: NAVIGATOR.MAIN_PAGE }] })`(지금은 로그인 화면으로 감).
- [ ] **Step 2:** 비회원이면 "탈퇴하기" 자리에 `기기의 기록 모두 지우기`. `Alert.alert('기록 모두 지우기', '기기에 저장된 기록과 사진이 모두 삭제되며 되돌릴 수 없어요.', 취소/삭제(destructive))` → `deleteVisibleLocalPosts()` → `showToast('success', '기기의 기록을 모두 지웠어요.')`. 실패하면 `showToast('error', '기록을 지우지 못했어요.', '잠시 후 다시 시도해 주세요.')`.
- [ ] **Step 3: 확인** — `npm run lint`
- [ ] **Step 4: 커밋**

### Task 6: 기록 옮기기

**Files:**
- Create: `services/migrateGuestPosts.js`, `lib/useGuestMigration.js`
- Modify: `services/index.js`, `lib/index.js`, `screens/Gallery.js`
- Test: `tests/rules/firestore.test.mjs`

**Interfaces:**
- Consumes: Task 1 `photoIdFromUri`, `toRemotePost`; Task 2 `claimLocalPosts`, `deleteLocalPost`; `services/docs.js`의 `createUserInfo`
- Produces:
  - `migrateGuestPosts({ uid, email, onProgress }) -> Promise<{ moved: number, failed: number }>` — `onProgress({ done, total })`
  - `useGuestMigration(onDone: () => void) -> { progress: { done, total } | null }` — 회원일 때만 돌고, 끝나면 알림을 띄우고 `onDone()`(갤러리 다시 불러오기)을 불러요

- [ ] **Step 1: 실패하는 규칙 테스트 쓰기** (`describe('posts/{postId}')` 안)

```js
test('옮길 때 정한 문서 ID로 내 글을 만들고, 다시 시도하면 같은 문서에 덮어쓸 수 있어요', async () => {
  const ref = doc(verifiedDb(ME), 'posts/guest-uuid-1');
  await assertSucceeds(setDoc(ref, newPost(ME.email)));
  await assertSucceeds(setDoc(ref, newPost(ME.email)));
});
test('다른 사람이 정한 문서 ID로 옮긴 글에 다시 쓸 수 없어요', async () => {
  await seed('posts/guest-uuid-2', newPost(OTHER.email));
  await assertFails(setDoc(doc(verifiedDb(ME), 'posts/guest-uuid-2'), newPost(ME.email)));
});
```

- [ ] **Step 2: 실행** — `npm run test:rules` → 두 테스트 모두 통과해요(규칙은 이미 이 동작을 허용 · 거절함). 규칙을 바꾸지 않고 옮기기가 기대는 동작을 고정하는 테스트예요. 통과하지 않으면 멈추고 알려요.
- [ ] **Step 3: `services/migrateGuestPosts.js` 구현** — `claimLocalPosts(uid)`로 옮길 글을 받고, `users/{email}`이 없으면 `createUserInfo(email)`. 글마다(차례로):
  1. 사진마다 `ref(storage, \`posts/${uid}/${photoIdFromUri(uri)}\`)`: `getDownloadURL` 성공이면 그 URL, `storage/object-not-found`면 `putFile(ref, uri, { contentType: getImageContentType(uri) })` 후 `getDownloadURL`. **기기 파일이 없으면 그 사진은 빼요**(Review Focus 2).
  2. `setDoc(doc(db, 'posts', post.id), toRemotePost(post, email, urls))`
  3. `updateDoc(doc(db, 'users', email), { posts: arrayUnion(post.id) })`
  4. `deleteLocalPost(post.id)`
  - 한 글이 실패하면 `failed`를 늘리고 다음 글로 가요. 다 끝나면 `{ moved, failed }`.
  - 모듈 변수로 실행 중이면 새로 시작하지 않고 진행 중인 Promise를 돌려줘요(Review Focus 5).
- [ ] **Step 4: `lib/useGuestMigration.js` 구현** — `useFocusEffect`에서 `isMember()`면 `migrateGuestPosts` 호출. 옮길 글이 0개면 아무것도 보이지 않아요. `moved > 0`이면 `showToast('success', '기기에 있던 기록 {moved}개를 계정으로 옮겼어요.')`, `failed > 0`이면 `showToast('error', '기록 {failed}개를 옮기지 못했어요. 다음에 다시 시도할게요.')`. 화면을 떠난 뒤 끝나면 상태를 바꾸지 않아요(Gallery의 `isActive` 방식).
- [ ] **Step 5: `Gallery`에 붙이기** — `progress`가 있으면 헤더 아래에 `기기의 기록 옮기는 중 {done}/{total}`(13px, `TEXT_SUB`)을 보여 주고, 끝나면 `loadPosts()`.
- [ ] **Step 6: 확인** — `npm run lint`, `npm run test:unit`, `npm run test:rules` → `ℹ fail 0`, `npx expo export --platform android`
- [ ] **Step 7: 커밋**

### Task 7: 문서 · 마무리 · PR

**Files:**
- Modify: `docs/privacy-policy.md`, `README.md`, `CLAUDE.md`, `docs/play-console.md`(비회원은 기록을 수집하지 않는다는 한 줄, 데이터 유형은 그대로)

- [ ] **Step 1: 개인정보처리방침** — 수집 항목 아래에 "가입하지 않고 쓰면 기록 · 사진은 기기에만 저장되고 수집하지 않아요. 가입하면 그때부터 서버에 저장돼요."를 더하고, 86줄의 "이 경우 앱을 이용할 수 없어요."를 "이 경우에도 가입하지 않고 기기에만 저장해 쓸 수 있어요."로 고쳐요.
- [ ] **Step 2: README · CLAUDE.md** — 구조 · 주의사항에 비회원 모드(`services/localPosts.js`, `isMember()`로 갈림, 비회원 기록은 서버로 보내지 않음, 옮기기는 처음 시작한 계정에만)를 짧게 적어요.
- [ ] **Step 3: 전체 확인** — `npm run lint` → 0, `npm run test:unit` → `ℹ fail 0`, `npx expo-doctor`, `npx expo install --check`, `npx expo export --platform android`, `npm run test:rules` → `ℹ fail 0`
- [ ] **Step 4: 커밋을 하나로 합치기** — `git reset --soft master` 후 `timeout 60 git commit -s -m "회원가입 없이 쓰기" -m "가입하지 않고 기기에 기록을 남기고, 가입하면 계정으로 옮길 수 있게 합니다."`
- [ ] **Step 5: PR** — `Closes #201`, `## 요약` · `## 확인한 것` · `## 기기에서 확인해 주세요`(스펙의 "확인 방법" 기기 확인 목록 + **새 빌드 필요**), 레이블 `feat`, `--assignee @me`, 마일스톤 `v1.0.0`. 본문은 scratchpad 파일로 `-F`.
