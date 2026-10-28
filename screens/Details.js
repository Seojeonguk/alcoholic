import { memo, useEffect, useRef, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { Carousel, Header, Skeleton } from '../components';
import { COLORS, NAVIGATOR } from '../constants';
import { formatDay, showToast } from '../lib';
import { updateGallery } from '../redux';
import { deletePost, getPost } from '../services';

import { getAuth } from 'firebase/auth';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch } from 'react-redux';

function Details({ route, navigation }) {
  const { docId } = route.params;
  const dispatch = useDispatch();
  const { width } = useWindowDimensions();
  const { top } = useSafeAreaInsets();

  const [loading, setLoading] = useState(true);
  // 삭제 중에 메뉴를 다시 눌러 두 번 지우지 않게 막음
  const isDeletingRef = useRef(false);
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
    const getPosting = async () => {
      let post;
      try {
        post = await getPost(docId);
      } catch (e) {
        post = null;
      }
      if (!post) {
        showToast('error', '글을 불러오지 못했어요.', '잠시 후 다시 시도해 주세요.');
        navigation.goBack();
        return;
      }
      const currentPostInfo = {
        title: post.title,
        location: post.location,
        day: post.day,
        content: post.content,
        tags: post.tags,
        photos: post.photos,
      };
      setMyPost(currentPostInfo);
      setLoading(false);
    };
    getPosting();
  }, []);

  const removePost = async () => {
    if (isDeletingRef.current) {
      return;
    }
    isDeletingRef.current = true;
    try {
      const { email, uid } = getAuth().currentUser;
      await deletePost(docId, email, uid, photos);
      showToast('success', '기록을 삭제했어요.');
      // 갤러리는 화면에 들어올 때마다 목록을 다시 불러옴
      navigation.goBack();
    } catch (e) {
      isDeletingRef.current = false;
      showToast('error', '기록을 삭제하지 못했어요.', '잠시 후 다시 시도해 주세요.');
    }
  };

  const handleDeletePost = () => {
    Alert.alert(
      '기록 삭제',
      '이 기록과 사진이 삭제되며 되돌릴 수 없어요. 삭제할까요?',
      [
        { text: '취소', style: 'cancel' },
        { text: '삭제', style: 'destructive', onPress: removePost },
      ],
      { cancelable: true }
    );
  };

  const moveEdit = () => {
    dispatch(updateGallery(myPost));
    navigation.navigate(NAVIGATOR.GALLERY_FORM, { docId: docId });
  };

  const showMenu = () => {
    if (loading || isDeletingRef.current) {
      return;
    }
    Alert.alert(
      undefined,
      undefined,
      [
        { text: '취소', style: 'cancel' },
        { text: '삭제', style: 'destructive', onPress: handleDeletePost },
        { text: '수정', onPress: moveEdit },
      ],
      { cancelable: true }
    );
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
                  <View key={`item_${item}_${index}`} style={styles.tag}>
                    <Text style={styles.tagText}>#{item}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </ScrollView>
      )}

      {/* 사진 위에 떠 있는 헤더 */}
      <View style={[styles.header, { paddingTop: top }]}>
        <Header
          left="back"
          light
          onPressLeft={() => navigation.goBack()}
          onPressRight={showMenu}
          right="ellipsis-horizontal"
        />
      </View>
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
  header: {
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
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

export default memo(Details);
