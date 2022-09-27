import { Image, Text, TouchableOpacity, View } from 'react-native';
import { styles } from './styles/GalleryCardStyles';
import { useMemo } from 'react';

export default function GalleryCard({ item }) {
  const height = useMemo(() => Math.floor(Math.random() * 100 + 200));

  return (
    <View>
      <TouchableOpacity activeOpacity={0.2}>
        <Image
          source={{ uri: item.photos[0] }}
          style={[
            {
              height: height,
            },
            styles.itemImage,
          ]}
          resizeMode="stretch"
        />
      </TouchableOpacity>
    </View>
  );
}