// 공지 알림(FCM, #304)
// 서버 없이 Firebase 콘솔에서 announcements 토픽으로 보내서 기기 토큰을 따로 저장하지 않음. 회원 · 비회원 모두 받음
// 처음에는 꺼져 있고(firebase.json의 messaging_auto_init_enabled: false로 토큰도 만들지 않음),
// 사용자가 켜면 알림 권한을 요청하고 토픽을 구독함. 자세한 동작은 docs/notifications.md
import { Alert, Linking, PermissionsAndroid, Platform } from 'react-native';

import {
  ANNOUNCEMENT_TOPIC,
  ANNOUNCEMENTS_ASKED_KEY,
  ANNOUNCEMENTS_KEY,
  isAnnouncementsEnabled,
  shouldAskAnnouncements,
  showToast,
  toStoredValue,
} from '../lib';

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  AuthorizationStatus,
  deleteToken,
  getInitialNotification,
  getMessaging,
  getToken,
  hasPermission,
  onMessage,
  onNotificationOpenedApp,
  setAutoInitEnabled,
  setBackgroundMessageHandler,
  subscribeToTopic,
  unsubscribeFromTopic,
} from '@react-native-firebase/messaging';

const messaging = getMessaging();

// 앱이 뒤에 있거나 종료됐을 때 알림 메시지는 시스템이 알림으로 띄움. 따로 할 일은 없지만
// 처리기를 등록하지 않으면 데이터가 든 메시지를 받을 때 경고가 남아서 빈 처리기를 둠
setBackgroundMessageHandler(messaging, async () => {});

const getAnnouncementsEnabled = async () =>
  isAnnouncementsEnabled(await AsyncStorage.getItem(ANNOUNCEMENTS_KEY));

// Android 13 이상은 POST_NOTIFICATIONS를 요청하고, 그 아래는 시스템 설정에서 알림을 껐는지만 확인함
// (Android 12 이하에서 POST_NOTIFICATIONS를 요청하면 거절로 돌아옴)
const requestNotificationPermission = async () => {
  if (Platform.OS === 'android' && Platform.Version >= 33) {
    const result = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
    );
    return result === PermissionsAndroid.RESULTS.GRANTED;
  }
  return (await hasPermission(messaging)) !== AuthorizationStatus.DENIED;
};

// 알림 권한을 받고 토픽을 구독함. 권한을 거절하면 구독하지 않고 false
const enableAnnouncements = async () => {
  if (!(await requestNotificationPermission())) {
    return false;
  }
  await setAutoInitEnabled(messaging, true);
  await subscribeToTopic(messaging, ANNOUNCEMENT_TOPIC);
  await AsyncStorage.setItem(ANNOUNCEMENTS_KEY, toStoredValue(true));
  if (__DEV__) {
    // 콘솔의 "테스트 메시지 전송"에 넣을 토큰. 개발용 빌드에서만 찍음(docs/notifications.md)
    console.log('[FCM] token:', await getToken(messaging));
  }
  return true;
};

// 구독을 해제하고 기기의 등록 토큰도 지움. 다시 켜면 새 토큰으로 구독함
const disableAnnouncements = async () => {
  await unsubscribeFromTopic(messaging, ANNOUNCEMENT_TOPIC);
  await deleteToken(messaging);
  await setAutoInitEnabled(messaging, false);
  await AsyncStorage.setItem(ANNOUNCEMENTS_KEY, toStoredValue(false));
};

const showPermissionGuide = () => {
  Alert.alert(
    '알림 권한이 꺼져 있어요',
    '공지 알림을 받으려면 휴대전화 설정에서 alcoholic의 알림을 허용해 주세요.',
    [
      { text: '닫기', style: 'cancel' },
      { text: '설정 열기', onPress: () => Linking.openSettings() },
    ],
    { cancelable: true }
  );
};

// 화면에서 켜기 · 끄기를 누를 때 씀. 결과를 알리고 바뀐 뒤의 상태(켜졌는지)를 돌려줌
const setAnnouncements = async (enabled) => {
  try {
    if (!enabled) {
      await disableAnnouncements();
      showToast('success', '공지 알림을 껐어요.');
      return false;
    }
    if (!(await enableAnnouncements())) {
      showPermissionGuide();
      return false;
    }
    showToast('success', '공지 알림을 켰어요.', '새 버전이나 점검 소식을 알려 드릴게요.');
    return true;
  } catch {
    showToast(
      'error',
      enabled ? '공지 알림을 켜지 못했어요.' : '공지 알림을 끄지 못했어요.',
      '인터넷 연결을 확인하고 다시 시도해 주세요.'
    );
    return !enabled;
  }
};

// 첫 기록을 저장한 뒤 한 번만 물어봄. 설정에서 이미 켜거나 끈 사람에게는 묻지 않음
const askAnnouncementsOnce = async () => {
  const [asked, stored] = await Promise.all([
    AsyncStorage.getItem(ANNOUNCEMENTS_ASKED_KEY),
    AsyncStorage.getItem(ANNOUNCEMENTS_KEY),
  ]);
  if (!shouldAskAnnouncements({ asked, stored })) {
    return;
  }
  await AsyncStorage.setItem(ANNOUNCEMENTS_ASKED_KEY, '1');
  Alert.alert(
    '공지 알림을 받을까요?',
    '새 버전이나 점검 같은 소식을 알려 드려요. 광고는 보내지 않고, 설정에서 언제든 끌 수 있어요.',
    [
      { text: '나중에', style: 'cancel' },
      { text: '받기', onPress: () => setAnnouncements(true) },
    ],
    { cancelable: true }
  );
};

const showMessage = (message) => {
  const { title, body } = message?.notification ?? {};
  if (title || body) {
    showToast('info', title ?? body, title ? body : null);
  }
};

// 앱이 켜져 있는 동안 알림을 처리함. App에서 한 번 부르고 돌려준 함수로 해제함
// - 앞에 떠 있을 때 받은 알림: FCM이 시스템 알림을 띄우지 않으므로 앱 안 알림으로 보여 줌
// - 알림을 눌러 앱을 열었을 때(뒤에 있었거나 종료돼 있었음): 공지 내용을 앱 안 알림으로 한 번 더 보여 줌
const listenAnnouncements = () => {
  // 켜 둔 기기는 켤 때마다 구독을 다시 맞춤(구독 중에 네트워크가 끊겼던 경우 등). 실패해도 다음에 다시 함
  getAnnouncementsEnabled()
    .then((enabled) => enabled && subscribeToTopic(messaging, ANNOUNCEMENT_TOPIC))
    .catch(() => {});

  getInitialNotification(messaging)
    .then(showMessage)
    .catch(() => {});
  const unsubscribeMessage = onMessage(messaging, showMessage);
  const unsubscribeOpened = onNotificationOpenedApp(messaging, showMessage);
  return () => {
    unsubscribeMessage();
    unsubscribeOpened();
  };
};

export { askAnnouncementsOnce, getAnnouncementsEnabled, listenAnnouncements, setAnnouncements };
