# 디자인 개편 · 사진 줄이기 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 앱 전체를 "토스식 화이트" 디자인으로 바꾸고, 사진을 줄여 올리며 저장 진행 상황을 보여 줘요.

**Architecture:** 먼저 새 색 토큰과 공용 컴포넌트(버튼 · 입력 칸 · 목록 줄 · 눌림 효과 · 스켈레톤 · 토스트)를 만들고, 화면을 묶음별로 옮겨요. 정렬 · 월 묶음 · 날짜 표시 · 사진 크기 계산처럼 순수한 로직은 React Native를 import하지 않는 파일로 빼서 `node:test`로 테스트해요. 화면 모양은 자동 테스트가 없으므로 PR 체크리스트로 사용자가 기기에서 확인해요.

**Tech Stack:** Expo SDK 58, React Native 0.88, React 19, React Navigation 7, Redux Toolkit, Firebase JS SDK 13, expo-image, expo-image-manipulator(새로 추가), react-native-toast-message, Node 24 `node:test`

**Spec:** `docs/superpowers/specs/2026-10-26-design-refresh-design.md`

## Global Constraints

- 색은 스펙의 표 그대로: `BACKGROUND #FFFFFF`, `ACCENT #2E699A`, `ACCENT_SOFT #E8F0F7`, `TEXT #191F28`, `TEXT_SUB #8B95A1`, `FILL #F2F4F6`, `LINE #F2F4F6`, `DANGER #E5484D`. 토스트 배경 `#333D4B`.
- 글씨: 화면 제목 24/800, 첫 화면 문구 26/800, 섹션 제목 13/700 `TEXT_SUB`, 본문 15, 보조 13 `TEXT_SUB`, 버튼 16/700.
- 모양: 좌우 여백 20, 둥근 모서리 사진 12 · 입력 칸 12 · 버튼 14. 입력 중 칸만 `ACCENT` 2px 테두리.
- 주요 버튼은 화면 아래 고정, 좌우 16, 아래 안전 영역 + 12, 키보드가 올라오면 키보드 위.
- 눌림: 0.97배로 작아졌다 돌아옴. RN 기본 `Animated` · `Pressable`만 씀. 새 애니메이션 라이브러리 · 커스텀 폰트 금지.
- 화면 전체 스피너 금지. 기다림은 누른 버튼 안의 글씨로, 첫 불러오기는 스켈레톤으로.
- 사진 줄이기: 긴 변 최대 1600px, JPEG 품질 0.8, 작은 사진은 키우지 않음.
- 패키지는 `npx expo install`로. 사진 · 오디오 권한 추가 금지. 사용자 문구는 한국어.
- CLAUDE.md의 import 순서(React · RN → 프로젝트 모듈 → 외부 라이브러리), `NAVIGATOR` · `COLORS` 상수 사용, Prettier 설정을 따름.
- PR은 Task 단위로 하나씩. 앞 PR이 머지된 뒤 `master`에서 브랜치를 땀(쌓지 않음). 커밋은 `timeout 60 git commit -s`, PR 하나에 커밋 하나, CLAUDE.md의 커밋 · PR 형식.
- 모든 Task 공통 확인: `npx expo-doctor`, `npx expo export --platform android --output-dir <scratchpad>/export`, (테스트가 있으면) `npm run test:unit`.

## Review Focus

1. **`day`가 없거나 형식이 다른 예전 글**: 갤러리가 죽지 않고, 그런 글은 맨 아래 "날짜 없음" 묶음에 들어가야 해요. → Task 3 테스트 `groupPostsByMonth: day가 없거나 잘못되면 날짜 없음 묶음`
2. **해가 바뀌는 경계**: 올해 글은 "10월", 지난해 글은 "2025년 12월"로 나와야 해요. → Task 3 테스트 `formatMonthTitle: 올해는 월만, 다른 해는 연도 포함`
3. **이미 작거나 세로로 긴 사진**: 1600px 이하는 그대로, 세로 사진은 높이를 1600으로 줄여야 해요. → Task 4 테스트 `getResizeTarget` 3종
4. **사진 줄이기 실패(지원하지 않는 형식 등)**: 저장 전체가 실패하지 않고 원본을 올려야 해요. → Task 4 Step 5에서 `resizeForUpload`가 실패하면 원래 `uri`를 돌려줌
5. **키보드가 아래 고정 버튼을 가림**: 로그인 · 회원가입 · 글 쓰기에서 입력 중에도 버튼이 보여야 해요. → Task 1 `BottomButtonArea`, 각 PR 기기 체크리스트

---

### Task 0: 설계 · 계획 문서 PR

**Files:**

- Create: `docs/superpowers/specs/2026-10-26-design-refresh-design.md`(이미 커밋됨), `docs/superpowers/plans/2026-10-26-design-refresh.md`

- [ ] **Step 1:** 브랜치 `design_refresh_spec`에 두 문서를 한 커밋으로 합쳐요(`디자인 개편 설계 · 계획 문서 추가` / `토스식 화이트 디자인 개편과 사진 줄이기의 설계와 구현 계획을 정리합니다.`).
- [ ] **Step 2:** PR(`documentation`, `v1.0.0`, `Refs #256`) → 사용자 머지 후 Task 1 시작.

### Task 1: 디자인 기반 (토큰 · 공용 컴포넌트 · 탭 · 토스트 · 단위 테스트 환경)

**Files:**

- Modify: `constants/theme.js` — 새 토큰 8개를 `COLORS`에 **추가**(기존 키는 Task 5에서 지움)
- Create: `components/ui/PressableScale.js`, `components/ui/Button.js`, `components/ui/TextField.js`, `components/ui/ListRow.js`, `components/ui/BottomButtonArea.js`, `components/ui/Skeleton.js`, `components/ui/index.js`
- Modify: `components/index.js`(ui 다시 내보내기), `components/Header.js`(새 모양), `components/PasswordInput.js`(`TextField` 위에 눈 아이콘), `navigation/BottomTabNav.js`(라벨 "기록" · "설정", 흰 탭 바), `App.js`(`Toast config`), `lib/utils.js`(`showToast` 기본 위치 `bottom`)
- Create: `lib/toastConfig.js`
- Modify: `package.json` — `"test:unit": "node --test tests/unit/"`
- Create: `tests/unit/smoke.test.mjs`(환경 확인용, Task 3에서 지움)

**Interfaces:**

- Produces:

  - `COLORS.BACKGROUND | ACCENT | ACCENT_SOFT | TEXT | TEXT_SUB | FILL | LINE | DANGER`
  - `PressableScale({ onPress, disabled, style, children })` — 누르면 0.97배, `disabled`면 반응 없음
  - `Button({ title, onPress, variant = 'primary' | 'soft' | 'danger' | 'text', loading = false, loadingTitle, disabled })` — `loading`이면 `loadingTitle ?? title`을 보여 주고 눌리지 않음
  - `TextField({ label, error, ref, ...TextInputProps })` — `FILL` 면, 포커스 시 `ACCENT` 테두리, `error`는 아래 `DANGER` 13
  - `ListRow({ title, value, onPress, showChevron })` — 왼쪽 제목, 오른쪽 `TEXT_SUB` 값, `onPress`가 있으면 `›`
  - `BottomButtonArea({ children })` — 아래 고정 + 안전 영역 + 키보드 회피
  - `Skeleton({ width, height, radius = 12 })` — `FILL` 색 상자, 투명도 깜빡임
  - `Header({ left = 'back' | 'close' | null, onPressLeft, title, right, onPressRight, light = false })` — `light`면 흰 아이콘(상세 사진 위)
  - `toastConfig` — `success` · `error` · `info` 모두 `#333D4B` 상자, 흰 글씨, 앞 아이콘만 다름

- [ ] **Step 1:** `tests/unit/smoke.test.mjs`에 `test('단위 테스트 환경', () => assert.equal(1 + 1, 2))`를 쓰고 `npm run test:unit` → `ℹ pass 1`. (Node 24는 `type` 없는 `.js`의 ESM 문법을 자동 인식해요. 이후 Task에서 `lib/` 순수 파일을 직접 import할 때도 이 방식이에요.)
- [ ] **Step 2:** 토큰과 `components/ui/*`를 위 Interfaces대로 만들어요. `BottomButtonArea`의 키보드 회피는 RN `KeyboardAvoidingView`(Android는 `behavior` 없이 edge-to-edge 확인 후 결정)로 하고, 방법을 PR 본문에 적어요.
- [ ] **Step 3:** `Header` · `PasswordInput` · 탭 바 · 토스트를 바꿔요. `Header`의 기존 props(`visibleLeftIcon` 등)를 쓰는 화면이 아직 있으므로, 새 props가 없으면 예전 props로 동작하게 둬요(Task 5에서 정리).
- [ ] **Step 4:** `npx expo-doctor`, `npx expo export --platform android` 통과 확인.
- [ ] **Step 5:** 커밋 `디자인 기반 컴포넌트 추가` / `새 색과 공용 버튼 · 입력 칸 · 목록 줄 · 탭 · 알림 모양을 추가합니다.` → PR(`feat`, `v1.0.0`). 체크리스트: 하단 탭 라벨 · 모양, 토스트 모양(로그인 실패로 확인), 비밀번호 칸 새 모양.

### Task 2: 첫 화면 · 로그인 · 회원가입 · 비밀번호 찾기 · 탈퇴

**Files:**

- Modify: `screens/MainPage.js`, `screens/Login.js`, `screens/RegistrationForm.js`, `screens/ForgotPassword.js`, `screens/DeleteAccount.js`
- Delete: `assets/mainPageImg.png`

**Interfaces:**

- Consumes: Task 1의 `Button`, `TextField`, `PasswordInput`, `BottomButtonArea`, `Header`, `COLORS`

- [ ] **Step 1:** 첫 화면: `ACCENT_SOFT` 둥근 사각형(72, 둥근 22) 안에 `assets/icon.png`, 문구 "오늘 마신 술,\n사진으로 남겨요"(26/800), "나만 보는 술 기록장"(13 `TEXT_SUB`), 아래 고정 `Button` "이메일로 시작하기"(→ `NAVIGATOR.LOGIN`)와 `variant="text"` "처음이에요 · 회원가입"(→ `REGISTRATION_FORM`). 로그인 상태 확인 중(지금 최대 3초 스피너)에는 아이콘과 문구만 보이고 버튼을 숨겨요.
- [ ] **Step 2:** 로그인 · 회원가입 · 비밀번호 찾기 · 탈퇴를 `Header left="back"` + 큰 제목 + `TextField`/`PasswordInput` + 아래 고정 `Button`으로 바꿔요. 제목은 "이메일로 로그인" · "이메일로 회원가입" · "비밀번호를 잊으셨나요?" · "탈퇴하기". 로그인의 "회원가입" 버튼은 빼고 "비밀번호를 잊으셨나요?"는 입력 칸 아래 글씨 링크. 탈퇴 버튼은 `variant="danger"`, 진행 중 `loadingTitle="탈퇴하는 중…"`(지금의 전체 화면 스피너 대신). 모든 에러 메시지 · 포커스 이동 · 검증 동작은 그대로예요.
- [ ] **Step 3:** `mainPageImg.png`를 지우고 `grep -rn mainPageImg` 결과가 없는지 확인.
- [ ] **Step 4:** doctor · export 통과.
- [ ] **Step 5:** 커밋 `첫 화면 · 로그인 계열 화면 디자인 변경` / `첫 화면과 로그인 · 회원가입 · 비밀번호 찾기 · 탈퇴 화면을 새 디자인으로 바꿉니다.` → PR. 체크리스트: #218 1번 흐름 전체, 키보드가 올라올 때 버튼 위치, 탈퇴 진행 표시.

### Task 3: 갤러리 (마신 날짜순 · 월 묶음 · 스켈레톤 · 빈 상태)

**Files:**

- Create: `lib/postSections.js`(RN import 금지), `tests/unit/postSections.test.mjs`
- Delete: `tests/unit/smoke.test.mjs`
- Modify: `services/docs.js`(`getPosts`가 `day`, `createdAt`도 돌려줌), `screens/Gallery.js`, `components/Post.js`(`PressableScale`, 둥근 12, 간격 6)

**Interfaces:**

- Produces (`lib/postSections.js`):
  - `sortPostsByDay(posts: {day?: string, createdAt: number}[]) => same[]` — `day` 내림차순, 같으면 `createdAt` 내림차순, `day`가 없거나 `YYYY-MM-DD`가 아니면 맨 뒤
  - `formatMonthTitle(day: string, now: Date) => string` — 올해면 `'10월'`, 아니면 `'2025년 12월'`
  - `groupPostsByMonth(posts, now: Date) => { title: string, data: post[] }[]` — 정렬 후 월별 묶음, 잘못된 `day`는 마지막 `'날짜 없음'`
- `getPosts(email)`의 각 항목: `{ docId, presentivePhoto, day, createdAt }`(`createdAt`은 `toMillis()` 숫자)

- [ ] **Step 1: 실패하는 테스트 작성** `tests/unit/postSections.test.mjs`

```js
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { formatMonthTitle, groupPostsByMonth, sortPostsByDay } from '../../lib/postSections.js';

const NOW = new Date('2026-10-26T12:00:00');
const p = (docId, day, createdAt) => ({ docId, day, createdAt });

test('sortPostsByDay: 마신 날짜 내림차순, 같은 날은 최근 작성순', () => {
  const sorted = sortPostsByDay([
    p('a', '2026-09-30', 5),
    p('b', '2026-10-01', 1),
    p('c', '2026-10-01', 3),
  ]);
  assert.deepEqual(
    sorted.map((x) => x.docId),
    ['c', 'b', 'a']
  );
});

test('formatMonthTitle: 올해는 월만, 다른 해는 연도 포함', () => {
  assert.equal(formatMonthTitle('2026-10-03', NOW), '10월');
  assert.equal(formatMonthTitle('2025-12-31', NOW), '2025년 12월');
});

test('groupPostsByMonth: 월별로 묶고 최근 달이 먼저', () => {
  const sections = groupPostsByMonth(
    [p('a', '2026-09-30', 9), p('b', '2026-10-01', 1), p('c', '2026-10-20', 2)],
    NOW
  );
  assert.deepEqual(
    sections.map((s) => [s.title, s.data.map((x) => x.docId)]),
    [
      ['10월', ['c', 'b']],
      ['9월', ['a']],
    ]
  );
});

test('groupPostsByMonth: day가 없거나 잘못되면 날짜 없음 묶음', () => {
  const sections = groupPostsByMonth(
    [p('a', undefined, 1), p('b', '2026-10-01', 2), p('c', '10/01', 3)],
    NOW
  );
  assert.deepEqual(
    sections.map((s) => [s.title, s.data.map((x) => x.docId)]),
    [
      ['10월', ['b']],
      ['날짜 없음', ['c', 'a']],
    ]
  );
});
```

- [ ] **Step 2:** `npm run test:unit` → 모듈이 없어 FAIL.
- [ ] **Step 3:** `lib/postSections.js`에 세 함수를 구현해요.
- [ ] **Step 4:** `npm run test:unit` → 4개 PASS. `smoke.test.mjs` 삭제.
- [ ] **Step 5:** `getPosts`가 `day` · `createdAt`을 돌려주게 바꾸고, `Gallery`는 `groupPostsByMonth(posts, new Date())`로 섹션을 만들어 그려요(`SectionList` 또는 섹션별 3열 묶음, 만드는 사람이 선택). 헤더는 큰 제목 "내 기록" + 오른쪽 `ACCENT` 둥근 사각형 + 버튼. 처음 불러오는 동안 `Skeleton` 3열 2줄. 빈 상태는 "아직 남긴 기록이 없어요." + 보조 문구 + `Button variant="soft"` "첫 기록 남기기". #236 · #246의 포커스할 때 다시 불러오기, 불러오기 실패 토스트는 그대로예요.
- [ ] **Step 6:** `npm run test:rules` 통과(쿼리는 바뀌지 않음), doctor · export 통과.
- [ ] **Step 7:** 커밋 `갤러리 디자인 변경 · 마신 날짜순 정렬` / `갤러리를 마신 날짜순으로 정렬해 월별로 묶어 보여 줍니다.` → PR. 체크리스트: 지난달 날짜로 새 글 → 그 달 묶음, 날짜를 바꾸지 않은 수정 → 순서 유지, 빈 상태 버튼, 스켈레톤.

### Task 4: 글 쓰기 · 사진 줄이기(#256) · 저장 진행 표시

**Files:**

- Create: `lib/photoResize.js`(RN import 금지), `tests/unit/photoResize.test.mjs`, `lib/resizeForUpload.js`
- Modify: `screens/GalleryForm.js`, `components/Photo.js`, `components/Title.js`, `components/Day.js`, `components/Location.js`, `components/Tags.js`, `components/Content.js`, `docs/privacy-policy.md`(1번 메타데이터 문구), `package.json`(`expo-image-manipulator`)
- Create: `lib/formatDay.js`, `tests/unit/formatDay.test.mjs`

**Interfaces:**

- Produces:
  - `getResizeTarget(width: number, height: number, maxSide = 1600) => { width: number } | { height: number } | null`
  - `resizeForUpload(uri: string) => Promise<string>` — 줄인 JPEG(품질 0.8)의 `uri`, 실패하면 원래 `uri`
  - `formatDay(day: string) => string` — `'2026-10-26'` → `'2026. 10. 26'`, 형식이 아니면 그대로
- Consumes: Task 1 `Button`(`loading`, `loadingTitle`), `ListRow`, `Header left="close"`, `BottomButtonArea`

- [ ] **Step 1: 실패하는 테스트 작성**

```js
// tests/unit/photoResize.test.mjs
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { getResizeTarget } from '../../lib/photoResize.js';

test('getResizeTarget: 가로 사진은 너비를 1600으로', () =>
  assert.deepEqual(getResizeTarget(4032, 3024), { width: 1600 }));
test('getResizeTarget: 세로 사진은 높이를 1600으로', () =>
  assert.deepEqual(getResizeTarget(3024, 4032), { height: 1600 }));
test('getResizeTarget: 1600 이하는 그대로', () => {
  assert.equal(getResizeTarget(1600, 1200), null);
  assert.equal(getResizeTarget(800, 600), null);
});

// tests/unit/formatDay.test.mjs
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { formatDay } from '../../lib/formatDay.js';
test('formatDay: 점 형식으로', () => assert.equal(formatDay('2026-10-26'), '2026. 10. 26'));
test('formatDay: 형식이 아니면 그대로', () => assert.equal(formatDay(''), ''));
```

- [ ] **Step 2:** `npm run test:unit` → FAIL. **Step 3:** 두 함수 구현 → PASS.
- [ ] **Step 4:** `npx expo install expo-image-manipulator`. 설치된 버전의 API(`node_modules/expo-image-manipulator/build/*.d.ts`)를 확인해요. SDK 52 이후 권장 API는 `ImageManipulator.manipulate(uri)` → `.resize()` → `.renderAsync()` → `saveAsync({ compress: 0.8, format: SaveFormat.JPEG })`예요.
- [ ] **Step 5:** `lib/resizeForUpload.js`: 이미지를 한 번 렌더링해 `width` · `height`를 얻고, `getResizeTarget` 결과가 있으면 그 값으로 `resize`, 없으면 크기 그대로 JPEG 0.8로 다시 저장(메타데이터 제거 목적)해요. 어떤 단계든 실패하면 원래 `uri`를 돌려줘요.
- [ ] **Step 6:** `GalleryForm.uploadPhoto`에서 올리기 전에 `resizeForUpload`를 써요(이미 `firebase` URL인 사진은 건너뜀). 새로 올릴 사진 수 `total`과 끝난 수 `done`을 state로 두고, 저장 버튼은 `loading` 동안 `total > 0 && done < total`이면 `사진 올리는 중 ${done}/${total}`, 그다음 `저장하는 중…`. 전체 화면 `LoadingSpinner`는 지워요. #246의 `isSavingRef` 중복 방지, 수정 시 `createdAt` 유지는 그대로예요.
- [ ] **Step 7:** 글 쓰기 화면 모양: `Header left="close"` + 가운데 "새 기록"/"기록 수정", 사진 줄(가로 스크롤, 맨 앞 `FILL` + 칸, 미리보기 64 · 둥근 12 · 작은 삭제 버튼), 제목 `TextField`(크게, `maxLength` 40 유지), `ListRow` 날짜(`formatDay`, 누르면 날짜 선택기) · 장소(누르면 입력) · 태그(`FILL` 칩, "+ 추가"), 내용 칸, 아래 고정 "저장하기". 저장 실패 · 이어 쓰기 창 등 기존 동작 유지.
- [ ] **Step 8:** `docs/privacy-policy.md` 1번 사진 문구를 "앞으로 올리는 사진은 크기를 줄여 저장하며, 이때 촬영 정보(메타데이터)는 빠져요. 이전에 올린 사진에는 남아 있을 수 있어요."로 바꿔요.
- [ ] **Step 9:** test:unit · doctor · export 통과. `expo-image-manipulator`가 Expo Go에서 되는지 PR에 적어요(안 되면 `preview` 빌드로 확인 요청).
- [ ] **Step 10:** 커밋 `글 쓰기 디자인 변경 · 사진 줄여 올리기` / `글 쓰기 화면을 새 디자인으로 바꾸고, 사진을 줄여 올리며 저장 진행 상황을 보여 줍니다.` → PR(`Closes #256`). 체크리스트: 사진 5장 저장 시간 전후 비교, 진행 숫자, Storage 파일 크기(수 MB → 수백 KB), 세로 사진 비율, 수정 시 기존 사진 유지.

### Task 5: 상세 · 설정 · 정리

**Files:**

- Modify: `screens/Details.js`, `components/Carousel.js`, `components/Indicator.js`, `screens/Settings.js`, `docs/privacy-policy.md`(4번 삭제 위치), `constants/theme.js`(옛 키 삭제), `components/Header.js`(옛 props 삭제), `components/LoadingSpinner.js`(쓰는 곳이 없으면 삭제)

**Interfaces:**

- Consumes: Task 1 `Header light`, `ListRow`, `Skeleton`, `PressableScale`, Task 4 `formatDay`

- [ ] **Step 1:** 상세: 캐러셀이 맨 위를 꽉 채움(높이 = 화면 너비), 그 위에 `Header light left="back" right="ellipsis-horizontal"`, 점 표시는 현재 점만 길쭉한 흰 점. 아래 제목(24/800) → `formatDay(day) · 장소` 메타(장소 없으면 날짜만) → 내용 → 태그 칩. 불러오는 동안 `Skeleton`. `⋯`는 `Alert.alert`에 "수정" · "삭제" · "취소". 삭제는 #249의 확인 창 · `deletePost` 그대로. 연필 아이콘 · "글 삭제" 버튼 제거.
- [ ] **Step 2:** 설정: 큰 제목 "설정", 묶음 제목 "계정"(`ListRow` 이메일 값, 로그아웃 ›) · "앱 정보"(버전 값, 개인정보처리방침 ›), 맨 아래 작은 회색 "탈퇴하기". 사용자 아이콘 제거.
- [ ] **Step 3:** 개인정보처리방침 4번 "글을 열고 아래쪽의 **글 삭제**를 누르면"을 "글을 열고 오른쪽 위 **⋯ → 삭제**를 누르면"으로.
- [ ] **Step 4:** 정리: `grep -rn "BUTTON_COLOR\|FIRST_SUB_COLOR\|SECOND_SUB_COLOR\|THIRD_SUB_COLOR\|FORTH_SUB_COLOR\|BOTTOM_TAB_\|BACKGROUND_COLOR\|BORDER_COLOR\|LABEL_COLOR\|visibleLeftIcon\|LoadingSpinner" --include=*.js .`(node_modules 제외) 결과가 없을 때까지 옮기고 옛 키 · props를 지워요. 앱 아이콘 · 스플래시 배경(`#F6E8D8`)은 그대로 둬요(스펙: 아이콘 유지).
- [ ] **Step 5:** test:unit · test:rules · doctor · export 통과.
- [ ] **Step 6:** 커밋 `상세 · 설정 디자인 변경과 정리` / `상세와 설정 화면을 새 디자인으로 바꾸고 예전 색과 컴포넌트를 정리합니다.` → PR. 체크리스트: `⋯` 수정 · 삭제, 사진 넘기기와 점, 장소 없는 글, 설정의 각 줄, #218 전체 흐름 한 번 더.
