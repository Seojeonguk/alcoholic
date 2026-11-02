// 회원 · 비회원 구분(#201)
// 회원: 인증을 마친 계정으로 로그인돼 있음. 비회원: "가입 없이 시작하기"를 누른 적이 있음(기기에 표시를 남김)
import { auth } from '../firebaseConfig';

import AsyncStorage from '@react-native-async-storage/async-storage';

const GUEST_MODE_KEY = 'guestMode';

const isMember = () => auth.currentUser?.emailVerified === true;

const enterGuestMode = () => AsyncStorage.setItem(GUEST_MODE_KEY, '1');

const leaveGuestMode = () => AsyncStorage.removeItem(GUEST_MODE_KEY);

const hasGuestFlag = async () => (await AsyncStorage.getItem(GUEST_MODE_KEY)) === '1';

export { enterGuestMode, hasGuestFlag, isMember, leaveGuestMode };
