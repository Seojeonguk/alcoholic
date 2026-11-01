// 사용자 기기에서 난 크래시 · 처리하지 못한 에러를 Sentry로 모음(#259)
import Constants from 'expo-constants';

import * as Sentry from '@sentry/react-native';

const dsn = Constants.expoConfig?.extra?.sentryDsn;

// DSN이 없거나 개발 중이면 아무것도 보내지 않음
Sentry.init({
  dsn,
  enabled: !!dsn && !__DEV__,
  // 이메일 · IP 같은 개인정보는 보내지 않음
  sendDefaultPii: false,
});

export default Sentry;
