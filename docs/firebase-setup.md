# Firebase 설정

앱을 빌드하려면 Firebase 콘솔에서 받은 `google-services.json`이 필요해요. 이 문서는 그 파일을 받는 방법과, 앱이 동작하는 데 필요한 Firebase 기능을 정리해요.

이 앱은 **Firebase 네이티브 SDK**(`@react-native-firebase`)를 써요(#286). 그래서 웹 앱의 `firebaseConfig` 값이 아니라 **Android 앱의 `google-services.json`**이 필요해요. iOS는 아직 출시하지 않아서 `GoogleService-Info.plist`는 쓰지 않아요.

## `google-services.json` 받기

1. [Firebase 콘솔](https://console.firebase.google.com)에 로그인하고 이 앱이 쓰는 프로젝트를 골라요.
2. 왼쪽 위 **프로젝트 개요** 옆의 ⚙(톱니바퀴) → **프로젝트 설정**으로 들어가요.
3. **일반** 탭을 아래로 내려 **내 앱** 영역에서 Android 앱(패키지 이름 `com.seojeonguk.alcoholic`)을 골라요.
4. **google-services.json** 버튼을 눌러 파일을 받아요.

### Android 앱이 목록에 없을 때

**내 앱**에서 **앱 추가** → Android를 고르고, 패키지 이름에 `com.seojeonguk.alcoholic`(`app.config.js`의 `android.package`)를 넣어 등록해요. 나머지 단계(SDK 추가 등)는 건너뛰어도 돼요. 이 저장소에 이미 들어 있어요.

## 파일 두기

> **`google-services.json`은 프로젝트 루트(`package.json`이 있는 폴더)에 둬요.** `app.config.js`의 `android.googleServicesFile`이 이 경로를 써요.

```text
alcoholic/
├── google-services.json   ← 여기
├── package.json
├── app.config.js
└── docs/
```

- 파일에 API 키가 들어 있어서 git에 올리지 않아요(`.gitignore`에 들어 있어요).
- 파일은 **빌드할 때 앱에 들어가요.** 바꾸면 개발용 빌드를 다시 만들어야 해요(README "개발용 빌드 설치하기").
- EAS 빌드에는 파일 환경 변수 `GOOGLE_SERVICES_JSON`으로 넣어요(README "빌드 · 배포 → 처음 한 번 준비하기").
- 파일이 없으면 빌드(prebuild)가 `Cannot copy google-services.json` 에러로 멈춰요.

## 켜 둬야 하는 Firebase 기능

설정 값이 맞아도 아래 기능이 꺼져 있으면 로그인이나 저장에서 에러가 나요.

| 기능            | 콘솔에서 확인할 곳                                                                         | 앱에서 쓰는 곳                                    |
| --------------- | ------------------------------------------------------------------------------------------ | ------------------------------------------------- |
| Authentication  | **Authentication → 로그인 방법 → 이메일/비밀번호** 사용 설정                               | 회원가입 · 로그인 · 이메일 인증 · 비밀번호 재설정 |
| Cloud Firestore | **Firestore Database**가 만들어져 있는지                                                   | 게시글 · 사용자 정보 저장                         |
| Cloud Storage   | **Storage**가 만들어져 있는지                                                              | 게시글 사진 업로드                                |
| Crashlytics     | **Crashlytics** 화면. `preview` · `production` 빌드에서 첫 크래시가 오면 대시보드가 열려요 | 크래시 · 처리하지 못한 에러 모으기                |
| Cloud Messaging | **실행 → Messaging**. 따로 켤 것은 없어요                                                  | 공지 알림([공지 알림 보내기](notifications.md))   |
| App Check       | 아래 [App Check](#app-check)                                                               | 진짜 이 앱에서 온 요청만 받기                     |

새로 만드는 Storage 버킷은 Blaze(종량제) 요금제가 필요할 수 있어요. 가능하면 이미 만들어 둔 프로젝트를 그대로 써요.

## App Check

App Check는 Firebase가 **진짜 이 앱에서 온 요청만** 받게 해요(#260). API 키는 앱에 들어 있어서 앱 밖에서도 Firebase를 부를 수 있는데, App Check를 **적용(enforce)**하면 그런 요청을 막아요.

- `preview` · `production` 빌드는 **Play Integrity**로 확인받아요.
- 개발용 빌드는 Play Integrity를 통과할 수 없어서 콘솔에 등록한 **디버그 토큰**을 써요.
- 콘솔에서 적용을 켜기 전까지는 토큰이 없거나 틀려도 요청이 막히지 않아요. 그래서 아래 설정을 끝내기 전에도 앱은 그대로 동작해요.

### 1. 디버그 토큰 등록하기 (개발용 빌드)

1. Firebase 콘솔 → **App Check** → **앱** 탭에서 Android 앱의 ⋮ → **디버그 토큰 관리**를 눌러요.
2. **디버그 토큰 추가** → 이름(예: `내 개발 PC`)을 넣고 **생성**을 눌러 나온 값을 복사해요.
3. 프로젝트 루트의 `.env`(없으면 `.env.example`을 복사)에 넣고 개발 서버를 다시 켜요(`npx expo start -c`).

   ```dotenv
   EXPO_PUBLIC_APP_CHECK_DEBUG_TOKEN=복사한-값
   ```

> **디버그 토큰은 `.env`(또는 EAS `development` 환경)에만 넣어요.** `preview` · `production` 환경 변수에 넣으면 그 값을 아는 누구나 App Check를 통과할 수 있어요.

### 2. Play Integrity 연결하기 (Play Console에 앱을 등록한 뒤)

1. Play Console → 앱 → **테스트 및 출시 → 앱 무결성**에서 **앱 서명 키 인증서**의 **SHA-256** 값을 복사해요(Play 앱 서명을 쓰므로 업로드 키가 아니라 앱 서명 키예요).
2. Firebase 콘솔 → **프로젝트 설정 → 일반 → 내 앱**의 Android 앱에서 **디지털 지문 추가**로 그 SHA-256을 넣어요.
3. Firebase 콘솔 → **App Check → 앱**에서 Android 앱의 **Play Integrity**를 골라 등록해요.
4. Play Console의 **앱 무결성 → Play Integrity API**에서 Firebase 프로젝트와 같은 **Google Cloud 프로젝트**를 연결해요.

### 3. 지켜본 뒤 적용하기

1. Firebase 콘솔 → **App Check → API** 탭에서 Cloud Firestore · Cloud Storage · Authentication의 요청 지표를 며칠 지켜봐요.
2. **확인된 요청**이 대부분이고, 확인되지 않은 요청이 예전 버전 앱이나 앱 밖 호출뿐이면 서비스마다 **적용**을 눌러요.
3. 적용한 뒤에는 App Check가 없는 예전 빌드는 Firebase를 쓸 수 없어요. 대부분의 사용자가 새 빌드로 업데이트한 뒤에 적용해요.

## 인증 메일 설정

회원가입 인증 메일과 비밀번호 재설정 메일은 Firebase Authentication이 보내요. 앱은 메일을 한국어 템플릿으로 보내고(`setLanguageCode(auth, 'ko')`), 사용자 이름이 없으면 이메일 앞부분을 이름으로 넣어서 템플릿의 `%DISPLAY_NAME%`이 비지 않게 해요. 나머지는 콘솔에서 설정해요.

### 메일에 나오는 앱 이름(`%APP_NAME%`)

템플릿의 `%APP_NAME%`에는 **프로젝트 설정 → 일반 → 공개용 이름**이 들어가요. 여기가 `project-1234…` 같은 값이면 메일에도 그대로 나오므로 `Alcoholic`처럼 사용자에게 보여 줄 이름으로 바꿔요.

### 템플릿

**Authentication → 템플릿**에서 **이메일 주소 인증**과 **비밀번호 재설정**을 확인해요.

1. 템플릿 언어를 **한국어**로 바꿔요(앱이 `ko`로 요청하므로 한국어 템플릿이 쓰여요).
2. 연필 아이콘으로 **보낸 사람 이름**을 `Alcoholic`으로 정해요.
3. 제목과 본문에 `%APP_NAME%` · `%DISPLAY_NAME%`이 제대로 들어가는지 확인해요. 본문은 짧게, 링크는 `%LINK%` 하나만 두는 게 스팸 분류에 유리해요.

### 스팸함으로 가지 않게 하기

기본 설정에서는 `noreply@<프로젝트 ID>.firebaseapp.com`에서 메일이 나가요. 이 공용 도메인은 받는 쪽(Gmail · 네이버 등)에서 평판이 낮아 스팸으로 분류되기 쉬워요. 가장 확실한 방법은 **내 도메인에서 보내는 것**이에요.

1. **Authentication → 템플릿 → 이메일 주소 인증 → 연필 아이콘 → 도메인 맞춤설정**을 눌러요.
2. 가진 도메인(예: `mail.example.com`)을 넣으면 Firebase가 DNS 레코드(TXT · CNAME)를 알려 줘요.
3. 도메인 DNS에 그 레코드를 추가하고 확인될 때까지 기다려요(최대 48시간). SPF · DKIM이 설정돼서 받는 쪽이 보낸 곳을 믿을 수 있게 돼요.
4. 확인되면 보낸 사람 주소를 `noreply@<내 도메인>`으로 바꾸고, 다른 템플릿에도 같은 도메인을 써요.

도메인이 없으면 공개용 이름 · 보낸 사람 이름 · 한국어 템플릿만 맞추고, 앱의 안내 문구(회원가입 후 토스트)에서 스팸함도 확인하라고 알려요.

## 보안 규칙

Firestore · Storage 보안 규칙은 저장소의 `firestore.rules` · `storage.rules`에서 관리해요(설정은 `firebase.json`, 프로젝트는 `.firebaserc`).

Firestore 복합 인덱스도 저장소의 `firestore.indexes.json`에서 관리해요. 갤러리의 내 글 목록(`getPosts`)이 `writer` 조건과 `createdAt` 정렬을 함께 써서 `posts`에 `writer` 오름차순 · `createdAt` 내림차순 인덱스가 있어야 해요. 새 Firebase 프로젝트를 쓸 때도 아래 배포 명령으로 함께 만들어져요.

| 대상                    | 규칙                                                                                                                                                                                   |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `users/{이메일}`        | 내 이메일 문서만 읽고 만들 수 있어요(회원가입 직후 인증 전에도 만들 수 있음). 수정은 안 돼요(`posts` 배열은 더 쓰지 않음). 탈퇴할 때 내 문서를 지울 수 있어요.                         |
| `posts/{글 ID}`         | 이메일 인증한 사용자가 `writer`가 내 이메일인 글만 읽고 쓰고 지울 수 있어요. 필드와 타입, 길이 상한(제목 40자 · 내용 2000자 · 장소 50자 · 태그 20개 각 1~20자 · 사진 10장)을 검사해요. |
| Storage `posts/{uid}/…` | 내 uid 폴더만 읽고 목록을 볼 수 있어요. 이메일 인증한 사용자가 내 uid 폴더에만 10MB 미만 이미지를 올릴 수 있어요. 덮어쓰기는 안 되고, 삭제는 탈퇴할 때 내 폴더만 돼요.                 |
| Storage 그 밖의 경로    | 예전 경로(`posts/{파일}`) 사진과 `posts` 폴더 전체 목록을 포함해 누구도 읽거나 쓸 수 없어요. 앱은 토큰이 붙은 다운로드 URL로 사진을 보여 줘서 규칙과 상관없어요.                       |

### 예전 경로 사진 정리

예전 빌드는 사진을 `posts/{파일}`(uid 폴더 밖)에 올렸어요. 이 경로는 규칙에서 허용을 뺐고(#319), 탈퇴하거나 글을 지워도 앱이 지우지 못해요. 규칙을 배포하기 전후로 한 번 정리해요.

1. Firebase 콘솔 → **Storage → Files**에서 `posts` 폴더를 열어요. uid 폴더만 있고 파일이 바로 들어 있지 않으면 끝이에요.
2. 파일이 있으면 그 사진을 쓰는 글을 찾아요. **Firestore → posts**에서 글의 `photos`에 `posts%2F{파일 이름}`(uid 폴더 없이)이 들어 있는 글이에요.
3. 남길 글이면 주인 계정으로 앱에서 글을 고쳐 그 사진을 빼고 기기에 있는 같은 사진을 다시 골라 저장해요. 다시 고른 사진은 `posts/{uid}/`에 올라가요.
4. 남길 필요가 없는 글은 앱에서 지우고, 주인이 없는 사진과 3에서 뺀 사진은 콘솔에서 파일을 골라 **삭제**해요.
5. 다시 1을 열어 `posts` 바로 아래에 파일이 남지 않았는지 확인해요.

### 테스트

```bash
npm run test:rules
```

Firestore · Storage 에뮬레이터를 띄워 `tests/rules/`의 테스트를 돌려요(`tests/rules/run.mjs`). **Java 21 이상**이 필요해요(firebase-tools 요구 사항). 실제 프로젝트가 아니라 `demo-alcoholic` 에뮬레이터 프로젝트를 써요.

- 결과는 마지막의 `ℹ pass` · `ℹ fail` 숫자로 봐요. 접근이 거절돼야 통과하는 테스트가 많아서, 거절 로그는 숨겨 뒀어요.
- Windows에서 `java`가 Oracle의 `javapath\java.exe`(진짜 java를 다시 띄우는 중계 프로그램)로 잡히면, 예전에는 테스트가 끝나도 Firestore 에뮬레이터가 꺼지지 않았어요. 지금은 `run.mjs`가 진짜 Java 경로(`java.home`)로 에뮬레이터를 띄워서 함께 꺼져요.

그래도 이전에 남은 에뮬레이터 때문에 "port taken" 에러가 나면 작업 관리자에서 `cloud-firestore-emulator`를 실행 중인 `java.exe`를 끄거나, PowerShell에서 아래 명령으로 꺼요.

```powershell
Get-CimInstance Win32_Process -Filter "Name='java.exe'" | Where-Object CommandLine -like '*cloud-firestore-emulator*' | ForEach-Object { Stop-Process -Id $_.ProcessId }
```

### 배포

규칙 · 인덱스를 바꾸면 테스트를 통과한 뒤 배포해요. 처음 배포하기 전에는 Firebase 콘솔의 Firestore · Storage **규칙** 탭에서 지금 규칙을 복사해 백업해 둬요.

```bash
npx firebase login
npx firebase deploy --only firestore:rules,firestore:indexes,storage
```

- 콘솔에는 있는데 `firestore.indexes.json`에 없는 인덱스가 있으면 배포할 때 지울지 물어봐요. 콘솔에서 만든 인덱스는 `npx firebase firestore:indexes`로 받아 파일에 먼저 넣어요.

## 사진으로 술 알아보기 (Cloud Functions)

회원이 고른 사진을 `functions/`의 `recognizeDrink` 함수가 받아 Claude(`claude-haiku-5-5`)로 술 이름 · 주종 · 태그를 알아봐요(#380). API 키는 앱에 넣지 않고 함수의 Secret에만 둬요. Firebase 프로젝트가 Blaze 요금제여야 배포돼요.

- 지역은 서울(`asia-northeast3`), 이메일 인증을 마친 회원 + App Check를 통과한 앱만 부를 수 있어요.
- 회원마다 하루 20번(한국 자정에 다시 셈)까지예요. 사용량은 Firestore `aiUsage/{uid}`에 적고, 보안 규칙상 앱은 읽거나 쓸 수 없어요.
- 사진은 저장하지 않아요. 로그에는 토큰 수만 남겨요.

### 처음 한 번

1. [Claude Console](https://platform.claude.com)에서 API 키를 만들어요. 결제 한도(Spend limit)를 낮게 걸어 두면 요금이 갑자기 늘지 않아요.
2. 키를 Secret에 넣어요. 입력하라고 나오면 키를 붙여 넣어요.

   ```bash
   npx firebase functions:secrets:set ANTHROPIC_API_KEY
   ```

### 배포

```bash
npm ci --prefix functions
npx firebase deploy --only functions
```

키를 바꾼 뒤에도 다시 배포해야 새 키를 써요.

## 계정 삭제 요청 처리하기

개인정보처리방침 4번의 이메일로 계정 삭제를 요청받으면, 가입한 이메일 주소에서 보낸 메일인지 확인하고 30일 안에 콘솔에서 아래를 모두 지워요. 앱의 탈퇴(`deleteUserData` → `deleteUser`)가 지우는 것과 같아요.

1. **Authentication → 사용자**에서 그 이메일을 찾아 **사용자 UID**를 적어 둬요.
2. **Firestore → posts**에서 `writer`가 그 이메일인 문서를 모두 지워요(필터: `writer == 이메일`).
3. **Storage**에서 `posts/{UID}/` 폴더를 통째로 지워요.
4. **Firestore → users**에서 `{이메일}` 문서를 지워요(없을 수도 있어요).
5. **Authentication → 사용자**에서 그 계정을 **삭제**해요.
6. 요청한 이메일로 삭제를 마쳤다고 답장해요.

> 이메일 인증을 하지 않은 계정은 글 · 사진이 없어서 4 · 5만 하면 돼요. 앱의 로그인 화면에서 직접 지울 수도 있어요(#322).

## 문제가 생기면

| 증상                                                 | 확인할 것                                                                                                                                             |
| ---------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| 빌드가 `Cannot copy google-services.json`으로 멈춰요 | 프로젝트 루트에 파일이 있는지, EAS 빌드면 `GOOGLE_SERVICES_JSON` 파일 환경 변수가 있는지                                                              |
| Expo Go에서 Firebase 모듈 에러가 나요                | Expo Go 대신 개발용 빌드로 열어요(README "개발용 빌드 설치하기")                                                                                      |
| `auth/invalid-api-key` 등 설정 에러                  | `google-services.json`이 맞는 프로젝트의 `com.seojeonguk.alcoholic` 앱 파일인지, 바꾼 뒤 빌드를 다시 했는지                                           |
| 적용 후 `permission-denied` · `app-check` 에러       | 개발용 빌드면 `.env`의 `EXPO_PUBLIC_APP_CHECK_DEBUG_TOKEN`이 콘솔에 등록한 값인지, 배포 빌드면 Play Integrity 연결(SHA-256 · Cloud 프로젝트)이 됐는지 |
| `auth/operation-not-allowed`                         | Authentication에서 이메일/비밀번호 로그인이 켜져 있는지                                                                                               |
| 인증 메일이 스팸함으로 가요                          | 위 [인증 메일 설정](#인증-메일-설정)의 공개용 이름 · 템플릿 · 도메인 맞춤설정                                                                         |
| 게시글 저장 · 조회에서 `permission-denied`           | 위 [보안 규칙](#보안-규칙) 표와, 규칙을 배포했는지(콘솔의 규칙 탭)                                                                                    |
| 사진 업로드가 실패해요                               | `google-services.json`의 `storage_bucket`과 Storage가 만들어져 있는지                                                                                 |
