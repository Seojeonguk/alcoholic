import { Alert, ScrollView, StyleSheet, View } from 'react-native';

import { COLORS, POST_LIMITS } from '../constants';
import { showToast } from '../lib';
import { addPhoto, deletePhoto } from '../redux';
import { PressableScale } from './ui';

import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useDispatch, useSelector } from 'react-redux';

const PHOTO_SIZE = 64;

// 맨 앞 + 칸과 고른 사진 미리보기를 가로로 보여 줌
export default function Photo() {
  const dispatch = useDispatch();
  const photos = useSelector((state) => state.gallery.photos);
  const remaining = POST_LIMITS.PHOTOS - photos.length;

  const showLimitToast = () => {
    showToast('info', `사진은 ${POST_LIMITS.PHOTOS}장까지 넣을 수 있어요.`);
  };

  // 시스템 사진 선택기를 써서 사진 권한 없이 고른 사진만 받아옴
  const showDeviceGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: true,
        orderedSelection: true,
        selectionLimit: remaining,
      });

      if (result.canceled) {
        return;
      }

      // selectionLimit을 지원하지 않는 기기도 있어서 남은 장수만큼만 넣음
      if (result.assets.length > remaining) {
        showLimitToast();
      }
      dispatch(addPhoto(result.assets.slice(0, remaining).map((asset) => asset.uri)));
    } catch {
      showToast('error', '사진을 불러오지 못했어요.', '잠시 후 다시 시도해 주세요.');
    }
  };

  const showCamera = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== ImagePicker.PermissionStatus.GRANTED) {
        showToast('error', '카메라 권한이 필요해요.', '설정에서 카메라 권한을 허용해 주세요.');
        return;
      }
      const result = await ImagePicker.launchCameraAsync();

      if (result.canceled) {
        return;
      }

      dispatch(addPhoto(result.assets[0].uri));
    } catch {
      showToast('error', '카메라를 열지 못했어요.', '잠시 후 다시 시도해 주세요.');
    }
  };

  const chooseSource = () => {
    if (remaining <= 0) {
      showLimitToast();
      return;
    }
    Alert.alert('사진 추가', undefined, [
      { text: '취소', style: 'cancel' },
      { text: '카메라', onPress: showCamera },
      { text: '앨범에서 고르기', onPress: showDeviceGallery },
    ]);
  };

  return (
    <ScrollView
      contentContainerStyle={styles.list}
      horizontal
      keyboardShouldPersistTaps="handled"
      showsHorizontalScrollIndicator={false}
      style={styles.container}
    >
      <PressableScale accessibilityLabel="사진 추가" onPress={chooseSource} style={styles.addBtn}>
        <Ionicons color={COLORS.TEXT_SUB} name="add" size={28} />
      </PressableScale>

      {photos.map((photo, index) => (
        <View key={photo}>
          <Image contentFit="cover" source={{ uri: photo }} style={styles.photo} />
          <PressableScale
            accessibilityLabel={`${index + 1}번째 사진 빼기`}
            hitSlop={8}
            onPress={() => dispatch(deletePhoto(index))}
            style={styles.removeBtn}
          >
            <Ionicons color="#FFFFFF" name="close" size={12} />
          </PressableScale>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  addBtn: {
    alignItems: 'center',
    backgroundColor: COLORS.FILL,
    borderRadius: 12,
    height: PHOTO_SIZE,
    justifyContent: 'center',
    width: PHOTO_SIZE,
  },
  // 화면 좌우 여백까지 가로 스크롤되게 넓힘
  container: {
    marginHorizontal: -20,
  },
  // 삭제 버튼이 사진 밖으로 조금 나와도 잘리지 않게 위쪽 여백을 둠
  list: {
    gap: 10,
    paddingBottom: 8,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  photo: {
    borderRadius: 12,
    height: PHOTO_SIZE,
    width: PHOTO_SIZE,
  },
  removeBtn: {
    alignItems: 'center',
    backgroundColor: 'rgba(25, 31, 40, 0.7)',
    borderRadius: 10,
    height: 20,
    justifyContent: 'center',
    position: 'absolute',
    right: -6,
    top: -6,
    width: 20,
  },
});
