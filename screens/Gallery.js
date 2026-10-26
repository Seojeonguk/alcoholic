import { useCallback, useState } from 'react';
import { FlatList, StyleSheet } from 'react-native';

import { Header, Post } from '../components';
import { COLORS, NAVIGATOR } from '../constants';
import { showToast } from '../lib';
import { getPosts } from '../services';

import { useFocusEffect } from '@react-navigation/native';
import { getAuth } from 'firebase/auth';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Gallery({ navigation }) {
  const [posts, setPosts] = useState([]);
  // 글을 쓰고 돌아왔을 때도 새 글이 보이도록 화면에 들어올 때마다 다시 불러옴
  useFocusEffect(
    useCallback(() => {
      let active = true;

      const loadPosts = async () => {
        try {
          const userPosts = await getPosts(null, getAuth().currentUser.email);
          if (active) {
            setPosts(userPosts);
          }
        } catch (e) {
          if (active) {
            showToast('error', '글 목록을 불러오지 못했어요.', '잠시 후 다시 시도해 주세요.');
          }
        }
      };

      loadPosts();

      return () => {
        active = false;
      };
    }, [])
  );

  const moveGalleryForm = () => {
    navigation.navigate(NAVIGATOR.GALLERY_FORM);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title={'Gallery'}
        visibleLeftIcon={false}
        visibleRightIcon={true}
        rightIconName={'add-outline'}
        iconSize={24}
        onPressRight={() => moveGalleryForm()}
      />

      <FlatList
        contentContainerStyle={styles.galleryContent}
        data={posts}
        numColumns={3}
        renderItem={({ item, index }) => (
          <Post item={item} navigation={navigation} isMiddle={index % 3 === 1} />
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.BACKGROUND_COLOR,
    flex: 1,
  },
  galleryContent: {
    alignSelf: 'stretch',
  },
});
