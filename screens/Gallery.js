import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  RefreshControl,
  SectionList,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';

import { Button, GalleryFilter, Post, PressableScale, Skeleton } from '../components';
import { COLORS, NAVIGATOR } from '../constants';
import { auth } from '../firebaseConfig';
import { collectTags, filterPosts, groupPostsByMonth, memberEmail, showToast } from '../lib';
import { subscribeGallery, useGuestMigration } from '../services';

import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { onAuthStateChanged } from '@react-native-firebase/auth';
import { SafeAreaView } from 'react-native-safe-area-context';

const COLUMNS = 3;
const GAP = 6;
const SIDE_PADDING = 20;
const NO_FILTER = { tag: null, from: null, to: null };
const LOAD_ERROR = ['error', '글 목록을 불러오지 못했어요.', '잠시 후 다시 시도해 주세요.'];

// 지금 구독할 회원 이메일. 비회원이면 null
const currentMemberEmail = () => memberEmail(auth.currentUser);

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
  // 처음 불러오기에 실패하면 자리 표시 대신 다시 시도 화면을 보여 줌(#326)
  // 목록을 한 번이라도 보여 줬으면 목록은 그대로 두고 토스트로만 알림
  const [loadFailed, setLoadFailed] = useState(false);
  const isLoadedRef = useRef(false);
  const [filter, setFilter] = useState(NO_FILTER);
  const { width } = useWindowDimensions();
  const photoSize = (width - SIDE_PADDING * 2 - GAP * (COLUMNS - 1)) / COLUMNS;

  // 회원: 내 글을 구독해서 처음 한 번만 전체를 읽고, 그 뒤로는 바뀐 글만 받음(#300)
  // 비회원: 기기에 저장한 기록을 읽고, 기기에 저장 · 삭제할 때마다 다시 읽음. 파일이라 Firestore 읽기가 없음(#201)
  // 어느 쪽인지는 subscribeGallery가 account(회원 이메일, 비회원이면 null)로 고름(#339)
  const [account, setAccount] = useState(currentMemberEmail);
  // 바꾸면 구독을 새로 시작함(당겨서 새로 고침 · 구독 오류 뒤 다시 들어왔을 때)
  const [subscriptionKey, setSubscriptionKey] = useState(0);
  const subscriptionFailed = useRef(false);

  // 화면이 떠 있는 동안 구독을 유지함. 상세 · 글쓰기 화면은 갤러리 위에 쌓이므로 그사이에도 끊지 않아야
  // 돌아올 때 다시 읽지 않음. 화면이 사라지거나(로그아웃 · 탈퇴) 계정이 바뀌면 끊음
  useEffect(() => {
    subscriptionFailed.current = false;
    return subscribeGallery(
      account,
      (userPosts) => {
        setPosts(userPosts);
        setIsLoaded(true);
        isLoadedRef.current = true;
        setLoadFailed(false);
        setIsRefreshing(false);
      },
      () => {
        subscriptionFailed.current = true;
        setIsRefreshing(false);
        // 로그아웃하는 사이에 끊긴 구독이면 알리지 않음
        if (currentMemberEmail() === account) {
          setLoadFailed(true);
          if (isLoadedRef.current) {
            showToast(...LOAD_ERROR);
          }
        }
      }
    );
  }, [account, subscriptionKey]);

  // 로그아웃하거나 계정이 바뀌면 바로 구독 대상을 바꿈
  useEffect(() => onAuthStateChanged(auth, (user) => setAccount(memberEmail(user))), []);

  useFocusEffect(
    useCallback(() => {
      setAccount(currentMemberEmail());
      // 구독이 바뀐 글을 받아 오므로 다시 읽지 않음. 구독이 오류로 끊겼을 때만 다시 시작
      if (subscriptionFailed.current) {
        setSubscriptionKey((key) => key + 1);
      }
    }, [])
  );

  // 회원이면 기기에 남은 비회원 기록을 계정으로 옮김. 옮긴 글은 구독으로 목록에 들어옴(#201)
  const { progress: migration } = useGuestMigration();

  // 다시 시도 화면에서 누르면 자리 표시를 보여 주고 다시 불러옴
  const retry = () => {
    setLoadFailed(false);
    refresh();
  };

  // 구독을 새로 시작해서 처음부터 다시 읽음
  const refresh = () => {
    setIsRefreshing(true);
    setSubscriptionKey((key) => key + 1);
  };

  const tags = useMemo(() => collectTags(posts), [posts]);
  // 고른 태그의 글을 모두 지워서 태그가 없어지면 태그 조건은 없는 것으로 봄
  const activeFilter = useMemo(
    () => ({ ...filter, tag: tags.includes(filter.tag) ? filter.tag : null }),
    [filter, tags]
  );
  const isFiltering = !!(activeFilter.tag || (activeFilter.from && activeFilter.to));

  // 마신 날짜순으로 정렬해 월별로 묶음. 같은 날은 최근에 쓴 글이 먼저
  const sections = useMemo(
    () =>
      groupPostsByMonth(filterPosts(posts, activeFilter), new Date()).map((section) => ({
        // 줄 key는 섹션 key + 줄 번호. 새 글이 들어와도 줄을 새로 만들지 않고 바뀐 내용만 다시 그림
        key: section.title,
        title: section.title,
        data: toRows(section.data),
      })),
    [posts, activeFilter]
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

  const renderLoadError = () => (
    <View style={styles.empty}>
      <Text accessibilityRole="header" style={styles.emptyTitle}>
        기록을 불러오지 못했어요.
      </Text>
      {/* 회원은 서버에서, 비회원은 기기에서 불러옴 */}
      <Text style={styles.emptyText}>
        {account ? '인터넷 연결을 확인하고 다시 시도해 주세요.' : '잠시 후 다시 시도해 주세요.'}
      </Text>
      <Button
        accessibilityLabel="기록 다시 불러오기"
        onPress={retry}
        style={styles.emptyButton}
        title="다시 시도"
        variant="soft"
      />
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

  const renderNoMatch = () => (
    <View style={styles.empty}>
      <Text style={styles.emptyTitle}>조건에 맞는 기록이 없어요.</Text>
      <Text style={styles.emptyText}>태그나 기간을 바꿔 보세요.</Text>
      <Button
        onPress={() => setFilter(NO_FILTER)}
        style={styles.emptyButton}
        title="조건 지우기"
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
          accessibilityRole="button"
          onPress={moveGalleryForm}
          style={styles.addButton}
        >
          <Ionicons color="#FFFFFF" name="add" size={24} />
        </PressableScale>
      </View>

      {migration ? (
        <Text style={styles.migration}>
          {`기기의 기록 옮기는 중 ${migration.done}/${migration.total}`}
        </Text>
      ) : null}

      {isLoaded && posts.length > 0 ? (
        <GalleryFilter filter={activeFilter} onChange={setFilter} tags={tags} />
      ) : null}

      {isLoaded ? (
        <SectionList
          contentContainerStyle={styles.list}
          keyExtractor={(row, index) => `row_${index}`}
          ListEmptyComponent={isFiltering ? renderNoMatch : renderEmpty}
          refreshControl={
            <RefreshControl
              colors={[COLORS.ACCENT]}
              onRefresh={refresh}
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
      ) : loadFailed ? (
        renderLoadError()
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
  migration: {
    color: COLORS.TEXT_SUB,
    fontSize: 13,
    paddingBottom: 8,
    paddingHorizontal: SIDE_PADDING,
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
