import { memo, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';

import Indicator from './Indicator';

import { Image } from 'expo-image';

const DEFAULT_PHOTO_URI =
  'https://firebasestorage.googleapis.com/v0/b/alcoholic-a9f86.appspot.com/o/default.jfif?alt=media&token=18e253aa-6a28-4a68-9823-eaf0726b6830';

// 정사각형 사진을 한 장씩 넘기고, 아래쪽 가운데에 점으로 위치를 보여 줌
function Carousel({ data, size }) {
  const [index, setIndex] = useState(0);
  // 사진이 없는 예전 글은 기본 사진을 보여 줌
  const photos = data?.length > 0 ? data : [DEFAULT_PHOTO_URI];

  const scrollEnd = (e) => {
    setIndex(Math.round(e.nativeEvent.contentOffset.x / size));
  };

  return (
    <View style={{ height: size, width: size }}>
      <FlatList
        data={photos}
        horizontal
        keyExtractor={(item, i) => `page_${i}_${item}`}
        onMomentumScrollEnd={scrollEnd}
        pagingEnabled
        renderItem={({ item }) => (
          <Image
            cachePolicy="memory-disk"
            contentFit="cover"
            source={{ uri: item }}
            style={{ height: size, width: size }}
            transition={150}
          />
        )}
        showsHorizontalScrollIndicator={false}
      />
      {photos.length > 1 && (
        <View pointerEvents="none" style={styles.indicator}>
          <Indicator index={index} length={photos.length} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  indicator: {
    bottom: 12,
    left: 0,
    position: 'absolute',
    right: 0,
  },
});

export default memo(Carousel);
