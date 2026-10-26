import { useRef, useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { Header } from '../components';
import { COLORS } from '../constants';
import { auth } from '../firebaseConfig';
import { getKorErrorMsg, showToast } from '../lib';

import { sendPasswordResetEmail } from 'firebase/auth';
import { SafeAreaView } from 'react-native-safe-area-context';

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
          <Text style={styles.title}>비밀번호를 잊으셨나요?</Text>
        </View>

        <View style={styles.inputWrap}>
          <View style={styles.inputBox}>
            <Text style={styles.inputLabel}>이메일 주소</Text>
            <TextInput
              inputMode="email"
              keyboardType="email-address"
              onChangeText={handleChangeEmail}
              onSubmitEditing={handleSendEmail}
              placeholder="이메일을 입력해 주세요"
              ref={emailRef}
              returnKeyType="send"
              style={styles.input}
              value={email}
            />
            <Text style={styles.inputError}>{emailError}</Text>
          </View>
        </View>

        <TouchableOpacity onPress={handleSendEmail} style={styles.sendEmailBtn}>
          <Text style={styles.sendEmailBtnText}>이메일 전송</Text>
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
  sendEmailBtn: {
    backgroundColor: COLORS.BUTTON_COLOR,
    borderRadius: 5,
    height: 40,
    justifyContent: 'center',
    marginVertical: 15,
  },
  sendEmailBtnText: {
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
});
