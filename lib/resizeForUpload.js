import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';

const MAX_SIDE = 1600;

// 올리기 전에 긴 변을 1600px 이하로 줄이고 JPEG 0.8로 다시 저장함(촬영 정보도 빠짐)
// 불러올 때부터 줄여서 원본 크기의 사진을 메모리에 올리지 않음. 작은 사진은 키우지 않음
// 지원하지 않는 형식 등으로 실패하면 원본을 그대로 올림
export default async function resizeForUpload(uri) {
  let context;
  let image;
  try {
    context = ImageManipulator.manipulate(uri, { maxHeight: MAX_SIDE, maxWidth: MAX_SIDE });
    image = await context.renderAsync();
    const result = await image.saveAsync({ compress: 0.8, format: SaveFormat.JPEG });
    return result.uri;
  } catch (e) {
    return uri;
  } finally {
    // 네이티브 메모리를 바로 돌려줌
    image?.release();
    context?.release();
  }
}
