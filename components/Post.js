import { Dimensions, Image, StyleSheet, TouchableOpacity } from 'react-native';

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
        source={{ uri: presentivePhoto }}
        style={[
          styles.itemPhoto,
          {
            height: imgSize,
            marginHorizontal: isMiddle ? GAP : 0,
            width: imgSize,
          },
        ]}
        resizeMode="stretch"
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  itemPhoto: {
    marginBottom: GAP,
    resizeMode: 'stretch',
  },
});
