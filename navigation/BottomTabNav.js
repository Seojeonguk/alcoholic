import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { COLORS, NAVIGATOR } from '../constants';
import { Gallery, Settings } from '../screens';
import { Entypo, FontAwesome } from '@expo/vector-icons';

const Tab = createBottomTabNavigator();

const TAB_BAR_COLORS = {
  [NAVIGATOR.GALLERY]: COLORS.BOTTOM_TAB_GALLERY_COLOR,
  [NAVIGATOR.SETTINGS]: COLORS.BOTTOM_TAB_SETTINGS_COLOR,
};

export default function BottomTabNav() {
  const galleryIcon = ({ color }) => {
    return <Entypo name="drink" size={24} color={color} />;
  };

  const settingsIcon = ({ color }) => {
    return <FontAwesome name="gear" size={24} color={color} />;
  };

  return (
    <Tab.Navigator
      initialRouteName={NAVIGATOR.GALLERY}
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: COLORS.BOTTOM_TAB_ACTIVE_COLOR,
        tabBarInactiveTintColor: COLORS.BOTTOM_TAB_INACTIVE_COLOR,
        tabBarStyle: { backgroundColor: TAB_BAR_COLORS[route.name] },
      })}
    >
      <Tab.Screen
        name={NAVIGATOR.GALLERY}
        component={Gallery}
        options={{
          tabBarLabel: NAVIGATOR.GALLERY,
          tabBarIcon: galleryIcon,
        }}
      />
      <Tab.Screen
        name={NAVIGATOR.SETTINGS}
        component={Settings}
        options={{
          tabBarLabel: NAVIGATOR.SETTINGS,
          tabBarIcon: settingsIcon,
        }}
      />
    </Tab.Navigator>
  );
}
