import { z } from 'zod';

export const StudentItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  grade: z.string().nullable().optional(),
  status: z.string(),
  progress: z.number(),
  completedProblems: z.number(),
  totalProblems: z.number(),
  averageScore: z.number(),
  subjects: z.array(z.string()),
  joinDate: z.string(),
  lastActivity: z.string(),
});

export const StudentListResponseSchema = z.object({
  students: z.array(StudentItemSchema),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
});

export type StudentItem = z.infer<typeof StudentItemSchema>;
export type StudentListResponse = z.infer<typeof StudentListResponseSchema>;
