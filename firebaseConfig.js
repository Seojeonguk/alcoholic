// Firebase는 네이티브 SDK(@react-native-firebase)를 씀(#286)
// 설정 값은 google-services.json에서 빌드할 때 들어가므로 여기서 초기화하지 않음
// 로그인 상태 유지와 Firestore 오프라인 캐시도 네이티브 SDK가 알아서 함
import { getAuth, setLanguageCode } from '@react-native-firebase/auth';
import { getFirestore } from '@react-native-firebase/firestore';

const auth = getAuth();
const db = getFirestore();

// 인증 · 비밀번호 재설정 메일을 한국어 템플릿으로 보냄
setLanguageCode(auth, 'ko');

export { auth, db };
