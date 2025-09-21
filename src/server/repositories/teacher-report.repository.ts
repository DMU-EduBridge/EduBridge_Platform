import { prisma } from '@/lib/core/prisma';
import { Prisma, TeacherReport } from '@prisma/client';
import {
  CreateReportAnalysisDtoType,
  CreateTeacherReportDtoType,
  TeacherReportListQueryDtoType,
  UpdateTeacherReportDtoType,
} from '../dto/teacher-report';

export class TeacherReportRepository {
  async findById(id: string): Promise<TeacherReport | null> {
    return prisma.teacherReport.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        reportAnalyses: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  async findMany(
    query: TeacherReportListQueryDtoType,
  ): Promise<{ reports: TeacherReport[]; total: number }> {
    const { page, limit, status, search } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.TeacherReportWhereInput = {};

    if (status) where.status = status;
    if (search) {
      where.OR = [{ title: { contains: search } }, { content: { contains: search } }];
    }

    const [reports, total] = await Promise.all([
      prisma.teacherReport.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          reportAnalyses: {
            orderBy: { createdAt: 'desc' },
            take: 3, // 목록에서는 최근 3개 분석만
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.teacherReport.count({ where }),
    ]);

    return { reports, total };
  }

  async create(data: CreateTeacherReportDtoType, userId: string): Promise<TeacherReport> {
    return prisma.teacherReport.create({
      data: {
        ...data,
        content: data.description || '', // content 필드 필수
        createdBy: userId,
        status: 'DRAFT',
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async update(id: string, data: UpdateTeacherReportDtoType): Promise<TeacherReport> {
    return prisma.teacherReport.update({
      where: { id },
      data,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        reportAnalyses: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  async delete(id: string): Promise<TeacherReport> {
    return prisma.teacherReport.delete({
      where: { id },
    });
  }

  async findByUserId(userId: string): Promise<TeacherReport[]> {
    return prisma.teacherReport.findMany({
      where: { createdBy: userId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        reportAnalyses: {
          orderBy: { createdAt: 'desc' },
          take: 3,
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createAnalysis(data: CreateReportAnalysisDtoType): Promise<any> {
    return prisma.reportAnalysis.create({
      data: {
        reportId: data.reportId,
        analysisType: data.analysisType as any, // enum 타입 캐스팅
        analysisData: data.analysisData,
      },
    });
  }

  async getTeacherReportStats(): Promise<{
    totalReports: number;
    byStatus: Record<string, number>;
    byAnalysisType: Record<string, number>;
  }> {
    const [totalReports, byStatus, byAnalysisType] = await Promise.all([
      prisma.teacherReport.count(),
      prisma.teacherReport.groupBy({
        by: ['status'],
        _count: { status: true },
      }),
      prisma.reportAnalysis.groupBy({
        by: ['analysisType'],
        _count: { analysisType: true },
      }),
    ]);

    return {
      totalReports,
      byStatus: byStatus.reduce((acc, item) => ({ ...acc, [item.status]: item._count.status }), {}),
      byAnalysisType: byAnalysisType.reduce(
        (acc, item) => ({ ...acc, [item.analysisType]: item._count.analysisType }),
        {},
      ),
    };
  }
}
