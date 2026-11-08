// 주종 목록(#341). 저장은 영어 코드로 하고 화면에는 이름을 보여 줌
// firestore.rules의 validDrinkType과 같은 코드를 써야 함. 순서는 글 쓰기 칩 · 필터 시트에 보이는 순서
const DRINK_TYPES = [
  { code: 'soju', label: '소주' },
  { code: 'beer', label: '맥주' },
  { code: 'wine', label: '와인' },
  { code: 'whisky', label: '위스키' },
  { code: 'spirits', label: '양주' },
  { code: 'baijiu', label: '고량주' },
  { code: 'makgeolli', label: '막걸리' },
  { code: 'traditional', label: '전통주' },
  { code: 'sake', label: '사케' },
  { code: 'cocktail', label: '칵테일' },
  { code: 'other', label: '기타' },
];

// 별점은 1~5 정수
const MAX_RATING = 5;

export { DRINK_TYPES, MAX_RATING };
