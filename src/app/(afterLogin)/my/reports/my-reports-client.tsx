'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useReports } from '@/hooks/reports';
import { Report } from '@/types/domain/report';
import {
  AlertTriangle,
  BookOpen,
  Calendar,
  CheckCircle,
  Download,
  Target,
  TrendingUp,
  User,
} from 'lucide-react';
import { Session } from 'next-auth';
import { useState } from 'react';

const typeLabels = {
  MONTHLY: '월간 리포트',
  INDIVIDUAL: '개별 리포트',
  SUBJECT: '과목별 리포트',
  WEEKLY: '주간 리포트',
};

const statusColors = {
  COMPLETED: 'bg-green-100 text-green-800',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
  PENDING: 'bg-gray-100 text-gray-800',
};

const statusLabels = {
  COMPLETED: '완료',
  IN_PROGRESS: '진행 중',
  PENDING: '대기 중',
};

interface MyReportsClientProps {
  session: Session;
}

export function MyReportsClient({ session }: MyReportsClientProps) {
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // 학생의 경우 자신의 리포트만 필터링
  const {
    reports: reportsQuery,
    stats: statsQuery,
    download: downloadMutation,
  } = useReports({
    type: selectedType !== 'all' ? selectedType : undefined,
    status: selectedStatus !== 'all' ? selectedStatus : undefined,
    // 학생인 경우 자신의 ID로 필터링
    studentId: session?.user?.role === 'STUDENT' ? session.user.id : undefined,
  });

  const reports = reportsQuery.data?.reports || [];
  const stats = statsQuery.data;

  const handleDownload = (reportId: string) => {
    downloadMutation.mutate(reportId as string);
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">내 학습 리포트</h1>
          <p className="mt-2 text-gray-600">
            나의 학습 성과를 분석한 개인화된 리포트를 확인하세요.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            전체 다운로드
          </Button>
        </div>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 리포트</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsQuery.isLoading ? '...' : stats?.totalReports || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats?.weeklyChange ? `+${stats.weeklyChange} 이번 주` : '로딩 중...'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">완료된 리포트</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsQuery.isLoading ? '...' : stats?.completedReports || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats?.completionRate ? `${stats.completionRate}% 완료율` : '로딩 중...'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">평균 점수</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsQuery.isLoading ? '...' : `${stats?.averageScore || 0}점`}
            </div>
            <p className="text-xs text-muted-foreground">전체 평균</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">완료율</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsQuery.isLoading ? '...' : `${stats?.completionRate || 0}%`}
            </div>
            <p className="text-xs text-muted-foreground">학습 완료율</p>
          </CardContent>
        </Card>
      </div>

      {/* 필터 */}
      <Card>
        <CardHeader>
          <CardTitle>리포트 필터</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="all">모든 유형</option>
              <option value="MONTHLY">월간 리포트</option>
              <option value="INDIVIDUAL">개별 리포트</option>
              <option value="SUBJECT">과목별 리포트</option>
              <option value="WEEKLY">주간 리포트</option>
            </select>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="all">모든 상태</option>
              <option value="COMPLETED">완료</option>
              <option value="IN_PROGRESS">진행 중</option>
              <option value="PENDING">대기 중</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* 리포트 목록 */}
      <div className="space-y-6">
        {reportsQuery.isLoading ? (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
              <p className="text-gray-600">리포트 목록을 불러오는 중...</p>
            </CardContent>
          </Card>
        ) : reportsQuery.error ? (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-red-600">리포트 목록을 불러오는데 실패했습니다.</p>
            </CardContent>
          </Card>
        ) : (
          reports.map((report: Report) => (
            <Card key={report.id} className="transition-shadow hover:shadow-md">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl">{report.title}</CardTitle>
                    <CardDescription className="mt-1">
                      {typeLabels[report.type as keyof typeof typeLabels]} • {report.period}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={statusColors[report.status as keyof typeof statusColors]}>
                      {statusLabels[report.status as keyof typeof statusLabels]}
                    </Badge>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* 기본 통계 */}
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  <div className="rounded bg-gray-50 p-3 text-center">
                    <div className="text-lg font-semibold text-gray-900">{report.students}</div>
                    <div className="text-sm text-gray-600">분석 대상</div>
                  </div>
                  <div className="rounded bg-gray-50 p-3 text-center">
                    <div className="text-lg font-semibold text-gray-900">
                      {report.totalProblems}
                    </div>
                    <div className="text-sm text-gray-600">총 문제 수</div>
                  </div>
                  <div className="rounded bg-gray-50 p-3 text-center">
                    <div className="text-lg font-semibold text-gray-900">
                      {report.averageScore}점
                    </div>
                    <div className="text-sm text-gray-600">평균 점수</div>
                  </div>
                  <div className="rounded bg-gray-50 p-3 text-center">
                    <div className="text-lg font-semibold text-gray-900">
                      {report.completionRate}%
                    </div>
                    <div className="text-sm text-gray-600">완료율</div>
                  </div>
                </div>

                {/* 인사이트 */}
                <div>
                  <h4 className="mb-3 flex items-center gap-2 font-semibold text-gray-900">
                    <TrendingUp className="h-4 w-4 text-blue-600" />
                    주요 인사이트
                  </h4>
                  <div className="space-y-2">
                    {report.insights?.map((insight: string, index: number) => (
                      <div key={index} className="flex items-start gap-2 rounded bg-blue-50 p-2">
                        <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600" />
                        <span className="text-sm text-gray-700">{insight}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 개선 제안 */}
                <div>
                  <h4 className="mb-3 flex items-center gap-2 font-semibold text-gray-900">
                    <Target className="h-4 w-4 text-green-600" />
                    개선 제안
                  </h4>
                  <div className="space-y-2">
                    {report.recommendations?.map((recommendation: string, index: number) => (
                      <div key={index} className="flex items-start gap-2 rounded bg-green-50 p-2">
                        <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
                        <span className="text-sm text-gray-700">{recommendation}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 액션 버튼 */}
                <div className="flex gap-2 border-t pt-4">
                  <Button variant="outline" size="sm">
                    <Calendar className="mr-1 h-4 w-4" />
                    상세 보기
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload(report.id)}
                    disabled={downloadMutation.isPending}
                  >
                    <Download className="mr-1 h-4 w-4" />
                    {downloadMutation.isPending ? '다운로드 중...' : 'PDF 다운로드'}
                  </Button>
                  <Button variant="outline" size="sm">
                    <User className="mr-1 h-4 w-4" />
                    선생님과 공유
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {!reportsQuery.isLoading && !reportsQuery.error && reports.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <BookOpen className="mx-auto mb-4 h-12 w-12 text-gray-400" />
            <h3 className="mb-2 text-lg font-semibold text-gray-900">리포트가 없습니다</h3>
            <p className="mb-4 text-gray-600">
              아직 생성된 리포트가 없습니다. 학습을 진행하면 리포트가 생성됩니다.
            </p>
            <Button>
              <BookOpen className="mr-2 h-4 w-4" />
              학습 시작하기
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
