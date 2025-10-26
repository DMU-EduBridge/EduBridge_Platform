import { logger } from '@/lib/monitoring';

export interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  retryableErrors: RegExp[];
}

export interface RetryResult<T> {
  success: boolean;
  data?: T;
  error?: Error;
  attempts: number;
  totalDuration: number;
}

export class RetryManager {
  private static readonly DEFAULT_CONFIG: RetryConfig = {
    maxRetries: 3,
    baseDelay: 1000,
    maxDelay: 30000,
    backoffMultiplier: 2,
    retryableErrors: [
      /network/i,
      /timeout/i,
      /fetch/i,
      /502/i,
      /503/i,
      /504/i,
      /ECONNREFUSED/i,
      /ENOTFOUND/i,
      /ETIMEDOUT/i,
    ],
  };

  /**
   * 지수 백오프를 사용한 재시도 로직
   */
  static async executeWithRetry<T>(
    operation: () => Promise<T>,
    config: Partial<RetryConfig> = {},
  ): Promise<RetryResult<T>> {
    const finalConfig = { ...this.DEFAULT_CONFIG, ...config };
    const startTime = Date.now();
    let lastError: Error | undefined;

    for (let attempt = 0; attempt <= finalConfig.maxRetries; attempt++) {
      try {
        const data = await operation();
        const totalDuration = Date.now() - startTime;

        logger.info('Retry operation succeeded', {
          attempts: attempt + 1,
          totalDuration,
          operation: operation.name || 'anonymous',
        });

        return {
          success: true,
          data,
          attempts: attempt + 1,
          totalDuration,
        };
      } catch (error) {
        lastError = error as Error;
        const isLastAttempt = attempt === finalConfig.maxRetries;
        const isRetryable = this.isRetryableError(error as Error, finalConfig.retryableErrors);

        logger.warn('Retry operation failed', {
          attempt: attempt + 1,
          maxRetries: finalConfig.maxRetries,
          isRetryable,
          isLastAttempt,
          error: lastError.message,
          operation: operation.name || 'anonymous',
        });

        if (isLastAttempt || !isRetryable) {
          break;
        }

        // 지수 백오프 계산
        const delay = Math.min(
          finalConfig.baseDelay * Math.pow(finalConfig.backoffMultiplier, attempt),
          finalConfig.maxDelay,
        );

        logger.info('Retrying after delay', {
          attempt: attempt + 1,
          delay,
          nextAttempt: attempt + 2,
        });

        await this.sleep(delay);
      }
    }

    const totalDuration = Date.now() - startTime;

    logger.error('Retry operation failed after all attempts', lastError, {
      attempts: finalConfig.maxRetries + 1,
      totalDuration,
      finalError: lastError?.message,
      operation: operation.name || 'anonymous',
    });

    return {
      success: false,
      error: lastError || new Error('Unknown error'),
      attempts: finalConfig.maxRetries + 1,
      totalDuration,
    };
  }

  /**
   * 에러가 재시도 가능한지 확인
   */
  private static isRetryableError(error: Error, retryablePatterns: RegExp[]): boolean {
    const errorMessage = error.message.toLowerCase();
    return retryablePatterns.some((pattern) => pattern.test(errorMessage));
  }

  /**
   * 지정된 시간만큼 대기
   */
  private static sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * 특정 AI 서비스용 재시도 설정
   */
  static getAIServiceConfig(): RetryConfig {
    return {
      ...this.DEFAULT_CONFIG,
      maxRetries: 3,
      baseDelay: 2000,
      maxDelay: 20000,
      retryableErrors: [
        ...this.DEFAULT_CONFIG.retryableErrors,
        /AI server/i,
        /upstream/i,
        /service unavailable/i,
      ],
    };
  }

  /**
   * 채팅 서비스용 재시도 설정
   */
  static getChatServiceConfig(): RetryConfig {
    return {
      ...this.DEFAULT_CONFIG,
      maxRetries: 2,
      baseDelay: 1000,
      maxDelay: 10000,
      retryableErrors: [
        ...this.DEFAULT_CONFIG.retryableErrors,
        /chat/i,
        /message/i,
        /conversation/i,
      ],
    };
  }

  /**
   * 문제 생성 서비스용 재시도 설정
   */
  static getQuestionGenerationConfig(): RetryConfig {
    return {
      ...this.DEFAULT_CONFIG,
      maxRetries: 2,
      baseDelay: 3000,
      maxDelay: 30000,
      retryableErrors: [
        ...this.DEFAULT_CONFIG.retryableErrors,
        /question generation/i,
        /problem creation/i,
        /AI generation/i,
      ],
    };
  }
}
