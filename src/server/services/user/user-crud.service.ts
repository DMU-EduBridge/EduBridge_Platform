import { Prisma, User } from '@prisma/client';
import { z } from 'zod';
import { prisma } from '../../../lib/core/prisma';
import { handlePrismaError } from '../../../lib/errors';
import { logger } from '../../../lib/monitoring';
import { CreateUserRequest, UpdateUserRequest, UserQueryParams } from '../../../types/domain/user';

const UserQuerySchema = z.object({
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().optional(),
  search: z.string().optional(),
  role: z.string().optional(),
  status: z.string().optional(),
  subject: z.string().optional(),
  gradeLevel: z.string().optional(),
});

const CreateUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1),
  role: z.string(),
  avatar: z.string().url().optional().nullable(),
  bio: z.string().optional().nullable(),
  gradeLevel: z.string().optional().nullable(),
  school: z.string().optional().nullable(),
  subject: z.string().optional().nullable(),
  status: z.string().optional(),
});

export class UserCrudService {
  async getUserById(id: string): Promise<User | null> {
    try {
      return await prisma.user.findUnique({
        where: { id },
      });
    } catch (error) {
      logger.error('사용자 조회 실패', undefined, {
        userId: id,
        error: error instanceof Error ? error.message : String(error),
      });
      throw handlePrismaError(error as Prisma.PrismaClientKnownRequestError);
    }
  }

  async getUserByEmail(email: string): Promise<User | null> {
    try {
      return await prisma.user.findUnique({
        where: { email },
      });
    } catch (error) {
      logger.error('이메일로 사용자 조회 실패', undefined, {
        email,
        error: error instanceof Error ? error.message : String(error),
      });
      throw handlePrismaError(error as Prisma.PrismaClientKnownRequestError);
    }
  }

  async getUsers(
    query: UserQueryParams,
  ): Promise<{ users: User[]; total: number; pagination: any }> {
    try {
      const validatedQuery = UserQuerySchema.safeParse(query);
      const q = (validatedQuery.success ? validatedQuery.data : {}) as UserQueryParams;

      const { page = 1, limit = 10, search, role, status, subject, gradeLevel } = q;
      const skip = (page - 1) * limit;

      const where: Prisma.UserWhereInput = {
        ...(search && {
          OR: [
            { name: { contains: search } },
            { email: { contains: search } },
            { subject: { contains: search } },
          ],
        }),
        ...(role && { role: role as any }),
        ...(status && { status: status as any }),
        ...(subject && { subject }),
        ...(gradeLevel && { gradeLevel }),
      };

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        prisma.user.count({ where }),
      ]);

      const pagination = {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      };

      return { users, total, pagination };
    } catch (error) {
      logger.error('사용자 목록 조회 실패', undefined, {
        query,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new Error('사용자 목록 조회에 실패했습니다.');
    }
  }

  async createUser(data: CreateUserRequest): Promise<User> {
    try {
      const parsed = CreateUserSchema.safeParse(data);
      const validatedData = (parsed.success ? parsed.data : (data as any)) as CreateUserRequest;

      const user = await prisma.user.create({
        data: {
          email: validatedData.email,
          password: validatedData.password,
          name: validatedData.name,
          role: validatedData.role as any,
          avatar: validatedData.avatar ?? null,
          bio: validatedData.bio ?? null,
          gradeLevel: validatedData.gradeLevel ?? null,
          school: validatedData.school ?? null,
          subject: validatedData.subject ?? null,
          status: (validatedData.status as any) ?? 'ACTIVE',
        },
      });
      logger.info('사용자 생성 성공', { userId: user.id, email: user.email });
      return user;
    } catch (error) {
      logger.error('사용자 생성 실패', undefined, {
        data,
        error: error instanceof Error ? error.message : String(error),
      });
      throw handlePrismaError(error as Prisma.PrismaClientKnownRequestError);
    }
  }

  async updateUser(id: string, data: UpdateUserRequest): Promise<User> {
    try {
      const existingUser = await prisma.user.findUnique({ where: { id } });
      if (!existingUser) {
        throw new Error('사용자를 찾을 수 없습니다.');
      }

      const user = await prisma.user.update({
        where: { id },
        data: {
          ...(data.email !== undefined ? { email: data.email } : {}),
          ...(data.name !== undefined ? { name: data.name } : {}),
          ...(data.password !== undefined ? { password: data.password } : {}),
          ...(data.role !== undefined ? { role: data.role as any } : {}),
          ...(data.avatar !== undefined ? { avatar: data.avatar } : {}),
          ...(data.bio !== undefined ? { bio: data.bio } : {}),
          ...(data.gradeLevel !== undefined ? { gradeLevel: data.gradeLevel } : {}),
          ...(data.school !== undefined ? { school: data.school } : {}),
          ...(data.subject !== undefined ? { subject: data.subject } : {}),
          ...(data.status !== undefined ? { status: data.status as any } : {}),
          ...(data.lastLoginAt !== undefined ? { lastLoginAt: data.lastLoginAt } : {}),
          ...(data.passwordResetToken !== undefined
            ? { passwordResetToken: data.passwordResetToken }
            : {}),
          ...(data.passwordResetExpires !== undefined
            ? { passwordResetExpires: data.passwordResetExpires }
            : {}),
        },
      });
      logger.info('사용자 수정 성공', { userId: user.id });
      return user;
    } catch (error) {
      logger.error('사용자 수정 실패', undefined, {
        userId: id,
        data,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error instanceof Error ? error : new Error('사용자 수정에 실패했습니다.');
    }
  }

  async deleteUser(id: string): Promise<void> {
    try {
      const existingUser = await prisma.user.findUnique({ where: { id } });
      if (!existingUser) {
        throw new Error('사용자를 찾을 수 없습니다.');
      }

      await prisma.user.delete({ where: { id } });
      logger.info('사용자 삭제 성공', { userId: id });
    } catch (error) {
      logger.error('사용자 삭제 실패', undefined, {
        userId: id,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error instanceof Error ? error : new Error('사용자 삭제에 실패했습니다.');
    }
  }

  async getUserStats(): Promise<{
    total: number;
    byRole: Record<string, number>;
    byStatus: Record<string, number>;
    bySubject: Record<string, number>;
  }> {
    try {
      const [total, roleStats, statusStats, subjectStats] = await Promise.all([
        prisma.user.count(),
        prisma.user.groupBy({
          by: ['role'],
          _count: { role: true },
        }),
        prisma.user.groupBy({
          by: ['status'],
          _count: { status: true },
        }),
        prisma.user.groupBy({
          by: ['subject'],
          _count: { subject: true },
          where: { subject: { not: null } },
        }),
      ]);

      const byRole = roleStats.reduce(
        (acc, stat) => {
          acc[stat.role] = stat._count.role;
          return acc;
        },
        {} as Record<string, number>,
      );

      const byStatus = statusStats.reduce(
        (acc, stat) => {
          acc[stat.status] = stat._count.status;
          return acc;
        },
        {} as Record<string, number>,
      );

      const bySubject = subjectStats.reduce(
        (acc, stat) => {
          if (stat.subject) {
            acc[stat.subject] = stat._count.subject;
          }
          return acc;
        },
        {} as Record<string, number>,
      );

      return { total, byRole, byStatus, bySubject };
    } catch (error) {
      logger.error('사용자 통계 조회 실패', undefined, {
        error: error instanceof Error ? error.message : String(error),
      });
      throw new Error('사용자 통계 조회에 실패했습니다.');
    }
  }
}
