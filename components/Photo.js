import { useState, memo } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
} from 'react-native';

import { debounce } from 'lodash';

import { addPhoto, deletePhoto } from '../redux';

import { AntDesign, FontAwesome } from '@expo/vector-icons';
import * as MediaLibrary from 'expo-media-library/legacy';
import { useDispatch, useSelector } from 'react-redux';

import * as ImagePicker from 'expo-image-picker';
import { getDeviceSize } from '../lib';
import TouchableImage from './TouchableImage';

const { width } = getDeviceSize();
const COLUMN_SIZE = 3;
const contentPaddingHorizontal = 25;
const MEDIA_ICON_SIZE = 24;
const MEDIA_ICON_COLOR = 'black';
const LOAD_IMAGE_COUNT = 60;

export default function Photo() {
  const [hasNextPage, setHasNextPage] = useState(true);
  const dispatch = useDispatch();
  const [visibleDeviceGalleryModal, setVisibleDeviceGalleryModal] = useState(false);
  const photos = useSelector((state) => state.gallery.photos);
  const [deviceStoredPhotos, setDeviceStoredPhotos] = useState([]);
  const [selectedPhotos, setSelectedPhotos] = useState([]);
  const [visibleMediaSourceConfirmationModal, setVisibleMediaSourceConfirmationModal] =
    useState(false);
  const [loading, setLoading] = useState(false);

  const [lastAsset, setLastAsset] = useState(null);

  const hideMediaSourceConfirmationModal = () => {
    setVisibleMediaSourceConfirmationModal(false);
  };

  const showDeviceGallery = async () => {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== MediaLibrary.PermissionStatus.GRANTED) {
      return;
    }
    setVisibleMediaSourceConfirmationModal(false);
    await showMediaLibrary();
    setVisibleDeviceGalleryModal(true);
  };

  const applySelectedMedia = () => {
    dispatch(addPhoto(selectedPhotos));
    setSelectedPhotos([]);
    hideDeviceGalleryModal();
  };

  const hideDeviceGalleryModal = () => {
    setVisibleDeviceGalleryModal(false);
  };

  const handleSelectPhoto = (photo) => {
    setSelectedPhotos(selectedPhotos.concat(photo));
  };

  const showMediaLibrary = async () => {
    setLoading(true);
    if (!hasNextPage) {
      setLoading(false);
      return;
    }
    const getPhotos = await MediaLibrary.getAssetsAsync({
      mediaType: ['photo'],
      after: lastAsset,
      sortBy: ['creationTime'],
      first: LOAD_IMAGE_COUNT,
    });

    setHasNextPage(getPhotos.hasNextPage);
    setLastAsset(getPhotos.endCursor);

    setDeviceStoredPhotos((prevDeviceStoredPhotos) => [
      ...prevDeviceStoredPhotos,
      ...getPhotos.assets.map((asset) => asset.uri),
    ]);
  };

  const removePhoto = (index) => {
    dispatch(deletePhoto(index));
  };

  const showCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== ImagePicker.PermissionStatus.GRANTED) {
      return;
    }
    hideMediaSourceConfirmationModal();
    const result = await ImagePicker.launchCameraAsync();

    if (result.canceled) {
      return;
    }

    dispatch(addPhoto(result.assets[0].uri));
  };

  const debouncedLoadMoreImages = debounce(showMediaLibrary, 1000);

  return (
    <View style={styles.photosContainer}>
      <View style={styles.photosWrapper}>
        <TouchableOpacity
          onPress={() => setVisibleMediaSourceConfirmationModal(true)}
          style={styles.addBtn}
        >
          <AntDesign color="grey" name="plus-circle" size={24} />
        </TouchableOpacity>
      </View>

      {photos.map((photo, index) => (
        <View key={index} style={styles.photosWrapper}>
          <Image source={{ uri: photo }} style={styles.photo} />
          <TouchableOpacity style={styles.removeBtnWrap} onPress={() => removePhoto(index)}>
            <View style={styles.removeBtn}>
              <AntDesign name="minus" size={15} color="red" />
            </View>
          </TouchableOpacity>
        </View>
      ))}

      <Modal
        transparent={true}
        visible={visibleMediaSourceConfirmationModal}
        onRequestClose={hideMediaSourceConfirmationModal}
      >
        <View style={styles.mediaSourceConfirmationModal}>
          <TouchableOpacity
            style={styles.modalEmptySpace}
            onPress={hideMediaSourceConfirmationModal}
          />
          <View style={styles.mediaSourceConfirmationModalBtnWrap}>
            <View style={styles.mediaBtn}>
              <TouchableOpacity onPress={showCamera} style={styles.media}>
                <FontAwesome name="camera-retro" size={MEDIA_ICON_SIZE} color={MEDIA_ICON_COLOR} />
                <Text style={styles.typeLabel}>Camera</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.mediaBtn}>
              <TouchableOpacity onPress={showDeviceGallery} style={styles.media}>
                <FontAwesome name="photo" size={MEDIA_ICON_SIZE} color={MEDIA_ICON_COLOR} />
                <Text>Gallery</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal onRequestClose={hideDeviceGalleryModal} visible={visibleDeviceGalleryModal}>
        <FlatList
          data={deviceStoredPhotos}
          keyExtractor={(item, index) => index.toString()}
          ListEmptyComponent={
            <Text style={{ textAlign: 'center', padding: 10 }}>
              There is no photo in your gallery.
            </Text>
          }
          numColumns={COLUMN_SIZE}
          onEndReached={debouncedLoadMoreImages}
          onEndReachedThreshold={0.5}
          disableVirtualization={false}
          removeClippedSubviews={true}
          ListFooterComponent={
            loading && <ActivityIndicator size={'large'} style={{ marginVertical: 10 }} />
          }
          maxToRenderPerBatch={LOAD_IMAGE_COUNT}
          getItemLayout={(data, index) => ({
            length: width / COLUMN_SIZE,
            offset: (width / COLUMN_SIZE) * index,
            index,
          })}
          renderItem={({ item, index }) => (
            <TouchableImage
              onPress={() => handleSelectPhoto(item)}
              style={[styles.deviceStoredPhotoWrap, { marginHorizontal: index % 3 === 1 ? 1 : 0 }]}
              uri={item}
            />
          )}
        />
        <View style={styles.modalMenu}>
          <TouchableOpacity onPress={hideDeviceGalleryModal} style={styles.modalMenuBtn}>
            <Text>Close</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={applySelectedMedia} style={styles.modalMenuBtn}>
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
    height: '100%',
    justifyContent: 'center',
    width: '100%',
  },
  modalMenu: {
    flexDirection: 'row',
    height: 50,
  },
  modalMenuBtn: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    borderTopWidth: 1,
    borderColor: 'grey',
  },
  deviceStoredPhoto: {
    flex: 1,
  },
  deviceStoredPhotoWrap: {
    height: width / COLUMN_SIZE,
    width: width / COLUMN_SIZE,
    marginBottom: 1,
  },
  photo: {
    height: '100%',
    width: '100%',
    resizeMode: 'stretch',
    borderRadius: 10,
    borderColor: 'grey',
    borderWidth: 1,
  },
  photosContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  photosWrapper: {
    height: width / COLUMN_SIZE - 2 * contentPaddingHorizontal,
    padding: 1,
    width: width / COLUMN_SIZE - 2 * contentPaddingHorizontal,
  },
  removeBtnWrap: {
    position: 'absolute',
    right: 0,
    top: 0,
  },
  removeBtn: {
    borderRadius: 100,
    padding: 5,
    backgroundColor: 'white',
    borderColor: 'grey',
    borderWidth: 1,
  },
  mediaSourceConfirmationModal: {
    flex: 1,
    justifyContent: 'center',
  },
  mediaBtn: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  mediaSourceConfirmationModalBtnWrap: {
    flexDirection: 'row',
  },
  modalEmptySpace: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    flex: 1,
  },
  media: {
    borderRadius: 50,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
