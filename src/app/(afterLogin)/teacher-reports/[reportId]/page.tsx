'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTeacherReportDetail } from '@/hooks/teacher-reports/use-teacher-report-detail';
import { useTeacherReportMutations } from '@/hooks/teacher-reports/use-teacher-report-mutations';
import { ArrowLeft, Download, Play, RefreshCw } from 'lucide-react';
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
    <div className="space-y-6 p-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            돌아가기
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{report.title}</h1>
            <p className="mt-2 text-gray-600">
              {report.class && `${report.class.name} • `}
              생성일: {new Date(report.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {report.status === 'DRAFT' && (
            <Button onClick={handleGenerateReport} disabled={generateReport.isPending}>
              {generateReport.isPending ? (
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Play className="mr-2 h-4 w-4" />
              )}
              리포트 생성
            </Button>
          )}
          {report.status === 'COMPLETED' && (
            <Button variant="outline" onClick={handleDownloadReport}>
              <Download className="mr-2 h-4 w-4" />
              다운로드
            </Button>
          )}
        </div>
      </div>

      {/* 리포트 상태 */}
      <Card>
        <CardHeader>
          <CardTitle>리포트 정보</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div>
              <div className="text-sm font-medium text-gray-600">상태</div>
              <div
                className={`text-lg font-bold ${
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
              <div>
                <div className="text-sm font-medium text-gray-600">생성 시간</div>
                <div className="text-lg font-bold">
                  {Math.round(report.generationTimeMs / 1000)}초
                </div>
              </div>
            )}
            {report.tokenUsage && (
              <div>
                <div className="text-sm font-medium text-gray-600">토큰 사용량</div>
                <div className="text-lg font-bold">{report.tokenUsage.toLocaleString()}</div>
              </div>
            )}
            {report.costUsd && (
              <div>
                <div className="text-sm font-medium text-gray-600">생성 비용</div>
                <div className="text-lg font-bold">${report.costUsd.toFixed(4)}</div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 리포트 내용 */}
      {report.content ? (
        <Card>
          <CardHeader>
            <CardTitle>리포트 내용</CardTitle>
            <CardDescription>AI가 생성한 학습 분석 리포트입니다</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none">
              <div className="whitespace-pre-wrap text-sm leading-relaxed">{report.content}</div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="mx-auto mb-4 h-12 w-12 text-gray-400" />
            <h3 className="mb-2 text-lg font-semibold text-gray-900">리포트 내용이 없습니다</h3>
            <p className="mb-4 text-gray-600">리포트를 생성하여 내용을 확인하세요.</p>
            <Button onClick={handleGenerateReport} disabled={generateReport.isPending}>
              {generateReport.isPending ? (
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Play className="mr-2 h-4 w-4" />
              )}
              리포트 생성
            </Button>
          </CardContent>
        </Card>
      )}

      {/* 분석 데이터 */}
      {report.analysisData && (
        <Card>
          <CardHeader>
            <CardTitle>분석 데이터</CardTitle>
            <CardDescription>상세한 분석 결과와 인사이트입니다</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {report.analysisData.summary && (
                <div>
                  <h4 className="font-medium text-gray-900">요약</h4>
                  <p className="text-gray-600">{report.analysisData.summary}</p>
                </div>
              )}

              {report.analysisData.insights && report.analysisData.insights.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900">주요 인사이트</h4>
                  <ul className="list-inside list-disc space-y-1 text-gray-600">
                    {report.analysisData.insights.map((insight: string, index: number) => (
                      <li key={index}>{insight}</li>
                    ))}
                  </ul>
                </div>
              )}

              {report.analysisData.recommendations &&
                report.analysisData.recommendations.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900">권장사항</h4>
                    <ul className="list-inside list-disc space-y-1 text-gray-600">
                      {report.analysisData.recommendations.map(
                        (recommendation: string, index: number) => (
                          <li key={index}>{recommendation}</li>
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
  );
}
