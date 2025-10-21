'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, CheckCircle, Download, Loader2, RefreshCw } from 'lucide-react';
import { useState } from 'react';

interface SyncResult {
  success: boolean;
  synced: number;
  updated: number;
  skipped: number;
  errors: string[];
  batchId?: string;
}

interface AIServerStatus {
  isHealthy: boolean;
  aiProblemCount: number;
  lastChecked: string;
}

export function AIProblemSyncCard() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<SyncResult | null>(null);
  const [status, setStatus] = useState<AIServerStatus | null>(null);
  const [error, setError] = useState<string>('');

  const [syncParams, setSyncParams] = useState({
    subject: '',
    difficulty: '',
    type: '',
    limit: 50,
  });

  const checkStatus = async () => {
    try {
      const response = await fetch('/api/ai/problems/sync');
      const data = await response.json();

      if (data.success) {
        setStatus(data.status);
      } else {
        setError(data.error || '상태 확인 실패');
      }
    } catch (error) {
      setError('상태 확인 중 오류가 발생했습니다.');
    }
  };

  const syncProblems = async () => {
    setIsLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/ai/problems/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(syncParams),
      });

      const data = await response.json();

      if (data.success) {
        setResult(data);
        // 상태 새로고침
        await checkStatus();
      } else {
        setError(data.error || '동기화 실패');
      }
    } catch (error) {
      setError('동기화 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const syncBySubject = async () => {
    if (!syncParams.subject.trim()) {
      setError('주제를 입력해주세요.');
      return;
    }

    setIsLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/ai/problems/sync', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subject: syncParams.subject,
          limit: syncParams.limit,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setResult(data);
        await checkStatus();
      } else {
        setError(data.error || '주제별 동기화 실패');
      }
    } catch (error) {
      setError('주제별 동기화 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5" />
          AI 서버 문제 동기화
        </CardTitle>
        <CardDescription>
          AI 서버에서 생성된 문제들을 로컬 데이터베이스로 동기화합니다.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* AI 서버 상태 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>AI 서버 상태</Label>
            <Button variant="outline" size="sm" onClick={checkStatus}>
              <CheckCircle className="mr-2 h-4 w-4" />
              상태 확인
            </Button>
          </div>

          {status && (
            <div className="flex items-center gap-2 rounded-lg bg-gray-50 p-3">
              {status.isHealthy ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-600" />
              )}
              <span className="text-sm">
                {status.isHealthy ? '정상' : '오류'} | AI 문제 수: {status.aiProblemCount}개 |
                마지막 확인: {new Date(status.lastChecked).toLocaleString()}
              </span>
            </div>
          )}
        </div>

        {/* 동기화 설정 */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="subject">주제</Label>
            <Input
              id="subject"
              placeholder="예: 수학, 과학"
              value={syncParams.subject}
              onChange={(e) => setSyncParams((prev) => ({ ...prev, subject: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="difficulty">난이도</Label>
            <select
              id="difficulty"
              className="w-full rounded-md border p-2"
              value={syncParams.difficulty}
              onChange={(e) => setSyncParams((prev) => ({ ...prev, difficulty: e.target.value }))}
            >
              <option value="">전체</option>
              <option value="EASY">쉬움</option>
              <option value="MEDIUM">보통</option>
              <option value="HARD">어려움</option>
              <option value="EXPERT">매우 어려움</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">유형</Label>
            <select
              id="type"
              className="w-full rounded-md border p-2"
              value={syncParams.type}
              onChange={(e) => setSyncParams((prev) => ({ ...prev, type: e.target.value }))}
            >
              <option value="">전체</option>
              <option value="MULTIPLE_CHOICE">객관식</option>
              <option value="SHORT_ANSWER">단답형</option>
              <option value="ESSAY">서술형</option>
              <option value="CODING">코딩</option>
              <option value="MATH">수학</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="limit">가져올 개수</Label>
            <Input
              id="limit"
              type="number"
              min="1"
              max="1000"
              value={syncParams.limit}
              onChange={(e) =>
                setSyncParams((prev) => ({ ...prev, limit: parseInt(e.target.value) || 50 }))
              }
            />
          </div>
        </div>

        {/* 동기화 버튼들 */}
        <div className="flex gap-3">
          <Button onClick={syncProblems} disabled={isLoading} className="flex-1">
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            전체 동기화
          </Button>

          <Button
            onClick={syncBySubject}
            disabled={isLoading || !syncParams.subject.trim()}
            variant="outline"
            className="flex-1"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            주제별 동기화
          </Button>
        </div>

        {/* 오류 메시지 */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* 동기화 결과 */}
        {result && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-1">
                <div>동기화 완료!</div>
                <div className="text-sm text-gray-600">
                  새로 추가: {result.synced}개 | 업데이트: {result.updated}개 | 건너뜀:{' '}
                  {result.skipped}개
                </div>
                {result.errors.length > 0 && (
                  <div className="text-sm text-red-600">오류: {result.errors.length}개</div>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
