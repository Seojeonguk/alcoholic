import { getResizeTarget } from './photoResize';

import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';

// 올리기 전에 긴 변을 1600px로 줄이고 JPEG 0.8로 다시 저장함(촬영 정보도 빠짐)
// 지원하지 않는 형식 등으로 실패하면 원본을 그대로 올림
export default async function resizeForUpload(uri) {
  let context;
  const refs = [];
  try {
    context = ImageManipulator.manipulate(uri);
    const original = await context.renderAsync();
    refs.push(original);

    const target = getResizeTarget(original.width, original.height);
    let image = original;
    if (target) {
      image = await context.resize(target).renderAsync();
      refs.push(image);
    }

    const result = await image.saveAsync({ compress: 0.8, format: SaveFormat.JPEG });
    return result.uri;
  } catch (e) {
    return uri;
  } finally {
    // 네이티브 메모리를 바로 돌려줌
    refs.forEach((ref) => ref.release());
    context?.release();
  }
}
