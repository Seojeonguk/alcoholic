import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';

const MAX_SIDE = 1600;
// 갤러리 칸(약 110dp)을 3배 밀도 화면에서도 선명하게 보일 크기(#338)
const THUMBNAIL_SIDE = 400;

// 긴 변을 maxSide 이하로 줄이고 JPEG로 다시 저장함(촬영 정보도 빠짐)
// 불러올 때부터 줄여서 원본 크기의 사진을 메모리에 올리지 않음. 작은 사진은 키우지 않음
const resize = async (uri, maxSide, compress) => {
  let context;
  let image;
  try {
    context = ImageManipulator.manipulate(uri, { maxHeight: maxSide, maxWidth: maxSide });
    image = await context.renderAsync();
    const result = await image.saveAsync({ compress, format: SaveFormat.JPEG });
    return result.uri;
  } finally {
    // 네이티브 메모리를 바로 돌려줌
    image?.release();
    context?.release();
  }
};

// 올리기 전에 긴 변을 1600px 이하로 줄이고 JPEG 0.8로 저장함
// 지원하지 않는 형식 등으로 실패하면 원본을 그대로 올림
export default async function resizeForUpload(uri) {
  try {
    return await resize(uri, MAX_SIDE, 0.8);
  } catch {
    return uri;
  }
}

// 갤러리 썸네일을 만듦(#338). 기기 파일 경로를 받음. 실패하면 에러를 던짐(썸네일 없이 저장함)
export const makeThumbnail = (uri) => resize(uri, THUMBNAIL_SIDE, 0.7);
