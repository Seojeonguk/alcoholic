import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { toLocalDateString } from '../lib';
import { updateDay } from '../redux';

import { AntDesign } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useDispatch, useSelector } from 'react-redux';

export default function Day() {
  const date = useSelector((state) => state.gallery.day);
  const dispatch = useDispatch();
  const [isShowDatePicker, setIsShowDatePicker] = useState(false);

  const handleChangeDate = (e, newDate) => {
    hideDatePicker();
    dispatch(updateDay(toLocalDateString(newDate)));
  };

  const hideDatePicker = () => {
    setIsShowDatePicker(false);
  };

  const showDatePicker = () => {
    setIsShowDatePicker(true);
  };

  return (
    <View style={styles.inputBox}>
      <AntDesign color="black" name="calendar" size={24} />
      <TextInput onPressIn={showDatePicker} placeholder="날짜" style={styles.input} value={date} />

      {isShowDatePicker && (
        <DateTimePicker
          mode="date"
          onDismiss={hideDatePicker}
          onValueChange={handleChangeDate}
          // 'YYYY-MM-DD'만 넘기면 UTC로 해석되므로 기기 시간대의 자정으로 만듦
          value={new Date(`${date}T00:00:00`)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    flex: 1,
    paddingLeft: 10,
  },
  inputBox: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginVertical: 5,
    marginTop: 30,
    alignItems: 'center',
  },
});
