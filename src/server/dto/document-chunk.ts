import { z } from 'zod';

export const DocumentChunkItemSchema = z.object({
  id: z.string(),
  textbookId: z.string(),
  chunkIndex: z.number(),
  content: z.string(),
  contentLength: z.number(),
  embeddingId: z.string().nullable().optional(),
  metadata: z.record(z.any()).nullable().optional(), // JSON field
  createdAt: z.date(),
  updatedAt: z.date(),
  textbook: z
    .object({
      id: z.string(),
      title: z.string(),
      subject: z.string(),
      gradeLevel: z.string(),
    })
    .optional(),
});

export const DocumentChunkListResponseSchema = z.object({
  chunks: z.array(DocumentChunkItemSchema),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
});

export const DocumentChunkDetailResponseSchema = DocumentChunkItemSchema;
export const DocumentChunkResponseDto = DocumentChunkItemSchema;

// 문서 청크 생성/업데이트 DTO
export const CreateDocumentChunkDto = z.object({
  textbookId: z.string(),
  chunkIndex: z.number().min(0),
  content: z.string().min(1),
  contentLength: z.number().min(1),
  embeddingId: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

export const UpdateDocumentChunkDto = z.object({
  chunkIndex: z.number().min(0).optional(),
  content: z.string().min(1).optional(),
  contentLength: z.number().min(1).optional(),
  embeddingId: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

export const DocumentChunkListQueryDto = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  textbookId: z.string().optional(),
  search: z.string().optional(),
});

// 벡터 검색 DTO
export const VectorSearchDto = z.object({
  query: z.string().min(1),
  textbookId: z.string().optional(),
  limit: z.number().min(1).max(50).default(10),
  threshold: z.number().min(0).max(1).default(0.7),
});

export type DocumentChunkItem = z.infer<typeof DocumentChunkItemSchema>;
export type DocumentChunkListResponse = z.infer<typeof DocumentChunkListResponseSchema>;
export type DocumentChunkDetailResponse = z.infer<typeof DocumentChunkDetailResponseSchema>;
export type DocumentChunkResponseDtoType = z.infer<typeof DocumentChunkResponseDto>;
export type CreateDocumentChunkDtoType = z.infer<typeof CreateDocumentChunkDto>;
export type UpdateDocumentChunkDtoType = z.infer<typeof UpdateDocumentChunkDto>;
export type DocumentChunkListQueryDtoType = z.infer<typeof DocumentChunkListQueryDto>;
export type VectorSearchDtoType = z.infer<typeof VectorSearchDto>;
