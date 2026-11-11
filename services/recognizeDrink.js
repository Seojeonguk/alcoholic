// 사진으로 술 알아보기(#381). functions/의 recognizeDrink(#380)를 부름
// @react-native-firebase/functions를 넣지 않고 callable 형식으로 fetch함(네이티브 변경 없이 EAS Update로 배포)
import { appCheck, auth } from '../firebaseConfig';
import { isRemotePhoto, toRecognitionImage } from '../lib';

import { getApp } from '@react-native-firebase/app';
import { getToken } from '@react-native-firebase/app-check';
import { getIdToken } from '@react-native-firebase/auth';
import { Directory, File, Paths } from 'expo-file-system';

const REGION = 'asia-northeast3';
// 함수 시간 제한(60초)보다 짧게 기다리고 그만둠
const TIMEOUT_MS = 30000;

const recognizeDir = new Directory(Paths.cache, 'recognize');

// 함수가 돌려준 오류. status는 callable 상태(RESOURCE_EXHAUSTED 등), 연결 실패면 'NETWORK'
class RecognitionError extends Error {
  constructor(status, message) {
    super(message ?? status);
    this.status = status;
  }
}

// 고친 글의 사진은 다운로드 URL이라 캐시 폴더에 받아서 줄임. 다 쓰면 지움
const readImage = async (uri) => {
  if (!isRemotePhoto(uri)) {
    return toRecognitionImage(uri);
  }
  if (!recognizeDir.exists) {
    recognizeDir.create({ intermediates: true });
  }
  const downloaded = await File.downloadFileAsync(uri, new File(recognizeDir, 'photo.jpg'), {
    idempotent: true,
  });
  try {
    return await toRecognitionImage(downloaded.uri);
  } finally {
    downloaded.delete();
  }
};

// 사진 한 장을 보내 { isDrink, name, drinkType, confidence, tags }를 받음. 회원만 부름
const recognizeDrink = async (uri) => {
  const user = auth.currentUser;
  if (!user) {
    throw new RecognitionError('UNAUTHENTICATED');
  }
  const [image, idToken, { token: appCheckToken }] = await Promise.all([
    readImage(uri),
    getIdToken(user),
    getToken(appCheck),
  ]);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  let response;
  try {
    response = await fetch(
      `https://${REGION}-${getApp().options.projectId}.cloudfunctions.net/recognizeDrink`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
          'X-Firebase-AppCheck': appCheckToken,
        },
        body: JSON.stringify({ data: { image, mediaType: 'image/jpeg' } }),
        signal: controller.signal,
      }
    );
  } catch {
    throw new RecognitionError('NETWORK');
  } finally {
    clearTimeout(timer);
  }

  // callable 응답: 성공이면 { result }, 실패면 { error: { status, message } }
  const body = await response.json().catch(() => null);
  if (!response.ok || !body?.result) {
    throw new RecognitionError(body?.error?.status ?? 'INTERNAL', body?.error?.message);
  }
  return body.result;
};

export { RecognitionError, recognizeDrink };
