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
  insights: z.array(z.string()),
  recommendations: z.array(z.string()),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  createdAt: z.date(),
  student: z
    .object({
      id: z.string(),
      name: z.string(),
      email: z.string(),
    })
    .optional(),
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
