# alcoholic

마신 술을 사진과 함께 기록하는 React Native(Expo) 앱이에요.

## 주요 기능

- 이메일 회원가입 · 로그인, 이메일 인증, 비밀번호 재설정
- 가입 없이 시작하기: 기록 · 사진을 기기에만 저장하고, 나중에 가입하면 계정으로 옮겨요(#201)
- 술 기록 작성 · 수정: 사진(갤러리 · 카메라), 제목, 내용, 날짜, 장소, 태그
- 내 기록을 갤러리로 모아 보기, 상세 보기(사진 캐러셀), 태그 · 날짜로 찾기
- 공지 알림: 설정에서 켜면 새 버전 · 점검 소식을 받아요(#304, [공지 알림 보내기](docs/notifications.md))

## 기술 스택

| 영역      | 사용한 것                                                                                    |
| --------- | -------------------------------------------------------------------------------------------- |
| 앱        | Expo SDK 58, React 19, React Native 0.88                                                     |
| 화면 이동 | React Navigation 7 (native stack + bottom tabs)                                              |
| 상태 관리 | Redux Toolkit 2                                                                              |
| 백엔드    | Firebase (`@react-native-firebase` 네이티브 SDK: Authentication · Cloud Firestore · Storage) |
| 운영      | Firebase Crashlytics · App Check · Cloud Messaging(공지 알림), EAS Update                    |
| 이미지    | expo-image, expo-image-picker (시스템 사진 선택기)                                           |

## 로컬에서 실행하기

### 1. 준비물

- **Node.js** 22.13 이상 또는 24.3 이상
- **Android 휴대폰이나 에뮬레이터**(Android Studio)에 설치한 **개발용 빌드** (아래 4번)
  - 앱이 Firebase 네이티브 SDK를 써서 **Expo Go에서는 실행되지 않아요.**
- **Expo 계정**과 `npx eas-cli login` (개발용 빌드를 EAS에서 만들어요)
- 앱이 연결할 **Firebase 프로젝트** (Authentication의 이메일/비밀번호 로그인, Firestore, Storage 사용)

### 2. 저장소 받기와 패키지 설치

```bash
git clone https://github.com/Seojeonguk/alcoholic.git
cd alcoholic
npm install
```

### 3. `google-services.json` 넣기

Firebase 콘솔에서 Android 앱의 `google-services.json`을 받아 **프로젝트 루트**에 둬요. 받는 방법과 켜 둬야 하는 Firebase 기능은 [Firebase 설정](docs/firebase-setup.md)에 정리했어요.

- `google-services.json`은 git에 올리지 않아요(`.gitignore`에 들어 있어요). EAS 빌드에는 파일 환경 변수로 넣어요(아래 "빌드 · 배포").
- 이 파일은 **빌드할 때 앱에 들어가요.** 바꾸면 개발용 빌드를 다시 만들어야 해요.
- 개발용 빌드에서 App Check를 통과하려면 `.env`에 `EXPO_PUBLIC_APP_CHECK_DEBUG_TOKEN`을 넣어요. 콘솔에서 적용을 켜기 전까지는 없어도 돼요([Firebase 설정 → App Check](docs/firebase-setup.md#app-check)).

### 4. 개발용 빌드 설치하기

앱이 Firebase 네이티브 SDK를 써서 Expo Go 대신 **개발용 빌드**(이 앱 전용 Expo Go라고 생각하면 돼요)를 한 번 설치해요.

```bash
npx eas-cli build --platform android --profile development
```

빌드가 끝나면 나오는 QR 코드나 링크로 APK를 받아 설치해요. 네이티브 패키지를 추가 · 변경하거나 `app.config.js`의 네이티브 설정을 바꿨을 때만 다시 만들어요. JS 코드만 바꿨다면 다시 만들 필요가 없어요.

### 5. 개발 서버 실행

```bash
npx expo start
```

설치한 개발용 빌드(`Alcoholic`)를 열면 같은 Wi-Fi의 개발 서버가 목록에 나와요. 고르거나, 터미널의 QR 코드를 개발용 빌드로 스캔해요. Android 에뮬레이터는 터미널에서 `a`를 눌러요.

휴대폰과 컴퓨터는 **같은 Wi-Fi**에 있어야 해요. 코드를 저장하면 앱에 바로 반영되고, 터미널에서 `r`을 누르면 앱을 새로 불러와요.

### 6. 문제가 생기면

| 증상                                       | 해결 방법                                                          |
| ------------------------------------------ | ------------------------------------------------------------------ |
| 휴대폰에서 개발 서버에 연결되지 않아요     | 같은 Wi-Fi인지 확인하거나 `npx expo start --tunnel`로 실행해요     |
| Expo Go로 열면 Firebase 모듈 에러가 나요   | Expo Go가 아니라 개발용 빌드(4번)로 열어요                         |
| 네이티브 패키지를 바꾼 뒤 앱이 바로 꺼져요 | 개발용 빌드를 다시 만들어 설치해요                                 |
| `Native module ... is not registered`      | 설치한 개발용 빌드에 그 모듈이 없어요. 개발용 빌드를 다시 만들어요 |
| 패키지를 바꾼 뒤 이상한 에러가 나요        | `npx expo start -c`로 Metro 캐시를 지우고 실행해요                 |
| 로그인 · 저장에서 Firebase 에러가 나요     | `google-services.json`이 맞는 프로젝트 · 패키지 이름인지 확인해요  |
| 의존성 버전이 맞는지 궁금해요              | `npx expo-doctor`, `npx expo install --check`로 검사해요           |

## 패키지 추가하기

`npm install` 대신 `npx expo install <패키지>`로 설치해요. 지금 Expo SDK에 맞는 버전을 골라 줘요.

## 개인정보처리방침

[개인정보처리방침](docs/privacy-policy.md)은 GitHub Pages(`master` 브랜치의 `docs/` 폴더)로 공개해서 [웹 페이지](https://seojeonguk.github.io/alcoholic/privacy-policy)로 열려요. 앱의 설정 화면과 Google Play 스토어 등록정보에 이 주소를 넣어요. 앱이 모으는 데이터나 쓰는 서비스가 바뀌면 이 문서와 Play Console의 데이터 보안 양식을 함께 고쳐요.

## 빌드 · 배포

[EAS Build](https://docs.expo.dev/build/introduction/)로 빌드하고 Google Play에 올려요. 빌드 프로필은 `eas.json`에 있어요.

| 프로필        | 결과물 | 업데이트 채널 | 쓰는 곳                              |
| ------------- | ------ | ------------- | ------------------------------------ |
| `development` | APK    | `development` | 개발용 빌드(개발 서버에 붙어서 실행) |
| `preview`     | APK    | `preview`     | 기기에 바로 설치해서 확인            |
| `production`  | AAB    | `production`  | Google Play 업로드(내부 테스트 트랙) |

### 1. 처음 한 번 준비하기

```bash
npx eas-cli login
npx eas-cli env:create --environment development --environment preview --environment production   --name GOOGLE_SERVICES_JSON --type file --value ./google-services.json --visibility secret
```

- `google-services.json`은 git에 올리지 않아서 EAS 서버에 올라가지 않아요. 그래서 **EAS 파일 환경 변수** `GOOGLE_SERVICES_JSON`으로 넣어요. 빌드할 때 `app.config.js`가 이 파일 경로를 `android.googleServicesFile`로 써요. 각 프로필은 `eas.json`의 `environment`에 맞는 변수를 써요.
- 값이 바뀌면 같은 명령에 `--force`를 붙여 다시 넣어요. 넣은 값은 `npx eas-cli env:list --environment production`이나 [expo.dev](https://expo.dev) 프로젝트의 **Environment variables**에서 확인해요.

### 2. 빌드하기

```bash
npx eas-cli build --platform android --profile preview      # 설치용 APK
npx eas-cli build --platform android --profile production   # 스토어용 AAB
```

- 처음 `production` 빌드할 때 업로드 키(keystore)를 EAS가 만들도록 해요. 키는 EAS 서버에 보관되고, 잃어버리면 같은 앱으로 업데이트할 수 없으니 `npx eas-cli credentials`로 백업해 둬요.
- 스토어에 새로 올릴 때마다 `app.config.js`의 `android.versionCode`를 1씩 올려요. 버전 규칙은 `CLAUDE.md`의 "버전 · 릴리스"를 봐요.

### 3. Google Play에 올리기

Play Console의 앱 콘텐츠(데이터 보안 · 콘텐츠 등급 등)와 스토어 등록정보에 넣을 답은 [Google Play Console 등록](docs/play-console.md)에 정리했어요.

1. **처음 한 번은 직접 올려요.** Play Console에서 앱을 만들고 **테스트 및 출시 → 내부 테스트**에 `production` 빌드의 AAB를 올려요(Google Play API는 처음 업로드를 받지 않아요).
2. 그다음부터는 `eas submit`으로 올려요. Google Cloud 서비스 계정 키(JSON)가 필요해요. 만드는 방법은 [Expo 문서](https://github.com/expo/fyi/blob/main/creating-google-service-account.md)를 봐요.

   ```bash
   npx eas-cli submit --platform android --profile production --latest
   ```

   `eas.json`의 `submit.production` 설정대로 **내부 테스트** 트랙에 **초안**으로 올라가요. Play Console에서 확인하고 출시해요.

3. 내부 테스트에서 확인한 빌드를 Play Console에서 **프로덕션**으로 승격해요.

### 4. JS 수정 바로 배포하기 (EAS Update)

네이티브 코드가 바뀌지 않은 수정(화면 · 문구 · JS 버그)은 스토어 심사 없이 [EAS Update](https://docs.expo.dev/eas-update/introduction/)로 배포해요. 앱은 켜질 때 업데이트를 받아 두고 **다음에 켤 때** 적용해요.

**보낼 수 있는지 먼저 확인해요.** 업데이트는 `app.config.js`의 `version`이 같은 빌드에만 가요(`runtimeVersion` 정책 `appVersion`). 다음 중 하나라도 바뀌었으면 업데이트가 아니라 새 빌드로 올려요.

- 패키지 추가 · 삭제 · 버전 변경(`package.json`의 `dependencies`)
- `app.config.js`의 `plugins` · 권한 · `android` 설정
- 아이콘 · 스플래시 이미지

**배포하기**

```bash
# 먼저 preview 채널로 보내고, preview 빌드(APK)에서 확인해요
npx eas-cli update --channel preview --environment preview --message "고친 내용"

# 확인했으면 production 채널로 보내요
npx eas-cli update --channel production --environment production --message "고친 내용"
```

- `--environment`를 **꼭** 붙여요. 업데이트 번들에 들어가는 `EXPO_PUBLIC_*` 값을 빌드와 같은 EAS 환경 변수에서 읽어요. Firebase 설정(`google-services.json`)은 빌드에 들어 있어서 업데이트로는 바뀌지 않아요.
- 보낸 업데이트는 `npx eas-cli update:list --branch production`이나 [expo.dev](https://expo.dev) 프로젝트의 **Updates**에서 확인해요.

**되돌리기**

```bash
npx eas-cli update:rollback
```

- 고르는 화면에서 되돌릴 채널(브랜치)과 업데이트를 골라요. 바로 전 업데이트로 되돌리거나, 스토어 빌드에 들어 있던 원래 번들로 되돌릴 수 있어요.
- 되돌린 것도 앱을 두 번 켜야(받고 → 적용) 사용자 기기에 반영돼요.

**새 빌드를 올릴 때**

- 네이티브가 바뀐 빌드는 `version`을 올려서 만들어요. `version`이 그대로면 예전 빌드용 업데이트가 새 빌드에도 가서 앱이 멈출 수 있어요.
- 크래시와 처리하지 못한 에러는 `preview` · `production` 빌드에서만 Firebase 콘솔의 **Crashlytics**에 모여요. 개발용 빌드에서는 보내지 않아요.
- 개발용 빌드(`development`)와 `npx expo start`에서는 업데이트를 받지 않아요. 업데이트는 `preview` · `production` 빌드에서 확인해요.
