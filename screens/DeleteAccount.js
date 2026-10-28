import { useRef, useState } from 'react';
import { Alert } from 'react-native';

import { AuthScreen, Button, PasswordInput } from '../components';
import { NAVIGATOR } from '../constants';
import { auth } from '../firebaseConfig';
import { getKorErrorMsg, showToast, usePreventLeave } from '../lib';
import { deleteUserData } from '../services';

import { deleteUser, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';

export default function DeleteAccount({ navigation }) {
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  // 탈퇴가 끝나기 전에 설정 화면으로 돌아가지 못하게 함
  const isDeletingRef = useRef(false);
  usePreventLeave(navigation, isDeletingRef);

  const handleChangePassword = (newPassword) => {
    setPasswordError('');
    setPassword(newPassword);
  };

  const deleteAccount = async () => {
    const user = auth.currentUser;
    setIsLoading(true);
    isDeletingRef.current = true;
    try {
      // 오래 로그인해 있으면 deleteUser가 auth/requires-recent-login으로 실패하므로 먼저 다시 인증함
      await reauthenticateWithCredential(user, EmailAuthProvider.credential(user.email, password));
      await deleteUserData(user.email, user.uid);
      await deleteUser(user);

      showToast('success', '탈퇴했습니다.', '그동안 이용해 주셔서 감사합니다.');
      isDeletingRef.current = false;
      navigation.reset({
        index: 0,
        routes: [{ name: NAVIGATOR.MAIN_PAGE }],
      });
    } catch (e) {
      isDeletingRef.current = false;
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
    <AuthScreen
      bottom={
        <Button
          loading={isLoading}
          loadingTitle="탈퇴하는 중…"
          onPress={handleDeleteAccount}
          title="탈퇴하기"
          variant="danger"
        />
      }
      description={
        '탈퇴하면 계정과 모든 게시글, 사진이 삭제되며 되돌릴 수 없습니다.\n본인 확인을 위해 비밀번호를 입력해 주세요.'
      }
      onBack={() => navigation.goBack()}
      title="탈퇴하기"
    >
      <PasswordInput
        editable={!isLoading}
        error={passwordError}
        label="비밀번호"
        onChangeText={handleChangePassword}
        onSubmitEditing={handleDeleteAccount}
        placeholder="비밀번호를 입력해 주세요"
        returnKeyType="done"
        value={password}
      />
    </AuthScreen>
  );
}
