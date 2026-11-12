// 사진으로 술 알아보기(#381)의 판단 · 문구
// React Native를 import하지 않아 node:test로 테스트함

import { POST_LIMITS } from '../constants/postLimits.js';
import { addUniqueTag } from './tags.js';

// 알아본 결과를 폼에 어떻게 넣을지 정함. 사용자가 이미 쓴 값은 바꾸지 않음
// form: 글 쓰기 폼 값, result: 함수가 돌려준 { isDrink, name, drinkType, confidence, tags }
// 돌려주는 값: { title?, drinkType?, addTags } (술이 아니면 null)
const getRecognitionPatch = (form, result) => {
  if (!result?.isDrink) {
    return null;
  }
  const patch = { addTags: [] };
  if (!form.title?.trim() && result.name) {
    patch.title = result.name;
  }
  if (!form.drinkType && result.drinkType) {
    patch.drinkType = result.drinkType;
  }
  let tags = form.tags ?? [];
  for (const tag of result.tags ?? []) {
    if (tags.length >= POST_LIMITS.TAGS) {
      break;
    }
    const next = addUniqueTag(tags, tag);
    if (next !== tags) {
      patch.addTags.push(next[next.length - 1]);
      tags = next;
    }
  }
  return patch;
};

// 채운 항목 이름. 마지막 말에 맞춰 을/를을 붙임
const joinFilled = (patch) => {
  const labels = [
    patch.title !== undefined && '제목',
    patch.drinkType !== undefined && '주종',
    patch.addTags.length > 0 && '태그',
  ].filter(Boolean);
  if (labels.length === 0) {
    return null;
  }
  const last = labels[labels.length - 1];
  return `${labels.join(' · ')}${last === '태그' ? '를' : '을'}`;
};

// 알아본 뒤 보여 줄 토스트 { type, title, message }
const getRecognitionToast = (result, patch) => {
  if (!patch) {
    return {
      type: 'info',
      title: '사진에서 술을 찾지 못했어요.',
      message: '술병이나 라벨이 잘 보이는 사진을 첫 번째로 두고 다시 해 보세요.',
    };
  }
  const check =
    result.confidence === 'low'
      ? '확실하지 않으니 맞는지 꼭 확인해 주세요.'
      : '맞는지 확인하고 저장해 주세요.';
  const filled = joinFilled(patch);
  if (!filled) {
    return {
      type: 'info',
      title: result.name ? `${result.name}(으)로 보여요.` : '이미 쓴 내용은 바꾸지 않았어요.',
      message: result.name ? '이미 쓴 내용은 바꾸지 않았어요.' : check,
    };
  }
  return { type: 'success', title: `${filled} 채웠어요.`, message: check };
};

// 함수 오류 상태(callable의 error.status)에 맞는 토스트 문구 [title, message]
const getRecognitionErrorText = (status) => {
  if (status === 'RESOURCE_EXHAUSTED') {
    return ['오늘은 더 알아볼 수 없어요.', '내일 다시 시도해 주세요.'];
  }
  if (status === 'UNAUTHENTICATED' || status === 'PERMISSION_DENIED') {
    return ['사진을 알아보지 못했어요.', '앱을 다시 켜고 시도해 주세요.'];
  }
  return ['사진을 알아보지 못했어요.', '인터넷 연결을 확인하고 다시 시도해 주세요.'];
};

// 결과 카드에 보여 줄 맛 표현 · 비슷한 술(#391). 보여 줄 것이 없으면 null
// 예전 함수(#380)는 이 값들을 돌려주지 않아서 없으면 빈 값으로 봄
const getTasteCard = (result) => {
  if (!result?.isDrink) {
    return null;
  }
  const tasteNote = typeof result.tasteNote === 'string' ? result.tasteNote.trim() : '';
  const flavors = Array.isArray(result.flavors) ? result.flavors : [];
  const similar = Array.isArray(result.similar) ? result.similar.filter((s) => s?.name) : [];
  if (!tasteNote && similar.length === 0) {
    return null;
  }
  return { name: result.name, tasteNote, flavors, similar };
};

// 본문 끝에 맛 표현을 한 문단으로 덧붙인 값. 이미 들어 있거나 넣을 자리가 없으면 null
const appendTasteNote = (content, tasteNote) => {
  const note = tasteNote?.trim();
  const current = content ?? '';
  if (!note || current.includes(note)) {
    return null;
  }
  const trimmed = current.trimEnd();
  const next = trimmed ? `${trimmed}\n\n${note}` : note;
  return next.length > POST_LIMITS.CONTENT ? null : next;
};

export {
  appendTasteNote,
  getRecognitionErrorText,
  getRecognitionPatch,
  getRecognitionToast,
  getTasteCard,
};
