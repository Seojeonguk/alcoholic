import { useRef, useState } from 'react';
import { AuthScreen, Button, PasswordInput, TextField } from '../components';
import { NAVIGATOR } from '../constants';
import { createUserInfo } from '../services';
import { auth } from '../firebaseConfig';
import {
  getAuthErrorField,
  getKorErrorMsg,
  sendVerificationEmail,
  setEmailRequestLimit,
  showToast,
} from '../lib';

import { createUserWithEmailAndPassword } from 'firebase/auth';

export default function RegistrationForm({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const emailRef = useRef();
  const passwordRef = useRef();
  const confirmPasswordRef = useRef();

  const handleChangeEmail = (newEmail) => {
    setEmailError('');
    setEmail(newEmail);
  };

  const handleChangePassword = (newPassword) => {
    setPasswordError('');
    setPassword(newPassword);
  };

  const handleChangeConfirmPassword = (confirmPassword) => {
    setConfirmPasswordError('');
    setConfirmPassword(confirmPassword);
  };

  const showSuccessToastForEmailSending = () => {
    showToast(
      'success',
      '이메일의 메일함을 확인바랍니다',
      `${email}로 인증 메일을 발송하였습니다. 메일이 없으면 스팸함도 확인해 주세요.`
    );
  };

  const handleRegistration = async () => {
    if (password !== confirmPassword) {
      setConfirmPasswordError('비밀번호가 일치하지 않습니다.');
      confirmPasswordRef.current.focus();
      return;
    }

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      await sendVerificationEmail(auth.currentUser);
      await setEmailRequestLimit();
      // 문서 ID는 보안 규칙이 비교하는 로그인 토큰의 이메일(소문자)과 같아야 함
      await createUserInfo(auth.currentUser.email);
      showSuccessToastForEmailSending();
      navigation.replace(NAVIGATOR.LOGIN);
    } catch (e) {
      const korErrorMsg = getKorErrorMsg(e.code);
      if (getAuthErrorField(e.code) === 'email') {
        setEmailError(korErrorMsg);
      } else {
        setPasswordError(korErrorMsg);
      }
    }
  };

  return (
    <AuthScreen
      bottom={<Button onPress={handleRegistration} title="가입하기" />}
      onBack={() => navigation.goBack()}
      title="이메일로 회원가입"
    >
      <TextField
        error={emailError}
        inputMode="email"
        keyboardType="email-address"
        label="이메일"
        onChangeText={handleChangeEmail}
        onSubmitEditing={() => passwordRef.current.focus()}
        placeholder="이메일을 입력해 주세요"
        ref={emailRef}
        returnKeyType="next"
        submitBehavior="submit"
        value={email}
      />
      <PasswordInput
        error={passwordError}
        label="비밀번호"
        onChangeText={handleChangePassword}
        onSubmitEditing={() => confirmPasswordRef.current.focus()}
        placeholder="6자 이상 입력해 주세요"
        ref={passwordRef}
        returnKeyType="next"
        submitBehavior="submit"
        value={password}
      />
      <PasswordInput
        error={confirmPasswordError}
        label="비밀번호 확인"
        onChangeText={handleChangeConfirmPassword}
        onSubmitEditing={handleRegistration}
        placeholder="비밀번호를 한 번 더 입력해 주세요"
        ref={confirmPasswordRef}
        returnKeyType="done"
        value={confirmPassword}
      />
    </AuthScreen>
  );
}
