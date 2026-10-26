import { Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { COLORS, NAVIGATOR } from '../constants';
import { auth } from '../firebaseConfig';

import { FontAwesome } from '@expo/vector-icons';
import { signOut } from '@firebase/auth';
import Constants from 'expo-constants';
import { SafeAreaView } from 'react-native-safe-area-context';

const PRIVACY_POLICY_URL =
  'https://github.com/Seojeonguk/alcoholic/blob/master/docs/privacy-policy.md';

export default function Settings({ navigation }) {
  const handleLogout = () => {
    signOut(auth);
    navigation.replace(NAVIGATOR.LOGIN);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View>
        <View style={styles.userInfo}>
          <FontAwesome name="user-circle" size={100} color={COLORS.THIRD_SUB_COLOR} />
          <Text style={styles.userEmail}>{auth.currentUser?.email}</Text>
        </View>

        <View style={styles.menus}>
          <View style={styles.menuItem}>
            <Text style={styles.menuItemText}>버전 정보</Text>
            <Text style={styles.menuItemValue}>{Constants.expoConfig.version}</Text>
          </View>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => Linking.openURL(PRIVACY_POLICY_URL)}
          >
            <Text style={styles.menuItemText}>개인정보처리방침</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
            <Text style={styles.menuItemText}>로그아웃</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate(NAVIGATOR.DELETE_ACCOUNT)}
          >
            <Text style={styles.menuItemText}>탈퇴하기</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND_COLOR,
  },
  menuItem: {
    borderBottomWidth: 1,
    borderColor: COLORS.BORDER_COLOR,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 15,
    paddingVertical: 5,
  },
  menuItemText: {
    fontSize: 20,
  },
  menuItemValue: {
    color: COLORS.LABEL_COLOR,
    fontSize: 16,
  },
  menus: {
    borderTopWidth: 1,
    borderColor: COLORS.BORDER_COLOR,
  },
  userEmail: {
    marginTop: 10,
    fontSize: 16,
  },
  userInfo: {
    padding: 15,
    alignItems: 'center',
  },
});
