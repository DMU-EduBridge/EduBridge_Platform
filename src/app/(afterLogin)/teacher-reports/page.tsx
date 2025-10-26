'use client';

import { ReportCard } from '@/components/teacher-reports/report-card';
import { ReportForm } from '@/components/teacher-reports/report-form';
import { Button } from '@/components/ui/button';
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
      <div className="min-h-screen bg-gray-50">
        <div className="sticky top-0 z-10 border-b border-gray-200 bg-white shadow-sm">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">새 리포트 생성</h1>
                <p className="mt-1 text-xs text-gray-600">AI 기반 학습 분석 리포트를 생성하세요</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setShowCreateForm(false)}>
                목록으로 돌아가기
              </Button>
            </div>
          </div>
        </div>
        <div className="px-6 py-4">
          <ReportForm
            onSubmit={handleCreateReport}
            onCancel={() => setShowCreateForm(false)}
            isLoading={createReport.isPending}
            availableClasses={availableClasses}
          />
        </div>
      </div>
    );
  }

  if (editingReport) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="sticky top-0 z-10 border-b border-gray-200 bg-white shadow-sm">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">리포트 수정</h1>
                <p className="mt-1 text-xs text-gray-600">리포트 정보를 수정하세요</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setEditingReport(null)}>
                목록으로 돌아가기
              </Button>
            </div>
          </div>
        </div>
        <div className="px-6 py-4">
          <ReportForm
            initialData={editingReport}
            onSubmit={handleUpdateReport}
            onCancel={() => setEditingReport(null)}
            isLoading={updateReport.isPending}
            availableClasses={availableClasses}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 고정 헤더 */}
      <div className="sticky top-0 z-10 border-b border-gray-200 bg-white shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">AI 교사 리포트</h1>
              <p className="mt-1 text-xs text-gray-600">
                AI가 분석한 학생들의 학습 현황과 개선 방안을 확인하세요.
              </p>
            </div>
            <Button onClick={() => setShowCreateForm(true)} size="sm">
              <Plus className="mr-1 h-4 w-4" />새 리포트 생성
            </Button>
          </div>
        </div>
      </div>

      {/* 문서 본문 */}
      <div className="px-6 py-4">
        <div className="space-y-4">
          {/* 통계 정보 */}
          {stats && (
            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                <div className="text-center">
                  <div className="text-xs font-medium text-gray-500">총 리포트</div>
                  <div className="text-lg font-semibold text-gray-900">{stats.totalReports}개</div>
                  <FileText className="mx-auto mt-1 h-4 w-4 text-blue-600" />
                </div>
                <div className="text-center">
                  <div className="text-xs font-medium text-gray-500">완료된 리포트</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {stats.completedReports}개
                  </div>
                  <BarChart3 className="mx-auto mt-1 h-4 w-4 text-green-600" />
                </div>
                <div className="text-center">
                  <div className="text-xs font-medium text-gray-500">평균 생성 시간</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {Math.round(stats.averageGenerationTime / 1000)}초
                  </div>
                  <Clock className="mx-auto mt-1 h-4 w-4 text-orange-600" />
                </div>
                <div className="text-center">
                  <div className="text-xs font-medium text-gray-500">총 비용</div>
                  <div className="text-lg font-semibold text-gray-900">
                    ${stats.totalCost.toFixed(4)}
                  </div>
                  <DollarSign className="mx-auto mt-1 h-4 w-4 text-purple-600" />
                </div>
              </div>
            </div>
          )}

          {/* 리포트 목록 */}
          {isLoading ? (
            <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
              <div className="p-8 text-center">
                <div className="mx-auto mb-3 h-6 w-6 animate-spin rounded-full border-b-2 border-blue-600"></div>
                <p className="text-sm text-gray-600">리포트 목록을 불러오는 중...</p>
              </div>
            </div>
          ) : error ? (
            <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
              <div className="p-8 text-center">
                <p className="mb-3 text-sm text-red-600">리포트 목록을 불러오는데 실패했습니다.</p>
                <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
                  다시 시도
                </Button>
              </div>
            </div>
          ) : reports.length === 0 ? (
            <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
              <div className="p-8 text-center">
                <FileText className="mx-auto mb-3 h-8 w-8 text-gray-400" />
                <h3 className="mb-2 text-base font-semibold text-gray-900">
                  아직 리포트가 없습니다
                </h3>
                <p className="mb-3 text-sm text-gray-600">첫 번째 AI 리포트를 생성해보세요.</p>
                <Button onClick={() => setShowCreateForm(true)} size="sm">
                  <Plus className="mr-1 h-4 w-4" />
                  리포트 생성하기
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
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
      </div>
    </div>
  );
}
