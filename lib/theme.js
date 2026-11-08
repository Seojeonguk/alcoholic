import { StyleSheet, useColorScheme } from 'react-native';

import { DEFAULT_PHOTO, DEFAULT_PHOTO_DARK } from '../constants/photo';
import { DARK_COLORS, LIGHT_COLORS } from '../constants/theme';

// 기기 설정이 다크 모드인지(#345). 알 수 없으면 밝은 테마
export function useIsDark() {
  return useColorScheme() === 'dark';
}

// 지금 테마의 색 표
export function useColors() {
  return useIsDark() ? DARK_COLORS : LIGHT_COLORS;
}

// 색을 받아 스타일을 만드는 함수로 두 테마의 StyleSheet를 미리 만들어 두고,
// 컴포넌트에서는 돌려받은 훅(useStyles)으로 지금 테마의 것을 씀
export function makeStyles(factory) {
  const light = StyleSheet.create(factory(LIGHT_COLORS));
  const dark = StyleSheet.create(factory(DARK_COLORS));
  return function useStyles() {
    return useIsDark() ? dark : light;
  };
}

// 사진이 없는 글에 보여 줄 기본 이미지
export function useDefaultPhoto() {
  return useIsDark() ? DEFAULT_PHOTO_DARK : DEFAULT_PHOTO;
}
