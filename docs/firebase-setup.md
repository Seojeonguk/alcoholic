# Firebase 설정

로컬에서 앱을 실행하려면 `.env`에 Firebase 설정 값을 넣어야 해요. 이 문서는 그 값을 Firebase 콘솔에서 찾는 방법과, 앱이 동작하는 데 필요한 Firebase 기능을 정리해요.

이 앱은 Android · iOS 네이티브 SDK가 아니라 **Firebase JavaScript SDK**를 써요. 그래서 `google-services.json`이나 `GoogleService-Info.plist`가 아니라 **웹 앱의 `firebaseConfig` 값**이 필요해요.

## 설정 값 찾기

1. [Firebase 콘솔](https://console.firebase.google.com)에 로그인하고 이 앱이 쓰는 프로젝트를 골라요.
2. 왼쪽 위 **프로젝트 개요** 옆의 ⚙(톱니바퀴) → **프로젝트 설정**으로 들어가요.
3. **일반** 탭을 아래로 내려 **내 앱** 영역에서 웹 앱(`</>` 아이콘)을 골라요.
4. **SDK 설정 및 구성**에서 **구성(Config)**을 고르면 아래와 같은 값이 나와요.

```js
const firebaseConfig = {
  apiKey: 'AIza...',
  authDomain: 'xxx.firebaseapp.com',
  projectId: 'xxx',
  storageBucket: 'xxx.firebasestorage.app',
  messagingSenderId: '1234567890',
  appId: '1:1234567890:web:abcdef',
  measurementId: 'G-XXXXXXX',
};
```

### 웹 앱이 목록에 없을 때

**내 앱**에서 **앱 추가** → 웹(`</>`)을 고르고, 닉네임을 넣어 등록하면 같은 구성 화면이 나와요. Firebase Hosting 설정은 체크하지 않아도 돼요.

## `.env`에 옮기기

> **`.env`는 반드시 프로젝트 루트(`package.json`이 있는 폴더)에 만들어요.** `docs` 같은 하위 폴더에 두면 Expo가 읽지 못해서, 앱이 "Firebase 설정 값이 없어요" 에러를 띄우거나 Expo Go에서 스피너만 돌아요.

```text
alcoholic/
├── .env          ← 여기
├── package.json
├── app.config.js
└── docs/
```

프로젝트 루트의 `.env`에 아래처럼 옮겨 적어요.

| `firebaseConfig` 항목 | `.env` 키                                  |
| --------------------- | ------------------------------------------ |
| `apiKey`              | `EXPO_PUBLIC_FIREBASE_API_KEY`             |
| `authDomain`          | `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN`         |
| `projectId`           | `EXPO_PUBLIC_FIREBASE_PROJECT_ID`          |
| `storageBucket`       | `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET`      |
| `messagingSenderId`   | `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` |
| `appId`               | `EXPO_PUBLIC_FIREBASE_APP_ID`              |
| `measurementId`       | `EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID`      |

```dotenv
EXPO_PUBLIC_FIREBASE_API_KEY=AIza...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=xxx.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=xxx
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=xxx.firebasestorage.app
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=1234567890
EXPO_PUBLIC_FIREBASE_APP_ID=1:1234567890:web:abcdef
EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXX
```

- 값에 따옴표를 붙이지 않아요.
- `measurementId`는 Google Analytics를 켠 프로젝트에만 있어요. 없으면 비워 둬도 돼요.
- `.env`는 **개발 서버를 켤 때만 읽어요.** 만들거나 고친 뒤에는 서버를 끄고(`Ctrl+C`) `npx expo start -c`로 다시 켜요. 앱을 새로 고치는 것만으로는 반영되지 않아요.
- 제대로 읽혔는지는 `npx expo config --type public`의 `extra`에 `firebaseApiKey` 등이 들어 있는지로 확인할 수 있어요.
- `.env`는 git에 올리지 않아요(`.gitignore`에 들어 있어요).

## 켜 둬야 하는 Firebase 기능

설정 값이 맞아도 아래 기능이 꺼져 있으면 로그인이나 저장에서 에러가 나요.

| 기능            | 콘솔에서 확인할 곳                                           | 앱에서 쓰는 곳                                    |
| --------------- | ------------------------------------------------------------ | ------------------------------------------------- |
| Authentication  | **Authentication → 로그인 방법 → 이메일/비밀번호** 사용 설정 | 회원가입 · 로그인 · 이메일 인증 · 비밀번호 재설정 |
| Cloud Firestore | **Firestore Database**가 만들어져 있는지                     | 게시글 · 사용자 정보 저장                         |
| Cloud Storage   | **Storage**가 만들어져 있는지                                | 게시글 사진 업로드                                |

새로 만드는 Storage 버킷은 Blaze(종량제) 요금제가 필요할 수 있어요. 가능하면 이미 만들어 둔 프로젝트를 그대로 써요.

## 인증 메일 설정

회원가입 인증 메일과 비밀번호 재설정 메일은 Firebase Authentication이 보내요. 앱은 메일을 한국어 템플릿으로 보내고(`auth.languageCode = 'ko'`), 사용자 이름이 없으면 이메일 앞부분을 이름으로 넣어서 템플릿의 `%DISPLAY_NAME%`이 비지 않게 해요. 나머지는 콘솔에서 설정해요.

### 메일에 나오는 앱 이름(`%APP_NAME%`)

템플릿의 `%APP_NAME%`에는 **프로젝트 설정 → 일반 → 공개용 이름**이 들어가요. 여기가 `project-1234…` 같은 값이면 메일에도 그대로 나오므로 `alcoholic`처럼 사용자에게 보여 줄 이름으로 바꿔요.

### 템플릿

**Authentication → 템플릿**에서 **이메일 주소 인증**과 **비밀번호 재설정**을 확인해요.

1. 템플릿 언어를 **한국어**로 바꿔요(앱이 `ko`로 요청하므로 한국어 템플릿이 쓰여요).
2. 연필 아이콘으로 **보낸 사람 이름**을 `alcoholic`으로 정해요.
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

| 대상                                     | 규칙                                                                                                                     |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `users/{이메일}`                         | 내 이메일 문서만 읽고 만들 수 있어요(회원가입 직후 인증 전에도 만들 수 있음). 수정은 이메일 인증 후 `posts` 배열만 돼요. |
| `posts/{글 ID}`                          | 이메일 인증한 사용자가 `writer`가 내 이메일인 글만 읽고 쓰고 지울 수 있어요. 필드와 타입을 검사해요.                     |
| Storage `posts/{uid}/…`                  | 이메일 인증한 사용자가 내 uid 폴더에만 10MB 미만 이미지를 올릴 수 있어요. 덮어쓰기 · 삭제는 안 돼요.                     |
| Storage `posts/…`(예전) · `default.jfif` | 로그인한 사용자가 읽기만 할 수 있어요.                                                                                   |

### 테스트

```bash
npm run test:rules
```

Firestore · Storage 에뮬레이터를 띄워 `tests/rules/`의 테스트를 돌려요. Java 11 이상이 필요해요. 실제 프로젝트가 아니라 `demo-alcoholic` 에뮬레이터 프로젝트를 써요.

Windows에서는 테스트가 끝나도 Firestore 에뮬레이터(`java.exe`)가 꺼지지 않고 남을 수 있어요. 다음 실행에서 "port taken" 에러가 나면 작업 관리자에서 `cloud-firestore-emulator`를 실행 중인 `java.exe`를 끄거나, PowerShell에서 아래 명령으로 꺼요.

```powershell
Get-CimInstance Win32_Process -Filter "Name='java.exe'" | Where-Object CommandLine -like '*cloud-firestore-emulator*' | ForEach-Object { Stop-Process -Id $_.ProcessId }
```

### 배포

규칙을 바꾸면 테스트를 통과한 뒤 배포해요. 처음 배포하기 전에는 Firebase 콘솔의 Firestore · Storage **규칙** 탭에서 지금 규칙을 복사해 백업해 둬요.

```bash
npx firebase login
npx firebase deploy --only firestore:rules,storage
```

## 문제가 생기면

| 증상                                       | 확인할 것                                                                         |
| ------------------------------------------ | --------------------------------------------------------------------------------- |
| "Firebase 설정 값이 없어요: …" 에러        | `.env`가 프로젝트 루트에 있는지, 에러에 나온 키가 있는지, 개발 서버를 다시 켰는지 |
| Expo Go에서 스피너만 계속 돌아요           | 위와 같아요. 그래도 그렇다면 README의 "문제가 생기면"을 봐요                      |
| `auth/invalid-api-key`                     | `EXPO_PUBLIC_FIREBASE_API_KEY` 값이 콘솔의 웹 앱 `apiKey`와 같은지                |
| `auth/operation-not-allowed`               | Authentication에서 이메일/비밀번호 로그인이 켜져 있는지                           |
| 인증 메일이 스팸함으로 가요                | 위 [인증 메일 설정](#인증-메일-설정)의 공개용 이름 · 템플릿 · 도메인 맞춤설정     |
| 게시글 저장 · 조회에서 `permission-denied` | 위 [보안 규칙](#보안-규칙) 표와, 규칙을 배포했는지(콘솔의 규칙 탭)                |
| 사진 업로드가 실패해요                     | `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET` 값과 Storage가 만들어져 있는지              |
