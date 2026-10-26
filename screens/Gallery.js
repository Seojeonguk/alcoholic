import { useCallback, useMemo, useState } from 'react';
import {
  RefreshControl,
  SectionList,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';

import { Button, Post, PressableScale, Skeleton } from '../components';
import { COLORS, NAVIGATOR } from '../constants';
import { groupPostsByMonth, showToast } from '../lib';
import { getPosts } from '../services';

import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { getAuth } from 'firebase/auth';
import { SafeAreaView } from 'react-native-safe-area-context';

const COLUMNS = 3;
const GAP = 6;
const SIDE_PADDING = 20;

// 섹션의 글을 3개씩 한 줄로 묶음
const toRows = (posts) => {
  const rows = [];
  for (let i = 0; i < posts.length; i += COLUMNS) {
    rows.push(posts.slice(i, i + COLUMNS));
  }
  return rows;
};

export default function Gallery({ navigation }) {
  const [posts, setPosts] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  // 처음 불러온 뒤 다시 불러올 때는 목록을 그대로 두고 위쪽에 로딩 표시만 보여 줌(자리 표시로 바꾸면 깜빡임)
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { width } = useWindowDimensions();
  const photoSize = (width - SIDE_PADDING * 2 - GAP * (COLUMNS - 1)) / COLUMNS;

  // isActive: 화면을 떠난 뒤 늦게 끝난 요청은 화면에 반영하지 않음
  const loadPosts = useCallback(async (isActive = () => true) => {
    setIsRefreshing(true);
    try {
      const userPosts = await getPosts(getAuth().currentUser.email);
      if (isActive()) {
        setPosts(userPosts);
        setIsLoaded(true);
      }
    } catch (e) {
      if (isActive()) {
        showToast('error', '글 목록을 불러오지 못했어요.', '잠시 후 다시 시도해 주세요.');
      }
    } finally {
      if (isActive()) {
        setIsRefreshing(false);
      }
    }
  }, []);

  // 글을 쓰고 돌아왔을 때도 새 글이 보이도록 화면에 들어올 때마다 다시 불러옴
  useFocusEffect(
    useCallback(() => {
      let active = true;
      loadPosts(() => active);
      return () => {
        active = false;
      };
    }, [loadPosts])
  );

  // 마신 날짜순으로 정렬해 월별로 묶음. 같은 날은 최근에 쓴 글이 먼저
  const sections = useMemo(
    () =>
      groupPostsByMonth(posts, new Date()).map((section) => ({
        title: section.title,
        data: toRows(section.data),
      })),
    [posts]
  );

  const moveGalleryForm = () => {
    navigation.navigate(NAVIGATOR.GALLERY_FORM);
  };

  const renderRow = ({ item: row }) => (
    <View style={styles.row}>
      {row.map((post) => (
        <Post item={post} key={post.docId} navigation={navigation} size={photoSize} />
      ))}
    </View>
  );

  const renderSkeleton = () => (
    <View style={styles.list}>
      <Skeleton height={16} radius={6} style={styles.sectionTitle} width={40} />
      {[0, 1].map((row) => (
        <View key={row} style={styles.row}>
          {[0, 1, 2].map((col) => (
            <Skeleton height={photoSize} key={col} width={photoSize} />
          ))}
        </View>
      ))}
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.empty}>
      <Text style={styles.emptyTitle}>아직 남긴 기록이 없어요.</Text>
      <Text style={styles.emptyText}>오늘 마신 술을 사진으로 남겨 보세요.</Text>
      <Button
        onPress={moveGalleryForm}
        style={styles.emptyButton}
        title="첫 기록 남기기"
        variant="soft"
      />
    </View>
  );

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>내 기록</Text>
        <PressableScale
          accessibilityLabel="새 기록 남기기"
          onPress={moveGalleryForm}
          style={styles.addButton}
        >
          <Ionicons color="#FFFFFF" name="add" size={24} />
        </PressableScale>
      </View>

      {isLoaded ? (
        <SectionList
          contentContainerStyle={styles.list}
          keyExtractor={(row) => row.map((post) => post.docId).join('_')}
          ListEmptyComponent={renderEmpty}
          refreshControl={
            <RefreshControl
              colors={[COLORS.ACCENT]}
              onRefresh={() => loadPosts()}
              refreshing={isRefreshing}
              tintColor={COLORS.ACCENT}
            />
          }
          renderItem={renderRow}
          renderSectionHeader={({ section }) => (
            <Text style={styles.sectionTitle}>{section.title}</Text>
          )}
          sections={sections}
          stickySectionHeadersEnabled={false}
        />
      ) : (
        renderSkeleton()
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  addButton: {
    alignItems: 'center',
    backgroundColor: COLORS.ACCENT,
    borderRadius: 12,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  container: {
    backgroundColor: COLORS.BACKGROUND,
    flex: 1,
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
    color: COLORS.TEXT_SUB,
    fontSize: 15,
    marginTop: 8,
  },
  emptyTitle: {
    color: COLORS.TEXT,
    fontSize: 17,
    fontWeight: '700',
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 8,
    paddingHorizontal: SIDE_PADDING,
    paddingTop: 12,
  },
  list: {
    paddingBottom: 24,
    paddingHorizontal: SIDE_PADDING,
  },
  row: {
    flexDirection: 'row',
    gap: GAP,
    marginBottom: GAP,
  },
  sectionTitle: {
    color: COLORS.TEXT_SUB,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
    marginTop: 16,
  },
  title: {
    color: COLORS.TEXT,
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
});
