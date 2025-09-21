'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Activity,
  AlertCircle,
  Brain,
  CheckCircle,
  FileText,
  Loader2,
  RefreshCw,
  Server,
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface AIServiceStatus {
  name: string;
  url: string;
  isHealthy: boolean;
  lastChecked: string;
  features: string[];
}

interface AIServiceSummary {
  total: number;
  healthy: number;
  unhealthy: number;
  overallHealth: number;
}

interface AIServiceResponse {
  success: boolean;
  summary?: AIServiceSummary;
  services?: AIServiceStatus[];
  lastChecked?: string;
  error?: string;
}

export function AIServiceMonitorCard() {
  const [services, setServices] = useState<AIServiceStatus[]>([]);
  const [summary, setSummary] = useState<AIServiceSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const checkAllServices = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/ai/services/status');
      const data: AIServiceResponse = await response.json();

      if (data.success) {
        setServices(data.services || []);
        setSummary(data.summary || null);
        setLastChecked(data.lastChecked ? new Date(data.lastChecked) : new Date());
      } else {
        setError(data.error || '서비스 상태 확인 실패');
      }
    } catch (error) {
      setError('서비스 상태 확인 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const checkIndividualService = async (serviceName: string) => {
    try {
      const response = await fetch('/api/ai/services/status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ serviceName }),
      });

      const data = await response.json();

      if (data.success) {
        // 해당 서비스 상태 업데이트
        setServices((prev) =>
          prev.map((service) => (service.name === serviceName ? data.service : service)),
        );
      }
    } catch (error) {
      console.error('개별 서비스 확인 오류:', error);
    }
  };

  // 컴포넌트 마운트 시 자동 확인
  useEffect(() => {
    checkAllServices();
  }, []);

  const getServiceIcon = (serviceName: string) => {
    if (serviceName.includes('Problem Sync')) return Server;
    if (serviceName.includes('Educational AI')) return Brain;
    if (serviceName.includes('Teacher Report')) return FileText;
    return Activity;
  };

  const getHealthColor = (isHealthy: boolean) => {
    return isHealthy ? 'text-green-600' : 'text-red-600';
  };

  const getHealthBadge = (isHealthy: boolean) => {
    return isHealthy ? (
      <Badge variant="default" className="bg-green-100 text-green-800">
        <CheckCircle className="mr-1 h-3 w-3" />
        정상
      </Badge>
    ) : (
      <Badge variant="destructive">
        <AlertCircle className="mr-1 h-3 w-3" />
        오류
      </Badge>
    );
  };

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              AI 서비스 모니터링
            </CardTitle>
            <CardDescription>모든 AI 서비스의 상태를 실시간으로 모니터링합니다.</CardDescription>
          </div>
          <Button onClick={checkAllServices} disabled={isLoading} variant="outline" size="sm">
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            전체 새로고침
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* 전체 상태 요약 */}
        {summary && (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="rounded-lg bg-gray-50 p-4">
              <div className="text-2xl font-bold text-gray-900">{summary.total}</div>
              <div className="text-sm text-gray-600">전체 서비스</div>
            </div>
            <div className="rounded-lg bg-green-50 p-4">
              <div className="text-2xl font-bold text-green-600">{summary.healthy}</div>
              <div className="text-sm text-green-600">정상 서비스</div>
            </div>
            <div className="rounded-lg bg-red-50 p-4">
              <div className="text-2xl font-bold text-red-600">{summary.unhealthy}</div>
              <div className="text-sm text-red-600">오류 서비스</div>
            </div>
            <div className="rounded-lg bg-blue-50 p-4">
              <div className="text-2xl font-bold text-blue-600">
                {Math.round(summary.overallHealth * 100)}%
              </div>
              <div className="text-sm text-blue-600">전체 상태</div>
            </div>
          </div>
        )}

        {/* 서비스 목록 */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">서비스 목록</h3>
          {services.map((service) => {
            const IconComponent = getServiceIcon(service.name);
            return (
              <div
                key={service.name}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`rounded-full p-2 ${service.isHealthy ? 'bg-green-100' : 'bg-red-100'}`}
                  >
                    <IconComponent className={`h-5 w-5 ${getHealthColor(service.isHealthy)}`} />
                  </div>
                  <div>
                    <div className="font-medium">{service.name}</div>
                    <div className="text-sm text-gray-600">{service.url}</div>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {service.features.map((feature, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {getHealthBadge(service.isHealthy)}
                  <Button
                    onClick={() => checkIndividualService(service.name)}
                    variant="ghost"
                    size="sm"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {/* 마지막 확인 시간 */}
        {lastChecked && (
          <div className="text-sm text-gray-500">마지막 확인: {lastChecked.toLocaleString()}</div>
        )}

        {/* 오류 메시지 */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
