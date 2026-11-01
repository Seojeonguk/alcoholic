// Firebase는 네이티브 SDK(@react-native-firebase)를 씀(#286)
// 설정 값은 google-services.json에서 빌드할 때 들어가므로 여기서 초기화하지 않음
// 로그인 상태 유지와 Firestore 오프라인 캐시도 네이티브 SDK가 알아서 함
import { getAuth, setLanguageCode } from '@react-native-firebase/auth';
import { getCrashlytics } from '@react-native-firebase/crashlytics';
import { getFirestore } from '@react-native-firebase/firestore';

const auth = getAuth();
const db = getFirestore();

// 인증 · 비밀번호 재설정 메일을 한국어 템플릿으로 보냄
setLanguageCode(auth, 'ko');

// 처음 부를 때 처리하지 못한 JS 에러 · Promise 거절을 Crashlytics로 보내는 처리기가 등록됨(#259)
// 개발용 빌드(debug)에서는 보내지 않고 preview · production 빌드에서만 보냄
getCrashlytics();

export { auth, db };
