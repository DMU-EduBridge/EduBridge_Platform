import { performanceMiddleware } from '@/lib/performance';
import { getRequestId } from '@/lib/utils/request-context';
import {
  MetricsCacheSchema,
  MetricsLogsSchema,
  MetricsOverviewSchema,
  MetricsTrendsSchema,
} from '@/server/dto/metric';
import { metricService } from '@/server/services/metric.service';
import { NextRequest, NextResponse } from 'next/server';

// 고급 메트릭스 엔드포인트
export const runtime = 'edge'; // 읽기 전용 경량 API → Edge 가능
export const GET = performanceMiddleware(async (request: NextRequest) => {
  try {
    const url = new URL(request.url);
    const type = url.searchParams.get('type') || 'overview';

    let data: any;
    if (type === 'overview') {
      data = await metricService.overview();
      MetricsOverviewSchema.parse(data);
    } else if (type === 'trends') {
      const hours = parseInt(url.searchParams.get('hours') || '24');
      data = await metricService.trends(hours);
      MetricsTrendsSchema.parse(data);
    } else if (type === 'logs') {
      data = await metricService.logs();
      MetricsLogsSchema.parse(data);
    } else if (type === 'cache') {
      data = metricService.cache();
      MetricsCacheSchema.parse(data);
    } else {
      return NextResponse.json({ error: 'Invalid metrics type' }, { status: 400 });
    }

    const response = NextResponse.json(data, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
        'X-Request-Id': getRequestId(request),
      },
    });

    // Edge 호환 보안 헤더 직접 적용
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'SAMEORIGIN');
    response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

    return response;
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to fetch metrics',
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
});
