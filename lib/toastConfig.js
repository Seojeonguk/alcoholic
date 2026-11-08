import { Text, View } from 'react-native';

import { makeStyles, useColors } from './theme';

import { Ionicons } from '@expo/vector-icons';

// 아이콘 색은 색 표의 이름으로 적어 두고 그릴 때 지금 테마의 색을 꺼냄
const ICONS = {
  success: { name: 'checkmark-circle', color: 'TOAST_SUCCESS' },
  error: { name: 'alert-circle', color: 'TOAST_ERROR' },
  info: { name: 'information-circle', color: 'TOAST_INFO' },
};

// 알림은 모두 진한 회색 상자에 흰 글씨. 종류는 앞의 작은 아이콘으로만 구분함
const renderToast = (type) =>
  function Toast({ text1, text2 }) {
    const colors = useColors();
    const styles = useStyles();
    return (
      <View style={styles.toast}>
        <Ionicons color={colors[ICONS[type].color]} name={ICONS[type].name} size={20} />
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

const useStyles = makeStyles((colors) => ({
  text1: {
    color: colors.TOAST_TEXT,
    fontSize: 15,
    fontWeight: '600',
  },
  text2: {
    color: colors.TOAST_TEXT_SUB,
    fontSize: 13,
    marginTop: 2,
  },
  texts: {
    flex: 1,
    marginLeft: 10,
  },
  toast: {
    alignItems: 'center',
    backgroundColor: colors.TOAST,
    borderRadius: 14,
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 14,
    width: '92%',
  },
}));
