import { prisma } from '@/lib/core/prisma';
import { Prisma, User } from '@prisma/client';
import { CreateUserDtoType, UpdateUserDtoType, UserListQueryDtoType } from '../dto/user';

export class UserRepository {
  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
      include: {
        preferences: true,
      },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email },
      include: {
        preferences: true,
      },
    });
  }

  async findMany(query: UserListQueryDtoType): Promise<{ users: User[]; total: number }> {
    const { page, limit, role, status, search } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = {
      deletedAt: null, // 소프트 삭제되지 않은 사용자만
    };

    if (role) where.role = role;
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { school: { contains: search } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          preferences: true,
        },
      }),
      prisma.user.count({ where }),
    ]);

    return { users, total };
  }

  async create(data: CreateUserDtoType): Promise<User> {
    return prisma.user.create({
      data: {
        ...data,
        status: 'ACTIVE',
      },
      include: {
        preferences: true,
      },
    });
  }

  async update(id: string, data: UpdateUserDtoType): Promise<User> {
    return prisma.user.update({
      where: { id },
      data,
      include: {
        preferences: true,
      },
    });
  }

  async softDelete(id: string): Promise<User> {
    return prisma.user.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        status: 'DELETED',
      },
      include: {
        preferences: true,
      },
    });
  }

  async getStats(): Promise<{
    totalUsers: number;
    activeUsers: number;
    byRole: Record<string, number>;
    byStatus: Record<string, number>;
  }> {
    const [totalUsers, activeUsers, byRole, byStatus] = await Promise.all([
      prisma.user.count({ where: { deletedAt: null } }),
      prisma.user.count({ where: { status: 'ACTIVE', deletedAt: null } }),
      prisma.user.groupBy({
        by: ['role'],
        _count: { role: true },
        where: { deletedAt: null },
      }),
      prisma.user.groupBy({
        by: ['status'],
        _count: { status: true },
        where: { deletedAt: null },
      }),
    ]);

    return {
      totalUsers,
      activeUsers,
      byRole: byRole.reduce(
        (acc, item) => {
          acc[item.role] = item._count.role;
          return acc;
        },
        {} as Record<string, number>,
      ),
      byStatus: byStatus.reduce(
        (acc, item) => {
          acc[item.status] = item._count.status;
          return acc;
        },
        {} as Record<string, number>,
      ),
    };
  }

  async findByRole(role: 'STUDENT' | 'TEACHER' | 'ADMIN'): Promise<User[]> {
    return prisma.user.findMany({
      where: {
        role,
        deletedAt: null,
      },
      orderBy: { createdAt: 'desc' },
      include: {
        preferences: true,
      },
    });
  }

  async updateRole(id: string, role: 'STUDENT' | 'TEACHER' | 'ADMIN'): Promise<User> {
    return prisma.user.update({
      where: { id },
      data: { role },
      include: {
        preferences: true,
      },
    });
  }
}
