"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  Users,
  BookOpen,
  Clock,
  Download,
  Calendar,
  Target,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import { useReports } from "@/hooks/use-api";
import { Report } from "@/lib/api-services";

// 하드코딩된 데이터는 이제 API에서 가져옵니다

const typeLabels = {
  MONTHLY: "월간 리포트",
  INDIVIDUAL: "개별 리포트",
  SUBJECT: "과목별 리포트",
  WEEKLY: "주간 리포트",
};

const statusColors = {
  COMPLETED: "bg-green-100 text-green-800",
  IN_PROGRESS: "bg-yellow-100 text-yellow-800",
  PENDING: "bg-gray-100 text-gray-800",
};

const statusLabels = {
  COMPLETED: "완료",
  IN_PROGRESS: "진행 중",
  PENDING: "대기 중",
};

export default function ReportsPage() {
  const [selectedType, setSelectedType] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  // TanStack Query 훅 사용
  const {
    reports: reportsQuery,
    stats: statsQuery,
    download: downloadMutation,
  } = useReports({
    type: selectedType !== "all" ? selectedType : undefined,
    status: selectedStatus !== "all" ? selectedStatus : undefined,
  });

  const reports = reportsQuery.data?.reports || [];
  const stats = statsQuery.data;

  const handleDownload = (reportId: string) => {
    downloadMutation.mutate(reportId as string);
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">분석 리포트</h1>
          <p className="text-gray-600 mt-2">
            AI가 분석한 학습 데이터를 통해 학생들의 성과를 파악하고 개선 방안을 제시합니다.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            리포트 다운로드
          </Button>
          <Button>
            <TrendingUp className="w-4 h-4 mr-2" />새 리포트 생성
          </Button>
        </div>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 리포트</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsQuery.isLoading ? "..." : stats?.totalReports || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats?.weeklyChange ? `+${stats.weeklyChange} 이번 주` : "로딩 중..."}
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
              {statsQuery.isLoading ? "..." : stats?.completedReports || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats?.completionRate ? `${stats.completionRate}% 완료율` : "로딩 중..."}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">평균 분석 시간</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsQuery.isLoading ? "..." : `${stats?.averageAnalysisTime || 0}분`}
            </div>
            <p className="text-xs text-muted-foreground">AI 분석 속도</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">개선 제안</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsQuery.isLoading ? "..." : stats?.totalRecommendations || 0}
            </div>
            <p className="text-xs text-muted-foreground">총 제안 수</p>
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
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
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
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
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
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
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
            <Card key={report.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
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
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* 기본 통계 */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-gray-50 rounded">
                    <div className="text-lg font-semibold text-gray-900">{report.students}</div>
                    <div className="text-sm text-gray-600">분석 학생 수</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded">
                    <div className="text-lg font-semibold text-gray-900">
                      {report.totalProblems}
                    </div>
                    <div className="text-sm text-gray-600">총 문제 수</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded">
                    <div className="text-lg font-semibold text-gray-900">
                      {report.averageScore}점
                    </div>
                    <div className="text-sm text-gray-600">평균 점수</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded">
                    <div className="text-lg font-semibold text-gray-900">
                      {report.completionRate}%
                    </div>
                    <div className="text-sm text-gray-600">완료율</div>
                  </div>
                </div>

                {/* 인사이트 */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-blue-600" />
                    주요 인사이트
                  </h4>
                  <div className="space-y-2">
                    {report.insights.map((insight: string, index: number) => (
                      <div key={index} className="flex items-start gap-2 p-2 bg-blue-50 rounded">
                        <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{insight}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 개선 제안 */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Target className="w-4 h-4 text-green-600" />
                    개선 제안
                  </h4>
                  <div className="space-y-2">
                    {report.recommendations.map((recommendation: string, index: number) => (
                      <div key={index} className="flex items-start gap-2 p-2 bg-green-50 rounded">
                        <AlertTriangle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{recommendation}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 액션 버튼 */}
                <div className="flex gap-2 pt-4 border-t">
                  <Button variant="outline" size="sm">
                    <Calendar className="w-4 h-4 mr-1" />
                    상세 보기
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload(report.id)}
                    disabled={downloadMutation.isPending}
                  >
                    <Download className="w-4 h-4 mr-1" />
                    {downloadMutation.isPending ? "다운로드 중..." : "PDF 다운로드"}
                  </Button>
                  <Button variant="outline" size="sm">
                    <Users className="w-4 h-4 mr-1" />
                    학생 공유
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
            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">리포트를 찾을 수 없습니다</h3>
            <p className="text-gray-600 mb-4">필터 조건에 맞는 리포트가 없습니다.</p>
            <Button>
              <TrendingUp className="w-4 h-4 mr-2" />새 리포트 생성하기
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
