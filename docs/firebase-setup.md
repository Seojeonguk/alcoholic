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

## 문제가 생기면

| 증상                                       | 확인할 것                                                                         |
| ------------------------------------------ | --------------------------------------------------------------------------------- |
| "Firebase 설정 값이 없어요: …" 에러        | `.env`가 프로젝트 루트에 있는지, 에러에 나온 키가 있는지, 개발 서버를 다시 켰는지 |
| Expo Go에서 스피너만 계속 돌아요           | 위와 같아요. 그래도 그렇다면 README의 "문제가 생기면"을 봐요                      |
| `auth/invalid-api-key`                     | `EXPO_PUBLIC_FIREBASE_API_KEY` 값이 콘솔의 웹 앱 `apiKey`와 같은지                |
| `auth/operation-not-allowed`               | Authentication에서 이메일/비밀번호 로그인이 켜져 있는지                           |
| 게시글 저장 · 조회에서 `permission-denied` | Firestore · Storage 보안 규칙 (#216에서 정리할 예정)                              |
| 사진 업로드가 실패해요                     | `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET` 값과 Storage가 만들어져 있는지              |
