import type { ChatDelta, ChatRequest, ChatResponse } from '@/types/ai/chat';
import { z } from 'zod';

const EnvSchema = z.object({
  NEXT_PUBLIC_FASTAPI_URL: z.string().url(),
});

function getBaseUrl(): string {
  const parsed = EnvSchema.safeParse({
    NEXT_PUBLIC_FASTAPI_URL: process.env.NEXT_PUBLIC_FASTAPI_URL,
  });
  if (!parsed.success) {
    throw new Error('NEXT_PUBLIC_FASTAPI_URL 환경변수가 유효한 URL이어야 합니다.');
  }
  return parsed.data.NEXT_PUBLIC_FASTAPI_URL.replace(/\/$/, '');
}

const CHAT_SCHEMA = z.object({
  conversationId: z.string(),
  message: z.object({ role: z.enum(['user', 'assistant', 'system']), content: z.string() }),
  citations: z
    .array(
      z.object({
        id: z.string(),
        title: z.string(),
        page: z.number().optional(),
        url: z.string().url().optional(),
      }),
    )
    .optional(),
  usage: z
    .object({ tokensPrompt: z.number(), tokensCompletion: z.number(), tokensTotal: z.number() })
    .optional(),
});

export interface ChatOptions {
  signal?: AbortSignal;
  stream?: boolean;
  onDelta?: (delta: ChatDelta) => void;
  timeoutMs?: number;
}

export async function chat(request: ChatRequest, options: ChatOptions = {}): Promise<ChatResponse> {
  // base URL 검증 (현재 프록시 경유이므로 미사용이지만 유효성 보장)
  getBaseUrl();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), options.timeoutMs ?? 60_000);
  const signal = options.signal ?? controller.signal;

  try {
    const url = options.stream ? '/api/ai/bridge/chat?stream=1' : '/api/ai/bridge/chat';
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // request에서 stream 플래그 제거: 옵션 단일화
      body: JSON.stringify({ ...request }),
      signal,
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`Chat upstream error ${res.status}: ${text}`);
    }

    // 스트리밍 처리: 서버가 text/event-stream을 프록시하면 body를 읽어 누적
    const contentType = res.headers.get('content-type') ?? '';
    if (contentType.includes('text/event-stream') && options.stream && res.body) {
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = '';
      let accumulatedContent = '';
      const tryUUID = () =>
        typeof crypto !== 'undefined' && 'randomUUID' in crypto
          ? (crypto as any).randomUUID()
          : `${Date.now()}-${Math.random()}`;
      // SSE: 각 라인은 \n으로 구분, OpenAI 호환 포맷 처리: data: {...}, data: [DONE]
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        acc += chunk;
        const lines = chunk.split(/\n/);
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith('data:')) continue;
          const payload = trimmed.slice(5).trim();
          if (payload === '[DONE]') {
            // 종료 신호
            continue;
          }
          try {
            const obj = JSON.parse(payload);
            const choice = obj?.choices?.[0];
            const piece: string | undefined = choice?.delta?.content ?? choice?.text ?? obj?.delta;
            if (typeof piece === 'string' && piece.length > 0) {
              accumulatedContent += piece;
              options.onDelta?.({ role: 'assistant', delta: piece, done: false });
            }
          } catch {
            if (payload) {
              accumulatedContent += payload;
              options.onDelta?.({ role: 'assistant', delta: payload, done: false });
            }
          }
        }
      }
      // 스트림 완료 후 누적된 acc에서 마지막 JSON 블롭을 파싱 시도
      try {
        const lastJsonIndex = acc.lastIndexOf('{');
        if (lastJsonIndex >= 0) {
          const maybeJson = acc.slice(lastJsonIndex);
          return CHAT_SCHEMA.parse(JSON.parse(maybeJson)) as ChatResponse;
        }
      } catch {
        // ignore and fallback
      }
      // 폴백: 최종 JSON이 없으면 누적 텍스트로 최소 ChatResponse 구성
      const convId = res.headers.get('x-conversation-id') || tryUUID();
      return CHAT_SCHEMA.parse({
        conversationId: convId,
        message: { role: 'assistant', content: accumulatedContent },
        citations: [],
        usage: { tokensPrompt: 0, tokensCompletion: 0, tokensTotal: 0 },
      }) as ChatResponse;
    }

    // 일반 JSON 응답
    const json = await res.json();
    return CHAT_SCHEMA.parse(json) as ChatResponse;
  } finally {
    clearTimeout(timeoutId);
  }
}

// AI 서버에서 받는 문제 데이터 스키마
const AIProblemSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  content: z.string(),
  type: z.enum(['MULTIPLE_CHOICE', 'SHORT_ANSWER', 'ESSAY', 'CODING', 'MATH']),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD', 'EXPERT']),
  subject: z.string(),
  options: z.array(z.string()).optional(),
  correctAnswer: z.string(),
  explanation: z.string().optional(),
  hints: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  points: z.number().default(1),
  timeLimit: z.number().optional(),
  qualityScore: z.number().optional(),
  metadata: z.record(z.any()).optional(), // AI 서버에서 추가 메타데이터
});

const AISyncRequestSchema = z.object({
  problems: z.array(AIProblemSchema),
  batchId: z.string().optional(),
  source: z.string().default('ai-server'),
});

export type AIProblem = z.infer<typeof AIProblemSchema>;
export type AISyncRequest = z.infer<typeof AISyncRequestSchema>;

// AI 서버 설정
const AI_SERVER_CONFIG = {
  baseUrl: process.env.EDUCATIONAL_AI_URL || 'http://localhost:8000',
  apiKey: process.env.OPENAI_API_KEY, // 공통 OpenAI API 키 사용
  timeout: 30000, // 30초
};

// AI 서버에서 문제 목록 가져오기
export async function fetchProblemsFromAI(params: {
  subject?: string;
  difficulty?: string;
  type?: string;
  limit?: number;
  offset?: number;
}) {
  const url = new URL('/api/problems', AI_SERVER_CONFIG.baseUrl);

  if (params.subject) url.searchParams.set('subject', params.subject);
  if (params.difficulty) url.searchParams.set('difficulty', params.difficulty);
  if (params.type) url.searchParams.set('type', params.type);
  if (params.limit) url.searchParams.set('limit', params.limit.toString());
  if (params.offset) url.searchParams.set('offset', params.offset.toString());

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), AI_SERVER_CONFIG.timeout);

  try {
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(AI_SERVER_CONFIG.apiKey && { Authorization: `Bearer ${AI_SERVER_CONFIG.apiKey}` }),
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`AI 서버 응답 오류: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return AISyncRequestSchema.parse(data);
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof z.ZodError) {
      throw new Error(`AI 서버 응답 형식 오류: ${error.errors.map((e) => e.message).join(', ')}`);
    }
    throw error;
  }
}

// AI 서버 상태 확인
export async function checkAIServerHealth() {
  const url = new URL('/health', AI_SERVER_CONFIG.baseUrl);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000); // 5초 타임아웃

  try {
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(AI_SERVER_CONFIG.apiKey && { Authorization: `Bearer ${AI_SERVER_CONFIG.apiKey}` }),
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
    clearTimeout(timeoutId);
    return false;
  }
}
