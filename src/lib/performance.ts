import { prisma } from '@/lib/core/prisma';
import { NextRequest } from 'next/server';
import { logger } from './monitoring';

// ============================================================================
// 기본 성능 기능
// ============================================================================

// 데이터베이스 연결 풀 최적화
export const dbConfig = {
  connectionLimit: 10,
  acquireTimeoutMillis: 30000, // cspell:disable-line
  timeoutMillis: 30000, // cspell:disable-line
  idleTimeoutMillis: 30000, // cspell:disable-line
};

// 쿼리 최적화 유틸리티
export class QueryOptimizer {
  // 페이지네이션 최적화
  static async paginate(query: any, page: number = 1, limit: number = 10, maxLimit: number = 100) {
    const safeLimit = Math.min(limit, maxLimit);
    const skip = (page - 1) * safeLimit;

    const [data, total] = await Promise.all([
      query.skip(skip).take(safeLimit),
      prisma.$queryRaw`SELECT COUNT(*) as count FROM (${query}) as subquery`,
    ]);

    const totalCount =
      Array.isArray(total) && total.length > 0 ? Number((total[0] as any)?.count || 0) : 0;

    return {
      data,
      pagination: {
        page,
        limit: safeLimit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / safeLimit),
      },
    };
  }

  // 인덱스 힌트를 위한 쿼리 빌더
  static buildOptimizedQuery(baseQuery: any, filters: Record<string, any>) {
    let query = baseQuery;

    // 자주 사용되는 필터에 대한 인덱스 힌트
    if (filters.status) {
      query = query.where({ status: filters.status });
    }

    if (filters.subject) {
      query = query.where({ subject: filters.subject });
    }

    if (filters.difficulty) {
      query = query.where({ difficulty: filters.difficulty });
    }

    return query;
  }
}

// 캐싱 전략
export class CacheManager {
  private static cache = new Map<string, { data: any; expiry: number }>();

  static set(key: string, data: any, ttlSeconds: number = 300) {
    this.cache.set(key, {
      data,
      expiry: Date.now() + ttlSeconds * 1000,
    });
  }

  static get(key: string): any | null {
    const item = this.cache.get(key);

    if (!item) {
      return null;
    }

    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  static invalidate(pattern: string) {
    const keysToDelete: string[] = [];
    this.cache.forEach((_, key) => {
      if (key.includes(pattern)) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach((key) => this.cache.delete(key));
  }

  static clear() {
    this.cache.clear();
  }
}

// API 응답 최적화
export function optimizeResponse(data: any, request: NextRequest) {
  const url = new URL(request.url);
  const fields = url.searchParams.get('fields');

  if (!fields) {
    return data;
  }

  const requestedFields = fields.split(',');

  if (Array.isArray(data)) {
    return data.map((item) => pickFields(item, requestedFields));
  }

  return pickFields(data, requestedFields);
}

function pickFields(obj: any, fields: string[]) {
  const result: any = {};

  for (const field of fields) {
    if (obj.hasOwnProperty(field)) {
      result[field] = obj[field];
    }
  }

  return result;
}

// 데이터베이스 연결 모니터링
export class DatabaseMonitor {
  private static connectionCount = 0;
  private static maxConnections = 10;

  static async checkConnectionHealth() {
    try {
      await prisma.$queryRaw`SELECT 1`;
      logger.info('Database connection healthy');
      return true;
    } catch (error) {
      console.error('Database connection failed', error);
      return false;
    }
  }

  static async getConnectionStats() {
    const stats = await prisma.$queryRaw`
      SELECT 
        COUNT(*) as active_connections,
        AVG(query_time) as avg_query_time
      FROM information_schema.processlist -- cspell:disable-line
      WHERE command != 'Sleep'
    `;

    return stats;
  }
}

// 메모리 사용량 모니터링
export function getMemoryUsage() {
  const usage = process.memoryUsage();

  return {
    rss: Math.round(usage.rss / 1024 / 1024), // MB
    heapTotal: Math.round(usage.heapTotal / 1024 / 1024), // MB
    heapUsed: Math.round(usage.heapUsed / 1024 / 1024), // MB
    external: Math.round(usage.external / 1024 / 1024), // MB
  };
}

// 성능 메트릭 수집
export class PerformanceMetrics {
  private static metrics = new Map<string, number[]>();

  static recordMetric(name: string, value: number) {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }

    const values = this.metrics.get(name)!;
    values.push(value);

    // 최근 100개 값만 유지
    if (values.length > 100) {
      values.shift();
    }
  }

  // recordMetric의 별칭
  static record(name: string, value: number) {
    this.recordMetric(name, value);
  }

  static getMetricStats(name: string) {
    const values = this.metrics.get(name) || [];

    if (values.length === 0) {
      return null;
    }

    const sorted = [...values].sort((a, b) => a - b);
    const sum = values.reduce((a, b) => a + b, 0);

    return {
      count: values.length,
      min: sorted[0],
      max: sorted[sorted.length - 1],
      avg: sum / values.length,
      p50: sorted[Math.floor(values.length * 0.5)],
      p95: sorted[Math.floor(values.length * 0.95)],
      p99: sorted[Math.floor(values.length * 0.99)],
    };
  }

  static getAllMetrics() {
    const result: Record<string, any> = {};

    this.metrics.forEach((_, name) => {
      result[name] = this.getMetricStats(name);
    });

    return result;
  }
}

// ============================================================================
// 고급 성능 기능
// ============================================================================

// 고급 캐싱 전략
export class AdvancedCacheManager {
  private static cache = new Map<string, { data: any; expiry: number; tags: string[] }>();
  private static tagIndex = new Map<string, Set<string>>();

  // 태그 기반 캐싱
  static set(key: string, data: any, ttl: number = 300000, tags: string[] = []) {
    const expiry = Date.now() + ttl;
    this.cache.set(key, { data, expiry, tags });

    // 태그 인덱스 업데이트
    tags.forEach((tag) => {
      if (!this.tagIndex.has(tag)) {
        this.tagIndex.set(tag, new Set());
      }
      this.tagIndex.get(tag)!.add(key);
    });
  }

  static get(key: string): any | null {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  // 태그로 캐시 무효화
  static invalidateByTag(tag: string) {
    const keys = this.tagIndex.get(tag);
    if (keys) {
      keys.forEach((key) => this.cache.delete(key));
      this.tagIndex.delete(tag);
    }
  }

  // 패턴으로 캐시 무효화
  static invalidatePattern(pattern: string) {
    const regex = new RegExp(pattern);
    const keysToDelete: string[] = [];

    this.cache.forEach((_, key) => {
      if (regex.test(key)) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach((key) => this.cache.delete(key));
  }

  // 캐시 통계
  static getStats() {
    const now = Date.now();
    let expired = 0;
    let active = 0;

    this.cache.forEach((item) => {
      if (now > item.expiry) {
        expired++;
      } else {
        active++;
      }
    });

    return {
      total: this.cache.size,
      active,
      expired,
      hitRate: this.calculateHitRate(),
    };
  }

  private static hitCount = 0;
  private static missCount = 0;

  private static calculateHitRate(): number {
    const total = this.hitCount + this.missCount;
    return total > 0 ? (this.hitCount / total) * 100 : 0;
  }
}

// 데이터베이스 쿼리 최적화
export class DatabaseOptimizer {
  // 연결 풀 최적화
  static async optimizeConnectionPool() {
    // Prisma 연결 풀 설정 최적화
    const config = {
      connectionLimit: 20,
      acquireTimeoutMillis: 30000, // cspell:disable-line
      timeoutMillis: 30000, // cspell:disable-line
      idleTimeoutMillis: 30000, // cspell:disable-line
    };

    return config;
  }

  // 쿼리 최적화된 페이지네이션
  static async optimizedPaginate(
    model: any,
    page: number = 1,
    limit: number = 10,
    where: any = {},
    include: any = {},
    orderBy: any = {},
  ) {
    const startTime = Date.now();

    try {
      const skip = (page - 1) * limit;

      // 병렬 실행으로 성능 향상
      const [data, total] = await Promise.all([
        model.findMany({
          where,
          include,
          orderBy,
          skip,
          take: limit,
        }),
        model.count({ where }),
      ]);

      const queryTime = Date.now() - startTime;
      PerformanceMetrics.record('db_query_time', queryTime);

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
      PerformanceMetrics.record('db_query_error', 1);
      throw error;
    }
  }

  // 캐시된 쿼리 실행
  static async cachedQuery<T>(
    key: string,
    queryFn: () => Promise<T>,
    ttl: number = 300000,
    tags: string[] = [],
  ): Promise<T> {
    // 캐시 확인
    const cached = AdvancedCacheManager.get(key);
    if (cached) {
      PerformanceMetrics.record('cache_hit', 1);
      return cached;
    }

    // 캐시 미스
    PerformanceMetrics.record('cache_miss', 1);
    const result = await queryFn();

    // 결과 캐싱
    AdvancedCacheManager.set(key, result, ttl, tags);

    return result;
  }
}

// API 응답 최적화
export class ResponseOptimizer {
  // 응답 압축
  static compressResponse(data: any): string {
    // JSON 압축 (실제로는 gzip 등 사용)
    return JSON.stringify(data, null, 0);
  }

  // 필드 선택적 반환
  static selectFields<T>(data: T, fields: (keyof T)[]): Partial<T> {
    const result: Partial<T> = {};
    fields.forEach((field) => {
      if (data[field] !== undefined) {
        result[field] = data[field];
      }
    });
    return result;
  }

  // 중첩 객체 최적화
  static optimizeNestedData(data: any, maxDepth: number = 3): any {
    if (maxDepth <= 0) return null;

    if (Array.isArray(data)) {
      return data.map((item) => this.optimizeNestedData(item, maxDepth - 1));
    }

    if (data && typeof data === 'object') {
      const optimized: any = {};
      Object.keys(data).forEach((key) => {
        optimized[key] = this.optimizeNestedData(data[key], maxDepth - 1);
      });
      return optimized;
    }

    return data;
  }
}

// 이미지 최적화
export class ImageOptimizer {
  static getOptimizedImageUrl(
    originalUrl: string,
    width?: number,
    height?: number,
    quality: number = 80,
  ): string {
    const params = new URLSearchParams();

    if (width) params.set('w', width.toString());
    if (height) params.set('h', height.toString());
    params.set('q', quality.toString());

    return `${originalUrl}?${params.toString()}`;
  }

  static generateResponsiveImages(baseUrl: string): {
    mobile: string;
    tablet: string;
    desktop: string;
  } {
    return {
      mobile: this.getOptimizedImageUrl(baseUrl, 320, undefined, 75),
      tablet: this.getOptimizedImageUrl(baseUrl, 768, undefined, 80),
      desktop: this.getOptimizedImageUrl(baseUrl, 1200, undefined, 85),
    };
  }
}

// 리소스 프리로딩
export class ResourcePreloader {
  static generatePreloadLinks(
    resources: Array<{
      href: string;
      as: string;
      type?: string;
      crossorigin?: boolean;
    }>,
  ): string[] {
    return resources.map((resource) => {
      let link = `<link rel="preload" href="${resource.href}" as="${resource.as}"`;

      if (resource.type) {
        link += ` type="${resource.type}"`;
      }

      if (resource.crossorigin) {
        link += ` crossorigin`;
      }

      link += '>';
      return link;
    });
  }

  static preloadCriticalResources(): string[] {
    return this.generatePreloadLinks([
      {
        href: '/api/problems',
        as: 'fetch',
        crossorigin: true,
      },
      {
        href: '/api/students',
        as: 'fetch',
        crossorigin: true,
      },
    ]);
  }
}

// 성능 모니터링 미들웨어
export function performanceMiddleware(handler: Function) {
  return async (req: NextRequest, ...args: any[]) => {
    const startTime = Date.now();
    const startMemory = process.memoryUsage();

    try {
      const result = await handler(req, ...args);

      const endTime = Date.now();
      const endMemory = process.memoryUsage();

      // 성능 메트릭 기록
      PerformanceMetrics.record('request_duration', endTime - startTime);
      PerformanceMetrics.record('memory_usage', endMemory.heapUsed - startMemory.heapUsed);

      // 응답 헤더에 성능 정보 추가
      if (result instanceof Response) {
        result.headers.set('X-Response-Time', `${endTime - startTime}ms`);
        result.headers.set('X-Memory-Usage', `${endMemory.heapUsed - startMemory.heapUsed}bytes`);
      }

      return result;
    } catch (error) {
      const endTime = Date.now();
      PerformanceMetrics.record('request_error', endTime - startTime);
      throw error;
    }
  };
}

// 데이터베이스 인덱스 최적화
export class IndexOptimizer {
  static async analyzeSlowQueries() {
    // 실제 구현에서는 데이터베이스의 slow query log 분석
    const slowQueries = [
      {
        query: 'SELECT * FROM users WHERE email = ?',
        avgTime: 150,
        frequency: 1000,
        suggestion: 'CREATE INDEX idx_users_email ON users(email)',
      },
    ];

    return slowQueries;
  }

  static async optimizeIndexes() {
    const suggestions = await this.analyzeSlowQueries();

    // 인덱스 최적화 제안
    return suggestions.map((suggestion) => ({
      ...suggestion,
      priority: suggestion.avgTime > 100 ? 'high' : 'medium',
      impact: suggestion.frequency * suggestion.avgTime,
    }));
  }
}

// 메모리 사용량 최적화
export class MemoryOptimizer {
  static getMemoryStats() {
    const usage = process.memoryUsage();
    return {
      rss: Math.round(usage.rss / 1024 / 1024), // MB
      heapTotal: Math.round(usage.heapTotal / 1024 / 1024), // MB
      heapUsed: Math.round(usage.heapUsed / 1024 / 1024), // MB
      external: Math.round(usage.external / 1024 / 1024), // MB
      arrayBuffers: Math.round(usage.arrayBuffers / 1024 / 1024), // MB
    };
  }

  static async cleanupMemory() {
    // 가비지 컬렉션 강제 실행 (개발 환경에서만)
    if (process.env.NODE_ENV === 'development' && global.gc) {
      global.gc();
    }

    // 캐시 정리
    AdvancedCacheManager.invalidatePattern('.*');

    return this.getMemoryStats();
  }
}
