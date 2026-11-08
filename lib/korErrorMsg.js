// Firebase Auth 에러 코드를 화면에 보여 줄 한국어 문구로 바꿈. 모르는 코드면 일반 문구
// React Native를 import하지 않아 node:test로 테스트함(node에서도 읽히게 확장자를 붙여 가져옴)
import { AUTH_ERRORS } from '../constants/errorMsg.js';

const getKorErrorMsg = (errorCode) => AUTH_ERRORS[errorCode] ?? '오류가 발생했어요.';

export { getKorErrorMsg };
