import { StyleSheet, Text, View } from 'react-native';

import React, { memo, useCallback } from 'react';

import { COLORS } from '../constants';
import TouchableImage from './TouchableImage';

// selectedOrder: 선택한 순서(1부터), 선택하지 않았으면 0
const SelectablePhoto = ({ uri, selectedOrder, isAdded, onToggle, style }) => {
  const handlePress = useCallback(() => {
    if (isAdded) {
      return;
    }
    onToggle(uri);
  }, [isAdded, onToggle, uri]);

  return (
    <View style={style}>
      <TouchableImage onPress={handlePress} style={styles.image} uri={uri} />

      {selectedOrder > 0 && (
        <View pointerEvents="none" style={styles.selectedOverlay}>
          <View style={styles.orderBadge}>
            <Text style={styles.orderText}>{selectedOrder}</Text>
          </View>
        </View>
      )}

      {isAdded && (
        <View pointerEvents="none" style={styles.addedOverlay}>
          <Text style={styles.addedText}>추가됨</Text>
        </View>
      )}
    </View>
  );
};

export default memo(SelectablePhoto);

const styles = StyleSheet.create({
  image: {
    flex: 1,
  },
  selectedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderColor: COLORS.SECOND_SUB_COLOR,
    borderWidth: 3,
  },
  orderBadge: {
    alignItems: 'center',
    backgroundColor: COLORS.SECOND_SUB_COLOR,
    borderColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    height: 24,
    justifyContent: 'center',
    position: 'absolute',
    right: 5,
    top: 5,
    width: 24,
  },
  orderText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  addedOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
  },
  addedText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
