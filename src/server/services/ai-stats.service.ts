import { AIApiUsage, AIPerformanceMetric, AIUsageStatistics } from '@prisma/client';
import { logger } from '../../lib/monitoring';
import {
  AIApiUsageListQueryDtoType,
  AIPerformanceMetricListQueryDtoType,
  AIUsageStatisticsListQueryDtoType,
  CreateAIApiUsageDtoType,
  CreateAIPerformanceMetricDtoType,
  CreateAIUsageStatisticsDtoType,
} from '../dto/ai-stats';
import { AIStatsRepository } from '../repositories/ai-stats.repository';

export class AIStatsService {
  private aiStatsRepository = new AIStatsRepository();

  // AI API 사용량 관련 메서드
  async getAIApiUsageById(id: string): Promise<AIApiUsage | null> {
    try {
      return await this.aiStatsRepository.findAIApiUsageById(id);
    } catch (error) {
      logger.error('AI API 사용량 조회 실패', undefined, {
        usageId: id,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new Error('AI API 사용량 조회에 실패했습니다.');
    }
  }

  async getAIApiUsages(query: AIApiUsageListQueryDtoType): Promise<{
    usages: AIApiUsage[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    try {
      const { usages, total } = await this.aiStatsRepository.findAIApiUsages(query);
      const totalPages = Math.ceil(total / query.limit);

      return {
        usages,
        pagination: {
          page: query.page,
          limit: query.limit,
          total,
          totalPages,
        },
      };
    } catch (error) {
      logger.error('AI API 사용량 목록 조회 실패', undefined, {
        query,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new Error('AI API 사용량 목록 조회에 실패했습니다.');
    }
  }

  async createAIApiUsage(data: CreateAIApiUsageDtoType, userId: string): Promise<AIApiUsage> {
    try {
      return await this.aiStatsRepository.createAIApiUsage(data, userId);
    } catch (error) {
      logger.error('AI API 사용량 생성 실패', undefined, {
        data,
        userId,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new Error('AI API 사용량 생성에 실패했습니다.');
    }
  }

  // AI 성능 메트릭 관련 메서드
  async getAIPerformanceMetricById(id: string): Promise<AIPerformanceMetric | null> {
    try {
      return await this.aiStatsRepository.findAIPerformanceMetricById(id);
    } catch (error) {
      logger.error('AI 성능 메트릭 조회 실패', undefined, {
        metricId: id,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new Error('AI 성능 메트릭 조회에 실패했습니다.');
    }
  }

  async getAIPerformanceMetrics(query: AIPerformanceMetricListQueryDtoType): Promise<{
    metrics: AIPerformanceMetric[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    try {
      const { metrics, total } = await this.aiStatsRepository.findAIPerformanceMetrics(query);
      const totalPages = Math.ceil(total / query.limit);

      return {
        metrics,
        pagination: {
          page: query.page,
          limit: query.limit,
          total,
          totalPages,
        },
      };
    } catch (error) {
      logger.error('AI 성능 메트릭 목록 조회 실패', undefined, {
        query,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new Error('AI 성능 메트릭 목록 조회에 실패했습니다.');
    }
  }

  async createAIPerformanceMetric(
    data: CreateAIPerformanceMetricDtoType,
    userId?: string,
  ): Promise<AIPerformanceMetric> {
    try {
      return await this.aiStatsRepository.createAIPerformanceMetric(data, userId);
    } catch (error) {
      logger.error('AI 성능 메트릭 생성 실패', undefined, {
        data,
        userId,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new Error('AI 성능 메트릭 생성에 실패했습니다.');
    }
  }

  // AI 사용 통계 관련 메서드
  async getAIUsageStatisticsById(id: string): Promise<AIUsageStatistics | null> {
    try {
      return await this.aiStatsRepository.findAIUsageStatisticsById(id);
    } catch (error) {
      logger.error('AI 사용 통계 조회 실패', undefined, {
        statsId: id,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new Error('AI 사용 통계 조회에 실패했습니다.');
    }
  }

  async getAIUsageStatistics(query: AIUsageStatisticsListQueryDtoType): Promise<{
    statistics: AIUsageStatistics[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    try {
      const { statistics, total } = await this.aiStatsRepository.findAIUsageStatistics(query);
      const totalPages = Math.ceil(total / query.limit);

      return {
        statistics,
        pagination: {
          page: query.page,
          limit: query.limit,
          total,
          totalPages,
        },
      };
    } catch (error) {
      logger.error('AI 사용 통계 목록 조회 실패', undefined, {
        query,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new Error('AI 사용 통계 목록 조회에 실패했습니다.');
    }
  }

  async createAIUsageStatistics(
    data: CreateAIUsageStatisticsDtoType,
    userId: string,
  ): Promise<AIUsageStatistics> {
    try {
      return await this.aiStatsRepository.createAIUsageStatistics(data, userId);
    } catch (error) {
      logger.error('AI 사용 통계 생성 실패', undefined, {
        data,
        userId,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new Error('AI 사용 통계 생성에 실패했습니다.');
    }
  }

  async upsertAIUsageStatistics(
    data: CreateAIUsageStatisticsDtoType,
    userId: string,
  ): Promise<AIUsageStatistics> {
    try {
      return await this.aiStatsRepository.upsertAIUsageStatistics(data, userId);
    } catch (error) {
      logger.error('AI 사용 통계 업서트 실패', undefined, {
        data,
        userId,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new Error('AI 사용 통계 업서트에 실패했습니다.');
    }
  }

  // 통계 요약 조회
  async getAIStatsSummary(): Promise<{
    totalApiCalls: number;
    totalTokensUsed: number;
    totalCostUsd: number;
    averageResponseTime: number;
    successRate: number;
    topApiTypes: Record<string, number>;
  }> {
    try {
      return await this.aiStatsRepository.getAIStatsSummary();
    } catch (error) {
      logger.error('AI 통계 요약 조회 실패', undefined, {
        error: error instanceof Error ? error.message : String(error),
      });
      throw new Error('AI 통계 요약 조회에 실패했습니다.');
    }
  }
}
