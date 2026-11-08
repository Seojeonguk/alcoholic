import postFormReducer, {
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
} from './slices/gallerySlice';
import { clearPosts, setPosts } from './slices/postsSlice';
import { clearSuggestions, setSuggestions } from './slices/suggestionSlice';

export {
  postFormReducer,
  addPhoto,
  addTag,
  clearPosts,
  clearSuggestions,
  deletePhoto,
  deleteTag,
  init,
  setPosts,
  setSuggestions,
  updateContent,
  updateDay,
  updateDrinkType,
  updateGallery,
  updateLocation,
  updatePhotos,
  updateRating,
  updateTitle,
};
