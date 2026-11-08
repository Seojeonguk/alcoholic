const COLORS = {
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

  // 같은 값이어도 쓰는 자리마다 이름을 따로 둠. 다크 모드(#345)에서 자리마다 다르게 바꿀 수 있게 함(#340)
  // 강조색 · 위험색 바탕 위의 글자 · 아이콘
  ON_ACCENT: '#FFFFFF',
  // 하단 탭에서 고르지 않은 탭
  TAB_INACTIVE: '#B0B8C1',
  // 시트 뒤를 어둡게 덮는 막
  OVERLAY: 'rgba(0, 0, 0, 0.4)',

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

export { COLORS };
