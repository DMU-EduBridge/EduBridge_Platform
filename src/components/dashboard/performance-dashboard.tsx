'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  getPerformanceDashboardData,
  usePerformanceMonitoring,
} from '@/lib/performance-monitoring';
import { cn } from '@/lib/utils';
import { AlertTriangle, CheckCircle, RefreshCw, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

interface PerformanceDashboardProps {
  className?: string;
}

export function PerformanceDashboard({ className }: PerformanceDashboardProps) {
  const { report, isMonitoring } = usePerformanceMonitoring();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshData = async () => {
    setIsRefreshing(true);
    try {
      const data = getPerformanceDashboardData();
      setDashboardData(data);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    refreshData();
    const interval = setInterval(refreshData, 30000); // 30초마다 업데이트
    return () => clearInterval(interval);
  }, []);

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case 'good':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'needs-improvement':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'poor':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRatingIcon = (rating: string) => {
    switch (rating) {
      case 'good':
        return <CheckCircle className="h-4 w-4" />;
      case 'needs-improvement':
        return <AlertTriangle className="h-4 w-4" />;
      case 'poor':
        return <XCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  if (!isMonitoring) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>성능 모니터링</CardTitle>
          <CardDescription>성능 모니터링을 초기화하는 중...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">성능 대시보드</h2>
          <p className="text-gray-600">실시간 성능 메트릭 및 Web Vitals</p>
        </div>
        <Button onClick={refreshData} disabled={isRefreshing} variant="outline" size="sm">
          <RefreshCw className={cn('mr-2 h-4 w-4', isRefreshing && 'animate-spin')} />
          새로고침
        </Button>
      </div>

      {/* Web Vitals */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
        {Object.entries(report).map(([key, metric]: [string, any]) => (
          <Card key={key}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium uppercase">{key}</CardTitle>
                <Badge className={cn('text-xs', getRatingColor(metric.rating))}>
                  {getRatingIcon(metric.rating)}
                  <span className="ml-1">{metric.rating}</span>
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {key === 'cls'
                  ? metric.value.toFixed(3)
                  : `${Math.round(metric.value)}${key === 'fid' ? 'ms' : key === 'lcp' || key === 'fcp' || key === 'ttfb' ? 'ms' : ''}`}
              </div>
              <p className="mt-1 text-xs text-gray-600">
                {key === 'lcp' && 'Largest Contentful Paint'}
                {key === 'fid' && 'First Input Delay'}
                {key === 'cls' && 'Cumulative Layout Shift'}
                {key === 'fcp' && 'First Contentful Paint'}
                {key === 'ttfb' && 'Time to First Byte'}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 메모리 사용량 */}
      {dashboardData?.memory && (
        <Card>
          <CardHeader>
            <CardTitle>메모리 사용량</CardTitle>
            <CardDescription>JavaScript 힙 메모리 사용 현황</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <div className="text-sm text-gray-600">현재 사용량</div>
                <div className="text-lg font-semibold">
                  {dashboardData.memory.current
                    ? `${Math.round(dashboardData.memory.current.used / 1024 / 1024)}MB`
                    : 'N/A'}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">평균 사용량</div>
                <div className="text-lg font-semibold">
                  {`${Math.round(dashboardData.memory.average / 1024 / 1024)}MB`}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">최대 사용량</div>
                <div className="text-lg font-semibold">
                  {`${Math.round(dashboardData.memory.peak / 1024 / 1024)}MB`}
                </div>
              </div>
            </div>

            {/* 메모리 사용량 트렌드 */}
            <div className="mt-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">트렌드</span>
                <Badge
                  className={cn(
                    dashboardData.memory.trend === 'increasing' && 'bg-red-100 text-red-800',
                    dashboardData.memory.trend === 'decreasing' && 'bg-green-100 text-green-800',
                    dashboardData.memory.trend === 'stable' && 'bg-gray-100 text-gray-800',
                  )}
                >
                  {dashboardData.memory.trend === 'increasing' && '증가'}
                  {dashboardData.memory.trend === 'decreasing' && '감소'}
                  {dashboardData.memory.trend === 'stable' && '안정'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 리소스 로딩 */}
      {dashboardData?.resources && (
        <Card>
          <CardHeader>
            <CardTitle>리소스 로딩</CardTitle>
            <CardDescription>페이지 리소스 로딩 통계</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              <div>
                <div className="text-sm text-gray-600">총 리소스</div>
                <div className="text-lg font-semibold">
                  {dashboardData.resources.totalResources}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">총 크기</div>
                <div className="text-lg font-semibold">
                  {`${Math.round(dashboardData.resources.totalSize / 1024)}KB`}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">평균 로딩 시간</div>
                <div className="text-lg font-semibold">
                  {`${Math.round(dashboardData.resources.averageLoadTime)}ms`}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">느린 리소스</div>
                <div className="text-lg font-semibold">
                  {dashboardData.resources.slowestResource
                    ? `${Math.round(dashboardData.resources.slowestResource.duration)}ms`
                    : 'N/A'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 알림 */}
      {dashboardData?.alerts && dashboardData.alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>성능 알림</CardTitle>
            <CardDescription>최근 1시간 내 성능 관련 알림</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {dashboardData.alerts.slice(0, 5).map((alert: any, index: number) => (
                <div
                  key={index}
                  className={cn(
                    'flex items-center rounded-lg border p-3',
                    alert.type === 'error' && 'border-red-200 bg-red-50',
                    alert.type === 'warning' && 'border-yellow-200 bg-yellow-50',
                    alert.type === 'info' && 'border-blue-200 bg-blue-50',
                  )}
                >
                  <div className="flex-1">
                    <div className="font-medium">{alert.message}</div>
                    <div className="text-sm text-gray-600">
                      {new Date(alert.timestamp).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 모니터링 상태 */}
      <Card>
        <CardHeader>
          <CardTitle>모니터링 상태</CardTitle>
          <CardDescription>성능 모니터링 시스템 상태</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div
                className={cn('h-3 w-3 rounded-full', isMonitoring ? 'bg-green-500' : 'bg-red-500')}
              />
              <span className="text-sm">{isMonitoring ? '모니터링 활성' : '모니터링 비활성'}</span>
            </div>
            <div className="text-sm text-gray-600">
              마지막 업데이트: {new Date().toLocaleTimeString()}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
