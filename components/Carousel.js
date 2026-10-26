import React, { memo, useState } from 'react';
import { Dimensions, FlatList, View } from 'react-native';
import Indicator from './Indicator';

import { Image } from 'expo-image';

const RenderItem = memo(({ item, gap, width }) => {
  return (
    <View style={{ width: width, marginHorizontal: gap / 2 }}>
      <Image
        cachePolicy="memory-disk"
        contentFit="cover"
        source={{ uri: item }}
        style={{ height: '100%', marginHorizontal: gap / 2 }}
        transition={150}
      />
    </View>
  );
});

const ListEmptyComponent = ({ width }) => {
  const DEFAULT_PHOTO_URI =
    'https://firebasestorage.googleapis.com/v0/b/alcoholic-a9f86.appspot.com/o/default.jfif?alt=media&token=18e253aa-6a28-4a68-9823-eaf0726b6830';
  return (
    <View style={{ width: width }}>
      <Image
        cachePolicy="memory-disk"
        contentFit="cover"
        source={{ uri: DEFAULT_PHOTO_URI }}
        style={{ height: '100%' }}
      />
    </View>
  );
};

function Carousel({ height, data, offset, gap, isIndicator }) {
  const [index, setIndex] = useState(0);

  const screenWidth = Dimensions.get('window').width;
  const width = screenWidth - (gap + offset) * 2;

  const scrollEnd = (e) => {
    const changedIndex = Math.round(e.nativeEvent.contentOffset.x / (width + gap));
    if (index != changedIndex) {
      setIndex(changedIndex);
    }
  };

  return (
    <View style={{ height: height }}>
      <FlatList
        automaticallyAdjustContentInsets={false}
        contentContainerStyle={{
          paddingHorizontal: offset + gap / 2,
        }}
        data={data}
        decelerationRate="fast"
        disableIntervalMomentum
        disableVirtualization={false}
        extraData={data}
        horizontal
        initialNumToRender={data.length}
        keyExtractor={(item) => `page__${item}`}
        onMomentumScrollEnd={scrollEnd}
        pagingEnabled
        renderItem={({ item }) => <RenderItem item={item} gap={gap} width={width} />}
        snapToInterval={width + gap}
        snapToAlignment="start"
        showsHorizontalScrollIndicator={false}
        ListEmptyComponent={() => <ListEmptyComponent width={width} />}
      />
      {isIndicator && <Indicator length={data.length || 1} index={index} />}
    </View>
  );
}

export default memo(Carousel);
