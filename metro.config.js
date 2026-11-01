// Learn more https://docs.expo.dev/guides/customizing-metro
// Sentry가 소스맵과 번들을 맞춰 볼 수 있게 debug ID를 넣음
const { getSentryExpoConfig } = require('@sentry/react-native/metro');

module.exports = getSentryExpoConfig(__dirname);
