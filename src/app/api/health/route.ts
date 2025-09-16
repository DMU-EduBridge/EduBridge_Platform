import { performanceMiddleware } from '@/lib/performance';
import { getRequestId } from '@/lib/utils/request-context';
import { HealthResponseSchema } from '@/server/dto/health';
import { healthService } from '@/server/services/health.service';
import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

// 고급 헬스 체크 엔드포인트
export const GET = performanceMiddleware(async (request: NextRequest) => {
  try {
    const health = await healthService.check();
    HealthResponseSchema.parse(health);

    const response = NextResponse.json(health, {
      status: health.status === 'healthy' ? 200 : 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
        'X-Request-Id': getRequestId(request),
      },
    });

    // 보안 헤더 직접 적용 (route handler에서는 NextResponse.next 사용 금지)
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'SAMEORIGIN');
    response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

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
