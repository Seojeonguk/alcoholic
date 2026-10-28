import { Linking, ScrollView, StyleSheet, Text, View } from 'react-native';

import { ListRow, PressableScale } from '../components';
import { COLORS, NAVIGATOR } from '../constants';
import { auth } from '../firebaseConfig';

import { signOut } from '@firebase/auth';
import Constants from 'expo-constants';
import { SafeAreaView } from 'react-native-safe-area-context';

const PRIVACY_POLICY_URL =
  'https://github.com/Seojeonguk/alcoholic/blob/master/docs/privacy-policy.md';

export default function Settings({ navigation }) {
  const handleLogout = () => {
    signOut(auth);
    navigation.replace(NAVIGATOR.LOGIN);
  };

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>설정</Text>

        <Text style={styles.sectionTitle}>계정</Text>
        <ListRow title="이메일" value={auth.currentUser?.email} />
        <ListRow onPress={handleLogout} title="로그아웃" />

        <Text style={styles.sectionTitle}>앱 정보</Text>
        <ListRow title="버전" value={Constants.expoConfig.version} />
        <ListRow onPress={() => Linking.openURL(PRIVACY_POLICY_URL)} title="개인정보처리방침" />

        <View style={styles.footer}>
          <PressableScale
            accessibilityRole="button"
            hitSlop={8}
            onPress={() => navigation.navigate(NAVIGATOR.DELETE_ACCOUNT)}
          >
            <Text style={styles.deleteAccount}>탈퇴하기</Text>
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
