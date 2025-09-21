import { prisma } from '@/lib/core/prisma';
import type { Prisma } from '@prisma/client';

export class UserRepository {
  async findMany(where: Prisma.UserWhereInput, page: number, limit: number) {
    const [items, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { preferences: true },
      }),
      prisma.user.count({ where }),
    ]);
    return { items, total };
  }

  async findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      include: { preferences: true },
    });
  }

  async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
      include: { preferences: true },
    });
  }

  async findByRole(role: string, page: number, limit: number) {
    const [items, total] = await Promise.all([
      prisma.user.findMany({
        where: { role },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { preferences: true },
      }),
      prisma.user.count({ where: { role } }),
    ]);
    return { items, total };
  }

  async create(data: Prisma.UserCreateInput) {
    return prisma.user.create({ data, include: { preferences: true } });
  }

  async update(id: string, data: Prisma.UserUpdateInput) {
    return prisma.user.update({
      where: { id },
      data,
      include: { preferences: true },
    });
  }

  async updateRole(id: string, role: string) {
    return prisma.user.update({
      where: { id },
      data: { role },
      include: { preferences: true },
    });
  }

  async delete(id: string) {
    return prisma.user.delete({ where: { id } });
  }

  async getStats() {
    const [totalUsers, byRole, byStatus, activeUsers] = await Promise.all([
      prisma.user.count(),
      prisma.user.groupBy({
        by: ['role'],
        _count: { role: true },
      }),
      prisma.user.groupBy({
        by: ['status'],
        _count: { status: true },
      }),
      prisma.user.count({ where: { status: 'ACTIVE' } }),
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

  async getTeachers() {
    return prisma.user.findMany({
      where: { role: 'TEACHER' },
      select: {
        id: true,
        name: true,
        email: true,
        subject: true,
        school: true,
        status: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getAdmins() {
    return prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}

export const userRepository = new UserRepository();
