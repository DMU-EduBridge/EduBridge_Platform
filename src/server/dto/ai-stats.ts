import { z } from 'zod';

export const AIApiUsageItemSchema = z.object({
  id: z.string(),
  userId: z.string(),
  apiType: z.string(),
  tokensUsed: z.number(),
  costUsd: z.number(),
  createdAt: z.date(),
  user: z
    .object({
      id: z.string(),
      name: z.string(),
      email: z.string(),
    })
    .optional(),
});

export const AIPerformanceMetricItemSchema = z.object({
  id: z.string(),
  operationType: z.string(),
  durationMs: z.number(),
  success: z.boolean(),
  errorMessage: z.string().nullable().optional(),
  metadata: z.record(z.any()).nullable().optional(), // JSON field
  userId: z.string().nullable().optional(),
  createdAt: z.date(),
  user: z
    .object({
      id: z.string(),
      name: z.string(),
      email: z.string(),
    })
    .optional(),
});

export const AIUsageStatisticsItemSchema = z.object({
  id: z.string(),
  userId: z.string(),
  date: z.string(), // YYYY-MM-DD format
  totalTokensUsed: z.number(),
  totalCostUsd: z.number(),
  apiCallCount: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
  user: z
    .object({
      id: z.string(),
      name: z.string(),
      email: z.string(),
    })
    .optional(),
});

export const AIApiUsageListResponseSchema = z.object({
  usages: z.array(AIApiUsageItemSchema),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
});

export const AIPerformanceMetricListResponseSchema = z.object({
  metrics: z.array(AIPerformanceMetricItemSchema),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
});

export const AIUsageStatisticsListResponseSchema = z.object({
  statistics: z.array(AIUsageStatisticsItemSchema),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
});

export const AIApiUsageResponseDto = AIApiUsageItemSchema;
export const AIPerformanceMetricResponseDto = AIPerformanceMetricItemSchema;
export const AIUsageStatisticsResponseDto = AIUsageStatisticsItemSchema;

// AI API 사용량 생성 DTO
export const CreateAIApiUsageDto = z.object({
  apiType: z.string().min(1),
  tokensUsed: z.number().min(0),
  costUsd: z.number().min(0),
});

// AI 성능 메트릭 생성 DTO
export const CreateAIPerformanceMetricDto = z.object({
  operationType: z.string().min(1),
  durationMs: z.number().min(0),
  success: z.boolean(),
  errorMessage: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

// AI 사용 통계 생성 DTO
export const CreateAIUsageStatisticsDto = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // YYYY-MM-DD format
  totalTokensUsed: z.number().min(0),
  totalCostUsd: z.number().min(0),
  apiCallCount: z.number().min(0),
});

// AI API 사용량 목록 조회 DTO
export const AIApiUsageListQueryDto = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  userId: z.string().optional(),
  apiType: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

// AI 성능 메트릭 목록 조회 DTO
export const AIPerformanceMetricListQueryDto = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  userId: z.string().optional(),
  operationType: z.string().optional(),
  success: z.boolean().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

// AI 사용 통계 목록 조회 DTO
export const AIUsageStatisticsListQueryDto = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  userId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export type AIApiUsageItem = z.infer<typeof AIApiUsageItemSchema>;
export type AIPerformanceMetricItem = z.infer<typeof AIPerformanceMetricItemSchema>;
export type AIUsageStatisticsItem = z.infer<typeof AIUsageStatisticsItemSchema>;
export type AIApiUsageListResponse = z.infer<typeof AIApiUsageListResponseSchema>;
export type AIPerformanceMetricListResponse = z.infer<typeof AIPerformanceMetricListResponseSchema>;
export type AIUsageStatisticsListResponse = z.infer<typeof AIUsageStatisticsListResponseSchema>;
export type AIApiUsageResponseDtoType = z.infer<typeof AIApiUsageResponseDto>;
export type AIPerformanceMetricResponseDtoType = z.infer<typeof AIPerformanceMetricResponseDto>;
export type AIUsageStatisticsResponseDtoType = z.infer<typeof AIUsageStatisticsResponseDto>;
export type CreateAIApiUsageDtoType = z.infer<typeof CreateAIApiUsageDto>;
export type CreateAIPerformanceMetricDtoType = z.infer<typeof CreateAIPerformanceMetricDto>;
export type CreateAIUsageStatisticsDtoType = z.infer<typeof CreateAIUsageStatisticsDto>;
export type AIApiUsageListQueryDtoType = z.infer<typeof AIApiUsageListQueryDto>;
export type AIPerformanceMetricListQueryDtoType = z.infer<typeof AIPerformanceMetricListQueryDto>;
export type AIUsageStatisticsListQueryDtoType = z.infer<typeof AIUsageStatisticsListQueryDto>;
