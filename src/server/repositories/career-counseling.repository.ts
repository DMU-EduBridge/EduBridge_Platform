import { prisma } from '@/lib/core/prisma';
import type { Prisma } from '@prisma/client';

export class CareerCounselingRepository {
  async findMany(where: Prisma.CareerCounselingWhereInput, page: number, limit: number) {
    const [items, total] = await Promise.all([
      prisma.careerCounseling.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { student: true },
      }),
      prisma.careerCounseling.count({ where }),
    ]);
    return { items, total };
  }

  async findById(id: string) {
    return prisma.careerCounseling.findUnique({
      where: { id },
      include: { student: true },
    });
  }

  async findByStudentId(studentId: string, page: number, limit: number) {
    const [items, total] = await Promise.all([
      prisma.careerCounseling.findMany({
        where: { studentId },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { student: true },
      }),
      prisma.careerCounseling.count({ where: { studentId } }),
    ]);
    return { items, total };
  }

  async create(data: Prisma.CareerCounselingCreateInput) {
    return prisma.careerCounseling.create({
      data,
      include: { student: true },
    });
  }

  async update(id: string, data: Prisma.CareerCounselingUpdateInput) {
    return prisma.careerCounseling.update({
      where: { id },
      data,
      include: { student: true },
    });
  }

  async delete(id: string) {
    return prisma.careerCounseling.delete({ where: { id } });
  }

  async countAll() {
    return prisma.careerCounseling.count();
  }

  async countCompleted() {
    return prisma.careerCounseling.count({ where: { status: 'COMPLETED' } });
  }

  async countByType() {
    return prisma.careerCounseling.groupBy({
      by: ['type'],
      _count: { type: true },
    });
  }

  async countByStatus() {
    return prisma.careerCounseling.groupBy({
      by: ['status'],
      _count: { status: true },
    });
  }

  async getStats() {
    const [totalCounselings, completedCounselings, byType, byStatus, recentCounselings] =
      await Promise.all([
        this.countAll(),
        this.countCompleted(),
        this.countByType(),
        this.countByStatus(),
        prisma.careerCounseling.count({
          where: {
            createdAt: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 최근 7일
            },
          },
        }),
      ]);

    const completionRate =
      totalCounselings > 0 ? Math.round((completedCounselings / totalCounselings) * 100) : 0;

    return {
      totalCounselings,
      completedCounselings,
      completionRate,
      recentCounselings,
      byType: byType.reduce(
        (acc, item) => {
          acc[item.type] = item._count.type;
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

  async getByStudent(studentId: string) {
    return prisma.careerCounseling.findMany({
      where: { studentId },
      include: { student: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getUpcoming() {
    return prisma.careerCounseling.findMany({
      where: { status: 'SCHEDULED' },
      include: { student: true },
      orderBy: { createdAt: 'asc' },
    });
  }
}

export const careerCounselingRepository = new CareerCounselingRepository();
