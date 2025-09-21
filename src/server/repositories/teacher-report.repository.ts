import { prisma } from '@/lib/core/prisma';
import type { Prisma } from '@prisma/client';

export class TeacherReportRepository {
  async findMany(where: Prisma.TeacherReportWhereInput, page: number, limit: number) {
    const [items, total] = await Promise.all([
      prisma.teacherReport.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { teacher: true },
      }),
      prisma.teacherReport.count({ where }),
    ]);
    return { items, total };
  }

  async findById(id: string) {
    return prisma.teacherReport.findUnique({
      where: { id },
      include: { teacher: true },
    });
  }

  async findByTeacherId(teacherId: string, page: number, limit: number) {
    const [items, total] = await Promise.all([
      prisma.teacherReport.findMany({
        where: { teacherId },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { teacher: true },
      }),
      prisma.teacherReport.count({ where: { teacherId } }),
    ]);
    return { items, total };
  }

  async create(data: Prisma.TeacherReportCreateInput) {
    return prisma.teacherReport.create({
      data,
      include: { teacher: true },
    });
  }

  async update(id: string, data: Prisma.TeacherReportUpdateInput) {
    return prisma.teacherReport.update({
      where: { id },
      data,
      include: { teacher: true },
    });
  }

  async delete(id: string) {
    return prisma.teacherReport.delete({ where: { id } });
  }

  async countAll() {
    return prisma.teacherReport.count();
  }

  async countCompleted() {
    return prisma.teacherReport.count({ where: { status: 'COMPLETED' } });
  }

  async countByType() {
    return prisma.teacherReport.groupBy({
      by: ['reportType'],
      _count: { reportType: true },
    });
  }

  async countByStatus() {
    return prisma.teacherReport.groupBy({
      by: ['status'],
      _count: { status: true },
    });
  }

  async getStats() {
    const [totalReports, completedReports, byType, byStatus, recentReports] = await Promise.all([
      this.countAll(),
      this.countCompleted(),
      this.countByType(),
      this.countByStatus(),
      prisma.teacherReport.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 최근 7일
          },
        },
      }),
    ]);

    const completionRate =
      totalReports > 0 ? Math.round((completedReports / totalReports) * 100) : 0;

    return {
      totalReports,
      completedReports,
      completionRate,
      recentReports,
      byType: byType.reduce(
        (acc, item) => {
          acc[item.reportType] = item._count.reportType;
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

  async getByTeacher(teacherId: string) {
    return prisma.teacherReport.findMany({
      where: { teacherId },
      include: { teacher: true },
      orderBy: { createdAt: 'desc' },
    });
  }
}

export const teacherReportRepository = new TeacherReportRepository();
