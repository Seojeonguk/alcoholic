import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';

import { BottomSheet, Carousel, Header, PressableScale, Skeleton } from '../components';
import { COLORS, NAVIGATOR } from '../constants';
import { formatDay, getShareText, showToast, usePreventLeave } from '../lib';
import { isMember, loadPost, removePost } from '../services';

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// 더보기 메뉴. Android Alert는 버튼을 3개까지만 보여 줘서 시트로 띄움(#335)
const MENU_ITEMS = [
  { action: 'share', label: '공유하기', icon: 'share-social-outline' },
  { action: 'edit', label: '수정', icon: 'create-outline' },
  { action: 'delete', label: '삭제', icon: 'trash-outline', danger: true },
];

export default function Details({ route, navigation }) {
  const { docId } = route.params;
  const { width } = useWindowDimensions();
  const { top } = useSafeAreaInsets();

  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // 삭제 중에 메뉴를 다시 눌러 두 번 지우지 않게 막음
  const isDeletingRef = useRef(false);
  usePreventLeave(navigation, isDeletingRef);
  const [myPost, setMyPost] = useState({
    title: '',
    photos: [],
    location: '',
    day: '',
    content: '',
    tags: [],
  });

  const { title, photos, location, day, content, tags } = myPost;

  useEffect(() => {
    // 화면을 떠난 뒤 늦게 끝난 요청으로 goBack · setState를 부르지 않게 함
    let active = true;
    const getPosting = async () => {
      let post;
      try {
        post = await loadPost(docId);
      } catch {
        post = null;
      }
      if (!active) {
        return;
      }
      if (!post) {
        showToast('error', '글을 불러오지 못했어요.', '잠시 후 다시 시도해 주세요.');
        navigation.goBack();
        return;
      }
      const currentPostInfo = {
        title: post.title,
        // 필드가 없는 예전 글도 열리게 기본값을 넣음
        location: post.location ?? '',
        day: post.day,
        content: post.content,
        tags: post.tags ?? [],
        photos: post.photos ?? [],
      };
      setMyPost(currentPostInfo);
      setLoading(false);
    };
    getPosting();
    return () => {
      active = false;
    };
  }, [docId, navigation]);

  const deleteThisPost = async () => {
    if (isDeletingRef.current) {
      return;
    }
    isDeletingRef.current = true;
    showToast('info', '기록을 삭제하는 중이에요.');
    const member = isMember();
    try {
      // queued: 연결이 없어 기기에서 먼저 지움. 연결되면 서버에서도 지워짐(#323)
      const { queued } = await removePost(docId, photos);
      if (queued) {
        showToast('info', '연결되면 삭제가 반영돼요.', '목록에서는 먼저 빠져요.');
      } else {
        showToast('success', '기록을 삭제했어요.');
      }
      isDeletingRef.current = false;
      // 회원 갤러리는 구독으로, 비회원 갤러리는 화면에 다시 들어올 때 지운 글을 목록에서 뺌
      navigation.goBack();
    } catch {
      isDeletingRef.current = false;
      showToast(
        'error',
        '기록을 삭제하지 못했어요.',
        member ? '인터넷 연결을 확인하고 다시 시도해 주세요.' : '잠시 후 다시 시도해 주세요.'
      );
    }
  };

  const handleDeletePost = () => {
    Alert.alert(
      '기록 삭제',
      '이 기록과 사진이 삭제되며 되돌릴 수 없어요. 삭제할까요?',
      [
        { text: '취소', style: 'cancel' },
        { text: '삭제', style: 'destructive', onPress: deleteThisPost },
      ],
      { cancelable: true }
    );
  };

  const moveEdit = () => {
    // 고칠 글은 화면 파라미터로 넘김. 새 글 초안(redux)은 건드리지 않음(#325)
    navigation.navigate(NAVIGATOR.GALLERY_FORM, { docId, post: myPost });
  };

  // 제목 · 날짜 · 장소 · 내용 · 태그를 텍스트로 보냄. 사진은 #344에서 함께 보냄(#335)
  const sharePost = async () => {
    const message = getShareText(myPost);
    if (!message) {
      showToast('info', '공유할 내용이 없어요.');
      return;
    }
    try {
      await Share.share({ message }, { dialogTitle: '기록 공유하기' });
    } catch {
      showToast('error', '공유하지 못했어요.', '잠시 후 다시 시도해 주세요.');
    }
  };

  const showMenu = () => {
    if (loading || isDeletingRef.current) {
      return;
    }
    setIsMenuOpen(true);
  };

  const selectMenu = (action) => {
    setIsMenuOpen(false);
    if (action === 'share') {
      sharePost();
    } else if (action === 'edit') {
      moveEdit();
    } else if (action === 'delete') {
      handleDeletePost();
    }
  };

  // 태그를 누르면 그 태그로 거른 갤러리로 돌아감(#334)
  const showTag = (tag) => {
    if (isDeletingRef.current) {
      return;
    }
    navigation.popTo(NAVIGATOR.BOTTOM_TAB_NAV, {
      screen: NAVIGATOR.GALLERY,
      params: { tag },
    });
  };

  // 날짜와 장소를 한 줄로. 장소가 없으면 날짜만
  const meta = [formatDay(day), location].filter(Boolean).join(' · ');

  const renderSkeleton = () => (
    <View>
      <Skeleton height={width} radius={0} width={width} />
      <View style={styles.body}>
        <Skeleton height={28} radius={8} width="60%" />
        <Skeleton height={16} radius={6} style={styles.skeletonLine} width="40%" />
        <Skeleton height={16} radius={6} style={styles.skeletonLine} width="100%" />
        <Skeleton height={16} radius={6} style={styles.skeletonLine} width="80%" />
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        renderSkeleton()
      ) : (
        <ScrollView contentContainerStyle={styles.scroll}>
          <Carousel data={photos} size={width} />

          <View style={styles.body}>
            <Text style={styles.title}>{title}</Text>
            {meta ? <Text style={styles.meta}>{meta}</Text> : null}
            {content ? <Text style={styles.content}>{content}</Text> : null}

            {tags?.length > 0 && (
              <View style={styles.tags}>
                {tags.map((item, index) => (
                  <PressableScale
                    accessibilityHint="이 태그를 단 기록만 갤러리에서 보여 줘요"
                    accessibilityLabel={`태그 ${item}`}
                    accessibilityRole="button"
                    key={`item_${item}_${index}`}
                    onPress={() => showTag(item)}
                    style={styles.tag}
                  >
                    <Text style={styles.tagText}>#{item}</Text>
                  </PressableScale>
                ))}
              </View>
            )}
          </View>
        </ScrollView>
      )}

      {/* 사진 위에 떠 있는 헤더. 밝은 사진에서도 흰 아이콘과 상태 표시줄 글씨가 보이게 위쪽을 어둡게 깔아 줌 */}
      <LinearGradient
        colors={[COLORS.PHOTO_SHADE, COLORS.PHOTO_SHADE_END]}
        pointerEvents="box-none"
        style={[styles.header, { paddingTop: top }]}
      >
        <Header
          left="back"
          light
          onPressLeft={() => navigation.goBack()}
          onPressRight={showMenu}
          right="ellipsis-horizontal"
          rightLabel="더보기"
        />
      </LinearGradient>

      <BottomSheet onClose={() => setIsMenuOpen(false)} visible={isMenuOpen}>
        {MENU_ITEMS.map(({ action, label, icon, danger }) => (
          <PressableScale
            accessibilityLabel={label}
            accessibilityRole="button"
            key={label}
            onPress={() => selectMenu(action)}
            style={styles.menuItem}
          >
            <Ionicons color={danger ? COLORS.DANGER : COLORS.TEXT} name={icon} size={22} />
            <Text style={[styles.menuText, danger && styles.dangerText]}>{label}</Text>
          </PressableScale>
        ))}
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  body: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  container: {
    backgroundColor: COLORS.BACKGROUND,
    flex: 1,
  },
  content: {
    color: COLORS.TEXT,
    fontSize: 15,
    lineHeight: 24,
    marginTop: 20,
  },
  dangerText: {
    color: COLORS.DANGER,
  },
  header: {
    paddingBottom: 32,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  menuItem: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 14,
  },
  menuText: {
    color: COLORS.TEXT,
    fontSize: 16,
  },
  meta: {
    color: COLORS.TEXT_SUB,
    fontSize: 13,
    marginTop: 8,
  },
  scroll: {
    paddingBottom: 40,
  },
  skeletonLine: {
    marginTop: 12,
  },
  tag: {
    backgroundColor: COLORS.FILL,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  tagText: {
    color: COLORS.TEXT,
    fontSize: 14,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 20,
  },
  title: {
    color: COLORS.TEXT,
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
});
