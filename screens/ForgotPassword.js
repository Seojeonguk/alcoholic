import { useRef, useState } from 'react';
import { AuthScreen, Button, TextField } from '../components';
import { auth } from '../firebaseConfig';
import { getKorErrorMsg, showToast } from '../lib';

import { sendPasswordResetEmail } from 'firebase/auth';

export default function ForgetPassword({ navigation }) {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const emailRef = useRef();

  const handleChangeEmail = (newEmail) => {
    setEmailError('');
    setEmail(newEmail);
  };

  const handleSendEmail = () => {
    sendPasswordResetEmail(auth, email)
      .then(() => {
        showToast(
          'success',
          '비밀번호 재설정 메일을 보냈습니다.',
          `${email}의 메일함(스팸함 포함)을 확인해 주세요.`
        );
        navigation.goBack();
      })
      .catch((err) => {
        const korErrorMsg = getKorErrorMsg(err.code);
        setEmailError(korErrorMsg);
      });
  };

  return (
    <AuthScreen
      bottom={<Button onPress={handleSendEmail} title="재설정 메일 보내기" />}
      description="가입한 이메일로 비밀번호를 다시 정할 수 있는 링크를 보내 드려요."
      onBack={() => navigation.goBack()}
      title="비밀번호를 잊으셨나요?"
    >
      <TextField
        error={emailError}
        inputMode="email"
        keyboardType="email-address"
        label="이메일"
        onChangeText={handleChangeEmail}
        onSubmitEditing={handleSendEmail}
        placeholder="이메일을 입력해 주세요"
        ref={emailRef}
        returnKeyType="send"
        value={email}
      />
    </AuthScreen>
  );
}
