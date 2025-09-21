import { z } from 'zod';

export const SearchQueryItemSchema = z.object({
  id: z.string(),
  userId: z.string(),
  queryText: z.string(),
  subject: z.string().nullable().optional(),
  gradeLevel: z.string().nullable().optional(),
  unit: z.string().nullable().optional(),
  searchTimeMs: z.number().nullable().optional(),
  createdAt: z.date(),
  user: z
    .object({
      id: z.string(),
      name: z.string(),
      email: z.string(),
    })
    .optional(),
  results: z
    .array(
      z.object({
        id: z.string(),
        queryId: z.string(),
        chunkId: z.string(),
        similarityScore: z.number(),
        rankPosition: z.number(),
        createdAt: z.date(),
        chunk: z.object({
          id: z.string(),
          content: z.string(),
          chunkIndex: z.number(),
        }),
      }),
    )
    .optional(),
});

export const SearchResultItemSchema = z.object({
  id: z.string(),
  queryId: z.string(),
  chunkId: z.string(),
  similarityScore: z.number(),
  rankPosition: z.number(),
  createdAt: z.date(),
  query: z
    .object({
      id: z.string(),
      queryText: z.string(),
      userId: z.string(),
    })
    .optional(),
  chunk: z
    .object({
      id: z.string(),
      content: z.string(),
      chunkIndex: z.number(),
      textbook: z.object({
        id: z.string(),
        title: z.string(),
        subject: z.string(),
      }),
    })
    .optional(),
});

export const SearchQueryListResponseSchema = z.object({
  queries: z.array(SearchQueryItemSchema),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
});

export const SearchResultListResponseSchema = z.object({
  results: z.array(SearchResultItemSchema),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
});

export const SearchQueryDetailResponseSchema = SearchQueryItemSchema;
export const SearchResultDetailResponseSchema = SearchResultItemSchema;
export const SearchQueryResponseDto = SearchQueryItemSchema;
export const SearchResultResponseDto = SearchResultItemSchema;

// 검색 쿼리 생성 DTO
export const CreateSearchQueryDto = z.object({
  queryText: z.string().min(1),
  subject: z.string().optional(),
  gradeLevel: z.string().optional(),
  unit: z.string().optional(),
  searchTimeMs: z.number().optional(),
});

// 검색 결과 생성 DTO
export const CreateSearchResultDto = z.object({
  queryId: z.string(),
  chunkId: z.string(),
  similarityScore: z.number().min(0).max(1),
  rankPosition: z.number().min(1),
});

// 검색 쿼리 목록 조회 DTO
export const SearchQueryListQueryDto = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  userId: z.string().optional(),
  subject: z.string().optional(),
  gradeLevel: z.string().optional(),
  search: z.string().optional(),
});

// 검색 결과 목록 조회 DTO
export const SearchResultListQueryDto = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  queryId: z.string().optional(),
  chunkId: z.string().optional(),
  minSimilarityScore: z.number().min(0).max(1).optional(),
});

export type SearchQueryItem = z.infer<typeof SearchQueryItemSchema>;
export type SearchResultItem = z.infer<typeof SearchResultItemSchema>;
export type SearchQueryListResponse = z.infer<typeof SearchQueryListResponseSchema>;
export type SearchResultListResponse = z.infer<typeof SearchResultListResponseSchema>;
export type SearchQueryDetailResponse = z.infer<typeof SearchQueryDetailResponseSchema>;
export type SearchResultDetailResponse = z.infer<typeof SearchResultDetailResponseSchema>;
export type SearchQueryResponseDtoType = z.infer<typeof SearchQueryResponseDto>;
export type SearchResultResponseDtoType = z.infer<typeof SearchResultResponseDto>;
export type CreateSearchQueryDtoType = z.infer<typeof CreateSearchQueryDto>;
export type CreateSearchResultDtoType = z.infer<typeof CreateSearchResultDto>;
export type SearchQueryListQueryDtoType = z.infer<typeof SearchQueryListQueryDto>;
export type SearchResultListQueryDtoType = z.infer<typeof SearchResultListQueryDto>;
