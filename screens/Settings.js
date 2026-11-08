import { useCallback, useState } from 'react';
import { Alert, Linking, Platform, ScrollView, Switch, Text, View } from 'react-native';

import { ListRow, PressableScale } from '../components';
import { NAVIGATOR } from '../constants';
import { auth } from '../firebaseConfig';
import { openPrivacyPolicy, showToast, makeStyles, useColors } from '../lib';
import {
  deleteVisibleLocalPosts,
  getAnnouncementsEnabled,
  isMember,
  setAnnouncements,
} from '../services';

import { signOut } from '@react-native-firebase/auth';
import { useFocusEffect } from '@react-navigation/native';
import Constants from 'expo-constants';
import { SafeAreaView } from 'react-native-safe-area-context';

// 개인정보처리방침에 적힌 연락처와 같은 주소
const CONTACT_EMAIL = 'junguk7880@naver.com';

// 문의 메일에는 앱 버전과 기기 OS만 넣고 계정 정보는 넣지 않음(#298)
const openContactMail = async () => {
  const version = Constants.expoConfig.version;
  const os =
    Platform.OS === 'android' ? `Android (API ${Platform.Version})` : `iOS ${Platform.Version}`;
  const subject = `[Alcoholic] 문의 (v${version})`;
  const body = `\n\n---\n앱 버전: ${version}\n기기 OS: ${os}`;
  const url = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  try {
    await Linking.openURL(url);
  } catch {
    Alert.alert('메일 앱을 열 수 없어요', `${CONTACT_EMAIL}로 메일을 보내 주세요.`);
  }
};

export default function Settings({ navigation }) {
  const colors = useColors();
  const styles = useStyles();
  // 비회원은 기록이 기기에만 있어서 계정 대신 백업 안내와 기기 기록 지우기를 보여 줌(#201)
  const member = isMember();
  // 공지 알림(#304). 기록을 저장한 뒤 켤 수도 있어서 화면에 올 때마다 기기에 저장된 상태를 다시 읽음
  const [announcements, setAnnouncementsState] = useState(false);
  const [isChangingAnnouncements, setIsChangingAnnouncements] = useState(false);

  useFocusEffect(
    useCallback(() => {
      getAnnouncementsEnabled()
        .then(setAnnouncementsState)
        .catch(() => {});
    }, [])
  );

  // 누르자마자 스위치를 옮기고, 권한 거절 · 실패면 결과 상태로 되돌림
  const handleAnnouncements = async (enabled) => {
    setAnnouncementsState(enabled);
    setIsChangingAnnouncements(true);
    setAnnouncementsState(await setAnnouncements(enabled));
    setIsChangingAnnouncements(false);
  };

  // 로그아웃이 끝나기 전에 첫 화면으로 가면 첫 화면이 아직 로그인된 계정을 보고 갤러리로 돌려보냄
  const logout = async () => {
    try {
      await signOut(auth);
    } catch {
      showToast('error', '로그아웃하지 못했어요.', '잠시 후 다시 시도해 주세요.');
      return;
    }
    navigation.reset({ index: 0, routes: [{ name: NAVIGATOR.MAIN_PAGE }] });
  };

  // 한 번 잘못 눌러 바로 첫 화면으로 가지 않게 먼저 물어봄(#329)
  const handleLogout = () => {
    Alert.alert(
      '로그아웃',
      '로그아웃할까요? 기록은 계정에 그대로 남아 있어요.',
      [
        { text: '취소', style: 'cancel' },
        { text: '로그아웃', style: 'destructive', onPress: logout },
      ],
      { cancelable: true }
    );
  };

  const removeLocalPosts = async () => {
    try {
      await deleteVisibleLocalPosts();
      showToast('success', '기기의 기록을 모두 지웠어요.');
    } catch {
      showToast('error', '기록을 지우지 못했어요.', '잠시 후 다시 시도해 주세요.');
    }
  };

  const handleRemoveLocalPosts = () => {
    Alert.alert(
      '기록 모두 지우기',
      '기기에 저장된 기록과 사진이 모두 삭제되며 되돌릴 수 없어요.',
      [
        { text: '취소', style: 'cancel' },
        { text: '삭제', style: 'destructive', onPress: removeLocalPosts },
      ],
      { cancelable: true }
    );
  };

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>설정</Text>

        <Text style={styles.sectionTitle}>계정</Text>
        {member ? (
          <>
            <ListRow title="이메일" value={auth.currentUser?.email} />
            <ListRow onPress={handleLogout} title="로그아웃" />
          </>
        ) : (
          <>
            <ListRow
              onPress={() => navigation.navigate(NAVIGATOR.MAIN_PAGE, { fromGuest: true })}
              title="가입하고 기록 백업하기"
            />
            <Text style={styles.guestNotice}>
              기록은 이 기기에만 있어요. 앱을 지우면 기록도 사라져요.
            </Text>
          </>
        )}

        <Text style={styles.sectionTitle}>알림</Text>
        <ListRow title="공지 알림">
          <Switch
            accessibilityLabel="공지 알림"
            disabled={isChangingAnnouncements}
            onValueChange={handleAnnouncements}
            trackColor={{ true: colors.ACCENT }}
            value={announcements}
          />
        </ListRow>
        <Text style={styles.guestNotice}>
          새 버전 · 점검 같은 소식만 보내고 광고는 보내지 않아요.
        </Text>

        <Text style={styles.sectionTitle}>앱 정보</Text>
        <ListRow title="버전" value={Constants.expoConfig.version} />
        <ListRow onPress={openPrivacyPolicy} title="개인정보처리방침" />
        <ListRow onPress={openContactMail} title="문의하기" />

        <View style={styles.footer}>
          <PressableScale
            accessibilityRole="button"
            hitSlop={8}
            onPress={
              member ? () => navigation.navigate(NAVIGATOR.DELETE_ACCOUNT) : handleRemoveLocalPosts
            }
          >
            <Text style={styles.deleteAccount}>
              {member ? '탈퇴하기' : '기기의 기록 모두 지우기'}
            </Text>
          </PressableScale>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const useStyles = makeStyles((colors) => ({
  container: {
    backgroundColor: colors.BACKGROUND,
    flex: 1,
  },
  content: {
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  deleteAccount: {
    color: colors.TEXT_SUB,
    fontSize: 13,
    textDecorationLine: 'underline',
  },
  footer: {
    alignItems: 'center',
    marginTop: 40,
  },
  guestNotice: {
    color: colors.TEXT_SUB,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 8,
  },
  sectionTitle: {
    color: colors.TEXT_SUB,
    fontSize: 13,
    fontWeight: '700',
    marginTop: 28,
  },
  title: {
    color: colors.TEXT,
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
    paddingTop: 12,
  },
}));
