import { logger } from '@/lib/monitoring';
import { AIServiceLogger } from './ai-service-logger';

export enum CircuitState {
  CLOSED = 'CLOSED', // 정상 상태
  OPEN = 'OPEN', // 차단 상태
  HALF_OPEN = 'HALF_OPEN', // 테스트 상태
}

// CircuitState enum 값들을 사용하도록 수정
// 이 enum은 CircuitBreaker 클래스에서 사용됩니다

export interface CircuitBreakerConfig {
  failureThreshold: number; // 실패 임계값
  successThreshold: number; // 성공 임계값 (HALF_OPEN에서 OPEN으로 전환)
  timeout: number; // OPEN 상태 지속 시간 (ms)
  resetTimeout: number; // HALF_OPEN에서 CLOSED로 전환하기 위한 성공 횟수
}

export interface CircuitBreakerStats {
  state: CircuitState;
  failureCount: number;
  successCount: number;
  lastFailureTime: Date | null;
  lastSuccessTime: Date | null;
  totalRequests: number;
  totalFailures: number;
  totalSuccesses: number;
}

export class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failureCount = 0;
  private successCount = 0;
  private lastFailureTime: Date | null = null;
  private lastSuccessTime: Date | null = null;
  private totalRequests = 0;
  private totalFailures = 0;
  private totalSuccesses = 0;

  constructor(
    private name: string,
    private config: CircuitBreakerConfig = {
      failureThreshold: 5,
      successThreshold: 3,
      timeout: 60000, // 1분
      resetTimeout: 10000, // 10초
    },
  ) {}

  /**
   * 작업 실행
   */
  async execute<T>(operation: () => Promise<T>): Promise<T> {
    this.totalRequests++;

    // OPEN 상태에서 타임아웃 체크
    if (this.state === CircuitState.OPEN) {
      if (Date.now() - (this.lastFailureTime?.getTime() || 0) > this.config.timeout) {
        this.state = CircuitState.HALF_OPEN;
        this.successCount = 0;
        logger.info('Circuit breaker transitioning to HALF_OPEN', {
          circuitBreaker: this.name,
          state: this.state,
        });
      } else {
        const error = new Error(`Circuit breaker is OPEN for ${this.name}`);
        AIServiceLogger.logError(
          {
            service: this.name,
            operation: 'circuit_breaker',
            error: error.message,
          },
          error,
        );
        throw error;
      }
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  /**
   * 성공 처리
   */
  private onSuccess() {
    this.lastSuccessTime = new Date();
    this.totalSuccesses++;

    if (this.state === CircuitState.HALF_OPEN) {
      this.successCount++;
      if (this.successCount >= this.config.successThreshold) {
        this.state = CircuitState.CLOSED;
        this.failureCount = 0;
        logger.info('Circuit breaker transitioning to CLOSED', {
          circuitBreaker: this.name,
          state: this.state,
          successCount: this.successCount,
        });
      }
    } else if (this.state === CircuitState.CLOSED) {
      this.failureCount = 0; // 연속 성공 시 실패 카운트 리셋
    }

    AIServiceLogger.logRequest({
      service: this.name,
      operation: 'circuit_breaker_success',
      success: true,
    });
  }

  /**
   * 실패 처리
   */
  private onFailure() {
    this.lastFailureTime = new Date();
    this.totalFailures++;
    this.failureCount++;

    if (this.state === CircuitState.HALF_OPEN) {
      // HALF_OPEN 상태에서 실패 시 즉시 OPEN으로 전환
      this.state = CircuitState.OPEN;
      logger.warn('Circuit breaker transitioning to OPEN from HALF_OPEN', {
        circuitBreaker: this.name,
        state: this.state,
        failureCount: this.failureCount,
      });
    } else if (
      this.state === CircuitState.CLOSED &&
      this.failureCount >= this.config.failureThreshold
    ) {
      // CLOSED 상태에서 임계값 초과 시 OPEN으로 전환
      this.state = CircuitState.OPEN;
      logger.warn('Circuit breaker transitioning to OPEN', {
        circuitBreaker: this.name,
        state: this.state,
        failureCount: this.failureCount,
        threshold: this.config.failureThreshold,
      });
    }

    AIServiceLogger.logRequest({
      service: this.name,
      operation: 'circuit_breaker_failure',
      success: false,
    });
  }

  /**
   * 현재 상태 조회
   */
  getState(): CircuitState {
    return this.state;
  }

  /**
   * 통계 조회
   */
  getStats(): CircuitBreakerStats {
    return {
      state: this.state,
      failureCount: this.failureCount,
      successCount: this.successCount,
      lastFailureTime: this.lastFailureTime,
      lastSuccessTime: this.lastSuccessTime,
      totalRequests: this.totalRequests,
      totalFailures: this.totalFailures,
      totalSuccesses: this.totalSuccesses,
    };
  }

  /**
   * 수동으로 상태 리셋
   */
  reset() {
    this.state = CircuitState.CLOSED;
    this.failureCount = 0;
    this.successCount = 0;
    this.lastFailureTime = null;
    this.lastSuccessTime = null;

    logger.info('Circuit breaker manually reset', {
      circuitBreaker: this.name,
    });
  }

  /**
   * 설정 업데이트
   */
  updateConfig(newConfig: Partial<CircuitBreakerConfig>) {
    this.config = { ...this.config, ...newConfig };

    logger.info('Circuit breaker config updated', {
      circuitBreaker: this.name,
      config: this.config,
    });
  }
}

/**
 * AI 서비스별 Circuit Breaker 관리자
 */
export class AICircuitBreakerManager {
  private static circuitBreakers = new Map<string, CircuitBreaker>();

  /**
   * Circuit Breaker 가져오기 또는 생성
   */
  static getCircuitBreaker(service: string, operation: string): CircuitBreaker {
    const key = `${service}:${operation}`;

    if (!this.circuitBreakers.has(key)) {
      const config = this.getDefaultConfig(service);
      const circuitBreaker = new CircuitBreaker(key, config);
      this.circuitBreakers.set(key, circuitBreaker);

      logger.info('Circuit breaker created', {
        service,
        operation,
        config,
      });
    }

    return this.circuitBreakers.get(key)!;
  }

  /**
   * 서비스별 기본 설정
   */
  private static getDefaultConfig(service: string): CircuitBreakerConfig {
    const baseConfig = {
      failureThreshold: 5,
      successThreshold: 3,
      timeout: 60000,
      resetTimeout: 10000,
    };

    // 서비스별 특화 설정
    switch (service) {
      case 'educational_ai':
        return {
          ...baseConfig,
          failureThreshold: 3, // 더 민감하게 설정
          timeout: 30000, // 30초
        };
      case 'teacher_report':
        return {
          ...baseConfig,
          failureThreshold: 2, // 리포트 생성은 더 민감하게
          timeout: 45000, // 45초
        };
      case 'chroma':
        return {
          ...baseConfig,
          failureThreshold: 10, // 벡터 검색은 덜 민감하게
          timeout: 15000, // 15초
        };
      default:
        return baseConfig;
    }
  }

  /**
   * 모든 Circuit Breaker 상태 조회
   */
  static getAllStats(): Record<string, CircuitBreakerStats> {
    const stats: Record<string, CircuitBreakerStats> = {};

    for (const [key, circuitBreaker] of Array.from(this.circuitBreakers.entries())) {
      stats[key] = circuitBreaker.getStats();
    }

    return stats;
  }

  /**
   * 특정 서비스의 Circuit Breaker 상태 조회
   */
  static getServiceStats(service: string): Record<string, CircuitBreakerStats> {
    const stats: Record<string, CircuitBreakerStats> = {};

    for (const [key, circuitBreaker] of Array.from(this.circuitBreakers.entries())) {
      if (key.startsWith(`${service}:`)) {
        stats[key] = circuitBreaker.getStats();
      }
    }

    return stats;
  }

  /**
   * 모든 Circuit Breaker 리셋
   */
  static resetAll() {
    for (const circuitBreaker of Array.from(this.circuitBreakers.values())) {
      circuitBreaker.reset();
    }

    logger.info('All circuit breakers reset');
  }

  /**
   * 특정 서비스의 Circuit Breaker 리셋
   */
  static resetService(service: string) {
    for (const [key, circuitBreaker] of Array.from(this.circuitBreakers.entries())) {
      if (key.startsWith(`${service}:`)) {
        circuitBreaker.reset();
      }
    }

    logger.info('Circuit breakers reset for service', { service });
  }
}
