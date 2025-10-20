'use client';

import { Button } from '@/components/ui/button';
import { useStudentReports } from '@/hooks/teacher-reports/use-student-reports';
import { TeacherReport } from '@/types/domain/teacher-report';
import { Download, FileText } from 'lucide-react';
import { Session } from 'next-auth';
import Link from 'next/link';
import { useState } from 'react';

const typeLabels = {
  PROGRESS_REPORT: '진도 리포트',
  PERFORMANCE_ANALYSIS: '성과 분석',
  CLASS_SUMMARY: '클래스 요약',
  STUDENT_INSIGHTS: '학생 인사이트',
};

interface MyReportsClientProps {
  session: Session;
}

export function MyReportsClient({ session }: MyReportsClientProps) {
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // 학생의 경우 자신의 리포트만 필터링
  const {
    data: reportsResponse,
    isLoading,
    error,
  } = useStudentReports({
    reportType: selectedType !== 'all' ? selectedType : undefined,
    status: selectedStatus !== 'all' ? selectedStatus : undefined,
  });

  const reports = reportsResponse?.data || [];

  const handleDownload = (reportId: string) => {
    // TODO: 다운로드 기능 구현
    console.log('Download report:', reportId);
  };

  return (
    <div className="space-y-6 p-6">
      {/* 헤더 */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">마이 리포트</h1>
        <p className="mt-2 text-gray-600">
          나의 학습을 AI가 분석해 더 나은 학습 방식을 추천 할 수 있습니다.
        </p>
      </div>

      {/* 리포트 필터 */}
      <div className="rounded-lg border bg-white p-4">
        <h3 className="mb-4 font-semibold text-gray-900">리포트 필터</h3>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">모든 유형</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="rounded-md border border-gray-300 px-3 py-1 text-sm"
            >
              <option value="all">모든 유형</option>
              <option value="PROGRESS_REPORT">진도 리포트</option>
              <option value="PERFORMANCE_ANALYSIS">성과 분석</option>
              <option value="CLASS_SUMMARY">클래스 요약</option>
              <option value="STUDENT_INSIGHTS">학생 인사이트</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">모든 상태</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="rounded-md border border-gray-300 px-3 py-1 text-sm"
            >
              <option value="all">모든 상태</option>
              <option value="DRAFT">초안</option>
              <option value="GENERATING">생성 중</option>
              <option value="COMPLETED">완료</option>
              <option value="FAILED">실패</option>
            </select>
          </div>
          <div className="flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                <svg
                  className="h-4 w-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <input
                type="text"
                placeholder="리포트 검색..."
                className="w-full rounded-md border border-gray-300 py-1 pl-10 pr-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 리포트 목록 */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="rounded-lg border bg-white p-8 text-center">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
            <p className="text-gray-600">리포트 목록을 불러오는 중...</p>
          </div>
        ) : error ? (
          <div className="rounded-lg border bg-white p-8 text-center">
            <p className="text-red-600">리포트 목록을 불러오는데 실패했습니다.</p>
          </div>
        ) : reports.length === 0 ? (
          <div className="rounded-lg border bg-white p-8 text-center">
            <FileText className="mx-auto mb-4 h-12 w-12 text-gray-400" />
            <h3 className="mb-2 text-lg font-semibold text-gray-900">아직 리포트가 없습니다</h3>
            <p className="mb-4 text-gray-600">첫 번째 학습 리포트를 생성해보세요.</p>
          </div>
        ) : (
          reports.map((report: TeacherReport) => {
            const reportDate = new Date(report.createdAt);
            const year = reportDate.getFullYear();
            const month = reportDate.getMonth() + 1;

            return (
              <div
                key={report.id}
                className="flex items-center justify-between rounded-lg border bg-white p-4 hover:bg-gray-50"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                    <FileText className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {year}년 {month}월 리포트
                    </h3>
                    <p className="text-sm text-gray-500">
                      {typeLabels[report.reportType as keyof typeof typeLabels]} •{' '}
                      {report.class?.name || '전체'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Link href={`/my/reports/${report.id}`}>
                    <Button variant="default" size="sm" className="bg-blue-600 hover:bg-blue-700">
                      미리보기
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload(report.id)}
                    className="flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    리포트 다운로드
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
