import { StyleSheet, Text, View } from 'react-native';

import { COLORS } from '../constants';

import { Ionicons } from '@expo/vector-icons';

const ICONS = {
  success: { name: 'checkmark-circle', color: COLORS.TOAST_SUCCESS },
  error: { name: 'alert-circle', color: COLORS.TOAST_ERROR },
  info: { name: 'information-circle', color: COLORS.TOAST_INFO },
};

// 알림은 모두 진한 회색 상자에 흰 글씨. 종류는 앞의 작은 아이콘으로만 구분함
const renderToast = (type) =>
  function Toast({ text1, text2 }) {
    return (
      <View style={styles.toast}>
        <Ionicons color={ICONS[type].color} name={ICONS[type].name} size={20} />
        <View style={styles.texts}>
          <Text style={styles.text1}>{text1}</Text>
          {text2 ? <Text style={styles.text2}>{text2}</Text> : null}
        </View>
      </View>
    );
  };

const toastConfig = {
  success: renderToast('success'),
  error: renderToast('error'),
  info: renderToast('info'),
};

export default toastConfig;

const styles = StyleSheet.create({
  text1: {
    color: COLORS.TOAST_TEXT,
    fontSize: 15,
    fontWeight: '600',
  },
  text2: {
    color: COLORS.TOAST_TEXT_SUB,
    fontSize: 13,
    marginTop: 2,
  },
  texts: {
    flex: 1,
    marginLeft: 10,
  },
  toast: {
    alignItems: 'center',
    backgroundColor: COLORS.TOAST,
    borderRadius: 14,
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 14,
    width: '92%',
  },
});
