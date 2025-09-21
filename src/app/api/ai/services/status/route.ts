import { authOptions } from '@/lib/core/auth';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

// AI 서비스 상태 관리
interface AIServiceStatus {
  name: string;
  url: string;
  isHealthy: boolean;
  lastChecked: Date;
  features: string[];
}

class UnifiedAIServiceManager {
  private services: AIServiceStatus[] = [];

  constructor() {
    this.services = [
      {
        name: 'Educational AI System',
        url: process.env.EDUCATIONAL_AI_URL || 'http://localhost:8000',
        isHealthy: false,
        lastChecked: new Date(),
        features: ['문제 생성', '교과서 처리', 'RAG 기반 학습', '문제 동기화'],
      },
      {
        name: 'Teacher Report System',
        url: process.env.TEACHER_REPORT_URL || 'http://localhost:8001',
        isHealthy: false,
        lastChecked: new Date(),
        features: ['학급 리포트 생성', '성적 분석', 'AI 리포트'],
      },
    ];
  }

  async checkAllServices(): Promise<AIServiceStatus[]> {
    const healthChecks = this.services.map(async (service) => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const response = await fetch(`${service.url}/health`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        return {
          ...service,
          isHealthy: response.ok,
          lastChecked: new Date(),
        };
      } catch (error) {
        return {
          ...service,
          isHealthy: false,
          lastChecked: new Date(),
        };
      }
    });

    const results = await Promise.all(healthChecks);
    this.services = results;
    return results;
  }

  getServiceStatus(name: string): AIServiceStatus | undefined {
    return this.services.find((service) => service.name === name);
  }

  getAllServices(): AIServiceStatus[] {
    return this.services;
  }

  getHealthyServices(): AIServiceStatus[] {
    return this.services.filter((service) => service.isHealthy);
  }

  getUnhealthyServices(): AIServiceStatus[] {
    return this.services.filter((service) => !service.isHealthy);
  }
}

const aiServiceManager = new UnifiedAIServiceManager();

/**
 * 모든 AI 서비스 상태 확인
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.role || !['TEACHER', 'ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
    }

    const services = await aiServiceManager.checkAllServices();
    const healthyCount = services.filter((s) => s.isHealthy).length;
    const totalCount = services.length;

    return NextResponse.json({
      success: true,
      summary: {
        total: totalCount,
        healthy: healthyCount,
        unhealthy: totalCount - healthyCount,
        overallHealth: healthyCount / totalCount,
      },
      services,
      lastChecked: new Date(),
    });
  } catch (error) {
    console.error('AI 서비스 상태 확인 오류:', error);
    return NextResponse.json(
      { error: 'AI 서비스 상태 확인 중 오류가 발생했습니다.' },
      { status: 500 },
    );
  }
}

/**
 * 특정 AI 서비스 상태 확인
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.role || !['TEACHER', 'ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
    }

    const body = await request.json();
    const { serviceName } = body;

    if (!serviceName) {
      return NextResponse.json({ error: '서비스 이름이 필요합니다.' }, { status: 400 });
    }

    const service = aiServiceManager.getServiceStatus(serviceName);

    if (!service) {
      return NextResponse.json({ error: '해당 서비스를 찾을 수 없습니다.' }, { status: 404 });
    }

    // 개별 서비스 상태 확인
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(`${service.url}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const updatedService = {
        ...service,
        isHealthy: response.ok,
        lastChecked: new Date(),
      };

      return NextResponse.json({
        success: true,
        service: updatedService,
      });
    } catch (error) {
      return NextResponse.json({
        success: true,
        service: {
          ...service,
          isHealthy: false,
          lastChecked: new Date(),
        },
      });
    }
  } catch (error) {
    console.error('AI 서비스 개별 확인 오류:', error);
    return NextResponse.json({ error: 'AI 서비스 확인 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
