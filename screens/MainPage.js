import { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

import appIcon from '../assets/icon.png';
import { BottomButtonArea, Button, Header } from '../components';
import { COLORS, NAVIGATOR } from '../constants';
import { auth } from '../firebaseConfig';
import { backupMessage, getAppMode, showToast } from '../lib';
import { enterGuestMode, getLocalPosts, hasGuestFlag, leaveGuestMode } from '../services';

import { onAuthStateChanged } from '@react-native-firebase/auth';
import { SafeAreaView } from 'react-native-safe-area-context';

const goGallery = (navigation) =>
  navigation.reset({
    index: 0,
    routes: [{ name: NAVIGATOR.BOTTOM_TAB_NAV, params: { screen: NAVIGATOR.GALLERY } }],
  });

export default function MainPage({ navigation, route }) {
  const [isLoading, setIsLoading] = useState(true);
  // 비회원이 설정의 "가입하고 기록 백업하기"로 들어옴. 비회원 표시가 있어도 갤러리로 돌려보내지 않음
  const fromGuest = route.params?.fromGuest === true;
  // 백업 화면에서 기기의 기록이 그대로 있다는 걸 개수로 알려 줌. 불러오기 전에는 null
  const [guestPostCount, setGuestPostCount] = useState(null);

  const handleLoginBtn = () => {
    navigation.navigate(NAVIGATOR.LOGIN);
  };

  const handleRegistrationBtn = () => {
    navigation.navigate(NAVIGATOR.REGISTRATION_FORM);
  };

  // 비회원 표시를 저장하지 못하면 다음에 켤 때 첫 화면으로 돌아오므로 갤러리로 가지 않고 알려 줌(#329)
  const handleGuestBtn = async () => {
    try {
      await enterGuestMode();
    } catch {
      showToast('error', '가입 없이 시작하지 못했어요.', '잠시 후 다시 시도해 주세요.');
      return;
    }
    goGallery(navigation);
  };

  useEffect(() => {
    let active = true;
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      const mode = getAppMode({
        hasVerifiedUser: user?.emailVerified === true,
        // 읽지 못하면 비회원 표시가 없는 것으로 보고 첫 화면을 보여 줌
        guestFlag: await hasGuestFlag().catch(() => false),
      });
      // 기다리는 동안 화면을 떠났거나 로그인 상태가 바뀌었으면(로그아웃 직후 등) 이번 판단은 버림
      const isStale = () => !active || auth.currentUser?.uid !== user?.uid;
      if (isStale()) {
        return;
      }
      if (mode === 'member') {
        // 지우지 못해도 인증된 로그인이 있으면 회원으로 보므로 그대로 갤러리로 감
        await leaveGuestMode().catch(() => {});
        if (!isStale()) {
          goGallery(navigation);
        }
        return;
      }
      if (mode === 'guest' && !fromGuest) {
        goGallery(navigation);
        return;
      }
      setIsLoading(false);
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, [navigation, fromGuest]);

  useEffect(() => {
    if (!fromGuest) {
      return undefined;
    }
    let active = true;
    getLocalPosts()
      .then((posts) => active && setGuestPostCount(posts.length))
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [fromGuest]);

  // 로그인 상태 확인이 늦어져도 3초 뒤에는 버튼을 보여 줌(한 번만 돌면 되므로 setTimeout)
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      {/* 설정에서 백업하러 왔으면 처음 화면이 아니라 백업 화면으로 보여 줌(기록이 사라진 것처럼 보이지 않게) */}
      {fromGuest && <Header left="back" onPressLeft={() => navigation.goBack()} />}
      <View style={styles.intro}>
        <Image source={appIcon} style={styles.icon} />
        {fromGuest ? (
          <>
            <Text style={styles.title}>{'기록을 계정에\n백업해요'}</Text>
            {guestPostCount !== null && (
              <Text style={styles.subtitle}>{backupMessage(guestPostCount)}</Text>
            )}
          </>
        ) : (
          <>
            <Text style={styles.title}>{'오늘 마신 술,\n사진으로 남겨요'}</Text>
            <Text style={styles.subtitle}>나만 보는 술 기록장</Text>
          </>
        )}
      </View>

      {/* 로그인 상태를 확인하는 동안에는 버튼을 숨김(로그인돼 있으면 바로 갤러리로 감) */}
      {!isLoading && (
        <BottomButtonArea>
          <Button
            onPress={handleLoginBtn}
            title={fromGuest ? '이메일로 로그인' : '이메일로 시작하기'}
          />
          <Button onPress={handleRegistrationBtn} title="처음이에요 · 회원가입" variant="text" />
          {/* 비회원이 백업하려고 들어왔을 때는 숨김 */}
          {!fromGuest && (
            <Button onPress={handleGuestBtn} title="가입 없이 시작하기" variant="text" />
          )}
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
    lineHeight: 22,
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
