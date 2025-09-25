import { prisma } from '@/lib/core/prisma';
import type { Prisma } from '@prisma/client';

export class ReportService {
  async list(params: { type?: string; status?: string; page: number; limit: number }) {
    const where: Prisma.ReportWhereInput = {};
    if (params.type && params.type !== 'all') where.type = params.type as any;
    if (params.status && params.status !== 'all') where.status = params.status as any;

    const skip = (params.page - 1) * params.limit;
    const [reports, total] = await Promise.all([
      prisma.report.findMany({
        where,
        skip,
        take: params.limit,
        orderBy: { createdAt: 'desc' },
        include: {
          creator: {
            select: { id: true, name: true, email: true },
          },
        },
      }),
      prisma.report.count({ where }),
    ]);

    return { reports, total };
  }

  async detail(id: string) {
    return prisma.report.findUnique({
      where: { id },
      include: {
        creator: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  }

  async create(
    input: {
      title: string;
      content: string;
      type: string;
      targetUserId?: string;
      data?: any;
    },
    createdBy: string,
  ) {
    return prisma.report.create({
      data: {
        title: input.title,
        content: input.content,
        type: input.type as any,
        status: 'DRAFT',
        createdBy,
        data: input.data ? JSON.stringify(input.data) : null,
      },
    });
  }

  async update(
    id: string,
    input: {
      title?: string;
      content?: string;
      status?: string;
    },
  ) {
    return prisma.report.update({
      where: { id },
      data: {
        title: input.title,
        content: input.content,
        status: input.status as any,
      },
    });
  }

  async remove(id: string) {
    return prisma.report.delete({
      where: { id },
    });
  }

  async getStats() {
    const [total, byType, byStatus] = await Promise.all([
      prisma.report.count(),
      prisma.report.groupBy({
        by: ['type'],
        _count: { type: true },
      }),
      prisma.report.groupBy({
        by: ['status'],
        _count: { status: true },
      }),
    ]);

    return {
      total,
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

export const reportService = new ReportService();
