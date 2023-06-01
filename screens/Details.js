import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Carousel, Header } from '../components';
import { COLORS, NAVIGATOR } from '../constants';
import { updateGallery } from '../redux';

import { FontAwesome5 } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch } from 'react-redux';

export default function Details({ navigation, route }) {
  const DEFAULT_NUMBER_OF_LINES = 3;
  const [numberOfLines, setNumberOfLines] = useState(DEFAULT_NUMBER_OF_LINES);
  const { post, docId } = route.params;
  const { title, location, day, content, tags, photos } = post;

  const dispatch = useDispatch();

  const toggleTruncate = () => {
    const newNumberOfLines =
      numberOfLines === DEFAULT_NUMBER_OF_LINES ? 0 : DEFAULT_NUMBER_OF_LINES;
    setNumberOfLines(newNumberOfLines);
  };

  const onPressRight = () => {
    const currentPostInfo = {
      title: title,
      location: location,
      day: day,
      content: content,
      tags: tags,
      photos: photos,
    };
    dispatch(updateGallery(currentPostInfo));
    navigation.navigate(NAVIGATOR.GALLERY_FORM, docId);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header
        visibleLeftIcon={true}
        visibleRightIcon={true}
        leftIconName={'arrow-back'}
        rightIconName={'pencil-sharp'}
        onPressLeft={() => navigation.goBack()}
        onPressRight={onPressRight}
        iconSize={24}
      />

      <ScrollView>
        <Carousel height={300} data={photos} offset={0} gap={0} isIndicator={true} />

        <View style={styles.contentWrap}>
          <Text style={styles.title}>{title}</Text>

          {location && (
            <View style={styles.locationWrap}>
              <FontAwesome5
                name="map-marker-alt"
                size={13}
                color="gray"
                style={styles.locationIcon}
              />
              <Text style={styles.location}>{location}</Text>
            </View>
          )}

          <Text style={styles.day}>{day}</Text>

          <Text
            style={[styles.content, { marginBottom: tags ? 0 : 30 }]}
            numberOfLines={numberOfLines}
            onPress={toggleTruncate}
          >
            {content}
          </Text>

          {tags && (
            <View style={styles.tagWrap}>
              {tags.map((item, index) => (
                <Text key={`item_${item}_${index}`} style={styles.tag}>
                  #{item}
                </Text>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.BACKGROUND_COLOR,
    flex: 1,
  },
  content: {
    lineHeight: 20,
    marginTop: 10,
  },
  contentWrap: {
    marginTop: 10,
    paddingHorizontal: 24,
  },
  day: {
    fontSize: 10,
  },
  location: {
    fontSize: 13,
  },
  locationIcon: {
    height: '100%',
    marginRight: 2,
    verticalAlign: 'middle',
  },
  locationWrap: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingVertical: 3,
  },
  tag: {
    backgroundColor: '#c9d1d9',
    borderColor: 'gray',
    borderRadius: 10,
    borderWidth: 1,
    margin: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  tagWrap: {
    marginTop: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  title: {
    fontSize: 25,
  },
});
