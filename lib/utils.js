import { Toast } from 'react-native-toast-message/lib/src/Toast';
import { AUTH_ERRORS } from '../constants';
import { Dimensions } from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { sendEmailVerification, updateProfile } from 'firebase/auth';

const getKorErrorMsg = (errorCode) => {
  const errorMsg = AUTH_ERRORS[errorCode];
  return errorMsg === undefined ? '오류가 발생하였습니다.' : errorMsg;
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

const showToast = (type = 'error', text1, text2 = null, position = 'bottom') => {
  Toast.show({
    type: type,
    text1: text1,
    text2: text2,
    position: position,
  });
};

const getDeviceSize = () => {
  const { width, height } = Dimensions.get('window');

  const minSize = Math.min(width, height);

  return { width, height, minSize };
};

const convertStringRatioToIntRatio = (strRatio) => {
  const parts = strRatio.split(':');

  const numerator = parseInt(parts[0]);
  const denominator = parseInt(parts[1]);

  const gcd = calculateGCD(numerator, denominator);

  const simplifiedNumerator = numerator / gcd;
  const simplifiedDenominator = denominator / gcd;

  const smallerRatio = Math.min(simplifiedNumerator, simplifiedDenominator);
  const largerRatio = Math.max(simplifiedNumerator, simplifiedDenominator);
  const ratio = simplifiedNumerator / simplifiedDenominator;

  return { smallerRatio, largerRatio, ratio };
};

const calculateGCD = (a, b) => {
  while (b !== 0) {
    const temp = b;
    b = a % b;
    a = temp;
  }
  return a;
};

export {
  emailRequestLimitKey,
  getKorErrorMsg,
  sendVerificationEmail,
  setEmailRequestLimit,
  showToast,
  getDeviceSize,
  convertStringRatioToIntRatio,
};
