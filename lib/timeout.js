// 연결이 끊긴 곳에서 저장 · 삭제가 끝나지 않아 화면에 갇히지 않게 시간 제한을 둠(#323)
// React Native를 import하지 않아 node:test로 테스트함
const TIMEOUT_CODE = 'app/timeout';

// 사진 한 장 올리기(올리기 · 주소 받기 각각). 줄인 사진이라 보통 몇 초면 끝남
const UPLOAD_TIMEOUT_MS = 60 * 1000;
// Firestore 글 쓰기 · 지우기. 오프라인이면 서버 응답이 올 때까지 끝나지 않음
const WRITE_TIMEOUT_MS = 15 * 1000;

const isTimeoutError = (error) => error?.code === TIMEOUT_CODE;

// ms 안에 끝나지 않으면 TIMEOUT_CODE 에러로 실패함. onTimeout으로 하던 일(사진 올리기 등)을 취소할 수 있음
const withTimeout = (promise, ms, onTimeout) =>
  new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      try {
        onTimeout?.();
      } catch {
        // 취소에 실패해도 시간 초과로 끝냄
      }
      const error = new Error(`${ms}ms 안에 끝나지 않았어요.`);
      error.code = TIMEOUT_CODE;
      reject(error);
    }, ms);
    Promise.resolve(promise).then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      }
    );
  });

// Firestore 쓰기를 기다림. 오프라인이면 쓰기는 기기 캐시에 먼저 들어가(구독 목록에도 바로 보임)
// 연결되면 서버에 올라가고, 중간에 취소할 방법이 없음. 그래서 시간이 지나면 실패가 아니라
// "연결되면 반영됨"({ queued: true })으로 봄. 그 밖의 에러(규칙 거절 등)는 그대로 던짐
const waitForWrite = async (write, ms = WRITE_TIMEOUT_MS) => {
  try {
    await withTimeout(write, ms);
    return { queued: false };
  } catch (error) {
    if (isTimeoutError(error)) {
      // 나중에 실패해도 처리하지 않은 거절로 남지 않게 함
      Promise.resolve(write).catch(() => {});
      return { queued: true };
    }
    throw error;
  }
};

export { UPLOAD_TIMEOUT_MS, WRITE_TIMEOUT_MS, isTimeoutError, waitForWrite, withTimeout };
