import { Alert, Linking, ScrollView, StyleSheet, Text, View } from 'react-native';

import { ListRow, PressableScale } from '../components';
import { COLORS, NAVIGATOR } from '../constants';
import { auth } from '../firebaseConfig';
import { showToast } from '../lib';
import { deleteVisibleLocalPosts, isMember } from '../services';

import { signOut } from '@react-native-firebase/auth';
import Constants from 'expo-constants';
import { SafeAreaView } from 'react-native-safe-area-context';

const PRIVACY_POLICY_URL =
  'https://github.com/Seojeonguk/alcoholic/blob/master/docs/privacy-policy.md';

export default function Settings({ navigation }) {
  // 비회원은 기록이 기기에만 있어서 계정 대신 백업 안내와 기기 기록 지우기를 보여 줌(#201)
  const member = isMember();

  // 로그아웃이 끝나기 전에 첫 화면으로 가면 첫 화면이 아직 로그인된 계정을 보고 갤러리로 돌려보냄
  const handleLogout = async () => {
    await signOut(auth);
    navigation.reset({ index: 0, routes: [{ name: NAVIGATOR.MAIN_PAGE }] });
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

        <Text style={styles.sectionTitle}>앱 정보</Text>
        <ListRow title="버전" value={Constants.expoConfig.version} />
        <ListRow onPress={() => Linking.openURL(PRIVACY_POLICY_URL)} title="개인정보처리방침" />

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

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.BACKGROUND,
    flex: 1,
  },
  content: {
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  deleteAccount: {
    color: COLORS.TEXT_SUB,
    fontSize: 13,
    textDecorationLine: 'underline',
  },
  footer: {
    alignItems: 'center',
    marginTop: 40,
  },
  guestNotice: {
    color: COLORS.TEXT_SUB,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 8,
  },
  sectionTitle: {
    color: COLORS.TEXT_SUB,
    fontSize: 13,
    fontWeight: '700',
    marginTop: 28,
  },
  title: {
    color: COLORS.TEXT,
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
    paddingTop: 12,
  },
});
