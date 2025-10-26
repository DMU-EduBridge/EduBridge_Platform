import { logger } from '@/lib/monitoring';

export interface AIServiceMetrics {
  requestCount: number;
  successCount: number;
  failureCount: number;
  averageResponseTime: number;
  lastRequestTime: Date | null;
  errorRate: number;
}

export interface AIServiceLogContext {
  service: string;
  operation: string;
  userId?: string;
  requestId?: string;
  duration?: number;
  success?: boolean;
  error?: string;
  metadata?: Record<string, any>;
}

export class AIServiceLogger {
  private static metrics = new Map<string, AIServiceMetrics>();

  /**
   * AI 서비스 요청 로깅
   */
  static logRequest(context: AIServiceLogContext) {
    const logData = {
      service: context.service,
      operation: context.operation,
      userId: context.userId,
      requestId: context.requestId,
      duration: context.duration,
      success: context.success,
      error: context.error,
      timestamp: new Date().toISOString(),
      ...context.metadata,
    };

    if (context.success) {
      logger.info('AI Service Request Success', logData);
    } else {
      logger.error('AI Service Request Failed', undefined, logData);
    }

    // 메트릭 업데이트
    this.updateMetrics(context);
  }

  /**
   * AI 서비스 에러 로깅
   */
  static logError(context: AIServiceLogContext, error: Error) {
    const logData = {
      service: context.service,
      operation: context.operation,
      userId: context.userId,
      requestId: context.requestId,
      duration: context.duration,
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      ...context.metadata,
    };

    logger.error('AI Service Error', error, logData);
    this.updateMetrics({ ...context, success: false, error: error.message });
  }

  /**
   * AI 서비스 성능 로깅
   */
  static logPerformance(context: AIServiceLogContext) {
    const logData = {
      service: context.service,
      operation: context.operation,
      duration: context.duration,
      timestamp: new Date().toISOString(),
      ...context.metadata,
    };

    logger.info('AI Service Performance', logData);
  }

  /**
   * 메트릭 업데이트
   */
  private static updateMetrics(context: AIServiceLogContext) {
    const key = `${context.service}:${context.operation}`;
    const current = this.metrics.get(key) || {
      requestCount: 0,
      successCount: 0,
      failureCount: 0,
      averageResponseTime: 0,
      lastRequestTime: null,
      errorRate: 0,
    };

    current.requestCount++;
    current.lastRequestTime = new Date();

    if (context.success) {
      current.successCount++;
    } else {
      current.failureCount++;
    }

    if (context.duration) {
      current.averageResponseTime =
        (current.averageResponseTime * (current.requestCount - 1) + context.duration) /
        current.requestCount;
    }

    current.errorRate = current.failureCount / current.requestCount;

    this.metrics.set(key, current);
  }

  /**
   * 메트릭 조회
   */
  static getMetrics(service?: string): AIServiceMetrics | Map<string, AIServiceMetrics> {
    if (service) {
      const filtered = new Map();
      for (const [key, value] of Array.from(this.metrics.entries())) {
        if (key.startsWith(`${service}:`)) {
          filtered.set(key, value);
        }
      }
      return filtered;
    }
    return this.metrics;
  }

  /**
   * 메트릭 리셋
   */
  static resetMetrics(service?: string) {
    if (service) {
      for (const key of Array.from(this.metrics.keys())) {
        if (key.startsWith(`${service}:`)) {
          this.metrics.delete(key);
        }
      }
    } else {
      this.metrics.clear();
    }
  }

  /**
   * 헬스체크 로깅
   */
  static logHealthCheck(service: string, isHealthy: boolean, responseTime: number, error?: string) {
    const logData = {
      service,
      isHealthy,
      responseTime,
      error,
      timestamp: new Date().toISOString(),
    };

    if (isHealthy) {
      logger.info('AI Service Health Check Success', logData);
    } else {
      logger.warn('AI Service Health Check Failed', logData);
    }
  }

  /**
   * 데이터 동기화 로깅
   */
  static logDataSync(
    service: string,
    operation: string,
    result: {
      synced: number;
      updated: number;
      skipped: number;
      errors: number;
      duration: number;
    },
  ) {
    const logData = {
      service,
      operation,
      synced: result.synced,
      updated: result.updated,
      skipped: result.skipped,
      errors: result.errors,
      duration: result.duration,
      timestamp: new Date().toISOString(),
    };

    logger.info('AI Service Data Sync', logData);
  }

  /**
   * 요청 추적을 위한 데코레이터
   */
  static trackRequest<T extends any[], R>(
    service: string,
    operation: string,
    fn: (...args: T) => Promise<R>,
  ) {
    return async (...args: T): Promise<R> => {
      const startTime = Date.now();
      const requestId = this.generateRequestId();

      try {
        const result = await fn(...args);
        const duration = Date.now() - startTime;

        this.logRequest({
          service,
          operation,
          requestId,
          duration,
          success: true,
        });

        return result;
      } catch (error) {
        const duration = Date.now() - startTime;

        this.logError(
          {
            service,
            operation,
            requestId,
            duration,
            success: false,
          },
          error as Error,
        );

        throw error;
      }
    };
  }

  /**
   * 요청 ID 생성
   */
  private static generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
