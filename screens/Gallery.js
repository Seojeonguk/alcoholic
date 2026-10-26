import { useCallback, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';

import { Header, Post } from '../components';
import { COLORS, NAVIGATOR } from '../constants';
import { showToast } from '../lib';
import { getPosts } from '../services';

import { useFocusEffect } from '@react-navigation/native';
import { getAuth } from 'firebase/auth';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Gallery({ navigation }) {
  const [posts, setPosts] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  // 글을 쓰고 돌아왔을 때도 새 글이 보이도록 화면에 들어올 때마다 다시 불러옴
  useFocusEffect(
    useCallback(() => {
      let active = true;

      const loadPosts = async () => {
        try {
          const userPosts = await getPosts(getAuth().currentUser.email);
          if (active) {
            setPosts(userPosts);
            setIsLoaded(true);
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
        // 불러오기 전에는 안내 문구가 잠깐 보이지 않게 다 불러온 뒤에만 보여 줌
        ListEmptyComponent={
          isLoaded ? (
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyTitle}>아직 남긴 기록이 없어요.</Text>
              <Text style={styles.emptyText}>오른쪽 위 + 버튼으로 첫 기록을 남겨 보세요.</Text>
            </View>
          ) : null
        }
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
  emptyText: {
    color: COLORS.LABEL_COLOR,
    marginTop: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyWrap: {
    alignItems: 'center',
    marginTop: 120,
  },
  galleryContent: {
    alignSelf: 'stretch',
  },
});
