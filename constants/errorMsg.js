// Firebase Auth 에러 코드. 네이티브 SDK(@react-native-firebase/auth)도 웹 SDK와 같은 'auth/...' 코드를 줌
const AUTH_ERRORS = {
  'auth/email-already-in-use': '이미 사용 중인 이메일입니다.',
  'auth/invalid-email': '이메일 형식에 맞지 않는 메일 주소입니다.',
  'auth/weak-password': '비밀번호는 최소 6자 이상이어야 합니다.',
  'auth/user-not-found': '등록되지 않은 이메일입니다.',
  'auth/wrong-password': '이메일 또는 비밀번호를 잘못 입력했습니다.',
  'auth/invalid-credential': '이메일 또는 비밀번호를 잘못 입력했습니다.',
  'auth/too-many-requests': '시도 횟수가 많아 잠시 막혔습니다. 잠시 후 다시 시도해 주세요.',
  'auth/network-request-failed': '네트워크 연결을 확인해 주세요.',
  'missing/email': '이메일을 입력해 주세요.',
  'missing/password': '비밀번호를 입력해 주세요.',
};

export { AUTH_ERRORS };
