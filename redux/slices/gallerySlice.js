import { toLocalDateString } from '../../lib';

import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  title: '',
  day: toLocalDateString(),
  photos: [],
  content: '',
  location: '',
  tags: [],
};

export const gallerySlice = createSlice({
  name: 'gallery',
  initialState,
  reducers: {
    init: (state) => {
      state.title = initialState.title;
      // 앱을 켜 둔 채 날짜가 바뀌어도 오늘 날짜로 시작하게 매번 새로 구함
      state.day = toLocalDateString();
      state.photos = initialState.photos;
      state.content = initialState.content;
      state.location = initialState.location;
      state.tags = initialState.tags;
    },
    addTag: (state, action) => {
      const newTags = state.tags.concat(action.payload);
      state.tags = newTags;
    },
    deleteTag: (state, action) => {
      const newTags = state.tags.filter((tag, idx) => idx !== action.payload);
      state.tags = newTags;
    },
    updateTags: (state, action) => {
      state.tags = action.payload;
    },
    updateTitle: (state, action) => {
      state.title = action.payload;
    },
    updateLocation: (state, action) => {
      state.location = action.payload;
    },
    updateContent: (state, action) => {
      state.content = action.payload;
    },
    updateDay: (state, action) => {
      state.day = action.payload;
    },
    addPhoto: (state, action) => {
      // 이미 추가한 사진은 다시 넣지 않음
      const addedPhotos = []
        .concat(action.payload)
        .filter((photo) => !state.photos.includes(photo));
      state.photos = state.photos.concat(addedPhotos);
    },
    deletePhoto: (state, action) => {
      const newPhotos = state.photos.filter((photo, idx) => idx !== action.payload);
      state.photos = newPhotos;
    },
    updatePhotos: (state, action) => {
      state.photos = action.payload;
    },
    updateGallery: (state, action) => {
      state.title = action.payload.title ?? state.title;
      state.day = action.payload.day ?? state.day;
      state.photos = action.payload.photos ?? state.photos;
      state.content = action.payload.content ?? state.content;
      state.location = action.payload.location ?? state.location;
      state.tags = action.payload.tags ?? state.tags;
    },
  },
});

export const {
  addPhoto,
  addTag,
  deletePhoto,
  deleteTag,
  init,
  updateContent,
  updateDay,
  updateGallery,
  updateLocation,
  updatePhotos,
  updateTags,
  updateTitle,
} = gallerySlice.actions;
export default gallerySlice.reducer;
