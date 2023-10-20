import { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';

import { Header, Post } from '../components';
import { COLORS, NAVIGATOR } from '../constants';
import { getPosts } from '../firebase';

import MasonryList from '@react-native-seoul/masonry-list';
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

      setPosts(userPosts);
    };

    getPosting();
  }, []);
  const moveGalleryForm = () => {
    navigation.navigate(NAVIGATOR.GALLERY_FORM);
  };

  const renderItem = ({ item, i }) => {
    const remainder = i % 3;
    const isMiddle = remainder === 1;
    return <Post item={item} isMiddle={isMiddle} navigation={navigation} />;
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title={'Gallery'}
        visibleLeftIcon={false}
        visibleRightIcon={true}
        rightIconName={'ios-add-outline'}
        iconSize={24}
        onPressRight={() => moveGalleryForm()}
      />

      <MasonryList
        contentContainerStyle={styles.galleryContent}
        data={posts}
        numColumns={3}
        renderItem={renderItem}
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
