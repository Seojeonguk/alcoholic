// Cloud Functions. 배포 · 키 설정은 docs/firebase-setup.md의 "사진으로 술 알아보기" 참고
import { initializeApp } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { logger } from 'firebase-functions';
import { defineSecret } from 'firebase-functions/params';
import { HttpsError, onCall } from 'firebase-functions/v2/https';

import Anthropic from '@anthropic-ai/sdk';

import {
  RESULT_SCHEMA,
  SYSTEM_PROMPT,
  UNKNOWN,
  nextUsage,
  normalizeResult,
  toKstDay,
  validateRequest,
} from './drinkRecognition.js';

initializeApp();

const ANTHROPIC_API_KEY = defineSecret('ANTHROPIC_API_KEY');
const MODEL = 'claude-haiku-5-5';
// 하루 사용량 문서는 그날이 지나면 쓸모없어서 이틀 뒤 지움
const USAGE_TTL_MS = 2 * 24 * 60 * 60 * 1000;

// 사진 속 술의 이름 · 주종 · 태그를 제안함(#380). 맛 표현 · 비슷한 술도 같이 알려 줌(#391)
// 이메일 인증을 마친 회원만, App Check를 통과한 앱에서만 부를 수 있음. 사진은 저장하지 않음
export const recognizeDrink = onCall(
  {
    region: 'asia-northeast3',
    enforceAppCheck: true,
    secrets: [ANTHROPIC_API_KEY],
    memory: '256MiB',
    timeoutSeconds: 60,
    // 키가 새어 나가지 않아도 요금이 갑자기 늘지 않게 동시에 도는 수를 묶어 둠
    maxInstances: 5,
  },
  async (request) => {
    const token = request.auth?.token;
    if (!token) {
      throw new HttpsError('unauthenticated', '로그인이 필요해요.');
    }
    if (token.email_verified !== true) {
      throw new HttpsError('permission-denied', '이메일 인증을 마친 회원만 쓸 수 있어요.');
    }

    const input = validateRequest(request.data);
    if (!input.ok) {
      throw new HttpsError('invalid-argument', input.error);
    }

    // 하루 횟수는 부르기 전에 셈. 실패한 요청도 횟수에 들어감
    // aiUsage는 보안 규칙으로 앱에서 읽고 쓸 수 없고, 함수(Admin SDK)만 씀
    const usageRef = getFirestore().collection('aiUsage').doc(request.auth.uid);
    const today = toKstDay(new Date());
    const { allowed } = await getFirestore().runTransaction(async (tx) => {
      const snapshot = await tx.get(usageRef);
      const result = nextUsage(snapshot.data(), today);
      if (result.allowed) {
        // 탈퇴해도 남지 않게 이틀 뒤 Firestore TTL이 지움(firestore.indexes.json의 fieldOverrides)
        tx.set(usageRef, {
          ...result.usage,
          expireAt: Timestamp.fromMillis(Date.now() + USAGE_TTL_MS),
        });
      }
      return result;
    });
    if (!allowed) {
      throw new HttpsError('resource-exhausted', '오늘은 더 알아볼 수 없어요.');
    }

    const client = new Anthropic({ apiKey: ANTHROPIC_API_KEY.value() });
    let response;
    try {
      response = await client.messages.create({
        model: MODEL,
        max_tokens: 2048,
        output_config: {
          // 사진 한 장 분류라 깊게 생각하지 않아도 됨
          effort: 'low',
          format: { type: 'json_schema', schema: RESULT_SCHEMA },
        },
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: { type: 'base64', media_type: input.mediaType, data: input.image },
              },
              { type: 'text', text: '이 사진 속 술을 알려 주세요.' },
            ],
          },
        ],
      });
    } catch (error) {
      if (error instanceof Anthropic.RateLimitError) {
        logger.warn('Claude API 요청 한도', { status: error.status });
        throw new HttpsError('unavailable', '잠시 후 다시 시도해 주세요.');
      }
      if (error instanceof Anthropic.APIError) {
        logger.error('Claude API 오류', { status: error.status, message: error.message });
      } else {
        logger.error('Claude API 연결 실패', { message: error?.message });
      }
      throw new HttpsError('unavailable', '잠시 후 다시 시도해 주세요.');
    }

    // 거절 · 길이 초과면 답이 없거나 잘려 있으므로 "모르겠음"으로 돌려줌
    if (response.stop_reason !== 'end_turn') {
      logger.warn('답을 끝내지 못함', {
        stopReason: response.stop_reason,
        category: response.stop_details?.category ?? null,
      });
      return UNKNOWN;
    }
    const text = response.content.find((block) => block.type === 'text')?.text ?? '';
    logger.info('술 알아보기', {
      inputTokens: response.usage.input_tokens,
      outputTokens: response.usage.output_tokens,
    });
    return normalizeResult(text);
  }
);
