import { memo, useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Carousel, Header } from '../components';
import { COLORS, NAVIGATOR } from '../constants';
import { showToast } from '../lib';
import { updateGallery } from '../redux';

import { FontAwesome5 } from '@expo/vector-icons';
import { getAuth } from 'firebase/auth';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch } from 'react-redux';
import LoadingSpinner from '../components/LoadingSpinner';
import { deletePost, getPost } from '../services';

const DEFAULT_NUMBER_OF_LINES = 3;

function Details({ route, navigation }) {
  const { docId } = route.params;
  const dispatch = useDispatch();

  const [numberOfLines, setNumberOfLines] = useState(DEFAULT_NUMBER_OF_LINES);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
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

  const toggleTruncate = () => {
    const newNumberOfLines =
      numberOfLines === DEFAULT_NUMBER_OF_LINES ? 0 : DEFAULT_NUMBER_OF_LINES;
    setNumberOfLines(newNumberOfLines);
  };

  const removePost = async () => {
    setIsDeleting(true);
    try {
      const { email, uid } = getAuth().currentUser;
      await deletePost(docId, email, uid, photos);
      showToast('success', '글을 삭제했습니다.');
      // 갤러리는 화면에 들어올 때마다 목록을 다시 불러옴
      navigation.goBack();
    } catch (e) {
      setIsDeleting(false);
      showToast('error', '글을 삭제하지 못했습니다.', '잠시 후 다시 시도해 주세요.');
    }
  };

  const handleDeletePost = () => {
    Alert.alert(
      '글 삭제',
      '이 글과 사진이 삭제되며 되돌릴 수 없습니다. 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        { text: '삭제', style: 'destructive', onPress: removePost },
      ],
      { cancelable: true }
    );
  };

  const onPressRight = () => {
    dispatch(updateGallery(myPost));
    navigation.navigate(NAVIGATOR.GALLERY_FORM, { docId: docId });
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header
        visibleLeftIcon={true}
        visibleRightIcon={true}
        leftIconName={'arrow-back'}
        rightIconName={'pencil-sharp'}
        onPressLeft={() => navigation.goBack()}
        onPressRight={onPressRight}
        iconSize={24}
      />

      {loading ? (
        <LoadingSpinner />
      ) : (
        <ScrollView>
          <Carousel height={300} data={photos} offset={0} gap={0} isIndicator={true} />

          <View style={styles.contentWrap}>
            <Text style={styles.title}>{title}</Text>

            {location && (
              <View style={styles.locationWrap}>
                <FontAwesome5
                  name="map-marker-alt"
                  size={13}
                  color="gray"
                  style={styles.locationIcon}
                />
                <Text style={styles.location}>{location}</Text>
              </View>
            )}

            <Text style={styles.day}>{day}</Text>

            <Text
              style={[styles.content, { marginBottom: tags ? 0 : 30 }]}
              numberOfLines={numberOfLines}
              onPress={toggleTruncate}
            >
              {content}
            </Text>

            {tags && (
              <View style={styles.tagWrap}>
                {tags.map((item, index) => (
                  <Text key={`item_${item}_${index}`} style={styles.tag}>
                    #{item}
                  </Text>
                ))}
              </View>
            )}

            <TouchableOpacity
              disabled={isDeleting}
              onPress={handleDeletePost}
              style={styles.deleteBtn}
            >
              <Text style={styles.deleteBtnText}>글 삭제</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}

      {isDeleting && <LoadingSpinner isOverlay={true} />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.BACKGROUND_COLOR,
    flex: 1,
  },
  content: {
    lineHeight: 20,
    marginTop: 10,
  },
  contentWrap: {
    marginTop: 10,
    paddingHorizontal: 24,
  },
  day: {
    fontSize: 10,
  },
  deleteBtn: {
    alignSelf: 'center',
    marginBottom: 30,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  deleteBtnText: {
    color: '#ff0000',
    textDecorationLine: 'underline',
  },
  location: {
    fontSize: 13,
  },
  locationIcon: {
    height: '100%',
    marginRight: 2,
    verticalAlign: 'middle',
  },
  locationWrap: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingVertical: 3,
  },
  tag: {
    backgroundColor: '#c9d1d9',
    borderColor: 'gray',
    borderRadius: 10,
    borderWidth: 1,
    margin: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  tagWrap: {
    marginTop: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  title: {
    fontSize: 25,
  },
});

export default memo(Details);
