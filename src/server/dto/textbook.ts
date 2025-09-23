import { z } from 'zod';

export const TextbookItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  subject: z.string(),
  gradeLevel: z.string(),
  publisher: z.string().nullable().optional(),
  isbn: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  coverImageUrl: z.string().nullable().optional(),
  totalPages: z.number().nullable().optional(),
  processingStatus: z.enum(['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED']),
  createdAt: z.date(),
  updatedAt: z.date(),
  userId: z.string(),
  user: z
    .object({
      id: z.string(),
      name: z.string(),
      email: z.string(),
    })
    .optional(),
  chunks: z
    .array(
      z.object({
        id: z.string(),
        chunkIndex: z.number(),
        content: z.string(),
        contentLength: z.number(),
      }),
    )
    .optional(),
});

export const TextbookListResponseSchema = z.object({
  textbooks: z.array(TextbookItemSchema),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
});

export const TextbookDetailResponseSchema = TextbookItemSchema;
export const TextbookResponseDto = TextbookItemSchema;

// 교과서 생성/업데이트 DTO
export const CreateTextbookDto = z.object({
  title: z.string().min(1),
  subject: z.string().min(1),
  gradeLevel: z.string().min(1),
  publisher: z.string().optional(),
  isbn: z.string().optional(),
  description: z.string().optional(),
  coverImageUrl: z.string().url().optional(),
  totalPages: z.number().min(1).optional(),
});

export const UpdateTextbookDto = z.object({
  title: z.string().min(1).optional(),
  subject: z.string().min(1).optional(),
  gradeLevel: z.string().min(1).optional(),
  publisher: z.string().optional(),
  isbn: z.string().optional(),
  description: z.string().optional(),
  coverImageUrl: z.string().url().optional(),
  totalPages: z.number().min(1).optional(),
  processingStatus: z.enum(['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED']).optional(),
});

export const TextbookListQueryDto = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  subject: z.string().optional(),
  gradeLevel: z.string().optional(),
  publisher: z.string().optional(),
  processingStatus: z.enum(['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED']).optional(),
  search: z.string().optional(),
});

export type TextbookItem = z.infer<typeof TextbookItemSchema>;
export type TextbookListResponse = z.infer<typeof TextbookListResponseSchema>;
export type TextbookDetailResponse = z.infer<typeof TextbookDetailResponseSchema>;
export type TextbookResponseDtoType = z.infer<typeof TextbookResponseDto>;
export type CreateTextbookDtoType = z.infer<typeof CreateTextbookDto>;
export type UpdateTextbookDtoType = z.infer<typeof UpdateTextbookDto>;
export type TextbookListQueryDtoType = z.infer<typeof TextbookListQueryDto>;
