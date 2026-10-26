import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { COLORS, NAVIGATOR } from '../constants';
import { Gallery, Settings } from '../screens';
import { Ionicons } from '@expo/vector-icons';

const Tab = createBottomTabNavigator();

const tabIcon =
  (name) =>
  ({ focused, color }) =>
    <Ionicons name={focused ? name : `${name}-outline`} size={22} color={color} />;

export default function BottomTabNav() {
  return (
    <Tab.Navigator
      initialRouteName={NAVIGATOR.GALLERY}
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.TEXT,
        tabBarInactiveTintColor: '#B0B8C1',
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarStyle: {
          backgroundColor: COLORS.BACKGROUND,
          borderTopColor: COLORS.LINE,
          borderTopWidth: 1,
          elevation: 0,
        },
      }}
    >
      <Tab.Screen
        name={NAVIGATOR.GALLERY}
        component={Gallery}
        options={{ tabBarLabel: '기록', tabBarIcon: tabIcon('images') }}
      />
      <Tab.Screen
        name={NAVIGATOR.SETTINGS}
        component={Settings}
        options={{ tabBarLabel: '설정', tabBarIcon: tabIcon('settings') }}
      />
    </Tab.Navigator>
  );
}
