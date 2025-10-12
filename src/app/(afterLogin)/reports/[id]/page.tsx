'use client';

import { ReportDetail } from '@/components/reports/report-detail';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useReports } from '@/hooks/reports';
import { ArrowLeft, Download } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function ReportDetailPage() {
  const params = useParams();
  const router = useRouter();
  const reportId = params.id as string;

  const { useReport, download: downloadMutation } = useReports();
  const { data: reportResponse, isLoading, error } = useReport(reportId);
  const reportData = reportResponse?.data;

  const handleDownload = async () => {
    try {
      await downloadMutation.mutateAsync(reportId);
      toast.success('리포트 다운로드가 시작되었습니다.');
    } catch (err: any) {
      toast.error('리포트 다운로드 실패', {
        description: err.message || '리포트 다운로드 중 오류가 발생했습니다.',
      });
    }
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
            <p className="text-gray-600">리포트 상세 정보를 불러오는 중...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !reportData) {
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
            <p className="text-red-600">리포트 상세 정보를 불러오는데 실패했습니다.</p>
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
            <h1 className="text-3xl font-bold text-gray-900">{reportData.title}</h1>
            <p className="mt-2 text-gray-600">
              {reportData.type} • {reportData.period}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleDownload} disabled={downloadMutation.isPending}>
            <Download className="mr-2 h-4 w-4" />
            {downloadMutation.isPending ? '다운로드 중...' : 'PDF 다운로드'}
          </Button>
        </div>
      </div>

      {/* 리포트 상세 내용 */}
      <ReportDetail report={reportData} />
    </div>
  );
}
