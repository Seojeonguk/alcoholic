import { useState } from 'react';
import { Image, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { getDeviceSize, showToast } from '../lib';
import { addPhoto, deletePhoto } from '../redux';
import DeviceGalleryModal from './DeviceGalleryModal';

import { AntDesign, FontAwesome } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import { useDispatch, useSelector } from 'react-redux';

const { width } = getDeviceSize();
const COLUMN_SIZE = 3;
const contentPaddingHorizontal = 25;
const MEDIA_ICON_SIZE = 24;
const MEDIA_ICON_COLOR = 'black';

export default function Photo() {
  const dispatch = useDispatch();
  const photos = useSelector((state) => state.gallery.photos);
  const [visibleDeviceGalleryModal, setVisibleDeviceGalleryModal] = useState(false);
  const [visibleMediaSourceConfirmationModal, setVisibleMediaSourceConfirmationModal] =
    useState(false);

  const hideMediaSourceConfirmationModal = () => {
    setVisibleMediaSourceConfirmationModal(false);
  };

  const showDeviceGallery = async () => {
    const { status } = await MediaLibrary.requestPermissionsAsync(false, ['photo']);
    if (status !== MediaLibrary.PermissionStatus.GRANTED) {
      showToast('error', '사진 접근 권한이 필요해요.', '설정에서 사진 권한을 허용해 주세요.');
      return;
    }
    hideMediaSourceConfirmationModal();
    setVisibleDeviceGalleryModal(true);
  };

  const hideDeviceGalleryModal = () => {
    setVisibleDeviceGalleryModal(false);
  };

  const applySelectedPhotos = (selectedPhotos) => {
    dispatch(addPhoto(selectedPhotos));
    hideDeviceGalleryModal();
  };

  const removePhoto = (index) => {
    dispatch(deletePhoto(index));
  };

  const showCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== ImagePicker.PermissionStatus.GRANTED) {
      showToast('error', '카메라 권한이 필요해요.', '설정에서 카메라 권한을 허용해 주세요.');
      return;
    }
    hideMediaSourceConfirmationModal();
    const result = await ImagePicker.launchCameraAsync();

    if (result.canceled) {
      return;
    }

    dispatch(addPhoto(result.assets[0].uri));
  };

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
        <View key={photo} style={styles.photosWrapper}>
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
                <Text style={styles.typeLabel}>카메라</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.mediaBtn}>
              <TouchableOpacity onPress={showDeviceGallery} style={styles.media}>
                <FontAwesome name="photo" size={MEDIA_ICON_SIZE} color={MEDIA_ICON_COLOR} />
                <Text>갤러리</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <DeviceGalleryModal
        visible={visibleDeviceGalleryModal}
        addedPhotos={photos}
        onClose={hideDeviceGalleryModal}
        onApply={applySelectedPhotos}
      />
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
