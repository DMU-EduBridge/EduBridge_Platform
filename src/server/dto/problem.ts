import { z } from 'zod';

export const ProblemItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().nullable().optional(),
  content: z.string(),
  subject: z.string(),
  type: z.string(),
  difficulty: z.string(),
  options: z.array(z.string()).optional(),
  correctAnswer: z.string(),
  hints: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
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

export type ProblemItem = z.infer<typeof ProblemItemSchema>;
export type ProblemListResponse = z.infer<typeof ProblemListResponseSchema>;
export type ProblemDetailResponse = z.infer<typeof ProblemDetailResponseSchema>;
