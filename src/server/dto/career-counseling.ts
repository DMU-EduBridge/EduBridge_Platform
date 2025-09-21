import { z } from 'zod';

export const CareerCounselingItemSchema = z.object({
  id: z.string(),
  studentId: z.string(),
  type: z.string(),
  title: z.string(),
  content: z.string(),
  careerSuggestions: z.string(),
  universityRecommendations: z.string(),
  skillGaps: z.string(),
  status: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  student: z
    .object({
      id: z.string(),
      name: z.string(),
      email: z.string(),
      grade: z.string().nullable().optional(),
    })
    .optional(),
});

export const CareerCounselingListResponseSchema = z.object({
  counselings: z.array(CareerCounselingItemSchema),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
});

export const CareerCounselingDetailResponseSchema = CareerCounselingItemSchema.extend({
  careerSuggestions: z.array(z.string()),
  universityRecommendations: z.array(z.string()),
  skillGaps: z.array(z.string()),
});

export const CareerCounselingStatsSchema = z.object({
  totalCounselings: z.number(),
  completedCounselings: z.number(),
  completionRate: z.number(),
  recentCounselings: z.number(),
  byType: z.record(z.string(), z.number()),
  byStatus: z.record(z.string(), z.number()),
});

export type CareerCounselingItem = z.infer<typeof CareerCounselingItemSchema>;
export type CareerCounselingListResponse = z.infer<typeof CareerCounselingListResponseSchema>;
export type CareerCounselingDetailResponse = z.infer<typeof CareerCounselingDetailResponseSchema>;
export type CareerCounselingStats = z.infer<typeof CareerCounselingStatsSchema>;
