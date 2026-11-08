import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NAVIGATOR } from '../constants';
import { useColors } from '../lib';
import { Gallery, Settings } from '../screens';
import { Ionicons } from '@expo/vector-icons';

const Tab = createBottomTabNavigator();

const tabIcon = (name) =>
  function TabIcon({ focused, color }) {
    return <Ionicons name={focused ? name : `${name}-outline`} size={22} color={color} />;
  };

export default function BottomTabNav() {
  const colors = useColors();
  return (
    <Tab.Navigator
      initialRouteName={NAVIGATOR.GALLERY}
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.TEXT,
        tabBarInactiveTintColor: colors.TAB_INACTIVE,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarStyle: {
          backgroundColor: colors.BACKGROUND,
          borderTopColor: colors.LINE,
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
