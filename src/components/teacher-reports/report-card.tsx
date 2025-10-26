'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { TeacherReport } from '@/types/domain/teacher-report';
import { Calendar, Edit, MoreHorizontal, Play, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

interface ReportCardProps {
  report: TeacherReport;
  onEdit?: (report: TeacherReport) => void;
  onDelete?: (reportId: string) => void;
  onGenerate?: (reportId: string) => void;
}

export function ReportCard({ report, onEdit, onDelete, onGenerate }: ReportCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return '완료';
      case 'GENERATING':
        return '생성 중';
      case 'DRAFT':
        return '초안';
      case 'FAILED':
        return '실패';
      default:
        return status;
    }
  };

  const getReportTypeLabel = (type: string) => {
    switch (type) {
      case 'PROGRESS_REPORT':
        return '진도 리포트';
      case 'PERFORMANCE_ANALYSIS':
        return '성과 분석';
      case 'CLASS_SUMMARY':
        return '클래스 요약';
      case 'STUDENT_INSIGHTS':
        return '학생 인사이트';
      default:
        return type;
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;

    if (confirm('정말로 이 리포트를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      setIsDeleting(true);
      try {
        await onDelete(report.id);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleGenerate = async () => {
    if (!onGenerate) return;
    await onGenerate(report.id);
  };

  return (
    <div className="group rounded-lg border border-gray-200 bg-white shadow-sm transition-all duration-200 hover:shadow-md">
      {/* 상태별 색상 바 */}
      <div
        className={`h-1 w-full rounded-t-lg ${
          report.status === 'COMPLETED'
            ? 'bg-green-500'
            : report.status === 'GENERATING'
              ? 'bg-blue-500'
              : report.status === 'DRAFT'
                ? 'bg-gray-400'
                : 'bg-red-500'
        }`}
      ></div>

      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">{report.title}</h3>
            <div className="mt-1 flex items-center gap-2 text-xs text-gray-600">
              <Badge variant="secondary" className="text-xs">
                {getReportTypeLabel(report.reportType)}
              </Badge>
              {report.class && <span>• {report.class.name}</span>}
              {report.user && (
                <span
                  className={`rounded-full px-2 py-1 text-xs ${
                    report.user.role === 'TEACHER'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-green-100 text-green-700'
                  }`}
                >
                  {report.user.role === 'TEACHER' ? '교사' : '학생'}: {report.user.name}
                </span>
              )}
            </div>
            {report.content && (
              <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-gray-600">
                {report.content.substring(0, 120)}...
              </p>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 opacity-0 transition-opacity group-hover:opacity-100"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => onEdit?.(report)}>
                <Edit className="mr-2 h-4 w-4" />
                수정
              </DropdownMenuItem>
              {report.status === 'DRAFT' && (
                <DropdownMenuItem onClick={handleGenerate}>
                  <Play className="mr-2 h-4 w-4" />
                  생성
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={handleDelete}
                disabled={isDeleting}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                삭제
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="mt-4 space-y-3">
          {/* 상태 및 메타데이터 */}
          <div className="flex items-center justify-between">
            <Badge
              className={`px-2 py-1 text-xs font-medium ${
                report.status === 'COMPLETED'
                  ? 'bg-green-100 text-green-800'
                  : report.status === 'GENERATING'
                    ? 'bg-blue-100 text-blue-800'
                    : report.status === 'DRAFT'
                      ? 'bg-gray-100 text-gray-800'
                      : 'bg-red-100 text-red-800'
              }`}
            >
              {getStatusLabel(report.status)}
            </Badge>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Calendar className="h-3 w-3" />
              {new Date(report.createdAt).toLocaleDateString()}
            </div>
          </div>

          {/* 통계 정보 */}
          {report.status === 'COMPLETED' && (
            <div className="grid grid-cols-3 gap-2">
              {report.generationTimeMs && (
                <div className="rounded-lg bg-gray-50 p-2 text-center">
                  <div className="text-xs font-medium text-gray-500">생성 시간</div>
                  <div className="text-sm font-semibold text-gray-900">
                    {Math.round(report.generationTimeMs / 1000)}초
                  </div>
                </div>
              )}
              {report.tokenUsage && (
                <div className="rounded-lg bg-gray-50 p-2 text-center">
                  <div className="text-xs font-medium text-gray-500">토큰</div>
                  <div className="text-sm font-semibold text-gray-900">
                    {report.tokenUsage.toLocaleString()}
                  </div>
                </div>
              )}
              {report.costUsd && (
                <div className="rounded-lg bg-gray-50 p-2 text-center">
                  <div className="text-xs font-medium text-gray-500">비용</div>
                  <div className="text-sm font-semibold text-gray-900">
                    ${report.costUsd.toFixed(4)}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 액션 버튼 */}
          <div className="flex gap-2">
            <Link href={`/teacher-reports/${report.id}`} className="flex-1">
              <Button
                variant="default"
                size="sm"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700"
              >
                리포트 보기
              </Button>
            </Link>
            {report.status === 'DRAFT' && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleGenerate}
                className="border-blue-200 text-blue-600 hover:bg-blue-50"
              >
                <Play className="mr-1 h-3 w-3" />
                생성
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
