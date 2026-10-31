import { useState } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';

import { COLORS } from '../constants';
import { formatDay, toLocalDateString } from '../lib';
import { PressableScale } from './ui';

import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

// 'YYYY-MM-DD'만 넘기면 UTC로 해석되므로 기기 시간대의 자정으로 만듦
const toDate = (day) => new Date(`${day}T00:00:00`);

// 갤러리 위의 필터 줄. 기간 칩과 내 태그 칩을 가로로 넘겨 봄
// 고른 칩을 다시 누르면 그 조건을 지움
export default function GalleryFilter({ tags, filter, onChange }) {
  // 기간은 시작 날짜 → 끝 날짜 순서로 두 번 고름
  const [pickingStep, setPickingStep] = useState(null);
  const [draftFrom, setDraftFrom] = useState(null);
  const hasPeriod = !!(filter.from && filter.to);

  const handlePeriodPress = () => {
    if (hasPeriod) {
      onChange({ ...filter, from: null, to: null });
      return;
    }
    setPickingStep('from');
  };

  const handlePickFrom = (e, date) => {
    setDraftFrom(toLocalDateString(date));
    setPickingStep('to');
  };

  const handlePickTo = (e, date) => {
    setPickingStep(null);
    onChange({ ...filter, from: draftFrom, to: toLocalDateString(date) });
  };

  const cancelPicking = () => {
    setPickingStep(null);
  };

  const handleTagPress = (tag) => {
    onChange({ ...filter, tag: filter.tag === tag ? null : tag });
  };

  return (
    <>
      <ScrollView
        contentContainerStyle={styles.chips}
        horizontal
        keyboardShouldPersistTaps="handled"
        showsHorizontalScrollIndicator={false}
        style={styles.bar}
      >
        <PressableScale
          accessibilityLabel={hasPeriod ? '기간 조건 지우기' : '기간으로 찾기'}
          onPress={handlePeriodPress}
          style={[styles.chip, hasPeriod && styles.selectedChip]}
        >
          <Ionicons color={hasPeriod ? '#FFFFFF' : COLORS.TEXT} name="calendar-outline" size={14} />
          <Text style={[styles.chipText, hasPeriod && styles.selectedText]}>
            {hasPeriod ? `${formatDay(filter.from)} ~ ${formatDay(filter.to)}` : '기간'}
          </Text>
          {hasPeriod ? <Ionicons color="#FFFFFF" name="close" size={14} /> : null}
        </PressableScale>

        {tags.map((tag) => {
          const isSelected = filter.tag === tag;
          return (
            <PressableScale
              accessibilityLabel={isSelected ? `${tag} 태그 조건 지우기` : `${tag} 태그로 찾기`}
              key={tag}
              onPress={() => handleTagPress(tag)}
              style={[styles.chip, isSelected && styles.selectedChip]}
            >
              <Text style={[styles.chipText, isSelected && styles.selectedText]}>#{tag}</Text>
              {isSelected ? <Ionicons color="#FFFFFF" name="close" size={14} /> : null}
            </PressableScale>
          );
        })}
      </ScrollView>

      {pickingStep === 'from' && (
        <DateTimePicker
          mode="date"
          negativeButton={{ label: '취소' }}
          onDismiss={cancelPicking}
          onValueChange={handlePickFrom}
          positiveButton={{ label: '다음' }}
          value={new Date()}
        />
      )}
      {pickingStep === 'to' && (
        // 끝 날짜는 시작 날짜보다 앞을 고를 수 없음
        <DateTimePicker
          minimumDate={toDate(draftFrom)}
          mode="date"
          negativeButton={{ label: '취소' }}
          onDismiss={cancelPicking}
          onValueChange={handlePickTo}
          positiveButton={{ label: '완료' }}
          value={toDate(draftFrom)}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  // 가로 ScrollView는 기본으로 남은 세로 공간을 차지하므로 내용 높이만 쓰게 함
  bar: {
    flexGrow: 0,
  },
  chip: {
    alignItems: 'center',
    backgroundColor: COLORS.FILL,
    borderRadius: 16,
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  chipText: {
    color: COLORS.TEXT,
    fontSize: 14,
  },
  chips: {
    gap: 8,
    paddingBottom: 4,
    paddingHorizontal: 20,
  },
  selectedChip: {
    backgroundColor: COLORS.ACCENT,
  },
  selectedText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
