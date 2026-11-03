// 인증 메일 재전송 제한 시각을 판단하고 보여 줄 문구로 바꿈
// React Native를 import하지 않아 node:test로 테스트함

// 제한 시각이 지났거나 저장된 시각이 없으면(처음 로그인) 다시 보낼 수 있음
const canResendEmail = (limit, now = new Date()) =>
  !(limit instanceof Date) || Number.isNaN(limit.getTime()) || now >= limit;

// 15:05:30 → '오후 3시 6분'. 초는 보여 주지 않으므로 분을 올려서, 그 시각에 다시 누르면 보낼 수 있게 함
const formatRetryTime = (limit) => {
  const time = new Date(limit.getTime());
  if (time.getSeconds() > 0 || time.getMilliseconds() > 0) {
    time.setMinutes(time.getMinutes() + 1, 0, 0);
  }
  const hours = time.getHours();
  const minutes = time.getMinutes();
  const period = hours < 12 ? '오전' : '오후';
  const hour12 = hours % 12 === 0 ? 12 : hours % 12;
  return minutes === 0 ? `${period} ${hour12}시` : `${period} ${hour12}시 ${minutes}분`;
};

export { canResendEmail, formatRetryTime };
