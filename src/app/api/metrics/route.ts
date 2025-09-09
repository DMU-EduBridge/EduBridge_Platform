import { NextRequest, NextResponse } from "next/server";
import { DashboardDataProvider, LogAnalyzer } from "@/lib/monitoring";
import { AdvancedCacheManager } from "@/lib/performance";
import { securityMiddleware } from "@/lib/security";
import { performanceMiddleware } from "@/lib/performance";

// 고급 메트릭스 엔드포인트
export const GET = performanceMiddleware(async (request: NextRequest) => {
  try {
    const url = new URL(request.url);
    const type = url.searchParams.get('type') || 'overview';
    
    let data;
    
    switch (type) {
      case 'overview':
        data = await DashboardDataProvider.getSystemOverview();
        break;
      case 'trends':
        const hours = parseInt(url.searchParams.get('hours') || '24');
        data = await DashboardDataProvider.getPerformanceTrends(hours);
        break;
      case 'logs':
        const startTime = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24시간 전
        const endTime = new Date();
        data = await LogAnalyzer.analyzeLogs({ start: startTime, end: endTime });
        break;
      case 'cache':
        data = AdvancedCacheManager.getStats();
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid metrics type' },
          { status: 400 }
        );
    }
    
    const response = NextResponse.json(data, {
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
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
        error: 'Failed to fetch metrics',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
});
