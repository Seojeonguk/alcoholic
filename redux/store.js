import GalleryReducer from './slices/gallerySlice';
import SuggestionReducer from './slices/suggestionSlice';

import { configureStore } from '@reduxjs/toolkit';

export default configureStore({
  reducer: {
    gallery: GalleryReducer,
    suggestion: SuggestionReducer,
  },
});
