import { useEffect } from 'react';

import toastConfig from './lib/toastConfig';
import Navigation from './navigation/Navigation';
import store from './redux/store';
import { listenAnnouncements } from './services';

import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { Provider } from 'react-redux';

// 첫 화면을 정할 때까지 스플래시를 유지함. 닫는 건 navigation/Navigation.js(#295)
// 컴포넌트 안에서 부르면 이미 스플래시가 닫힌 뒤일 수 있어서 맨 바깥에서 부름
SplashScreen.preventAutoHideAsync().catch(() => {});

export default function App() {
  // 앱이 켜져 있을 때 받은 공지 알림과 알림을 눌러 앱을 연 경우를 처리함(#304)
  useEffect(() => listenAnnouncements(), []);

  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <Navigation />
        <Toast config={toastConfig} />
      </SafeAreaProvider>
    </Provider>
  );
}
