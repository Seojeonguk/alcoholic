import { useEffect, useState } from 'react';
import { FlatList, StyleSheet } from 'react-native';

import { Header, Post } from '../components';
import { COLORS, NAVIGATOR } from '../constants';
import { getPosts } from '../services';

import { getAuth } from 'firebase/auth';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Gallery({ navigation }) {
  const [posts, setPosts] = useState([]);
  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;
    const email = user.email;

    const getPosting = async () => {
      const userPosts = await getPosts(null, email);

      setPosts(posts.concat(userPosts));
    };
    console.log('get data');

    getPosting();
  }, []);
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
