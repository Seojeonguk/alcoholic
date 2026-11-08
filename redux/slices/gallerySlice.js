import { addUniqueTag, toLocalDateString } from '../../lib';

import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  title: '',
  day: toLocalDateString(),
  photos: [],
  content: '',
  location: '',
  tags: [],
  // 별점 1~5 · 주종 코드(#341). 고르지 않으면 null
  rating: null,
  drinkType: null,
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
      state.rating = initialState.rating;
      state.drinkType = initialState.drinkType;
    },
    // 같은 태그는 한 번만 넣음
    addTag: (state, action) => {
      state.tags = addUniqueTag(state.tags, action.payload);
    },
    deleteTag: (state, action) => {
      const newTags = state.tags.filter((tag, idx) => idx !== action.payload);
      state.tags = newTags;
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
    // 같은 값을 다시 고르면 지우는 건 입력 컴포넌트가 정해서 null을 넘김
    updateRating: (state, action) => {
      state.rating = action.payload;
    },
    updateDrinkType: (state, action) => {
      state.drinkType = action.payload;
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
      // 예전 글에는 없는 필드라 없으면 null(고르지 않음)로 둠
      state.rating = action.payload.rating ?? null;
      state.drinkType = action.payload.drinkType ?? null;
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
  updateDrinkType,
  updateGallery,
  updateLocation,
  updatePhotos,
  updateRating,
  updateTitle,
} = gallerySlice.actions;
export default gallerySlice.reducer;
