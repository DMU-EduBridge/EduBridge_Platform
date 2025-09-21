import { z } from 'zod';

export const UserItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  role: z.string(),
  grade: z.string().nullable().optional(),
  school: z.string().nullable().optional(),
  subject: z.string().nullable().optional(),
  status: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  preferences: z
    .object({
      id: z.string(),
      learningStyle: z.string(),
      interests: z.string(),
      preferredDifficulty: z.string(),
    })
    .nullable()
    .optional(),
});

export const UserListResponseSchema = z.object({
  users: z.array(UserItemSchema),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
});

export const UserDetailResponseSchema = UserItemSchema;

export const UserStatsSchema = z.object({
  totalUsers: z.number(),
  activeUsers: z.number(),
  byRole: z.record(z.string(), z.number()),
  byStatus: z.record(z.string(), z.number()),
});

export type UserItem = z.infer<typeof UserItemSchema>;
export type UserListResponse = z.infer<typeof UserListResponseSchema>;
export type UserDetailResponse = z.infer<typeof UserDetailResponseSchema>;
export type UserStats = z.infer<typeof UserStatsSchema>;
