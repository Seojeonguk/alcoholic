const EAS_PROJECT_ID = '090110c1-78a6-496f-9564-f32647afce83';

export default {
  expo: {
    name: 'alcoholic',
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
      // 스토어에 올릴 때마다 1씩 올림
      versionCode: 1,
    },
    web: {
      favicon: './assets/favicon.png',
    },
    extra: {
      eas: {
        projectId: EAS_PROJECT_ID,
      },
      firebaseApiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
      firebaseAuthDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
      firebaseProjectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
      firebaseStorageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
      firebaseMessagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      firebaseAppId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
      firebaseMeasurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
    },
    plugins: [
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
          photosPermission: 'Allow $(PRODUCT_NAME) to access your photos.',
          // 사진만 찍으므로 동영상 녹화용 마이크 권한은 요청하지 않음
          microphonePermission: false,
        },
      ],
    ],
  },
};
