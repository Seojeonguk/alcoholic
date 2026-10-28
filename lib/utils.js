import { Toast } from 'react-native-toast-message/lib/src/Toast';
import { AUTH_ERRORS } from '../constants';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { sendEmailVerification, updateProfile } from 'firebase/auth';

const getKorErrorMsg = (errorCode) => {
  const errorMsg = AUTH_ERRORS[errorCode];
  return errorMsg === undefined ? '오류가 발생하였습니다.' : errorMsg;
};

// toJSON()은 UTC 기준이라 한국 시간 오전 9시 전에는 하루 전 날짜가 나옴. 기기 시간대 기준으로 만듦
const toLocalDateString = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const emailRequestLimitKey = 'emailRequestLimit';

const setEmailRequestLimit = async () => {
  const now = new Date();
  now.setMinutes(now.getMinutes() + 30);

  await AsyncStorage.setItem(emailRequestLimitKey, now.toString());
};

// 인증 메일 템플릿의 %DISPLAY_NAME%이 비지 않도록 이름이 없으면 이메일 앞부분을 넣음
const sendVerificationEmail = async (user) => {
  if (!user.displayName) {
    await updateProfile(user, { displayName: user.email.split('@')[0] });
  }
  await sendEmailVerification(user);
};

// 알림은 모두 화면 아래쪽에 띄움(디자인 개편)
const showToast = (type = 'error', text1, text2 = null, position = 'bottom') => {
  Toast.show({
    type: type,
    text1: text1,
    text2: text2,
    position: position,
  });
};

export {
  emailRequestLimitKey,
  getKorErrorMsg,
  sendVerificationEmail,
  setEmailRequestLimit,
  showToast,
  toLocalDateString,
};
