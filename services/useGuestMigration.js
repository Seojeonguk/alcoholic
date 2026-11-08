import { useCallback, useState } from 'react';

import { auth } from '../firebaseConfig';
import { showToast } from '../lib';
import { migrateGuestPosts } from './migrateGuestPosts';
import { isMember } from './session';

import { useFocusEffect } from '@react-navigation/native';

// 결과 알림을 이미 붙인 옮기기 작업. 옮기는 중에 화면에 다시 들어와도 알림이 한 번만 뜨게 함
let notifiedJob = null;

const notifyResult = (job) => {
  if (job === notifiedJob) {
    return;
  }
  notifiedJob = job;
  job
    .then(({ moved, failed }) => {
      if (moved > 0) {
        showToast('success', `기기에 있던 기록 ${moved}개를 계정으로 옮겼어요.`);
      }
      if (failed > 0) {
        showToast('error', `기록 ${failed}개를 옮기지 못했어요. 다음에 다시 시도할게요.`);
      }
    })
    .catch(() => {
      showToast('error', '기기의 기록을 옮기지 못했어요.', '다음에 다시 시도할게요.');
    });
};

// 회원이 갤러리에 들어올 때마다 기기에 남은 비회원 기록을 이 계정으로 옮김(#201)
// 옮길 기록이 없으면 아무것도 보이지 않음. 끝나면 알림을 띄움
// 갤러리는 내 글을 구독하고 있어서 옮긴 글이 따로 다시 불러오지 않아도 목록에 들어옴(#300)
export default function useGuestMigration() {
  const [progress, setProgress] = useState(null);

  useFocusEffect(
    useCallback(() => {
      if (!isMember()) {
        return undefined;
      }
      let active = true;
      const { uid, email } = auth.currentUser;
      const job = migrateGuestPosts({
        uid,
        email,
        onProgress: (next) => active && setProgress(next),
      });
      notifyResult(job);
      job
        .catch(() => {})
        .finally(() => {
          if (active) {
            setProgress(null);
          }
        });
      return () => {
        active = false;
      };
    }, [])
  );

  return { progress };
}
