// toJSON()은 UTC 기준이라 한국 시간 오전 9시 전에는 하루 전 날짜가 나옴. 기기 시간대 기준으로 만듦
// React Native를 import하지 않아 node:test로 테스트함
const toLocalDateString = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export { toLocalDateString };
