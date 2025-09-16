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
    return prisma.analysisReport.findUnique({ where: { id }, include: { student: true } });
  }

  async create(data: Prisma.AnalysisReportCreateInput) {
    return prisma.analysisReport.create({ data, include: { student: true } });
  }

  async countAll() {
    return prisma.analysisReport.count();
  }

  async countCompleted() {
    return prisma.analysisReport.count({ where: { status: 'COMPLETED' } });
  }
}

export const reportRepository = new ReportRepository();
