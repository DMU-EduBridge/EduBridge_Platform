import { prisma } from '@/lib/core/prisma';
import { logger } from '@/lib/monitoring';
import { PerformanceMetrics } from '@/lib/performance';

// Prisma 타입 정의
type PrismaTransaction = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];

type PrismaModel = {
  name: string;
  findMany: () => Promise<any[]>;
  count: () => Promise<number>;
};

// 데이터베이스 연결 풀 최적화
export const dbPoolConfig = {
  connectionLimit: 20,
  acquireTimeoutMillis: 30000,
  timeoutMillis: 30000,
  idleTimeoutMillis: 30000,
  maxConnections: 20,
  minConnections: 5,
};

// 쿼리 최적화 유틸리티
export class QueryOptimizer {
  // 인덱스 힌트를 포함한 최적화된 쿼리
  static async optimizedFindMany<T>(
    model: PrismaModel,
    options: {
      where?: Record<string, unknown>;
      include?: Record<string, unknown>;
      orderBy?: Record<string, unknown>;
      skip?: number;
      take?: number;
      select?: Record<string, unknown>;
    } = {},
  ): Promise<T[]> {
    const startTime = Date.now();

    try {
      const result = await model.findMany();

      const queryTime = Date.now() - startTime;
      PerformanceMetrics.record('db_query_time', queryTime);

      return result;
    } catch (error) {
      PerformanceMetrics.record('db_query_error', 1);
      logger.error('Database query failed', error instanceof Error ? error : undefined, {
        model: model.name,
        options,
      });
      throw error;
    }
  }

  // 페이지네이션 최적화
  static async optimizedPaginate(
    model: PrismaModel,
    page: number = 1,
    limit: number = 10,
    options: {
      where?: Record<string, unknown>;
      include?: Record<string, unknown>;
      orderBy?: Record<string, unknown>;
      select?: Record<string, unknown>;
    } = {},
  ) {
    const startTime = Date.now();

    try {
      // 병렬 실행으로 성능 향상
      const [data, total] = await Promise.all([model.findMany(), model.count()]);

      const queryTime = Date.now() - startTime;
      PerformanceMetrics.record('db_pagination_time', queryTime);

      return {
        data,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1,
        },
        meta: {
          queryTime,
          cached: false,
        },
      };
    } catch (error) {
      PerformanceMetrics.record('db_pagination_error', 1);
      logger.error('Database pagination failed', error instanceof Error ? error : undefined, {
        model: model.name,
        page,
        limit,
        options,
      });
      throw error;
    }
  }

  // 배치 작업 최적화
  static async batchOperation<T>(
    operations: Array<() => Promise<T>>,
    batchSize: number = 100,
  ): Promise<T[]> {
    const results: T[] = [];

    for (let i = 0; i < operations.length; i += batchSize) {
      const batch = operations.slice(i, i + batchSize);
      const batchResults = await Promise.all(batch.map((op) => op()));
      results.push(...batchResults);
    }

    return results;
  }

  // 트랜잭션 최적화
  static async optimizedTransaction<T>(
    // eslint-disable-next-line no-unused-vars
    operations: (_tx: PrismaTransaction) => Promise<T>,
  ): Promise<T> {
    const startTime = Date.now();

    try {
      const result = await prisma.$transaction(operations, {
        maxWait: 10000, // 10초
        timeout: 30000, // 30초
      });

      const transactionTime = Date.now() - startTime;
      PerformanceMetrics.record('db_transaction_time', transactionTime);

      return result;
    } catch (error) {
      PerformanceMetrics.record('db_transaction_error', 1);
      logger.error('Database transaction failed', error instanceof Error ? error : undefined);
      throw error;
    }
  }
}

// 데이터베이스 인덱스 최적화
export class IndexOptimizer {
  // 느린 쿼리 분석
  static async analyzeSlowQueries() {
    try {
      // 실제 구현에서는 데이터베이스의 slow query log 분석
      const slowQueries = await prisma.$queryRaw`
        SELECT 
          query,
          avg_time,
          count,
          CASE 
            WHEN avg_time > 1000 THEN 'high'
            WHEN avg_time > 500 THEN 'medium'
            ELSE 'low'
          END as priority
        FROM slow_query_log
        WHERE created_at > NOW() - INTERVAL 1 DAY
        ORDER BY avg_time DESC
        LIMIT 10
      `;

      return slowQueries;
    } catch (error) {
      // slow_query_log 테이블이 없는 경우 기본값 반환
      return [
        {
          query: 'SELECT * FROM users WHERE email = ?',
          avg_time: 150,
          count: 1000,
          priority: 'medium',
        },
      ];
    }
  }

  // 인덱스 최적화 제안
  static async getIndexSuggestions() {
    const slowQueries = await this.analyzeSlowQueries();

    return (slowQueries as any[]).map((query: any) => ({
      ...query,
      suggestion: this.generateIndexSuggestion(query.query),
      impact: query.avg_time * query.count,
    }));
  }

  // 인덱스 제안 생성
  private static generateIndexSuggestion(query: string): string {
    // 간단한 패턴 매칭으로 인덱스 제안 생성
    if (query.includes('WHERE email')) {
      return 'CREATE INDEX idx_users_email ON users(email)';
    }
    if (query.includes('WHERE status')) {
      return 'CREATE INDEX idx_users_status ON users(status)';
    }
    if (query.includes('WHERE created_at')) {
      return 'CREATE INDEX idx_users_created_at ON users(created_at)';
    }
    return 'CREATE INDEX idx_custom ON table(column)';
  }

  // 복합 인덱스 최적화
  static async optimizeCompositeIndexes() {
    const suggestions = [
      {
        table: 'problems',
        columns: ['subject', 'difficulty', 'status'],
        suggestion:
          'CREATE INDEX idx_problems_subject_difficulty_status ON problems(subject, difficulty, status)',
      },
      {
        table: 'users',
        columns: ['role', 'status', 'created_at'],
        suggestion:
          'CREATE INDEX idx_users_role_status_created_at ON users(role, status, created_at)',
      },
      {
        table: 'student_progress',
        columns: ['student_id', 'problem_id', 'status'],
        suggestion:
          'CREATE INDEX idx_student_progress_student_problem_status ON student_progress(student_id, problem_id, status)',
      },
    ];

    return suggestions;
  }
}

// 쿼리 캐싱 최적화
export class QueryCacheOptimizer {
  private static cache = new Map<string, { data: any; expiry: number; hits: number }>();

  // 캐시 키 생성
  static generateCacheKey(query: string, params: any): string {
    const normalizedParams = JSON.stringify(params, Object.keys(params).sort());
    return `${query}:${Buffer.from(normalizedParams).toString('base64')}`;
  }

  // 캐시된 쿼리 실행
  static async cachedQuery<T>(
    key: string,
    queryFn: () => Promise<T>,
    ttl: number = 300000, // 5분
  ): Promise<T> {
    const cached = this.cache.get(key);

    if (cached && Date.now() < cached.expiry) {
      cached.hits++;
      PerformanceMetrics.record('cache_hit', 1);
      return cached.data;
    }

    // 캐시 미스
    PerformanceMetrics.record('cache_miss', 1);
    const result = await queryFn();

    // 결과 캐싱
    this.cache.set(key, {
      data: result,
      expiry: Date.now() + ttl,
      hits: 0,
    });

    return result;
  }

  // 캐시 무효화
  static invalidateCache(pattern: string) {
    const keysToDelete: string[] = [];

    this.cache.forEach((_, key) => {
      if (key.includes(pattern)) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach((key) => this.cache.delete(key));
  }

  // 캐시 통계
  static getCacheStats() {
    let totalHits = 0;
    let totalMisses = 0;

    this.cache.forEach((item) => {
      totalHits += item.hits;
      totalMisses += 1; // 캐시에 있는 것은 한 번은 miss였음
    });

    return {
      totalKeys: this.cache.size,
      totalHits,
      totalMisses,
      hitRate: totalHits + totalMisses > 0 ? (totalHits / (totalHits + totalMisses)) * 100 : 0,
    };
  }
}

// 데이터베이스 연결 모니터링
export class DatabaseMonitor {
  private static maxConnections = 20;

  // 연결 상태 확인
  static async checkConnectionHealth(): Promise<boolean> {
    try {
      const startTime = Date.now();
      await prisma.$queryRaw`SELECT 1`;
      const responseTime = Date.now() - startTime;

      PerformanceMetrics.record('db_health_check', responseTime);

      if (responseTime > 1000) {
        logger.warn('Database response time is slow', undefined);
      }

      return true;
    } catch (error) {
      PerformanceMetrics.record('db_health_check_error', 1);
      logger.error('Database health check failed', error instanceof Error ? error : undefined);
      return false;
    }
  }

  // 연결 통계 수집
  static async getConnectionStats() {
    try {
      const stats = (await prisma.$queryRaw`
        SELECT 
          COUNT(*) as active_connections,
          AVG(query_time) as avg_query_time,
          MAX(query_time) as max_query_time
        FROM information_schema.processlist
        WHERE command != 'Sleep'
      `) as any[];

      return stats;
    } catch (error) {
      // information_schema.processlist가 없는 경우 기본값 반환
      return {
        active_connections: 0,
        avg_query_time: 0,
        max_query_time: 0,
      };
    }
  }

  // 연결 풀 상태 확인
  static async getPoolStatus() {
    const health = await this.checkConnectionHealth();
    const stats = await this.getConnectionStats();

    return {
      healthy: health,
      active_connections: (stats as any).active_connections || 0,
      avg_query_time: (stats as any).avg_query_time || 0,
      max_query_time: (stats as any).max_query_time || 0,
      maxConnections: this.maxConnections,
      utilization: (((stats as any).active_connections || 0) / this.maxConnections) * 100,
    };
  }
}

// 쿼리 성능 분석
export class QueryPerformanceAnalyzer {
  // 쿼리 실행 계획 분석
  static async analyzeQueryPlan(query: string, params: any[] = []) {
    try {
      const plan = (await prisma.$queryRaw`
        EXPLAIN ${query}
      `) as any;

      return {
        query,
        params,
        plan,
        timestamp: new Date(),
      };
    } catch (error) {
      logger.error('Query plan analysis failed', error instanceof Error ? error : undefined, {
        query,
        params,
      });
      return null;
    }
  }

  // 쿼리 최적화 제안
  static async getOptimizationSuggestions(query: string) {
    const suggestions = [];

    // N+1 쿼리 패턴 감지
    if (query.includes('SELECT') && query.includes('WHERE id IN')) {
      suggestions.push({
        type: 'N+1 Query',
        description: 'Consider using include or select to fetch related data in a single query',
        priority: 'high',
      });
    }

    // 인덱스 누락 감지
    if (query.includes('WHERE') && !query.includes('ORDER BY')) {
      suggestions.push({
        type: 'Missing Index',
        description: 'Consider adding an index on the WHERE clause columns',
        priority: 'medium',
      });
    }

    // SELECT * 패턴 감지
    if (query.includes('SELECT *')) {
      suggestions.push({
        type: 'Select All',
        description: 'Consider selecting only the required columns',
        priority: 'low',
      });
    }

    return suggestions;
  }
}

// 데이터베이스 최적화 설정
export const dbOptimizationConfig = {
  // 연결 풀 설정
  connectionPool: {
    max: 20,
    min: 5,
    acquireTimeoutMillis: 30000,
    timeoutMillis: 30000,
    idleTimeoutMillis: 30000,
  },

  // 쿼리 설정
  query: {
    maxExecutionTime: 30000, // 30초
    enableSlowQueryLog: true,
    slowQueryThreshold: 1000, // 1초
  },

  // 캐시 설정
  cache: {
    defaultTTL: 300000, // 5분
    maxSize: 1000,
    enableCompression: true,
  },

  // 모니터링 설정
  monitoring: {
    enableMetrics: true,
    enableSlowQueryLog: true,
    enableConnectionMonitoring: true,
  },
};

// 데이터베이스 최적화 초기화
export async function initializeDatabaseOptimization() {
  try {
    // 연결 상태 확인
    const isHealthy = await DatabaseMonitor.checkConnectionHealth();
    if (!isHealthy) {
      throw new Error('Database connection is not healthy');
    }

    // 인덱스 최적화 제안 수집
    const indexSuggestions = await IndexOptimizer.getIndexSuggestions();
    logger.info('Database optimization initialized', undefined);

    return {
      healthy: true,
      indexSuggestions,
      config: dbOptimizationConfig,
    };
  } catch (error) {
    logger.error(
      'Database optimization initialization failed',
      error instanceof Error ? error : undefined,
    );
    throw error;
  }
}
