'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { AlertCircle, CheckCircle, Database, RefreshCw, XCircle } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

interface VectorStats {
  healthy: boolean;
  stats: {
    problems: number;
    learningMaterials: number;
    total: number;
  };
  collections: Array<{
    name: string;
    metadata: any;
    count: number;
  }>;
}

interface SyncStatus {
  database: {
    problems: number;
    learningMaterials: number;
    total: number;
  };
  vectors: {
    problems: number;
    learningMaterials: number;
    total: number;
  };
  syncStatus: {
    problemsSynced: number;
    materialsSynced: number;
    totalSynced: number;
    problemsPending: number;
    materialsPending: number;
  };
}

export function VectorDatabaseMonitor() {
  const [vectorStats, setVectorStats] = useState<VectorStats | null>(null);
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();

  const fetchVectorStats = useCallback(async () => {
    try {
      const response = await fetch('/api/vector/search');
      if (response.ok) {
        const data = await response.json();
        setVectorStats(data.data);
      }
    } catch (error) {
      console.error('벡터 상태 조회 오류:', error);
    }
  }, []);

  const fetchSyncStatus = useCallback(async () => {
    try {
      const response = await fetch('/api/vector/sync');
      if (response.ok) {
        const data = await response.json();
        setSyncStatus(data.data);
      }
    } catch (error) {
      console.error('동기화 상태 조회 오류:', error);
    }
  }, []);

  const refreshData = useCallback(async () => {
    setIsRefreshing(true);
    await Promise.all([fetchVectorStats(), fetchSyncStatus()]);
    setIsRefreshing(false);
  }, [fetchVectorStats, fetchSyncStatus]);

  const syncAllData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/vector/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'all',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        toast({
          title: '동기화 완료',
          description: data.message,
        });
        await refreshData();
      } else {
        throw new Error('동기화 요청이 실패했습니다.');
      }
    } catch (error) {
      console.error('벡터 동기화 오류:', error);
      toast({
        title: '동기화 실패',
        description: '벡터 동기화 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const getHealthIcon = (healthy: boolean) => {
    return healthy ? (
      <CheckCircle className="h-5 w-5 text-green-500" />
    ) : (
      <XCircle className="h-5 w-5 text-red-500" />
    );
  };

  const getHealthStatus = (healthy: boolean) => {
    return healthy ? (
      <Badge className="bg-green-100 text-green-800">정상</Badge>
    ) : (
      <Badge variant="destructive">오류</Badge>
    );
  };

  const calculateSyncProgress = () => {
    if (!syncStatus) return 0;
    const { database, vectors } = syncStatus;
    const total = database.total;
    const synced = vectors.total;
    return total > 0 ? (synced / total) * 100 : 0;
  };

  return (
    <div className="space-y-6 p-6">
      {/* 벡터 데이터베이스 상태 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            벡터 데이터베이스 상태
          </CardTitle>
          <CardDescription>ChromaDB 연결 상태 및 컬렉션 정보를 확인합니다.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {vectorStats ? (
            <>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getHealthIcon(vectorStats.healthy)}
                  <span className="font-medium">연결 상태</span>
                </div>
                {getHealthStatus(vectorStats.healthy)}
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {vectorStats.stats.problems}
                  </div>
                  <div className="text-sm text-muted-foreground">문제 벡터</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {vectorStats.stats.learningMaterials}
                  </div>
                  <div className="text-sm text-muted-foreground">학습자료 벡터</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {vectorStats.stats.total}
                  </div>
                  <div className="text-sm text-muted-foreground">총 벡터</div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">컬렉션 정보</h4>
                <div className="space-y-1">
                  {vectorStats.collections.map((collection) => (
                    <div
                      key={collection.name}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="font-mono">{collection.name}</span>
                      <Badge variant="outline">{collection.count}개</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="py-4 text-center">
              <AlertCircle className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
              <p className="text-muted-foreground">벡터 데이터베이스 상태를 불러오는 중...</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 동기화 상태 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5" />
              데이터 동기화 상태
            </div>
            <Button variant="outline" size="sm" onClick={refreshData} disabled={isRefreshing}>
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
          </CardTitle>
          <CardDescription>
            관계형 데이터베이스와 벡터 데이터베이스 간의 동기화 상태를 확인합니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {syncStatus ? (
            <>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>전체 동기화 진행률</span>
                  <span>{calculateSyncProgress().toFixed(1)}%</span>
                </div>
                <Progress value={calculateSyncProgress()} className="h-2" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">데이터베이스</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>문제:</span>
                      <span className="font-mono">{syncStatus.database.problems}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>학습자료:</span>
                      <span className="font-mono">{syncStatus.database.learningMaterials}</span>
                    </div>
                    <div className="flex justify-between font-medium">
                      <span>총계:</span>
                      <span className="font-mono">{syncStatus.database.total}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-medium">벡터 저장소</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>문제:</span>
                      <span className="font-mono">{syncStatus.vectors.problems}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>학습자료:</span>
                      <span className="font-mono">{syncStatus.vectors.learningMaterials}</span>
                    </div>
                    <div className="flex justify-between font-medium">
                      <span>총계:</span>
                      <span className="font-mono">{syncStatus.vectors.total}</span>
                    </div>
                  </div>
                </div>
              </div>

              {syncStatus.syncStatus.problemsPending > 0 ||
              syncStatus.syncStatus.materialsPending > 0 ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-orange-600">
                    <AlertCircle className="h-4 w-4" />
                    <span>동기화 대기 중인 항목이 있습니다</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    문제 {syncStatus.syncStatus.problemsPending}개, 학습자료{' '}
                    {syncStatus.syncStatus.materialsPending}개가 벡터로 변환되지 않았습니다.
                  </div>
                  <Button onClick={syncAllData} disabled={isLoading} className="w-full">
                    {isLoading ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        동기화 중...
                      </>
                    ) : (
                      '전체 동기화 실행'
                    )}
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <span>모든 데이터가 동기화되었습니다</span>
                </div>
              )}
            </>
          ) : (
            <div className="py-4 text-center">
              <AlertCircle className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
              <p className="text-muted-foreground">동기화 상태를 불러오는 중...</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
