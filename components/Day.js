import { useState } from 'react';

import { formatDay, toLocalDateString } from '../lib';
import { updateDay } from '../redux';
import { ListRow } from './ui';

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
    <>
      <ListRow onPress={showDatePicker} title="날짜" value={formatDay(date)} />

      {isShowDatePicker && (
        <DateTimePicker
          mode="date"
          onDismiss={hideDatePicker}
          onValueChange={handleChangeDate}
          // 'YYYY-MM-DD'만 넘기면 UTC로 해석되므로 기기 시간대의 자정으로 만듦
          value={new Date(`${date}T00:00:00`)}
        />
      )}
    </>
  );
}
