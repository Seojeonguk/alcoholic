import { Linking } from 'react-native';
import { PRIVACY_POLICY_URL } from '../constants';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { sendEmailVerification, updateProfile } from '@react-native-firebase/auth';
import Toast from 'react-native-toast-message';

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

// 개인정보처리방침 페이지를 엶. 열 브라우저가 없거나 실패하면 알림으로 알려 줌(#329)
const openPrivacyPolicy = async () => {
  try {
    await Linking.openURL(PRIVACY_POLICY_URL);
  } catch {
    showToast('error', '개인정보처리방침을 열지 못했어요.', PRIVACY_POLICY_URL);
  }
};

export {
  emailRequestLimitKey,
  openPrivacyPolicy,
  sendVerificationEmail,
  setEmailRequestLimit,
  showToast,
};
