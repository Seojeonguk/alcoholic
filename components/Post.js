import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { DEFAULT_PHOTO, NAVIGATOR } from '../constants';
import { PressableScale, Skeleton } from './ui';

import { Image } from 'expo-image';

// 갤러리의 사진 한 칸. 크기는 갤러리가 화면 너비로 계산해서 넘김
export default function Post({ item, navigation, size }) {
  const { presentivePhoto, docId } = item;
  // 사진을 다 받기 전까지 회색 자리 표시를 보여 줌. 캐시에 있는 사진은 바로 떠서 새 기록만 보임
  const [isPhotoLoaded, setIsPhotoLoaded] = useState(false);

  return (
    <PressableScale onPress={() => navigation.navigate(NAVIGATOR.DETAILS, { docId })}>
      <View style={{ height: size, width: size }}>
        {!isPhotoLoaded && <Skeleton height={size} style={styles.placeholder} width={size} />}
        <Image
          cachePolicy="memory-disk"
          contentFit="cover"
          // 사진을 받지 못해도 자리 표시가 계속 깜빡이지 않게 함
          onError={() => setIsPhotoLoaded(true)}
          onLoad={() => setIsPhotoLoaded(true)}
          // FlatList가 칸을 재사용할 때 이전 글의 사진이 잠깐 보이지 않게 함
          recyclingKey={docId}
          source={presentivePhoto ? { uri: presentivePhoto } : DEFAULT_PHOTO}
          style={[styles.photo, { height: size, width: size }]}
          transition={150}
        />
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  photo: {
    borderRadius: 12,
  },
  placeholder: {
    position: 'absolute',
  },
});
