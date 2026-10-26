import { useRef, useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { Header } from '../components';
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
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Login({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isSecurePassword, setSecurePassword] = useState(true);
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
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Send',
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

  const handleRegistrationBtn = () => {
    navigation.navigate(NAVIGATOR.REGISTRATION_FORM);
  };

  const handleForgotPasswordBtn = () => {
    navigation.navigate(NAVIGATOR.FORGOT_PASSWORD);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header
        visibleLeftIcon={true}
        visibleRightIcon={false}
        leftIconName={'arrow-back'}
        onPressLeft={() => navigation.replace(NAVIGATOR.MAIN_PAGE)}
        iconSize={24}
      />

      <View style={styles.contentWrap}>
        <View style={styles.titleWrap}>
          <Text style={styles.title}>이메일로 시작하기</Text>
        </View>

        <View style={styles.inputWrap}>
          <View style={styles.inputBox}>
            <Text style={styles.inputLabel}>이메일 주소</Text>
            <TextInput
              inputMode="email"
              keyboardType="email-address"
              onChangeText={handleChangeEmail}
              onSubmitEditing={() => passwordRef.current.focus()}
              placeholder="이메일을 입력해 주세요"
              ref={emailRef}
              returnKeyType="next"
              submitBehavior="submit"
              style={styles.input}
              value={email}
            />
            <Text style={styles.inputError}>{emailError}</Text>
          </View>

          <View style={styles.inputBox}>
            <Text style={styles.inputLabel}>비밀번호</Text>
            <TextInput
              onChangeText={handleChangePassword}
              onPressIn={() => setSecurePassword(false)}
              onPressOut={() => setSecurePassword(true)}
              onSubmitEditing={handleLogin}
              placeholder="비밀번호를 입력해 주세요"
              ref={passwordRef}
              returnKeyType="done"
              secureTextEntry={isSecurePassword}
              style={styles.input}
              value={password}
            />
            <Text style={styles.inputError}>{passwordError}</Text>
          </View>
        </View>

        <TouchableOpacity onPress={handleLogin} style={styles.loginBtn}>
          <Text style={styles.loginBtnText}>로그인</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleRegistrationBtn} style={styles.registrationBtn}>
          <Text style={styles.registrationBtnText}>회원가입</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleForgotPasswordBtn} style={styles.forgotPasswordBtn}>
          <Text style={styles.forgotPasswordBtnText}>비밀번호를 잊으셨나요?</Text>
        </TouchableOpacity>
      </View>
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
  forgotPasswordBtn: {
    justifyContent: 'center',
  },
  forgotPasswordBtnText: {
    color: COLORS.BORDER_COLOR,
    fontSize: 10,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
  input: {
    borderBottomColor: COLORS.BORDER_COLOR,
    borderBottomWidth: 1,
    borderRightColor: '#f6e8db',
    color: 'black',
    fontSize: 15,
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
  loginBtn: {
    backgroundColor: COLORS.BUTTON_COLOR,
    borderRadius: 5,
    height: 40,
    justifyContent: 'center',
    marginVertical: 15,
  },
  loginBtnText: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  titleWrap: {
    height: 35,
    marginVertical: 10,
  },
  registrationBtn: {
    justifyContent: 'center',
    marginVertical: 10,
  },
  registrationBtnText: {
    color: COLORS.BORDER_COLOR,
    fontSize: 10,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
});
