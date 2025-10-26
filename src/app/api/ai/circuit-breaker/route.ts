import { AIServiceLogger } from '@/lib/ai-server/ai-service-logger';
import { AICircuitBreakerManager } from '@/lib/ai-server/circuit-breaker';
import { authOptions } from '@/lib/core/auth';
import { logger } from '@/lib/monitoring';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

/**
 * AI 서비스 상태 및 Circuit Breaker 정보 조회
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    // 관리자 또는 교사만 접근 가능
    if (!['ADMIN', 'TEACHER'].includes(session.user.role)) {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const service = searchParams.get('service');
    const includeMetrics = searchParams.get('includeMetrics') === 'true';

    let circuitBreakerStats;
    if (service) {
      circuitBreakerStats = AICircuitBreakerManager.getServiceStats(service);
    } else {
      circuitBreakerStats = AICircuitBreakerManager.getAllStats();
    }

    const response: any = {
      success: true,
      timestamp: new Date().toISOString(),
      circuitBreakers: circuitBreakerStats,
    };

    if (includeMetrics) {
      const metrics = AIServiceLogger.getMetrics(service || undefined);
      response.metrics = metrics;
    }

    logger.info('AI service status requested', {
      userId: session.user.id,
      service: service || 'all',
      includeMetrics,
    });

    return NextResponse.json(response);
  } catch (error) {
    logger.error('AI service status check failed', error as Error);
    return NextResponse.json(
      { error: 'AI 서비스 상태 확인 중 오류가 발생했습니다.' },
      { status: 500 },
    );
  }
}

/**
 * Circuit Breaker 수동 리셋
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    // 관리자만 리셋 가능
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 });
    }

    const body = await request.json().catch(() => ({}));
    const { service, action } = body;

    if (action === 'reset') {
      if (service) {
        AICircuitBreakerManager.resetService(service);
        logger.info('Circuit breaker reset for service', {
          userId: session.user.id,
          service,
        });
      } else {
        AICircuitBreakerManager.resetAll();
        logger.info('All circuit breakers reset', {
          userId: session.user.id,
        });
      }

      return NextResponse.json({
        success: true,
        message: service
          ? `${service} 서비스의 Circuit Breaker가 리셋되었습니다.`
          : '모든 Circuit Breaker가 리셋되었습니다.',
      });
    }

    return NextResponse.json({ error: '지원하지 않는 작업입니다.' }, { status: 400 });
  } catch (error) {
    logger.error('Circuit breaker reset failed', error as Error);
    return NextResponse.json(
      { error: 'Circuit Breaker 리셋 중 오류가 발생했습니다.' },
      { status: 500 },
    );
  }
}
