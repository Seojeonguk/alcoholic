import { useCallback, useMemo, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

import { Button, Skeleton } from '../components';
import { NAVIGATOR } from '../constants';
import { getPostStats, makeStyles } from '../lib';

import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';

const BAR_HEIGHT = 96;

// 통계 탭(#342). 갤러리가 받아 온 글(redux posts)로 계산해서 Firestore를 따로 읽지 않음
export default function Stats({ navigation }) {
  const styles = useStyles();
  const { items: posts, loaded } = useSelector((state) => state.posts);
  // 앱을 켜 둔 채 달이 바뀌어도 맞게, 탭에 올 때마다 오늘 날짜로 다시 셈
  const [now, setNow] = useState(() => new Date());
  useFocusEffect(
    useCallback(() => {
      setNow(new Date());
    }, [])
  );
  const stats = useMemo(() => getPostStats(posts, now), [posts, now]);
  const maxMonthly = Math.max(1, ...stats.monthly.map((month) => month.count));

  const renderSummary = (label, value, a11yLabel) => (
    <View accessibilityLabel={a11yLabel} accessible style={styles.card}>
      <Text style={styles.cardLabel}>{label}</Text>
      <Text style={styles.cardValue}>{value}</Text>
    </View>
  );

  // 많이 쓴 순서의 가로 막대. 가장 많은 항목을 꽉 찬 막대로 둠
  const renderRanking = (title, items) => {
    if (items.length === 0) {
      return null;
    }
    const max = items[0].count;
    return (
      <View style={styles.section}>
        <Text accessibilityRole="header" style={styles.sectionTitle}>
          {title}
        </Text>
        {items.map(({ key, label, count }) => (
          <View
            accessibilityLabel={`${label}, 기록 ${count}개`}
            accessible
            key={key}
            style={styles.rankRow}
          >
            <Text numberOfLines={1} style={styles.rankLabel}>
              {label}
            </Text>
            <View style={styles.rankTrack}>
              <View style={[styles.rankBar, { width: `${(count / max) * 100}%` }]} />
            </View>
            <Text style={styles.rankCount}>{count}</Text>
          </View>
        ))}
      </View>
    );
  };

  const renderContent = () => {
    if (!loaded) {
      return (
        <View style={styles.skeleton}>
          <Skeleton height={80} radius={16} width="100%" />
          <Skeleton height={160} radius={16} style={styles.skeletonGap} width="100%" />
        </View>
      );
    }
    if (stats.total === 0) {
      return (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>아직 통계가 없어요.</Text>
          <Text style={styles.emptyText}>기록이 쌓이면 통계를 보여 드려요.</Text>
          <Button
            onPress={() => navigation.navigate(NAVIGATOR.GALLERY_FORM)}
            style={styles.emptyButton}
            title="첫 기록 남기기"
            variant="soft"
          />
        </View>
      );
    }

    const { average, count: ratedCount } = stats.rating;
    return (
      <>
        <View style={styles.cards}>
          {renderSummary('이번 달', `${stats.thisMonth}개`, `이번 달 기록 ${stats.thisMonth}개`)}
          {renderSummary('올해', `${stats.thisYear}개`, `올해 기록 ${stats.thisYear}개`)}
          {renderSummary(
            '평균 별점',
            average == null ? '-' : `★ ${average.toFixed(1)}`,
            average == null
              ? '평균 별점, 별점을 남긴 기록이 없어요'
              : `평균 별점 ${average.toFixed(1)}점, 기록 ${ratedCount}개 기준`
          )}
        </View>
        <Text style={styles.total}>지금까지 남긴 기록 {stats.total}개</Text>

        <View style={styles.section}>
          <Text accessibilityRole="header" style={styles.sectionTitle}>
            월별 기록
          </Text>
          <View style={styles.chart}>
            {stats.monthly.map(({ key, label, a11yLabel, count }) => (
              <View
                accessibilityLabel={`${a11yLabel}, 기록 ${count}개`}
                accessible
                key={key}
                style={styles.column}
              >
                <Text style={styles.columnCount}>{count > 0 ? count : ''}</Text>
                <View style={styles.columnTrack}>
                  <View
                    style={[
                      styles.columnBar,
                      { height: count > 0 ? Math.max(4, (count / maxMonthly) * BAR_HEIGHT) : 0 },
                    ]}
                  />
                </View>
                <Text style={styles.columnLabel}>{label.replace('월', '')}</Text>
              </View>
            ))}
          </View>
        </View>

        {renderRanking('많이 마신 주종', stats.drinkTypes)}
        {renderRanking('많이 쓴 태그', stats.tags)}
        {renderRanking('많이 간 장소', stats.locations)}
      </>
    );
  };

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>통계</Text>
        {renderContent()}
      </ScrollView>
    </SafeAreaView>
  );
}

const useStyles = makeStyles((colors) => ({
  card: {
    backgroundColor: colors.FILL,
    borderRadius: 16,
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 14,
  },
  cardLabel: {
    color: colors.TEXT_SUB,
    fontSize: 13,
  },
  cardValue: {
    color: colors.TEXT,
    fontSize: 20,
    fontWeight: '800',
    marginTop: 6,
  },
  cards: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 20,
  },
  chart: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 12,
  },
  column: {
    alignItems: 'center',
    flex: 1,
  },
  columnBar: {
    backgroundColor: colors.ACCENT,
    borderRadius: 4,
    width: '100%',
  },
  columnCount: {
    color: colors.TEXT_SUB,
    fontSize: 11,
    height: 16,
  },
  columnLabel: {
    color: colors.TEXT_SUB,
    fontSize: 11,
    marginTop: 6,
  },
  columnTrack: {
    height: BAR_HEIGHT,
    justifyContent: 'flex-end',
    width: '70%',
  },
  container: {
    backgroundColor: colors.BACKGROUND,
    flex: 1,
  },
  content: {
    paddingBottom: 32,
    paddingHorizontal: 20,
  },
  empty: {
    alignItems: 'center',
    marginTop: 120,
  },
  emptyButton: {
    marginTop: 20,
    paddingHorizontal: 24,
  },
  emptyText: {
    color: colors.TEXT_SUB,
    fontSize: 15,
    marginTop: 8,
  },
  emptyTitle: {
    color: colors.TEXT,
    fontSize: 17,
    fontWeight: '700',
  },
  rankBar: {
    backgroundColor: colors.ACCENT,
    borderRadius: 4,
    height: '100%',
  },
  rankCount: {
    color: colors.TEXT_SUB,
    fontSize: 13,
    textAlign: 'right',
    width: 28,
  },
  rankLabel: {
    color: colors.TEXT,
    fontSize: 14,
    width: 88,
  },
  rankRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  rankTrack: {
    backgroundColor: colors.FILL,
    borderRadius: 4,
    flex: 1,
    height: 8,
    overflow: 'hidden',
  },
  section: {
    marginTop: 32,
  },
  sectionTitle: {
    color: colors.TEXT,
    fontSize: 17,
    fontWeight: '700',
  },
  skeleton: {
    marginTop: 20,
  },
  skeletonGap: {
    marginTop: 16,
  },
  title: {
    color: colors.TEXT,
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
    paddingTop: 12,
  },
  total: {
    color: colors.TEXT_SUB,
    fontSize: 13,
    marginTop: 12,
  },
}));
