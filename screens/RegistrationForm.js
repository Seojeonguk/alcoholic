import { useRef, useState } from 'react';
import { Text } from 'react-native';

import { AuthScreen, Button, PasswordInput, TextField } from '../components';
import { NAVIGATOR } from '../constants';
import { createUserInfo } from '../services';
import { auth } from '../firebaseConfig';
import {
  getAuthErrorField,
  getKorErrorMsg,
  openPrivacyPolicy,
  sendVerificationEmail,
  setEmailRequestLimit,
  showToast,
  makeStyles,
} from '../lib';

import { createUserWithEmailAndPassword } from '@react-native-firebase/auth';

export default function RegistrationForm({ navigation }) {
  const styles = useStyles();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  // 두 번 보내면 두 번째 요청이 "이미 사용 중인 이메일"로 실패하므로 ref로 한 번만 보냄
  const isSubmittingRef = useRef(false);
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
      '메일함에서 인증 메일을 확인해 주세요.',
      `${email}로 인증 메일을 보냈어요. 메일이 없으면 스팸함도 확인해 주세요.`
    );
  };

  const handleRegistration = async () => {
    if (isSubmittingRef.current) {
      return;
    }
    if (password !== confirmPassword) {
      setConfirmPasswordError('비밀번호가 일치하지 않아요.');
      confirmPasswordRef.current.focus();
      return;
    }

    isSubmittingRef.current = true;
    setIsLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (e) {
      const korErrorMsg = getKorErrorMsg(e.code);
      if (getAuthErrorField(e.code) === 'email') {
        setEmailError(korErrorMsg);
      } else {
        setPasswordError(korErrorMsg);
      }
      isSubmittingRef.current = false;
      setIsLoading(false);
      return;
    }

    // 여기부터는 계정이 이미 만들어졌으므로, 실패해도 이 화면에 남지 않고 로그인 화면으로 보냄(#328)
    // 남아서 다시 누르면 "이미 사용 중인 이메일"이 나와 가입이 됐는지 알 수 없음
    const user = auth.currentUser;
    let emailSent = false;
    try {
      await sendVerificationEmail(user);
      emailSent = true;
      await setEmailRequestLimit();
    } catch {
      // 보내지 못했으면 다시 보내기 제한을 걸지 않아서 로그인할 때 바로 다시 보낼 수 있음
    }
    try {
      // 문서 ID는 보안 규칙이 비교하는 로그인 토큰의 이메일(소문자)과 같아야 함
      // 이 문서를 읽는 곳은 없고 탈퇴할 때 없어도 지우기가 실패하지 않아서, 만들지 못해도 가입은 끝난 것으로 봄
      await createUserInfo(user.email);
    } catch {
      // 위와 같은 이유로 알리지 않음
    }

    if (emailSent) {
      showSuccessToastForEmailSending();
    } else {
      showToast(
        'info',
        '가입은 됐지만 인증 메일을 보내지 못했어요.',
        '로그인하면 인증 메일을 다시 보낼 수 있어요.'
      );
    }
    isSubmittingRef.current = false;
    setIsLoading(false);
    navigation.replace(NAVIGATOR.LOGIN);
  };

  return (
    <AuthScreen
      bottom={
        <>
          <Button
            loading={isLoading}
            loadingTitle="가입하는 중…"
            onPress={handleRegistration}
            title="가입하기"
          />
          <Text style={styles.notice}>
            가입하면{' '}
            <Text accessibilityRole="link" onPress={openPrivacyPolicy} style={styles.link}>
              개인정보처리방침
            </Text>
            에 동의하게 돼요.
          </Text>
        </>
      }
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

const useStyles = makeStyles((colors) => ({
  link: {
    color: colors.ACCENT,
    textDecorationLine: 'underline',
  },
  notice: {
    color: colors.TEXT_SUB,
    fontSize: 13,
    lineHeight: 20,
    paddingVertical: 4,
    textAlign: 'center',
  },
}));
