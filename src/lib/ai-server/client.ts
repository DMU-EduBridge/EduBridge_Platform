import { z } from 'zod';

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
  baseUrl: process.env.AI_SERVER_URL || 'http://localhost:8000',
  apiKey: process.env.AI_SERVER_API_KEY,
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

