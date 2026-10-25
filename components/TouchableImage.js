import { TouchableOpacity } from 'react-native';

import React, { memo, useCallback } from 'react';

import { Image } from 'expo-image';

const TouchableImage = ({ onPress, style, uri }) => {
  const handleonPress = useCallback(() => {
    onPress();
  }, [onPress]);
  return (
    <TouchableOpacity onPress={handleonPress} style={style}>
      <Image source={{ uri: uri }} cachePolicy="memory" contentFit="cover" style={{ flex: 1 }} />
    </TouchableOpacity>
  );
};

export default memo(TouchableImage);
