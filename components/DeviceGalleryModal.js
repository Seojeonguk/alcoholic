import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { COLORS } from '../constants';
import { getDeviceSize, showToast } from '../lib';
import SelectablePhoto from './SelectablePhoto';

import { AntDesign } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { AssetField, MediaType, Query } from 'expo-media-library';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = getDeviceSize();
const COLUMN_SIZE = 3;
const PHOTO_GAP = 1;
const PHOTO_SIZE = (width - (COLUMN_SIZE - 1) * PHOTO_GAP) / COLUMN_SIZE;
const LOAD_IMAGE_COUNT = 60;
const SELECTED_THUMBNAIL_SIZE = 60;

export default function DeviceGalleryModal({ visible, addedPhotos, onClose, onApply }) {
  const [devicePhotos, setDevicePhotos] = useState([]);
  const [selectedPhotos, setSelectedPhotos] = useState([]);
  const [loading, setLoading] = useState(false);

  const offsetRef = useRef(0);
  const hasNextPageRef = useRef(true);
  const loadingRef = useRef(false);
  // 모달을 다시 열었을 때 이전에 시작한 불러오기 결과를 버리기 위한 값
  const loadGenerationRef = useRef(0);

  const loadPhotos = useCallback(async () => {
    if (loadingRef.current || !hasNextPageRef.current) {
      return;
    }
    const generation = loadGenerationRef.current;
    loadingRef.current = true;
    setLoading(true);

    try {
      const assets = await new Query()
        .eq(AssetField.MEDIA_TYPE, MediaType.IMAGE)
        .orderBy({ key: AssetField.CREATION_TIME, ascending: false })
        .limit(LOAD_IMAGE_COUNT)
        .offset(offsetRef.current)
        .exe();
      const uris = await Promise.all(assets.map((asset) => asset.getUri()));

      if (generation !== loadGenerationRef.current) {
        return;
      }
      offsetRef.current += assets.length;
      hasNextPageRef.current = assets.length === LOAD_IMAGE_COUNT;
      setDevicePhotos((prevDevicePhotos) => [...prevDevicePhotos, ...uris]);
    } catch (e) {
      showToast('error', '사진을 불러오지 못했어요.', '잠시 후 다시 시도해 주세요.');
    } finally {
      if (generation === loadGenerationRef.current) {
        loadingRef.current = false;
        setLoading(false);
      }
    }
  }, []);

  // 열 때마다 처음부터 다시 불러와서 새로 찍은 사진도 보이게 함
  useEffect(() => {
    if (!visible) {
      return;
    }
    loadGenerationRef.current += 1;
    loadingRef.current = false;
    offsetRef.current = 0;
    hasNextPageRef.current = true;
    setDevicePhotos([]);
    setSelectedPhotos([]);
    loadPhotos();
  }, [visible, loadPhotos]);

  const toggleSelectPhoto = useCallback((uri) => {
    setSelectedPhotos((prevSelectedPhotos) =>
      prevSelectedPhotos.includes(uri)
        ? prevSelectedPhotos.filter((photo) => photo !== uri)
        : [...prevSelectedPhotos, uri]
    );
  }, []);

  const close = () => {
    setSelectedPhotos([]);
    onClose();
  };

  const apply = () => {
    onApply(selectedPhotos);
    setSelectedPhotos([]);
  };

  const renderItem = useCallback(
    ({ item, index }) => (
      <SelectablePhoto
        uri={item}
        selectedOrder={selectedPhotos.indexOf(item) + 1}
        isAdded={addedPhotos.includes(item)}
        onToggle={toggleSelectPhoto}
        style={index % COLUMN_SIZE === 1 ? styles.middleDevicePhotoWrap : styles.devicePhotoWrap}
      />
    ),
    [selectedPhotos, addedPhotos, toggleSelectPhoto]
  );

  return (
    <Modal animationType="slide" onRequestClose={close} visible={visible}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>사진 선택</Text>
          <Text style={styles.headerCount}>{selectedPhotos.length}장 선택</Text>
        </View>

        <FlatList
          data={devicePhotos}
          keyExtractor={(item) => item}
          extraData={selectedPhotos}
          ListEmptyComponent={
            !loading && <Text style={styles.emptyText}>갤러리에 사진이 없어요.</Text>
          }
          numColumns={COLUMN_SIZE}
          onEndReached={loadPhotos}
          onEndReachedThreshold={0.5}
          removeClippedSubviews={true}
          ListFooterComponent={
            loading && <ActivityIndicator size={'large'} style={styles.loadingIndicator} />
          }
          maxToRenderPerBatch={LOAD_IMAGE_COUNT}
          getItemLayout={(data, index) => ({
            length: PHOTO_SIZE + PHOTO_GAP,
            offset: (PHOTO_SIZE + PHOTO_GAP) * index,
            index,
          })}
          renderItem={renderItem}
        />

        {selectedPhotos.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.selectedPhotos}
            contentContainerStyle={styles.selectedPhotosContent}
          >
            {selectedPhotos.map((photo) => (
              <TouchableOpacity
                key={photo}
                onPress={() => toggleSelectPhoto(photo)}
                style={styles.selectedPhotoWrap}
              >
                <Image source={{ uri: photo }} cachePolicy="memory" style={styles.selectedPhoto} />
                <View style={styles.deselectBtn}>
                  <AntDesign name="close" size={10} color="white" />
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        <View style={styles.modalMenu}>
          <TouchableOpacity onPress={close} style={styles.modalMenuBtn}>
            <Text>닫기</Text>
          </TouchableOpacity>
          <TouchableOpacity
            disabled={selectedPhotos.length === 0}
            onPress={apply}
            style={styles.modalMenuBtn}
          >
            <Text style={selectedPhotos.length === 0 && styles.disabledText}>
              {selectedPhotos.length > 0 ? `${selectedPhotos.length}장 추가` : '추가'}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    flex: 1,
  },
  header: {
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: COLORS.BORDER_COLOR,
    flexDirection: 'row',
    height: 50,
    justifyContent: 'space-between',
    paddingHorizontal: 15,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  headerCount: {
    color: COLORS.SECOND_SUB_COLOR,
  },
  emptyText: {
    padding: 10,
    textAlign: 'center',
  },
  loadingIndicator: {
    marginVertical: 10,
  },
  devicePhotoWrap: {
    height: PHOTO_SIZE,
    marginBottom: PHOTO_GAP,
    width: PHOTO_SIZE,
  },
  middleDevicePhotoWrap: {
    height: PHOTO_SIZE,
    marginBottom: PHOTO_GAP,
    marginHorizontal: PHOTO_GAP,
    width: PHOTO_SIZE,
  },
  selectedPhotos: {
    borderColor: 'grey',
    borderTopWidth: 1,
    flexGrow: 0,
  },
  selectedPhotosContent: {
    padding: 8,
  },
  selectedPhotoWrap: {
    height: SELECTED_THUMBNAIL_SIZE,
    marginRight: 8,
    width: SELECTED_THUMBNAIL_SIZE,
  },
  selectedPhoto: {
    borderRadius: 5,
    flex: 1,
  },
  deselectBtn: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 9,
    height: 18,
    justifyContent: 'center',
    position: 'absolute',
    right: 2,
    top: 2,
    width: 18,
  },
  modalMenu: {
    flexDirection: 'row',
    height: 50,
  },
  modalMenuBtn: {
    alignItems: 'center',
    borderColor: 'grey',
    borderTopWidth: 1,
    flex: 1,
    justifyContent: 'center',
  },
  disabledText: {
    color: 'grey',
  },
});
