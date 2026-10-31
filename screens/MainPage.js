import { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

import appIcon from '../assets/icon.png';
import { BottomButtonArea, Button } from '../components';
import { COLORS, NAVIGATOR } from '../constants';
import { auth } from '../firebaseConfig';

import { SafeAreaView } from 'react-native-safe-area-context';

export default function MainPage({ navigation, route }) {
  const [isLoading, setIsLoading] = useState(true);

  const handleLoginBtn = () => {
    navigation.navigate(NAVIGATOR.LOGIN);
  };

  const handleRegistrationBtn = () => {
    navigation.navigate(NAVIGATOR.REGISTRATION_FORM);
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setIsLoading(false);
      if (!user || !user.emailVerified) {
        return;
      }

      navigation.reset({
        index: 0,
        routes: [{ name: NAVIGATOR.BOTTOM_TAB_NAV }],
      });
    });

    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    const timer = setInterval(() => {
      setIsLoading(false);
    }, 3000);

    return () => clearInterval(timer);
  }, []);

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <View style={styles.intro}>
        <Image source={appIcon} style={styles.icon} />
        <Text style={styles.title}>{'오늘 마신 술,\n사진으로 남겨요'}</Text>
        <Text style={styles.subtitle}>나만 보는 술 기록장</Text>
      </View>

      {/* 로그인 상태를 확인하는 동안에는 버튼을 숨김(로그인돼 있으면 바로 갤러리로 감) */}
      {!isLoading && (
        <BottomButtonArea>
          <Button onPress={handleLoginBtn} title="이메일로 시작하기" />
          <Button onPress={handleRegistrationBtn} title="처음이에요 · 회원가입" variant="text" />
        </BottomButtonArea>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.BACKGROUND,
    flex: 1,
  },
  icon: {
    borderRadius: 22,
    height: 72,
    marginBottom: 24,
    width: 72,
  },
  intro: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingBottom: 80,
  },
  subtitle: {
    color: COLORS.TEXT_SUB,
    fontSize: 15,
    marginTop: 10,
  },
  title: {
    color: COLORS.TEXT,
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
    lineHeight: 36,
  },
});
