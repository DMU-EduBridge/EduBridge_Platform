import type { ChatDelta, ChatRequest, ChatResponse } from '@/types/ai/chat';
import { z } from 'zod';
import { AIServiceLogger } from './ai-service-logger';
import { AICircuitBreakerManager } from './circuit-breaker';
import { RetryManager } from './retry-manager';
import { AI_TIMEOUT_CONFIG, fetchWithTimeout } from './timeout-config';

// EnvSchema는 현재 사용되지 않으므로 제거

// getBaseUrl 함수는 현재 사용되지 않으므로 제거

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
  const timeoutMs = options.timeoutMs ?? AI_TIMEOUT_CONFIG.CHAT_MESSAGE;
  const circuitBreaker = AICircuitBreakerManager.getCircuitBreaker('educational_ai', 'chat');

  return circuitBreaker.execute(async () => {
    const result = await RetryManager.executeWithRetry(async () => {
      const url = options.stream ? '/api/ai/bridge/chat?stream=1' : '/api/ai/bridge/chat';

      const response = await fetchWithTimeout(
        url,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...request }),
          signal: options.signal || null,
        },
        timeoutMs,
      );

      if (!response.ok) {
        const text = await response.text().catch(() => '');
        throw new Error(`Chat upstream error ${response.status}: ${text}`);
      }

      // 스트리밍 처리
      const contentType = response.headers.get('content-type') ?? '';
      if (contentType.includes('text/event-stream') && options.stream && response.body) {
        return await handleStreamingResponse(response, options.onDelta);
      }

      // 일반 JSON 응답 처리
      const data = await response.json();
      const validated = CHAT_SCHEMA.parse(data);

      AIServiceLogger.logRequest({
        service: 'educational_ai',
        operation: 'chat',
        duration: timeoutMs,
        success: true,
        metadata: {
          conversationId: validated.conversationId,
          messageLength: validated.message.content.length,
          citationsCount: validated.citations?.length || 0,
          usage: validated.usage,
        },
      });

      return {
        ...validated,
        citations: validated.citations || [],
        usage: validated.usage || { tokensPrompt: 0, tokensCompletion: 0, tokensTotal: 0 },
      };
    }, RetryManager.getChatServiceConfig());

    if (!result.success) {
      AIServiceLogger.logError(
        {
          service: 'educational_ai',
          operation: 'chat',
          error: result.error?.message || 'Unknown error',
        },
        result.error || new Error('Chat request failed'),
      );
      throw result.error || new Error('Chat request failed');
    }

    return result.data!;
  });
}

async function handleStreamingResponse(
  response: Response,
  onDelta?: (delta: ChatDelta) => void,
): Promise<ChatResponse> {
  const reader = response.body!.getReader();
  const decoder = new TextDecoder();
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
    const lines = chunk.split(/\n/);

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || !trimmed.startsWith('data:')) continue;

      const payload = trimmed.slice(5).trim();
      if (payload === '[DONE]') {
        continue;
      }

      try {
        const obj = JSON.parse(payload);
        if (obj.choices?.[0]?.delta?.content) {
          const content = obj.choices[0].delta.content;
          accumulatedContent += content;

          if (onDelta) {
            onDelta({
              role: 'assistant',
              delta: content,
            });
          }
        }
      } catch (e) {
        // JSON 파싱 실패 시 무시
      }
    }
  }

  return {
    conversationId: tryUUID(),
    message: { role: 'assistant', content: accumulatedContent },
    citations: [],
    usage: { tokensPrompt: 0, tokensCompletion: 0, tokensTotal: 0 },
  };
}

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

  const result = await RetryManager.executeWithRetry(async () => {
    const response = await fetchWithTimeout(
      url.toString(),
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(AI_SERVER_CONFIG.apiKey && { Authorization: `Bearer ${AI_SERVER_CONFIG.apiKey}` }),
        },
      },
      AI_TIMEOUT_CONFIG.DATA_SYNC,
    );

    if (!response.ok) {
      throw new Error(`AI 서버 응답 오류: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return AISyncRequestSchema.parse(data);
  }, RetryManager.getAIServiceConfig());

  if (!result.success) {
    throw result.error || new Error('Failed to fetch problems from AI server');
  }

  return result.data!;
}

// AI 서버 상태 확인
export async function checkAIServerHealth() {
  const url = new URL('/health', AI_SERVER_CONFIG.baseUrl);

  const result = await RetryManager.executeWithRetry(
    async () => {
      const response = await fetchWithTimeout(
        url.toString(),
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...(AI_SERVER_CONFIG.apiKey && { Authorization: `Bearer ${AI_SERVER_CONFIG.apiKey}` }),
          },
        },
        AI_TIMEOUT_CONFIG.HEALTH_CHECK,
      );

      return response.ok;
    },
    {
      maxRetries: 1, // 헬스체크는 1회만 재시도
      baseDelay: 1000,
      maxDelay: 5000,
      backoffMultiplier: 1,
      retryableErrors: [/network/i, /timeout/i, /fetch/i],
    },
  );

  return result.success && result.data === true;
}

const AISyncRequestSchema = z.object({
  problems: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      content: z.string(),
      type: z.string(),
      difficulty: z.string(),
      subject: z.string(),
      options: z.array(z.string()).optional(),
      correctAnswer: z.string(),
      explanation: z.string().optional(),
      hints: z.array(z.string()).optional(),
      tags: z.array(z.string()).optional(),
      points: z.number().optional(),
      timeLimit: z.number().optional(),
      isAIGenerated: z.boolean().optional(),
    }),
  ),
  batchId: z.string(),
  source: z.string(),
  totalCount: z.number().optional(),
});
