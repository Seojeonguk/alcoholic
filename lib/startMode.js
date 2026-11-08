// 앱을 켤 때 어느 화면부터 보여 줄지 정하는 함수(#295)
// React Native를 import하지 않아 node:test로 테스트함(node에서도 읽히게 확장자를 붙여 가져옴)
import { getAppMode } from './guestPosts.js';

// 로그인 상태 · 비회원 표시 확인을 기다리는 최대 시간. 지나면 스플래시를 닫고 첫 화면부터 보여 줌
const START_MODE_TIMEOUT_MS = 5000;

// 회원 · 비회원은 갤러리부터, 그 밖(처음 · 확인하지 못함)은 첫 화면부터 보여 줌
const startsAtGallery = (mode) => mode === 'member' || mode === 'guest';

// getUser: 처음 확인된 로그인 사용자(없으면 null), getGuestFlag: 비회원 표시가 있는지
// 둘 다 timeoutMs 안에 끝나면 'member' | 'guest' | 'start', 시간이 지나거나 실패하면 null
// null이면 첫 화면부터 보여 주고, 첫 화면이 로그인 상태를 다시 확인해서 갤러리로 보냄
const decideStartMode = ({ getUser, getGuestFlag, timeoutMs = START_MODE_TIMEOUT_MS }) => {
  let timer;
  const timeout = new Promise((resolve) => {
    timer = setTimeout(() => resolve(null), timeoutMs);
  });
  // 함수가 바로 에러를 던져도 null로 받도록 then 안에서 부름
  const decide = Promise.resolve()
    .then(() => Promise.all([getUser(), getGuestFlag()]))
    .then(([user, guestFlag]) =>
      getAppMode({ hasVerifiedUser: user?.emailVerified === true, guestFlag })
    );
  return Promise.race([decide, timeout])
    .catch(() => null)
    .finally(() => clearTimeout(timer));
};

export { decideStartMode, startsAtGallery };
