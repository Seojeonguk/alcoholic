import { useCallback, useState } from 'react';

import { showToast } from '../lib';
import { migrateGuestPosts } from './migrateGuestPosts';
import { isMember } from './session';

import { getAuth } from '@react-native-firebase/auth';
import { useFocusEffect } from '@react-navigation/native';

// 회원이 갤러리에 들어올 때마다 기기에 남은 비회원 기록을 이 계정으로 옮김(#201)
// 옮길 기록이 없으면 아무것도 보이지 않음. 끝나면 알림을 띄우고 onDone(목록 다시 불러오기)을 부름
export default function useGuestMigration(onDone) {
  const [progress, setProgress] = useState(null);

  useFocusEffect(
    useCallback(() => {
      if (!isMember()) {
        return undefined;
      }
      let active = true;
      const { uid, email } = getAuth().currentUser;
      migrateGuestPosts({
        uid,
        email,
        onProgress: (next) => active && setProgress(next),
      })
        .then(({ moved, failed }) => {
          if (moved > 0) {
            showToast('success', `기기에 있던 기록 ${moved}개를 계정으로 옮겼어요.`);
          }
          if (failed > 0) {
            showToast('error', `기록 ${failed}개를 옮기지 못했어요. 다음에 다시 시도할게요.`);
          }
          if (active && moved > 0) {
            onDone();
          }
        })
        .catch(() => {
          showToast('error', '기기의 기록을 옮기지 못했어요.', '다음에 다시 시도할게요.');
        })
        .finally(() => {
          if (active) {
            setProgress(null);
          }
        });
      return () => {
        active = false;
      };
    }, [onDone])
  );

  return { progress };
}
