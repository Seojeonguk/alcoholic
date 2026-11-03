import {
  createNewPost,
  createUserInfo,
  deletePost,
  deleteUserData,
  getPost,
  getPosts,
  updateDocForId,
} from './docs';
import {
  GUEST_PHOTO_DIR_URI,
  claimLocalPosts,
  createLocalPost,
  deleteLocalPost,
  deleteVisibleLocalPosts,
  getLocalPost,
  getLocalPosts,
  isLocalPhoto,
  saveLocalPhoto,
  updateLocalPost,
} from './localPosts';
import { migrateGuestPosts } from './migrateGuestPosts';
import useGuestMigration from './useGuestMigration';
import { enterGuestMode, hasGuestFlag, isMember, leaveGuestMode, waitForAuthUser } from './session';

export {
  migrateGuestPosts,
  useGuestMigration,
  enterGuestMode,
  hasGuestFlag,
  isMember,
  leaveGuestMode,
  waitForAuthUser,
  GUEST_PHOTO_DIR_URI,
  claimLocalPosts,
  createLocalPost,
  deleteLocalPost,
  deleteVisibleLocalPosts,
  getLocalPost,
  getLocalPosts,
  isLocalPhoto,
  saveLocalPhoto,
  updateLocalPost,
  createNewPost,
  createUserInfo,
  deletePost,
  deleteUserData,
  getPost,
  getPosts,
  updateDocForId,
};
