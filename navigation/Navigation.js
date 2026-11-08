import { useEffect, useMemo, useState } from 'react';

import { NAVIGATOR } from '../constants';
import { decideStartMode, startsAtGallery, useColors, useIsDark } from '../lib';
import {
  DeleteAccount,
  Details,
  ForgetPassword,
  GalleryForm,
  Login,
  MainPage,
  RegistrationForm,
} from '../screens';
import { hasGuestFlag, leaveGuestMode, waitForAuthUser } from '../services';
import BottomTabNav from './BottomTabNav';

import { DarkTheme, DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as SplashScreen from 'expo-splash-screen';
import * as SystemUI from 'expo-system-ui';

const Stack = createNativeStackNavigator();

const hideSplash = () => SplashScreen.hideAsync().catch(() => {});

export default function Navigation() {
  // 처음 보여 줄 화면. 정하기 전(null)에는 아무것도 그리지 않고 스플래시를 그대로 둠(App.js의 preventAutoHideAsync)
  const [initialRoute, setInitialRoute] = useState(null);
  const isDark = useIsDark();
  const colors = useColors();

  // 화면 사이 · 화면 뒤 빈 곳과 Android 루트 뷰도 기기 테마의 바탕색으로 칠함(#345)
  const theme = useMemo(() => {
    const base = isDark ? DarkTheme : DefaultTheme;
    return {
      ...base,
      colors: {
        ...base.colors,
        primary: colors.ACCENT,
        background: colors.BACKGROUND,
        card: colors.BACKGROUND,
        text: colors.TEXT,
        border: colors.LINE,
        notification: colors.DANGER,
      },
    };
  }, [isDark, colors]);

  useEffect(() => {
    SystemUI.setBackgroundColorAsync(colors.BACKGROUND).catch(() => {});
  }, [colors]);

  useEffect(() => {
    let active = true;
    // 로그인 상태 · 비회원 표시를 확인해서 첫 화면을 거치지 않고 바로 맞는 화면을 보여 줌(#295)
    // 정한 시간 안에 확인하지 못하면(null) 첫 화면부터 보여 주고, 첫 화면이 확인이 끝나는 대로 갤러리로 보냄
    decideStartMode({ getUser: waitForAuthUser, getGuestFlag: hasGuestFlag }).then((mode) => {
      if (mode === 'member') {
        // 첫 화면을 거칠 때처럼 회원이면 비회원 표시를 지움(로그아웃하면 첫 화면이 보이게)
        leaveGuestMode().catch(() => {});
      }
      if (active) {
        setInitialRoute(startsAtGallery(mode) ? NAVIGATOR.BOTTOM_TAB_NAV : NAVIGATOR.MAIN_PAGE);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  if (initialRoute === null) {
    return null;
  }

  return (
    // 첫 화면을 그릴 준비가 되면 스플래시를 닫음
    <NavigationContainer onReady={hideSplash} theme={theme}>
      <Stack.Navigator
        initialRouteName={initialRoute}
        // 상태 표시줄 글씨는 바탕과 반대로 함
        screenOptions={{ headerShown: false, statusBarStyle: isDark ? 'light' : 'dark' }}
      >
        <Stack.Screen name={NAVIGATOR.MAIN_PAGE} component={MainPage} />
        <Stack.Screen name={NAVIGATOR.LOGIN} component={Login} />
        <Stack.Screen name={NAVIGATOR.REGISTRATION_FORM} component={RegistrationForm} />
        <Stack.Screen name={NAVIGATOR.FORGOT_PASSWORD} component={ForgetPassword} />
        <Stack.Screen name={NAVIGATOR.DELETE_ACCOUNT} component={DeleteAccount} />
        <Stack.Screen name={NAVIGATOR.GALLERY_FORM} component={GalleryForm} />
        {/* 상세는 사진이 화면 맨 위를 채워서 상태 표시줄 글씨를 흰색으로 함 */}
        <Stack.Screen
          name={NAVIGATOR.DETAILS}
          component={Details}
          options={{ statusBarStyle: 'light' }}
        />
        <Stack.Screen name={NAVIGATOR.BOTTOM_TAB_NAV} component={BottomTabNav} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
