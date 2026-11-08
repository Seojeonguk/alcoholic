import { KeyboardAvoidingView, Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { COLORS } from '../../constants';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

// 화면 아래에서 올라오는 시트. RN 기본 Modal로 만들어 새 네이티브 패키지 없이 씀(#331)
// 바깥(어두운 부분)을 누르거나 Android 뒤로 가기를 누르면 onClose를 부름
export default function BottomSheet({ visible, title, onClose, children }) {
  const { bottom } = useSafeAreaInsets();

  return (
    <Modal
      animationType="slide"
      navigationBarTranslucent
      onRequestClose={onClose}
      statusBarTranslucent
      transparent
      visible={visible}
    >
      <KeyboardAvoidingView behavior="padding" style={styles.container}>
        <Pressable
          accessibilityLabel="닫기"
          accessibilityRole="button"
          onPress={onClose}
          style={styles.backdrop}
        />
        <View accessibilityViewIsModal style={[styles.sheet, { paddingBottom: bottom + 16 }]}>
          <View style={styles.handle} />
          {title ? (
            <Text accessibilityRole="header" style={styles.title}>
              {title}
            </Text>
          ) : null}
          {children}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    flex: 1,
  },
  container: {
    flex: 1,
  },
  handle: {
    alignSelf: 'center',
    backgroundColor: COLORS.FILL,
    borderRadius: 2,
    height: 4,
    marginBottom: 12,
    width: 36,
  },
  sheet: {
    backgroundColor: COLORS.BACKGROUND,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '75%',
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  title: {
    color: COLORS.TEXT,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
});
