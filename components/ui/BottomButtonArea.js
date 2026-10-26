import { KeyboardAvoidingView, StyleSheet, View } from 'react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

// 주요 버튼을 화면 아래에 고정함. 키보드가 올라오면 키보드 위로 따라 올라감
export default function BottomButtonArea({ children }) {
  const { bottom } = useSafeAreaInsets();

  return (
    <KeyboardAvoidingView behavior="padding">
      <View style={[styles.area, { paddingBottom: bottom + 12 }]}>{children}</View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  area: {
    gap: 4,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
});
