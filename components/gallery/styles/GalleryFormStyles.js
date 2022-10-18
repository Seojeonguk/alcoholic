import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  galleryHeader: {
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderStyle: 'solid',
    borderColor: 'grey',
    paddingVertical: 5,
    marginBottom: 5,
  },
  galleryTitle: {
    textAlign: 'center',
    fontSize: 28,
    fontWeight: 'bold',
  },
  backBtn: {
    position: 'absolute',
    left: 0,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 4,
  },
  saveBtn: {
    position: 'absolute',
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 4,
  },
  inputBox: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    marginHorizontal: 20,
    marginVertical: 5,
    borderColor: 'grey',
  },
  input: {
    flex: 1,
    paddingLeft: 10,
  },
  tagBox: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    marginHorizontal: 20,
    marginVertical: 5,
    borderColor: 'grey',
    flexWrap: 'wrap',
  },
  tags: {
    backgroundColor: '#c9d1d9',
    flexDirection: 'row',
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 5,
  },
  inputTag: {
    margin: 5,
    borderBottomWidth: 0,
  },
});