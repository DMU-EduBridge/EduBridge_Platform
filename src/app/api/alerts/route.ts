import { performanceMiddleware } from '@/lib/performance';
import { securityMiddleware } from '@/lib/security';
import { getRequestId } from '@/lib/utils/request-context';
import {
  AlertPostBodySchema,
  AlertStatusResponseSchema,
  AlertTestResponseSchema,
} from '@/server/dto/alert';
import { alertService } from '@/server/services/alert.service';
import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

// 알림 관리 엔드포인트
export const GET = performanceMiddleware(async (request: NextRequest) => {
  try {
    const url = new URL(request.url);
    const action = url.searchParams.get('action') || 'status';

    let data: any;
    if (action === 'status') {
      data = alertService.status();
      AlertStatusResponseSchema.parse(data);
    } else if (action === 'test') {
      data = await alertService.testAll();
      AlertTestResponseSchema.parse(data);
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const response = NextResponse.json(data, {
      headers: { 'X-Request-Id': getRequestId(request) },
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
        error: 'Failed to process alert request',
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
});

// 알림 설정 업데이트
export const POST = performanceMiddleware(async (request: NextRequest) => {
  try {
    const raw = await request.json();
    const parsed = AlertPostBodySchema.safeParse(raw);
    if (!parsed.success) return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
    const { action, alertId, config, channelConfig } = parsed.data as any;

    switch (action) {
      case 'register_alert':
        if (!alertId || !config)
          return NextResponse.json({ error: 'Missing alertId or config' }, { status: 400 });
        alertService.registerAlert(alertId, config);
        break;

      case 'add_channel':
        if (!channelConfig)
          return NextResponse.json({ error: 'Missing channel config' }, { status: 400 });
        alertService.addChannel(channelConfig);
        break;

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const response = NextResponse.json(
      { message: 'Alert configuration updated', timestamp: new Date().toISOString() },
      { headers: { 'X-Request-Id': getRequestId(request) } },
    );

    // 보안 헤더 적용
    const securedResponse = securityMiddleware(request);
    securedResponse.headers.forEach((value, key) => {
      response.headers.set(key, value);
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to update alert configuration',
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
});
