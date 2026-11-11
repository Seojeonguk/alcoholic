// Firebase는 네이티브 SDK(@react-native-firebase)를 씀(#286)
// 설정 값은 google-services.json에서 빌드할 때 들어가므로 여기서 초기화하지 않음
// 로그인 상태 유지와 Firestore 오프라인 캐시도 네이티브 SDK가 알아서 함
import { getApp } from '@react-native-firebase/app';
import {
  initializeAppCheck,
  ReactNativeFirebaseAppCheckProvider,
} from '@react-native-firebase/app-check';
import { getAuth, setLanguageCode } from '@react-native-firebase/auth';
import { getCrashlytics } from '@react-native-firebase/crashlytics';
import { getFirestore } from '@react-native-firebase/firestore';

// App Check: 진짜 앱에서 온 요청인지 Firebase가 확인하게 함(#260)
// Auth · Firestore의 첫 요청에도 토큰이 붙도록 가장 먼저 초기화함
// 개발용 빌드는 Play Integrity를 통과하지 못하므로 콘솔에 등록한 디버그 토큰을 씀
const appCheckProvider = new ReactNativeFirebaseAppCheckProvider();
appCheckProvider.configure({
  android: {
    provider: __DEV__ ? 'debug' : 'playIntegrity',
    // .env에만 넣고 preview · production EAS 환경 변수에는 넣지 않음(넣으면 누구나 검사를 통과함)
    debugToken: process.env.EXPO_PUBLIC_APP_CHECK_DEBUG_TOKEN,
  },
});
// 사진으로 술 알아보기(#381)처럼 함수를 fetch로 부를 때 이 인스턴스로 토큰을 받음
const appCheck = initializeAppCheck(getApp(), {
  provider: appCheckProvider,
  isTokenAutoRefreshEnabled: true,
});

const auth = getAuth();
const db = getFirestore();

// 인증 · 비밀번호 재설정 메일을 한국어 템플릿으로 보냄
setLanguageCode(auth, 'ko');

// 처음 부를 때 처리하지 못한 JS 에러 · Promise 거절을 Crashlytics로 보내는 처리기가 등록됨(#259)
// 개발용 빌드(debug)에서는 보내지 않고 preview · production 빌드에서만 보냄
getCrashlytics();

export { appCheck, auth, db };
