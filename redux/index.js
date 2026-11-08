import postFormReducer, {
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
  updateTitle,
} from './slices/gallerySlice';
import { clearSuggestions, setSuggestions } from './slices/suggestionSlice';

export {
  postFormReducer,
  addPhoto,
  addTag,
  clearSuggestions,
  deletePhoto,
  deleteTag,
  init,
  setSuggestions,
  updateContent,
  updateDay,
  updateGallery,
  updateLocation,
  updatePhotos,
  updateTitle,
};
