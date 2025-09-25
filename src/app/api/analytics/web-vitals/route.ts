import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Web Vitals 메트릭 스키마
const WebVitalSchema = z.object({
  name: z.enum(['CLS', 'FID', 'LCP', 'FCP', 'TTFB']),
  value: z.number(),
  rating: z.enum(['good', 'needs-improvement', 'poor']),
  delta: z.number(),
  id: z.string(),
  timestamp: z.number(),
  url: z.string(),
  userAgent: z.string(),
});

// Web Vitals 데이터 수집 API
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const webVital = WebVitalSchema.parse(body);

    // 개발 환경에서는 로그만 출력
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Web Vitals received:', {
        metric: webVital.name,
        value: webVital.value,
        rating: webVital.rating,
        url: webVital.url,
        timestamp: new Date(webVital.timestamp).toISOString(),
      });

      return NextResponse.json({ success: true });
    }

    // 프로덕션 환경에서는 데이터베이스에 저장하거나 외부 서비스로 전송
    // 예: Google Analytics, DataDog, New Relic 등

    // 여기서는 간단히 로그만 출력
    console.log('Web Vitals:', webVital);

    // 실제 구현에서는 다음과 같은 작업을 수행할 수 있습니다:
    // 1. 데이터베이스에 저장
    // 2. 외부 분석 서비스로 전송
    // 3. 실시간 모니터링 대시보드 업데이트
    // 4. 알림 시스템과 연동

    return NextResponse.json({
      success: true,
      message: 'Web vitals data received successfully',
    });
  } catch (error) {
    console.error('Error processing web vitals:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid web vitals data',
          details: error.errors,
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 },
    );
  }
}
