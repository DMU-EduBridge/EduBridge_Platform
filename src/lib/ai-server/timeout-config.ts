import { z } from 'zod';

/**
 * AI 서비스 관련 타임아웃 설정
 */
export const AI_TIMEOUT_CONFIG = {
  // 기본 타임아웃 설정 (밀리초)
  HEALTH_CHECK: 5000, // 헬스체크: 5초
  CHAT_MESSAGE: 30000, // 채팅 메시지: 30초
  QUESTION_GENERATION: 60000, // 문제 생성: 60초
  STUDENT_ANALYSIS: 45000, // 학생 분석: 45초
  FILE_UPLOAD: 120000, // 파일 업로드: 2분
  DATA_SYNC: 180000, // 데이터 동기화: 3분
  BATCH_OPERATION: 300000, // 배치 작업: 5분
} as const;

/**
 * 환경 변수에서 타임아웃 설정을 가져오는 스키마
 */
const AITimeoutEnvSchema = z.object({
  AI_HEALTH_CHECK_TIMEOUT: z.string().transform(Number).default('5000'),
  AI_CHAT_TIMEOUT: z.string().transform(Number).default('30000'),
  AI_QUESTION_GENERATION_TIMEOUT: z.string().transform(Number).default('60000'),
  AI_STUDENT_ANALYSIS_TIMEOUT: z.string().transform(Number).default('45000'),
  AI_FILE_UPLOAD_TIMEOUT: z.string().transform(Number).default('120000'),
  AI_DATA_SYNC_TIMEOUT: z.string().transform(Number).default('180000'),
  AI_BATCH_OPERATION_TIMEOUT: z.string().transform(Number).default('300000'),
});

/**
 * 환경 변수 기반 타임아웃 설정
 */
export function getAITimeoutConfig() {
  try {
    const envConfig = AITimeoutEnvSchema.parse(process.env);
    return {
      HEALTH_CHECK: envConfig.AI_HEALTH_CHECK_TIMEOUT,
      CHAT_MESSAGE: envConfig.AI_CHAT_TIMEOUT,
      QUESTION_GENERATION: envConfig.AI_QUESTION_GENERATION_TIMEOUT,
      STUDENT_ANALYSIS: envConfig.AI_STUDENT_ANALYSIS_TIMEOUT,
      FILE_UPLOAD: envConfig.AI_FILE_UPLOAD_TIMEOUT,
      DATA_SYNC: envConfig.AI_DATA_SYNC_TIMEOUT,
      BATCH_OPERATION: envConfig.AI_BATCH_OPERATION_TIMEOUT,
    };
  } catch (error) {
    console.warn('Failed to parse AI timeout config from environment, using defaults:', error);
    return AI_TIMEOUT_CONFIG;
  }
}

/**
 * AbortController를 생성하고 타임아웃을 설정하는 헬퍼 함수
 */
export function createTimeoutController(timeoutMs: number): AbortController {
  const controller = new AbortController();

  const timeoutId = setTimeout(() => {
    controller.abort();
  }, timeoutMs);

  // AbortController가 abort되면 timeout을 정리
  controller.signal.addEventListener('abort', () => {
    clearTimeout(timeoutId);
  });

  return controller;
}

/**
 * fetch 요청에 타임아웃을 적용하는 헬퍼 함수
 */
export async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeoutMs: number = AI_TIMEOUT_CONFIG.CHAT_MESSAGE,
): Promise<Response> {
  const controller = createTimeoutController(timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });

    return response;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Request timeout after ${timeoutMs}ms`);
    }
    throw error;
  }
}

/**
 * AI 서비스별 권장 타임아웃 설정
 */
export const AI_SERVICE_TIMEOUTS = {
  educational_ai: {
    health: AI_TIMEOUT_CONFIG.HEALTH_CHECK,
    chat: AI_TIMEOUT_CONFIG.CHAT_MESSAGE,
    questionGeneration: AI_TIMEOUT_CONFIG.QUESTION_GENERATION,
    studentAnalysis: AI_TIMEOUT_CONFIG.STUDENT_ANALYSIS,
  },
  teacher_report: {
    health: AI_TIMEOUT_CONFIG.HEALTH_CHECK,
    reportGeneration: AI_TIMEOUT_CONFIG.STUDENT_ANALYSIS,
    dataSync: AI_TIMEOUT_CONFIG.DATA_SYNC,
  },
  chroma: {
    health: AI_TIMEOUT_CONFIG.HEALTH_CHECK,
    search: AI_TIMEOUT_CONFIG.CHAT_MESSAGE,
    upload: AI_TIMEOUT_CONFIG.FILE_UPLOAD,
  },
} as const;

/**
 * 서비스와 작업 유형에 따른 타임아웃 조회
 */
export function getTimeoutForService(
  service: keyof typeof AI_SERVICE_TIMEOUTS,
  operation: string,
): number {
  const serviceConfig = AI_SERVICE_TIMEOUTS[service];

  // 정확한 매치를 찾기
  if (operation in serviceConfig) {
    return serviceConfig[operation as keyof typeof serviceConfig];
  }

  // 기본값 반환
  return AI_TIMEOUT_CONFIG.CHAT_MESSAGE;
}
