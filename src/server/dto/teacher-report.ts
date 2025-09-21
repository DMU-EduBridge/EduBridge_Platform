import { z } from 'zod';

export const TeacherReportItemSchema = z.object({
  id: z.string(),
  teacherId: z.string(),
  title: z.string(),
  content: z.string(),
  reportType: z.string(),
  classInfo: z.string(),
  studentCount: z.number(),
  analysis: z.string().nullable().optional(),
  status: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  teacher: z
    .object({
      id: z.string(),
      name: z.string(),
      email: z.string(),
      subject: z.string().nullable().optional(),
    })
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

export const TeacherReportDetailResponseSchema = TeacherReportItemSchema.extend({
  classInfo: z.any(),
  analysis: z.any().optional(),
});

export const TeacherReportStatsSchema = z.object({
  totalReports: z.number(),
  completedReports: z.number(),
  completionRate: z.number(),
  recentReports: z.number(),
  byType: z.record(z.string(), z.number()),
  byStatus: z.record(z.string(), z.number()),
});

export type TeacherReportItem = z.infer<typeof TeacherReportItemSchema>;
export type TeacherReportListResponse = z.infer<typeof TeacherReportListResponseSchema>;
export type TeacherReportDetailResponse = z.infer<typeof TeacherReportDetailResponseSchema>;
export type TeacherReportStats = z.infer<typeof TeacherReportStatsSchema>;
