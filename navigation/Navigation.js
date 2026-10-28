import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { NAVIGATOR } from '../constants';
import {
  DeleteAccount,
  Details,
  ForgetPassword,
  GalleryForm,
  Login,
  MainPage,
  RegistrationForm,
} from '../screens';
import BottomTabNav from './BottomTabNav';

const Stack = createNativeStackNavigator();

export default function Navigation() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={NAVIGATOR.MAIN_PAGE}
        screenOptions={{ headerShown: false, statusBarStyle: 'dark' }}
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
