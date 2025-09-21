import { z } from 'zod';
// API 응답 타입 정의
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// 에러 응답 타입
export interface ApiError {
  error: string;
  success: false;
  statusCode?: number;
}

// Attempts
export interface AttemptItem {
  id: string;
  selected: string;
  isCorrect: boolean;
  createdAt: string;
}

export type AttemptsResponse = AttemptItem[];

export interface AttemptPostBody {
  selected: string;
}

// Solution
export interface SolutionResponse {
  correctAnswer: string;
  explanation: string | null;
  hints: string[];
}

// Zod Schemas (공유 DTO)
export const AttemptPostSchema = z.object({ selected: z.string().min(1) });
export type AttemptPostDto = z.infer<typeof AttemptPostSchema>;

export const SolutionResponseSchema = z.object({
  correctAnswer: z.string(),
  explanation: z.string().nullable(),
  hints: z.array(z.string()),
});

export const AttemptsResponseSchema = z.array(
  z.object({
    id: z.string(),
    selected: z.string(),
    isCorrect: z.boolean(),
    createdAt: z.string(),
  }),
);

export const AttemptPostResponseSchema = z.object({ correct: z.boolean() });
export type AttemptPostResponse = z.infer<typeof AttemptPostResponseSchema>;

export const CreateProblemSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  content: z.string().min(1),
  subject: z.string().min(1),
  type: z.enum(['MULTIPLE_CHOICE', 'SHORT_ANSWER', 'ESSAY', 'TRUE_FALSE']),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']),
  options: z.array(z.string()).optional(),
  correctAnswer: z.string().min(1),
  hints: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
});
export type CreateProblemDto = z.infer<typeof CreateProblemSchema>;

// 통계 응답 타입
export interface StatsResponse {
  totalProblems?: number;
  activeProblems?: number;
  bySubject?: Record<string, number>;
  byDifficulty?: Record<string, number>;
  totalStudents?: number;
  activeStudents?: number;
  byGrade?: Record<string, number>;
  averageScore?: number;
  completionRate?: number;
  totalReports?: number;
  completedReports?: number;
  pendingReports?: number;
}

// 문제 생성/수정 요청 타입
export interface CreateProblemRequest {
  title: string;
  description: string;
  content: string;
  subject: string;
  type: 'MULTIPLE_CHOICE' | 'SHORT_ANSWER' | 'ESSAY' | 'TRUE_FALSE';
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  options?: string[];
  correctAnswer: string;
  hints?: string[];
  tags?: string[];
}

export interface UpdateProblemRequest extends Partial<CreateProblemRequest> {
  id: string;
}

// 학생 생성/수정 요청 타입
export interface CreateStudentRequest {
  name: string;
  email: string;
  grade: string;
  subjects?: string[];
  learningStyle?: string[];
  interests?: string[];
}

export interface UpdateStudentRequest extends Partial<CreateStudentRequest> {
  id: string;
}

// 리포트 생성 요청 타입
export interface CreateReportRequest {
  title: string;
  type: string;
  period: string;
  studentIds?: string[];
  subjectIds?: string[];
}

// 학습 자료 생성/수정 요청 타입
export interface CreateLearningMaterialRequest {
  title: string;
  description?: string;
  content: string;
  subject: string;
  difficulty: string;
  estimatedTime?: number;
  files?: string[];
  status: string;
}

export interface UpdateLearningMaterialRequest extends Partial<CreateLearningMaterialRequest> {
  id: string;
}
