import { z } from 'zod';

export const UserItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  role: z.enum(['STUDENT', 'TEACHER', 'ADMIN']),
  grade: z.string().nullable().optional(),
  school: z.string().nullable().optional(),
  subject: z.string().nullable().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED', 'DELETED']),
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

// 사용자 생성/업데이트 DTO 추가
export const CreateUserDto = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  role: z.enum(['STUDENT', 'TEACHER', 'ADMIN']),
  avatar: z.string().url().optional(),
  bio: z.string().optional(),
  grade: z.string().optional(),
  school: z.string().optional(),
  subject: z.string().optional(),
});

export const UpdateUserDto = z.object({
  name: z.string().min(1).optional(),
  avatar: z.string().url().optional(),
  bio: z.string().optional(),
  grade: z.string().optional(),
  school: z.string().optional(),
  subject: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED', 'DELETED']).optional(),
});

export const UserListQueryDto = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  role: z.enum(['STUDENT', 'TEACHER', 'ADMIN']).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED', 'DELETED']).optional(),
  search: z.string().optional(),
});

export const UserRoleSetupDto = z.object({
  role: z.enum(['STUDENT', 'TEACHER']),
  school: z.string().optional(),
  grade: z.string().optional(),
  subject: z.string().optional(),
});

export const UserResponseDto = UserItemSchema;

export type UserItem = z.infer<typeof UserItemSchema>;
export type UserListResponse = z.infer<typeof UserListResponseSchema>;
export type UserDetailResponse = z.infer<typeof UserDetailResponseSchema>;
export type UserStats = z.infer<typeof UserStatsSchema>;
export type CreateUserDtoType = z.infer<typeof CreateUserDto>;
export type UpdateUserDtoType = z.infer<typeof UpdateUserDto>;
export type UserListQueryDtoType = z.infer<typeof UserListQueryDto>;
export type UserRoleSetupDtoType = z.infer<typeof UserRoleSetupDto>;
