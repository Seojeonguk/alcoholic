import { useState } from 'react';
import { Alert, ScrollView, Text, View } from 'react-native';

import { POST_LIMITS } from '../constants';
import { getPhotoMoves, movePhoto, showToast, makeStyles, useColors } from '../lib';
import { addPhoto, deletePhoto, updatePhotos } from '../redux';
import { usePostForm } from './PostForm';
import { BottomSheet, PressableScale } from './ui';

import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';

const PHOTO_SIZE = 64;

// 맨 앞 + 칸과 고른 사진 미리보기를 가로로 보여 줌
// 사진을 누르면 순서를 바꾸는 시트가 열림. 첫 사진이 갤러리 썸네일(대표 사진)이에요(#332)
export default function Photo() {
  const colors = useColors();
  const styles = useStyles();
  const {
    form: { photos },
    dispatch,
  } = usePostForm();
  const remaining = POST_LIMITS.PHOTOS - photos.length;
  // 시트에서 고친 사진의 순서(0부터). 닫혀 있으면 null
  const [selected, setSelected] = useState(null);
  const moves = selected === null ? [] : getPhotoMoves(selected, photos.length);

  const closeSheet = () => setSelected(null);

  const move = (to) => {
    dispatch(updatePhotos(movePhoto(photos, selected, to)));
    closeSheet();
  };

  const removeSelected = () => {
    dispatch(deletePhoto(selected));
    closeSheet();
  };

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
    <>
      <ScrollView
        contentContainerStyle={styles.list}
        horizontal
        keyboardShouldPersistTaps="handled"
        showsHorizontalScrollIndicator={false}
        style={styles.container}
      >
        <PressableScale
          accessibilityLabel="사진 추가"
          accessibilityRole="button"
          onPress={chooseSource}
          style={styles.addBtn}
        >
          <Ionicons color={colors.TEXT_SUB} name="add" size={28} />
        </PressableScale>

        {photos.map((photo, index) => (
          <View key={photo}>
            <PressableScale
              accessibilityHint="순서를 바꾸거나 뺄 수 있어요"
              accessibilityLabel={`${index + 1}번째 사진${index === 0 ? ', 대표 사진' : ''}`}
              accessibilityRole="button"
              onPress={() => setSelected(index)}
            >
              <Image contentFit="cover" source={{ uri: photo }} style={styles.photo} />
              {index === 0 && photos.length > 1 ? (
                <View style={styles.coverBadge}>
                  <Text style={styles.coverText}>대표</Text>
                </View>
              ) : null}
            </PressableScale>
            <PressableScale
              accessibilityLabel={`${index + 1}번째 사진 빼기`}
              accessibilityRole="button"
              hitSlop={8}
              onPress={() => dispatch(deletePhoto(index))}
              style={styles.removeBtn}
            >
              <Ionicons color={colors.ON_PHOTO} name="close" size={12} />
            </PressableScale>
          </View>
        ))}
      </ScrollView>

      <BottomSheet
        onClose={closeSheet}
        title={selected === null ? '' : `사진 ${selected + 1}/${photos.length}`}
        visible={selected !== null}
      >
        {moves.map(({ key, label, to }) => (
          <PressableScale
            accessibilityRole="button"
            key={key}
            onPress={() => move(to)}
            style={styles.sheetRow}
          >
            <Text style={styles.sheetText}>{label}</Text>
          </PressableScale>
        ))}
        <PressableScale accessibilityRole="button" onPress={removeSelected} style={styles.sheetRow}>
          <Text style={[styles.sheetText, styles.dangerText]}>빼기</Text>
        </PressableScale>
      </BottomSheet>
    </>
  );
}

const useStyles = makeStyles((colors) => ({
  addBtn: {
    alignItems: 'center',
    backgroundColor: colors.FILL,
    borderRadius: 12,
    height: PHOTO_SIZE,
    justifyContent: 'center',
    width: PHOTO_SIZE,
  },
  // 화면 좌우 여백까지 가로 스크롤되게 넓힘
  container: {
    marginHorizontal: -20,
  },
  coverBadge: {
    backgroundColor: colors.PHOTO_BADGE,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    bottom: 0,
    left: 0,
    paddingVertical: 2,
    position: 'absolute',
    right: 0,
  },
  coverText: {
    color: colors.ON_PHOTO,
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
  dangerText: {
    color: colors.DANGER,
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
    backgroundColor: colors.PHOTO_BADGE,
    borderRadius: 10,
    height: 20,
    justifyContent: 'center',
    position: 'absolute',
    right: -6,
    top: -6,
    width: 20,
  },
  sheetRow: {
    paddingVertical: 14,
  },
  sheetText: {
    color: colors.TEXT,
    fontSize: 15,
  },
}));
