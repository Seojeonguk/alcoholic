import { useRef, useState } from 'react';
import { Alert, StyleSheet, Text } from 'react-native';

import { AuthScreen, Button, PasswordInput, PressableScale, TextField } from '../components';
import { COLORS, NAVIGATOR } from '../constants';
import { auth } from '../firebaseConfig';
import {
  emailRequestLimitKey,
  getKorErrorMsg,
  sendVerificationEmail,
  setEmailRequestLimit,
  showToast,
} from '../lib';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { signInWithEmailAndPassword } from 'firebase/auth';

export default function Login({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const emailRef = useRef();
  const passwordRef = useRef();

  const handleChangeEmail = (newEmail) => {
    setEmailError('');
    setEmail(newEmail);
  };

  const handleChangePassword = (newPassword) => {
    setPasswordError('');
    setPassword(newPassword);
  };

  const checkEmailRequestLimit = async (user) => {
    const emailRequestLimitObj = await AsyncStorage.getItem(emailRequestLimitKey);
    const emailRequestLimit = new Date(emailRequestLimitObj);
    const now = new Date();

    if (now > emailRequestLimit) {
      Alert.alert(
        '재인증',
        '인증 메일을 재전송 하시겠습니까?',
        [
          { text: '취소', style: 'cancel' },
          {
            text: '보내기',
            onPress: async () => {
              await sendVerificationEmail(user);
              await setEmailRequestLimit();
            },
          },
        ],
        { cancelable: true }
      );
    } else {
      showToast(
        'info',
        '이메일의 메일함을 확인바랍니다.',
        `${emailRequestLimit.getHours()}시 ${emailRequestLimit.getMinutes()}분 ${emailRequestLimit.getSeconds()}초 까지 메일을 다시 보낼 수 없습니다.`
      );
    }
  };

  const handleLogin = () => {
    signInWithEmailAndPassword(auth, email, password)
      .then(async (userCredential) => {
        const user = userCredential.user;
        const emailVerified = user.emailVerified;
        if (emailVerified) {
          navigation.replace(NAVIGATOR.BOTTOM_TAB_NAV, { screen: NAVIGATOR.GALLERY });
          return;
        }
        await checkEmailRequestLimit(user);
      })
      .catch((err) => {
        const korErrorMsg = getKorErrorMsg(err.code);
        if (korErrorMsg.includes('이메일')) {
          setEmailError(korErrorMsg);
        } else {
          setPasswordError(korErrorMsg);
        }
      });
  };

  const handleForgotPasswordBtn = () => {
    navigation.navigate(NAVIGATOR.FORGOT_PASSWORD);
  };

  return (
    <AuthScreen
      bottom={<Button onPress={handleLogin} title="로그인" />}
      onBack={() => navigation.replace(NAVIGATOR.MAIN_PAGE)}
      title="이메일로 로그인"
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
        onSubmitEditing={handleLogin}
        placeholder="비밀번호를 입력해 주세요"
        ref={passwordRef}
        returnKeyType="done"
        value={password}
      />
      <PressableScale onPress={handleForgotPasswordBtn} style={styles.forgotPassword}>
        <Text style={styles.forgotPasswordText}>비밀번호를 잊으셨나요?</Text>
      </PressableScale>
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  forgotPassword: {
    alignSelf: 'flex-start',
    paddingVertical: 14,
  },
  forgotPasswordText: {
    color: COLORS.TEXT_SUB,
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});
