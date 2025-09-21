import { prisma } from '@/lib/core/prisma';
import type { Prisma } from '@prisma/client';

export class ReportRepository {
  async findMany(where: Prisma.AnalysisReportWhereInput, page: number, limit: number) {
    const [items, total] = await Promise.all([
      prisma.analysisReport.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { student: true },
      }),
      prisma.analysisReport.count({ where }),
    ]);
    return { items, total };
  }

  async findById(id: string) {
    return prisma.analysisReport.findUnique({
      where: { id },
      include: { student: true },
    });
  }

  async findByStudentId(studentId: string, page: number, limit: number) {
    const [items, total] = await Promise.all([
      prisma.analysisReport.findMany({
        where: { studentId },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { student: true },
      }),
      prisma.analysisReport.count({ where: { studentId } }),
    ]);
    return { items, total };
  }

  async create(data: Prisma.AnalysisReportCreateInput) {
    return prisma.analysisReport.create({
      data,
      include: { student: true },
    });
  }

  async update(id: string, data: Prisma.AnalysisReportUpdateInput) {
    return prisma.analysisReport.update({
      where: { id },
      data,
      include: { student: true },
    });
  }

  async delete(id: string) {
    return prisma.analysisReport.delete({ where: { id } });
  }

  async countAll() {
    return prisma.analysisReport.count();
  }

  async countCompleted() {
    return prisma.analysisReport.count({ where: { status: 'COMPLETED' } });
  }

  async countByType() {
    return prisma.analysisReport.groupBy({
      by: ['type'],
      _count: { type: true },
    });
  }

  async countByStatus() {
    return prisma.analysisReport.groupBy({
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
      prisma.analysisReport.count({
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
}

export const reportRepository = new ReportRepository();
