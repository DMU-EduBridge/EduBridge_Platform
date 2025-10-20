'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTeacherReportDetail } from '@/hooks/teacher-reports/use-teacher-report-detail';
import { useTeacherReportMutations } from '@/hooks/teacher-reports/use-teacher-report-mutations';
import { ArrowLeft, Download, FileText, Play, RefreshCw } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function TeacherReportDetailPage() {
  const params = useParams();
  const router = useRouter();
  const reportId = params.reportId as string;

  const { data: reportResponse, isLoading, error } = useTeacherReportDetail(reportId);
  const { generateReport } = useTeacherReportMutations();

  const report = reportResponse?.data;

  const handleGenerateReport = async () => {
    try {
      await generateReport.mutateAsync({
        reportId,
        options: {
          includeCharts: true,
          includeRecommendations: true,
          analysisDepth: 'DETAILED',
          focusAreas: [],
        },
      });
      toast.success('리포트 생성이 시작되었습니다');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '리포트 생성에 실패했습니다');
    }
  };

  const handleDownloadReport = () => {
    if (!report) return;

    const content = `# ${report.title}\n\n${report.content}`;
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${report.title}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            돌아가기
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">리포트 상세</h1>
            <p className="mt-2 text-gray-600">리포트를 불러오는 중...</p>
          </div>
        </div>
        <Card>
          <CardContent className="p-12 text-center">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
            <p className="text-gray-600">리포트를 불러오는 중...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            돌아가기
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">리포트 상세</h1>
            <p className="mt-2 text-gray-600">리포트를 불러올 수 없습니다</p>
          </div>
        </div>
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-red-600">리포트를 불러오는데 실패했습니다.</p>
            <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
              다시 시도
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="space-y-8 p-6">
        {/* 헤더 */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 p-8 text-white shadow-2xl">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Button
                variant="outline"
                onClick={() => router.back()}
                className="border-white/30 bg-white/20 text-white backdrop-blur-sm hover:bg-white/30"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                돌아가기
              </Button>
              <div>
                <h1 className="text-4xl font-bold tracking-tight">{report.title}</h1>
                <p className="mt-2 text-xl text-blue-100">
                  {report.class && `${report.class.name} • `}
                  생성일: {new Date(report.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              {report.status === 'DRAFT' && (
                <Button
                  onClick={handleGenerateReport}
                  disabled={generateReport.isPending}
                  className="border-white/30 bg-white/20 text-white backdrop-blur-sm hover:bg-white/30"
                >
                  {generateReport.isPending ? (
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Play className="mr-2 h-4 w-4" />
                  )}
                  리포트 생성
                </Button>
              )}
              {report.status === 'COMPLETED' && (
                <Button
                  variant="outline"
                  onClick={handleDownloadReport}
                  className="border-white/30 bg-white/20 text-white backdrop-blur-sm hover:bg-white/30"
                >
                  <Download className="mr-2 h-4 w-4" />
                  다운로드
                </Button>
              )}
            </div>
          </div>
          <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/10"></div>
          <div className="absolute -bottom-6 -left-6 h-32 w-32 rounded-full bg-white/5"></div>
        </div>

        {/* 리포트 상태 */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100">
            <CardTitle className="text-xl font-bold text-gray-900">리포트 정보</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 p-4">
                <div className="text-sm font-medium text-blue-600">상태</div>
                <div
                  className={`text-2xl font-bold ${
                    report.status === 'COMPLETED'
                      ? 'text-green-600'
                      : report.status === 'GENERATING'
                        ? 'text-blue-600'
                        : report.status === 'FAILED'
                          ? 'text-red-600'
                          : 'text-gray-600'
                  }`}
                >
                  {report.status === 'COMPLETED'
                    ? '완료'
                    : report.status === 'GENERATING'
                      ? '생성 중'
                      : report.status === 'FAILED'
                        ? '실패'
                        : '초안'}
                </div>
              </div>
              {report.generationTimeMs && (
                <div className="rounded-lg bg-gradient-to-br from-green-50 to-green-100 p-4">
                  <div className="text-sm font-medium text-green-600">생성 시간</div>
                  <div className="text-2xl font-bold text-green-700">
                    {Math.round(report.generationTimeMs / 1000)}초
                  </div>
                </div>
              )}
              {report.tokenUsage && (
                <div className="rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 p-4">
                  <div className="text-sm font-medium text-purple-600">토큰 사용량</div>
                  <div className="text-2xl font-bold text-purple-700">
                    {report.tokenUsage.toLocaleString()}
                  </div>
                </div>
              )}
              {report.costUsd && (
                <div className="rounded-lg bg-gradient-to-br from-orange-50 to-orange-100 p-4">
                  <div className="text-sm font-medium text-orange-600">생성 비용</div>
                  <div className="text-2xl font-bold text-orange-700">
                    ${report.costUsd.toFixed(4)}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 리포트 내용 */}
        {report.content ? (
          <Card className="border-0 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
              <CardTitle className="text-xl font-bold text-gray-900">리포트 내용</CardTitle>
              <CardDescription className="text-gray-600">
                AI가 생성한 학습 분석 리포트입니다
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="prose max-w-none">
                <div className="whitespace-pre-wrap rounded-lg border bg-gray-50 p-6 text-sm leading-relaxed text-gray-700">
                  {report.content}
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-0 shadow-lg">
            <CardContent className="p-12 text-center">
              <div className="mx-auto mb-6 h-16 w-16 rounded-full bg-gray-100 p-4">
                <FileText className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="mb-2 text-2xl font-semibold text-gray-900">리포트 내용이 없습니다</h3>
              <p className="mb-6 text-lg text-gray-600">리포트를 생성하여 내용을 확인하세요.</p>
              <Button
                onClick={handleGenerateReport}
                disabled={generateReport.isPending}
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700"
              >
                {generateReport.isPending ? (
                  <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  <Play className="mr-2 h-5 w-5" />
                )}
                리포트 생성
              </Button>
            </CardContent>
          </Card>
        )}

        {/* 분석 데이터 */}
        {report.analysisData && (
          <Card className="border-0 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
              <CardTitle className="text-xl font-bold text-gray-900">분석 데이터</CardTitle>
              <CardDescription className="text-gray-600">
                상세한 분석 결과와 인사이트입니다
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                {report.analysisData.summary && (
                  <div className="rounded-lg bg-blue-50 p-4">
                    <h4 className="mb-2 font-semibold text-blue-900">요약</h4>
                    <p className="text-blue-800">{report.analysisData.summary}</p>
                  </div>
                )}

                {report.analysisData.insights && report.analysisData.insights.length > 0 && (
                  <div className="rounded-lg bg-green-50 p-4">
                    <h4 className="mb-3 font-semibold text-green-900">주요 인사이트</h4>
                    <ul className="space-y-2">
                      {report.analysisData.insights.map((insight: string, index: number) => (
                        <li key={index} className="flex items-start gap-2 text-green-800">
                          <div className="mt-1 h-2 w-2 rounded-full bg-green-500"></div>
                          {insight}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {report.analysisData.recommendations &&
                  report.analysisData.recommendations.length > 0 && (
                    <div className="rounded-lg bg-purple-50 p-4">
                      <h4 className="mb-3 font-semibold text-purple-900">권장사항</h4>
                      <ul className="space-y-2">
                        {report.analysisData.recommendations.map(
                          (recommendation: string, index: number) => (
                            <li key={index} className="flex items-start gap-2 text-purple-800">
                              <div className="mt-1 h-2 w-2 rounded-full bg-purple-500"></div>
                              {recommendation}
                            </li>
                          ),
                        )}
                      </ul>
                    </div>
                  )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
