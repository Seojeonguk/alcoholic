import { useState } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { addImage } from '../redux/slices/GallerySlice';

import { AntDesign } from '@expo/vector-icons';
import * as MediaLibrary from 'expo-media-library';
import { useDispatch, useSelector } from 'react-redux';

const screenWidthSize = Dimensions.get('window').width;

export default function Photo() {
  const [assetsOptions, setAssetsOptions] = useState({
    after: '0',
    hasNextPage: true,
  });
  const dispatch = useDispatch();
  const [isOpenModal, setIsOpenModal] = useState(false);
  const photos = useSelector((state) => state.gallery.photos);
  const [savedPhotos, setSavedPhotos] = useState([]);
  const [selectedPhotos, setSelectedPhotos] = useState([]);

  const addImageBtn = async () => {
    await showMediaLibrary();
    openModal();
  };

  const applySelectedMedia = () => {
    dispatch(addImage(selectedPhotos));
    initSelectedPhoto();
    closeModal();
  };

  const closeModal = () => {
    setIsOpenModal(false);
  };

  const handleSelectPhoto = (photo) => {
    setSelectedPhotos(selectedPhotos.concat(photo));
  };

  const initSelectedPhoto = () => {
    setSelectedPhotos([]);
  };

  const openModal = () => {
    setIsOpenModal(true);
  };

  const showMediaLibrary = async () => {
    let { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== 'granted') return;
    if (!assetsOptions.hasNextPage) return;
    let getPhotos = await MediaLibrary.getAssetsAsync({
      mediaType: ['photo'],
      after: assetsOptions.after,
    });

    updateAssetsOptions(String(parseInt(assetsOptions.after) + 20), getPhotos.hasNextPage);
    setSavedPhotos(savedPhotos.concat(getPhotos.assets.flatMap((value) => [value.uri])));
  };

  const updateAssetsOptions = (after, hasNextPage) => {
    setAssetsOptions({
      after: after,
      hasNextPage: hasNextPage,
    });
  };

  return (
    <View style={styles.photosContainer}>
      {photos.map((photo, index) => (
        <View key={index} style={styles.photosWrapper}>
          <Image source={{ uri: photo }} style={styles.photo} />
        </View>
      ))}
      <View style={styles.photosWrapper}>
        <TouchableOpacity onPress={addImageBtn} style={styles.addBtn}>
          <AntDesign color="grey" name="pluscircleo" size={24} />
        </TouchableOpacity>
      </View>

      <Modal onRequestClose={closeModal} visible={isOpenModal}>
        <FlatList
          data={savedPhotos}
          ListEmptyComponent={<Text>Empty</Text>}
          numColumns={4}
          onEndReached={showMediaLibrary}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => handleSelectPhoto(item)}
              style={styles.modalPhotosWrapper}
            >
              <Image source={{ uri: item }} style={styles.modalPhoto} />
            </TouchableOpacity>
          )}
        />
        <View style={styles.modalBottomMenu}>
          <TouchableOpacity onPress={closeModal} style={styles.modalBottomMenuBtn}>
            <Text>Close</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={applySelectedMedia} style={styles.modalBottomMenuBtn}>
            <Text>Apply</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  addBtn: {
    alignItems: 'center',
    borderColor: 'grey',
    borderRadius: 5,
    borderWidth: 1,
    height: screenWidthSize / 4 - 10,
    justifyContent: 'center',
    width: screenWidthSize / 4 - 10,
  },
  modalBottomMenu: {
    flexDirection: 'row',
    height: 50,
  },
  modalBottomMenuBtn: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  modalPhoto: {
    height: screenWidthSize / 4 - 10,
    width: screenWidthSize / 4 - 10,
  },
  modalPhotosWrapper: {
    height: screenWidthSize / 4,
    padding: 5,
    width: screenWidthSize / 4,
    zIndex: 9,
  },
  photo: {
    height: screenWidthSize / 4 - 10,
    width: screenWidthSize / 4 - 10,
  },
  photosContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  photosWrapper: {
    height: screenWidthSize / 4,
    padding: 5,
    width: screenWidthSize / 4,
  },
});
