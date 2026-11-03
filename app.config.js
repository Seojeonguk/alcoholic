const EAS_PROJECT_ID = '090110c1-78a6-496f-9564-f32647afce83';

// 공지 알림 아이콘은 흰색 단색, 색상은 앱 강조색(constants/theme.js의 ACCENT)
const NOTIFICATION = {
  icon: './assets/notification-icon.png',
  color: '#2E699A',
  channelLabel: '공지 알림',
};

export default {
  expo: {
    name: 'Alcoholic',
    slug: 'alcoholic',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    // EAS Update로 받은 JS 업데이트는 앱이 켜질 때 받아 두고 다음에 켤 때 적용함
    updates: {
      url: `https://u.expo.dev/${EAS_PROJECT_ID}`,
      fallbackToCacheTimeout: 0,
    },
    // 같은 version으로 만든 빌드에만 업데이트가 감. 네이티브가 바뀌면 version을 꼭 올림
    runtimeVersion: {
      policy: 'appVersion',
    },
    assetBundlePatterns: ['**/*'],
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.seojeonguk.alcoholic',
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#F6E8D8',
      },
      package: 'com.seojeonguk.alcoholic',
      // Firebase 설정 파일. git에 올리지 않고 EAS 빌드에서는 파일 환경 변수로 받음(README "빌드 · 배포")
      googleServicesFile: process.env.GOOGLE_SERVICES_JSON ?? './google-services.json',
      // 스토어에 올릴 때마다 1씩 올림
      versionCode: 1,
      // Android 13 이상의 공지 알림 권한. 앱을 켤 때가 아니라 사용자가 알림을 켤 때 요청함(#304)
      permissions: ['android.permission.POST_NOTIFICATIONS'],
    },
    web: {
      favicon: './assets/favicon.png',
    },
    extra: {
      eas: {
        projectId: EAS_PROJECT_ID,
      },
    },
    plugins: [
      // google-services.json을 네이티브 프로젝트에 넣음
      '@react-native-firebase/app',
      // 네이티브 크래시를 모으고 난독화된 스택을 되돌리는 Gradle 플러그인을 넣음
      '@react-native-firebase/crashlytics',
      // 공지 알림(FCM, #304). 아이콘 · 색상 메타데이터를 AndroidManifest에 넣음
      [
        '@react-native-firebase/messaging',
        {
          android: { notificationIcon: NOTIFICATION.icon, notificationColor: NOTIFICATION.color },
        },
      ],
      // 위 메타데이터가 가리키는 아이콘 · 색상 리소스와 기본 알림 채널 이름(한국어)을 만듦
      ['./plugins/withNotificationDefaults', NOTIFICATION],
      [
        'expo-build-properties',
        {
          // @react-native-firebase 27이 쓰는 Firebase Android SDK는 Kotlin 2.4로 컴파일돼 있어서
          // RN 기본값(2.2)으로는 auth 모듈이 컴파일되지 않음
          android: { kotlinVersion: '2.4.0' },
        },
      ],
      [
        'expo-splash-screen',
        {
          image: './assets/splash.png',
          imageWidth: 200,
          // 앱 아이콘 배경색과 같게 맞춤
          backgroundColor: '#F6E8D8',
        },
      ],
      [
        'expo-image-picker',
        {
          photosPermission: '기록에 남길 사진을 고를 수 있게 사진 보관함 접근을 허용해 주세요.',
          // 사진만 찍으므로 동영상 녹화용 마이크 권한은 요청하지 않음
          microphonePermission: false,
        },
      ],
    ],
  },
};
