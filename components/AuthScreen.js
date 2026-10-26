import { ScrollView, StyleSheet, Text } from 'react-native';

import { COLORS } from '../constants';
import Header from './Header';
import { BottomButtonArea } from './ui';

import { SafeAreaView } from 'react-native-safe-area-context';

// 로그인 · 회원가입 · 비밀번호 찾기 · 탈퇴가 함께 쓰는 틀: 뒤로 가기, 큰 제목, 입력 칸, 아래 고정 버튼
export default function AuthScreen({ title, description, onBack, children, bottom }) {
  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <Header left="back" onPressLeft={onBack} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>{title}</Text>
        {description ? <Text style={styles.description}>{description}</Text> : null}
        {children}
      </ScrollView>
      <BottomButtonArea>{bottom}</BottomButtonArea>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.BACKGROUND,
    flex: 1,
  },
  content: {
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  description: {
    color: COLORS.TEXT_SUB,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 8,
    marginTop: 8,
  },
  title: {
    color: COLORS.TEXT,
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 8,
    marginTop: 8,
  },
});
