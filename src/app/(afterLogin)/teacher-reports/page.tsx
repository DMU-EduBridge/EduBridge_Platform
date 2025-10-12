'use client';

import { ReportCard } from '@/components/teacher-reports/report-card';
import { ReportForm } from '@/components/teacher-reports/report-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useClasses } from '@/hooks/classes/use-classes';
import { useTeacherReportMutations } from '@/hooks/teacher-reports/use-teacher-report-mutations';
import { useTeacherReportStats } from '@/hooks/teacher-reports/use-teacher-report-stats';
import { useTeacherReports } from '@/hooks/teacher-reports/use-teacher-reports';
import { CreateTeacherReportRequest, TeacherReport } from '@/types/domain/teacher-report';
import { BarChart3, Clock, DollarSign, FileText, Plus } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export default function TeacherReportsPage() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingReport, setEditingReport] = useState<TeacherReport | null>(null);

  const { data: reportsResponse, isLoading, error } = useTeacherReports();
  const { data: statsResponse } = useTeacherReportStats();
  const { data: classesResponse } = useClasses();
  const { createReport, updateReport, deleteReport, generateReport } = useTeacherReportMutations();

  const reports = reportsResponse?.data || [];
  const stats = statsResponse?.data;
  const availableClasses = classesResponse?.data || [];

  const handleCreateReport = async (data: CreateTeacherReportRequest) => {
    try {
      await createReport.mutateAsync(data);
      setShowCreateForm(false);
      toast.success('리포트가 생성되었습니다');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '리포트 생성에 실패했습니다');
    }
  };

  const handleUpdateReport = async (data: CreateTeacherReportRequest) => {
    if (!editingReport) return;

    try {
      await updateReport.mutateAsync({
        reportId: editingReport.id,
        data: { title: data.title },
      });
      setEditingReport(null);
      toast.success('리포트가 수정되었습니다');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '리포트 수정에 실패했습니다');
    }
  };

  const handleDeleteReport = async (reportId: string) => {
    try {
      await deleteReport.mutateAsync(reportId);
      toast.success('리포트가 삭제되었습니다');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '리포트 삭제에 실패했습니다');
    }
  };

  const handleGenerateReport = async (reportId: string) => {
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

  if (showCreateForm) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">새 리포트 생성</h1>
            <p className="mt-2 text-gray-600">AI 기반 학습 분석 리포트를 생성하세요</p>
          </div>
          <Button variant="outline" onClick={() => setShowCreateForm(false)}>
            목록으로 돌아가기
          </Button>
        </div>
        <ReportForm
          onSubmit={handleCreateReport}
          onCancel={() => setShowCreateForm(false)}
          isLoading={createReport.isPending}
          availableClasses={availableClasses}
        />
      </div>
    );
  }

  if (editingReport) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">리포트 수정</h1>
            <p className="mt-2 text-gray-600">리포트 정보를 수정하세요</p>
          </div>
          <Button variant="outline" onClick={() => setEditingReport(null)}>
            목록으로 돌아가기
          </Button>
        </div>
        <ReportForm
          initialData={editingReport}
          onSubmit={handleUpdateReport}
          onCancel={() => setEditingReport(null)}
          isLoading={updateReport.isPending}
          availableClasses={availableClasses}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">AI 교사 리포트</h1>
          <p className="mt-2 text-gray-600">
            AI가 분석한 학생들의 학습 현황과 개선 방안을 확인하세요.
          </p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="mr-2 h-4 w-4" />새 리포트 생성
        </Button>
      </div>

      {/* 통계 카드 */}
      {stats && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">총 리포트</p>
                  <p className="text-2xl font-bold">{stats.totalReports}개</p>
                </div>
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">완료된 리포트</p>
                  <p className="text-2xl font-bold">{stats.completedReports}개</p>
                </div>
                <BarChart3 className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">평균 생성 시간</p>
                  <p className="text-2xl font-bold">
                    {Math.round(stats.averageGenerationTime / 1000)}초
                  </p>
                </div>
                <Clock className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">총 비용</p>
                  <p className="text-2xl font-bold">${stats.totalCost.toFixed(4)}</p>
                </div>
                <DollarSign className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 리포트 목록 */}
      {isLoading ? (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
            <p className="text-gray-600">리포트 목록을 불러오는 중...</p>
          </CardContent>
        </Card>
      ) : error ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-red-600">리포트 목록을 불러오는데 실패했습니다.</p>
            <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
              다시 시도
            </Button>
          </CardContent>
        </Card>
      ) : reports.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="mx-auto mb-4 h-12 w-12 text-gray-400" />
            <h3 className="mb-2 text-lg font-semibold text-gray-900">아직 리포트가 없습니다</h3>
            <p className="mb-4 text-gray-600">첫 번째 AI 리포트를 생성해보세요.</p>
            <Button onClick={() => setShowCreateForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              리포트 생성하기
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {reports.map((report) => (
            <ReportCard
              key={report.id}
              report={report}
              onEdit={setEditingReport}
              onDelete={handleDeleteReport}
              onGenerate={handleGenerateReport}
            />
          ))}
        </div>
      )}
    </div>
  );
}
