import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { initializeAuth, getReactNativePersistence, getAuth } from 'firebase/auth';
import { getApp, getApps, initializeApp } from 'firebase/app';
import { CACHE_SIZE_UNLIMITED, getFirestore, initializeFirestore } from 'firebase/firestore';

// Optionally import the services that you want to use
//import {...} from 'firebase/auth';
//import {...} from "firebase/database";
//import {...} from "firebase/firestore";
//import {...} from "firebase/functions";
//import {...} from "firebase/storage";

// Initialize Firebase
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: Constants.expoConfig.extra.firebaseApiKey,
  authDomain: Constants.expoConfig.extra.firebaseAuthDomain,
  projectId: Constants.expoConfig.extra.firebaseProjectId,
  storageBucket: Constants.expoConfig.extra.firebaseStorageBucket,
  messagingSenderId: Constants.expoConfig.extra.firebaseMessagingSenderId,
  appId: Constants.expoConfig.extra.firebaseAppId,
  measurementId: Constants.expoConfig.extra.firebaseMeasurementId,
};

// .env를 읽지 못하면 Firebase 에러(auth/invalid-api-key) 대신 빠진 키를 알려줌
const REQUIRED_ENV_KEYS = {
  apiKey: 'EXPO_PUBLIC_FIREBASE_API_KEY',
  authDomain: 'EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN',
  projectId: 'EXPO_PUBLIC_FIREBASE_PROJECT_ID',
  storageBucket: 'EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET',
  messagingSenderId: 'EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  appId: 'EXPO_PUBLIC_FIREBASE_APP_ID',
};
const missingEnvKeys = Object.entries(REQUIRED_ENV_KEYS)
  .filter(([configKey]) => !firebaseConfig[configKey])
  .map(([, envKey]) => envKey);
if (missingEnvKeys.length > 0) {
  throw new Error(
    `Firebase 설정 값이 없어요: ${missingEnvKeys.join(', ')}\n` +
      '프로젝트 루트(package.json이 있는 폴더)의 .env를 확인하고 개발 서버를 다시 켜 주세요. ' +
      '자세한 방법은 docs/firebase-setup.md를 보세요.'
  );
}

let app;
let auth;
let db;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
  db = initializeFirestore(app, {
    cacheSizeBytes: CACHE_SIZE_UNLIMITED,
    experimentalForceLongPolling: true,
    // experimentalAutoDetectLongPolling: true,
  });
} else {
  app = getApp();
  auth = getAuth(app);
  db = getFirestore(app);
}

// 인증 · 비밀번호 재설정 메일을 한국어 템플릿으로 보냄
auth.languageCode = 'ko';

export { auth, db };
