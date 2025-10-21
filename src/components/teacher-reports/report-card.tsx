'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { TeacherReport } from '@/types/domain/teacher-report';
import {
  Calendar,
  Clock,
  DollarSign,
  Edit,
  FileText,
  MoreHorizontal,
  Play,
  Trash2,
} from 'lucide-react';
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
    <Card className="group relative overflow-hidden border-0 bg-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      {/* 상태별 색상 바 */}
      <div
        className={`h-1 w-full ${
          report.status === 'COMPLETED'
            ? 'bg-gradient-to-r from-green-500 to-green-600'
            : report.status === 'GENERATING'
              ? 'bg-gradient-to-r from-blue-500 to-blue-600'
              : report.status === 'DRAFT'
                ? 'bg-gradient-to-r from-gray-400 to-gray-500'
                : 'bg-gradient-to-r from-red-500 to-red-600'
        }`}
      ></div>

      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-xl font-bold text-gray-900 transition-colors group-hover:text-blue-600">
              {report.title}
            </CardTitle>
            <CardDescription className="mt-2 flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {getReportTypeLabel(report.reportType)}
              </Badge>
              {report.class && <span className="text-sm text-gray-500">• {report.class.name}</span>}
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
            </CardDescription>
            {report.content && (
              <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-gray-600">
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
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 상태 및 메타데이터 */}
        <div className="flex items-center justify-between">
          <Badge
            className={`px-3 py-1 text-xs font-medium ${
              report.status === 'COMPLETED'
                ? 'border-green-200 bg-green-100 text-green-700'
                : report.status === 'GENERATING'
                  ? 'border-blue-200 bg-blue-100 text-blue-700'
                  : report.status === 'DRAFT'
                    ? 'border-gray-200 bg-gray-100 text-gray-700'
                    : 'border-red-200 bg-red-100 text-red-700'
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
          <div className="grid grid-cols-3 gap-4">
            {report.generationTimeMs && (
              <div className="flex items-center gap-2 rounded-lg bg-gray-50 p-3">
                <div className="rounded-full bg-blue-100 p-2">
                  <Clock className="h-3 w-3 text-blue-600" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-900">
                    {Math.round(report.generationTimeMs / 1000)}초
                  </div>
                  <div className="text-xs text-gray-500">생성 시간</div>
                </div>
              </div>
            )}
            {report.tokenUsage && (
              <div className="flex items-center gap-2 rounded-lg bg-gray-50 p-3">
                <div className="rounded-full bg-green-100 p-2">
                  <FileText className="h-3 w-3 text-green-600" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-900">
                    {report.tokenUsage.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500">토큰</div>
                </div>
              </div>
            )}
            {report.costUsd && (
              <div className="flex items-center gap-2 rounded-lg bg-gray-50 p-3">
                <div className="rounded-full bg-purple-100 p-2">
                  <DollarSign className="h-3 w-3 text-purple-600" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-900">
                    ${report.costUsd.toFixed(4)}
                  </div>
                  <div className="text-xs text-gray-500">비용</div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 액션 버튼 */}
        <div className="flex gap-3 pt-2">
          <Link href={`/teacher-reports/${report.id}`} className="flex-1">
            <Button
              variant="default"
              size="sm"
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md hover:from-blue-700 hover:to-purple-700"
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
      </CardContent>
    </Card>
  );
}
