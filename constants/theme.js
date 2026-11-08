// 사진 위 · 알림 상자처럼 테마와 상관없이 같은 색을 쓰는 자리
const SHARED_COLORS = {
  // 강조색 · 위험색 바탕 위의 글자 · 아이콘
  ON_ACCENT: '#FFFFFF',

  // 사진 위에 놓이는 것. 사진 색과 상관없이 보여야 해서 테마와 상관없이 같은 색을 씀
  ON_PHOTO: '#FFFFFF',
  ON_PHOTO_DIM: 'rgba(255, 255, 255, 0.5)',
  // 사진 위 헤더 아이콘 뒤의 반투명한 원
  PHOTO_ICON_BG: 'rgba(0, 0, 0, 0.3)',
  // 사진 미리보기 위의 빼기 버튼 · 대표 표시
  PHOTO_BADGE: 'rgba(25, 31, 40, 0.7)',
  // 상세 화면 사진 위쪽을 어둡게 까는 그라데이션의 시작 · 끝
  PHOTO_SHADE: 'rgba(0, 0, 0, 0.5)',
  PHOTO_SHADE_END: 'rgba(0, 0, 0, 0)',

  // 알림(TOAST 상자) 글자와 종류별 아이콘
  TOAST_TEXT: '#FFFFFF',
  TOAST_TEXT_SUB: '#D1D6DB',
  TOAST_SUCCESS: '#4ADE80',
  TOAST_ERROR: '#F87171',
  TOAST_INFO: '#93C5FD',
};

// 같은 값이어도 쓰는 자리마다 이름을 따로 둬서 테마마다 다르게 바꿀 수 있게 함(#340)
const LIGHT_COLORS = {
  ...SHARED_COLORS,
  // 토스식 화이트 디자인 색(docs/superpowers/specs/2026-10-26-design-refresh-design.md)
  BACKGROUND: '#FFFFFF',
  ACCENT: '#2E699A',
  ACCENT_SOFT: '#E8F0F7',
  TEXT: '#191F28',
  TEXT_SUB: '#8B95A1',
  FILL: '#F2F4F6',
  LINE: '#F2F4F6',
  DANGER: '#E5484D',
  TOAST: '#333D4B',
  // 하단 탭에서 고르지 않은 탭
  TAB_INACTIVE: '#B0B8C1',
  // 시트 뒤를 어둡게 덮는 막
  OVERLAY: 'rgba(0, 0, 0, 0.4)',
};

// 기기가 다크 모드일 때 쓰는 색(#345)
// 강조색은 어두운 바탕 위 글자로도, 흰 글자의 바탕으로도 읽히게 조금 밝힘
const DARK_COLORS = {
  ...SHARED_COLORS,
  BACKGROUND: '#17171C',
  ACCENT: '#4A8BC9',
  ACCENT_SOFT: '#1F2E3D',
  TEXT: '#E4E6EA',
  TEXT_SUB: '#8B929C',
  FILL: '#26262D',
  LINE: '#26262D',
  DANGER: '#F2696E',
  TOAST: '#3A3A44',
  TAB_INACTIVE: '#5B5F68',
  OVERLAY: 'rgba(0, 0, 0, 0.6)',
};

export { LIGHT_COLORS, DARK_COLORS };
