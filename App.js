import toastConfig from './lib/toastConfig';
import Navigation from './navigation/Navigation';
import store from './redux/store';

import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { Provider } from 'react-redux';

export default function App() {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <Navigation />
        <Toast config={toastConfig} />
      </SafeAreaProvider>
    </Provider>
  );
}
