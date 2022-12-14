import { useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { auth } from '../../firebaseConfig';
import { getKorErrorMsg } from '../util';

import { createUserWithEmailAndPassword } from 'firebase/auth';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function RegistrationForm({ navigation }) {
  const [email, setEmail] = useState('');
  const emailRef = useRef();
  const passwordRef = useRef();
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);

  const handleChangeEmail = (newEmail) => {
    setErrorMessage('');
    setEmail(newEmail);
  };

  const handleChangePassword = (newPassword) => {
    setErrorMessage('');
    setPassword(newPassword);
  };

  const handleCancelBtn = () => {
    navigation.goBack();
  };

  const showPassword = () => {
    setPasswordVisible(true);
  };

  const hidePassword = () => {
    setPasswordVisible(false);
  };

  const RegistUser = () => {
    if (email === '') {
      setErrorMessage(getKorErrorMsg('missing/email'));
      emailRef.current.focus();
      return;
    }
    if (password === '') {
      setErrorMessage(getKorErrorMsg('missing/password'));
      passwordRef.current.focus();
      return;
    }
    createUserWithEmailAndPassword(auth, email, password).catch((err) => {
      console.log(err);
      console.log(err.code);
      let errorCode = err.code;
      setErrorMessage(getKorErrorMsg(errorCode));
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inputBox}>
        <TextInput
          onChangeText={(newEmail) => handleChangeEmail(newEmail)}
          placeholder="이메일을 입력해 주세요"
          ref={emailRef}
          style={styles.input}
          value={email}
        />
        <View style={styles.passWrap}>
          <TextInput
            onChangeText={(newPassword) => handleChangePassword(newPassword)}
            placeholder="비밀번호를 입력해 주세요"
            ref={passwordRef}
            secureTextEntry={!passwordVisible}
            style={[styles.input, { flex: 1 }]}
            value={password}
          />

          <Pressable onPressIn={showPassword} onPressOut={hidePassword} style={styles.passIcon}>
            <Ionicons name={passwordVisible ? 'eye-off' : 'eye'} size={24} color="black" />
          </Pressable>
        </View>

        <Text style={styles.error}>{errorMessage}</Text>
      </View>

      <View style={styles.bottomBtnWrapper}>
        <TouchableOpacity onPress={handleCancelBtn} style={styles.bottomBtn}>
          <Text style={styles.bottomText}>취소</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={RegistUser} style={styles.bottomBtn}>
          <Text style={styles.bottomText}>가입</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  bottomBtn: {
    alignItems: 'center',
    backgroundColor: 'tomato',
    borderRadius: 5,
    flex: 1,
    justifyContent: 'center',
    marginHorizontal: 10,
  },
  bottomBtnWrapper: {
    flexDirection: 'row',
    height: 50,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  bottomText: {
    fontSize: 20,
  },
  container: {
    flex: 1,
  },
  error: {
    color: 'red',
    fontSize: 12,
    paddingHorizontal: 5,
  },
  input: {
    backgroundColor: '#eeeeee',
    borderColor: 'grey',
    borderRadius: 5,
    borderWidth: 1,
    height: 40,
    marginVertical: 10,
    paddingHorizontal: 10,
  },
  inputBox: {
    justifyContent: 'center',
    padding: 20,
    flex: 1,
  },
  passIcon: {
    position: 'absolute',
    right: 10,
    zIndex: 9,
  },
  passWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
