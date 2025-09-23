import { z } from 'zod';

export const ProblemItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().nullable().optional(),
  content: z.string(),
  subject: z.string(),
  type: z.enum(['MULTIPLE_CHOICE', 'SHORT_ANSWER', 'ESSAY', 'TRUE_FALSE']),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']),
  gradeLevel: z.string().nullable().optional(),
  unit: z.string().nullable().optional(),
  options: z.array(z.string()).optional(),
  correctAnswer: z.string(),
  explanation: z.string().nullable().optional(),
  hints: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  points: z.number(),
  timeLimit: z.number().nullable().optional(),
  isActive: z.boolean(),
  isAIGenerated: z.boolean(),
  qualityScore: z.number().nullable().optional(),
  reviewStatus: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'NEEDS_REVISION']),
  reviewedBy: z.string().nullable().optional(),
  reviewedAt: z.date().nullable().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const ProblemListResponseSchema = z.object({
  problems: z.array(ProblemItemSchema.partial({ options: true, hints: true, tags: true })),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
});

export const ProblemDetailResponseSchema = ProblemItemSchema;
export const ProblemResponseDto = ProblemItemSchema;

// 문제 생성/업데이트 DTO 추가
export const CreateProblemDto = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  content: z.string().min(1),
  subject: z.string().min(1),
  type: z.enum(['MULTIPLE_CHOICE', 'SHORT_ANSWER', 'ESSAY', 'TRUE_FALSE']),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']),
  gradeLevel: z.string().optional(),
  unit: z.string().optional(),
  options: z.array(z.string()).optional(),
  correctAnswer: z.string().min(1),
  explanation: z.string().optional(),
  hints: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  points: z.number().min(1).default(1),
  timeLimit: z.number().min(1).optional(),
  textbookId: z.string().optional(),
  // AI 관련 필드들
  generationPrompt: z.string().optional(),
  contextChunkIds: z.string().optional(),
  generationTimeMs: z.number().optional(),
  modelName: z.string().optional(),
  tokensUsed: z.number().optional(),
  costUsd: z.number().optional(),
});

export const UpdateProblemDto = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  content: z.string().min(1).optional(),
  subject: z.string().min(1).optional(),
  type: z.enum(['MULTIPLE_CHOICE', 'SHORT_ANSWER', 'ESSAY', 'TRUE_FALSE']).optional(),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']).optional(),
  gradeLevel: z.string().optional(),
  unit: z.string().optional(),
  options: z.array(z.string()).optional(),
  correctAnswer: z.string().min(1).optional(),
  explanation: z.string().optional(),
  hints: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  points: z.number().min(1).optional(),
  timeLimit: z.number().min(1).optional(),
  isActive: z.boolean().optional(),
  reviewStatus: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'NEEDS_REVISION']).optional(),
});

export const ProblemListQueryDto = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  subject: z.string().optional(),
  gradeLevel: z.string().optional(),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']).optional(),
  type: z.enum(['MULTIPLE_CHOICE', 'SHORT_ANSWER', 'ESSAY', 'TRUE_FALSE']).optional(),
  textbookId: z.string().optional(),
  isAIGenerated: z.boolean().optional(),
  reviewStatus: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'NEEDS_REVISION']).optional(),
  search: z.string().optional(),
});

export type ProblemItem = z.infer<typeof ProblemItemSchema>;
export type ProblemListResponse = z.infer<typeof ProblemListResponseSchema>;
export type ProblemDetailResponse = z.infer<typeof ProblemDetailResponseSchema>;
export type CreateProblemDtoType = z.infer<typeof CreateProblemDto>;
export type UpdateProblemDtoType = z.infer<typeof UpdateProblemDto>;
export type ProblemListQueryDtoType = z.infer<typeof ProblemListQueryDto>;
