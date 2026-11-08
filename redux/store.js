import GalleryReducer from './slices/gallerySlice';
import PostsReducer from './slices/postsSlice';
import SuggestionReducer from './slices/suggestionSlice';

import { configureStore } from '@reduxjs/toolkit';

export default configureStore({
  reducer: {
    gallery: GalleryReducer,
    suggestion: SuggestionReducer,
    posts: PostsReducer,
  },
});
