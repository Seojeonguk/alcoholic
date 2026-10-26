// 로그인 · 회원가입 에러를 어느 칸 아래에 보여 줄지 Firebase 에러 코드로 정함
// (문구에 "이메일"이 들어 있는지로 정하면 "이메일 또는 비밀번호를 잘못 입력했습니다."가 이메일 칸에 뜸)
// React Native를 import하지 않아 node:test로 테스트함
const EMAIL_ERROR_CODES = [
  'auth/invalid-email',
  'auth/email-already-in-use',
  'auth/user-not-found',
];

const getAuthErrorField = (code) => (EMAIL_ERROR_CODES.includes(code) ? 'email' : 'password');

export { getAuthErrorField };
