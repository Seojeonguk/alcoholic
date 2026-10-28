import { useEffect } from 'react';

// 저장 · 삭제 · 탈퇴가 끝나기 전에 닫기 버튼이나 Android 뒤로 가기로 화면을 떠나지 못하게 함
// 일이 끝나고 화면을 옮길 때는 blockRef.current를 먼저 false로 바꿔야 함
export default function usePreventLeave(navigation, blockRef) {
  useEffect(
    () =>
      navigation.addListener('beforeRemove', (e) => {
        if (blockRef.current) {
          e.preventDefault();
        }
      }),
    [navigation, blockRef]
  );
}
