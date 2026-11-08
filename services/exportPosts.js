// 기록 내보내기 · 사진 공유(#344). 파일은 앱 캐시 폴더에만 만들고 공유 시트로 보냄(사진 · 저장소 권한 없음)
// 회원은 서버에서 내 글을 읽고 사진을 다운로드 URL에서 받음. 비회원은 기기에 저장된 글 · 사진을 씀
import { auth } from '../firebaseConfig';
import { getExportFileName, getPhotoExtension, planExport, toExportManifest } from '../lib';
import { getAllPosts } from './docs';
import { getLocalPostsForExport } from './localPosts';
import { isMember } from './session';

import { Directory, File, FileMode, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { strToU8, Zip, ZipPassThrough } from 'fflate';

const exportDir = new Directory(Paths.cache, 'export');
const shareDir = new Directory(Paths.cache, 'share');

const isRemote = (uri) => /^https?:\/\//.test(uri);

// 지난번에 만든 파일을 지우고 빈 폴더로 시작함(캐시가 쌓이지 않게)
const resetDir = (dir) => {
  if (dir.exists) {
    dir.delete();
  }
  dir.create({ intermediates: true });
};

// 사진 한 장을 바이트로 읽음. 다운로드 URL이면 캐시 폴더에 받아서 읽고 바로 지움
const readPhotoBytes = async (source, tmpName) => {
  if (!isRemote(source)) {
    return new File(source).bytes();
  }
  const tmp = new File(exportDir, tmpName);
  const downloaded = await File.downloadFileAsync(source, tmp, { idempotent: true });
  try {
    return await downloaded.bytes();
  } finally {
    downloaded.delete();
  }
};

const loadPostsForExport = () =>
  isMember() ? getAllPosts(auth.currentUser.email) : getLocalPostsForExport();

const assertSharing = async () => {
  if (!(await Sharing.isAvailableAsync())) {
    throw new Error('이 기기에서는 파일을 공유할 수 없어요.');
  }
};

// 내 기록 전체를 zip 하나로 만들어 공유 시트를 엶
// onProgress(done, total): 사진을 한 장 담을 때마다 부름
// 돌려주는 값: { empty } 기록이 없음, { skipped } 받지 못해 뺀 사진 수
const exportPosts = async ({ onProgress } = {}) => {
  await assertSharing();
  const posts = await loadPostsForExport();
  if (posts.length === 0) {
    return { empty: true, skipped: 0 };
  }

  resetDir(exportDir);
  const now = new Date();
  const plan = planExport(posts);
  const zipFile = new File(exportDir, getExportFileName(now));
  zipFile.create();
  const handle = zipFile.open(FileMode.WriteOnly);

  // 사진을 한 장씩 읽어 바로 파일에 써서, 전체 zip을 메모리에 올리지 않음
  let zipError = null;
  const zip = new Zip((error, chunk) => {
    if (error) {
      zipError = error;
      return;
    }
    handle.writeBytesSync(chunk);
  });
  // JPEG는 이미 압축돼 있어서 다시 압축하지 않고 담기만 함
  const addEntry = (path, bytes) => {
    const entry = new ZipPassThrough(path);
    zip.add(entry);
    entry.push(bytes, true);
    if (zipError) {
      throw zipError;
    }
  };

  const included = new Set();
  try {
    for (const [i, photo] of plan.photos.entries()) {
      try {
        addEntry(photo.path, await readPhotoBytes(photo.source, `photo-${i}`));
        included.add(photo.path);
      } catch (e) {
        if (e === zipError) {
          throw e;
        }
        // 지워졌거나 받지 못한 사진은 빼고 계속함. 글의 사진 목록에서도 빠짐
      }
      onProgress?.(i + 1, plan.photos.length);
    }
    const manifest = toExportManifest(plan, included, now);
    addEntry('posts.json', strToU8(JSON.stringify(manifest, null, 2)));
    zip.end();
    if (zipError) {
      throw zipError;
    }
  } finally {
    handle.close();
  }

  await Sharing.shareAsync(zipFile.uri, {
    dialogTitle: '기록 내보내기',
    mimeType: 'application/zip',
  });
  return { empty: false, skipped: plan.photos.length - included.size };
};

const MIME_TYPES = { jpg: 'image/jpeg', png: 'image/png', webp: 'image/webp', heic: 'image/heic' };

// 상세 화면에서 보고 있는 사진 한 장을 공유함. 회원 사진은 캐시 폴더에 받아서 보냄
const sharePhoto = async (uri) => {
  await assertSharing();
  const ext = getPhotoExtension(uri);
  let fileUri = uri;
  if (isRemote(uri)) {
    resetDir(shareDir);
    const downloaded = await File.downloadFileAsync(uri, new File(shareDir, `alcoholic.${ext}`), {
      idempotent: true,
    });
    fileUri = downloaded.uri;
  }
  await Sharing.shareAsync(fileUri, { dialogTitle: '사진 공유하기', mimeType: MIME_TYPES[ext] });
};

export { exportPosts, sharePhoto };
