import { z } from 'zod';

// 환경변수 스키마 정의
const isDev = process.env.NODE_ENV !== 'production';
const envSchema = z.object({
  // Node.js 환경
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // 데이터베이스
  DATABASE_URL: z.string().min(1, 'DATABASE_URL이 필요합니다'),

  // NextAuth
  NEXTAUTH_SECRET: isDev
    ? z.string().min(1).default('dev-secret-change-me')
    : z.string().min(32, 'NEXTAUTH_SECRET은 최소 32자 이상이어야 합니다'),
  NEXTAUTH_URL: isDev
    ? z.string().url().default('http://localhost:3000')
    : z.string().url('올바른 URL 형식이어야 합니다'),

  // API 설정
  NEXT_PUBLIC_API_URL: z.string().url().optional(),

  // 파일 업로드
  MAX_FILE_SIZE: z.string().transform(Number).default('10485760'), // 10MB
  ALLOWED_FILE_TYPES: z.string().default('image/jpeg,image/png,image/gif,application/pdf'),

  // AI 서비스 (공통 API 키)
  OPENAI_API_KEY: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),

  // Educational AI System 연동
  EDUCATIONAL_AI_URL: z.string().url().optional(),
  // EDUCATIONAL_AI_API_KEY는 OPENAI_API_KEY와 동일하게 사용

  // Teacher Report System 연동
  TEACHER_REPORT_URL: z.string().url().optional(),
  // TEACHER_REPORT_API_KEY는 OPENAI_API_KEY와 동일하게 사용

  // Teacher Report System 설정
  TEACHER_REPORT_MODEL_NAME: z.string().default('gpt-4'),
  TEACHER_REPORT_MAX_TOKENS: z.string().transform(Number).default('4000'),
  TEACHER_REPORT_TEMPERATURE: z.string().transform(Number).default('0.7'),

  // ChromaDB 설정
  CHROMA_URL: z.string().url().default('http://localhost:8000'),
  CHROMA_API_KEY: z.string().optional(),

  // 벡터 임베딩 설정
  EMBEDDING_MODEL: z.string().default('text-embedding-ada-002'),
  EMBEDDING_DIMENSIONS: z.string().transform(Number).default('1536'),

  // 로깅
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
});

// 환경변수 검증 및 파싱
function validateEnv() {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors.map((err) => `${err.path.join('.')}: ${err.message}`);
      throw new Error(`환경변수 검증 실패:\n${missingVars.join('\n')}`);
    }
    throw error;
  }
}

// 검증된 환경변수 내보내기
export const env = validateEnv();

// 타입 안전한 환경변수 타입
export type Env = z.infer<typeof envSchema>;

// 환경변수 검증 함수
export function isProduction(): boolean {
  return env.NODE_ENV === 'production';
}

export function isDevelopment(): boolean {
  return env.NODE_ENV === 'development';
}

export function isTest(): boolean {
  return env.NODE_ENV === 'test';
}
