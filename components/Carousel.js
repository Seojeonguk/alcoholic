import React, { useState } from 'react';
import { Dimensions, FlatList, Image, View } from 'react-native';
import Indicator from './Indicator';

export default function Carousel({ height, data, offset, gap, isIndicator }) {
  const [index, setIndex] = useState(0);

  const screenWidth = Dimensions.get('window').width;
  const width = screenWidth - (gap + offset) * 2;

  const renderItem = ({ item }) => {
    return (
      <View style={{ width: width, marginHorizontal: gap / 2 }}>
        <Image
          source={{ uri: item }}
          style={{ height: '100%', resizeMode: 'stretch', marginHorizontal: gap / 2 }}
        />
      </View>
    );
  };

  const ListEmptyComponent = () => {
    const DEFAULT_PHOTO_URI =
      'https://firebasestorage.googleapis.com/v0/b/alcoholic-a9f86.appspot.com/o/default.jfif?alt=media&token=18e253aa-6a28-4a68-9823-eaf0726b6830';
    return (
      <View style={{ width: width }}>
        <Image
          source={{ uri: DEFAULT_PHOTO_URI }}
          style={{ height: '100%', resizeMode: 'stretch' }}
        />
      </View>
    );
  };

  const scrollEnd = (e) => {
    const changedIndex = Math.round(e.nativeEvent.contentOffset.x / (width + gap));
    setIndex(changedIndex);
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
        renderItem={renderItem}
        snapToInterval={width + gap}
        snapToAlignment="start"
        showsHorizontalScrollIndicator={false}
        ListEmptyComponent={ListEmptyComponent}
      />
      {isIndicator && <Indicator length={data.length || 1} index={index} />}
    </View>
  );
}
