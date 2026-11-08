import { memo, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';

import Indicator from './Indicator';
import { getPhotoLabel, useDefaultPhoto } from '../lib';

import { Image } from 'expo-image';

// 정사각형 사진을 한 장씩 넘기고, 아래쪽 가운데에 점으로 위치를 보여 줌
// onIndexChange: 넘긴 사진의 순서를 알려 줌(상세 화면의 사진 공유, #344)
function Carousel({ data, size, onIndexChange }) {
  const [index, setIndex] = useState(0);
  const defaultPhoto = useDefaultPhoto();
  // 사진이 없는 글은 앱 안의 기본 사진을 보여 줌
  const photos = data?.length > 0 ? data.map((uri) => ({ uri })) : [defaultPhoto];

  const scrollEnd = (e) => {
    const next = Math.round(e.nativeEvent.contentOffset.x / size);
    setIndex(next);
    onIndexChange?.(next);
  };

  return (
    <View style={{ height: size, width: size }}>
      <FlatList
        data={photos}
        horizontal
        keyExtractor={(item, i) => `page_${i}_${item.uri ?? 'default'}`}
        onMomentumScrollEnd={scrollEnd}
        pagingEnabled
        renderItem={({ item, index: i }) => (
          <Image
            // 사진이 여러 장이면 몇 번째인지 읽어 줌(#330). 기본 사진 한 장일 때도 '사진 1/1'
            accessibilityLabel={getPhotoLabel(i, photos.length)}
            accessible
            cachePolicy="memory-disk"
            contentFit="cover"
            source={item}
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
