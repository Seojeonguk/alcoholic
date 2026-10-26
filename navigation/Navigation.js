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
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name={NAVIGATOR.MAIN_PAGE} component={MainPage} />
        <Stack.Screen name={NAVIGATOR.LOGIN} component={Login} />
        <Stack.Screen name={NAVIGATOR.REGISTRATION_FORM} component={RegistrationForm} />
        <Stack.Screen name={NAVIGATOR.FORGOT_PASSWORD} component={ForgetPassword} />
        <Stack.Screen name={NAVIGATOR.DELETE_ACCOUNT} component={DeleteAccount} />
        <Stack.Screen name={NAVIGATOR.GALLERY_FORM} component={GalleryForm} />
        <Stack.Screen name={NAVIGATOR.DETAILS} component={Details} />
        <Stack.Screen name={NAVIGATOR.BOTTOM_TAB_NAV} component={BottomTabNav} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
