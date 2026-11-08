import { useRef, useState } from 'react';
import { Alert, Text } from 'react-native';

import { AuthScreen, Button, PasswordInput, PressableScale, TextField } from '../components';
import { NAVIGATOR } from '../constants';
import { auth } from '../firebaseConfig';
import {
  canResendEmail,
  emailRequestLimitKey,
  formatRetryTime,
  getAuthErrorField,
  getKorErrorMsg,
  sendVerificationEmail,
  setEmailRequestLimit,
  showToast,
  makeStyles,
} from '../lib';
import { leaveGuestMode } from '../services';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { signInWithEmailAndPassword } from '@react-native-firebase/auth';

export default function Login({ navigation }) {
  const styles = useStyles();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  // 인증하지 않은 계정으로 로그인했는지. 그 계정을 앱에서 지울 수 있게 삭제 링크를 보여 줌(#322)
  const [isUnverified, setIsUnverified] = useState(false);
  // state는 다음 렌더링에 바뀌므로 키보드 완료 키를 빠르게 두 번 눌러도 한 번만 보내도록 ref로 막음
  const isSubmittingRef = useRef(false);
  const emailRef = useRef();
  const passwordRef = useRef();

  const handleChangeEmail = (newEmail) => {
    setEmailError('');
    setIsUnverified(false);
    setEmail(newEmail);
  };

  const handleChangePassword = (newPassword) => {
    setPasswordError('');
    setPassword(newPassword);
  };

  const resendVerificationEmail = async (user) => {
    try {
      await sendVerificationEmail(user);
      await setEmailRequestLimit();
      showToast(
        'success',
        '인증 메일을 보냈어요.',
        `${user.email}의 메일함(스팸함 포함)을 확인해 주세요.`
      );
    } catch (e) {
      showToast('error', '인증 메일을 보내지 못했어요.', getKorErrorMsg(e.code));
    }
  };

  const checkEmailRequestLimit = async (user) => {
    const emailRequestLimitObj = await AsyncStorage.getItem(emailRequestLimitKey);
    const emailRequestLimit = emailRequestLimitObj ? new Date(emailRequestLimitObj) : null;

    if (canResendEmail(emailRequestLimit)) {
      Alert.alert(
        '이메일 인증',
        '아직 이메일 인증을 하지 않았어요. 인증 메일을 다시 보낼까요?',
        [
          { text: '취소', style: 'cancel' },
          { text: '보내기', onPress: () => resendVerificationEmail(user) },
        ],
        { cancelable: true }
      );
    } else {
      showToast(
        'info',
        '메일함에서 인증 메일을 확인해 주세요.',
        `인증 메일은 ${formatRetryTime(emailRequestLimit)}부터 다시 보낼 수 있어요.`
      );
    }
  };

  const handleLogin = async () => {
    if (isSubmittingRef.current) {
      return;
    }
    isSubmittingRef.current = true;
    setIsLoading(true);
    try {
      const { user } = await signInWithEmailAndPassword(auth, email, password);
      if (user.emailVerified) {
        // 비회원이 설정 → 첫 화면 → 로그인으로 왔으면 아래에 남은 비회원 탭까지 치움
        // 기기의 비회원 기록은 갤러리에서 이 계정으로 옮김(useGuestMigration)
        await leaveGuestMode();
        navigation.reset({
          index: 0,
          routes: [{ name: NAVIGATOR.BOTTOM_TAB_NAV, params: { screen: NAVIGATOR.GALLERY } }],
        });
        return;
      }
      setIsUnverified(true);
      await checkEmailRequestLimit(user);
    } catch (err) {
      const korErrorMsg = getKorErrorMsg(err.code);
      if (getAuthErrorField(err.code) === 'email') {
        setEmailError(korErrorMsg);
      } else {
        setPasswordError(korErrorMsg);
      }
    } finally {
      isSubmittingRef.current = false;
      setIsLoading(false);
    }
  };

  const handleForgotPasswordBtn = () => {
    navigation.navigate(NAVIGATOR.FORGOT_PASSWORD);
  };

  return (
    <AuthScreen
      bottom={
        <Button
          loading={isLoading}
          loadingTitle="로그인하는 중…"
          onPress={handleLogin}
          title="로그인"
        />
      }
      // 스택에 있는 첫 화면으로 돌아가면서 파라미터(비회원 백업 화면 fromGuest)를 그대로 둠
      onBack={() => navigation.popTo(NAVIGATOR.MAIN_PAGE, undefined, { merge: true })}
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
      <PressableScale
        accessibilityRole="button"
        onPress={handleForgotPasswordBtn}
        style={styles.forgotPassword}
      >
        <Text style={styles.forgotPasswordText}>비밀번호를 잊으셨나요?</Text>
      </PressableScale>
      {/* 남의 이메일로 잘못 가입했거나 인증하지 않을 계정이면 여기서 지움. 인증 전에는 설정 화면에 들어갈 수 없음 */}
      {isUnverified && (
        <PressableScale
          accessibilityRole="button"
          onPress={() => navigation.navigate(NAVIGATOR.DELETE_ACCOUNT)}
          style={styles.forgotPassword}
        >
          <Text style={styles.forgotPasswordText}>인증하지 않을 계정이면 삭제할 수 있어요</Text>
        </PressableScale>
      )}
    </AuthScreen>
  );
}

const useStyles = makeStyles((colors) => ({
  forgotPassword: {
    alignSelf: 'flex-start',
    paddingVertical: 14,
  },
  forgotPasswordText: {
    color: colors.TEXT_SUB,
    fontSize: 14,
    textDecorationLine: 'underline',
  },
}));
