import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { data } from '../gallery/dummyData';
import GalleryCard from '../gallery/GalleryCard';

import { AntDesign } from '@expo/vector-icons';
import MasonryList from '@react-native-seoul/masonry-list';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Gallery({ navigation }) {
  const moveGalleryForm = () => {
    navigation.navigate('galleryForm');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.galleryHeader}>
        <Text style={styles.galleryTitle}>Gallery</Text>
        <TouchableOpacity onPress={moveGalleryForm} style={styles.uploadBtn}>
          <AntDesign color="black" name="plus" size={24} />
        </TouchableOpacity>
      </View>

      <MasonryList
        contentContainerStyle={styles.galleryContent}
        data={data}
        numColumns={3}
        renderItem={({ item }) => <GalleryCard item={item} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  galleryContent: {
    alignSelf: 'stretch',
    paddingHorizontal: 12,
  },
  galleryHeader: {
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: 'grey',
    borderStyle: 'solid',
    justifyContent: 'center',
    marginBottom: 5,
    paddingVertical: 5,
  },
  galleryTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  uploadBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
    position: 'absolute',
    right: 0,
  },
});
