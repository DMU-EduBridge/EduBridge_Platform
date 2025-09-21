import { prisma } from '@/lib/core/prisma';
import { AIApiUsage, AIPerformanceMetric, AIUsageStatistics, Prisma } from '@prisma/client';
import {
  AIApiUsageListQueryDtoType,
  AIPerformanceMetricListQueryDtoType,
  AIUsageStatisticsListQueryDtoType,
  CreateAIApiUsageDtoType,
  CreateAIPerformanceMetricDtoType,
  CreateAIUsageStatisticsDtoType,
} from '../dto/ai-stats';

export class AIStatsRepository {
  // AI API 사용량 관련 메서드
  async findAIApiUsageById(id: string): Promise<AIApiUsage | null> {
    return prisma.aIApiUsage.findUnique({
      where: { id },
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

  async findAIApiUsages(
    query: AIApiUsageListQueryDtoType,
  ): Promise<{ usages: AIApiUsage[]; total: number }> {
    const { page, limit, userId, apiType, startDate, endDate } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.AIApiUsageWhereInput = {};

    if (userId) where.userId = userId;
    if (apiType) where.apiType = apiType;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const [usages, total] = await Promise.all([
      prisma.aIApiUsage.findMany({
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
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.aIApiUsage.count({ where }),
    ]);

    return { usages, total };
  }

  async createAIApiUsage(data: CreateAIApiUsageDtoType, userId: string): Promise<AIApiUsage> {
    return prisma.aIApiUsage.create({
      data: {
        apiType: data.apiType,
        modelName: 'gpt-3.5-turbo',
        tokensUsed: data.tokensUsed,
        costUsd: data.costUsd,
        userId,
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

  // AI 성능 메트릭 관련 메서드
  async findAIPerformanceMetricById(id: string): Promise<AIPerformanceMetric | null> {
    return prisma.aIPerformanceMetric.findUnique({
      where: { id },
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

  async findAIPerformanceMetrics(
    query: AIPerformanceMetricListQueryDtoType,
  ): Promise<{ metrics: AIPerformanceMetric[]; total: number }> {
    const { page, limit, userId, operationType, success, startDate, endDate } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.AIPerformanceMetricWhereInput = {};

    if (userId) where.userId = userId;
    if (operationType) where.operationType = operationType;
    if (success !== undefined) where.success = success;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const [metrics, total] = await Promise.all([
      prisma.aIPerformanceMetric.findMany({
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
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.aIPerformanceMetric.count({ where }),
    ]);

    return { metrics, total };
  }

  async createAIPerformanceMetric(
    data: CreateAIPerformanceMetricDtoType,
    userId?: string,
  ): Promise<AIPerformanceMetric> {
    return prisma.aIPerformanceMetric.create({
      data: {
        operationType: data.operationType,
        durationMs: data.durationMs,
        success: data.success,
        errorMessage: data.errorMessage,
        metadata: data.metadata ? JSON.stringify(data.metadata) : undefined,
        userId,
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

  // AI 사용 통계 관련 메서드
  async findAIUsageStatisticsById(id: string): Promise<AIUsageStatistics | null> {
    return prisma.aIUsageStatistics.findUnique({
      where: { id },
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

  async findAIUsageStatistics(
    query: AIUsageStatisticsListQueryDtoType,
  ): Promise<{ statistics: AIUsageStatistics[]; total: number }> {
    const { page, limit, userId, startDate, endDate } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.AIUsageStatisticsWhereInput = {};

    if (userId) where.userId = userId;
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = startDate;
      if (endDate) where.date.lte = endDate;
    }

    const [statistics, total] = await Promise.all([
      prisma.aIUsageStatistics.findMany({
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
        },
        orderBy: { date: 'desc' },
      }),
      prisma.aIUsageStatistics.count({ where }),
    ]);

    return { statistics, total };
  }

  async createAIUsageStatistics(
    data: CreateAIUsageStatisticsDtoType,
    userId: string,
  ): Promise<AIUsageStatistics> {
    return prisma.aIUsageStatistics.create({
      data: {
        date: data.date,
        questionsGenerated: 0, // 기본값
        textbooksUploaded: 0, // 기본값
        searchesPerformed: 0, // 기본값
        totalCostUsd: data.totalCostUsd,
        userId,
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

  async upsertAIUsageStatistics(
    data: CreateAIUsageStatisticsDtoType,
    userId: string,
  ): Promise<AIUsageStatistics> {
    return prisma.aIUsageStatistics.upsert({
      where: {
        userId_date: {
          userId,
          date: data.date,
        },
      },
      update: {
        questionsGenerated: 0, // 기본값
        textbooksUploaded: 0, // 기본값
        searchesPerformed: 0, // 기본값
        totalCostUsd: data.totalCostUsd,
      },
      create: {
        date: data.date,
        questionsGenerated: 0, // 기본값
        textbooksUploaded: 0, // 기본값
        searchesPerformed: 0, // 기본값
        totalCostUsd: data.totalCostUsd,
        userId,
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

  // 통계 조회 메서드
  async getAIStatsSummary(): Promise<{
    totalApiCalls: number;
    totalTokensUsed: number;
    totalCostUsd: number;
    averageResponseTime: number;
    successRate: number;
    topApiTypes: Record<string, number>;
  }> {
    const [
      totalApiCalls,
      totalTokensUsed,
      totalCostUsd,
      avgResponseTime,
      successCount,
      totalMetrics,
      topApiTypes,
    ] = await Promise.all([
      prisma.aIApiUsage.count(),
      prisma.aIApiUsage.aggregate({ _sum: { tokensUsed: true } }),
      prisma.aIApiUsage.aggregate({ _sum: { costUsd: true } }),
      prisma.aIPerformanceMetric.aggregate({ _avg: { durationMs: true } }),
      prisma.aIPerformanceMetric.count({ where: { success: true } }),
      prisma.aIPerformanceMetric.count(),
      prisma.aIApiUsage.groupBy({
        by: ['apiType'],
        _count: { apiType: true },
        orderBy: { _count: { apiType: 'desc' } },
        take: 10,
      }),
    ]);

    return {
      totalApiCalls,
      totalTokensUsed: totalTokensUsed._sum.tokensUsed || 0,
      totalCostUsd: totalCostUsd._sum.costUsd || 0,
      averageResponseTime: avgResponseTime._avg.durationMs || 0,
      successRate: totalMetrics > 0 ? (successCount / totalMetrics) * 100 : 0,
      topApiTypes: topApiTypes.reduce(
        (acc, item) => ({ ...acc, [item.apiType]: item._count.apiType }),
        {},
      ),
    };
  }
}
