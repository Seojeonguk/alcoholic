import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { COLORS, NAVIGATOR } from '../constants';
import { auth } from '../firebaseConfig';

import { signOut } from '@firebase/auth';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Settings({ navigation }) {
  const handleLogout = () => {
    signOut(auth);
    navigation.replace(NAVIGATOR.LOGIN);
  };
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.settingsBody}>
        <View style={styles.userInfo}>
          <Image
            source={{
              uri: 'https://search.pstatic.net/common/?src=http%3A%2F%2Fblogfiles.naver.net%2FMjAyMjA5MDZfMjUx%2FMDAxNjYyNDM3ODk4NTQ3.FDaxfffFN1iNSBH_t8yTmgw3l30r-1OZIBSyhESQLtYg.wvXYUDZtmsdL1of59htugexzGLe9tBd5VLuqjZqQ9mog.JPEG.janet_hwang%2FIMG_1365.jpg&type=a340',
            }}
            style={styles.userImg}
          />
          <Text style={styles.userNickname}>닉네임</Text>
          <TouchableOpacity style={styles.userUpdateBtn}>
            <Text style={styles.userUpdateBtnText}>수정</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.menus}>
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuItemText}>공지사항</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuItemText}>버전 정보</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
            <Text style={styles.menuItemText}>로그아웃</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
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
    marginHorizontal: 15,
    paddingVertical: 5,
  },
  menuItemText: {
    fontSize: 20,
  },
  menus: {
    borderTopWidth: 1,
    borderColor: COLORS.BORDER_COLOR,
  },
  userImg: {
    height: 100,
    width: 100,
    borderRadius: 100,
    marginBottom: 10,
  },
  userInfo: {
    padding: 5,
    alignItems: 'center',
  },
  userUpdateBtn: {
    paddingHorizontal: 20,
  },
  userUpdateBtnText: {
    color: '#50A4C5',
  },
});
