import { useRef, useState } from 'react';
import { Alert } from 'react-native';

import { AuthScreen, Button, PasswordInput } from '../components';
import { NAVIGATOR } from '../constants';
import { auth } from '../firebaseConfig';
import { getKorErrorMsg, showToast, usePreventLeave } from '../lib';
import { deleteUserData } from '../services';

import {
  deleteUser,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from '@react-native-firebase/auth';

export default function DeleteAccount({ navigation }) {
  // 인증 전 계정은 로그인 화면에서 들어옴(#322). 글 · 사진이 없어서 계정만 지운다고 안내함
  const [verified] = useState(() => auth.currentUser?.emailVerified === true);
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
      // 인증 전 계정은 posts를 건너뛰고 사진 폴더 · 사용자 문서만 지움
      await deleteUserData(user.email, user.uid, { verified });
      await deleteUser(user);

      if (verified) {
        showToast('success', '탈퇴했어요.', '그동안 이용해 주셔서 고마워요.');
      } else {
        showToast('success', '계정을 삭제했어요.', '이 이메일로 다시 가입할 수 있어요.');
      }
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
      showToast('error', '탈퇴하지 못했어요.', '잠시 후 다시 시도해 주세요.');
    }
  };

  const handleDeleteAccount = () => {
    if (!password) {
      setPasswordError(getKorErrorMsg('missing/password'));
      return;
    }

    Alert.alert(
      '탈퇴하기',
      verified
        ? '모든 게시글과 사진이 삭제되고 되돌릴 수 없어요. 탈퇴할까요?'
        : '이 계정이 삭제되고 되돌릴 수 없어요. 삭제할까요?',
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
        verified
          ? '탈퇴하면 계정과 모든 게시글, 사진이 삭제되고 되돌릴 수 없어요.\n본인 확인을 위해 비밀번호를 입력해 주세요.'
          : '이메일 인증을 하지 않은 계정이에요. 삭제하면 이 이메일로 다시 가입할 수 있어요.\n본인 확인을 위해 비밀번호를 입력해 주세요.'
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
