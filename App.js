import Sentry from './lib/sentry';
import toastConfig from './lib/toastConfig';
import Navigation from './navigation/Navigation';
import store from './redux/store';

import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { Provider } from 'react-redux';

function App() {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <Navigation />
        <Toast config={toastConfig} />
      </SafeAreaProvider>
    </Provider>
  );
}

// 렌더링 중에 난 에러도 Sentry로 보냄
export default Sentry.wrap(App);
