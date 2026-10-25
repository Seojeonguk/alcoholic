# CLAUDE.md

이 파일은 Claude Code가 이 저장소에서 작업할 때 참고하는 안내 파일입니다.

## 언어

- **이 프로젝트의 모든 글은 한국어로 씀**: 커밋 메시지, PR 제목 · 본문, 이슈 제목 · 본문 · 댓글, 문서, 코드 주석. 한국어는 해요체로 씀.
- 코드 식별자(변수 · 함수 · 파일 이름), 브랜치 이름, 라이브러리 이름 같은 기술 용어는 영어 그대로 둠.
- 2023년까지 만든 기존 이슈 · PR · 커밋은 영어로 돼 있음. 새로 쓰는 것부터 한국어로 씀.

## 프로젝트 개요

- **alcoholic**: 술 사진과 기록(제목 · 내용 · 날짜 · 장소 · 태그)을 남기는 React Native(Expo) 앱.
- 스택: Expo SDK 58, React 19, React Native 0.88, React Navigation 7, Redux Toolkit 2, Firebase 13(Auth · Firestore · Storage), expo-image.
- 목표: v1.0.0을 Android(Google Play)로 첫 출시. 진행 상황은 #220(v1.0.0 Release Plan)과 마일스톤 `v1.0.0`에서 관리함. iOS 출시와 비회원 사용(#201)은 `v1.1.0`.

### 구조

```text
App.js               # Redux Provider · SafeArea · Navigation · Toast
app.config.js        # Expo 설정, .env의 Firebase 키를 extra로 넘김
firebaseConfig.js    # Firebase 초기화 (Auth는 AsyncStorage persistence)
navigation/          # 루트 native stack + 하단 탭(Gallery · Settings)
screens/             # 화면 (MainPage, Login, RegistrationForm, ForgotPassword, Gallery, GalleryForm, Details, Settings)
components/          # 화면에서 쓰는 컴포넌트 (Photo, Carousel, Tags, Header, TouchableImage …)
firebase/            # Firestore 문서 읽기 · 쓰기 함수
redux/               # store, gallerySlice (게시글 작성 폼 상태)
constants/           # 네비게이션 이름(NAVIGATOR), 색상(COLORS), 에러 메시지
lib/                 # 공용 유틸 (showToast, 에러 메시지 변환, 이메일 재전송 제한)
```

## 빌드 및 실행 명령어

```bash
npm install
npx expo start                     # 개발 서버, 최신 Expo Go로 확인
npx expo-doctor                    # 의존성 · 설정 검사
npx expo install --check           # SDK와 맞지 않는 패키지 확인 (고치려면 --fix)
npx expo export --platform android --output-dir <scratchpad>/export   # 번들이 만들어지는지 확인
```

- 루트에 `.env`가 있어야 함(git에 올리지 않음): `EXPO_PUBLIC_FIREBASE_API_KEY`, `_AUTH_DOMAIN`, `_PROJECT_ID`, `_STORAGE_BUCKET`, `_MESSAGING_SENDER_ID`, `_APP_ID`, `_MEASUREMENT_ID`. Expo CLI가 자동으로 읽음(`dotenv` 쓰지 않음).
- 패키지는 `npm install` 대신 **`npx expo install <패키지>`**로 넣어서 SDK에 맞는 버전을 받음.
- `export` 결과물은 저장소 안에 두지 않고 scratchpad에 만듦.

## 코드 스타일 및 컨벤션

### 코드

- JavaScript(타입스크립트 아님), 함수 컴포넌트 + hooks.
- import 순서: React · react-native → 프로젝트 모듈(`../components`, `../constants` …) → 외부 라이브러리. 각 폴더의 `index.js`에서 다시 내보낸 것을 가져다 씀.
- 네비게이션 이름은 문자열로 쓰지 않고 `constants/nav.js`의 `NAVIGATOR`를 씀. 색상은 `constants/theme.js`의 `COLORS`.
- Prettier 설정은 `.prettierrc.json`을 따름.
- 사용자에게 보이는 문구는 한국어로 씀. 알림은 `lib`의 `showToast`를 씀.
- 주석은 주변 코드의 밀도에 맞춰 한국어로 씀.

### 확인 방법

- 아직 자동 테스트가 없음. 변경 후에는 최소한 `npx expo-doctor`와 `npx expo export --platform android`로 번들이 만들어지는지 확인함.
- 이 환경에서는 앱을 기기에서 직접 실행해 볼 수 없음. 실제 동작은 PR 체크리스트로 사용자가 확인함. 확인하지 못한 것을 확인했다고 쓰지 않음.

### Git · PR (squash merge, 브랜치 자동 삭제 켜짐)

- `master`에서 브랜치를 따서 PR을 염. 브랜치 이름은 영어 snake_case(예: `upgrade_expo_sdk`, `focus_out_tag`).
- 커밋은 `git commit -s`(Signed-off-by)로 하고 GPG 서명(`commit.gpgsign=true`)을 건너뛰지 않음. 서명이 가끔 멈추므로 `timeout 60 git commit -s ...`처럼 시간 제한을 둠.
- **커밋 메시지**: 짧은 한국어 제목 + 본문 **한 줄** `~합니다.` 형식으로 커밋이 미치는 결과를 씀(예: 제목 `Expo SDK 업그레이드`, 본문 `Expo SDK와 의존성을 최신 버전으로 올립니다.`). 자세한 이유 · 확인 내용은 PR 본문에 씀.
- **Claude attribution 금지**: `Co-Authored-By: Claude`나 "Generated with Claude Code"를 커밋 · PR에 넣지 않음.
- **PR 본문**: 맨 위에 `Closes #N` → `## 요약` → `## 확인한 것`(실행한 명령과 결과) → 마지막에 **`## 기기에서 확인해 주세요`** 체크리스트(사용자가 직접 확인할 동작을 "행동 → 기대 결과" 형식으로. `.env` · 설정 단계도 포함).
- **PR · 이슈 생성 시**: 레이블(`feat`, `fix`, `bug`, `delete`, `documentation`, `plan`, `question`), `--assignee @me`, 맞는 마일스톤을 항상 지정함. 여러 이슈를 묶는 상위 이슈에는 `plan` 레이블을 붙이고 하위 이슈를 체크리스트로 적음.
- **이슈 본문**: `### [문제]` → `### [기대 동작]` → `### [체크리스트]` 형식.

### 버전 · 릴리스

- **메이저**: 기존 사용자가 무언가 해야 할 때(다시 로그인 · 데이터 이전 등). **마이너**: 새 기능이나 보이는 변경. **패치**: 수정만.
- 버전은 `app.config.js`의 `version`(Android는 `versionCode`도 올림) · `package.json` · `package-lock.json`(`npm version X --no-git-tag-version`)에 있음.
- 마일스톤의 이슈가 끝나면 "Release X.Y.Z" PR(버전 올리기 + 본문에 릴리스 노트 초안)을 만듦. 머지 후 머지 커밋에 서명 태그 `git tag -s vX.Y.Z`를 붙이고, 사용자에게 확인받고 GitHub Release를 발행함. 그다음 마일스톤을 닫음.
- 스토어(Google Play)에 빌드를 올리는 건 사용자가 함.

## 주의사항

- **`.env` · `eas.json`은 git에 올리지 않음**(`.gitignore`, #197). Firebase 키를 코드에 직접 쓰지 않음.
- **React Navigation 7**: 이미 스택에 있는 화면으로 돌아갈 때는 `navigate`가 아니라 `popTo`를 씀. 부모 스택에서 탭 안의 화면으로 갈 때는 `{ screen: ... }` 파라미터로 중첩해서 지정함. 화면 파라미터는 객체로 넘김(`{ docId }`).
- **expo-media-library**: SDK 58에서 기존 함수형 API는 루트 import로 부르면 런타임에 에러가 남. 지금은 `expo-media-library/legacy`를 쓰고, 새 API로 옮기는 건 #202에서 함.
- **expo-image**: 캐시는 `source.cache`가 아니라 `cachePolicy` prop으로 지정함(#214).
- **아이콘**: `@expo/vector-icons` 15에서 이름이 바뀐 아이콘이 있음(`ios-*` 접두사 제거, `pluscircleo` → `plus-circle` 등). 새 아이콘 이름은 `node_modules/@expo/vector-icons/build/vendor/react-native-vector-icons/glyphmaps/*.json`에서 확인함.
- **ESLint 설정이 깨져 있음**: `.eslintrc.json`이 설치되지 않은 `airbnb` 프리셋을 씀. 고치기 전까지 lint 결과를 믿지 않음.
- Windows Git Bash에서 heredoc 안에 백틱이 든 스크립트를 쓰면 깨질 때가 있음. 스크립트 · 긴 본문은 scratchpad에 파일로 써서 실행함(`gh issue create -F <파일>`).
- 저장소 루트에 녹화 · 빌드 결과물 · 임시 파일을 커밋하지 않음.
