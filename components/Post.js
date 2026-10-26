import { Dimensions, StyleSheet, TouchableOpacity } from 'react-native';

import { Image } from 'expo-image';

const COLUMN_SIZE = 3;
const GAP = 2;

export default function Post({ item, isMiddle, navigation }) {
  const { presentivePhoto, docId } = item;
  const { width } = Dimensions.get('window');
  // 네트워크 이미지는 크기를 직접 정해야 보임. 한 줄에 3개, 가운데 칸 양옆 간격을 뺀 정사각형
  const imgSize = (width - GAP * 2) / COLUMN_SIZE;

  const movedetial = () => {
    navigation.navigate('Details', { docId: docId });
  };

  return (
    <TouchableOpacity activeOpacity={0.2} onPress={movedetial}>
      <Image
        cachePolicy="memory-disk"
        contentFit="cover"
        // FlatList가 칸을 재사용할 때 이전 글의 사진이 잠깐 보이지 않게 함
        recyclingKey={docId}
        source={{ uri: presentivePhoto }}
        style={[
          styles.itemPhoto,
          {
            height: imgSize,
            marginHorizontal: isMiddle ? GAP : 0,
            width: imgSize,
          },
        ]}
        transition={150}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  itemPhoto: {
    marginBottom: GAP,
  },
});
