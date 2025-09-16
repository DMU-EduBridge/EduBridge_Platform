import { z } from 'zod';

export const ReportItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  type: z.string(),
  period: z.string(),
  status: z.string(),
  students: z.number(),
  totalProblems: z.number(),
  averageScore: z.number(),
  completionRate: z.number(),
  insights: z.array(z.any()),
  recommendations: z.array(z.any()),
  strengths: z.array(z.any()),
  weaknesses: z.array(z.any()),
  createdAt: z.any(),
  student: z.any().optional(),
});

export const ReportListResponseSchema = z.object({
  reports: z.array(ReportItemSchema),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
});

export const ReportDetailResponseSchema = ReportItemSchema;

export type ReportItem = z.infer<typeof ReportItemSchema>;
export type ReportListResponse = z.infer<typeof ReportListResponseSchema>;
export type ReportDetailResponse = z.infer<typeof ReportDetailResponseSchema>;
