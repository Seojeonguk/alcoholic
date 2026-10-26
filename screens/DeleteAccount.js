import { useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Header, PasswordInput } from '../components';
import LoadingSpinner from '../components/LoadingSpinner';
import { COLORS, NAVIGATOR } from '../constants';
import { auth } from '../firebaseConfig';
import { getKorErrorMsg, showToast } from '../lib';
import { deleteUserData } from '../services';

import { deleteUser, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function DeleteAccount({ navigation }) {
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChangePassword = (newPassword) => {
    setPasswordError('');
    setPassword(newPassword);
  };

  const deleteAccount = async () => {
    const user = auth.currentUser;
    setIsLoading(true);
    try {
      // 오래 로그인해 있으면 deleteUser가 auth/requires-recent-login으로 실패하므로 먼저 다시 인증함
      await reauthenticateWithCredential(user, EmailAuthProvider.credential(user.email, password));
      await deleteUserData(user.email, user.uid);
      await deleteUser(user);

      showToast('success', '탈퇴했습니다.', '그동안 이용해 주셔서 감사합니다.');
      navigation.reset({
        index: 0,
        routes: [{ name: NAVIGATOR.MAIN_PAGE }],
      });
    } catch (e) {
      setIsLoading(false);
      if (e.code?.startsWith('auth/')) {
        setPasswordError(getKorErrorMsg(e.code));
        return;
      }
      showToast('error', '탈퇴하지 못했습니다.', '잠시 후 다시 시도해 주세요.');
    }
  };

  const handleDeleteAccount = () => {
    if (!password) {
      setPasswordError(getKorErrorMsg('missing/password'));
      return;
    }

    Alert.alert(
      '탈퇴하기',
      '모든 게시글과 사진이 삭제되며 되돌릴 수 없습니다. 탈퇴하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        { text: '탈퇴', style: 'destructive', onPress: deleteAccount },
      ],
      { cancelable: true }
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header
        visibleLeftIcon={true}
        visibleRightIcon={false}
        leftIconName={'arrow-back'}
        onPressLeft={() => navigation.goBack()}
        iconSize={24}
      />

      <View style={styles.contentWrap}>
        <View style={styles.titleWrap}>
          <Text style={styles.title}>탈퇴하기</Text>
        </View>

        <Text style={styles.description}>
          탈퇴하면 계정과 모든 게시글, 사진이 삭제되며 되돌릴 수 없습니다.
          {'\n'}본인 확인을 위해 비밀번호를 입력해 주세요.
        </Text>

        <View style={styles.inputWrap}>
          <View style={styles.inputBox}>
            <Text style={styles.inputLabel}>비밀번호</Text>
            <PasswordInput
              editable={!isLoading}
              onChangeText={handleChangePassword}
              onSubmitEditing={handleDeleteAccount}
              placeholder="비밀번호를 입력해 주세요"
              returnKeyType="done"
              value={password}
            />
            <Text style={styles.inputError}>{passwordError}</Text>
          </View>
        </View>

        <TouchableOpacity
          disabled={isLoading}
          onPress={handleDeleteAccount}
          style={styles.deleteAccountBtn}
        >
          <Text style={styles.deleteAccountBtnText}>탈퇴하기</Text>
        </TouchableOpacity>
      </View>

      {isLoading && <LoadingSpinner isOverlay={true} />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.BACKGROUND_COLOR,
    flex: 1,
  },
  contentWrap: {
    flex: 1,
    paddingHorizontal: 40,
  },
  deleteAccountBtn: {
    backgroundColor: COLORS.BOTTOM_TAB_GALLERY_COLOR,
    borderRadius: 5,
    height: 40,
    justifyContent: 'center',
    marginVertical: 15,
  },
  deleteAccountBtnText: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
  description: {
    color: COLORS.LABEL_COLOR,
    fontSize: 13,
    lineHeight: 20,
  },
  inputBox: {
    marginVertical: 15,
  },
  inputError: {
    color: '#ff0000',
    fontSize: 10,
  },
  inputLabel: {
    color: COLORS.LABEL_COLOR,
    fontSize: 9,
  },
  inputWrap: {},
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  titleWrap: {
    height: 35,
    marginVertical: 10,
  },
});
