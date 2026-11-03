// 회원 · 비회원 구분(#201)
// 회원: 인증을 마친 계정으로 로그인돼 있음. 비회원: "가입 없이 시작하기"를 누른 적이 있음(기기에 표시를 남김)
import { auth } from '../firebaseConfig';

import { onAuthStateChanged } from '@react-native-firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const GUEST_MODE_KEY = 'guestMode';

const isMember = () => auth.currentUser?.emailVerified === true;

const enterGuestMode = () => AsyncStorage.setItem(GUEST_MODE_KEY, '1');

const leaveGuestMode = () => AsyncStorage.removeItem(GUEST_MODE_KEY);

const hasGuestFlag = async () => (await AsyncStorage.getItem(GUEST_MODE_KEY)) === '1';

// 앱을 켤 때 기기에 남은 로그인 상태를 처음 한 번 확인함(없으면 null)
const waitForAuthUser = () =>
  new Promise((resolve) => {
    let unsubscribe = null;
    let called = false;
    unsubscribe = onAuthStateChanged(auth, (user) => {
      called = true;
      unsubscribe?.();
      resolve(user);
    });
    // 구독하는 중에 바로 불렸으면 그때는 끊을 함수가 없었으므로 여기서 끊음
    if (called) {
      unsubscribe();
    }
  });

export { enterGuestMode, hasGuestFlag, isMember, leaveGuestMode, waitForAuthUser };
