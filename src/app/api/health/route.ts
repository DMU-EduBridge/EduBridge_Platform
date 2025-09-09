import { NextRequest, NextResponse } from 'next/server';
import { AdvancedHealthChecker } from '@/lib/monitoring';
import { securityMiddleware } from '@/lib/security';
import { performanceMiddleware } from '@/lib/performance';

// 고급 헬스 체크 엔드포인트
export const GET = performanceMiddleware(async (request: NextRequest) => {
  try {
    // 고급 헬스 체크 수행
    const health = await AdvancedHealthChecker.performHealthCheck();

    const response = NextResponse.json(health, {
      status: health.status === 'healthy' ? 200 : 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
      },
    });

    // 보안 헤더 적용
    const securedResponse = securityMiddleware(request);
    securedResponse.headers.forEach((value, key) => {
      response.headers.set(key, value);
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        error: 'Health check failed',
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
});
