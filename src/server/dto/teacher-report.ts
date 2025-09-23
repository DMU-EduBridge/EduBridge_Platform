import { z } from 'zod';

export const TeacherReportItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().nullable().optional(),
  classInfo: z.record(z.any()).nullable().optional(), // JSON field
  students: z.record(z.any()).nullable().optional(), // JSON field
  analysisData: z.record(z.any()).nullable().optional(), // JSON field
  metadata: z.record(z.any()).nullable().optional(), // JSON field
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']),
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
  analyses: z
    .array(
      z.object({
        id: z.string(),
        analysisType: z.enum(['PERFORMANCE', 'BEHAVIOR', 'ATTENDANCE', 'ENGAGEMENT']),
        analysisData: z.record(z.any()),
        createdAt: z.date(),
      }),
    )
    .optional(),
});

export const TeacherReportListResponseSchema = z.object({
  reports: z.array(TeacherReportItemSchema),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
});

export const TeacherReportDetailResponseSchema = TeacherReportItemSchema;
export const TeacherReportResponseDto = TeacherReportItemSchema;

// 교사 리포트 생성/업데이트 DTO
export const CreateTeacherReportDto = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  classInfo: z.record(z.any()).optional(),
  students: z.record(z.any()).optional(),
  analysisData: z.record(z.any()).optional(),
  metadata: z.record(z.any()).optional(),
});

export const UpdateTeacherReportDto = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  classInfo: z.record(z.any()).optional(),
  students: z.record(z.any()).optional(),
  analysisData: z.record(z.any()).optional(),
  metadata: z.record(z.any()).optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),
});

export const TeacherReportListQueryDto = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),
  search: z.string().optional(),
});

// 리포트 분석 생성 DTO
export const CreateReportAnalysisDto = z.object({
  reportId: z.string(),
  analysisType: z.enum(['PERFORMANCE', 'BEHAVIOR', 'ATTENDANCE', 'ENGAGEMENT']),
  analysisData: z.record(z.any()),
});

export type TeacherReportItem = z.infer<typeof TeacherReportItemSchema>;
export type TeacherReportListResponse = z.infer<typeof TeacherReportListResponseSchema>;
export type TeacherReportDetailResponse = z.infer<typeof TeacherReportDetailResponseSchema>;
export type TeacherReportResponseDtoType = z.infer<typeof TeacherReportResponseDto>;
export type CreateTeacherReportDtoType = z.infer<typeof CreateTeacherReportDto>;
export type UpdateTeacherReportDtoType = z.infer<typeof UpdateTeacherReportDto>;
export type TeacherReportListQueryDtoType = z.infer<typeof TeacherReportListQueryDto>;
export type CreateReportAnalysisDtoType = z.infer<typeof CreateReportAnalysisDto>;