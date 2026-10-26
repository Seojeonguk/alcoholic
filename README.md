# alcoholic

마신 술을 사진과 함께 기록하는 React Native(Expo) 앱이에요.

## 주요 기능

- 이메일 회원가입 · 로그인, 이메일 인증, 비밀번호 재설정
- 술 기록 작성 · 수정: 사진(갤러리 · 카메라), 제목, 내용, 날짜, 장소, 태그
- 내 기록을 갤러리로 모아 보기, 상세 보기(사진 캐러셀)

## 기술 스택

| 영역      | 사용한 것                                                |
| --------- | -------------------------------------------------------- |
| 앱        | Expo SDK 58, React 19, React Native 0.88                 |
| 화면 이동 | React Navigation 7 (native stack + bottom tabs)          |
| 상태 관리 | Redux Toolkit 2                                          |
| 백엔드    | Firebase 13 (Authentication · Cloud Firestore · Storage) |
| 이미지    | expo-image, expo-image-picker (시스템 사진 선택기)       |

## 로컬에서 실행하기

### 1. 준비물

- **Node.js** 22.13 이상 또는 24.3 이상
- **휴대폰에 Expo Go** 최신 버전 (SDK 58을 지원하는 버전)
  - [Android(Google Play)](https://play.google.com/store/apps/details?id=host.exp.exponent) · [iOS(App Store)](https://apps.apple.com/app/expo-go/id982107779)
  - 휴대폰 대신 Android 에뮬레이터(Android Studio)나 iOS 시뮬레이터(macOS, Xcode)를 써도 돼요.
- 앱이 연결할 **Firebase 프로젝트** (Authentication의 이메일/비밀번호 로그인, Firestore, Storage 사용)

### 2. 저장소 받기와 패키지 설치

```bash
git clone https://github.com/Seojeonguk/alcoholic.git
cd alcoholic
npm install
```

### 3. `.env` 만들기

프로젝트 루트에 `.env` 파일을 만들고 Firebase 설정 값을 넣어요. 값을 찾는 방법과 켜 둬야 하는 Firebase 기능은 [Firebase 설정](docs/firebase-setup.md)에 정리했어요.

```dotenv
EXPO_PUBLIC_FIREBASE_API_KEY=
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=
EXPO_PUBLIC_FIREBASE_PROJECT_ID=
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
EXPO_PUBLIC_FIREBASE_APP_ID=
EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=
```

- Expo CLI가 `.env`를 자동으로 읽어서 `app.config.js`에 넘겨요. 따로 설치할 건 없어요.
- `.env`는 git에 올리지 않아요(`.gitignore`에 들어 있어요).
- `.env`를 고친 뒤에는 개발 서버를 껐다가 다시 켜야 반영돼요.

### 4. 개발 서버 실행

```bash
npx expo start
```

터미널에 QR 코드가 나오면 아래 방법 중 하나로 앱을 열어요.

- **Android 휴대폰**: Expo Go 앱에서 QR 코드를 스캔해요.
- **iPhone**: 기본 카메라 앱으로 QR 코드를 스캔해요.
- **Android 에뮬레이터**: 에뮬레이터를 켜 둔 상태에서 터미널에서 `a`를 눌러요(또는 `npm run android`).
- **iOS 시뮬레이터**(macOS): 터미널에서 `i`를 눌러요(또는 `npm run ios`).

휴대폰과 컴퓨터는 **같은 Wi-Fi**에 있어야 해요. 코드를 저장하면 앱에 바로 반영되고, 터미널에서 `r`을 누르면 앱을 새로 불러와요.

### 5. 문제가 생기면

| 증상                                          | 해결 방법                                                      |
| --------------------------------------------- | -------------------------------------------------------------- |
| 휴대폰에서 개발 서버에 연결되지 않아요        | 같은 Wi-Fi인지 확인하거나 `npx expo start --tunnel`로 실행해요 |
| Expo Go에서 "SDK 버전이 맞지 않는다"고 나와요 | Expo Go를 최신 버전으로 업데이트해요                           |
| 패키지를 바꾼 뒤 이상한 에러가 나요           | `npx expo start -c`로 Metro 캐시를 지우고 실행해요             |
| 로그인 · 저장에서 Firebase 에러가 나요        | `.env` 값이 맞는지 확인하고 개발 서버를 다시 켜요              |
| 의존성 버전이 맞는지 궁금해요                 | `npx expo-doctor`, `npx expo install --check`로 검사해요       |

## 패키지 추가하기

`npm install` 대신 `npx expo install <패키지>`로 설치해요. 지금 Expo SDK에 맞는 버전을 골라 줘요.

## 빌드 · 배포

[EAS Build](https://docs.expo.dev/build/introduction/)로 빌드하고 Google Play에 올려요. 빌드 프로필은 `eas.json`에 있어요.

| 프로필       | 결과물 | 쓰는 곳                              |
| ------------ | ------ | ------------------------------------ |
| `preview`    | APK    | 기기에 바로 설치해서 확인            |
| `production` | AAB    | Google Play 업로드(내부 테스트 트랙) |

### 1. 처음 한 번 준비하기

```bash
npx eas-cli login
npx eas-cli env:push --environment production --path .env
npx eas-cli env:push --environment preview --path .env
```

- `.env`는 git에 올리지 않아서 EAS 서버에 올라가지 않아요. 그래서 Firebase 키를 **EAS 환경 변수**로 따로 넣어요. 각 프로필은 `eas.json`의 `environment`에 맞는 변수를 써요.
- 값이 바뀌면 같은 명령에 `--force`를 붙여 다시 넣어요. 넣은 값은 `npx eas-cli env:list --environment production`이나 [expo.dev](https://expo.dev) 프로젝트의 **Environment variables**에서 확인해요.

### 2. 빌드하기

```bash
npx eas-cli build --platform android --profile preview      # 설치용 APK
npx eas-cli build --platform android --profile production   # 스토어용 AAB
```

- 처음 `production` 빌드할 때 업로드 키(keystore)를 EAS가 만들도록 해요. 키는 EAS 서버에 보관되고, 잃어버리면 같은 앱으로 업데이트할 수 없으니 `npx eas-cli credentials`로 백업해 둬요.
- 스토어에 새로 올릴 때마다 `app.config.js`의 `android.versionCode`를 1씩 올려요. 버전 규칙은 `CLAUDE.md`의 "버전 · 릴리스"를 봐요.

### 3. Google Play에 올리기

1. **처음 한 번은 직접 올려요.** Play Console에서 앱을 만들고 **테스트 및 출시 → 내부 테스트**에 `production` 빌드의 AAB를 올려요(Google Play API는 처음 업로드를 받지 않아요).
2. 그다음부터는 `eas submit`으로 올려요. Google Cloud 서비스 계정 키(JSON)가 필요해요. 만드는 방법은 [Expo 문서](https://github.com/expo/fyi/blob/main/creating-google-service-account.md)를 봐요.

   ```bash
   npx eas-cli submit --platform android --profile production --latest
   ```

   `eas.json`의 `submit.production` 설정대로 **내부 테스트** 트랙에 **초안**으로 올라가요. Play Console에서 확인하고 출시해요.

3. 내부 테스트에서 확인한 빌드를 Play Console에서 **프로덕션**으로 승격해요.
