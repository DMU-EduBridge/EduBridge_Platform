'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Report } from '@/types/domain/report';
import {
  AlertTriangle,
  BookOpen,
  Calendar,
  CheckCircle,
  Clock,
  Target,
  TrendingUp,
  Users,
} from 'lucide-react';

interface ReportDetailProps {
  report: Report;
}

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

const typeLabels = {
  MONTHLY: '월간 리포트',
  INDIVIDUAL: '개별 리포트',
  SUBJECT: '과목별 리포트',
  WEEKLY: '주간 리포트',
};

export function ReportDetail({ report }: ReportDetailProps) {
  return (
    <div className="space-y-6">
      {/* 리포트 기본 정보 */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">{report.title}</CardTitle>
              <CardDescription className="mt-2 flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <BookOpen className="h-4 w-4" />
                  {typeLabels[report.type as keyof typeof typeLabels]}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {report.period}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {new Date(report.createdAt).toLocaleDateString()}
                </span>
              </CardDescription>
            </div>
            <Badge className={statusColors[report.status as keyof typeof statusColors]}>
              {statusLabels[report.status as keyof typeof statusLabels]}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="prose max-w-none">
            <p className="leading-relaxed text-gray-700">{report.content}</p>
          </div>
        </CardContent>
      </Card>

      {/* 통계 정보 */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">분석 학생 수</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{report.students}</div>
            <p className="text-xs text-muted-foreground">총 분석 대상</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 문제 수</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{report.totalProblems}</div>
            <p className="text-xs text-muted-foreground">분석된 문제</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">평균 점수</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{report.averageScore}점</div>
            <p className="text-xs text-muted-foreground">전체 평균</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">완료율</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{report.completionRate}%</div>
            <Progress value={report.completionRate} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* 주요 인사이트 */}
      {report.insights && report.insights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              주요 인사이트
            </CardTitle>
            <CardDescription>AI가 분석한 학습 데이터의 핵심 인사이트입니다.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {report.insights.map((insight, index) => (
                <div key={index} className="flex items-start gap-3 rounded-lg bg-blue-50 p-4">
                  <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{insight}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 강점 분석 */}
      {report.strengths && report.strengths.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              강점 분석
            </CardTitle>
            <CardDescription>학생들이 잘하고 있는 영역들을 분석한 결과입니다.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {report.strengths.map((strength, index) => (
                <div key={index} className="flex items-start gap-3 rounded-lg bg-green-50 p-4">
                  <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{strength}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 약점 분석 */}
      {report.weaknesses && report.weaknesses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              개선이 필요한 영역
            </CardTitle>
            <CardDescription>학생들이 더 노력해야 할 영역들을 분석한 결과입니다.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {report.weaknesses.map((weakness, index) => (
                <div key={index} className="flex items-start gap-3 rounded-lg bg-orange-50 p-4">
                  <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-orange-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{weakness}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 개선 제안 */}
      {report.recommendations && report.recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-purple-600" />
              개선 제안
            </CardTitle>
            <CardDescription>AI가 제안하는 구체적인 개선 방안들입니다.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {report.recommendations.map((recommendation, index) => (
                <div key={index} className="flex items-start gap-3 rounded-lg bg-purple-50 p-4">
                  <Target className="mt-0.5 h-5 w-5 flex-shrink-0 text-purple-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{recommendation}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 리포트 메타데이터 */}
      <Card>
        <CardHeader>
          <CardTitle>리포트 정보</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-600">생성일</span>
                <span className="text-sm text-gray-900">
                  {new Date(report.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-600">수정일</span>
                <span className="text-sm text-gray-900">
                  {new Date(report.updatedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-600">리포트 유형</span>
                <span className="text-sm text-gray-900">
                  {typeLabels[report.type as keyof typeof typeLabels]}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-600">상태</span>
                <Badge className={statusColors[report.status as keyof typeof statusColors]}>
                  {statusLabels[report.status as keyof typeof statusLabels]}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
