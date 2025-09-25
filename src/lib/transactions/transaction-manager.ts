import { Prisma } from '@prisma/client';
import { prisma } from '../core/prisma';
import { DatabaseError } from '../errors';
import { logger } from '../monitoring';

/**
 * 트랜잭션 관리 유틸리티
 */

/**
 * 트랜잭션 실행 함수
 */
export async function executeTransaction<T>(
  operations: (tx: Prisma.TransactionClient) => Promise<T>,
  options?: {
    timeout?: number;
    isolationLevel?: Prisma.TransactionIsolationLevel;
  },
): Promise<T> {
  try {
    return await prisma.$transaction(operations, {
      timeout: options?.timeout || 10000, // 10초 기본 타임아웃
      isolationLevel: options?.isolationLevel || Prisma.TransactionIsolationLevel.Serializable,
    });
  } catch (error) {
    logger.error('트랜잭션 실행 실패', undefined, {
      error: error instanceof Error ? error.message : String(error),
      timeout: options?.timeout,
      isolationLevel: options?.isolationLevel,
    });
    throw new DatabaseError('트랜잭션 실행에 실패했습니다.', error);
  }
}

/**
 * 읽기 전용 트랜잭션 실행 함수
 */
export async function executeReadOnlyTransaction<T>(
  operations: (tx: Prisma.TransactionClient) => Promise<T>,
  timeout?: number,
): Promise<T> {
  return executeTransaction(operations, {
    timeout: timeout || 5000,
    isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
  });
}

/**
 * 쓰기 트랜잭션 실행 함수
 */
export async function executeWriteTransaction<T>(
  operations: (tx: Prisma.TransactionClient) => Promise<T>,
  timeout?: number,
): Promise<T> {
  return executeTransaction(operations, {
    timeout: timeout || 15000,
    isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
  });
}

/**
 * 배치 작업 트랜잭션 실행 함수
 */
export async function executeBatchTransaction<T>(
  operations: (tx: Prisma.TransactionClient) => Promise<T>,
  timeout?: number,
): Promise<T> {
  return executeTransaction(operations, {
    timeout: timeout || 30000,
    isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
  });
}

/**
 * 트랜잭션 래퍼 함수 (에러 핸들링 포함)
 */
export function withTransaction<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  options?: {
    timeout?: number;
    isolationLevel?: Prisma.TransactionIsolationLevel;
  },
) {
  return async (...args: T): Promise<R> => {
    return executeTransaction(() => fn(...args), options);
  };
}

/**
 * 복잡한 비즈니스 로직을 위한 트랜잭션 헬퍼
 */
export class TransactionManager {
  private tx: Prisma.TransactionClient | null = null;

  constructor(
    private options?: {
      timeout?: number;
      isolationLevel?: Prisma.TransactionIsolationLevel;
    },
  ) {}

  async execute<T>(operations: (tx: Prisma.TransactionClient) => Promise<T>): Promise<T> {
    if (this.tx) {
      // 이미 트랜잭션 내부인 경우
      return operations(this.tx);
    }

    return executeTransaction(operations, this.options);
  }

  async startTransaction<T>(operations: (tx: Prisma.TransactionClient) => Promise<T>): Promise<T> {
    if (this.tx) {
      throw new Error('이미 트랜잭션이 시작되었습니다.');
    }

    return executeTransaction(operations, this.options);
  }
}

/**
 * 특정 도메인별 트랜잭션 헬퍼들
 */

/**
 * 사용자 관련 트랜잭션
 */
export async function executeUserTransaction<T>(
  operations: (tx: Prisma.TransactionClient) => Promise<T>,
): Promise<T> {
  return executeWriteTransaction(operations, 10000);
}

/**
 * 문제 관련 트랜잭션
 */
export async function executeProblemTransaction<T>(
  operations: (tx: Prisma.TransactionClient) => Promise<T>,
): Promise<T> {
  return executeWriteTransaction(operations, 15000);
}

/**
 * 클래스 관련 트랜잭션
 */
export async function executeClassTransaction<T>(
  operations: (tx: Prisma.TransactionClient) => Promise<T>,
): Promise<T> {
  return executeWriteTransaction(operations, 20000);
}

/**
 * 리포트 관련 트랜잭션
 */
export async function executeReportTransaction<T>(
  operations: (tx: Prisma.TransactionClient) => Promise<T>,
): Promise<T> {
  return executeWriteTransaction(operations, 10000);
}

/**
 * 통계 관련 트랜잭션 (읽기 전용)
 */
export async function executeStatsTransaction<T>(
  operations: (tx: Prisma.TransactionClient) => Promise<T>,
): Promise<T> {
  return executeReadOnlyTransaction(operations, 5000);
}

/**
 * 트랜잭션 상태 확인 함수
 */
export async function isInTransaction(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return false;
  } catch (error) {
    // 트랜잭션 내부에서는 특정 에러가 발생할 수 있음
    return true;
  }
}

/**
 * 트랜잭션 롤백 헬퍼
 */
export function createRollbackHandler() {
  return {
    rollback: async (reason?: string) => {
      logger.warn('트랜잭션 롤백', { reason });
      throw new Error(`트랜잭션 롤백: ${reason || '알 수 없는 이유'}`);
    },
  };
}

/**
 * 트랜잭션 재시도 헬퍼
 */
export async function retryTransaction<T>(
  operations: (tx: Prisma.TransactionClient) => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000,
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await executeTransaction(operations);
    } catch (error) {
      lastError = error as Error;

      if (attempt === maxRetries) {
        break;
      }

      // 특정 에러에 대해서만 재시도
      if (
        error instanceof Error &&
        (error.message.includes('deadlock') ||
          error.message.includes('timeout') ||
          error.message.includes('connection'))
      ) {
        logger.warn(`트랜잭션 재시도 ${attempt}/${maxRetries}`, {
          error: error.message,
          delay,
        });

        await new Promise((resolve) => setTimeout(resolve, delay * attempt));
        continue;
      }

      // 재시도하지 않을 에러는 즉시 throw
      throw error;
    }
  }

  throw lastError || new Error('트랜잭션 재시도 실패');
}
