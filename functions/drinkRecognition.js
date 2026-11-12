// 사진으로 술 알아보기(#380)의 판단 · 변환
// 패키지를 import하지 않아 루트의 node:test로 테스트함(tests/unit/drinkRecognition.test.mjs)

// 앱의 constants/drinkTypes.js와 같은 코드. 함수는 따로 배포돼서 앱 파일을 가져올 수 없어 복사해 둠(테스트로 같은지 확인)
const DRINK_TYPE_CODES = [
  'soju',
  'beer',
  'wine',
  'whisky',
  'spirits',
  'baijiu',
  'makgeolli',
  'traditional',
  'sake',
  'cocktail',
  'other',
];

// 앱의 constants/postLimits.js와 같은 상한. 제안을 그대로 저장해도 보안 규칙에 걸리지 않게 자름
const TITLE_LIMIT = 40;
const TAG_LENGTH_LIMIT = 20;
// 제안하는 태그는 몇 개만
const SUGGESTED_TAGS_LIMIT = 5;

// 맛 표현 · 비슷한 술(#391). 카드에 보여 주는 길이로 자름
const TASTE_NOTE_LIMIT = 200;
const FLAVORS_LIMIT = 5;
const FLAVOR_LENGTH_LIMIT = 15;
const SIMILAR_LIMIT = 3;
const SIMILAR_REASON_LIMIT = 80;

// 회원 한 명이 하루에 부를 수 있는 횟수
const DAILY_LIMIT = 20;

// 앱이 긴 변 약 1000px JPEG로 줄여 보냄. 넉넉히 base64 2MB(원본 약 1.5MB)까지 받음
const MAX_IMAGE_BASE64_LENGTH = 2 * 1024 * 1024;
const IMAGE_MEDIA_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const BASE64_PATTERN = /^[A-Za-z0-9+/]+={0,2}$/;

// 모델이 돌려줄 JSON 모양(구조화된 출력)
const RESULT_SCHEMA = {
  type: 'object',
  properties: {
    isDrink: { type: 'boolean' },
    name: { type: 'string' },
    drinkType: { type: 'string', enum: DRINK_TYPE_CODES },
    confidence: { type: 'string', enum: ['high', 'medium', 'low'] },
    tags: { type: 'array', items: { type: 'string' } },
    tasteNote: { type: 'string' },
    flavors: { type: 'array', items: { type: 'string' } },
    similar: {
      type: 'array',
      items: {
        type: 'object',
        properties: { name: { type: 'string' }, reason: { type: 'string' } },
        required: ['name', 'reason'],
        additionalProperties: false,
      },
    },
  },
  required: [
    'isDrink',
    'name',
    'drinkType',
    'confidence',
    'tags',
    'tasteNote',
    'flavors',
    'similar',
  ],
  additionalProperties: false,
};

const SYSTEM_PROMPT = `You identify alcoholic drinks in photos for a Korean drinking-diary app.
The user will save your answer as the title and tags of a diary entry, after reviewing it.

- isDrink: true only if the photo clearly shows an alcoholic drink (bottle, can, glass, label).
- name: the product name in Korean, using the official Korean spelling printed on the label or used by the maker when you know it (e.g. "카스 후레쉬", not "카스 후레시"), with age or vintage if visible (e.g. "발베니 12년 더블우드", "참이슬 후레쉬"). If you can tell only the kind, name the kind (e.g. "레드 와인"). Empty string if isDrink is false.
- drinkType: one code. soju, beer, wine, whisky, spirits (other Western liquor such as vodka, gin, rum, tequila, brandy), baijiu, makgeolli, traditional (other Korean traditional liquor), sake, cocktail, other.
- confidence: high only if you can read the label or the product is unmistakable; low if you are guessing.
- tags: up to 5 short Korean tags that help find this drink later among other diary entries: style, region, grape, cask, or maker (e.g. "싱글몰트", "스페이사이드", "라거", "오비맥주"). No spaces inside a tag. Fewer tags are better than weak ones. Do not use:
  - words already in name, or the drinkType label (e.g. no "더블우드" when the name has it, no "위스키" for whisky)
  - volume, size, or packaging (e.g. "500ml", "캔맥주", "병")
  - anything that describes the label or the company rather than the drink: claims and slogans (e.g. "비살균", "국내산 쌀", "Non pasteurized"), people or celebrities on the label, insurers, distributors
  A tag should still make sense to someone who never saw the label.
- tasteNote: one or two short Korean sentences in polite 해요체 describing how this drink usually tastes and smells: body, sweetness, acidity, tannin, bitterness, finish, and typical aromas (e.g. "탄닌감이 있고 묵직하며 오크 · 블랙베리 향이 나요."). If confidence is low or you know only the kind, describe what that kind usually tastes like and say so (e.g. "레드 와인은 보통 …"). Do not claim facts about this exact bottle that you cannot know, such as how it was stored. Empty string if isDrink is false.
- flavors: up to 5 short Korean taste or aroma keywords from tasteNote (e.g. "오크", "블랙베리", "묵직함"). No spaces inside a keyword.
- similar: 2 or 3 well-known drinks that are easy to find in Korea and taste similar, each with a one-sentence Korean reason in 해요체 (e.g. { "name": "글렌피딕 12년", "reason": "같은 스페이사이드 싱글몰트로 꿀 · 과일 향이 비슷해요." }). Use real product names you are sure exist. Do not include the drink itself. Empty array if isDrink is false.

Read only what is visible. Do not invent a brand you cannot see.`;

// 앱이 보낸 값 검사. 문제가 있으면 앱에 보여 줄 수 없는 개발용 메시지를 돌려줌
const validateRequest = (data) => {
  const image = data?.image;
  const mediaType = data?.mediaType;
  if (typeof image !== 'string' || image.length === 0) {
    return { ok: false, error: 'image가 없어요.' };
  }
  if (image.length > MAX_IMAGE_BASE64_LENGTH) {
    return { ok: false, error: 'image가 너무 커요.' };
  }
  if (!BASE64_PATTERN.test(image)) {
    return { ok: false, error: 'image는 base64여야 해요.' };
  }
  if (!IMAGE_MEDIA_TYPES.includes(mediaType)) {
    return { ok: false, error: 'mediaType이 맞지 않아요.' };
  }
  return { ok: true, image, mediaType };
};

// 한국 시간 기준 날짜(YYYY-MM-DD). 하루 횟수는 한국 자정에 다시 셈
const toKstDay = (date) => new Date(date.getTime() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);

// 이번 요청을 받아 줄지와 저장할 사용량. usage: Firestore의 { day, count } (없으면 처음)
const nextUsage = (usage, today, limit = DAILY_LIMIT) => {
  const count = usage?.day === today ? (usage.count ?? 0) : 0;
  if (count >= limit) {
    return { allowed: false, usage: { day: today, count } };
  }
  return { allowed: true, usage: { day: today, count: count + 1 } };
};

const UNKNOWN = {
  isDrink: false,
  name: '',
  drinkType: null,
  confidence: 'low',
  tags: [],
  tasteNote: '',
  flavors: [],
  similar: [],
};

// 문자열이면 앞뒤 공백을 떼고 길이를 자름. 아니면 빈 문자열
const cleanText = (value, limit) => (typeof value === 'string' ? value.trim().slice(0, limit) : '');

// 맛 키워드: 앞의 #과 공백을 떼고 겹치지 않게 몇 개만
const normalizeFlavors = (flavors) => {
  const result = [];
  for (const flavor of Array.isArray(flavors) ? flavors : []) {
    const clean = cleanText(flavor, FLAVOR_LENGTH_LIMIT * 2)
      .replace(/^#+/, '')
      .trim()
      .slice(0, FLAVOR_LENGTH_LIMIT);
    if (clean && !result.includes(clean)) {
      result.push(clean);
    }
    if (result.length === FLAVORS_LIMIT) {
      break;
    }
  }
  return result;
};

// 비슷한 술: 이름이 있고, 알아본 술과 다르고, 겹치지 않는 것만 몇 개
const normalizeSimilar = (similar, name) => {
  const result = [];
  for (const item of Array.isArray(similar) ? similar : []) {
    const similarName = cleanText(item?.name, TITLE_LIMIT);
    if (!similarName || similarName === name || result.some((s) => s.name === similarName)) {
      continue;
    }
    result.push({ name: similarName, reason: cleanText(item?.reason, SIMILAR_REASON_LIMIT) });
    if (result.length === SIMILAR_LIMIT) {
      break;
    }
  }
  return result;
};

// 모델 답(JSON 문자열)을 앱에 돌려줄 값으로 바꿈. 모양이 다르면 "모르겠음"으로 봄
const normalizeResult = (text) => {
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    return UNKNOWN;
  }
  if (parsed?.isDrink !== true) {
    return UNKNOWN;
  }
  const name = typeof parsed.name === 'string' ? parsed.name.trim().slice(0, TITLE_LIMIT) : '';
  const drinkType = DRINK_TYPE_CODES.includes(parsed.drinkType) ? parsed.drinkType : null;
  const confidence = ['high', 'medium', 'low'].includes(parsed.confidence)
    ? parsed.confidence
    : 'low';
  const tags = [];
  for (const tag of Array.isArray(parsed.tags) ? parsed.tags : []) {
    if (typeof tag !== 'string') {
      continue;
    }
    // 앱의 addUniqueTag처럼 앞뒤 공백과 앞의 #을 뗌
    const clean = tag.trim().replace(/^#+/, '').trim().slice(0, TAG_LENGTH_LIMIT);
    // 이름에 이미 있는 말은 태그로 넣지 않음(예: 이름 "발베니 12년 더블우드"의 "더블우드")
    if (clean && !tags.includes(clean) && !name.includes(clean)) {
      tags.push(clean);
    }
    if (tags.length === SUGGESTED_TAGS_LIMIT) {
      break;
    }
  }
  return {
    isDrink: true,
    name,
    drinkType,
    confidence,
    tags,
    tasteNote: cleanText(parsed.tasteNote, TASTE_NOTE_LIMIT),
    flavors: normalizeFlavors(parsed.flavors),
    similar: normalizeSimilar(parsed.similar, name),
  };
};

export {
  DAILY_LIMIT,
  DRINK_TYPE_CODES,
  FLAVORS_LIMIT,
  MAX_IMAGE_BASE64_LENGTH,
  RESULT_SCHEMA,
  SIMILAR_LIMIT,
  SYSTEM_PROMPT,
  TASTE_NOTE_LIMIT,
  UNKNOWN,
  nextUsage,
  normalizeResult,
  toKstDay,
  validateRequest,
};
