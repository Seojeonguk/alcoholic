import { StyleSheet } from 'react-native';

import { NAVIGATOR } from '../constants';
import { PressableScale } from './ui';

import { Image } from 'expo-image';

// 갤러리의 사진 한 칸. 크기는 갤러리가 화면 너비로 계산해서 넘김
export default function Post({ item, navigation, size }) {
  const { presentivePhoto, docId } = item;

  return (
    <PressableScale onPress={() => navigation.navigate(NAVIGATOR.DETAILS, { docId })}>
      <Image
        cachePolicy="memory-disk"
        contentFit="cover"
        // FlatList가 칸을 재사용할 때 이전 글의 사진이 잠깐 보이지 않게 함
        recyclingKey={docId}
        source={{ uri: presentivePhoto }}
        style={[styles.photo, { height: size, width: size }]}
        transition={150}
      />
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  photo: {
    borderRadius: 12,
  },
});
