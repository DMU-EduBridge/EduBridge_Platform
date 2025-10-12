import { logger } from '../monitoring';

/**
 * Redis 캐시 관리자
 */
//

/**
 * 간단한 메모리 캐시 어댑터 (ioredis 미설치/비가용 시 대체)
 */
class MemoryCacheAdapter {
  private store = new Map<string, { value: string; expiresAt: number }>();

  async get(key: string): Promise<string | null> {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return entry.value;
  }

  async setex(key: string, ttlSeconds: number, value: string): Promise<void> {
    const expiresAt = Date.now() + ttlSeconds * 1000;
    this.store.set(key, { value, expiresAt });
  }

  async del(...keys: string[]): Promise<number> {
    let count = 0;
    keys.forEach((k) => {
      if (this.store.delete(k)) count++;
    });
    return count;
  }

  async keys(pattern: string): Promise<string[]> {
    if (pattern === '*') return Array.from(this.store.keys());
    const regex = new RegExp('^' + pattern.replace('*', '.*') + '$');
    return Array.from(this.store.keys()).filter((k) => regex.test(k));
  }

  async exists(key: string): Promise<number> {
    return this.store.has(key) ? 1 : 0;
  }

  async ttl(key: string): Promise<number> {
    const entry = this.store.get(key);
    if (!entry) return -2; // nonexistent
    const ms = entry.expiresAt - Date.now();
    return ms > 0 ? Math.ceil(ms / 1000) : -2;
  }

  on() {
    // no-op for memory adapter
  }

  async quit(): Promise<void> {
    this.store.clear();
  }
}

export class CacheManager {
  private redis: any;
  private defaultTTL: number = 3600; // 1시간

  constructor() {
    // 개발 환경에서는 메모리 캐시 사용, 프로덕션에서는 Redis 사용
    if (process.env.NODE_ENV === 'development' || !process.env.REDIS_HOST) {
      logger.info('개발 환경 또는 Redis 미설정 - 메모리 캐시 사용');
      this.redis = new MemoryCacheAdapter();
    } else {
      // 프로덕션 환경에서만 ioredis 동적 로드
      try {
        const { Redis } = require('ioredis');
        this.redis = new Redis({
          host: process.env.REDIS_HOST || 'localhost',
          port: parseInt(process.env.REDIS_PORT || '6379'),
          password: process.env.REDIS_PASSWORD,
          retryDelayOnFailover: 100,
          maxRetriesPerRequest: 3,
          lazyConnect: true,
        });

        this.redis.on('error', (error: Error) => {
          logger.error('Redis 연결 오류', undefined, { error: error.message });
        });

        this.redis.on('connect', () => {
          logger.info('Redis 연결 성공');
        });
      } catch (_e) {
        logger.info('ioredis 미설치 또는 사용 불가 - 메모리 캐시 사용');
        this.redis = new MemoryCacheAdapter();
      }
    }
  }

  /**
   * 캐시에서 데이터 조회
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const data = await this.redis.get(key);
      if (!data) return null;

      return JSON.parse(data) as T;
    } catch (error) {
      logger.error('캐시 조회 실패', undefined, {
        key,
        error: error instanceof Error ? error.message : String(error),
      });
      return null;
    }
  }

  /**
   * 캐시에 데이터 저장
   */
  async set<T>(key: string, value: T, ttl?: number): Promise<boolean> {
    try {
      const serialized = JSON.stringify(value);
      const expiration = ttl || this.defaultTTL;

      await this.redis.setex(key, expiration, serialized);
      return true;
    } catch (error) {
      logger.error('캐시 저장 실패', undefined, {
        key,
        error: error instanceof Error ? error.message : String(error),
      });
      return false;
    }
  }

  /**
   * 캐시에서 데이터 삭제
   */
  async delete(key: string): Promise<boolean> {
    try {
      const result = await this.redis.del(key);
      return result > 0;
    } catch (error) {
      logger.error('캐시 삭제 실패', undefined, {
        key,
        error: error instanceof Error ? error.message : String(error),
      });
      return false;
    }
  }

  /**
   * 패턴으로 캐시 삭제
   */
  async deletePattern(pattern: string): Promise<number> {
    try {
      const keys = await this.redis.keys(pattern);
      if (keys.length === 0) return 0;

      return await this.redis.del(...keys);
    } catch (error) {
      logger.error('패턴 캐시 삭제 실패', undefined, {
        pattern,
        error: error instanceof Error ? error.message : String(error),
      });
      return 0;
    }
  }

  /**
   * 캐시 존재 여부 확인
   */
  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.redis.exists(key);
      return result === 1;
    } catch (error) {
      logger.error('캐시 존재 확인 실패', undefined, {
        key,
        error: error instanceof Error ? error.message : String(error),
      });
      return false;
    }
  }

  /**
   * 캐시 TTL 확인
   */
  async getTTL(key: string): Promise<number> {
    try {
      return await this.redis.ttl(key);
    } catch (error) {
      logger.error('캐시 TTL 확인 실패', undefined, {
        key,
        error: error instanceof Error ? error.message : String(error),
      });
      return -1;
    }
  }

  /**
   * 연결 종료
   */
  async disconnect(): Promise<void> {
    try {
      await this.redis.quit();
    } catch (error) {
      logger.error('Redis 연결 종료 실패', undefined, {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
}

/**
 * 캐시 키 생성기
 */
export class CacheKeyGenerator {
  static problem(id: string): string {
    return `problem:${id}`;
  }

  static problems(query: Record<string, any>): string {
    const sortedQuery = Object.keys(query)
      .sort()
      .reduce(
        (result, key) => {
          result[key] = query[key];
          return result;
        },
        {} as Record<string, any>,
      );

    return `problems:${JSON.stringify(sortedQuery)}`;
  }

  static class(id: string): string {
    return `class:${id}`;
  }

  static classes(query: Record<string, any>): string {
    const sortedQuery = Object.keys(query)
      .sort()
      .reduce(
        (result, key) => {
          result[key] = query[key];
          return result;
        },
        {} as Record<string, any>,
      );

    return `classes:${JSON.stringify(sortedQuery)}`;
  }

  static user(id: string): string {
    return `user:${id}`;
  }

  static userStats(userId: string): string {
    return `user:stats:${userId}`;
  }

  static classStats(classId: string): string {
    return `class:stats:${classId}`;
  }

  static problemStats(problemId: string): string {
    return `problem:stats:${problemId}`;
  }
}

/**
 * 캐시 래퍼 함수
 */
export function withCache<T extends any[], R>(
  cacheKey: string | ((...args: T) => string),
  ttl?: number,
  cacheManager?: CacheManager,
) {
  const cache = cacheManager || new CacheManager();

  return async (fn: (...args: T) => Promise<R>, ...args: T): Promise<R> => {
    const key = typeof cacheKey === 'function' ? cacheKey(...args) : cacheKey;

    // 캐시에서 조회 시도
    const cached = await cache.get<R>(key);
    if (cached !== null) {
      logger.info('캐시 히트', { key });
      return cached;
    }

    // 캐시 미스 - 함수 실행
    logger.info('캐시 미스', { key });
    const result = await fn(...args);

    // 결과 캐시에 저장
    await cache.set(key, result, ttl);

    return result;
  };
}

/**
 * 캐시 무효화 헬퍼
 */
export class CacheInvalidator {
  private cache: CacheManager;

  constructor(cacheManager?: CacheManager) {
    this.cache = cacheManager || new CacheManager();
  }

  /**
   * 문제 관련 캐시 무효화
   */
  async invalidateProblem(problemId: string): Promise<void> {
    await Promise.all([
      this.cache.delete(CacheKeyGenerator.problem(problemId)),
      this.cache.deletePattern('problems:*'),
      this.cache.deletePattern('problem:stats:*'),
    ]);
  }

  /**
   * 클래스 관련 캐시 무효화
   */
  async invalidateClass(classId: string): Promise<void> {
    await Promise.all([
      this.cache.delete(CacheKeyGenerator.class(classId)),
      this.cache.deletePattern('classes:*'),
      this.cache.deletePattern('class:stats:*'),
    ]);
  }

  /**
   * 사용자 관련 캐시 무효화
   */
  async invalidateUser(userId: string): Promise<void> {
    await Promise.all([
      this.cache.delete(CacheKeyGenerator.user(userId)),
      this.cache.delete(CacheKeyGenerator.userStats(userId)),
    ]);
  }

  /**
   * 모든 캐시 무효화
   */
  async invalidateAll(): Promise<void> {
    await this.cache.deletePattern('*');
  }
}

// 싱글톤 인스턴스
export const cacheManager = new CacheManager();
export const cacheInvalidator = new CacheInvalidator(cacheManager);
