import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';

const MAX_SIDE = 1600;
// 갤러리 칸(약 110dp)을 3배 밀도 화면에서도 선명하게 보일 크기(#338)
const THUMBNAIL_SIDE = 400;
// 사진으로 술 알아보기(#381). 라벨 글자를 읽을 수 있을 만큼만 보냄(크면 요금 · 시간이 늘어남)
const RECOGNITION_SIDE = 1000;

// 긴 변을 maxSide 이하로 줄이고 JPEG로 다시 저장함(촬영 정보도 빠짐)
// 불러올 때부터 줄여서 원본 크기의 사진을 메모리에 올리지 않음. 작은 사진은 키우지 않음
// base64가 true면 { uri, base64 }를, 아니면 저장한 파일 경로를 돌려줌
const resize = async (uri, maxSide, compress, base64 = false) => {
  let context;
  let image;
  try {
    context = ImageManipulator.manipulate(uri, { maxHeight: maxSide, maxWidth: maxSide });
    image = await context.renderAsync();
    const result = await image.saveAsync({ base64, compress, format: SaveFormat.JPEG });
    return base64 ? result : result.uri;
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

// 사진으로 술 알아보기(#381)에 보낼 JPEG base64. 기기 파일 경로를 받음. 실패하면 에러를 던짐
export const toRecognitionImage = async (uri) =>
  (await resize(uri, RECOGNITION_SIDE, 0.7, true)).base64;
